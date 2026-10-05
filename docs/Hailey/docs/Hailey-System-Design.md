# Hailey — System Design

| | |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-10-04 |
| Basis | `Hailey-PRD.md`, `Hailey-SRS.md` |
| Companion | `Hailey-Architecture.md` (stack, deployment, decisions) |

> **Status of code in this document:** all SQL, TypeScript and Solidity below are *design sketches that have not been executed or tested*. Run them, fix what breaks, and treat the SRS acceptance script as the real test.

---

## 1. Design goals and constraints

| Goal | Consequence |
|---|---|
| Ship a deployed hero flow in 9 days, solo | Minimal moving parts; logic lives in Postgres once; two serverless functions only |
| Explainable personalisation | Simple weighted-tag scoring whose terms *are* the explanation |
| Crypto invisible, onchain meaningful | Gas paid by relayer; only hashes + counts onchain |
| No Next.js | Vite + React SPA; no SSR |
| Free tiers + rate-limited public RPC | No chain reads outside `/verify`; cache in DB |

---

## 2. System overview

```text
              ┌─────────────────────────────────────────┐
              │  Browser (React SPA, mobile-first)      │
              │  Router · TanStack Query · wagmi/viem   │
              └───────┬─────────────┬─────────────┬─────┘
        supabase-js   │   fetch     │             │ viem (read-only, /verify)
        (RLS, RPC)    │  /api/*     │             │
                      ▼             ▼             ▼
              ┌────────────┐  ┌───────────┐  ┌──────────────┐
              │ Supabase   │◄─┤ Vercel    │─►│ Monad testnet│
              │ Postgres   │  │ Functions │  │ HaileyContri-│
              │ Auth       │  │ (relayer) │  │ butions.sol  │
              └────────────┘  └───────────┘  └──────────────┘
```

Responsibilities:

| Component | Owns |
|---|---|
| **SPA** | UI, routing, optimistic updates, wallet connection, `/verify` chain reads |
| **Postgres** | All app data, RLS, interest-weight triggers, `get_feed` / `get_explore` |
| **Functions** | Wallet-link verification; curator-gated approval; relayer transactions |
| **Contract** | Immutable attestation records and per-community counts |

---

## 3. Data model

### 3.1 Entity relationship (simplified)

```text
profiles ─┬─< user_interests >─ tags ─< tag_edges (src,dst)
          ├─< memberships >─ communities ─< community_tags >─ tags
          ├─< posts ─< post_tags >─ tags
          ├─< post_reactions (like|save|hide) >─ posts
          ├─< impressions >─ posts
          ├─< feedback >─ posts
          ├─< collections ─< collection_items ─1:1─ contributions
          └─< wallet_nonces
```

### 3.2 DDL (sketch)

