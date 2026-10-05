# Hailey — Antigravity Prompt Pack (Oct 4 → Oct 13)

Copy-paste prompts for building Hailey day by day with Google Antigravity.

**Companion docs (put them in `docs/` in your repo first):** `Hailey-PRD.md`, `Hailey-SRS.md`, `Hailey-System-Design.md`, `Hailey-Architecture.md`.

> **Honesty notes**
> - These prompts are untested. Expect to adjust them after Day 1.
> - Antigravity details below come from public guides checked on 2026-10-04. Menu labels and folder names differ between versions, so check your own UI.
> - The agent writes code. **You** still own the accounts, secrets, wallet signing, and every "does it really work" check.

---

## 0. One-time setup (≈20 min)

### 0.1 Workspace
1. Create an empty GitHub repo `hailey`, clone it, copy the four docs into `docs/`, open the folder in Antigravity.
2. Commit the docs (`git add docs && git commit -m "docs"`).

### 0.2 Antigravity settings
| Setting | Choice | Why |
|---|---|---|
| Development mode | **Agent-assisted** (balanced) | You review plans and risky actions; the agent still moves fast |
| Execution mode | **Planning Mode** for each day's main prompt; **Fast Mode** for small follow-up fixes | Planning produces an implementation plan you can correct *before* code is written |
| Artifact review policy | **Request review** | You approve each plan |
| Terminal policy | **Request review** (not auto-run) | Commands touch git, npm, and eventually keys |
| Deny list | `rm -rf`, `git push --force`, `git reset --hard`, anything that drops/resets a database | Safety net |

### 0.3 Add the always-on rule
Create a **workspace rule, Activation = Always On**, with the text from §1. Easiest path: use the Rules tab in the Agent panel so the IDE puts the file in the correct folder (some versions use `.agent/rules/`, others `.agents/rules/`). **Do not gitignore that folder.**

Keep the rule short. Long rules are sent on every prompt and burn quota.

### 0.4 Add one workflow
Create the workflow in §2 (`/day-wrap`). It ends each day with an honest status report.

### 0.5 Working method each day
1. Open a **new conversation**. (Continuity comes from `docs/PROGRESS.md`, not chat history.)
2. Do the **"YOU DO first"** items.
3. Paste the day's prompt. Read the **implementation plan** artifact; correct it; approve.
4. When done, run `/day-wrap`.
5. Check the **"You check"** list yourself, run what the agent couldn't, fix or log issues.
6. `git commit` and `git tag day-N`.

### 0.6 Rules of thumb
- Never paste real keys into chat. Keys go in `.env.local` (and Vercel env) only.
- If the agent fails the same thing twice, **stop**, paste the exact error back with the relevant file, and ask for a root-cause explanation before another fix.
- Small scoped runs beat "build the whole app". Usage limits apply to model use, so don't waste runs.
- The agent can't create Supabase/Vercel projects or sign wallet popups. Those are your steps.

---

## 1. Always-on rule (paste into Rules)

~~~text
# Hailey — project rules (always on)

You are helping one student developer ship "Hailey" by 2026-10-13. A public deployment is mandatory.

## Source of truth
Docs are in /docs: PRD, SRS, System Design, Architecture. Read only the sections the task names.
SQL, TypeScript and Solidity in the docs are UNTESTED SKETCHES. Verify them, fix errors, and tell me what you changed and why.

## Fixed stack (do not change or propose alternatives)
Vite + React 18 + TypeScript (strict), React Router, TanStack Query, Tailwind + shadcn/ui,
Supabase (Postgres, Auth, RLS, SQL functions), Vercel Functions in /api (Node, TypeScript),
viem + wagmi + RainbowKit, Solidity 0.8.24 + Foundry, Monad testnet (chain id 10143).
NEVER use Next.js, SSR, server components, FastAPI, ORMs, Redux, or any new framework/library without asking me first.

## Scope guard
Build only what today's prompt lists (P0 items). No P1/P2 features, extra pages, or "nice to haves".
If a requirement is unclear, ask. Do not invent behaviour, data, URLs, licences or facts.

## Security (non-negotiable)
- Secrets only in .env.local / Vercel env. Never in code, docs, logs, commits, or chat. Keep .env.example with placeholders.
- Only VITE_ variables reach the browser. NEVER prefix SUPABASE_SERVICE_ROLE_KEY or ATTESTOR_PRIVATE_KEY with VITE_.
- Every table has RLS enabled with explicit policies (System Design §10.1).
  The service-role client is used only in /api, /server and /scripts.
