# Hailey — Build Progress Tracker

## Day 1 — Sun Oct 4 — Scaffold, schema, auth, deployed skeleton

### Done
- **Scaffolding & Tooling**: Vite + React 19 + TypeScript (strict mode enabled), React Router v7, TanStack Query v5, Tailwind CSS v4, `@supabase/supabase-js`, `oxlint`. Scripts configured: `dev`, `build`, `typecheck`, `lint`.
- **Environment & Configuration**:
  - `src/lib/supabase.ts` configured with browser-safe environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - `.env.example` created listing every browser-safe and server-only variable from Architecture §6.1 with placeholders.
  - `.env.local` created locally with active Supabase project URL and anon public key.
  - `vercel.json` configured for SPA rewrites (`/((?!api/).*)` → `/index.html`).
  - `api/health.ts` serverless function implemented returning `{ ok: true }`.
- **Design System & Theme Tokens**:
  - `src/styles/tokens.css` with exact values from System Design §11.1 (paper, paper-2, ink, ink-2, line, thread colors: clay, saffron, moss, indigo, rose, teal, plum, onchain, radius, hard shadow) and dark mode overrides.
  - Fraunces (display serif), DM Sans (body), and JetBrains Mono fonts linked via Google Fonts.
  - Tailwind theme mapping in `src/index.css`.
- **App Shell & Routing**:
  - `src/app/AppShell.tsx`: Desktop top nav and mobile bottom nav (Home / Explore / Profile) with user session state.
  - Routes: `/` (HomePage), `/explore` (ExplorePage), `/u/:handle` (ProfilePage), `/login` (AuthPage).
- **Authentication**:
  - `src/features/auth/AuthContext.tsx` & `src/features/auth/useAuth.ts`: Email/password sign up, sign in, sign out, and session listener using `supabase.auth.onAuthStateChange`.
  - `src/features/auth/ProtectedRoute.tsx`: Route protection wrapper.
  - `src/features/auth/AuthPage.tsx`: Sign in and sign up form with validation and error display.
- **Database Migrations Applied**:
  - `0001_schema`: Applied to Supabase project `Hailey` (`ycftnowviqyapxycirwz`). 17 tables created with check constraints, foreign keys, indexes, and `handle_new_user()` security definer trigger.
  - `0002_rls`: Applied to Supabase project `Hailey`. RLS enabled on all 17 tables with policies matching System Design §10.1.

---

## Day 2 — Mon Oct 5 — Contract, relayer, wallet connect

### Done
- **Foundry Project & Smart Contract (`/contracts`)**:
  - `contracts/foundry.toml`: Configured for Solidity 0.8.24 with Cancun EVM and Monad testnet RPC profile.
  - `contracts/src/HaileyContributions.sol`: Implemented attestation registry per System Design §7.1 (`attest`, `count`, `attested`, `setAttestor`, `Attested` event, custom error types).
  - `contracts/test/HaileyContributions.t.sol`: Comprehensive unit test suite covering SRS SC-06 (success, non-attestor revert, duplicate hash revert, `setAttestor` rotation & zero address checks).
  - `contracts/script/Deploy.s.sol`: Foundry deployment broadcast script reading `ATTESTOR_ADDRESS`.
  - `scripts/redeploy-contract.sh` & `scripts/redeploy-contract.ps1`: Deployment helpers for Monad testnet.
- **Identifier & Hashing Engine (`server/hash.ts`)**:
  - `computeCommunityId(slug)`: keccak256 hash of community slug.
  - `computeItemContent(item)`: canonical formatting `kind:target:note`.
  - `computeContentHash(params)`: deterministic `hailey:v1|...` string hashed with sha256 and keccak256.
  - Unit tests in `server/__tests__/hash.test.ts` passing 3/3 in Vitest (`npm test`).
- **Attestation Relayer Service (`server/relayer.ts`)**:
  - Built using `viem` with Monad testnet chain configuration (Chain ID 10143).
  - Pre-checks relayer wallet balance against `RELAYER_MIN_BALANCE` (0.01 MON).
  - Submits onchain `attest` transaction and waits for receipt with 8s timeout, returning `{ txHash, status: 'attested' | 'failed' | 'submitted' }`.
