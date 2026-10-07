-- ============================================================
-- 0005_core_products.sql
-- Production schema & RLS for:
-- 1. Paid Curation (curation_payments)
-- 2. Wallet-Native Ticketing (tickets)
-- 3. Cultural Outcome Markets (markets, market_options, positions, market_resolutions)
-- 4. Idempotent Attestation Pipeline (attestation_jobs)
-- ============================================================

-- ── 1. Paid Curation Payments ────────────────────────────────
create table if not exists public.curation_payments (
  id                 uuid primary key default gen_random_uuid(),
  payer_user_id      uuid references auth.users(id) on delete set null,
  curator_user_id    uuid not null references auth.users(id) on delete cascade,
  collection_id      uuid references public.collections(id) on delete cascade,
  post_id            uuid references public.posts(id) on delete cascade,
  amount             numeric(18, 4) not null check (amount > 0),
  currency           text not null default 'USDC',
  payment_method     text not null check (payment_method in ('crypto_monad', 'crypto_evm', 'fiat_stripe', 'direct_transfer')),
  status             text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  provider_reference text unique,
  tx_hash            text unique,
  platform_fee       numeric(18, 4) not null default 0 check (platform_fee >= 0),
  curator_amount     numeric(18, 4) not null check (curator_amount >= 0),
  failure_reason     text,
  created_at         timestamptz not null default now(),
  completed_at       timestamptz,
  failed_at          timestamptz,
  constraint valid_payment_split check (curator_amount + platform_fee = amount)
);

create index if not exists idx_curation_payments_curator on public.curation_payments (curator_user_id, status);
create index if not exists idx_curation_payments_payer on public.curation_payments (payer_user_id, status);
create index if not exists idx_curation_payments_collection on public.curation_payments (collection_id);

