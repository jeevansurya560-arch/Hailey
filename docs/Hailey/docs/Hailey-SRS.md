# Hailey — Software Requirements Specification (SRS)

| | |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-10-04 |
| Basis | `Hailey-PRD.md` v0.1 |
| Conventions | "shall" = mandatory. Priority **P0** = must ship, **P1** = only if ahead, **P2** = roadmap (not specified here) |

---

## 1. Introduction

### 1.1 Purpose
Defines the functional, non-functional, data, interface and smart-contract requirements for Hailey v1 (hackathon release).

### 1.2 Scope
A responsive web application where users pick interests, receive an explainable personalised feed, join communities, contribute to collections, and receive onchain verification of approved contributions on Monad.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Tag | A node in the culture graph (culture, genre, medium, region…) |
| Interest | A weighted link between a user and a tag |
| Community | A group with members, posts and collections |
| Curator | A community member with permission to approve/reject collection items |
| Collection | An ordered set of items about a topic, inside a community or personal |
| Contribution | An approved collection item added by someone other than the approver |
| Attestation | An onchain record that a contribution was approved |
| Relayer | The server-held wallet that pays gas and sends attestation transactions |
| RLS | Postgres Row Level Security |

### 1.4 References
Monad network facts (chain ID, RPC, faucet, Foundry requirement) taken from `docs.monad.xyz`, checked 2026-10-04. Re-check before deploying.

---

## 2. Overall description

### 2.1 Product perspective
Single-page web app (React) → Supabase (Postgres, Auth) → two serverless functions for privileged operations → Monad testnet smart contract. See `Hailey-Architecture.md`.

### 2.2 User classes
| Class | Description | Access |
|---|---|---|
| Visitor | Not signed in | Read-only: landing, explore, culture pages, public posts, `/verify` |
| Member | Signed in | Post, react, join, propose items, link wallet |
| Curator | Member with `curator` role in a community | Approve/reject items in that community |
| Admin (operator) | Developer with DB/server access | Seeds data, assigns curator role by SQL |

### 2.3 Operating environment
Latest two versions of Chrome, Safari (incl. iOS), Firefox, Edge; viewport ≥ 360 px. Hosted on Vercel (static + functions), Supabase cloud, Monad testnet.

### 2.4 Constraints
- Solo developer, 9 days (2026-10-04 → 2026-10-13).
- Free tiers only.
- **No Next.js** (builder constraint). Stack: Vite + React + TypeScript.
- Testnet only unless hackathon rules require otherwise.
- No token, no fiat.

### 2.5 Assumptions and dependencies
Supabase, Vercel, a Monad RPC endpoint and a WalletConnect project ID remain available. Public RPCs are rate-limited, so the app avoids chain reads outside `/verify`.

---

## 3. Functional requirements

### 3.1 Authentication and profiles (AUTH)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| AUTH-01 | The system shall let a visitor register with email and password. | P0 | New account can sign in immediately |
| AUTH-02 | The system shall create a `profiles` row automatically on registration with a unique generated handle. | P0 | Row exists after signup |
| AUTH-03 | The system shall keep the session across page reloads and let the user sign out. | P0 | Reload keeps session |
| AUTH-04 | The user shall be able to change handle (3–20 chars, `a-z0-9_`) and display name. | P0 | Duplicate handle rejected with message |
| AUTH-05 | Visitors shall be able to view explore, culture pages, communities and posts without signing in; write actions shall prompt sign-in. | P0 | Anonymous GET works; writes redirect to login |

### 3.2 Onboarding (ONB)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| ONB-01 | A signed-in user with zero interests shall be redirected to onboarding. | P0 | Redirect occurs |
| ONB-02 | Onboarding shall present tags grouped by kind and require **3–10** selections. | P0 | Continue disabled below 3 |
| ONB-03 | Selections shall be stored as `user_interests` with `source = 'onboarding'` and `weight = 5`. | P0 | Rows present |
| ONB-04 | Copy shall use "What are you curious about?" and "Exploring"; it shall not label interests as identity. | P0 | Copy review |
| ONB-05 | The user shall be able to add/remove interests later from a culture page or profile. | P0 | Toggle works |

