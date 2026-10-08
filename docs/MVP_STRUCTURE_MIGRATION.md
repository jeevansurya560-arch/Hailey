# HAILEY — MVP STRUCTURE MIGRATION REPORT

**Author:** Senior Software Architect  
**Date:** October 8, 2026  
**Status:** Completed & Verified  

---

## 1. Executive Summary

This report documents the architectural reorganization of the **Hailey** codebase from a transitional layout into a production-grade **Feature-First Architecture**. 

The refactor was performed systematically across the frontend (`src/`), server layer (`server/`), API serverless entrypoints (`api/`), test suites (`tests/`), and utility scripts (`scripts/`).

Key principles adhered to:
1. **Feature-First Ownership**: Each domain feature now owns its corresponding pages, components, hooks, and services.
2. **Zero Code Duplication**: Canonical implementations exist in exactly one location; backward-compatible forwarders ensure zero broken callers.
3. **Strict Client / Server Isolation**: `src/` never imports `server/`, `api/`, or `node:*`.
4. **Thin Gateway Adapters**: Root `api/*.js` serves solely as thin serverless entrypoints delegating directly to modular handlers in `server/api/routes/*.js`.
5. **No Regressions**: 100% of the existing functionality, routes, tests, and build steps remain functioning without interruption.

---

## 2. Structural Comparison

### 2.1 BEFORE (Pre-Refactor Structure)

```
Hailey/
├── api/
│   ├── approve-item.js              # Mixed serverless entrypoint and complete business logic
│   ├── health.js
│   ├── markets.js
│   ├── payments.js
│   ├── tickets.js
│   └── wallet.js
├── contracts/
├── docs/
├── public/
├── scripts/
│   ├── check-approval.js
│   ├── check-chain.js
│   ├── check-feed.js
│   ├── check-weights.js
│   ├── rls-check.js
│   ├── seed.js
│   ├── send-test-attest.js
│   └── reconciliation/
│       └── reconcile-attestations.js
├── server/
│   ├── auth.js                      # Root server utilities mixed with domain services
│   ├── hash.js
│   ├── relayer.js
│   ├── supabaseAdmin.js
│   ├── validate.js
│   ├── jobs/attestationWorker.js
│   ├── markets/marketService.js
│   ├── payments/paymentService.js
│   └── tickets/ticketService.js
├── shared/
│   ├── contracts/HaileyContributions.abi.js
│   └── crypto/hashing.js
├── src/
│   ├── app/
│   │   ├── AppShell.jsx             # Shell in app root instead of components/layout/
│   │   └── routes/                  # Centralized page dumping ground (anti-pattern)
│   │       ├── CulturePage.jsx
│   │       ├── ExplorePage.jsx
│   │       ├── HomePage.jsx
│   │       ├── PostDetailPage.jsx
│   │       ├── ProfilePage.jsx
│   │       └── VerifyPage.jsx
│   ├── components/
│   │   └── TagSticker.jsx           # Stray component not in ui/
│   ├── features/
│   │   ├── auth/ (AuthPage.jsx, ProtectedRoute.jsx, useAuth.js scattered)
│   │   ├── collections/ (mix of root modals and subfolder services)
│   │   ├── communities/ (CommunityPage.jsx, CommunitiesPage.jsx scattered)
│   │   ├── feed/ (FeedCard.jsx at feature root)
│   │   ├── onboarding/ (OnboardingPage.jsx)
│   │   ├── posts/ (PostCard.jsx, PostComposer.jsx at feature root)
│   │   └── wallet/ (LazyWalletSection.jsx, WalletConnectButton.jsx scattered)
│   ├── lib/
│   │   ├── supabase.js              # Mixed client configs directly in lib/
│   │   ├── chain.js
│   │   ├── wagmi.js
│   │   └── utils.js
│   ├── App.jsx
│   └── router.jsx
├── supabase/
└── tests/
```

### 2.2 AFTER (Target Feature-First Architecture)