```sql
create extension if not exists pgcrypto;

create type tag_kind as enum
  ('culture','music','fashion','food','art','film','language','heritage','internet','place');
create type member_role   as enum ('member','curator');
create type reaction_kind as enum ('like','save','hide');
create type item_status   as enum ('pending','approved','rejected');
create type attest_status as enum ('awaiting_wallet','submitted','attested','failed');
create type feedback_answer as enum ('yes','somewhat','no');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text,
  avatar_url text,
  wallet_address text unique check (wallet_address ~ '^0x[0-9a-f]{40}$'),
  is_editorial boolean not null default false,
  created_at timestamptz not null default now()
);

create table tags (
  id int generated always as identity primary key,
  slug text unique not null,
  name text not null,
  kind tag_kind not null,
  parent_id int references tags(id),
  description text,
  cover_url text
);

create table tag_edges (                       -- the culture graph
  src int not null references tags(id) on delete cascade,
  dst int not null references tags(id) on delete cascade,
  weight real not null default 0.5 check (weight between 0 and 1),
  primary key (src, dst)
);

create table user_interests (
  user_id uuid not null references profiles(id) on delete cascade,
  tag_id  int  not null references tags(id) on delete cascade,
  weight  real not null default 0 check (weight >= 0),
  source  text not null default 'onboarding',
  updated_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

create table communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  cover_url text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create table community_tags (
  community_id uuid references communities on delete cascade,
  tag_id int references tags on delete cascade,
  primary key (community_id, tag_id)
);
create table memberships (
  community_id uuid references communities on delete cascade,
  user_id uuid references profiles on delete cascade,
  role member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id),
  community_id uuid references communities(id),
  body text not null check (char_length(body) between 1 and 2000),
  media_url text check (media_url is null or media_url ~ '^https://'),
  media_credit text,                                       -- attribution
  source_url text check (source_url is null or source_url ~ '^https?://'),
  is_editorial boolean not null default false,
  created_at timestamptz not null default now()
);
create table post_tags (
  post_id uuid references posts on delete cascade,
  tag_id int references tags on delete cascade,
  weight real not null default 1,
  primary key (post_id, tag_id)
);
create table post_reactions (
  user_id uuid references profiles on delete cascade,
  post_id uuid references posts on delete cascade,
  kind reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id, kind)
);
create table impressions (
  user_id uuid references profiles on delete cascade,
  post_id uuid references posts on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create table feedback (
  user_id uuid references profiles on delete cascade,
  post_id uuid references posts on delete cascade,
  answer feedback_answer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  community_id uuid references communities(id),            -- null = personal
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 500),
  created_at timestamptz not null default now()
);
create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections on delete cascade,
  added_by uuid not null references profiles(id),
  kind text not null check (kind in ('post','link','note')),
  post_id uuid references posts(id),
  url text check (url is null or url ~ '^https?://'),
  note text check (char_length(note) <= 500),
  status item_status not null default 'pending',
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check (decided_by is null or decided_by <> added_by)     -- no self-approval
);
create table contributions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid unique not null references collection_items(id),
  user_id uuid not null references profiles(id),
  community_id uuid not null references communities(id),
  content_hash text unique not null check (content_hash ~ '^0x[0-9a-f]{64}$'),
  status attest_status not null,
  tx_hash text,
  error text,
  attested_at timestamptz,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);
create table wallet_nonces (
  user_id uuid primary key references profiles(id) on delete cascade,
  nonce text not null,
  expires_at timestamptz not null
);

create index on post_tags (tag_id);
create index on posts (created_at desc);
create index on posts (community_id);
create index on memberships (user_id);
create index on collection_items (collection_id, status);
```

### 3.3 Profile bootstrap
A trigger on `auth.users` insert creates a `profiles` row with handle `u_` + first 8 hex chars of the user id; the user can change it (AUTH-04).

---

## 4. Recommendation system

### 4.1 Interest model
`user_interests.weight` per (user, tag). Updated **only by triggers**, so the rules live in one place.

| Event | Δ weight (× post_tag.weight) |
|---|---|
| Onboarding selection | set to 5 |
| Join community | +4 on each of the community's tags |
| Save | +3 |
| Like | +1 |
| Relevance "yes" | +1 |
| Relevance "no" | −2 |
| Hide | −3 |
| Floor | weights never below 0 |

Weights do not decay in v1 (stated limitation). Un-liking/un-saving does not reverse weights (behaviour history).

```sql
create or replace function bump_interests(p_user uuid, p_post uuid, p_delta real)
returns void language sql security definer set search_path = public as $$
  insert into user_interests (user_id, tag_id, weight, source)
  select p_user, pt.tag_id, 0, 'behavior' from post_tags pt where pt.post_id = p_post
  on conflict do nothing;

  update user_interests ui
     set weight = greatest(0, ui.weight + p_delta * pt.weight), updated_at = now()
    from post_tags pt
   where pt.post_id = p_post and ui.user_id = p_user and ui.tag_id = pt.tag_id;
$$;

create or replace function on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform bump_interests(new.user_id, new.post_id,
    case new.kind when 'like' then 1 when 'save' then 3 when 'hide' then -3 end);
  return new;
end $$;
create trigger trg_reaction after insert on post_reactions
  for each row execute function on_reaction();
-- Similar triggers: memberships (join → +4 per community tag), feedback (yes +1 / no −2).
```

### 4.2 Scoring

```text
eff_w(tag)  = own_w(tag) + 0.5 × Σ over neighbours n of ( own_w(n) × edge_weight(n→tag) )
tag_score   = Σ over post tags t of  eff_w(t) × post_tag_weight(t)
fresh       = exp( −age_hours / 72 )
score(post) = tag_score × (0.6 + 0.4 × fresh) + 2.0 × [user is member of post's community]
why(post)   = names of top 2 tags by eff_w(t) × post_tag_weight(t)
```

