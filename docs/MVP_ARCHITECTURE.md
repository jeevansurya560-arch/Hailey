# HAILEY — MVP ARCHITECTURE BASELINE & DESIGN SPECIFICATION

**Repository:** https://github.com/jeevansurya560-arch/Hailey  
**Author:** Principal Software Architect  
**Status:** Baseline Documented — Pre-Refactor Audit  

---

## 1. Executive Summary

Hailey is an autonomous cultural atlas and living field guide built on React 19, Vite 8, Supabase (PostgreSQL with Row Level Security), and Monad EVM blockchain attestation. 

Prior to this folder structure refactor, the functional code is sound (58/58 tests passing, 0 Oxlint warnings, 100% build pass), but the directory layout exhibits architectural debt from rapid development:
- Page components are split between `src/app/routes/` and arbitrary feature folders.
- Component ownership is inconsistent: some feature components sit at the root of feature directories (e.g., `FeedCard.jsx`, `PostCard.jsx`, `LazyWalletSection.jsx`) while others sit in subdirectories.
- Root-level serverless functions in `api/` directly execute logic alongside `server/`, lacking a clean layered `Route → Middleware → Service → Repository` separation.
- Client utilities (`src/lib/`) lack clear domain groupings (`lib/supabase/`, `lib/wallet/`, `lib/utils/`).

This document records the **exact pre-refactor state** and details the target **Feature-First Architecture** to scale future growth cleanly.

---

## 2. Current Pre-Refactor Directory Inventory

### 2.1 Root Structure
```
Hailey/
├── api/                     # Root Vercel serverless handlers (approve-item, health, markets, payments, tickets, wallet)
├── contracts/               # Foundry smart contracts (HaileyContributions.sol, Deploy.s.sol, tests)
├── docs/                    # Specs, plans, testing reports (FINAL-VERIFICATION.md, PRD, SRS)
├── public/                  # Static web assets (favicon.svg, icons.svg)
├── scripts/                 # Maintenance, verification, seed, reconciliation scripts
├── server/                  # Backend business logic, relayer, jobs, services
├── shared/                  # Isomorphic shared code (contracts/ABI, crypto/hashing)
├── src/                     # Frontend client code (React, Vite, Tailwind CSS)
├── supabase/                # Database migrations (0001-0005) and seed datasets
├── tests/                   # Architecture, concurrency, security, and unit tests
├── package.json             # Scripts and dependencies
├── vite.config.js           # Vite build & local API proxy plugin
└── vercel.json              # Vercel deployment rewrites
```

### 2.2 Client Pre-Refactor Structure (`src/`)
```
src/
├── app/
│   ├── AppShell.jsx         # Global shell (navigation bar, mobile drawer, security status)
│   └── routes/              # Centralized route components (VIOLATES Feature-First)
│       ├── CulturePage.jsx
│       ├── ExplorePage.jsx
│       ├── HomePage.jsx
│       ├── PostDetailPage.jsx
│       ├── ProfilePage.jsx
│       └── VerifyPage.jsx
│
├── assets/
│   └── hero.png
│
├── components/              # Generic components
│   └── TagSticker.jsx       # Stray UI tag badge (not in ui/)
│
├── features/
│   ├── auth/
│   │   ├── AuthContext.jsx
│   │   ├── AuthPage.jsx     # Page at root of feature
│   │   ├── ProtectedRoute.jsx
│   │   ├── types.js
│   │   └── useAuth.js
│   ├── collections/
│   │   ├── CollectionDetailPage.jsx
│   │   ├── CreateCollectionModal.jsx
│   │   ├── ProposeItemModal.jsx
│   │   └── services/collectionService.js
│   ├── communities/
│   │   ├── CommunitiesPage.jsx
│   │   ├── CommunityPage.jsx
│   │   ├── threadColors.js
│   │   └── services/communityService.js
│   ├── feed/
│   │   ├── FeedCard.jsx     # Stray component at feature root
│   │   ├── useImpression.js # Stray hook at feature root
│   │   ├── components/      # RelevancePrompt.jsx, WhyStamp.jsx
│   │   ├── lib/relevance.js
│   │   └── services/feedService.js
│   ├── markets/
│   │   ├── components/      # CreateMarketModal, MarketCard, MarketDetailModal
│   │   ├── pages/MarketsPage.jsx
│   │   └── services/marketService.js
│   ├── onboarding/
│   │   └── OnboardingPage.jsx
│   ├── payments/
│   │   ├── components/      # CuratorEarningsCard, SupportCuratorModal
│   │   └── services/paymentService.js
│   ├── posts/
│   │   ├── PostCard.jsx     # Stray component at feature root
│   │   └── PostComposer.jsx # Stray component at feature root
│   ├── profile/
│   │   └── services/profileService.js
│   ├── ticketing/
│   │   ├── components/      # TicketPassCard, TicketVerifierModal
│   │   ├── pages/TicketingPage.jsx
│   │   └── services/ticketService.js
│   ├── verification/
│   │   ├── components/VerifiedSeal.jsx
│   │   └── services/attestationService.js
│   └── wallet/
│       ├── chain.js
│       ├── config.js
│       ├── LazyWalletSection.jsx
│       ├── WalletConnectButton.jsx
│       ├── WalletProvider.jsx
│       ├── components/WalletLinkSection.jsx
│       ├── hooks/useWalletLink.js
│       └── services/walletService.js
│
├── lib/
│   ├── supabase.js
│   └── utils.js
│
├── styles/
│   └── tokens.css
│
├── App.jsx                  # Direct router definition & provider wrapper
├── index.css                # Global Tailwind v4 styles & theme design tokens
└── main.jsx                 # React root mount
```

