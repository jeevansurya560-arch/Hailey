# Hailey — Product Requirements Document (PRD)

| | |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-10-04 |
| Status | Active — hackathon build |
| Hard deadline | 2026-10-13 (submit in the morning; the 13th is buffer) |
| Team | Solo builder. Teammates, if they join, take content / QA / demo only |
| Related docs | `Hailey-SRS.md` · `Hailey-System-Design.md` · `Hailey-Architecture.md` |

---

## 1. Summary

**Hailey** is a personalized discovery platform where people explore cultures, communities and interests, understand them through people and sourced stories, and then **participate** by contributing to community collections. Meaningful contributions can be recorded as **verified, portable proof on Monad**.

**North star:** *Hailey helps people discover the cultures and communities they're curious about, understand them through people and stories, participate in them, and build a lasting record of meaningful contribution.*

**One-line pitch:** *Explore a culture, join its communities, and leave a verified mark of your contribution.*

---

## 2. Problem

| # | Problem | Source |
|---|---|---|
| P1 | Interest in a culture is spread across many apps (short video, forums, long video, encyclopedias, chat). The user assembles the experience themselves. | Concept doc |
| P2 | Feeds optimise for consumption (time spent), not for discovery the user actually values or for participation. | Concept doc |
| P3 | Recommendations are opaque — users can't tell why they see something. | Concept doc |
| P4 | Contribution (curating, explaining, organising) earns likes on one platform and nothing portable. | Concept doc |
| P5 | Cultural content is often unsourced or stereotyped. | Concept doc |

> **Honesty note:** these are product hypotheses, not validated findings. No user research has been done yet. See §11 for a lightweight validation plan.

---

## 3. Product principles

1. **Interest ≠ identity.** Selecting "Japanese culture" means *"I want to explore this"*, never *"I am this"*. UI copy says **Exploring**, never "My culture".
2. **Participation over consumption.** The primary unit is a *contribution*, not a follower count or watch time.
3. **Explainable discovery.** Every recommendation can answer "Why am I seeing this?" truthfully.
4. **Sources visible.** Educational/heritage content shows author, date and link.
5. **Crypto is invisible.** Users see "Verified contribution"; wallets are optional and only needed for verification.
6. **No token, no financialisation** in v1. No earn-per-like mechanics.

---

## 4. Goals and non-goals

### Goals (by 2026-10-13)
| ID | Goal | Measure of done |
|---|---|---|
| G1 | A **deployed, public** web app that works on a phone | Public URL; hero flow completes on mobile |
| G2 | The **hero flow** works end to end | See §6, J1–J4 |
| G3 | The feed **visibly changes** from user actions, with a truthful "why" | Save a post → next feed load reorders |
| G4 | One meaningful **Monad contract** with real transactions | Attestation tx visible on the block explorer |
| G5 | **Satisfaction is measured** inside the product | Relevance prompt stores answers |

### Non-goals (v1)
Token or rewards; DAO/governance; direct messages; follow-user; events; local ("near you") discovery; AI chat assistant; ML recommender; semantic/vector search; native mobile app; monetisation; full moderation tooling; star-rating reputation.

---

## 5. Users and personas

*Personas are illustrative, not research-derived.*

| Persona | Needs | Primary actions |
|---|---|---|
| **Explorer** (primary) — curious about cultures they don't belong to or want to go deeper in | Find relevant material fast; understand context; avoid generic feeds | Onboard, browse feed, save, join communities |
| **Contributor** — wants to add context or resources | A low-friction way to add to a community; credit that outlasts one app | Propose collection items, link wallet, view verified badge |
| **Curator** — runs a community | Quality control; lightweight approval | Approve/reject items, which triggers attestation |
| **Evaluator** (judge, hackathon) — secondary stakeholder | Understand the idea in 3 minutes; see it work; see why onchain | Watches demo, opens public URL, checks `/verify` |

---

## 6. Core user journeys (the hero flow)

```text
J1 Onboard ─► J2 Explore + Join ─► J3 Contribute ─► J3b Approve + Attest ─► J4 Verify
```

| Journey | Steps | Success condition |
|---|---|---|
| **J1 Onboarding → first feed** | Sign up → "What are you curious about?" → pick ≥3 interests → land on a feed where every card has a "why" | First personalised card visible in < 60 s from sign-up |
| **J2 Explore → join** | Tap a tag/culture page → see sub-topics, related topics, posts, communities → join a community | Membership recorded; community content boosted in feed |
| **J3 Contribute** | In a community collection, propose an item (post, link or note) | Item shows as *Pending* to the contributor |
| **J3b Approve → attest** | Curator opens pending items → approves → server sends attestation tx | Contribution shows *Verified · on Monad* with explorer link |
| **J4 Verify** | Anyone opens `/verify/<wallet>` | Counts per community are read **directly from the chain**, not our database |

The demo uses **two accounts** (contributor + curator) in two browser profiles.

---

## 7. Feature scope

**Priority key:** P0 = must ship · P1 = only if ahead · P2 = roadmap (pitch only)