Multi-tag overlap sums, which is what makes "Japanese street *photography*" surface for someone exploring Japan + photography without any ML.

### 4.3 `get_feed` (reference sketch)

```sql
create or replace function get_feed(p_limit int default 20, p_offset int default 0)
returns table (post_id uuid, score real, why text[])
language sql stable security invoker as $$
  with eff as (
    select tag_id, sum(w) as w from (
      select tag_id, weight as w
        from user_interests where user_id = auth.uid() and weight > 0
      union all
      select e.dst, ui.weight * e.weight * 0.5
        from user_interests ui join tag_edges e on e.src = ui.tag_id
       where ui.user_id = auth.uid() and ui.weight > 0
    ) s group by tag_id
  ),
  scored as (
    select p.id, p.created_at, p.community_id,
           sum(eff.w * pt.weight) as tag_score,
           (array_agg(t.name order by eff.w * pt.weight desc))[1:2] as why
      from posts p
      join post_tags pt on pt.post_id = p.id
      join eff on eff.tag_id = pt.tag_id
      join tags t on t.id = pt.tag_id
     where not exists (select 1 from post_reactions r
                        where r.user_id = auth.uid() and r.post_id = p.id and r.kind = 'hide')
     group by p.id, p.created_at, p.community_id
  )
  select s.id,
         (s.tag_score * (0.6 + 0.4 * exp(-extract(epoch from now() - s.created_at) / 3600 / 72))
          + case when m.user_id is not null then 2.0 else 0 end)::real as score,
         s.why
    from scored s
    left join memberships m on m.community_id = s.community_id and m.user_id = auth.uid()
   order by score desc
   limit p_limit offset p_offset;
$$;
```

The client then fetches full post rows by id (or the function can be extended to return them). Offset pagination is acceptable at demo scale.

### 4.4 Exploration slots (`get_explore`)
Returns posts whose tags are **graph neighbours** of the user's top tags but where the user's own weight on those tags is 0, excluding posts they've reacted to or hidden. The client interleaves one exploration item at every 5th position (FEED-03). This is the anti-filter-bubble rule and what makes the feed feel like discovery.

### 4.5 Cold start
Onboarding weights (5 each) make the first feed non-empty. If a user has no positive weights, show newest editorial posts (FEED-08).

### 4.6 Satisfaction metrics

| Metric | Definition |
|---|---|
| Relevance rate | (yes + somewhat) ÷ all answers |
| Save rate | distinct saves ÷ distinct impressions |
| Hide rate | distinct hides ÷ distinct impressions |

Implemented as SQL views over `feedback`, `post_reactions`, `impressions`. The relevance prompt is shown when `hash(user_id || post_id) mod 10 = 0` so it's stable across reloads.

> **Limitation to state in the pitch:** this is a transparent heuristic baseline, not machine learning, and it hasn't been evaluated against real users yet.

---

## 5. Culture graph

- **Hierarchy:** `tags.parent_id` (e.g. *African American → Music → Hip-Hop*).
- **Relations:** `tag_edges` hand-seeded (~100 directed edges, weight 0.3–0.9), e.g. *Japan ↔ Streetwear*, *Hip-Hop ↔ Streetwear*, *Streetwear ↔ Photography*. Store both directions when symmetric.
- **Use:** neighbour bonus in scoring, "related" section on culture pages, exploration slots, optional culture map (P1).
- **Authoring rule:** edges describe cultural/topic adjacency, not demographic assumptions about people.

---

## 6. Collection and contribution workflow

```text
                propose item                curator approves
  (none) ───────────────────► PENDING ─────────────────────► APPROVED
                                 │ curator rejects                │
                                 ▼                                ▼ create contribution
                              REJECTED                  AWAITING_WALLET ──(wallet linked + claim)──┐
                                                                │ wallet present                    │
                                                                ▼                                   ▼
                                                            SUBMITTED ───receipt ok──► ATTESTED
                                                                │ revert                (seal shown)
                                                                ▼
                                                             FAILED ──retry (P1)──► SUBMITTED
```

