# HAILEY — BLOCKCHAIN & SMART CONTRACT SPECIFICATION

**Target Network:** Monad Testnet  
**Chain ID:** 10143  
**Currency:** MON (18 decimals)  
**Contract Name:** `HaileyContributions`  
**Date:** October 8, 2026  

---

## 1. Smart Contract Architecture (`HaileyContributions.sol`)

The `HaileyContributions` smart contract is deployed on Monad Testnet to provide an immutable, gasless public registry of community-curated cultural contributions.

### Contract State & Storage
```solidity
address public attestor;                                      // Authorized relayer account
mapping(bytes32 => bool) public attested;                     // contentHash => whether attested
mapping(address => mapping(bytes32 => uint32)) public count;  // contributor => communityId => count
```

### Methods
1. **`attest(address contributor, bytes32 communityId, bytes32 contentHash, Kind kind)`**:
   - Access Control: Requires `msg.sender == attestor`.
   - Hardened Validations:
     - Reverts with `ZeroAddress()` if `contributor == address(0)`.
     - Reverts with `ZeroCommunityId()` if `communityId == bytes32(0)`.
     - Reverts with `ZeroContentHash()` if `contentHash == bytes32(0)`.
     - Reverts with `AlreadyAttested()` if `attested[contentHash]` is true.
   - Updates: Marks `attested[contentHash] = true` and increments `count[contributor][communityId]`.
   - Event: Emits `Attested(contributor, communityId, contentHash, kind, block.timestamp)`.

2. **`setAttestor(address newAttestor)`**:
   - Access Control: Requires `msg.sender == attestor`.
   - Validation: Reverts with `ZeroAddress()` if `newAttestor == address(0)`.
   - Updates: Rotates relayer key and emits `AttestorUpdated(previous, newAttestor)`.

---

## 2. Canonical Hashing Scheme

To prevent cross-community replay and metadata tampering, Hailey computes a deterministic, domain-separated cryptographic digest:

```javascript
// Pure, browser-compatible viem implementation in shared/crypto/hashing.js
const itemContent = computeItemContent(item) // "kind:target:note"
const sha256Hex = sha256(stringToBytes(itemContent)).slice(2)
const canonicalString = `hailey:v1|${itemId}|${collectionId}|${communitySlug}|${sha256Hex}`
const contentHash = keccak256(stringToBytes(canonicalString))
```

> **Note on Cryptographic Terminology**:  
> The onchain attestation mechanism utilizes domain-separated **Keccak-256** digests (`hailey:v1|...`), not EIP-712 structured typed data. EIP-712 / EIP-191 signatures are used strictly for client wallet ownership verification challenges (`personal_sign`).

---

## 3. Relayer Worker & Idempotency Pipeline

The background worker (`server/jobs/attestation/attestationWorker.js`) guarantees at-least-once delivery with zero duplicate submissions:

1. **State Lifecycle**:
   - `queued`: Item approved by curator, awaiting worker processing.
   - `processing`: Worker claims row atomically using `UPDATE ... WHERE status IN ('queued', 'failed')`.
   - `submitted`: Transaction broadcast to Monad mempool.
   - `confirmed`: Transaction receipt mined and confirmed onchain.
   - `failed`: Temporary RPC timeout or balance issue; retried with exponential backoff (`2^attempts * 10s`).
   - `dead_letter`: Max attempts reached (5); alerts engineering for inspection.
   - `awaiting_wallet`: Contributor has not yet linked a wallet address; safely held until user completes challenge.

2. **Retroactive Queuing**:
   When a user links their wallet address via `POST /api/wallet { action: 'link' }`, the server automatically discovers any historic approved proposals by that user in `awaiting_wallet` status and queues them for Monad L1 attestation.

3. **Reconciliation Engine**:
   `scripts/maintenance/reconcile-attestations.js` queries onchain contract state via `viem` to detect discrepancies between database rows and Monad L1 block logs, auto-reconciling any orphaned transactions.
