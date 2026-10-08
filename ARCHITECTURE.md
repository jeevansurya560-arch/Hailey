# HAILEY — ARCHITECTURE & CODEBASE STRUCTURE GUIDE

Welcome to the **Hailey** codebase. Hailey is an autonomous cultural atlas and living field guide built with React 19, Vite 8, Supabase (PostgreSQL with Row Level Security), and Monad EVM onchain attestation.

For the in-depth architectural specification, see [docs/MVP_ARCHITECTURE.md](docs/MVP_ARCHITECTURE.md).  
For the migration audit and verification evidence, see [docs/MVP_STRUCTURE_MIGRATION.md](docs/MVP_STRUCTURE_MIGRATION.md).

---

## 1. High-Level Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (src/)                           │
│  Features: auth, onboarding, feed, posts, culture, etc.     │
│  UI & Layout: components/ui, components/layout              │
│  Client Libraries: lib/supabase, lib/wallet, lib/utils      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVERLESS GATEWAY (api/)                   │
│  Thin Vercel / Vite adapters delegating to server routes     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (server/)                       │
│  Routes: server/api/routes/                                 │
│  Middleware: server/api/middleware/                         │
│  Security: server/security/ (validation, authorization)     │
│  Services: server/services/ (payments, tickets, markets)    │
│  Blockchain: server/blockchain/ (relayer, contracts)        │
│  Background Jobs: server/jobs/ (attestation worker)         │
│  Admin Config: server/config/ (supabaseAdmin)               │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      DATABASE (supabase/)    │ │   BLOCKCHAIN (contracts/)  │
│  PostgreSQL + Row-Level      │ │  Monad EVM Smart Contracts │
│  Security Policies (RLS)     │ │  HaileyContributions.sol   │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Directory Structure Overview