-- ── 2. Wallet-Native Ticketing ───────────────────────────────
create table if not exists public.tickets (
  id                   uuid primary key default gen_random_uuid(),
  event_id             text not null,
  event_title          text not null,
  owner_user_id        uuid references auth.users(id) on delete set null,
  owner_wallet_address text not null check (owner_wallet_address ~* '^0x[0-9a-f]{40}$'),
  ticket_type          text not null default 'general' check (ticket_type in ('general', 'vip', 'curator_pass', 'early_access')),
  token_id             text,
  status               text not null default 'issued' check (status in ('issued', 'claimed', 'used', 'revoked', 'expired')),
  metadata             jsonb not null default '{}'::jsonb,
  transferability      boolean not null default true,
  issued_at            timestamptz not null default now(),
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_tickets_wallet on public.tickets (lower(owner_wallet_address));
create index if not exists idx_tickets_user on public.tickets (owner_user_id);
create index if not exists idx_tickets_event on public.tickets (event_id);

-- ── 3. Cultural Outcome Markets ─────────────────────────────
create table if not exists public.markets (
  id                  uuid primary key default gen_random_uuid(),
  creator_id          uuid not null references auth.users(id) on delete cascade,
  title               text not null,
  description         text not null,
  category            text not null check (category in ('cultural_preservation', 'exhibition', 'archive_milestone', 'community_growth', 'trend_forecast')),
  resolution_source   text not null,
  resolution_deadline timestamptz not null,
  status              text not null default 'open' check (status in ('draft', 'open', 'paused', 'closed', 'resolving', 'resolved', 'cancelled')),
  winning_option_id   uuid,
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz
);

create table if not exists public.market_options (
  id          uuid primary key default gen_random_uuid(),
  market_id   uuid not null references public.markets(id) on delete cascade,
  label       text not null,
  total_stake numeric(18, 4) not null default 0 check (total_stake >= 0),
  unique(market_id, label)
);

create table if not exists public.positions (
  id            uuid primary key default gen_random_uuid(),
  market_id     uuid not null references public.markets(id) on delete cascade,
  option_id     uuid not null references public.market_options(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        numeric(18, 4) not null check (amount > 0),
  status        text not null default 'active' check (status in ('active', 'won', 'lost', 'refunded')),
  payout_amount numeric(18, 4) not null default 0 check (payout_amount >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists idx_positions_user on public.positions (user_id);
create index if not exists idx_positions_market on public.positions (market_id);

create table if not exists public.market_resolutions (
  id                 uuid primary key default gen_random_uuid(),
  market_id          uuid not null references public.markets(id) on delete cascade unique,
  winning_option_id  uuid not null references public.market_options(id) on delete restrict,
  evidence_url       text not null,
  source_description text not null,
  resolved_by        uuid not null references auth.users(id) on delete set null,
  resolved_at        timestamptz not null default now()
);

-- Foreign key link for winning_option_id on markets
alter table public.markets
  drop constraint if exists fk_markets_winning_option;
alter table public.markets
  add constraint fk_markets_winning_option foreign key (winning_option_id) references public.market_options(id) on delete set null;

-- ── 4. Attestation Jobs Pipeline ─────────────────────────────
create table if not exists public.attestation_jobs (
  id              uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade unique,
  status          text not null default 'queued' check (status in ('queued', 'processing', 'submitted', 'confirmed', 'failed', 'dead_letter')),
  attempts        integer not null default 0,
  max_attempts    integer not null default 5,
  tx_hash         text,
  last_error      text,
  next_attempt_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists idx_attestation_jobs_status on public.attestation_jobs (status, next_attempt_at);

-- ── 5. Enable Row Level Security ────────────────────────────
alter table public.curation_payments enable row level security;
alter table public.tickets enable row level security;
alter table public.markets enable row level security;
alter table public.market_options enable row level security;
alter table public.positions enable row level security;
alter table public.market_resolutions enable row level security;
alter table public.attestation_jobs enable row level security;

-- ── 6. RLS Policies: curation_payments ──────────────────────
-- Payers can view their own payments; Curators can view their received supports
drop policy if exists "payments_select_involved" on public.curation_payments;
create policy "payments_select_involved"
  on public.curation_payments for select
  using (auth.uid() = payer_user_id or auth.uid() = curator_user_id);

-- Only authenticated users can initialize a payment with their own payer_user_id
drop policy if exists "payments_insert_payer" on public.curation_payments;
create policy "payments_insert_payer"
  on public.curation_payments for insert
  with check (auth.uid() = payer_user_id and status = 'pending');

-- No direct client updates! Status transitions, payouts and confirmations happen strictly via backend API / service role.
drop policy if exists "payments_update_blocked" on public.curation_payments;

-- ── 7. RLS Policies: tickets ────────────────────────────────
-- Ticket holders can read their own tickets by user_id or linked wallet
drop policy if exists "tickets_select_owner" on public.tickets;
create policy "tickets_select_owner"
  on public.tickets for select
  using (
    auth.uid() = owner_user_id
    or lower(owner_wallet_address) in (
      select lower(wallet_address) from public.profiles where id = auth.uid() and wallet_address is not null
    )
  );

-- Direct client updates to tickets are blocked. Ticket state transitions (claim, use, revoke) are managed via API.

-- ── 8. RLS Policies: markets & market_options ───────────────
-- Markets are publicly readable
drop policy if exists "markets_select_all" on public.markets;
create policy "markets_select_all"
  on public.markets for select
  using (true);

-- Authenticated users can create markets
drop policy if exists "markets_insert_auth" on public.markets;
create policy "markets_insert_auth"
  on public.markets for insert
  with check (auth.uid() = creator_id and status in ('draft', 'open'));

-- Market creator can update only while in draft status (cannot resolve or change after open)
drop policy if exists "markets_update_creator_draft" on public.markets;
create policy "markets_update_creator_draft"
  on public.markets for update
  using (auth.uid() = creator_id and status = 'draft')
  with check (auth.uid() = creator_id and status in ('draft', 'open'));

-- Market options are publicly readable
drop policy if exists "market_options_select_all" on public.market_options;
create policy "market_options_select_all"
  on public.market_options for select
  using (true);

-- Options can be inserted by the market creator
drop policy if exists "market_options_insert_creator" on public.market_options;
create policy "market_options_insert_creator"
  on public.market_options for insert
  with check (
    exists (
      select 1 from public.markets
       where id = market_id and creator_id = auth.uid() and status in ('draft', 'open')
    )
  );

-- ── 9. RLS Policies: positions ──────────────────────────────
-- Users can view their own positions; and positions for open/resolved markets can be viewed
drop policy if exists "positions_select_all" on public.positions;
create policy "positions_select_all"
  on public.positions for select
  using (auth.uid() = user_id or true);

-- Users can only insert positions for themselves on active/open markets
drop policy if exists "positions_insert_own_open" on public.positions;
create policy "positions_insert_own_open"
  on public.positions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.markets
       where id = market_id and status = 'open' and resolution_deadline > now()
    )
  );

-- Direct client updates to positions are forbidden (payouts and winnings settled by server)

-- ── 10. RLS Policies: market_resolutions ────────────────────
-- Resolutions are public audit records
drop policy if exists "resolutions_select_all" on public.market_resolutions;
create policy "resolutions_select_all"
  on public.market_resolutions for select
  using (true);

-- Insertions and modifications are restricted to service role / admin resolution endpoints

-- ── 11. RLS Policies: attestation_jobs ──────────────────────
-- Only service role and the contributor can see job status
drop policy if exists "attestation_jobs_select_contributor" on public.attestation_jobs;
create policy "attestation_jobs_select_contributor"
  on public.attestation_jobs for select
  using (
    exists (
      select 1 from public.contributions c
       where c.id = contribution_id and c.user_id = auth.uid()
    )
  );