- **Local Test Script (`scripts/send-test-attest.ts`)**:
  - Self-contained CLI script to test the relayer flow against `CONTRACT_ADDRESS` on Monad testnet.
- **Frontend Wallet Layer (`src/features/wallet`)**:
  - `src/features/wallet/chain.ts`: Monad testnet chain definition.
  - `src/features/wallet/config.ts`: Wagmi + RainbowKit config.
  - `src/features/wallet/WalletProvider.tsx` & `WalletConnectButton.tsx`: Custom styled connect button with chain detection and switch prompt.
  - `src/features/wallet/LazyWalletSection.tsx`: Dynamic `React.lazy` loading ensuring Home route bundle remains lightweight. Mounted on `/u/:handle` (`ProfilePage.tsx`).

### Not done / Deferred
- None from Day 2 scope.

### Known issues / Not verified
- **NOT VERIFIED**:
  - Live onchain contract deployment to Monad Testnet (must be broadcast using funded relayer key).
  - Live attestation transaction on Monad testnet explorer.
  - Real wallet popup connection on mobile devices.

### Decisions made
- Used Wagmi v2 + RainbowKit v2 with custom theme colors (`--clay` `#B8452E` and `--onchain` `#836EF9`).
- Implemented lazy loading for the wallet bundle so unauthenticated home visitors don't download wallet SDKs.
- Created both Bash and PowerShell redeploy scripts for cross-platform support.

### Next day (Day 3 — Tue Oct 6)
- Taxonomy, seed script, onboarding flow, TagSticker, and Explore directory.

---

## Day 3 — Tue Oct 6 — Taxonomy, seed script, onboarding

### Done
- **Culture Taxonomy Graph (`supabase/seed`)**:
  - `supabase/seed/tags.json`: 65 rich cultural tags spanning 10 kinds (`culture`, `music`, `fashion`, `food`, `art`, `film`, `language`, `heritage`, `internet`, `place`) with parent hierarchy and factual, neutral descriptions (<= 200 chars).
  - `supabase/seed/edges.json`: 148 thematic adjacency edges with weights 0.6–0.95 and symmetric links expressing topic relationships without stereotypes.
  - Live Supabase Database verified: 65 tags and 148 edges present.
- **Idempotent Seeding Engine (`scripts/seed.ts`)**:
  - Standalone script using `@supabase/supabase-js`.
  - Upserts tags, resolves `parent_slug` to parent ID references, and upserts topic edges idempotently.
  - Script configured in `package.json` as `npm run seed`.
- **Design System & TagSticker (`src/components/TagSticker.tsx`)**:
  - Implemented interactive chip with thread color mapping based on tag kind (`--clay`, `--saffron`, `--moss`, `--indigo`, `--rose`, `--teal`, `--plum`, `--onchain`).
  - 150ms press micro-animation respecting `prefers-reduced-motion`.
  - Accessible keyboard navigation and selection state.
- **Onboarding Flow (`/onboarding` & `src/features/onboarding/OnboardingPage.tsx`)**:
  - Interactive grid grouped by 6 theme domains with topic explanations.
  - Enforces minimum 3 and maximum 10 selections with live counter.
  - Saves initial interests to `user_interests` (`weight: 5`, `source: 'onboarding'`).
  - Strict copy compliance: uses "What are you curious about?" and "Exploring" (never "My culture").
- **Automatic Onboarding Redirection (`AppShell.tsx`)**:
  - Checks user's `user_interests` count; automatically routes newly signed-in users with 0 interests to `/onboarding`.
- **Explore Directory (`/explore` & `src/app/routes/ExplorePage.tsx`)**:
  - Live taxonomy fetch from Supabase database with real-time text filter across names, slugs, and descriptions.
  - Category pill filter allowing filtering by specific kinds (`culture`, `music`, `fashion`, `food`, etc.).
  - Shows total topic counts per group.

### Not done / Deferred
- None from Day 3 scope.