| ID | Feature | Pri | Notes |
|---|---|---|---|
| F-01 | Email + password auth | P0 | Confirmation off for demo reliability |
| F-02 | Interest onboarding (pick ≥3) | P0 | Weights seeded at 5 |
| F-03 | Taxonomy + culture (tag) pages | P0 | Hierarchy + related-tag edges |
| F-04 | Personalised feed with "Why you're seeing this" | P0 | Tag-weight scoring + exploration slots |
| F-05 | Communities: list, join/leave, page | P0 | Seeded; curator role seeded |
| F-06 | Posts (text + image URL + source URL + tags) | P0 | No file upload |
| F-07 | Like / save / "not interested" | P0 | Drive interest weights |
| F-08 | Collections + propose items | P0 | Contribution mechanism |
| F-09 | Curator approve / reject | P0 | Approver ≠ contributor |
| F-10 | Wallet link (signed message) | P0 | Optional for non-contributors |
| F-11 | Onchain attestation on Monad | P0 | One contract, relayer-paid gas |
| F-12 | Verified profile + `/verify/<address>` | P0 | Chain-read page |
| F-13 | "Was this relevant?" prompt | P0 | Yes / Somewhat / No |
| F-14 | Seed content (editorial) | P0 | Without it the app looks empty |
| F-15 | Comments | P1 | |
| F-16 | Search (tags, communities, text) | P1 | Postgres text search / ILIKE |
| F-17 | Satisfaction stats card | P1 | Relevance / save / hide rates |
| F-18 | Report button | P1 | Writes a row; no moderation UI |
| F-19 | Image upload | P1 | URL-only in P0 |
| F-20 | Dark mode | P1 | Tokens exist from day 1 |
| F-21 | Culture map (graph visual) | P1 | Time-box 3 h |
| F-22 | Claim-verification for contributions approved before a wallet was linked | P1 | |
| F-23+ | Follow, events, local discovery, AI tagging, semantic search, reputation levels, cross-community portable reputation, creator monetisation | P2 | Roadmap slide only |

---

## 8. Success metrics

*Targets, not measurements — nothing has been measured yet. With a handful of testers these are directional only.*

| Metric | Definition | Demo target |
|---|---|---|
| Time to first value | Sign-up → first feed card | < 60 s |
| Hero-flow completion | New tester completes J1–J4 unaided | ≥ 4 of 5 testers |
| Relevance rate | (yes + somewhat) ÷ all relevance answers | ≥ 60 % |
| Save rate | saves ÷ impressions | tracked; no target |
| Hide rate | hides ÷ impressions | tracked; lower is better |
| Availability | Public URL up during judging window | no downtime; backup demo video ready |
| Load | Largest contentful paint on a mid-range phone, 4G | ≤ 2.5 s |

---

## 9. Positioning

| It is not | Because |
|---|---|
| Instagram | Primary unit isn't the follower |
| Reddit | Primary unit isn't the subreddit; discovery starts from interests |
| Wikipedia | Not just an encyclopedia; people participate and curate |
| TikTok | Not optimised for infinite consumption |
| A DAO / SocialFi / "crypto app" | No governance, no token, crypto stays behind the scenes |

Closest mental model: *Pinterest + Reddit + cultural discovery + explainable personalisation + contribution records.* Do not pitch it as a combination of existing apps; pitch the loop (discover → participate → verified record).

---

## 10. Why onchain (answer for judges)

> Hailey treats cultural contribution as something that can carry portable, persistent reputation. An onchain attestation lets a person's contribution to a community exist beyond one feed or one database, and lets anyone verify it without trusting Hailey.

**What goes onchain:** only a hash of the approved contribution, the contributor's address, the community id and a timestamp. No personal data, no content.

**Honest limitations (say them before a judge does):**
- v1 uses a single **relayer** key, so attestations are only as trustworthy as Hailey's curators and server.
- Upgrade path: curators sign EIP-712 approvals that the contract verifies, removing the single trusted writer.
- Testnet only; contract unaudited.

---

## 11. Assumptions, risks, dependencies

| # | Item | Type | Mitigation |
|---|---|---|---|
| R1 | Solo, 9 days | Constraint | P0/P1 split; slip rule: drop next P1 item, never compress Oct 11–12 |
| R2 | Unfamiliar Web3 tooling | Risk | Contract + relayer tx done by Oct 5; Remix fallback |
| R3 | Empty-app problem | Risk | Seed 60 posts, 8 communities, 6 collections; label as "Editorial" |
| R4 | Testnet resets / RPC downtime | Risk | One-command redeploy script; address in env; backup demo video |
| R5 | Hackathon rules unknown (network, criteria, video length) | Dependency | See §13 open questions |
| R6 | Image licensing | Risk | Only Wikimedia Commons / Unsplash-style sources, with attribution stored |
| R7 | Demo credentials are public | Risk | Demo curator scoped to demo community only; testnet only |
| R8 | Free-tier limits / pausing | Risk | Keep project warm; smoke test on Oct 12 |

**Lightweight validation plan (stretch):** show the demo to 5 classmates, ask "what would you do next?" and record the relevance prompt answers. Use the result in the pitch only as anecdotal evidence.

---

## 12. Milestones

| Date | Milestone |
|---|---|
| Oct 4 | Scaffold, Supabase schema, auth, **deployed skeleton** |
| Oct 5 | Contract on testnet, relayer tx works, wallet connect works on a phone |
| Oct 6 | Taxonomy seed, onboarding |
| Oct 7 | Communities, posts, reactions, interest-weight trigger |
| Oct 8 | Feed (`get_feed`), why-stamp, culture pages, relevance prompt |
| Oct 9 | Collections, contribute, curator approval |
| Oct 10 | Approve → attest wiring, wallet link, verified badge, `/verify` |
| Oct 11 | Full seed content, mobile pass, bug fixes — **feature freeze end of day** |
| Oct 12 | README, diagrams, demo video, fresh-account test on production |
| Oct 13 | Submit in the morning |

---

## 13. Open questions (answer before Oct 6)

1. Does the hackathon require **mainnet**, or is testnet acceptable?
2. What are the **judging criteria** and tracks? Tune the pitch to them.
3. Required **submission format** (repo link, video length, deck)? Is open-source required?
4. Any **required Monad features** (e.g. a specific SDK or contract pattern)?
5. Is a **custom domain** expected, or is a `*.vercel.app` URL fine?
