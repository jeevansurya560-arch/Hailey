-- ============================================================
-- 0010_blockchain_provenance_and_attestation.sql
-- Provenance metadata and versioning extension for contributions.
-- ============================================================

-- 1. Add content_hash_version to track legacy v1 vs canonical v2 hashes
alter table public.contributions
  add column if not exists content_hash_version text not null default 'v1'
  check (content_hash_version in ('v1', 'v2'));

-- 2. Add media_asset_id linking to media_assets (nullable, for items with attached media)
alter table public.contributions
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;

-- 3. Indexes for efficient provenance and version queries
create index if not exists idx_contributions_media_asset
  on public.contributions (media_asset_id)
  where media_asset_id is not null;

create index if not exists idx_contributions_hash_version
  on public.contributions (content_hash_version);
