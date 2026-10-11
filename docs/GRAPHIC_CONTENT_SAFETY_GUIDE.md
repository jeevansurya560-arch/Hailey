# Blood, Violence & Graphic Content Safety Guide

## 1. Core Architectural Principles

Hailey implements an automated server-side content safety foundation to detect and enforce policies on graphic visual content (blood, severe violence, gore, and graphic injury).

### Key Architectural Invariants
> [!IMPORTANT]
> **Content safety classification is independent from provenance and blockchain attestation.** An onchain attestation proves that a cryptographic content hash was recorded; it does **not** prove that the content is safe, legal, or suitable.

> [!WARNING]
> **Perceptual similarity does not transfer safety decisions between distinct media assets.** Two images that share visual similarity (dHash) remain distinct media assets and must each undergo independent safety analysis.

> [!CAUTION]
> **Analysis failure is not equivalent to safe content.** An unanalyzed, failed, or unsupported media asset cannot be automatically cleared for publishing (`ANALYSIS_FAILED != ALLOWED`, `NOT_ANALYZED != ALLOWED`).

---

## 2. Detection vs. Policy Separation

Hailey enforces a strict architectural boundary between detection and policy:

```
+------------------------------------+
|  Safety Classifier / Provider      |  Answers: "What does this media appear to contain?"
|  (e.g., Google Vision, AWS, Mock)  |  Outputs: Normalized category scores (0.0 to 1.0)
+-----------------+------------------+
                  |
                  v
+-----------------+------------------+
|  Hailey Safety Policy Engine       |  Answers: "What action should Hailey take?"
|  (evaluateGraphicContentPolicy)   |  Outputs: ALLOWED, REVIEW_REQUIRED, RESTRICTED, BLOCKED
+-----------------+------------------+
                  |
                  v
+-----------------+------------------+
|  Server Publishing Clearance       |  Enforces: Authoritative block on unapproved media
|  (isMediaAllowedForPublishing)     |
+------------------------------------+
```

The classifier adapter never makes business policy decisions. All decisions are determined by the policy engine using versioned, explicit threshold rules.

---

## 3. Normalized Safety Result Schema

To prevent vendor lock-in and decouple raw provider responses from the application core, all providers must return a normalized structure:

```json
{
  "status": "ANALYZED",
  "categories": {
    "blood": { "score": 0.02, "detected": false },
    "graphicViolence": { "score": 0.88, "detected": true },
    "gore": { "score": 0.05, "detected": false },
    "severeInjury": { "score": 0.05, "detected": false }
  },
  "overallRisk": 0.88,
  "provider": "mock_graphic_safety",
  "model": "mock_vision_classifier",
  "modelVersion": "v1.0.0-test",
  "analyzedAt": "2026-10-08T22:40:00.000Z",
  "error": null
}
```

---

## 4. Policy Configuration & Provisional Thresholds

Policy configurations are versioned (e.g. `graphic-content-v1`). Thresholds define explicit review and block boundaries:

```javascript
export const DEFAULT_GRAPHIC_CONTENT_POLICY = {
  version: 'graphic-content-v1',
  categories: {
    blood: {
      reviewThreshold: 0.40,
      blockThreshold: 0.75,
    },
    graphicViolence: {
      reviewThreshold: 0.35,
      blockThreshold: 0.70,
    },
    gore: {
      reviewThreshold: 0.30,
      blockThreshold: 0.65,
    },
    severeInjury: {
      reviewThreshold: 0.35,
      blockThreshold: 0.70,
    },
  },
  overallRisk: {
    reviewThreshold: 0.40,
    blockThreshold: 0.70,
  },
}
```

> [!NOTE]
> Initial threshold values represent provisional baseline configurations. Confidence scores reflect model signals rather than absolute mathematical probability and require empirical calibration as live classifiers are integrated.

---

## 5. Database Model (`media_safety_analyses`)

Implemented in migration `0011_media_safety_and_graphic_content_moderation.sql`:

```sql
create table if not exists public.media_safety_analyses (
  id              uuid primary key default gen_random_uuid(),
  media_asset_id  uuid not null references public.media_assets(id) on delete cascade,
  analysis_status text not null check (
    analysis_status in ('NOT_ANALYZED', 'ANALYZING', 'ANALYZED', 'ANALYSIS_FAILED', 'UNSUPPORTED')
  ),
  policy_status   text not null check (
    policy_status in ('PENDING', 'ALLOWED', 'REVIEW_REQUIRED', 'RESTRICTED', 'BLOCKED', 'FAILED')
  ),
  overall_score   real not null default 0.0 check (overall_score between 0.0 and 1.0),
  category_scores jsonb not null default '{}'::jsonb,
  provider        text not null,
  model           text not null,
  model_version   text not null,
  policy_version  text not null,
  failure_reason  text,
  analyzed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

---

## 6. Duplicate Media & Provenance Interactions

### Exact Duplicates (Identical SHA-256)
* When User B uploads media with the exact same bytes (`sha256_hash = X`) as User A's upload, the system resolves to the existing `media_assets` record.
* If that `media_assets` record has an existing trusted analysis (`analysis_status === 'ANALYZED'`), the safety result is **reused idempotently**, avoiding redundant classification costs.

### Near-Duplicates (Different SHA-256, Close dHash)
* Visual similarity detected via dHash does **not** establish identical content or safety.
* Near-duplicates receive distinct `media_assets.id` rows and **must undergo independent safety classification**.

### Blockchain Provenance Separation
* Provenance attestation records deterministic application/media hashes onchain.
* Content safety records remain offchain in PostgreSQL to maintain privacy and allow policy updates without blockchain forks.

---

## 7. Video Safety Limitations

* Real video classification requires temporal keyframe sampling and decoding.
* In the absence of a video decoding pipeline, `analyzeVideo()` returns structured `UNSUPPORTED` status without attempting to parse container formats as images.
* Videos with `UNSUPPORTED` safety status evaluate to `FAILED` policy status and are held for human review or pipeline processing.

---

## 8. Server Trust Boundary & Publishing Enforcement

1. **Client Isolation:** Clients cannot supply `category_scores`, `policy_status`, `overall_score`, or `analysis_status`. All writes to `media_safety_analyses` require backend service role.
2. **Fail-Closed Publishing:** [`isMediaAllowedForPublishing(mediaAssetId)`](file:///c:/Users/KASIRAO/OneDrive/Documents/Hailey/server/security/moderation/contentSafety.js) returns `allowed: false` for `NOT_ANALYZED`, `ANALYSIS_FAILED`, `REVIEW_REQUIRED`, and `BLOCKED` states.
3. **Auditing:** Every decision records the provider, model, model version, policy version, and timestamp.
