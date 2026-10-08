# HAILEY — CANONICAL DATA MODEL SPECIFICATION

**Database Engine:** PostgreSQL 15+ (Supabase)  
**Security Model:** 100% Row Level Security (RLS) Enabled  
**Date:** October 8, 2026  

---

## 1. Entity-Relationship Overview

The Hailey relational schema is partitioned into five distinct domain clusters:
1. **User & Identity**: `profiles`, `wallet_nonces`, `user_interests`
2. **Social & Collectives**: `communities`, `community_tags`, `memberships`, `posts`, `post_tags`, `post_reactions`, `impressions`, `feedback`
3. **Curatorial & Web3 Products**: `collections`, `collection_items`, `contributions`, `curation_payments`, `tickets`, `markets`, `market_options`, `positions`, `market_resolutions`, `attestation_jobs`
4. **Cultural Knowledge Layer**: `religions`, `traditions`, `cultural_entities`, `festivals`, `festival_occurrences`, `cultural_media`, `sources`, `citations`, `content_versions`
5. **Governance & Auditability**: `moderation_reports`, `audit_logs`

---

## 2. Table Schemas & Constraints

### Cluster 1: User & Identity
- **`profiles`**: Primary user profile mapped 1:1 to `auth.users(id)`.
  - Columns: `id (uuid pk)`, `handle (text unique, check /^[a-z0-9_]{3,20}$/)`, `display_name (text)`, `avatar_url (text)`, `wallet_address (text unique, check /^0x[0-9a-f]{40}$/)`, `is_editorial (bool)`, `created_at (timestamptz)`.
- **`wallet_nonces`**: Single-use cryptographic challenge nonces for EIP-191 personal_sign authentication.
  - Columns: `user_id (uuid pk)`, `nonce (text unique)`, `expires_at (timestamptz)`.
- **`user_interests`**: Explicit cultural taxonomy affinities chosen during onboarding.
  - Columns: `user_id (uuid)`, `tag_id (int)`, `weight (real)`, `source (text)`, `updated_at (timestamptz)`. PK: `(user_id, tag_id)`.

### Cluster 2: Curatorial & Web3 Products
- **`curation_payments`**: Direct monetary support and curation bounties.
  - Columns: `id (uuid pk)`, `payer_user_id (uuid)`, `curator_user_id (uuid)`, `collection_id (uuid)`, `amount (numeric(18,4))`, `currency (text)`, `payment_method (text)`, `status (text check in ('pending', 'confirmed', 'failed', 'refunded'))`, `tx_hash (text unique)`, `platform_fee (numeric)`, `curator_amount (numeric)`.
  - Constraint: `valid_payment_split` (`curator_amount + platform_fee = amount`).
- **`tickets`**: Wallet-native and database event entitlements.
  - Columns: `id (uuid pk)`, `event_id (text)`, `event_title (text)`, `owner_user_id (uuid)`, `owner_wallet_address (text check /^0x[0-9a-f]{40}$/)`, `ticket_type (text)`, `status (text check in ('issued', 'claimed', 'used', 'revoked', 'expired'))`, `metadata (jsonb)`.
- **`markets` & `market_options`**: Cultural trend outcome forecasting markets.
  - Columns (`markets`): `id (uuid pk)`, `creator_id (uuid)`, `title (text)`, `description (text)`, `category (text)`, `resolution_source (text)`, `resolution_deadline (timestamptz)`, `status (text)`, `winning_option_id (uuid)`.
  - Columns (`market_options`): `id (uuid pk)`, `market_id (uuid references markets)`, `label (text)`, `total_stake (numeric(18,4))`. Unique: `(market_id, label)`.
- **`positions`**: User stakes placed in market options.
  - Columns: `id (uuid pk)`, `market_id (uuid)`, `option_id (uuid)`, `user_id (uuid)`, `amount (numeric(18,4) > 0)`, `status (text)`, `payout_amount (numeric)`.
- **`attestation_jobs`**: Durable queue for relaying Monad L1 attestations.
  - Columns: `id (uuid pk)`, `contribution_id (uuid unique)`, `status (text check in ('queued', 'processing', 'submitted', 'confirmed', 'failed', 'dead_letter'))`, `attempts (int)`, `max_attempts (int)`, `next_attempt_at (timestamptz)`.

### Cluster 3: Cultural Knowledge Architecture
- **`religions`**: Global theological and philosophical root frameworks.
  - Columns: `id (uuid pk)`, `name (text)`, `slug (text unique)`, `description (text)`, `origin_region (text)`, `primary_texts (text[])`, `historical_period (text)`.
- **`traditions`**: Denominations, folk, and monastic traditions within or across religions.
  - Columns: `id (uuid pk)`, `religion_id (uuid references religions)`, `name (text)`, `slug (text unique)`, `tradition_type (text)`, `description (text)`, `geographic_spread (text[])`.
- **`cultural_entities`**: Encyclopedic cultural records (Wikipedia-style presentation).
  - Columns: `id (uuid pk)`, `name (text)`, `slug (text unique)`, `region (text)`, `country (text)`, `language (text)`, `summary (text)`, `history (text)`, `origins (text)`, `geography (text)`, `practices (text[])`, `clothing (text)`, `food (text)`, `music (text)`, `timeline (jsonb)`.
- **`festivals` & `festival_occurrences`**: Multi-year sacred celebrations and astronomical events.
  - Columns (`festivals`): `id (uuid pk)`, `name (text)`, `slug (text unique)`, `cultural_origin (text)`, `religion_id (uuid)`, `countries (text[])`, `date_rule (text)`, `significance (text)`, `history (text)`, `rituals (text[])`, `food (text[])`, `clothing (text[])`, `music (text[])`.
  - Columns (`festival_occurrences`): `id (uuid pk)`, `festival_id (uuid references festivals)`, `year (int)`, `start_date (date)`, `end_date (date)`, `region_notes (text)`, `verified (bool)`. Unique: `(festival_id, year)`.
- **`cultural_media`**: Archival media with complete provenance.
  - Columns: `id (uuid pk)`, `title (text)`, `media_type (text in ('image', 'video', 'audio', 'document'))`, `media_url (text)`, `creator_credit (text)`, `attribution (text)`, `license (text)`, `copyright_status (text)`, `source_url (text)`, `cultural_context (text)`.
- **`sources` & `citations`**: Academic bibliography and quotes.
  - Columns (`sources`): `id (uuid pk)`, `title (text)`, `source_url (text)`, `publisher (text)`, `author (text)`, `publication_date (text)`, `license (text)`.
  - Columns (`citations`): `id (uuid pk)`, `source_id (uuid references sources)`, `entity_type (text)`, `entity_id (text)`, `quote (text)`.

### Cluster 4: Governance & Auditability
- **`moderation_reports`**: Moderation triage queue.
  - Columns: `id (uuid pk)`, `reporter_user_id (uuid)`, `target_type (text in ('post', 'comment', 'user', 'collection_item'))`, `target_id (text)`, `reason (text)`, `status (text in ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED'))`, `moderator_user_id (uuid)`, `action_taken (text)`, `reviewed_at (timestamptz)`.
- **`audit_logs`**: Tamper-proof forensic trail.
  - Columns: `id (uuid pk)`, `who (text)`, `what (text)`, `target (text)`, `result (text)`, `ip_address (text)`, `metadata (jsonb)`, `created_at (timestamptz)`.