Rules:
- Approver ≠ proposer (server check + DB check constraint).
- Only community collections create contributions; personal collections do not.
- All state changes after `pending` are made by the server function with the service role (clients cannot update `collection_items` or write `contributions`).

---

## 7. Onchain design

### 7.1 Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HaileyContributions {
    enum Kind { Collection, Curation, Story, Event }   // v1 uses Collection only

    address public attestor;                                      // relayer
    mapping(bytes32 => bool) public attested;                     // contentHash => done
    mapping(address => mapping(bytes32 => uint32)) public count;  // contributor => community => n

    event Attested(address indexed contributor, bytes32 indexed communityId,
                   bytes32 contentHash, Kind kind, uint64 at);

    error NotAttestor();
    error AlreadyAttested();

    constructor(address a) { attestor = a; }

    function attest(address contributor, bytes32 communityId, bytes32 contentHash, Kind kind)
        external
    {
        if (msg.sender != attestor) revert NotAttestor();
        if (attested[contentHash]) revert AlreadyAttested();
        attested[contentHash] = true;
        unchecked { count[contributor][communityId]++; }
        emit Attested(contributor, communityId, contentHash, kind, uint64(block.timestamp));
    }

    function setAttestor(address a) external {
        if (msg.sender != attestor) revert NotAttestor();
        attestor = a;
    }
}
```

Foundry tests (SC-06): success increments count and emits event; non-attestor reverts; duplicate hash reverts; `setAttestor` works only for the current attestor.

### 7.2 Identifiers

```text
communityId = keccak256(utf8(community.slug))
contentHash = keccak256(utf8(
  "hailey:v1|" + itemId + "|" + collectionId + "|" + communitySlug + "|" + sha256hex(itemContent)
))
itemContent = kind + ":" + (post_id | url | "") + ":" + (note | "")
```

Fixed field order and `|` delimiters avoid JSON canonicalisation issues. Including a content digest lets anyone holding the item recompute and match the hash. No text is stored onchain.

### 7.3 Trust model
- A single relayer is the only writer. Anyone can verify *that* Hailey attested something; they must trust Hailey's curators for *whether it deserved to be*.
- Upgrade path: curators sign EIP-712 `Approval(contributor, communityId, contentHash)`; the contract verifies a curator allow-list. Not in v1.

### 7.4 Reading (`/verify/:address`)
Browser reads `count(address, communityId)` for each community id via viem (batched with multicall where available) and shows counts plus links to explorer. Community list comes from the DB; **counts come from the chain**. Avoid log-range scans on public RPC.

### 7.5 Failure handling
| Failure | Handling |
|---|---|
| Relayer out of gas funds | Pre-check balance; 503 "temporarily unable to verify"; contribution stays `submitted`/`awaiting` for retry |
| Tx reverts | `failed` + error text; curator retry (P1) |
| Receipt timeout (8 s) | Leave `submitted`; later reconcile by tx hash |
| Nonce collision (two approvals at once) | Accept at demo scale; failed one retried |
| Testnet reset | Run `redeploy-contract` script; update env; run reset-contributions SQL; re-demo |

---

## 8. API design

All endpoints: `POST`, JSON, `Authorization: Bearer <access_token>`; server verifies the token with Supabase Auth, then uses the service-role client. Inputs validated with a schema library; errors use `{ error: string }`.

### 8.1 `POST /api/wallet`

| `action` | Request | Response |
|---|---|---|
| `nonce` | `{ action: "nonce" }` | `{ message, expiresAt }` — message contains user id, nonce and expiry |
| `link` | `{ action: "link", address, signature }` | `{ address }` |

`link`: load nonce (exists, unexpired) → verify signature over the exact stored message → check address not used by another profile → save lowercase address → delete nonce. Errors: 400 invalid input, 401, 409 address in use, 410 nonce expired.

### 8.2 `POST /api/approve-item`
Request `{ itemId: uuid, decision: "approve" | "reject" }`.

```text
1  user = verify(bearer)                                   → 401
2  item = load item + collection.community                 → 404
3  assert item.status == pending                           → 409
4  assert membership(user, community).role == curator      → 403
5  assert item.added_by != user.id                         → 403
6  reject? → set status=rejected; return
7  set status=approved, decided_by, decided_at
8  hash = contentHash(item)
9  insert contributions(item_id, user_id, community_id, content_hash,
      status = contributor.wallet ? 'submitted' : 'awaiting_wallet')
      ON CONFLICT (item_id) DO NOTHING                     // idempotent
