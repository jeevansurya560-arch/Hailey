-- ============================================================
-- 0009_perceptual_hash_and_near_duplicate_foundation.sql
-- Content Integrity & Safety — Phase 3: Perceptual Hashing & Near-Duplicate Foundation
-- ============================================================

-- ── 1. Add perceptual hash columns to media_assets ──────────
-- Note: perceptual_hash is intentionally NOT unique.
-- Multiple distinct media files can legitimately have similar or identical visual fingerprints.
-- Exact identity remains strictly governed by sha256_hash.
alter table public.media_assets
  add column if not exists perceptual_hash text
    check (perceptual_hash is null or perceptual_hash ~ '^0x[0-9a-f]{16,64}$'),
  add column if not exists perceptual_hash_algo text
    check (perceptual_hash_algo is null or perceptual_hash_algo in ('dhash_64', 'phash_64', 'video_sequence_v1'));

-- Index on perceptual_hash for candidate retrieval
create index if not exists idx_media_assets_perceptual_hash
  on public.media_assets (perceptual_hash)
  where perceptual_hash is not null;
