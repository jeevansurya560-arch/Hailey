-- ============================================================
-- 0004_feed.sql
-- Personalised Feed and Exploration Functions
-- ============================================================

-- ── 1. get_feed(p_limit, p_offset) ───────────────────────────
-- Calculates deterministic interest score:
-- eff_w(tag) = own_w(tag) + 0.5 * sum(own_w(n) * edge_weight(n->tag))
-- tag_score  = sum(eff_w(t) * post_tag.weight)
-- freshness  = exp(-age_hours / 72)
-- score      = tag_score * (0.6 + 0.4 * freshness) + 2.0 * [user is member of community]
-- why        = top 1-2 tags driving the recommendation
create or replace function public.get_feed(p_limit int default 20, p_offset int default 0)
returns table (post_id uuid, score real, why text[])
language sql stable security invoker set search_path = public as $$
  with eff as (
    select tag_id, sum(w)::real as w from (
      select tag_id, weight as w
        from public.user_interests
       where user_id = auth.uid() and weight > 0
      union all
      select e.dst as tag_id, (ui.weight * e.weight * 0.5)::real as w
        from public.user_interests ui
        join public.tag_edges e on e.src = ui.tag_id
       where ui.user_id = auth.uid() and ui.weight > 0
    ) s group by tag_id
  ),
  scored as (
    select p.id,
           p.created_at,
           p.community_id,
           sum(eff.w * pt.weight)::real as tag_score,
           (array_agg(t.name order by (eff.w * pt.weight) desc))[1:2] as why
      from public.posts p
      join public.post_tags pt on pt.post_id = p.id
      join eff on eff.tag_id = pt.tag_id
      join public.tags t on t.id = pt.tag_id
     where not exists (
       select 1 from public.post_reactions r
        where r.user_id = auth.uid() and r.post_id = p.id and r.kind = 'hide'
     )
     group by p.id, p.created_at, p.community_id
  )
  select s.id as post_id,
         (s.tag_score * (0.6 + 0.4 * exp(-extract(epoch from now() - s.created_at) / 3600.0 / 72.0))
          + case when m.user_id is not null then 2.0 else 0.0 end)::real as score,
         s.why
    from scored s
    left join public.memberships m on m.community_id = s.community_id and m.user_id = auth.uid()
   order by score desc, s.created_at desc
   limit p_limit offset p_offset;
$$;

-- ── 2. get_explore(p_limit) ──────────────────────────────────
-- Discovers posts from adjacent graph tags where the user has weight 0
-- Used to interleave exploration slots (anti-filter-bubble)
create or replace function public.get_explore(p_limit int default 10)
returns table (post_id uuid, score real, why text[])
language sql stable security invoker set search_path = public as $$
  with own_tags as (
    select tag_id from public.user_interests where user_id = auth.uid() and weight > 0
  ),
  neighbor_tags as (
    select distinct e.dst as tag_id, e.weight
      from own_tags ot
      join public.tag_edges e on e.src = ot.tag_id
     where e.dst not in (select tag_id from own_tags)
  ),
  explore_posts as (
    select p.id as post_id,
           p.created_at,
           sum(nt.weight * pt.weight)::real as score,
           (array_agg(t.name order by (nt.weight * pt.weight) desc))[1:2] as why
      from public.posts p
      join public.post_tags pt on pt.post_id = p.id
      join neighbor_tags nt on nt.tag_id = pt.tag_id
      join public.tags t on t.id = pt.tag_id
     where not exists (
       select 1 from public.post_reactions r
        where r.user_id = auth.uid() and r.post_id = p.id
     )
     group by p.id, p.created_at
  )
  select ep.post_id, ep.score, ep.why
    from explore_posts ep
   order by ep.score desc, ep.created_at desc
   limit p_limit;
$$;
