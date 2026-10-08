# HAILEY — SECURITY AUDIT & THREAT MODEL

**Date:** October 8, 2026  
**Security Lead / Auditor:** Principal Security Engineer & Cryptographic Architect  
**Classification:** Production Defense & Verification Report  

---

## 1. Threat Model & Security Boundaries

Hailey enforces strict zero-trust boundaries across three decoupled layers:
1. **Frontend Client Layer**: Untrusted execution environment. No client-supplied IDs, roles, or assertions are trusted.
2. **PostgreSQL / Supabase Database Layer**: Primary data security perimeter protected by Row Level Security (RLS) on 100% of tables.
3. **Smart Contract / Blockchain Layer**: Monad Testnet (Chain ID 10143) immutable registry verified via cryptographic proofs.

---

## 2. Row Level Security (RLS) Matrix & Multi-Role Defense

All tables enforce Row Level Security. Live adversarial tests (`tests/security/adversarial_rls.test.js`) verify that unauthorized reads and writes fail at the Postgres level.

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy | Security Guarantees |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profiles` | Public read | Trigger only (`handle_new_user`) | `auth.uid() = id` (wallet_address locked to server) | Disabled | Impersonation blocked; wallet address cannot be spoofed by client. |
| `user_interests` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | Cross-user interest surveillance blocked. |
| `communities` | Public read | Service role / verified curator only | Creator only | Disabled | Spam community creation blocked. |
| `curation_payments`| Payer or Curator only | Service role only | Service role only | Disabled | Anonymous payment spoofing blocked; split math validated by DB constraint. |
| `tickets` | Owner user/wallet | Service role only | Service role only | Disabled | Direct ticket status tampering (`claimed` -> `used`) blocked from client. |
| `markets` | Public read | Service role only | Creator/resolver via server | Disabled | Unauthorized market resolution blocked. |
| `positions` | Position owner | Service role only | Service role only | Disabled | Direct balance alteration blocked. |
| `attestation_jobs` | Service role only | Service role only | Service role only | Disabled | Public cannot tamper with queue states. |
| `moderation_reports`| Reporter only | Authenticated user | Service role / moderator | Disabled | Reporting is protected; users cannot inspect other reports. |
| `audit_logs` | Service role only | Service role only | Immutable (No UPDATE) | Immutable (No DELETE) | Tamper-proof audit trail. |

---

## 3. Cryptographic Wallet Authentication

### Vulnerability Addressed: Stale Nonce & Replay Attacks
- **Problem**: Treating `walletAddress` sent in HTTP body as proof of wallet ownership allows identity theft.
- **Defense Implemented**:
  1. `POST /api/wallet { action: 'nonce' }`: Generates a high-entropy 32-byte cryptographic nonce with a strict 10-minute expiry timestamp.
  2. The nonce is stored in `wallet_nonces` and tied to the user's authenticated Supabase session ID.
  3. Client signs the challenge with `personal_sign` (EIP-191).
  4. `POST /api/wallet { action: 'link' }`: Server reconstructs the canonical message, extracts the signer via `recoverMessageAddress` using `viem`, verifies the match, and **atomically deletes the nonce**.
  5. Any attempt to replay the signature is rejected immediately (`Challenge expired / No active challenge`).

---

## 4. Payment Settlement & Double-Spend Defense

### Vulnerability Addressed: Double Settlement & Spoofed Tx Hashes
- **Defense Implemented**:
  - `curation_payments` schema enforces unique constraints on `tx_hash` and `provider_reference`.
  - State machine strictly transitions: `pending` -> `confirmed` / `failed`.
  - Check constraint `curator_amount + platform_fee = amount` prevents split accounting discrepancies.
  - Concurrency tests (`tests/concurrency/concurrency.test.js`) verify that 10 simultaneous confirmation attempts result in exactly 1 settlement and 9 idempotent rejections without state corruption.

---

## 5. Smart Contract Hardening (`HaileyContributions.sol`)

- **Zero-Address Validation**: `attest()` explicitly reverts with `ZeroAddress()` if `contributor == address(0)`.
- **Zero-Hash Validation**: Reverts with `ZeroContentHash()` and `ZeroCommunityId()` if digests are empty.
- **Replay Protection**: `attested[contentHash]` mapping rejects repeated submissions with `AlreadyAttested()`.
- **Role Isolation**: Only authorized `attestor` can submit attestations or rotate keys.
- **Overflow Protection**: Counter increments safely.

---

## 6. Rate Limiting & Denial-of-Service Mitigation

- In-memory sliding-window rate limiter deployed across sensitive endpoints (`/api/wallet`, `/api/payments`, `/api/tickets`, `/api/markets`, `/api/ai`, `/api/moderation`).
- Configured with standard limits (e.g., 20 wallet links/min, 30 AI queries/min).
- Responds with HTTP 429 and `Retry-After` headers upon breach.

---

## 7. Audit Logging (Durable Forensic Trail)

- Security actions write structured audit events to `audit_logs`:
  - `WHO`: User ID or remote IP.
  - `WHAT`: Action identifier (e.g. `WALLET_LINKED`, `PAYMENT_CONFIRMED`, `TICKET_VERIFIED`, `MARKET_RESOLVED`).
  - `TARGET`: Entity ID or recipient address.
  - `RESULT`: `SUCCESS`, `FAILURE`, `DENIED`, or `BLOCKED`.
- Sensitive metadata (passwords, private keys, auth headers) is strictly redacted before persistence.
