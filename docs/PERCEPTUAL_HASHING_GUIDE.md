# Hailey — Perceptual Hashing & Near-Duplicate Detection Guide

This document defines the perceptual hashing architecture for image and video content similarity detection in Hailey.

---

## 1. Core Principle & Critical Boundary

> **"Perceptual similarity is a detection signal, not proof of identical content or provenance."**

* **Cryptographic Identity (Exact Duplicate):**
  Governed solely by **SHA-256** of the original media bytes (`media_assets.sha256_hash`) and application Keccak-256 content hashes (`computeContentHashV2`). Exact SHA-256 is the only mechanism that guarantees identical file bytes and forms the basis for onchain attestation.
* **Perceptual Similarity (Near Duplicate):**
  Governed by **perceptual hashing (dHash)**. Used strictly as a moderation and deduplication recommendation signal when images are resized, recompressed, or slightly adjusted.
* **Blockchain Isolation:**
  Blockchain attestation (`HaileyContributions.sol`) and contribution verification **must continue to use the project's cryptographic content/provenance hashes, not perceptual hashes**.

---

## 2. Image Perceptual Hash Algorithm: 64-bit Difference Hash (dHash)

Hailey utilizes a deterministic, lightweight 64-bit Difference Hash (`dHash`) implemented in [`server/security/dedup/perceptualHash.js`](file:///c:/Users/KASIRAO/OneDrive/Documents/Hailey/server/security/dedup/perceptualHash.js):

### Normalization Process
1. **Grayscale Conversion:** Pixels are converted to luma using standard Rec. 601 coefficients:
   $$\text{Luma} = 0.299 \times R + 0.587 \times G + 0.114 \times B$$
2. **Dimension Resampling:** Image is downsampled to a fixed grid of **9 columns $\times$ 8 rows** (72 total pixel samples) using center-pixel resampling.
3. **Gradient Comparison:** In each of the 8 rows, adjacent horizontal columns are compared:
   $$\text{bit} = \begin{cases} 1 & \text{if } \text{pixel}[x] > \text{pixel}[x+1] \\ 0 & \text{otherwise} \end{cases}$$
   Total: 8 rows $\times$ 8 comparisons = **64 bits**.
4. **Hex Representation:** Formatted as `0x` + 16 lowercase hex characters (e.g. `0x8f3c4a2e1b0d9e7f`).

---

## 3. Comparison Method & Hamming Distance Threshold

Perceptual similarity is evaluated using **Hamming Distance** (the number of differing bits between two 64-bit binary strings):

* **Identical visual hash:** $\text{distance} = 0$.
* **Default Threshold (`DEFAULT_DHASH_THRESHOLD`):** $\le 10$ bits difference out of 64.
* **Threshold Semantics:**
  * Distance 10 means 10 of the 64 perceptual hash bits differ.
  * The default threshold of 10 is an initial empirical heuristic requiring domain calibration.
  * $\text{distance} \le 5$: Very close gradient match (slight recompression, format conversion, aspect-preserving resize).
  * $6 \le \text{distance} \le 10$: Potential near-duplicate (minor color shifts, light crop, minor watermark).
  * $\text{distance} > 10$: Visually distinct content according to the 64-bit gradient.

---

## 4. Video Near-Duplicate Foundation & Limitations

* **Current Architecture:** `computeVideoPerceptualFingerprint(frames)` accepts an array of sampled keyframes and produces a temporal sequence of frame perceptual hashes (`video_sampled_dhash_sequence`).
* **Explicit Limitation:** Frame extraction from video container formats (e.g., MP4/WebM) is an integration point for the media transcoding pipeline. Videos are never flagged as near-duplicates on metadata, duration, or filename alone.

---

## 5. Server-Side Trust Boundary & Scalability

1. **Server Authority:**
   Perceptual hashes are derived **authoritatively on the server** from media bytes. Client-provided hashes are never trusted to claim or bypass near-duplicate detection.
2. **Database Storage:**
   `media_assets.perceptual_hash` is **non-unique** (multiple images can share visual characteristics).
3. **Production Scalability Roadmap:**
   The candidate search API (`findNearDuplicates`) evaluates Hamming distance over a candidate pool. For production deployments with millions of assets, candidate retrieval should be indexed using a **BK-Tree**, **Vantage-Point Tree (VP-Tree)**, **Multi-Index Hashing (MIH)**, or PostgreSQL similarity vector index to avoid $O(N)$ full table scans.
