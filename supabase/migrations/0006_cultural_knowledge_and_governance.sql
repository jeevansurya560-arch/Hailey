-- ============================================================
-- 0006_cultural_knowledge_and_governance.sql
-- Production schema & RLS for:
-- 1. Religions & Traditions (Relational Coverage)
-- 2. Cultural Entities & Wikipedia-Style Presentation Knowledge
-- 3. Festivals & Multi-Year Variable Date Occurrences
-- 4. Cultural Media Archive & Provenance
-- 5. Sources, Citations & Content Versioning
-- 6. Content Moderation Reports Workflow
-- 7. Durable System & Security Audit Logs
-- ============================================================

-- ── 1. Religions & Traditions ────────────────────────────────
create table if not exists public.religions (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text unique not null,
  description        text not null,
  origin_region      text not null,
  primary_texts      text[] not null default '{}',
  historical_period  text not null,
  created_at         timestamptz not null default now()
);

create table if not exists public.traditions (
  id                 uuid primary key default gen_random_uuid(),
  religion_id        uuid references public.religions(id) on delete set null,
  name               text not null,
  slug               text unique not null,
  tradition_type     text not null check (tradition_type in ('denomination', 'folk', 'indigenous', 'philosophical', 'secular', 'monastic')),
  description        text not null,
  geographic_spread  text[] not null default '{}',
  created_at         timestamptz not null default now()
);

