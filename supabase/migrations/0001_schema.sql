-- ============================================================
-- 0001_schema.sql
-- Initial schema for Hailey.
-- Apply: supabase db push (or paste into Supabase SQL editor)
-- ============================================================

-- Extension (provides crypt helpers; gen_random_uuid() is built-in from PG14+)
create extension if not exists pgcrypto;

-- ── Enum types ────────────────────────────────────────────────────────────────
create type tag_kind       as enum ('culture','music','fashion','food','art','film','language','heritage','internet','place');
create type member_role    as enum ('member','curator');
create type reaction_kind  as enum ('like','save','hide');
create type item_status    as enum ('pending','approved','rejected');
create type attest_status  as enum ('awaiting_wallet','submitted','attested','failed');
create type feedback_answer as enum ('yes','somewhat','no');

-- ── profiles ──────────────────────────────────────────────────────────────────
-- FIX: original had no DEFAULT on created_at (fine, 'default now()' is present).
-- FIX: wallet_address regex uses lowercase-only hex to match the link-flow that
--      normalises to lowercase before storing.
create table profiles (
  id             uuid        primary key references auth.users on delete cascade,
  handle         text        unique not null
                               check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name   text,
  avatar_url     text,
  wallet_address text        unique
                               check (wallet_address is null
                                      or wallet_address ~ '^0x[0-9a-f]{40}$'),
  is_editorial   boolean     not null default false,
  created_at     timestamptz not null default now()
);

-- ── tags ──────────────────────────────────────────────────────────────────────
create table tags (
  id          int         generated always as identity primary key,
  slug        text        unique not null,
  name        text        not null,
  kind        tag_kind    not null,
  parent_id   int         references tags(id),
  description text,
  cover_url   text
);

-- ── tag_edges (culture graph) ────────────────────────────────────────────────
create table tag_edges (
  src    int  not null references tags(id) on delete cascade,
  dst    int  not null references tags(id) on delete cascade,
  weight real not null default 0.5 check (weight between 0 and 1),
  primary key (src, dst)
);

-- ── user_interests ────────────────────────────────────────────────────────────
create table user_interests (
  user_id    uuid        not null references profiles(id) on delete cascade,
  tag_id     int         not null references tags(id)     on delete cascade,
  weight     real        not null default 0 check (weight >= 0),
  source     text        not null default 'onboarding',
  updated_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

-- ── communities ───────────────────────────────────────────────────────────────
create table communities (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        unique not null,
  name        text        not null,
  description text,
  cover_url   text,
  created_by  uuid        references profiles(id),
  created_at  timestamptz not null default now()
);

-- FIX: original wrote `references communities` without explicit column; Postgres
-- infers the PK (id), so this is valid — kept as-is but made explicit for clarity.
create table community_tags (
  community_id uuid references communities(id) on delete cascade,
  tag_id       int  references tags(id)        on delete cascade,
  primary key (community_id, tag_id)
);

create table memberships (
  community_id uuid        references communities(id) on delete cascade,
  user_id      uuid        references profiles(id)    on delete cascade,
  role         member_role not null default 'member',
  joined_at    timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ── posts ─────────────────────────────────────────────────────────────────────
create table posts (
  id           uuid        primary key default gen_random_uuid(),
  author_id    uuid        not null references profiles(id),
  community_id uuid        references communities(id),
  body         text        not null check (char_length(body) between 1 and 2000),
  media_url    text        check (media_url is null or media_url ~ '^https://'),
  media_credit text,
  source_url   text        check (source_url is null or source_url ~ '^https?://'),
  is_editorial boolean     not null default false,
  created_at   timestamptz not null default now()
);

create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id  int  references tags(id)  on delete cascade,
  weight  real not null default 1,
  primary key (post_id, tag_id)
);

create table post_reactions (
  user_id    uuid          references profiles(id) on delete cascade,
  post_id    uuid          references posts(id)    on delete cascade,
  kind       reaction_kind not null,
  created_at timestamptz   not null default now(),
  primary key (user_id, post_id, kind)
);

create table impressions (
  user_id    uuid        references profiles(id) on delete cascade,
  post_id    uuid        references posts(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table feedback (
  user_id    uuid            references profiles(id) on delete cascade,
  post_id    uuid            references posts(id)    on delete cascade,
  answer     feedback_answer not null,
  created_at timestamptz     not null default now(),
  primary key (user_id, post_id)
);

-- ── collections & contributions ───────────────────────────────────────────────
create table collections (
  id           uuid        primary key default gen_random_uuid(),
  owner_id     uuid        not null references profiles(id),
  community_id uuid        references communities(id),   -- null = personal
  title        text        not null check (char_length(title) between 1 and 80),
  description  text        check (char_length(description) <= 500),
  created_at   timestamptz not null default now()
);

create table collection_items (
  id            uuid        primary key default gen_random_uuid(),
  collection_id uuid        not null references collections(id) on delete cascade,
  added_by      uuid        not null references profiles(id),
  kind          text        not null check (kind in ('post','link','note')),
  post_id       uuid        references posts(id),
  url           text        check (url is null or url ~ '^https?://'),
  note          text        check (char_length(note) <= 500),
  status        item_status not null default 'pending',
  decided_by    uuid        references profiles(id),
  decided_at    timestamptz,
  created_at    timestamptz not null default now(),
  -- FIX: original used `decided_by <> added_by`; this is correct SQL (ISO standard
  -- inequality operator). `!=` is also valid but `<>` is preferred in Postgres.
  check (decided_by is null or decided_by <> added_by)
);

create table contributions (
  id           uuid          primary key default gen_random_uuid(),
  item_id      uuid          unique not null references collection_items(id),
  user_id      uuid          not null references profiles(id),
  community_id uuid          not null references communities(id),
  -- FIX: content_hash regex uses lowercase hex only (consistent with keccak output
  -- which is always lowercase when formatted as hex string).
  content_hash text          unique not null
                               check (content_hash ~ '^0x[0-9a-f]{64}$'),
  status       attest_status not null,
  tx_hash      text,
  error        text,
  attested_at  timestamptz,
  created_at   timestamptz   not null default now()
);

-- ── reports & wallet_nonces ───────────────────────────────────────────────────
create table reports (
  id          uuid        primary key default gen_random_uuid(),
  reporter_id uuid        not null references profiles(id),
  entity_type text        not null,
  entity_id   uuid        not null,
  reason      text,
  created_at  timestamptz not null default now()
);

create table wallet_nonces (
  user_id    uuid        primary key references profiles(id) on delete cascade,
  nonce      text        not null,
  expires_at timestamptz not null
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index on post_tags       (tag_id);
create index on posts           (created_at desc);
create index on posts           (community_id);
create index on memberships     (user_id);
create index on collection_items (collection_id, status);

-- ── Profile bootstrap trigger (§3.3) ─────────────────────────────────────────
-- Creates a profiles row on every new auth.users insert.
-- Handle: "u_" + first 8 hex chars of the user UUID.
-- Security DEFINER so it can insert into profiles even without a profiles row.
-- search_path = '' prevents search-path injection attacks.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, handle)
  values (
    new.id,
    'u_' || substring(replace(new.id::text, '-', '') from 1 for 8)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
