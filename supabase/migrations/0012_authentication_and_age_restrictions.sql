-- ============================================================
-- 0012_authentication_and_age_restrictions.sql
-- Content Integrity & Safety — Phase 6: Authentication & 18+ Minor Restrictions
-- ============================================================

-- ── 1. user_age_eligibility table ─────────────────────────────
-- Authoritative server-managed age eligibility state for accounts.
-- Stores minimal necessary metadata without exposing raw DOB or identity docs.
create table if not exists public.user_age_eligibility (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  eligibility         text not null default 'UNVERIFIED' check (
    eligibility in ('UNVERIFIED', 'MINOR', 'ADULT', 'REQUIRES_REVIEW')
  ),
  verified_at         timestamptz,
  verification_method text not null default 'unverified' check (
    verification_method in ('unverified', 'id_document', 'third_party_provider', 'editorial_override', 'mock_test')
  ),
  provider            text,
  reference_id        text, -- Opaque provider reference token; never raw PII/DOB
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_user_age_eligibility on public.user_age_eligibility (eligibility);

-- ── 2. Content Age Classification on posts and media_assets ───
alter table public.posts
  add column if not exists age_classification text not null default 'GENERAL' check (
    age_classification in ('GENERAL', 'ADULT_18_PLUS', 'AGE_RESTRICTED_REVIEW', 'UNCLASSIFIED')
  );

alter table public.media_assets
  add column if not exists age_classification text not null default 'GENERAL' check (
    age_classification in ('GENERAL', 'ADULT_18_PLUS', 'AGE_RESTRICTED_REVIEW', 'UNCLASSIFIED')
  );

create index if not exists idx_posts_age_classification on public.posts (age_classification);
create index if not exists idx_media_assets_age_classification on public.media_assets (age_classification);

-- ── 3. Row Level Security on user_age_eligibility ─────────────
alter table public.user_age_eligibility enable row level security;

-- SELECT: Users can inspect their own eligibility status
drop policy if exists "user_age_eligibility_select_own" on public.user_age_eligibility;
create policy "user_age_eligibility_select_own"
  on public.user_age_eligibility for select
  using (auth.uid() = user_id);

-- INSERT / UPDATE / DELETE: Blocked for direct client execution.
-- Eligibility status transitions are strictly server-authoritative (service role).

-- ── 4. RLS on posts for Adult Content Viewing ─────────────────
drop policy if exists "posts_select_all" on public.posts;
drop policy if exists "posts_select_age_authorized" on public.posts;

create policy "posts_select_age_authorized"
  on public.posts for select
  using (
    -- 1. General audience content is readable
    age_classification = 'GENERAL'
    -- 2. 18+ Adult content requires viewer to have authoritative ADULT eligibility.
    -- NO author bypass: minors, unverified users, and review accounts cannot view any 18+ content, including their own.
    or (
      age_classification = 'ADULT_18_PLUS'
      and exists (
        select 1 from public.user_age_eligibility uae
        where uae.user_id = auth.uid()
        and uae.eligibility = 'ADULT'
      )
    )
  );

-- ── 5. Database-level Enforcement Trigger on posts ────────────
-- Enforces:
-- 1. author_id authenticity (prevents forging author_id or changing existing post author).
-- 2. Phase 5 graphic content clearance (policy_status = 'ALLOWED').
-- 3. Phase 6 attached media age alignment.
-- 4. Phase 6 adult publishing clearance (author must be verified ADULT).
create or replace function public.check_post_safety_and_age_policy()
returns trigger as $$
declare
  v_media_age_class text;
  v_author_eligibility text;
  v_acting_user uuid;
begin
  -- 0. Authentication & Author Identity Integrity Check
  v_acting_user := auth.uid();

  -- If called in client session context (auth.uid() is not null):
  if v_acting_user is not null then
    if tg_op = 'INSERT' then
      if new.author_id is null then
        new.author_id := v_acting_user;
      elsif new.author_id <> v_acting_user then
        raise exception 'Cannot forge author_id: author_id (%) does not match authenticated user (%)', new.author_id, v_acting_user;
      end if;
    elsif tg_op = 'UPDATE' then
      if old.author_id <> v_acting_user then
        raise exception 'Unauthorized post update: cannot update another author post';
      end if;
      if new.author_id <> old.author_id then
        raise exception 'Cannot change author_id of an existing post';
      end if;
    end if;
  end if;

  -- 1. Phase 5 Check: Media Asset Graphic Safety Clearance
  if new.media_asset_id is not null then
    if not exists (
      select 1 from public.media_safety_analyses msa
      where msa.media_asset_id = new.media_asset_id
      and msa.policy_status = 'ALLOWED'
    ) then
      raise exception 'Media asset % is not cleared for publishing (safety policy status is not ALLOWED)', new.media_asset_id;
    end if;

    -- 2. Phase 6 Check: Attached Media Age Classification Alignment
    select age_classification into v_media_age_class
    from public.media_assets
    where id = new.media_asset_id;

    if v_media_age_class = 'ADULT_18_PLUS' and new.age_classification <> 'ADULT_18_PLUS' then
      raise exception 'Cannot attach ADULT_18_PLUS media to a non-adult post';
    end if;
  end if;

  -- 3. Phase 6 Check: Adult Content Publishing Eligibility
  if new.age_classification = 'ADULT_18_PLUS' then
    select eligibility into v_author_eligibility
    from public.user_age_eligibility
    where user_id = new.author_id;

    if v_author_eligibility is null or v_author_eligibility <> 'ADULT' then
      raise exception 'Author % is not a verified adult and cannot publish ADULT_18_PLUS content', new.author_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_check_post_media_safety on public.posts;
drop trigger if exists trg_check_post_safety_and_age on public.posts;

create trigger trg_check_post_safety_and_age
  before insert or update on public.posts
  for each row execute function public.check_post_safety_and_age_policy();

-- ── 6. Profile & Default Eligibility Initialization Trigger ───
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_handle text;
  v_display_name text;
  v_avatar_url text;
begin
  v_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    split_part(new.email, '@', 1)
  );

  v_handle := lower(regexp_replace(v_handle, '[^a-zA-Z0-9_]', '', 'g'));
  if length(v_handle) < 3 then
    v_handle := 'user_' || substr(new.id::text, 1, 8);
  elsif length(v_handle) > 20 then
    v_handle := substr(v_handle, 1, 20);
  end if;

  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    v_handle
  );

  v_avatar_url := new.raw_user_meta_data->>'avatar_url';

  insert into public.profiles (id, handle, display_name, avatar_url)
  values (new.id, v_handle, v_display_name, v_avatar_url)
  on conflict (id) do nothing;

  insert into public.user_age_eligibility (user_id, eligibility, verification_method)
  values (new.id, 'UNVERIFIED', 'unverified')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
