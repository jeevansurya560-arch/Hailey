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

### Not done / Deferred
- None from Day 1 scope.

### Known issues / Not verified
- **NOT VERIFIED**:
  - Live Vercel deployment and `/api/health` live endpoint check (requires git push + Vercel deploy).
  - Browser auth interaction with live Supabase email provider.

### Decisions made
- Applied both schema and RLS migrations directly via Supabase tool connection.
- Used Tailwind CSS v4 `@theme` integration with CSS variables for dynamic design tokens.
- Separated `AuthContext` definitions and `useAuth` hook into clean modules for fast refresh compliance.
- Ensured strict TypeScript compliance (`tsc -b`) and zero linter warnings (`oxlint`).

### Next day (Day 2 — Mon Oct 5)
- Foundry project setup in `/contracts` for `HaileyContributions.sol`.
- Contract unit tests (`forge test` for SC-06).
- Attestor relayer helper (`server/relayer.ts`), identifier hashing (`server/hash.ts`), and test script (`scripts/send-test-attest.ts`).
- Lazy-loaded frontend wallet layer with wagmi + RainbowKit on Monad testnet (Chain ID 10143).
