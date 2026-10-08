# HAILEY — TESTING STRATEGY & ADVERSARIAL VERIFICATION SUITE

**Test Runner:** Vitest v5.0.3  
**Total Test Suites:** 13  
**Total Executed Tests:** 70  
**Pass Rate:** 100% (70/70 passing)  
**Date:** October 8, 2026  

---

## 1. Testing Pyramid & Suite Breakdown

```
       ▲
      / \        Security & Adversarial (RLS, Rate Limits, Nonce Replay)
     /   \       Concurrency & Race Conditions (Double Settlement, Parallel Bids)
    /     \      Architecture & Import Boundaries (Feature-First Isolation)
   /       \     Unit & Cryptography (ABI Drift, Keccak-256, Validations)
  ───────────
```

### Suite Matrix

| Suite | Category | Tests | Key Invariants Verified |
| :--- | :--- | :---: | :--- |
| `tests/architecture/boundary.test.js` | Architecture | 3 | Prevents cross-feature boundary leakage; enforces pure shared crypto. |
| `tests/unit/abi.test.js` | Web3 / ABI | 7 | Verifies contract function signatures, return types, custom errors (`NotAttestor`, `ZeroAddress`). |
| `tests/unit/hash.test.js` | Cryptography | 3 | Verifies deterministic `hailey:v1|...` Keccak-256 digests and slug hashing. |
| `tests/unit/validation.test.js` | Input Safety | 11 | Rejects malformed slugs, invalid addresses, out-of-range amounts, XSS inputs. |
| `tests/unit/scoring.test.js` | Feed Ranking | 3 | Tests deterministic relevance calculation and time decay. |
| `tests/unit/payments.test.js` | Payments | 6 | Validates fee split constraints, status state transitions, double-settlement guards. |
| `tests/unit/tickets.test.js` | Passes | 7 | Validates signature challenge verification, status transitions (`issued` -> `claimed`). |
| `tests/unit/markets.test.js` | Markets | 7 | Validates atomic stake updating, position creation, winning payout calculation. |
| `tests/unit/cultural_knowledge.test.js`| Knowledge | 4 | Validates encyclopedic schema, multi-year festival occurrences (2025-2027), sources. |
| `tests/unit/ai_assistant.test.js` | AI Grounding | 4 | Verifies answers cite academic sources; ensures zero hallucinations on unknown data. |
| `tests/concurrency/concurrency.test.js` | Concurrency | 3 | Simulates 10 concurrent payments; proves exactly 1 succeeds and 9 fail idempotently. |
| `tests/security/rate_limit.test.js` | Rate Limiting | 3 | Proves sliding window blocks excess requests and isolates distinct client identifiers. |
| `tests/security/adversarial_rls.test.js`| RLS Security | 9 | Live database security defense proving anonymous and malicious cross-user mutations are rejected. |

---

## 2. Adversarial Security Verification Cases

### Test 1: Cross-User Private Interests Tampering
- **Attack**: Anonymous or unauthorized User B attempts to read or mutate User A's `user_interests`.
- **Result**: PostgreSQL RLS rejects query with empty set or RLS policy violation error.

### Test 2: Direct Ticket Status Tampering
- **Attack**: User claims an event pass and attempts a direct REST call to update `status: 'claimed'` to bypass payment.
- **Result**: Database policy `tickets_update_service_role` blocks client write with 403 / RLS rejection.

### Test 3: Unauthorized Market Resolution
- **Attack**: Non-creator authenticated user sends an update to set `winning_option_id` on a market.
- **Result**: RLS blocks direct client update; resolution must route through server with creator authorization checks.

### Test 4: Concurrency Double-Spend
- **Attack**: 10 simultaneous HTTP requests attempt to confirm the same crypto transaction hash for a curation payment.
- **Result**: Exactly 1 request succeeds in setting status `confirmed`; all 9 subsequent requests fail with `Payment has already been processed`.

---

## 3. How to Run Tests

```bash
# Run complete test suite
npm test

# Run linter
npm run lint

# Build production bundle
npm run build
```