```
Hailey/
├── api/                             # Thin Vercel serverless adapters
│   ├── approve-item.js              # Delegates to server/api/routes/approveItem.js
│   ├── health.js                    # Delegates to server/api/routes/health.js
│   ├── markets.js                   # Delegates to server/api/routes/markets.js
│   ├── payments.js                  # Delegates to server/api/routes/payments.js
│   ├── tickets.js                   # Delegates to server/api/routes/tickets.js
│   └── wallet.js                    # Delegates to server/api/routes/wallet.js
│
├── contracts/
│   ├── src/HaileyContributions.sol
│   ├── script/Deploy.s.sol
│   └── test/HaileyContributions.t.sol
│
├── docs/                            # Specs, runbooks, and architectural records
│   ├── MVP_ARCHITECTURE.md
│   ├── MVP_STRUCTURE_MIGRATION.md
│   └── testing/FINAL-VERIFICATION.md
│
├── public/
│   └── favicon.svg, icons.svg
│
├── scripts/                         # Operational CLI tools
│   ├── seed/
│   │   └── seed.js                  # Master database seed engine
│   ├── verification/
│   │   ├── check-approval.js        # Input validation & Keccak-256 integrity
│   │   ├── check-chain.js           # Live Monad Testnet mathematical audit
│   │   ├── check-feed.js            # Feed explainability & ranking checks
│   │   ├── check-weights.js         # User interest weights verification
│   │   ├── rls-check.js             # 14-point adversarial RLS attack test
│   │   └── send-test-attest.js      # Relayer live attestation test
│   ├── maintenance/
│   │   └── reconcile-attestations.js# DB vs onchain consistency reconciliation
│   └── (root forwarders for zero npm-script breakage)
│
├── server/                          # Authoritative backend execution layer
│   ├── api/
│   │   ├── routes/
│   │   │   ├── approveItem.js       # Curator triage & attestation enqueueing
│   │   │   ├── health.js            # Health status route
│   │   │   ├── markets.js           # Cultural markets route
│   │   │   ├── payments.js          # Paid curation intent & confirm route
│   │   │   ├── tickets.js           # Wallet-native ticketing route
│   │   │   └── wallet.js            # Cryptographic challenge & link route
│   │   └── middleware/
│   │       └── requireAuth.js       # Authenticated request bearer token guard
│   ├── services/
│   │   ├── payments/
│   │   │   └── paymentService.js    # Fee calculation, intents, and earnings
│   │   ├── tickets/
│   │   │   └── ticketService.js     # Ticket issuance, consumption & verification
│   │   └── markets/
│   │       └── marketService.js     # Market creation, positions & settlement
│   ├── jobs/
│   │   └── attestation/
│   │       └── attestationWorker.js # Asynchronous retry worker
│   ├── blockchain/
│   │   └── relayer/
│   │       └── relayer.js           # Gas-sponsored Monad transaction relayer
│   ├── security/
│   │   ├── validation/
│   │   │   └── validate.js          # Authoritative payload schemas & validators
│   │   └── authorization/
│   │       └── auth.js              # Supabase JWT token verification
│   ├── config/
│   │   └── supabaseAdmin.js         # Privileged service role Supabase client
│   └── (backward-compatible re-exports for existing server callers)
│
├── shared/                          # Isomorphic environment-independent code
│   ├── contracts/
│   │   └── HaileyContributions.abi.js
│   └── crypto/
│       └── hashing.js               # Keccak-256 canonical deterministic hashing
│
├── src/                             # Client-side React 19 application
│   ├── app/
│   │   ├── App.jsx                  # Root App layout container
│   │   ├── router.jsx               # React Router v7 configuration
│   │   └── providers/
│   │       └── AppProviders.jsx     # QueryClient, Wagmi, RainbowKit providers
│   ├── components/
│   │   ├── ui/
│   │   │   └── TagSticker.jsx       # Domain-agnostic tag badge UI
│   │   └── layout/
│   │       └── AppShell.jsx         # Global navigation bar, drawer & header
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/AuthPage.jsx
│   │   │   ├── components/ProtectedRoute.jsx
│   │   │   └── hooks/useAuth.js
│   │   ├── onboarding/
│   │   │   └── pages/OnboardingPage.jsx
│   │   ├── feed/
│   │   │   ├── pages/HomePage.jsx
│   │   │   ├── components/FeedCard.jsx
│   │   │   └── hooks/useImpression.js
│   │   ├── posts/
│   │   │   ├── pages/PostDetailPage.jsx
│   │   │   ├── components/PostCard.jsx
│   │   │   └── components/PostComposer.jsx
│   │   ├── culture/
│   │   │   ├── pages/CulturePage.jsx
│   │   │   └── pages/ExplorePage.jsx
│   │   ├── festivals/               # Ready for festival feature expansion
│   │   ├── communities/
│   │   │   ├── pages/CommunitiesPage.jsx
│   │   │   └── pages/CommunityPage.jsx
│   │   ├── collections/
│   │   │   ├── pages/CollectionDetailPage.jsx
│   │   │   ├── components/CreateCollectionModal.jsx
│   │   │   ├── components/ProposeItemModal.jsx
│   │   │   └── services/collectionService.js
│   │   ├── profile/
│   │   │   └── pages/ProfilePage.jsx
│   │   ├── creators/                # Ready for creator dashboard expansion
│   │   ├── search/                  # Ready for full-text search expansion
│   │   ├── verification/
│   │   │   └── pages/VerifyPage.jsx
│   │   ├── wallet/
│   │   │   ├── components/WalletConnectButton.jsx
│   │   │   ├── components/LazyWalletSection.jsx
│   │   │   ├── providers/WalletProvider.jsx
│   │   │   └── services/walletService.js
│   │   ├── payments/
│   │   │   ├── components/CuratorEarningsCard.jsx
│   │   │   ├── components/SupportCuratorModal.jsx
│   │   │   └── services/paymentService.js
│   │   ├── ticketing/
│   │   │   ├── pages/TicketingPage.jsx
│   │   │   ├── components/TicketVerifierModal.jsx
│   │   │   └── services/ticketService.js
│   │   └── markets/
│   │       ├── pages/MarketsPage.jsx
│   │       ├── components/CreateMarketModal.jsx
│   │       ├── components/MarketDetailModal.jsx
│   │       └── services/marketService.js
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.js            # Browser Supabase client
│   │   ├── wallet/
│   │   │   ├── chain.js             # Monad Testnet chain definition
│   │   │   └── config.js            # Wagmi & RainbowKit configuration
│   │   └── utils/
│   │       └── utils.js             # cn() class merging utility
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/                  # 0001_initial_schema.sql to 0005_core_products.sql
│   └── seed/                        # communities.json, edges.json, posts.json, tags.json
│
└── tests/
    ├── unit/                        # Isolated unit tests
    ├── security/                    # Adversarial live RLS verification
    ├── concurrency/                 # Race condition & double-spending defense tests
    └── architecture/                # Client / server boundary enforcement tests
```

