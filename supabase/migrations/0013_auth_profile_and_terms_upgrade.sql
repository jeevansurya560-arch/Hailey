-- ============================================================
-- 0013_auth_profile_and_terms_upgrade.sql
-- Auth Upgrade: Terms Acceptance, Handle Disambiguation & Age Eligibility Initialization
-- ============================================================

-- ── 1. Terms Acceptance columns on profiles ───────────────────
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

-- ── 2. Upgraded handle_new_user() Profile & Age Trigger ────────
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_handle text;
  v_display_name text;
  v_avatar_url text;
  v_terms_accepted_at timestamptz;
  v_terms_version text;
  v_is_minor boolean;
  v_initial_eligibility text;
begin
  -- 1. Extract and sanitize handle
  v_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    split_part(new.email, '@', 1)
  );

  v_handle := lower(regexp_replace(v_handle, '[^a-zA-Z0-9_]', '', 'g'));
  if length(v_handle) < 3 then
    v_handle := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  elsif length(v_handle) > 20 then
    v_handle := substr(v_handle, 1, 20);
  end if;

  -- Disambiguate if handle collision occurs with another user (e.g. Google OAuth)
  if exists (select 1 from public.profiles where handle = v_handle and id <> new.id) then
    v_handle := substr(v_handle, 1, 14) || '_' || substr(replace(new.id::text, '-', ''), 1, 5);
  end if;

  -- 2. Extract Display Name / Full Name
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    v_handle
  );

  -- 3. Extract Avatar URL
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';

  -- 4. Extract Terms Acceptance Metadata
  if (new.raw_user_meta_data->>'terms_accepted_at') is not null then
    begin
      v_terms_accepted_at := (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz;
    exception when others then
      v_terms_accepted_at := null;
    end;
  else
    v_terms_accepted_at := null;
  end if;

  v_terms_version := new.raw_user_meta_data->>'terms_version';

  -- 5. Insert or Preserve Profile (Never overwrite user-edited data)
  insert into public.profiles (
    id,
    handle,
    display_name,
    avatar_url,
    terms_accepted_at,
    terms_version
  )
  values (
    new.id,
    v_handle,
    v_display_name,
    v_avatar_url,
    v_terms_accepted_at,
    v_terms_version
  )
  on conflict (id) do update set
    terms_accepted_at = coalesce(public.profiles.terms_accepted_at, excluded.terms_accepted_at),
    terms_version = coalesce(public.profiles.terms_version, excluded.terms_version);

  -- 6. Evaluate initial age eligibility:
  -- Self-declared minor -> 'MINOR'
  -- Self-declared 18+ or Google OAuth -> 'UNVERIFIED' (Never automatically granted 'ADULT')
  v_is_minor := coalesce((new.raw_user_meta_data->>'is_minor')::boolean, false);
  if v_is_minor then
    v_initial_eligibility := 'MINOR';
  else
    v_initial_eligibility := 'UNVERIFIED';
  end if;

  insert into public.user_age_eligibility (user_id, eligibility, verification_method)
  values (new.id, v_initial_eligibility, 'unverified')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