- Render user text as plain text. No dangerouslySetInnerHTML.
- Validate every /api input and verify the Supabase JWT on every /api call.

## Conventions
TypeScript strict; no `any` without a comment. Feature folders: src/features/*. Server-only code: /server.
Mobile-first (360px). Use CSS-variable design tokens; no hard-coded colours.
SQL changes: new numbered file in supabase/migrations/. Never edit a migration I already applied; add a new one.

## Working method
1. Plan first: files to create/change, risks, and what you cannot verify.
2. Work in small steps. After each step run `npm run typecheck` and `npm run build` (plus `forge test` or script checks when relevant).
3. NEVER claim something works unless you ran it. Quote the exact command and result.
   List anything you could not run (needs my Supabase/Vercel/wallet access) under "NOT VERIFIED".
4. Stop and ask when: a decision changes the stack or schema, a command needs my secrets or accounts,
   the same failure happens twice, or work drifts beyond today's scope.
5. No destructive commands (rm -rf, force push, DB reset, drop table) without asking.
6. At the end of the day update docs/PROGRESS.md: done / not done / known issues / next.
~~~

---

## 2. Workflow `/day-wrap`

~~~text
Wrap up today's work. Do not write new features.

1. Run: npm run typecheck, npm run lint, npm run build. If contracts changed, run forge test. Report the exact results.
2. List today's acceptance criteria from my prompt, each marked PASS / FAIL / NOT VERIFIED with evidence (command output or file path).
3. List files created or changed.
4. List anything untested or assumed, and anything I must do manually (Supabase SQL editor, Vercel env, wallet, browser checks).
5. Update docs/PROGRESS.md with sections: Done, Not done, Known issues, Decisions made, Next day.
6. Suggest a one-line git commit message.
Do not claim anything works that you did not run.
~~~

---

## 3. Daily prompts

### Day 1 — Sun Oct 4 — Scaffold, schema, auth, deployed skeleton
**Budget:** ~6 h · **Mode:** Planning

**YOU DO first**
1. Create a Supabase project. In Auth → email provider, turn **off** email confirmation. Put the project URL, anon key and service-role key into a local `.env.local` yourself (not in chat).
2. Check the repo has `docs/` committed.

**Prompt**
~~~text
Today is Day 1. Read docs/Hailey-Architecture.md §2, §3.3, §5, §6 and docs/Hailey-System-Design.md §3, §10.1, §11.1.

GOAL: a deployed skeleton: Vite+React+TS app with auth, theme tokens, routing shell, database migrations written, and a health function.

TASKS
1. Scaffold Vite + React + TypeScript IN THE REPO ROOT. docs/ already exists; do not delete it. If the tool refuses a non-empty folder, scaffold in a temp folder and move the files in. Turn on TypeScript strict. Add scripts: dev, build, typecheck, lint.
2. Install and configure (follow each tool's CURRENT official Vite guide; if a command fails, stop and report): Tailwind, shadcn/ui, React Router, TanStack Query, @supabase/supabase-js.
3. Create folders per Architecture §5 only where used today. Create src/lib/supabase.ts (reads VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) and .env.example listing EVERY variable from Architecture §6.1 with placeholder values.
4. Theme: create src/styles/tokens.css from System Design §11.1 (light mode now, dark tokens defined), map tokens into Tailwind, load Fraunces (display) and DM Sans (body) with fallbacks. Keep it minimal.
5. App shell: top nav on desktop, bottom nav on mobile (Home / Explore / Profile). Routes: /, /login, /explore, /u/:handle as simple placeholder screens.
6. Auth (SRS AUTH-01, 02, 03, 05): email+password sign up / sign in / sign out, session hook using onAuthStateChange, a ProtectedRoute helper. No social login.
7. Write (do NOT run) supabase/migrations/0001_schema.sql from System Design §3.2 plus the profile-bootstrap trigger from §3.3 (use security definer and a safe search_path), and 0002_rls.sql implementing the policy table in §10.1 with RLS enabled on EVERY table. Before writing, review the sketch DDL for syntax or logic errors and list the fixes you made.
8. Add vercel.json (SPA rewrite from Architecture §6.2) and api/health.ts that returns { ok: true }.

CONSTRAINTS: no Next.js; no extra pages; no features beyond the list.

VERIFY: run typecheck and build. Report results. Under NOT VERIFIED list: migrations applied, Supabase auth working, Vercel deploy.
~~~

**You check**
- `npm run build` passes.
- Migrations read sensibly (every table has `enable row level security`).

**YOU DO after**
1. Apply `0001` then `0002` in the Supabase SQL editor. Paste any error back to the agent in Fast Mode ("fix this migration by adding a new file, not editing the applied one" if already applied; otherwise edit).
2. Push to GitHub, import into Vercel, add the `VITE_*` env vars, deploy.
3. Confirm `/api/health` returns `{"ok":true}` on the live URL, and sign up on production. Check that a `profiles` row appeared.

---

### Day 2 — Mon Oct 5 — Contract, relayer, wallet connect (the risky day)
**Budget:** ~6 h · **Mode:** Planning

**YOU DO first**
1. Install Foundry; confirm `forge --version` is **v1.8 or newer** (Monad requirement).
2. Create a **brand-new wallet used only for this** (the relayer). Fund it from `https://faucet.monad.xyz`. Put its private key in `.env.local` as `ATTESTOR_PRIVATE_KEY`, and its public address as `ATTESTOR_ADDRESS`. Never reuse a wallet that holds anything real.
3. Create a free WalletConnect project ID; put it in `.env.local` as `VITE_WALLETCONNECT_PROJECT_ID`.
4. Add `MONAD_RPC_URL=https://testnet-rpc.monad.xyz` and `VITE_CHAIN_ID=10143`.

**Prompt**
~~~text
Today is Day 2. Read docs/PROGRESS.md, docs/Hailey-System-Design.md §7 and §8.2 (steps 11-14), docs/Hailey-Architecture.md §6.4.

GOAL: a tested contract, a deploy script, a relayer helper that can send one attestation, and wallet connect working on Monad testnet. Do NOT deploy the contract yourself and never print or log private keys.

TASKS
1. Create a Foundry project in /contracts. Implement HaileyContributions per System Design §7.1 (review it first; keep the behaviour; fix anything wrong and tell me).
2. Write Foundry tests (SRS SC-06): success increments count and emits Attested; non-attestor reverts; duplicate hash reverts; setAttestor only by current attestor. Run `forge test` and show the output.
3. Write contracts/script/Deploy.s.sol and scripts/redeploy-contract.sh. The script reads MONAD_RPC_URL and ATTESTOR_PRIVATE_KEY/ATTESTOR_ADDRESS from the environment and prints the deployed address. Follow Monad's current Foundry deployment docs. DO NOT RUN the deployment. Give me the exact command to run myself.
4. server/hash.ts: communityId and contentHash exactly as System Design §7.2. You MAY add vitest as a dev dependency. Write unit tests with fixed input/output vectors and run them.
5. server/relayer.ts using viem: wallet client from env, attest(contributor, communityId, contentHash, kind), a balance check against RELAYER_MIN_BALANCE, wait for the receipt with an 8 s timeout, returning { txHash, status: 'attested' | 'failed' | 'submitted' }.
6. scripts/send-test-attest.ts: a local-only script (no public endpoint!) that sends one test attestation to CONTRACT_ADDRESS and prints the tx hash and explorer URL.
7. Frontend wallet layer (src/features/wallet): define the Monad testnet chain with viem defineChain (Architecture §6.4), configure wagmi + RainbowKit, and LAZY-LOAD it so the Home route does not pay for wallet libraries. Add a ConnectButton on /u/:handle showing connected address and chain, prompting a network switch if wrong.

CONSTRAINTS: no new public API endpoints that send transactions. No keys in code.

VERIFY: forge test, vitest, typecheck, build. NOT VERIFIED: deployment, real tx, wallet connection on phone.
~~~

**You check**
- `forge test` passes (4 tests).
- Run the deploy command; copy the contract address into `.env.local` and Vercel (`CONTRACT_ADDRESS`, `VITE_CONTRACT_ADDRESS`).
- Run `send-test-attest`; open the tx on the explorer.
- **Test wallet connect on your phone** (a common failure point, so don't leave it until later).

**If it goes wrong:** if Foundry setup eats more than 90 minutes, deploy the same Solidity file from Remix and move on.

---

### Day 3 — Tue Oct 6 — Taxonomy, seed script, onboarding
**Budget:** ~6 h · **Mode:** Planning

**YOU DO first**
Confirm `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`. Decide your must-have cultures/genres (optional; the agent proposes a list for you to review).

**Prompt**
~~~text
Today is Day 3. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.2 (ONB) and §3.4 (CULT-02), docs/Hailey-System-Design.md §5.

GOAL: seeded culture graph and a working onboarding flow.

TASKS
1. Create supabase/seed/tags.json: at least 60 tags with slug, name, kind, parent (by slug), and a neutral, factual description of 200 characters or fewer. Cover: cultures/regions (e.g. African American, Latino, Indian, Japanese, Korean), music genres, fashion styles, food cuisines, art forms, film traditions, language/expression, heritage, internet culture. Hierarchy examples: African American -> Music -> Hip-Hop.
2. Create supabase/seed/edges.json: at least 100 tag edges, weights 0.3-0.9, symmetric where sensible. RULE: edges express TOPIC adjacency (e.g. Japan <-> Streetwear), never assumptions about demographic groups. Descriptions must avoid stereotypes. I will review every description.
3. scripts/seed.ts using the service-role key from .env.local: idempotent upserts for tags then edges (resolve slugs to ids). Add `npm run seed`. Run it TWICE and show row counts are identical after both runs.
4. Onboarding page (ONB-01 to ONB-05): tags grouped by kind, minimum 3 and maximum 10 selections, writes user_interests with weight 5 and source 'onboarding'. Redirect signed-in users with zero interests to /onboarding. Copy: "What are you curious about?" and "Exploring". NEVER label interests as identity ("My culture" is forbidden).
5. TagSticker component per System Design §11.3 (fills with a thread colour when selected, 150 ms press animation, respects prefers-reduced-motion).
6. /explore: tag directory grouped by kind with a client-side name filter (CULT-02).

VERIFY: seed run twice with counts; typecheck; build. For onboarding, give me a short manual test script. NOT VERIFIED: anything needing my browser session.
~~~

**You check**
- Read every tag description for accuracy and stereotypes. Edit the JSON yourself.
- Sign up a fresh user → forced to onboarding → can't continue with fewer than 3 → rows appear in `user_interests`.

---

### Day 4 — Wed Oct 7 — Communities, posts, reactions, weight triggers
**Budget:** ~6 h · **Mode:** Planning

**Prompt**
~~~text
Today is Day 4. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.5 (COMM-01 to 04), §3.6 (POST-01 to 05), docs/Hailey-System-Design.md §4.1, §10.1.

GOAL: communities, posts, reactions, and database triggers that update interest weights.

TASKS
1. supabase/migrations/0003_triggers.sql: bump_interests, on_reaction trigger, a membership-join trigger (+4 on each community tag), a feedback trigger (yes +1, no -2). Review the sketch in System Design §4.1 for bugs first (negative weights, conflicts, security definer + search_path) and list fixes. Weights never go below 0.
2. Extend scripts/seed.ts (idempotent): 3 demo accounts via the Supabase admin API (Hailey Editorial [is_editorial], demo contributor, demo curator), 8 communities with community_tags, a curator membership for the demo curator in at least one community, and 12 test posts with post_tags. Read demo passwords from env variables, not code.
3. Communities: list with member counts, join/leave, community page (header, posts; collections section stays empty for now).
4. Posts: composer (body 1-2000, optional https image URL, optional source URL, 1-5 tags, optional community), post detail page, author-only delete. Plain-text rendering only. Show media_credit and source line when present.
5. Reactions: like/save/hide with optimistic updates and rollback on error. A basic "newest posts" list on Home is fine as a surface for testing.
6. scripts/check-weights.ts: signs in as a test user via anon key, inserts a save and a like, then prints user_interests weights before and after. Run it and show output.

CONSTRAINTS: no comments, no search, no image upload.

VERIFY: typecheck, build, check-weights output. NOT VERIFIED: migration applied (I will apply it).
~~~

**You check**
- Apply `0003`. Run `npm run seed`. Save a post in the UI → weights rise in `user_interests` (Table editor).
- Try joining a community and check the weight change on its tags.

---

### Day 5 — Thu Oct 8 — Feed, "why", culture pages, feedback
**Budget:** ~6 h · **Mode:** Planning

**Prompt**
~~~text
Today is Day 5. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.3 (FEED-*), §3.4 (CULT-01, 03, 04), §3.10 (FDBK-01, 02), docs/Hailey-System-Design.md §4.2 to §4.6.

GOAL: the personalised feed with a truthful "why", exploration slots, culture pages, impressions and relevance prompts.

TASKS
1. supabase/migrations/0004_feed.sql: get_feed(p_limit, p_offset) and get_explore(p_limit) per System Design §4.2-4.4. Review the sketch (joins, `why` array slicing, security invoker with RLS, performance) and tell me what you changed. Provide an EXPLAIN-friendly version if you suspect slow plans.
2. Client: Home feed calls get_feed, then loads the full post rows by id PRESERVING the returned order. Pagination with "load more". Interleave one get_explore item at every 5th position. Hidden posts must never reappear. If the user has no positive weights, fall back to newest editorial posts and link to onboarding (FEED-08).
3. FeedCard with WhyStamp (mono chip, slight rotation, text like "BECAUSE · STREETWEAR + PHOTOGRAPHY"). The text MUST come from the `why` field returned by get_feed, never hard-coded or guessed.
4. useImpression hook (IntersectionObserver, 50% visible for 1 s) writing to `impressions` with ignore-duplicates, batched.
5. RelevancePrompt on cards where hash(user_id || post_id) mod 10 = 0 (stable across reloads). Store answers in `feedback` (unique per user/post).
6. Culture page /c/:slug: name, description, child tags, related tags (edges), top posts, linked communities, source line and Editorial label, and an "Add to exploring" toggle (CULT-01, 03, 04).
7. scripts/check-feed.ts: with two seeded test users with DIFFERENT interests, print the top 10 feed items and their `why` for each user, then simulate saving a post and print the feed again showing the change. Run it and show output.

VERIFY: typecheck, build, check-feed output. If the feed order looks wrong, explain using the score terms before changing code.
~~~

**You check**
- Two accounts with different interests get visibly different feeds.
- Save a post → reload → related posts rise. `why` names tags that the post actually has.

---

### Day 6 — Fri Oct 9 — Collections, proposals, curator approval (no chain yet)
**Budget:** ~6 h · **Mode:** Planning

**Prompt**
~~~text
Today is Day 6. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.7 (COLL-01 to 06), docs/Hailey-System-Design.md §6, §8.2 (steps 1-10), §10.

GOAL: collections, item proposals, and curator approve/reject through a server function. The blockchain call is NOT built today.

TASKS
1. server/auth.ts (verify the Supabase JWT from the Authorization header), server/supabaseAdmin.ts (service-role client), server/validate.ts (schema validation of inputs).
2. Collections UI: create (personal or in a community), collection page. Propose-item form: post reference, link + optional note, or note. Items in community collections start `pending`; personal items by the owner are approved immediately and create NO contribution.
3. Visibility (COLL-04): approved items visible to everyone; pending items only to the proposer and community curators. This must be enforced by RLS, not only by UI.
4. api/approve-item.ts implementing steps 1-10 of System Design §8.2: auth, load item, status must be pending (409 otherwise), caller must be a curator of the item's community (403), approver must not be the proposer (403). On approve: set status/decided_by/decided_at and create the contributions row (unique per item, ON CONFLICT DO NOTHING) with status 'submitted' if the contributor has a linked wallet else 'awaiting_wallet'. STOP THERE: leave a clearly marked TODO where the relayer call goes and return { attest: 'pending_implementation' }.
5. Curator UI on the collection page: pending list with Approve/Reject buttons calling the endpoint; show errors clearly.
6. scripts/check-approval.ts using the demo contributor and demo curator accounts: non-curator -> 403; self-approval -> 403; approve -> contributions row created; approve again -> 409 and still exactly one row. Run it (against local `vercel dev` if available) and show output.

CONSTRAINTS: no relayer calls, no wallet linking today.

VERIFY: typecheck, build, check-approval output. NOT VERIFIED: anything requiring deployed env vars.
~~~

**You check**
- Two browser profiles (contributor + curator) can run propose → approve in the UI.
- Add the server env vars to Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, etc.) before testing in production.

---

### Day 7 — Sat Oct 10 — Attestation, wallet link, verified seal, profile, `/verify`
**Budget:** ~7 h · **Mode:** Planning

**YOU DO first**
Make sure the contract address and the relayer vars are set in Vercel, and the relayer wallet still has testnet MON.

**Prompt**
~~~text
Today is Day 7. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.7b (WAL-*), §3.8 (CHAIN-01 to 07), §3.9 (PROF-*), docs/Hailey-System-Design.md §7 and §8.1-8.2.

GOAL: finish the hero flow: approval produces a Monad transaction, the UI shows a Verified seal, and /verify reads from the chain.

TASKS
1. Finish api/approve-item.ts steps 11-15: balance guard (503 with a clear message), call server/relayer.attest for contributors with a linked wallet, store tx_hash, wait up to 8 s, then set attested / failed / leave submitted. Re-calls must never send a second transaction for the same item (check existing contribution row and tx_hash first).
2. api/wallet.ts with action "nonce" and "link" (System Design §8.1): single-use nonce, 10-minute expiry bound to the user id, signature verified with viem, address stored lowercase, unique across profiles (409 otherwise).
3. Wallet link UI on the profile page using wagmi's sign-message hook. For contributors without a wallet, show: "Link a wallet to get this contribution verified."
4. VerifiedSeal component (colour var(--onchain), text "Verified · on Monad") linking to the explorer tx via VITE_EXPLORER_URL. Status chips for pending / approved / awaiting wallet / submitted / failed.
5. Profile page /u/:handle (PROF-01 to 03): display name, Exploring tags, communities, contributions with seals, per-community counts. Wallet address shown only if linked.
6. /verify/:address: reads count(address, communityId) for each community straight from the contract with viem (use multicall if available). Never scan logs. Community names come from the DB; counts come ONLY from the chain.
7. scripts/check-chain.ts: for a given address, compare the on-chain counts with the DB's attested contributions and print any mismatch.

CONSTRAINTS: do NOT build claim-contributions (P1). Do not automate wallet extension popups; instead give me a numbered manual test script for the signing steps.

VERIFY: typecheck, build, check-chain output. NOT VERIFIED: signing flow, production env.
~~~

**You check (run SRS §9 steps 7–11 on production, with a phone)**
- Link wallet → propose item → approve as curator → seal appears → explorer shows a successful tx.
- Re-approve returns an error and sends no second tx.
- `/verify/<address>` logged out shows the correct count.

---

### Day 8 — Sun Oct 11 — Seed content, security audit, mobile pass, freeze
**Budget:** ~7 h · **Mode:** Planning, then Fast for fixes · **No new features today**

**YOU DO first**
Decide where seed images come from (Wikimedia Commons or other clearly licensed sources only). Plan to personally review every seeded post.

**Prompt**
~~~text
Today is Day 8. Read docs/PROGRESS.md, docs/Hailey-SRS.md §3.11 (SEED-*), §5.2, §5.4, docs/Hailey-System-Design.md §10.

GOAL: realistic seed content, a security audit, mobile polish, and a clean feature freeze. NO new features.

TASKS
1. Seed content: create supabase/seed/posts.json with at least 60 posts, 8 communities' worth of spread, and 6 collections with approved items, all authored by the Hailey Editorial account and flagged is_editorial. HARD RULES:
   - Text must be original, short, factual and neutral. No claim you cannot support with a source.
   - Every heritage/educational post needs a source_url that you actually opened with the browser tool. Do not invent URLs.
   - Images: only from sources you can confirm are public domain or openly licensed (e.g. Wikimedia Commons). Record the file page URL and licence in media_credit. For each image URL, verify it loads (HTTP 200). If you cannot verify an image or licence, set media_url null and list it in docs/SEED-REVIEW.md.
   - No stereotypes, no flags or clip-art as stand-ins for culture.
   Produce docs/SEED-REVIEW.md listing every post with its source URL, image URL, licence and a "verified: yes/no" column. I will review it.
2. Make `npm run seed` idempotent for all content. Run it twice and show identical counts.
3. scripts/rls-check.ts with two normal users and an anonymous client. Attempt and report expected vs actual for: reading another user's interests; inserting a curator membership for yourself; updating collection_items directly; inserting into contributions; reading wallet_nonces; creating a post as another author; reading pending items you should not see; deleting another user's post. Print a table. Any mismatch is a bug to fix with a NEW migration.
4. Bundle check: build, then search dist/ for the service-role key value, the relayer key, and any env name that should not appear. Report the result. Also confirm no secret uses the VITE_ prefix.
5. Mobile pass at 360 px using the browser tool: screenshot Home, a culture page, a community, a collection, profile, /verify. Fix horizontal overflow, tap targets under 40 px, missing alt text, missing focus styles. Respect prefers-reduced-motion.
6. Fix issues listed in docs/PROGRESS.md "Known issues" that block the hero flow. Anything else goes to a "Post-hackathon" list; do NOT fix it today.

VERIFY: seed twice, rls-check table, bundle check result, typecheck, build.
~~~

**You check**
- Open `docs/SEED-REVIEW.md` and manually click ~15 links and licences. Remove anything dubious.
- Run the full SRS §9 script on production with a **fresh account on a phone**.
- At the end of the day: **feature freeze**. Tag `v1-freeze`.

---

### Day 9 — Mon Oct 12 — README, demo, final smoke test
**Budget:** ~5 h · **Mode:** Planning (docs) then Fast

**Prompt**
~~~text
Today is Day 9. Read docs/PROGRESS.md, docs/Hailey-PRD.md §6 and §10, docs/Hailey-Architecture.md §7 and §9.

GOAL: submission-ready documentation. Only P0 bug fixes in code; no features.

TASKS
1. README.md: what Hailey is (3 lines), live URL placeholder, the hero flow, architecture diagram (Mermaid) based on Architecture §3.2, tech stack, local setup, environment variables (names only, no values), how to deploy, how to redeploy the contract if the testnet resets, demo accounts and how to use them, and a "Limitations" section stating plainly: testnet only, contract unaudited, single relayer trust model, recommendation is a transparent heuristic (not machine learning), no account deletion.
2. A "Tests" section listing ONLY tests that actually exist and passed on your last run, with the real commands and results. Do not list anything you did not run.
3. docs/DEMO.md: a 3-minute demo script following the hero flow (onboard -> feed with why -> join -> contribute -> curator approves -> verified seal -> /verify). Per step: what to click, what to say (one sentence), approximate seconds, and what to do if something fails.
4. docs/SUBMISSION.md: a draft submission text with a short description, the problem, the "Why onchain?" answer (PRD §10, including the honest limitations), and a "What's next" list.
5. Clean-clone check: in a fresh temporary directory run `npm ci && npm run typecheck && npm run build` and report the exact results.
6. Fix only bugs that break the hero flow (list them first, ask me before fixing anything else).

VERIFY: clean-clone results. List anything you could not verify.
~~~

**You do after**
1. Re-run SRS §9 end to end on production, on a phone, as a brand-new user.
2. Check the relayer still has MON; check Supabase isn't paused.
3. Record the demo video (also your fallback if the testnet or RPC misbehaves on judging day).
4. Fill in the live URL and repo link in README/SUBMISSION.

---

## 4. Tuesday Oct 13 — submission day (no code)

- [ ] Submit **in the morning**, not at the deadline.
- [ ] Open the live URL in a private window on your phone; run the hero flow once.
- [ ] Explorer link for the contract and one attestation tx works.
- [ ] Repo is public (if required) and contains no secrets (`git log -p | search for key fragments`).
- [ ] Demo video link works logged out.
- [ ] Re-check the hackathon rules (network, video length, repo requirements).

---

## 5. Troubleshooting prompts (Fast Mode)

**Migration error**
~~~text
This migration failed in the Supabase SQL editor. Error: <paste exact error>.
Identify the root cause, tell me which statement is wrong, and give me a corrected NEW migration file (do not edit the applied one unless I say it was never applied). Do not change unrelated tables.
~~~

**RLS blocking something**
~~~text
This client call returns <error / empty result>: <paste code>. Policies on <table> are in supabase/migrations/0002_rls.sql. Explain which policy blocks it and why, then propose the minimum policy change. Do NOT disable RLS and do NOT use the service-role key in the browser.
~~~

**Stuck after two attempts**
~~~text
Stop changing code. Summarise: what you tried, what each attempt changed, the exact error, and your top 2 hypotheses with how to test each cheaply. Wait for me.
~~~

**Agent drifting out of scope**
~~~text
Revert anything not listed in today's TASKS. Compare your changes to the task list and show me a table: task item -> file(s) changed -> done / not done. Then stop.
~~~



