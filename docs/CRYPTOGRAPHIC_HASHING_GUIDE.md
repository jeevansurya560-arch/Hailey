# Hailey — Cryptographic Hashing Guide

This guide documents the cryptographic hashing architecture and conventions used across the Hailey platform for content integrity, media provenance, duplicate detection, and onchain attestation.

---

## 1. Cryptographic Primitives & Roles

| Primitive | Implementation | Output Format | Primary Use Case in Hailey |
| :--- | :--- | :--- | :--- |
| **SHA-256** | `sha256Bytes(data)` via `viem/sha256` | `0x${string}` (64-hex chars) | Binary media fingerprinting, raw payload digest, content deduplication |
| **Keccak-256** | `keccak256(data)` via `viem/keccak256` | `0x${string}` (`bytes32`) | EVM smart contract attestations, community indexing, DB `content_hash` |

---

## 2. Why Database IDs & Timestamps Are Excluded from Content Identity

A primary rule of content integrity and duplicate detection is:

> **The same actual content must produce the same deterministic content identity, regardless of database row ID, uploader, collection ID, or upload time.**

* **Excluding `itemId` & `collectionId`:** When different users propose the exact same archival document, photo link, or dispatch into separate collections or at different times, the platform must detect that the underlying content is identical. Incorporating database auto-generated UUIDs would make identical content produce different hashes.
* **Excluding Timestamps & Uploader IDs:** A media file or cultural dispatch represents an anthropological or historical artifact whose cryptographic identity depends strictly on its content bytes and normalized metadata, not the epoch timestamp of when it was submitted.

---

## 3. Versioned Application Content Hashing

Hashing routines live in [`shared/crypto/hashing.js`](file:///c:/Users/KASIRAO/OneDrive/Documents/Hailey/shared/crypto/hashing.js):

### A. Binary Media Hashing: `sha256Bytes(data)`
Computes the exact cryptographic hash of raw media bytes (image, audio, video) before storage.
* **Input:** `Uint8Array | ArrayBuffer | Buffer | string`
* **Output:** `0x${string}` (64-character lowercase hexadecimal string)
* **Property:** Independent of filename, uploader, or path.

### B. Legacy Content Hash: `computeContentHashV1(params)`
* **Format:** `keccak256("hailey:v1|" + itemId + "|" + collectionId + "|" + communitySlug + "|" + sha256Hex)`
* **Status:** Preserved for 100% backward compatibility with existing historical contributions and previously deployed onchain testnet attestations.
* **Compatibility Wrapper:** `computeContentHash(params)` explicitly routes to `computeContentHashV1(params)`.

### C. Deterministic Content Hash: `computeContentHashV2(params)`
* **Format:** `keccak256("hailey:v2|" + normalizedCommunitySlug + "|" + sha256Hex(canonicalContent))`
* **Canonical Content:** Serialized via `canonicalizeContent(item)` with:
  * Strict field ordering (`${kind}:${target}:${note}`)
  * Whitespace trimming
  * Unicode NFC normalization (`String.prototype.normalize('NFC')`)
  * Deterministic null/undefined handling
* **Output:** `0x${string}` (`bytes32` hex) compatible with `HaileyContributions.sol` and PostgreSQL check constraints.

---

## 4. How Future Duplicate Detection Uses These Hashes

1. **Exact File Duplicate Detection (Phase 2+):**
   When media is uploaded, the server computes `sha256Bytes(fileBytes)`. If a record with the same SHA-256 already exists in `media_assets`, the upload can immediately reference the existing asset, preventing duplicate storage.
2. **Exact Content Proposal Deduplication:**
   When a user proposes a link or post to a community collection, `computeContentHashV2` produces a deterministic hash. If a contribution with the same `content_hash` already exists in `contributions`, the platform detects the exact duplicate and notifies the user.
3. **Onchain Attestation:**
   Curator approvals continue to write deterministic `bytes32` hashes to `HaileyContributions.sol`, ensuring that once a cultural item is attested, its proof is permanently verifiable and cannot be re-attested redundantly.
