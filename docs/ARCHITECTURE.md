# HAILEY — ARCHITECTURE & SYSTEM DESIGN SPECIFICATION

**Version:** 2.0 Production-Grade Architecture  
**Date:** October 8, 2026  
**Primary Architect:** Principal Systems Architect & Engineering Lead  

---

## 1. System Topology Overview

Hailey is designed as an autonomous, high-integrity cultural field guide that unifies structured anthropological knowledge, decentralized curation, and cryptographic provenance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HAILEY CLIENT (React 19 SPA)                          │
│  - AppShell Layout & Navigation (Soft UI / Neomorphism / Dark & Light)       │
│  - Feature Modules (Culture, Festivals, Analytics, Markets, Passes, Feed)   │
│  - TanStack React Query v5 (Data Caching & Stale-While-Revalidate)          │
│  - Viem & RainbowKit (EIP-191 Signatures & Monad L1 Interaction)            │
│  - Web Speech API (Voice-to-Text & Speech Synthesis)                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         HTTP REST / Session JWT
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    API LAYER (Thin Vercel / Express Adapters)               │
│  api/health.js      api/wallet.js        api/payments.js                    │
│  api/tickets.js     api/markets.js       api/ai.js                          │
│  api/search.js      api/moderation.js    api/approveItem.js                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                     CORE BACKEND RUNTIME (server/)                          │
│                                                                             │
│  ┌─────────────────────────┐   ┌──────────────────────────┐                 │
│  │     security/           │   │      observability/      │                 │
│  │  - auth.js (JWT verify) │   │  - auditLogger.js        │                 │
│  │  - rateLimit.js         │   │  - health.js (Live/Ready)│                 │
│  │  - validate.js          │   └──────────────────────────┘                 │
│  └─────────────────────────┘                                                │
│  ┌─────────────────────────┐   ┌──────────────────────────┐                 │
│  │     services/           │   │      blockchain/         │                 │
│  │  - paymentService.js    │   │  - relayer.js (Viem L1)  │                 │
│  │  - ticketService.js     │   │  - HaileyContributions   │                 │
│  │  - marketService.js     │   └──────────────────────────┘                 │
│  │  - aiProviderService.js │   ┌──────────────────────────┐                 │
│  └─────────────────────────┘   │      jobs/               │                 │
│                                │  - attestationWorker.js  │                 │
│                                └──────────────────────────┘                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                 DATA & PERSISTENCE PERIMETER (PostgreSQL 15+)                │
│  - Row Level Security (RLS) on 100% of tables                               │
│  - Normalized Cultural Schema (religions, traditions, festivals, media)     │
│  - Web3 Schemas (tickets, curation_payments, markets, attestation_jobs)    │
│  - Audit Logs (audit_logs, moderation_reports, content_versions)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Architecture

```
Hailey/
├── src/
│   ├── app/                    # Application roots, App.jsx, router.jsx, providers/
│   ├── components/             # Reusable UI primitives (TagSticker) & layout (AppShell)
│   ├── features/               # Co-located domain modules:
│   │   ├── analytics/          # Reach vs Engagement scatter plot, Author Talk, metrics
│   │   ├── assistant/          # AI cultural assistant modal, voice STT/TTS hooks
│   │   ├── auth/               # Split layout AuthPage, ProtectedRoute, useAuth
│   │   ├── collections/        # Archive proposals, collections, curation modals
│   │   ├── communities/        # Collectives, threads, threadColors
│   │   ├── culture/            # Taxonomy directory, ExplorePage, WikipediaCulturalArticle
│   │   ├── festivals/          # Astronomical calendar, annual occurrences (2025-2027)
│   │   ├── feed/               # Algorithmic-free feed, FeedCard, impressions
│   │   ├── markets/            # Cultural outcome markets, position modals
│   │   ├── onboarding/         # Cultural interest selection onboarding
│   │   ├── payments/           # Paid curation modals, curator earnings
│   │   ├── posts/              # PostCard, PostComposer, PostDetailPage
│   │   ├── profile/            # Contributor profile, wallet status
│   │   ├── ticketing/          # Wallet-native passes, QR verifier
│   │   ├── verification/       # Monad explorer verify page, seals
│   │   └── wallet/             # Wallet link, RainbowKit configuration
│   ├── lib/                    # Core clients (supabase, wallet)
│   └── styles/                 # Tokens, paper/ink CSS variables, tailwind
├── server/                     # Backend domain logic, services, security, observability
├── api/                        # Thin Vercel serverless adapters
├── shared/                     # Canonical ABI and domain-separated Keccak-256 hashing
├── contracts/                  # Solidity smart contract & test suites
├── supabase/migrations/        # Migrations 0001 through 0006
├── tests/                      # Architecture, unit, security, concurrency test suites
└── docs/                       # Specifications and audits
```

---

## 3. Core Data Flow & Pipelines

### A. Paid Curation Pipeline
1. Contributor proposes content to a collective collection.
2. Community patron initiates curation payment (`POST /api/payments { action: 'intent' }`).
3. Transaction submitted onchain and confirmed by relayer (`POST /api/payments { action: 'confirm' }`).
4. Curator receives entitlement; split constraint (`curator_amount + platform_fee = amount`) enforced by Postgres.

### B. Attestation Pipeline
1. Curator approves proposal via anti-self-dealing triage.
2. Canonical hash computed: `keccak256("hailey:v1|itemId|collectionId|communitySlug|sha256(itemContent)")`.
3. Worker claims job atomically (`status: 'processing'`), relays tx to Monad Testnet, and marks `confirmed`.
4. Contributor gains immutable verified seal verifiable via `viem`.

### C. Grounded AI Assistant Pipeline
1. User enters natural language inquiry via keyboard or microphone (Web Speech API).
2. Service scans verified cultural entities and festival occurrences in database/archive.
3. Formulates answer citing primary anthropological publications with licenses.
4. Transparently refuses unverified claims when external provider keys are absent.