```
Hailey/
│
├── src/                             # Client-side React 19 application
│   ├── app/                         # Application root, routing, and providers
│   │   ├── App.jsx                  # Root shell container
│   │   ├── router.jsx               # Central React Router configuration
│   │   └── providers/               # AppProviders (QueryClient, Auth, Wagmi, RainbowKit)
│   ├── components/                  # Domain-agnostic reusable UI
│   │   ├── ui/                      # Primitive design system (TagSticker, etc.)
│   │   └── layout/                  # Global structural layout (AppShell, etc.)
│   ├── features/                    # Feature-First modules (self-contained)
│   │   ├── auth/                    # Authentication (AuthPage, ProtectedRoute, useAuth)
│   │   ├── onboarding/              # 3-step onboarding flow (OnboardingPage)
│   │   ├── feed/                    # Personalized feed & Why explainability (HomePage, FeedCard)
│   │   ├── posts/                   # Post creation and detail (PostDetailPage, PostCard, PostComposer)
│   │   ├── culture/                 # Culture taxonomy graph & exploration (CulturePage, ExplorePage)
│   │   ├── festivals/               # Festivals and live events
│   │   ├── communities/             # Cultural collectives (CommunitiesPage, CommunityPage)
│   │   ├── collections/             # Archival collections & proposals (CollectionDetailPage, Modals)
│   │   ├── profile/                 # Contributor and curator profile (ProfilePage)
│   │   ├── creators/                # Creator tools & registry
│   │   ├── search/                  # Atlas tag search & filtering
│   │   ├── wallet/                  # Web3 connection & signing (WalletConnectButton, LazyWalletSection)
│   │   ├── verification/            # Onchain proof verification (/verify)
│   │   ├── payments/                # Paid curation & curator tipping
│   │   ├── ticketing/               # Wallet-native ticketing & entrance gating
│   │   └── markets/                 # Cultural prediction & outcome markets
│   ├── hooks/                       # Shared custom hooks
│   ├── lib/                         # Client utilities grouped by technology
│   │   ├── supabase/                # Browser Supabase client
│   │   ├── wallet/                  # Wagmi / RainbowKit chain configuration
│   │   └── utils/                   # Shared formatting and DOM helpers
│   ├── styles/                      # Tailwind CSS entrypoint
│   └── types/                       # Shared type definitions
│
├── server/                          # Secure backend execution layer
│   ├── api/
│   │   ├── routes/                  # Authoritative route handlers
│   │   └── middleware/              # Auth & session middleware
│   ├── services/                    # Core business domains
│   │   ├── payments/                # Curation economics & fee settlement
│   │   ├── tickets/                 # Ticket lifecycle & signature verification
│   │   └── markets/                 # Market lifecycle & payout settlement
│   ├── jobs/
│   │   └── attestation/             # Asynchronous attestation background worker
│   ├── blockchain/
│   │   └── relayer/                 # Monad Testnet gas-sponsored attestation relayer
│   ├── security/
│   │   ├── validation/              # Input sanitization and payload validators
│   │   └── authorization/           # Supabase JWT token verification
│   └── config/                      # Privileged admin configurations (supabaseAdmin)
│
├── api/                             # Thin Vercel serverless adapters delegating to server/api/routes/
├── shared/                          # Isomorphic environment-independent code
│   ├── contracts/                   # Smart contract ABIs (HaileyContributions.abi.js)
│   └── crypto/                      # Deterministic Keccak-256 hashing (hashing.js)
├── contracts/                       # Foundry smart contracts (HaileyContributions.sol)
├── supabase/                        # Database schema & migrations
│   ├── migrations/                  # Canonical SQL migrations (0001–0005)
│   └── seed/                        # Taxonomy graph, communities, and seed datasets
├── tests/                           # Multi-tier automated testing suite
│   ├── unit/                        # Isolated unit tests (ABI, validation, scoring, services)
│   ├── security/                    # Adversarial live RLS verification
│   ├── concurrency/                 # Race condition & double-spending defense tests
│   └── architecture/                # Client / server boundary enforcement tests
├── scripts/                         # Operational CLI scripts
│   ├── seed/                        # Database seeding engine
│   ├── verification/                # Deep verification scripts (chain, weights, feed, RLS)
│   └── maintenance/                 # Database vs onchain state reconciliation
└── docs/                            # Specifications, runbooks, and architecture records
```

---

## 3. Core Architectural Rules

1. **Feature-First Ownership**: Each domain feature in `src/features/<feature>/` owns its pages, components, hooks, and services. Shared components live in `src/components/` only when utilized by multiple unrelated features.
2. **Strict Client / Server Isolation**: Files in `src/` must **NEVER** import from `server/`, `api/`, or `node:*`. Communication occurs exclusively via HTTP/JSON requests to `/api/*`. Automated boundary tests enforce this rule in CI.
3. **Thin Serverless Gateway**: Files in root `api/*.js` are lightweight serverless adapters for Vercel and the Vite dev server, immediately delegating execution to modular controllers in `server/api/routes/`.
4. **Isomorphic Shared Core**: Only environment-independent logic (such as cryptographic hashing and contract ABIs) belongs in `shared/`. No secrets or server-only utilities may reside here.
5. **Centralized Schema History**: `supabase/migrations/` is the single source of truth for database schema and Row Level Security policies.
6. **Isolated Blockchain Logic**: Foundry smart contracts remain in `contracts/`. Private keys and signing logic reside solely in `server/blockchain/`.

---

## 4. Verification & Health Checks

Run all verification commands locally:

```bash
# Static lint analysis
npm run lint

# Automated test suite (unit, boundary, concurrency, adversarial RLS)
npm test

# Production build bundle
npm run build

# Specialized operational verifications
npm run check-approval    # Server validation & Keccak-256 integrity
npm run check-chain       # Live Monad Testnet mathematical consistency
npm run rls-check          # 14-point adversarial security audit
npm run seed               # Master database seed engine
```