### 3.3 Feed and recommendations (FEED)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| FEED-01 | Home shall show a ranked list of posts from `get_feed`, 20 per page with "load more". | P0 | Pagination works |
| FEED-02 | Each card shall show a **why** label naming the top 1–2 tags that contributed to its score. | P0 | Label matches the post's tags |
| FEED-03 | Every 5th feed slot shall be an *exploration* item from a tag adjacent to the user's interests that they haven't engaged with. | P0 | Slot 5, 10, … are exploration items when available |
| FEED-04 | Posts the user hid shall never reappear. | P0 | Hidden post absent after reload |
| FEED-05 | The system shall update interest weights on like (+1), save (+3), hide (−3), community join (+4) and relevance feedback (yes +1, no −2); weights shall not fall below 0. | P0 | Weight rows change as specified |
| FEED-06 | Feed ranking shall reflect new reactions on the next feed load. | P0 | Save → reorder on refresh |
| FEED-07 | The system shall record an impression when a card is ≥ 50 % visible for ≥ 1 s, once per user per post. | P0 | One row per user/post |
| FEED-08 | If the user has no positive weights, the feed shall fall back to newest editorial posts and prompt onboarding. | P0 | Empty-state shown |

### 3.4 Culture / tag pages (CULT)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| CULT-01 | `/c/:slug` shall show name, description, child tags, related tags (edges), top posts and linked communities. | P0 | All sections render with seed data |
| CULT-02 | `/explore` shall list tags grouped by kind with a client-side name filter. | P0 | Filter narrows list |
| CULT-03 | Posts with a source URL shall display a source line (host + link); posts flagged editorial shall show an "Editorial" label. | P0 | Visible on cards and detail |
| CULT-04 | An "Add to exploring" toggle shall add/remove the tag as an interest. | P0 | Interest row toggles |

### 3.5 Communities (COMM)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| COMM-01 | `/communities` shall list communities with member counts. | P0 | Counts correct |
| COMM-02 | A member shall be able to join and leave a community. | P0 | Membership row toggles |
| COMM-03 | A community page shall show header, posts, collections, member count and curators. | P0 | Sections render |
| COMM-04 | Curator role shall be assignable by the operator (SQL/seed); users shall not be able to grant it to themselves. | P0 | Client insert with role `curator` is rejected |
| COMM-05 | A member shall be able to create a community and become its curator. | P1 | |

### 3.6 Posts and reactions (POST)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| POST-01 | A member shall be able to create a post: body 1–2000 chars, optional `https` image URL, optional source URL, 1–5 tags, optional community. | P0 | Validation messages shown |
| POST-02 | A member shall be able to like/unlike, save/unsave and hide ("Not interested") a post. | P0 | State persists |
| POST-03 | `/post/:id` shall show the post, tags, source and reaction state. | P0 | Renders |
| POST-04 | An author shall be able to delete their own post. | P0 | Others cannot |
| POST-05 | Post text shall render as plain text; no user-supplied HTML shall be rendered. | P0 | `<script>` appears as text |
| POST-06 | Comments on posts. | P1 | |
| POST-07 | Report a post or collection item. | P1 | Row in `reports` |

### 3.7 Collections and contributions (COLL)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| COLL-01 | A member shall be able to create a collection (title 1–80, description ≤ 500), personal or inside a community. | P0 | Created |
| COLL-02 | A member shall be able to propose an item to a **community** collection as a post reference, a link (+ optional note) or a note (≤ 500 chars). It shall start as `pending`. | P0 | Pending status |
| COLL-03 | Items added by the owner to a **personal** collection shall be `approved` immediately and shall not produce attestations. | P0 | No contribution row |
| COLL-04 | A collection page shall show approved items to everyone, and pending items only to the proposer and curators of that community. | P0 | Visibility per role |
| COLL-05 | A curator shall be able to approve or reject a pending item. | P0 | Status changes via server function |
| COLL-06 | The approver shall not be the proposer (enforced in server function **and** by DB check). | P0 | Self-approval returns 403 |

### 3.7b Wallet (WAL)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| WAL-01 | The app shall support wallet connection configured for Monad Testnet and prompt a network switch if needed. | P0 | Connect works on desktop and phone |
| WAL-02 | Linking shall use a server-issued single-use nonce (10-minute expiry) signed by the wallet; the server shall verify the signature before saving the address. | P0 | Replayed/expired nonce rejected |
| WAL-03 | One wallet address shall map to at most one profile and vice versa. | P0 | Second link attempt rejected |
| WAL-04 | A wallet shall not be required to browse, post, react or propose items. | P0 | |
| WAL-05 | A user shall be able to unlink a wallet. | P1 | |