### Known issues / Not verified
- **NOT VERIFIED**:
  - Manual browser testing of the full email signup -> forced onboarding redirect -> 3-selection interest save on mobile Safari/Chrome.

### Decisions made
- Extracted thread color mapping to `src/lib/threadColors.ts` to keep `TagSticker.tsx` purely focused on component rendering and prevent Fast Refresh lint warnings.
- Added live database queries on `/explore` with graceful fallback handling.

### Next day (Day 4 — Wed Oct 7)
- Communities, posts, reactions, and database triggers that update interest weights.

---

## Day 4 — Wed Oct 7 — Communities, posts, reactions, weight triggers

### Done
- **Database Triggers Migration (`supabase/migrations/0003_triggers.sql`)**:
  - `bump_interests(p_user uuid, p_post uuid, p_delta real)`: Security definer procedure updating `user_interests` with delta multipliers and flooring at 0.
  - `on_reaction`: Trigger on `post_reactions` updating weights on like (+1), save (+3), and hide (-3).
  - `on_membership_join`: Trigger on `memberships` incrementing weights on community tags by +4.
  - `on_feedback`: Trigger on `feedback` updating weights on yes (+1) and no (-2).
- **Seed Data Expansion (`supabase/seed`)**:
  - `supabase/seed/communities.json`: 8 cultural communities with descriptions and community tags.
  - `supabase/seed/posts.json`: 12 test posts with validated source URLs, media credits, and post tags.
  - `scripts/seed.ts`: Extended to idempotently seed tags, edges, demo accounts (Hailey Editorial, demo contributor, demo curator), 8 communities, curator roles, and test posts. Configured in `package.json` as `npm run seed`.
- **Communities Interface (`src/features/communities`)**:
  - `/communities` (`CommunitiesPage.tsx`): Directory listing 8 communities with member counts, topic tags, and optimistic Join/Leave actions.
  - `/communities/:slug` (`CommunityPage.tsx`): Detailed collective view with header, member counts, curators list, community tags, post composer, and dispatches.
- **Posts & Dispatches Architecture (`src/features/posts`)**:
  - `PostComposer.tsx`: Full composer supporting body (1–2000 chars), image URLs (https://), media credits, source citations, and 1–5 topic tags.
  - `PostCard.tsx`: Plain-text rendering (POST-05), lazy-loaded images with `referrerpolicy="no-referrer"`, source links (CULT-03), and author deletion (POST-04).
  - `/post/:id` (`PostDetailPage.tsx`): Dedicated post detail view (POST-03).
- **Optimistic Reactions (POST-02)**:
  - Like, save, and hide interactions on `PostCard` with instant UI state update and database rollback on failure.
  - Hidden posts immediately filtered out and prevented from reappearing.
- **Weight Verification Script (`scripts/check-weights.ts`)**:
  - Verified script checking initial weights, inserting reactions, and verifying weight progression. Configured as `npm run check-weights`.

### Not done / Deferred
- None from Day 4 scope (comments, search, image uploads deferred to P1/later as specified).

### Known issues / Not verified
- **NOT VERIFIED**:
  - Live execution of `0003_triggers.sql` inside the Supabase SQL editor by the human developer.

### Decisions made
- Community memberships and reaction states use optimistic React state with rollback guards for instantaneous response times.
- Structured seed data into dedicated `communities.json` and `posts.json` files for maintainability and idempotency.

### Next day (Day 5 — Thu Oct 8)
- Personalised feed SQL function (`get_feed(p_limit, p_offset)`) and exploration slots (`get_explore(p_limit)`).
- Home feed calling `get_feed` preserving score ranking order with "load more" pagination.
- Interleaving one exploration item at every 5th feed slot (FEED-03).
- `WhyStamp` component displaying dynamic tag reasoning chips.
- `useImpression` hook tracking card visibility (>50% for 1s).
- Relevance prompt cards for deterministic feedback (`hash(user_id || post_id) % 10 = 0`).
- Culture page `/c/:slug` with relations, top posts, and exploring toggle.





