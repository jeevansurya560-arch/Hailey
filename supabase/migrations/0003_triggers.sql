-- ============================================================
-- 0003_triggers.sql
-- Triggers for dynamic interest weight updates
-- ============================================================

-- ── 1. Helper function: bump_interests ─────────────────────────
create or replace function public.bump_interests(p_user uuid, p_post uuid, p_delta real)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- 1. Ensure user_interest rows exist for each post tag
  insert into public.user_interests (user_id, tag_id, weight, source)
  select p_user, pt.tag_id, 0, 'behavior'
  from public.post_tags pt
  where pt.post_id = p_post
  on conflict (user_id, tag_id) do nothing;

  -- 2. Update weights: weight + delta * post_tag.weight, floored at 0
  update public.user_interests ui
     set weight = greatest(0::real, (ui.weight + p_delta * pt.weight)::real),
         updated_at = now()
    from public.post_tags pt
   where pt.post_id = p_post
     and ui.user_id = p_user
     and ui.tag_id = pt.tag_id;
end $$;

-- ── 2. Reaction trigger (like +1, save +3, hide -3) ────────────
create or replace function public.on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.bump_interests(
    new.user_id,
    new.post_id,
    case new.kind
      when 'like' then 1::real
      when 'save' then 3::real
      when 'hide' then -3::real
      else 0::real
    end
  );
  return new;
end $$;

drop trigger if exists trg_reaction on public.post_reactions;
create trigger trg_reaction
  after insert on public.post_reactions
  for each row execute function public.on_reaction();

-- ── 3. Membership join trigger (+4 per community tag) ──────────
create or replace function public.on_membership_join() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- 1. Ensure user_interests rows exist for each tag belonging to joined community
  insert into public.user_interests (user_id, tag_id, weight, source)
  select new.user_id, ct.tag_id, 0, 'community_join'
  from public.community_tags ct
  where ct.community_id = new.community_id
  on conflict (user_id, tag_id) do nothing;

  -- 2. Increment weight by +4
  update public.user_interests ui
     set weight = (ui.weight + 4::real)::real,
         updated_at = now()
    from public.community_tags ct
   where ct.community_id = new.community_id
     and ui.user_id = new.user_id
     and ui.tag_id = ct.tag_id;

  return new;
end $$;

drop trigger if exists trg_membership_join on public.memberships;
create trigger trg_membership_join
  after insert on public.memberships
  for each row execute function public.on_membership_join();

-- ── 4. Relevance Feedback trigger (yes +1, no -2) ──────────────
create or replace function public.on_feedback() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.answer = 'yes' then
    perform public.bump_interests(new.user_id, new.post_id, 1::real);
  elsif new.answer = 'no' then
    perform public.bump_interests(new.user_id, new.post_id, -2::real);
  end if;
  return new;
end $$;

drop trigger if exists trg_feedback on public.feedback;
create trigger trg_feedback
  after insert on public.feedback
  for each row execute function public.on_feedback();
