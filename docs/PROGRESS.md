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
- Culture taxonomy data (`supabase/seed/tags.json` and `supabase/seed/edges.json` with 60+ tags and 100+ topic edges).
- Idempotent database seeding script (`scripts/seed.ts` via `npm run seed`).
- Onboarding flow (`/onboarding`) with interest picker, min 3 / max 10 selections, and user interest seeding.
- `TagSticker` component with thread color animation and reduced motion support.
- Explore page tag directory grouped by kind with search filter.
