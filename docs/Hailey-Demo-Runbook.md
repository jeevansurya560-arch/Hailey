# Hailey — Demo Runbook

| | |
|---|---|
| Version | 0.1 |
| Date | 2026-10-05 |
| Status | Hackathon demo |
| Target duration | **3–5 minutes** |
| Basis | PRD · SRS · Execution Plan · Test Plan |
| Audience | Judges / reviewers / technical evaluators |

> 🟠 **Demo principle:** show the smallest complete Hailey journey, not every feature.

---

## 1. Demo objective

The audience should understand one complete idea:

> **Hailey helps people discover cultures and communities, understand why content is relevant, participate through contributions, and turn an approved contribution into portable proof on Monad.**

North-star flow:

```text
Discover
  ↓
Personalize
  ↓
Understand Why
  ↓
Join
  ↓
Contribute
  ↓
Curate
  ↓
Verify
```

---

## 2. Pre-demo checklist

### 30–60 minutes before

- [ ] Production URL opens.
- [ ] Supabase project is awake.
- [ ] Demo account works.
- [ ] Demo curator account works.
- [ ] Seed content is present.
- [ ] Wallet has the correct network.
- [ ] Relayer has sufficient balance.
- [ ] Contract address is correct.
- [ ] Explorer link is reachable.
- [ ] `/verify/<address>` is known.
- [ ] Phone test has passed.
- [ ] Backup recording is ready.
- [ ] No secret is visible in browser/devtools/screen recording.

### Browser preparation

Open only the tabs needed for the demo:

1. Hailey production
2. Monad explorer
3. Optional backup recording

Do not expose:

- `.env`
- Supabase service-role credentials
- private keys
- development dashboards
- terminal output containing secrets

---

## 3. Demo sequence

### 3.1 Discovery — 0:00–0:35

**Screen:** Landing / Explore

**Action**

- Open Hailey.
- Browse Explore.
- Open a culture/topic page.

**What to say**

> “Hailey is a personalized cultural field guide. Instead of starting with a generic social feed, it lets someone explore cultures, interests and communities and then move from discovery into participation.”

**Show**

- editorial content
- topic/tags
- community context
- source-aware content

**Expected result**

The audience immediately understands that this is a discovery product, not a generic dashboard.

---

### 3.2 Personalization — 0:35–1:15

**Screen:** Onboarding → Home

**Action**

- Sign up with the demo/fresh account.
- Select three interests.
- Enter the feed.

**What to say**

> “The user explicitly tells Hailey what they are exploring. That becomes a real signal used by the feed.”

**Show**

- selected interests
- personalized ordering
- `WhyStamp`

**What to say about Why**

> “The important part is that the recommendation is explainable. The user can see the signal behind why a post appears.”

**Expected result**

The feed reflects the selected interests and the explanation corresponds to actual tags/signals.

---

### 3.3 Community — 1:15–1:45

**Screen:** Culture page / Community

**Action**

- Open a relevant community.
- Join the community.
- Open its collection.

**What to say**

> “Discovery is not the endpoint. A culture can have a community around it, and that community can curate shared collections.”

**Show**

- membership
- posts
- collection

---

### 3.4 Contribution — 1:45–2:20

**Screen:** Collection → Contribution

**Action**

- Propose an item.
- Show the pending state.

**What to say**

> “A contribution is not immediately treated as verified. It enters a curation boundary first.”

**Show**

- contributor
- item
- pending state
- collection context

**Key point**

The audience should understand that **contribution and verification are different states**.

---

### 3.5 Curation — 2:20–2:55

**Screen:** Curator interface

**Action**

- Switch to curator account if required.
- Open pending contribution.
- Approve it.

**What to say**

> “The curator approval is the trust boundary. The community decides what becomes an approved contribution before Hailey records its proof.”

**Show**

- pending → approved
- authorization boundary

**Do not claim**

- decentralized governance
- DAO voting
- token incentives
- automated cultural verification

Those are not v1 claims.

---

### 3.6 Monad verification — 2:55–3:40

**Screen:** Contribution → Explorer → `/verify/<address>`

**Action**

- Show the attestation transaction.
- Open the explorer link.
- Return to Hailey.
- Open `/verify/<address>`.

**What to say**

> “The blockchain is not the social experience. It is the verification layer. Once the contribution is approved, Hailey records a deterministic attestation on Monad.”

Then:

> “The verification page reads the contribution count from the contract itself, giving the user portable proof rather than only a database badge.”

**Show**

- `Verified · on Monad`
- transaction hash
- explorer
- `/verify/<address>`
- community count

---

## 4. Closing — 3:40–4:10

Use this closing:

> “Hailey takes a person from curiosity to participation: discover something, understand why it is relevant, join the community, contribute, have that contribution curated, and finally carry a verifiable record of it onchain.”

Then state the honest limitation:

> “This v1 uses a server-held relayer and Monad testnet, so the attestation layer is intentionally a hackathon-scale implementation rather than an audited production protocol.”

---

## 5. Failure playbook

| Failure | Do | Do not |
|---|---|---|
| Wallet popup fails | Use backup recording / show submitted state | Pretend signing succeeded |
| RPC unavailable | Show database `submitted` state and backup transaction | Claim a live transaction |
| Supabase unavailable | Use backup recording | Edit production DB during demo |
| Auth fails | Use prepared demo account or recording | Expose credentials |
| Explorer unavailable | Show saved transaction evidence | Invent a tx hash |
| Mobile issue | Continue on desktop and disclose | Claim mobile was verified |
| Seed content missing | Use verified backup content | Invent source/licence |
| Contract reverted | Show failure state and explain | Hide the failure |

---

## 6. Demo evidence pack

Keep these ready:

- production URL
- contract address
- successful explorer transaction
- demo wallet address
- `/verify/<address>` URL
- backup video
- README
- architecture diagram
- test output
- seed review

---

## 7. Claims discipline

### Safe claims

- Explainable personalization.
- User-selected interests influence discovery.
- Community contribution and curation.
- Deterministic content hashing.
- Monad testnet attestation.
- Onchain verification page.
- Testnet, unaudited contract.

### Do not claim unless independently implemented and verified

- AI-powered recommendations.
- Machine-learning ranking.
- Decentralized governance.
- Trustless curation.
- Mainnet production security.
- Audited smart contracts.
- Permanent cultural truth.
- Fully decentralized attestations.

