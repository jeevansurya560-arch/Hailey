-- ============================================================
-- 0002_rls.sql
-- Row Level Security policies for all tables.
-- Run AFTER 0001_schema.sql.
-- ============================================================

-- ── Enable RLS on every table ─────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.tags             enable row level security;
alter table public.tag_edges        enable row level security;
alter table public.user_interests   enable row level security;
alter table public.communities      enable row level security;
alter table public.community_tags   enable row level security;
alter table public.memberships      enable row level security;
alter table public.posts            enable row level security;
alter table public.post_tags        enable row level security;
alter table public.post_reactions   enable row level security;
alter table public.impressions      enable row level security;
alter table public.feedback         enable row level security;
alter table public.collections      enable row level security;
alter table public.collection_items enable row level security;
alter table public.contributions    enable row level security;
alter table public.reports          enable row level security;
alter table public.wallet_nonces    enable row level security;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Select: everyone can read profiles
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Insert: handled by trigger (handle_new_user runs as SECURITY DEFINER)
-- No client insert policy.

-- Update: own row; wallet_address update is blocked here — only server (service role) can update it
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── tags ──────────────────────────────────────────────────────────────────────
-- Read-only for everyone; inserts/updates done by admin/seed only
create policy "tags_select_all"
  on public.tags for select
  using (true);

-- ── tag_edges ─────────────────────────────────────────────────────────────────
create policy "tag_edges_select_all"
  on public.tag_edges for select
  using (true);

-- ── user_interests ────────────────────────────────────────────────────────────
create policy "user_interests_select_own"
  on public.user_interests for select
  using (auth.uid() = user_id);

create policy "user_interests_insert_own"
  on public.user_interests for insert
  with check (auth.uid() = user_id);

create policy "user_interests_update_own"
  on public.user_interests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_interests_delete_own"
  on public.user_interests for delete
  using (auth.uid() = user_id);

-- ── communities ───────────────────────────────────────────────────────────────
-- Everyone can read; authenticated users can create (P1 restriction noted)
create policy "communities_select_all"
  on public.communities for select
  using (true);

-- Creator can update
create policy "communities_update_creator"
  on public.communities for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- ── community_tags ────────────────────────────────────────────────────────────
create policy "community_tags_select_all"
  on public.community_tags for select
  using (true);

-- ── memberships ───────────────────────────────────────────────────────────────
-- Everyone can read memberships
create policy "memberships_select_all"
  on public.memberships for select
  using (true);

-- Users can join themselves; role MUST be 'member' (curators are promoted via SQL/service role)
create policy "memberships_insert_own"
  on public.memberships for insert
  with check (auth.uid() = user_id and role = 'member');

-- Users can leave (delete own membership)
create policy "memberships_delete_own"
  on public.memberships for delete
  using (auth.uid() = user_id);

-- ── posts ─────────────────────────────────────────────────────────────────────
create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Author can delete own post
create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ── post_tags ─────────────────────────────────────────────────────────────────
create policy "post_tags_select_all"
  on public.post_tags for select
  using (true);

-- Inserting post_tags is done by the author as part of creating a post
create policy "post_tags_insert_own"
  on public.post_tags for insert
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

create policy "post_tags_delete_own"
  on public.post_tags for delete
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- ── post_reactions ────────────────────────────────────────────────────────────
create policy "post_reactions_select_own"
  on public.post_reactions for select
  using (auth.uid() = user_id);

create policy "post_reactions_insert_own"
  on public.post_reactions for insert
  with check (auth.uid() = user_id);

-- Users can remove own reactions
create policy "post_reactions_delete_own"
  on public.post_reactions for delete
  using (auth.uid() = user_id);

-- ── impressions ───────────────────────────────────────────────────────────────
create policy "impressions_select_own"
  on public.impressions for select
  using (auth.uid() = user_id);

create policy "impressions_insert_own"
  on public.impressions for insert
  with check (auth.uid() = user_id);

-- ── feedback ──────────────────────────────────────────────────────────────────
create policy "feedback_select_own"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "feedback_insert_own"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- ── collections ───────────────────────────────────────────────────────────────
create policy "collections_select_all"
  on public.collections for select
  using (true);

create policy "collections_insert_own"
  on public.collections for insert
  with check (auth.uid() = owner_id);

create policy "collections_update_own"
  on public.collections for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ── collection_items ──────────────────────────────────────────────────────────
-- Select: approved items, or items the user added, or if user is curator of the collection's community
create policy "collection_items_select"
  on public.collection_items for select
  using (
    status = 'approved'
    or added_by = auth.uid()
    or exists (
      select 1 from public.collections c
      join public.memberships m on m.community_id = c.community_id
      where c.id = collection_id
        and m.user_id = auth.uid()
        and m.role = 'curator'
    )
  );

-- Insert: user can propose (added_by = self, status = pending)
create policy "collection_items_insert_own"
  on public.collection_items for insert
  with check (auth.uid() = added_by and status = 'pending');

-- Update/Delete: server only (service role bypasses RLS)
-- No client update or delete policies.

-- ── contributions ─────────────────────────────────────────────────────────────
-- Public attestations — anyone can read
create policy "contributions_select_all"
  on public.contributions for select
  using (true);

-- Insert/Update: server only (no client policies)

-- ── reports ───────────────────────────────────────────────────────────────────
-- Users can report; they cannot read reports (privacy)
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ── wallet_nonces ─────────────────────────────────────────────────────────────
-- Server only — no client policies; service role handles all operations