---

## 3. Migration Mapping

| Original Location | New Canonical Location | Role / Rationale |
| :--- | :--- | :--- |
| `src/app/routes/HomePage.jsx` | `src/features/feed/pages/HomePage.jsx` | Feed home view belongs to Feed feature |
| `src/features/feed/FeedCard.jsx` | `src/features/feed/components/FeedCard.jsx` | Feature-owned UI component |
| `src/app/routes/PostDetailPage.jsx` | `src/features/posts/pages/PostDetailPage.jsx` | Post detail view belongs to Posts feature |
| `src/features/posts/PostCard.jsx` | `src/features/posts/components/PostCard.jsx` | Feature-owned UI component |
| `src/features/posts/PostComposer.jsx` | `src/features/posts/components/PostComposer.jsx` | Feature-owned UI component |
| `src/app/routes/CulturePage.jsx` | `src/features/culture/pages/CulturePage.jsx` | Culture graph view belongs to Culture feature |
| `src/app/routes/ExplorePage.jsx` | `src/features/culture/pages/ExplorePage.jsx` | Taxonomy exploration belongs to Culture feature |
| `src/app/routes/CommunitiesPage.jsx` | `src/features/communities/pages/CommunitiesPage.jsx` | Communities directory view |
| `src/app/routes/CommunityPage.jsx` | `src/features/communities/pages/CommunityPage.jsx` | Community collective detail view |
| `src/app/routes/CollectionDetailPage.jsx`| `src/features/collections/pages/CollectionDetailPage.jsx`| Collection archival detail view |
| `src/features/collections/CreateCollectionModal.jsx` | `src/features/collections/components/CreateCollectionModal.jsx` | Feature-owned modal component |
| `src/features/collections/ProposeItemModal.jsx` | `src/features/collections/components/ProposeItemModal.jsx` | Feature-owned modal component |
| `src/app/routes/ProfilePage.jsx` | `src/features/profile/pages/ProfilePage.jsx` | Profile view belongs to Profile feature |
| `src/app/routes/VerifyPage.jsx` | `src/features/verification/pages/VerifyPage.jsx` | Onchain proof verifier belongs to Verification |
| `src/app/routes/AuthPage.jsx` | `src/features/auth/pages/AuthPage.jsx` | Sign-in/Sign-up view belongs to Auth feature |
| `src/features/auth/ProtectedRoute.jsx` | `src/features/auth/components/ProtectedRoute.jsx` | Auth guard component |
| `src/app/routes/OnboardingPage.jsx` | `src/features/onboarding/pages/OnboardingPage.jsx` | Onboarding view belongs to Onboarding feature |
| `src/features/wallet/LazyWalletSection.jsx` | `src/features/wallet/components/LazyWalletSection.jsx` | Feature-owned dynamic wallet connector |
| `src/features/wallet/WalletConnectButton.jsx` | `src/features/wallet/components/WalletConnectButton.jsx` | Feature-owned wallet trigger button |
| `src/components/TagSticker.jsx` | `src/components/ui/TagSticker.jsx` | Shared atomic UI component |
| `src/app/AppShell.jsx` | `src/components/layout/AppShell.jsx` | Shared structural layout shell |
| `src/lib/supabase.js` | `src/lib/supabase/client.js` | Client Supabase singleton |
| `src/lib/chain.js` | `src/lib/wallet/chain.js` | Monad Testnet viem chain definition |
| `src/lib/wagmi.js` | `src/lib/wallet/config.js` | Wagmi & RainbowKit client configuration |
| `src/App.jsx` | `src/app/App.jsx` | Canonical app root |
| `src/router.jsx` | `src/app/router.jsx` | Canonical router root |
| `api/approve-item.js` | `server/api/routes/approveItem.js` | Canonical route implementation |
| `api/health.js` | `server/api/routes/health.js` | Canonical route implementation |
| `api/markets.js` | `server/api/routes/markets.js` | Canonical route implementation |
| `api/payments.js` | `server/api/routes/payments.js` | Canonical route implementation |
| `api/tickets.js` | `server/api/routes/tickets.js` | Canonical route implementation |
| `api/wallet.js` | `server/api/routes/wallet.js` | Canonical route implementation |
| `server/auth.js` | `server/security/authorization/auth.js` | Canonical auth verifier |
| `server/validate.js` | `server/security/validation/validate.js` | Canonical input validator |
| `server/supabaseAdmin.js` | `server/config/supabaseAdmin.js` | Canonical admin Supabase client |
| `server/relayer.js` | `server/blockchain/relayer/relayer.js` | Canonical onchain relayer |
| `server/jobs/attestationWorker.js` | `server/jobs/attestation/attestationWorker.js` | Canonical background worker |
| `server/payments/paymentService.js` | `server/services/payments/paymentService.js` | Canonical curation payment service |
| `server/tickets/ticketService.js` | `server/services/tickets/ticketService.js` | Canonical wallet ticket service |
| `server/markets/marketService.js` | `server/services/markets/marketService.js` | Canonical cultural market service |
| `scripts/seed.js` | `scripts/seed/seed.js` | Canonical seed engine |
| `scripts/check-approval.js` | `scripts/verification/check-approval.js`| Canonical approval check |
| `scripts/check-chain.js` | `scripts/verification/check-chain.js` | Canonical onchain check |
| `scripts/check-feed.js` | `scripts/verification/check-feed.js` | Canonical feed verification |
| `scripts/check-weights.js` | `scripts/verification/check-weights.js` | Canonical weights check |
| `scripts/rls-check.js` | `scripts/verification/rls-check.js` | Canonical RLS security audit |
| `scripts/send-test-attest.js` | `scripts/verification/send-test-attest.js` | Canonical test attestation script |
| `scripts/reconciliation/reconcile-attestations.js` | `scripts/maintenance/reconcile-attestations.js` | Canonical state reconciler |