-- ── 2. Cultural Entities & Detailed Knowledge ────────────────
create table if not exists public.cultural_entities (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text unique not null,
  region             text not null,
  country            text not null,
  language           text not null,
  summary            text not null,
  history            text not null,
  origins            text not null,
  geography          text not null,
  practices          text[] not null default '{}',
  clothing           text,
  food               text,
  music              text,
  architecture       text,
  timeline           jsonb not null default '[]'::jsonb,
  related_cultures   text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── 3. Festivals & Annual Occurrences ────────────────────────
create table if not exists public.festivals (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  alternate_names    text[] not null default '{}',
  slug               text unique not null,
  cultural_origin    text not null,
  religion_id        uuid references public.religions(id) on delete set null,
  tradition_id       uuid references public.traditions(id) on delete set null,
  countries          text[] not null default '{}',
  regions            text[] not null default '{}',
  typical_month      int check (typical_month between 1 and 12),
  date_rule          text not null default 'solar' check (date_rule in ('solar', 'lunar_hindu', 'lunar_islamic', 'hebrew', 'fixed_gregorian', 'seasonal_equinox')),
  significance       text not null,
  history            text not null,
  rituals            text[] not null default '{}',
  food               text[] not null default '{}',
  clothing           text[] not null default '{}',
  music              text[] not null default '{}',
  created_at         timestamptz not null default now()
);

create table if not exists public.festival_occurrences (
  id                 uuid primary key default gen_random_uuid(),
  festival_id        uuid not null references public.festivals(id) on delete cascade,
  year               int not null,
  start_date         date not null,
  end_date           date not null,
  region_notes       text,
  verified           boolean not null default true,
  created_at         timestamptz not null default now(),
  unique(festival_id, year)
);

create index if not exists idx_festival_occurrences_year on public.festival_occurrences (year, start_date);

-- ── 4. Cultural Media Archive & Provenance ───────────────────
create table if not exists public.cultural_media (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  media_type         text not null check (media_type in ('image', 'video', 'audio', 'document')),
  media_url          text not null check (media_url ~ '^https?://'),
  thumbnail_url      text check (thumbnail_url is null or thumbnail_url ~ '^https?://'),
  creator_credit     text not null,
  attribution        text not null,
  license            text not null default 'CC-BY-SA-4.0',
  copyright_status   text not null default 'commons',
  source_url         text check (source_url is null or source_url ~ '^https?://'),
  cultural_context   text not null,
  culture_slug       text,
  festival_id        uuid references public.festivals(id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists idx_cultural_media_culture on public.cultural_media (culture_slug);
create index if not exists idx_cultural_media_festival on public.cultural_media (festival_id);

-- ── 5. Sources, Citations & Content Versions ─────────────────
create table if not exists public.sources (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  source_url         text check (source_url is null or source_url ~ '^https?://'),
  publisher          text not null,
  author             text,
  publication_date   text,
  license            text,
  doi_or_isbn        text,
  created_at         timestamptz not null default now()
);

create table if not exists public.citations (
  id                 uuid primary key default gen_random_uuid(),
  source_id          uuid not null references public.sources(id) on delete cascade,
  entity_type        text not null check (entity_type in ('culture', 'festival', 'religion', 'tradition', 'post')),
  entity_id          text not null,
  quote              text,
  page_reference     text,
  created_at         timestamptz not null default now()
);

create table if not exists public.content_versions (
  id                 uuid primary key default gen_random_uuid(),
  entity_type        text not null check (entity_type in ('culture', 'festival', 'religion', 'tradition')),
  entity_id          text not null,
  version_number     int not null,
  editor_user_id     uuid references auth.users(id) on delete set null,
  change_summary     text not null,
  snapshot           jsonb not null,
  created_at         timestamptz not null default now(),
  unique(entity_type, entity_id, version_number)
);

-- ── 6. Content Moderation Reports ────────────────────────────
create table if not exists public.moderation_reports (
  id                 uuid primary key default gen_random_uuid(),
  reporter_user_id   uuid references auth.users(id) on delete set null,
  target_type        text not null check (target_type in ('post', 'comment', 'user', 'collection_item')),
  target_id          text not null,
  reason             text not null,
  status             text not null default 'PENDING' check (status in ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED')),
  moderator_user_id  uuid references auth.users(id) on delete set null,
  action_taken       text,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_moderation_reports_status on public.moderation_reports (status);

-- ── 7. Durable System & Security Audit Logs ──────────────────
create table if not exists public.audit_logs (
  id                 uuid primary key default gen_random_uuid(),
  who                text not null,
  what               text not null,
  target             text not null,
  result             text not null,
  ip_address         text,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists idx_audit_logs_what on public.audit_logs (what, created_at desc);

-- ── Row Level Security (RLS) ──────────────────────────────────
alter table public.religions            enable row level security;
alter table public.traditions           enable row level security;
alter table public.cultural_entities    enable row level security;
alter table public.festivals            enable row level security;
alter table public.festival_occurrences enable row level security;
alter table public.cultural_media       enable row level security;
alter table public.sources              enable row level security;
alter table public.citations            enable row level security;
alter table public.content_versions     enable row level security;
alter table public.moderation_reports   enable row level security;
alter table public.audit_logs           enable row level security;

-- Public Read for Cultural Archive
create policy "religions_read_all" on public.religions for select using (true);
create policy "traditions_read_all" on public.traditions for select using (true);
create policy "cultural_entities_read_all" on public.cultural_entities for select using (true);
create policy "festivals_read_all" on public.festivals for select using (true);
create policy "festival_occurrences_read_all" on public.festival_occurrences for select using (true);
create policy "cultural_media_read_all" on public.cultural_media for select using (true);
create policy "sources_read_all" on public.sources for select using (true);
create policy "citations_read_all" on public.citations for select using (true);
create policy "content_versions_read_all" on public.content_versions for select using (true);

-- Authenticated Users can submit moderation reports
create policy "moderation_reports_insert_auth" on public.moderation_reports
  for insert with check (auth.uid() = reporter_user_id or reporter_user_id is null);

-- Reporters can view their own reports
create policy "moderation_reports_select_own" on public.moderation_reports
  for select using (auth.uid() = reporter_user_id);

-- Audit logs: Service role / DB administrator only (no anon or normal user SELECT)
-- (Leaving with no user select policy enforces service-role-only access)