### 2.3 Backend Pre-Refactor Structure (`server/` and `api/`)
```
api/
├── approve-item.js          # Direct handler for item approval & attestation enqueue
├── health.js                # Liveness check
├── markets.js               # Cultural market actions
├── payments.js              # Payment intent and confirmation
├── tickets.js               # Ticket issuance and verification
└── wallet.js                # SIWE nonce challenge and signature verification

server/
├── auth.js                  # Bearer token verification middleware
├── hash.js                  # Forwarding to shared/crypto/hashing.js
├── relayer.js               # Viem Monad relayer wallet client
├── supabaseAdmin.js         # Service-role database client
├── validate.js              # Request validation helpers
├── jobs/
│   └── attestationWorker.js # Attestation queue worker
├── markets/
│   └── marketService.js     # Market business rules and settlement
├── payments/
│   └── paymentService.js    # Curation payment calculations & settlement
└── tickets/
    └── ticketService.js     # Ticket issuance and entitlement verification
```

---

## 3. Structural Deficiencies in Current Layout

1. **Pages Disconnected from Features:**
   `HomePage.jsx` is fundamentally the feed page, but sits in `src/app/routes/`. `PostDetailPage.jsx` belongs to `posts`, `ProfilePage.jsx` belongs to `profile`, `CulturePage.jsx` and `ExplorePage.jsx` belong to `culture`. Placing them all in `app/routes/` breaks feature encapsulation.
2. **Inconsistent Component Nesting:**
   Within `features/feed/`, `WhyStamp.jsx` is under `components/`, but `FeedCard.jsx` is at the feature root. In `features/posts/`, `PostCard.jsx` is at the root. In `features/auth/`, `AuthPage.jsx` is at the root.
3. **No Domain Separation in `src/lib/`:**
   Supabase client and wallet utilities should be categorized under `src/lib/supabase/` and `src/lib/wallet/` rather than mixed with generic helpers.
4. **Server vs. API Division:**
   Root `api/` contains Vercel serverless functions, while `server/` contains service layers. The actual route logic should reside under `server/api/routes/` with middleware under `server/api/middleware/`, while `api/*.js` acts as clean serverless entrypoints.
5. **No Route Orchestration Layer:**
   `src/App.jsx` conflates application bootstrap (providers, React Query setup) with route configuration (`Routes`, `Route`, `Navigate`).

---

## 4. Target Feature-First MVP Structure