### 3.8 Onchain attestation (CHAIN)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| CHAIN-01 | On approval, the server shall create a `contributions` row (unique per item) with a deterministic `content_hash` (defined in System Design §7.2). | P0 | One row per item, repeat calls don't duplicate |
| CHAIN-02 | If the contributor has a linked wallet, the server shall call `attest` through the relayer; otherwise the contribution status shall be `awaiting_wallet`. | P0 | Status matches wallet presence |
| CHAIN-03 | The server shall store `tx_hash`, wait up to 8 s for the receipt, then set `attested` on success, `failed` on revert, or leave `submitted` on timeout. | P0 | Statuses observed in testing |
| CHAIN-04 | The UI shall show a "Verified · on Monad" seal with a link to the explorer transaction for `attested` contributions. | P0 | Link opens correct tx |
| CHAIN-05 | `/verify/:address` shall read contribution counts per community **from the contract** (not the database). | P0 | Counts match the DB |
| CHAIN-06 | The relayer private key shall exist only in server environment variables. | P0 | Not present in client bundle |
| CHAIN-07 | The server shall refuse to send when the relayer balance is below a configured minimum and return a clear error. | P0 | 503 with message |
| CHAIN-08 | A user with `awaiting_wallet` contributions shall be able to claim verification after linking a wallet. | P1 | |
| CHAIN-09 | A curator shall be able to retry a `failed` attestation. | P1 | |

### 3.9 Profile (PROF)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| PROF-01 | `/u/:handle` shall show display name, "Exploring" tags, joined communities and contributions with status/seal and per-community counts. | P0 | Renders |
| PROF-02 | The owner shall be able to edit display name and interests. | P0 | Saved |
| PROF-03 | A linked wallet address shall be shown only if the user has linked it (opt-in). | P0 | Hidden otherwise |

### 3.10 Feedback and insights (FDBK)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| FDBK-01 | The feed shall show a "Was this relevant? Yes / Somewhat / No" prompt on about 10 % of cards, chosen deterministically from a hash of user id + post id so it doesn't flicker. | P0 | Same cards on reload |
| FDBK-02 | Answers shall be stored once per user per post. | P0 | Unique constraint |
| FDBK-03 | `/insights` shall show relevance rate, save rate and hide rate. | P1 | Matches SQL |

### 3.11 Seed and editorial content (SEED)
| ID | Requirement | Pri | Acceptance |
|---|---|---|---|
| SEED-01 | An idempotent seed script shall create ≥ 60 tags, ≥ 100 tag edges, ≥ 8 communities, ≥ 60 posts, ≥ 6 collections and demo accounts. | P0 | Re-running creates no duplicates |
| SEED-02 | Every seeded image shall have a recorded source URL and licence/attribution that is displayed. | P0 | Attribution visible |
| SEED-03 | Seeded posts shall be authored by an account labelled "Hailey Editorial" and flagged `is_editorial`. | P0 | Label visible |
| SEED-04 | Content shall avoid stereotyping; no flags or decorative cultural clip-art in the UI. | P0 | Design review |

---

## 4. External interface requirements

| Interface | Requirement |
|---|---|
| **UI** | Mobile-first; bottom nav (Home / Explore / Profile) on phones, top nav on desktop; light theme per design system; keyboard navigable; respects `prefers-reduced-motion`. |
| **Supabase** | `supabase-js` from the browser with anon key under RLS; service-role key only in serverless functions. |
| **Serverless API** | HTTPS JSON; `Authorization: Bearer <Supabase access token>`; same-origin only. Contracts in System Design §8. |
| **Monad JSON-RPC** | Browser: read-only calls for `/verify`. Server: send transactions and read receipts. Public endpoints are rate-limited. |
| **Wallet** | Standard EIP-1193 wallets via the connect modal; message signing only (no transactions initiated by users). |
| **Image hosts** | Hotlinked `https` images with `referrerpolicy="no-referrer"` and lazy loading. |

---

## 5. Non-functional requirements

*Numeric values are design targets, not measured results.*

### 5.1 Performance
| ID | Requirement |
|---|---|
| NFR-P1 | `get_feed` p95 ≤ 800 ms on the seeded dataset (≤ 10 000 posts). |
| NFR-P2 | LCP ≤ 2.5 s on a mid-range phone over 4G for Home and culture pages. |
| NFR-P3 | Initial JS ≤ 300 KB gzipped; wallet libraries code-split to wallet-using routes. |
| NFR-P4 | No chain reads on feed or culture pages. |

### 5.2 Security
| ID | Requirement |
|---|---|
| NFR-S1 | RLS enabled on every table; no table readable/writable beyond the policies in System Design §10. |
| NFR-S2 | Service-role key and relayer key never use the `VITE_` prefix (anything with that prefix ships to the browser). |
| NFR-S3 | All function inputs validated (schema validation); all identifiers parameterised. |
| NFR-S4 | Signature nonces single-use, expiring in 10 min, bound to user id. |
| NFR-S5 | Curator role checked server-side on every approve/reject. |
| NFR-S6 | Basic abuse limits: body/URL length limits; rate limit on `/api/*` per user. |
| NFR-S7 | Relayer wallet is testnet-only, funded minimally, and never reused elsewhere. |

