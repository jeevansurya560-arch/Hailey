-- ============================================================
-- 0011_media_safety_and_graphic_content_moderation.sql
-- Content Integrity & Safety — Phase 5: Blood / Violence / Graphic Content Safety
-- ============================================================

-- ── 1. media_safety_analyses table ────────────────────────────
-- Stores server-authoritative automated safety analysis results
-- and explicit policy decisions for media assets.
create table if not exists public.media_safety_analyses (
  id              uuid primary key default gen_random_uuid(),
  media_asset_id  uuid not null unique references public.media_assets(id) on delete cascade,
  analysis_status text not null check (
    analysis_status in ('NOT_ANALYZED', 'ANALYZING', 'ANALYZED', 'ANALYSIS_FAILED', 'UNSUPPORTED')
  ),
  policy_status   text not null check (
    policy_status in ('PENDING', 'ALLOWED', 'REVIEW_REQUIRED', 'RESTRICTED', 'BLOCKED', 'FAILED')
  ),
  overall_score   real not null default 0.0 check (overall_score between 0.0 and 1.0),
  category_scores jsonb not null default '{}'::jsonb,
  provider        text not null,
  model           text not null,
  model_version   text not null,
  policy_version  text not null,
  failure_reason  text,
  analyzed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indices for performance on media asset checks and moderation review queues
create index if not exists idx_media_safety_asset on public.media_safety_analyses(media_asset_id);
create index if not exists idx_media_safety_policy on public.media_safety_analyses(policy_status);
create index if not exists idx_media_safety_status on public.media_safety_analyses(analysis_status);

-- ── 2. Row Level Security (RLS) on media_safety_analyses ─────
alter table public.media_safety_analyses enable row level security;

-- SELECT: Users can view safety status for their own media assets or assets on published posts
drop policy if exists "media_safety_select_authorized" on public.media_safety_analyses;
create policy "media_safety_select_authorized"
  on public.media_safety_analyses for select
  using (
    exists (
      select 1 from public.media_assets ma
      where ma.id = media_safety_analyses.media_asset_id
      and (
        ma.uploaded_by = auth.uid()
        or exists (
          select 1 from public.posts p
          where p.media_asset_id = ma.id
        )
      )
    )
  );

-- INSERT / UPDATE / DELETE: Blocked for direct client execution.
-- Safety classification and policy decisions are strictly server-authoritative (service role).
-- (Leaving with no user insert/update/delete policy enforces service-role-only access).

-- ── 3. Database-level Post Publishing Safety Enforcement ──────
-- Ensures that no post referencing a media_asset_id can be created or updated
-- unless that media asset has a verified, server-authorized policy_status of 'ALLOWED'.
create or replace function public.check_post_media_safety()
returns trigger as $$
begin
  -- Text-only posts (media_asset_id is null) bypass media graphic checks
  if new.media_asset_id is not null then
    if not exists (
      select 1 from public.media_safety_analyses msa
      where msa.media_asset_id = new.media_asset_id
      and msa.policy_status = 'ALLOWED'
    ) then
      raise exception 'Media asset % is not cleared for publishing (safety policy status is not ALLOWED)', new.media_asset_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_post_media_safety on public.posts;
create trigger trg_check_post_media_safety
  before insert or update of media_asset_id on public.posts
  for each row execute function public.check_post_media_safety();