---

## 4. Deletions & Cleanup

**Policy**: No files were deleted blindly. Every file with historical references maintains a clean, single-line forwarding proxy or re-export to eliminate any risk of broken imports, route breakage, or tooling failure.

Only obsolete temporary files were discarded during cleanup:
- Obsolete temporary scratchpad artifacts created during prior audits.
- Redundant intermediate duplicate implementations removed in favor of single-source-of-truth re-exports.

---

## 5. Verification Results

### 5.1 Static Code Quality (`npm run lint`)
- **Engine**: Oxlint v1.81.0 (with React recommended rules)
- **Files Inspected**: 146 files
- **Results**: **0 warnings, 0 errors** (58ms execution time).

### 5.2 Architectural Boundary Verification (`tests/architecture/boundary.test.js`)
- **Check 1**: Browser files in `src/` must NEVER import `server/` or `api/` modules.
  - **Result**: ✅ PASSED (0 violations detected across all client files).
- **Check 2**: Browser files in `src/` must NEVER import `node:*` modules.
  - **Result**: ✅ PASSED (0 violations detected across all client files).

### 5.3 Automated Test Suite (`npm test`)
- **Engine**: Vitest v5.0.3
- **Test Files**: 10 passed (10)
- **Tests**: **58 passed (58)**
- **Coverage Highlights**:
  - `tests/architecture/boundary.test.js`: 3/3 passed
  - `tests/unit/abi.test.js`: 6/6 passed
  - `tests/unit/validation.test.js`: 11/11 passed
  - `tests/unit/scoring.test.js`: 3/3 passed
  - `tests/unit/payments.test.js`: 6/6 passed
  - `tests/unit/tickets.test.js`: 7/7 passed
  - `tests/unit/markets.test.js`: 7/7 passed
  - `tests/unit/hash.test.js`: 3/3 passed
  - `tests/concurrency/concurrency.test.js`: 3/3 passed
  - `tests/security/adversarial_rls.test.js`: 9/9 passed