### 5.3 Reliability and recoverability
| ID | Requirement |
|---|---|
| NFR-R1 | A one-command script redeploys the contract and prints the new address (testnet may be reset). |
| NFR-R2 | Approve endpoint is idempotent; repeated calls never create duplicate contributions or transactions. |
| NFR-R3 | A recorded demo video exists as fallback for RPC/testnet outage. |

### 5.4 Usability and accessibility
| ID | Requirement |
|---|---|
| NFR-U1 | Works at 360 px width without horizontal scroll (wide content scrolls inside its own container). |
| NFR-U2 | Text/background contrast aims for WCAG AA; verify with a contrast checker. |
| NFR-U3 | Images have alt text; interactive elements have visible focus states. |
| NFR-U4 | Crypto terminology avoided in user-facing copy ("Verified contribution", not "mint"). |

### 5.5 Privacy and compliance
| ID | Requirement |
|---|---|
| NFR-C1 | No personal data onchain — only hashes, addresses the user chose to link, community ids and timestamps. |
| NFR-C2 | Onchain data is immutable; the UI tells users that verified contributions are permanent. |
| NFR-C3 | Only licence-compatible images; attribution displayed. |
| NFR-C4 | Heritage/educational content shows sources; AI-generated cultural claims are out of scope for v1. |

### 5.6 Maintainability
TypeScript strict mode; SQL migrations versioned in the repo; `.env.example` maintained; README with setup, deploy and demo steps.

---

## 6. Data requirements

Entities (full DDL in System Design §3): profiles, tags, tag_edges, user_interests, communities, community_tags, memberships, posts, post_tags, post_reactions, impressions, collections, collection_items, contributions, feedback, reports, wallet_nonces.

| Rule | Detail |
|---|---|
| Retention | Demo data kept until judging ends; no automatic deletion |
| Wallet addresses | Stored lowercase; unique |
| Seed vs user data | Seed rows flagged `is_editorial`; demo accounts documented in README |
| Account deletion | Not in v1 (P2) |

---

## 7. Smart-contract requirements (`HaileyContributions`)

| ID | Requirement |
|---|---|
| SC-01 | Only the `attestor` address may call `attest`. |
| SC-02 | `attest(contributor, communityId, contentHash, kind)` shall revert if `contentHash` was already attested. |
| SC-03 | A successful call shall increment `count[contributor][communityId]` and emit `Attested`. |
| SC-04 | `attestor` shall be changeable only by the current attestor. |
| SC-05 | The contract shall store no personal data and no free text. |
| SC-06 | Foundry tests shall cover: success, non-attestor revert, duplicate-hash revert, attestor rotation. |
| SC-07 | Contract shall be verified on the block explorer if the tool supports it; otherwise source is published in the repo. |
| SC-08 | Status: testnet, unaudited. State this in the README and pitch. |

---

## 8. Traceability

| Goal | Requirements |
|---|---|
| G1 Deployed, mobile-ready | NFR-P2, NFR-U1, Architecture §7 |
| G2 Hero flow | ONB-*, FEED-*, COMM-02, COLL-02/05, CHAIN-*, PROF-01 |
| G3 Visible personalisation + why | FEED-02, FEED-05, FEED-06 |
| G4 Monad contract | SC-*, CHAIN-01–05 |
| G5 Satisfaction | FDBK-01/02, FEED-07 |

---

## 9. Acceptance test (demo script, run on production)

1. Open the public URL on a phone as a visitor; browse `/explore` and a culture page.
2. Sign up as a new user; pick 3 interests; confirm the feed shows "why" labels.
3. Save two posts sharing a tag; reload; confirm related posts rank higher.
4. Hide one post; confirm it never returns.
5. Answer one relevance prompt.
6. Join the demo community.
7. Link a wallet (sign message); confirm address on profile.
8. Create a collection item proposal in the community collection; see *Pending*.
9. In a second browser profile, sign in as the demo curator; approve the item.
10. Confirm status becomes *Verified · on Monad* and the explorer link opens a successful transaction.
11. Open `/verify/<wallet>` while logged out; confirm count = 1 for that community.
12. Try approving your own item (should fail) and re-approving the same item (no duplicate tx).

Pass = all 12 steps succeed on a clean account.

---

## 10. Out of scope (v1)
Token/rewards, DAO, DMs, follows, events, local discovery, AI assistant, vector search, ML ranking, native apps, monetisation, moderation dashboard, account deletion, cross-chain.



