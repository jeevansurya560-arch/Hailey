-- ============================================================
-- 0008_media_identity_and_duplicate_prevention.sql
-- Content Integrity & Safety — Phase 2: Media Identity & Exact Duplicate Prevention
-- ============================================================

-- ── 1. media_assets table ──────────────────────────────────
-- Represents the canonical cryptographic identity of media files (photos and videos)
-- based purely on the SHA-256 digest of the actual file bytes.
create table if not exists public.media_assets (
  id                uuid primary key default gen_random_uuid(),
  sha256_hash       text unique not null
                      check (sha256_hash ~ '^0x[0-9a-f]{64}$'),
  media_type        text not null check (media_type in ('image', 'video')),
  mime_type         text not null,
  file_size         bigint not null check (file_size > 0),
  storage_reference text, -- Nullable in Phase 2; populated in future upload/storage pipeline
  original_filename text, -- Informational only; does not affect content identity
  uploaded_by       uuid not null references public.profiles(id) on delete restrict,
  created_at        timestamptz not null default now()
);

-- Indices for high-speed duplicate lookup and contributor queries
create index if not exists idx_media_assets_sha256 on public.media_assets (sha256_hash);
create index if not exists idx_media_assets_uploader on public.media_assets (uploaded_by);

-- ── 2. Link posts to canonical media_assets ─────────────────
alter table public.posts
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;

create index if not exists idx_posts_media_asset on public.posts (media_asset_id);

-- ── 3. Row Level Security (RLS) ─────────────────────────────
alter table public.media_assets enable row level security;

-- SELECT: Users can read media assets that they uploaded or that are attached to posts
drop policy if exists "media_assets_select_authorized" on public.media_assets;
create policy "media_assets_select_authorized"
  on public.media_assets for select
  using (
    auth.uid() = uploaded_by
    or exists (
      select 1 from public.posts p
      where p.media_asset_id = media_assets.id
    )
  );

-- INSERT / UPDATE / DELETE: Blocked for direct client execution.
-- Media registration and duplicate verification are strictly server-authoritative (service role).
-- (Leaving with no user insert/update/delete policy enforces service-role-only access).