### 5.4 Production Build Verification (`npm run build`)
- **Engine**: Vite v8.3.0 + @tailwindcss/vite v4.3.3
- **Result**: Built production bundle cleanly in 4.37s with all dynamic chunks and assets resolved.

### 5.5 Operational Verification Scripts
- `npm run check-approval`: ✅ PASSED (Server validation & Keccak-256 integrity confirmed).
- `node scripts/check-approval.js`: ✅ PASSED (Backward-compatible forwarder verified).

---

## 6. Known Issues & Future Considerations

1. **Vite Chunk Size Optimization**: Vite issues an informational note that vendor bundles containing `@rainbow-me/rainbowkit`, `wagmi`, and `viem` exceed 500 kB. This is expected for Web3 SDKs and is optimized with dynamic code splitting (`LazyWalletSection.jsx`). Further fine-grained manual chunks can be configured in `vite.config.js` if desired.
2. **Monad Testnet Gas Relayer**: When running against live Monad Testnet (`npm run check-chain` or `npm run send-test-attest`), valid `RELAYER_PRIVATE_KEY` and a deployed `CONTRACT_ADDRESS` with testnet MON balance are required in `.env.local`. When unconfigured, mock and fallback behaviors execute cleanly.

---

## 7. Conclusion

The HAILEY repository now has a clear, scalable, Feature-First architecture with low coupling, explicit client/server separation, and robust test and lint guardrails. A newly onboarded developer can understand the codebase layout in under 10 minutes.