```
Hailey/
│
├── src/
│   ├── app/
│   │   ├── App.jsx                  # Root App provider container
│   │   ├── router.jsx               # Declarative route configuration
│   │   ├── providers/
│   │   │   └── AppProviders.jsx     # Composed React Query & Context providers
│   │   └── layouts/
│   │       └── AppShell.jsx         # Master application shell
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── TagSticker.jsx       # Reusable design token badge
│   │   ├── layout/
│   │   │   └── AppShell.jsx         # Re-export / layout component
│   │   └── navigation/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/AuthPage.jsx
│   │   │   ├── components/ProtectedRoute.jsx
│   │   │   ├── hooks/useAuth.js
│   │   │   ├── context/AuthContext.jsx
│   │   │   └── types.js
│   │   ├── onboarding/
│   │   │   └── pages/OnboardingPage.jsx
│   │   ├── feed/
│   │   │   ├── pages/HomePage.jsx
│   │   │   ├── components/
│   │   │   │   ├── FeedCard.jsx
│   │   │   │   ├── RelevancePrompt.jsx
│   │   │   │   └── WhyStamp.jsx
│   │   │   ├── hooks/useImpression.js
│   │   │   ├── lib/relevance.js
│   │   │   └── services/feedService.js
│   │   ├── posts/
│   │   │   ├── pages/PostDetailPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── PostCard.jsx
│   │   │   │   └── PostComposer.jsx
│   │   ├── culture/
│   │   │   └── pages/
│   │   │       ├── CulturePage.jsx
│   │   │       └── ExplorePage.jsx
│   │   ├── communities/
│   │   │   ├── pages/
│   │   │   │   ├── CommunitiesPage.jsx
│   │   │   │   └── CommunityPage.jsx
│   │   │   ├── services/communityService.js
│   │   │   └── threadColors.js
│   │   ├── collections/
│   │   │   ├── pages/CollectionDetailPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── CreateCollectionModal.jsx
│   │   │   │   └── ProposeItemModal.jsx
│   │   │   └── services/collectionService.js
│   │   ├── profile/
│   │   │   ├── pages/ProfilePage.jsx
│   │   │   └── services/profileService.js
│   │   ├── wallet/
│   │   │   ├── components/
│   │   │   │   ├── WalletConnectButton.jsx
│   │   │   │   ├── WalletLinkSection.jsx
│   │   │   │   └── LazyWalletSection.jsx
│   │   │   ├── providers/WalletProvider.jsx
│   │   │   ├── hooks/useWalletLink.js
│   │   │   ├── services/walletService.js
│   │   │   └── config/
│   │   │       ├── chain.js
│   │   │       └── wagmiConfig.js
│   │   ├── verification/
│   │   │   ├── pages/VerifyPage.jsx
│   │   │   ├── components/VerifiedSeal.jsx
│   │   │   └── services/attestationService.js
│   │   ├── ticketing/
│   │   │   ├── pages/TicketingPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── TicketPassCard.jsx
│   │   │   │   └── TicketVerifierModal.jsx
│   │   │   └── services/ticketService.js
│   │   ├── payments/
│   │   │   ├── components/
│   │   │   │   ├── CuratorEarningsCard.jsx
│   │   │   │   └── SupportCuratorModal.jsx
│   │   │   └── services/paymentService.js
│   │   └── markets/
│   │       ├── pages/MarketsPage.jsx
│   │       ├── components/
│   │       │   ├── CreateMarketModal.jsx
│   │       │   ├── MarketCard.jsx
│   │       │   └── MarketDetailModal.jsx
│   │       └── services/marketService.js
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.js
│   │   ├── wallet/
│   │   │   ├── chain.js
│   │   │   └── config.js
│   │   └── utils/
│   │       └── cn.js
│   │
│   └── styles/
│       └── tokens.css
│
├── server/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── approveItem.js
│   │   │   ├── health.js
│   │   │   ├── markets.js
│   │   │   ├── payments.js
│   │   │   ├── tickets.js
│   │   │   └── wallet.js
│   │   └── middleware/
│   │       └── requireAuth.js
│   ├── services/
│   │   ├── payments/paymentService.js
│   │   ├── tickets/ticketService.js
│   │   └── markets/marketService.js
│   ├── blockchain/
│   │   └── relayer/relayer.js
│   ├── jobs/
│   │   └── attestation/attestationWorker.js
│   ├── security/
│   │   ├── validation/validate.js
│   │   └── authorization/auth.js
│   └── database/
│       └── supabaseAdmin.js
│
├── api/                             # Thin Vercel serverless entrypoints
│   ├── approve-item.js              # Delegates to server/api/routes/approveItem.js
│   ├── health.js                    # Delegates to server/api/routes/health.js
│   ├── markets.js                   # Delegates to server/api/routes/markets.js
│   ├── payments.js                  # Delegates to server/api/routes/payments.js
│   ├── tickets.js                   # Delegates to server/api/routes/tickets.js
│   └── wallet.js                    # Delegates to server/api/routes/wallet.js
│
├── shared/                          # Zero-dependency isomorphic contracts & hashing
│   ├── contracts/HaileyContributions.abi.js
│   └── crypto/hashing.js
│
├── tests/                           # Unit, Concurrency, Architecture, Security tests
│   ├── architecture/boundary.test.js
│   ├── concurrency/concurrency.test.js
│   ├── security/adversarial_rls.test.js
│   └── unit/
```

---

## 5. Architectural Invariants & Boundary Rules

1. **Client / Server Boundary (Enforced by Automated Test):**
   - Files in `src/` must NEVER import `server/`, `api/`, or `node:*`.
   - Communication must proceed strictly via HTTP/JSON to `/api/*` endpoints.
2. **Feature Encapsulation:**
   - Feature-specific UI, hooks, and services live strictly inside `src/features/<feature_name>/`.
   - Truly reusable primitives (buttons, modals, layout containers) live in `src/components/`.
3. **Canonical Isomorphism:**
   - Contract ABIs and deterministic hashing functions belong strictly to `shared/`.
   - Browser and Node runtime code can both import `shared/` without circularity.
4. **Zero Code Duplication:**
   - No parallel utility copies. Forwarding re-exports preserve compatibility during transition with zero dead files.