10 no wallet → return { status:"approved", attest:"awaiting_wallet" }
11 balance check                                           → 503
12 tx = relayer.attest(wallet, keccak(slug), hash, 0)
13 save tx_hash
14 receipt = wait(tx, 8s) → attested | failed | (timeout → stay submitted)
15 return { status:"approved", attest, txHash }
```

Steps 7–9 are not one transaction; re-running after a partial failure is safe because of the unique constraints. (A Postgres function could make them atomic if time allows.)

### 8.3 `POST /api/claim-contributions` (P1)
Attests all of the caller's `awaiting_wallet` contributions after a wallet is linked.

### 8.4 Supabase RPC / views used by the client
`get_feed(p_limit, p_offset)`, `get_explore(p_limit)`, `relevance_stats` view (P1). Other data via table queries under RLS.

### 8.5 Rate limiting
Per-user limit on `/api/*` (e.g. 30 requests/min) via a small counter table or platform firewall rules; enough to stop accidental loops and casual abuse.

---

## 9. Frontend design

### 9.1 Routes (React Router)

| Route | Screen | Auth |
|---|---|---|
| `/` | Home feed (or landing if logged out) | read |
| `/login` | Sign in / up | – |
| `/onboarding` | Interest picker | required |
| `/explore` | Tag directory + filter | read |
| `/c/:slug` | Culture page | read |
| `/communities`, `/communities/:slug` | List, community page | read |
| `/collections/:id` | Collection, propose, approve | read / write |
| `/post/:id` | Post detail | read |
| `/u/:handle` | Profile, verified contributions | read |
| `/verify/:address` | Chain-read verification | public |
| `/insights` | Satisfaction stats (P1) | required |

### 9.2 Data fetching and state
- **TanStack Query** for all server state (`['feed', page]`, `['tag', slug]`, `['community', slug]`, `['collection', id]`, `['profile', handle]`).
- Optimistic updates for like/save/hide/join; roll back on error.
- Auth state from `supabase.auth.onAuthStateChange`; wallet state from wagmi.
- No global store library needed.

### 9.3 Key components
`AppShell`, `BottomNav`/`TopNav`, `FeedCard` (image, text, source line, `WhyStamp`, actions, optional `RelevancePrompt`), `TagSticker`, `CultureHeader`, `CommunityCard`, `CollectionItemRow` (status chip, approve/reject for curators), `VerifiedSeal`, `WalletLinkButton`, `EmptyState`, `ErrorBoundary`.

### 9.4 Impression tracking
`useImpression(postId)` with IntersectionObserver (≥ 50 % visible for 1 s) → `upsert` into `impressions` with ignore-duplicates; batched every few seconds.

### 9.5 Performance
Route-level lazy loading; wallet providers and libraries loaded only on wallet-using routes (profile, collection, verify); images `loading="lazy"` with fixed aspect ratio to avoid layout shift.

---

## 10. Security design

### 10.1 Row Level Security policies

| Table | Select | Insert | Update / Delete |
|---|---|---|---|
| profiles | all | by trigger | own row (handle, display name); `wallet_address` only via server |
| tags, tag_edges | all | none (seed/admin) | none |
| user_interests | own | own | own |
| communities, community_tags | all | authenticated (P1) | creator |
| memberships | all | own, **role = 'member' only** | delete own |
| posts, post_tags | all | author = self | delete own |
| post_reactions, impressions, feedback | own | own | delete own reactions |
| collections | all | owner = self | owner |
| collection_items | approved, or own, or curator of the community | `added_by = self` and `status = 'pending'` (personal-owner items `approved`) | **none** (server only) |
| contributions | all (public attestations) | none | none (server only) |
| reports | none | own | none |
| wallet_nonces | none | none | none (server only) |

### 10.2 Threats and controls

| Threat | Control |
|---|---|
| Client forges curator role | Role insert restricted to `member`; server re-checks curator on every approval |
| Self-approval for credit | Server check + `decided_by <> added_by` constraint |
| Relayer key leak | Server-only env, never `VITE_`-prefixed; testnet-only key with minimal balance; `setAttestor` rotation |
| Signature replay | Single-use nonce, 10-min expiry, bound to user id |
| Wallet impersonation | Must sign with that wallet; unique address constraint |
| XSS | Plain-text rendering, no `dangerouslySetInnerHTML`, no markdown HTML |
| Malicious image/links | `https` only for images, `rel="noopener noreferrer"`, `referrerpolicy="no-referrer"` |
| Abuse/spam | Length limits, rate limit, report button (P1) |
| Service-role exposure | Used only inside functions; verified by searching the built bundle before launch |

---

## 11. Design system ("Field Guide")

A warm, editorial atlas feel: paper-like background, ink text, coloured **threads** per interest. Deliberately unlike Instagram/Reddit/TikTok.

### 11.1 Tokens

```css
:root {
  --paper:#F7F2E8; --paper-2:#EFE8D8; --ink:#1B1712; --ink-2:#5B5448; --line:#D9D0BC;

  /* thread colours: one per interest, used for card accents and graph lines */
  --clay:#B8452E;   /* primary action */
  --saffron:#D9942A; --moss:#4F7A57; --indigo:#3347A8;
  --rose:#C0527E;   --teal:#2A8C8C;  --plum:#7A4A7A;

  --onchain:#836EF9;   /* reserved ONLY for verified/onchain UI */

  --radius:6px;
  --shadow-hard:3px 3px 0 var(--ink);
}
:root[data-theme="dark"] {
  --paper:#14110D; --paper-2:#1E1A14; --ink:#F2EBDD; --ink-2:#A89F8E; --line:#3A3326;
}
```
Verify contrast of text and buttons with a contrast checker before shipping.

### 11.2 Typography
Fraunces (display serif) for headlines; DM Sans or Inter for body; system monospace for metadata chips and the why-stamp. Load via font packages or Google Fonts with fallbacks.

### 11.3 Signature elements
| Element | Behaviour |
|---|---|
| **TagSticker** | Chip; on select fills with its thread colour with a 150 ms press animation |
| **WhyStamp** | Slightly rotated mono chip: `BECAUSE · STREETWEAR + PHOTOGRAPHY` |
| **FeedCard** | Flat, 1 px ink border, hard offset shadow that shrinks on hover, thread-colour band on top, large image |
| **VerifiedSeal** | Small `--onchain` purple seal "Verified · on Monad" linking to the explorer |
| **Threads** | Thin SVG lines linking related tags on culture pages; full culture map is P1 |

### 11.4 Layout and motion
Mobile-first; bottom nav on phones, top nav on desktop; max content width ~1100 px. Motion only for selection, hover and page enter; honour `prefers-reduced-motion`.

### 11.5 Copy and imagery rules
"Exploring" not "My cultures"; "Contribute" and "Verified contribution", avoiding "mint", "wallet", "web3" in primary UI. No flags or decorative cultural clip-art; cultural identity appears through community content and sourced images, never UI decoration.

---

## 12. Testing and quality

| Layer | Approach |
|---|---|
| Contract | Foundry tests (SC-06) |
| SQL | Seed two test users with known interests; assert feed order and weight changes by hand with SQL |
| Functions | Manual calls with curl/REST client for each error path (401, 403, 409, idempotent re-approve) |
| UI | Manual SRS §9 script on a real phone + desktop; no automated e2e in v1 |
| Pre-launch | Search built JS for service-role/relayer key strings; run Lighthouse once on Home |

Nothing has been run yet; record real results in the README as they happen.

---

## 13. Failure modes summary

| Scenario | User impact | Mitigation |
|---|---|---|
| Supabase paused / down | App unusable | Warm project; smoke test Oct 12; demo video |
| Monad RPC rate-limited/down | Verification delayed; `/verify` fails | Fallback to second public RPC; DB shows `submitted`; demo video |
| Testnet reset | Old tx links break | Redeploy script + reset SQL |
| Relayer unfunded | Approvals not attested | Balance pre-check + faucet top-up |
| Empty feed for odd interest mix | Looks broken | Editorial fallback (FEED-08) |
| Wallet connect fails on phone | Can't link | Test on Oct 5; document supported wallets |



