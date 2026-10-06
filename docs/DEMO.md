# Hailey — 3-Minute Demo Runbook

This runbook details the exact 3-minute demonstration path following the **Hero Flow**:
`Onboard → Feed with WhyStamp → Join Collective → Propose Citation → Curator Approves → Verified Seal → Onchain /verify`.

---

## Demo Script Timeline (180 Seconds)

### 0:00 – 0:30 | Introduction & Onboarding (Personalization)
- **Action**: Open `http://localhost:5173/login` in Incognito mode. Sign in as `demo_contributor@hailey.local` (Password: `HaileyDemo2026!`).
- **What to say**: *"Hailey is an autonomous cultural atlas that replaces opaque algorithmic feeds with transparent community curation and onchain verification on Monad."*
- **Action**: If prompted with `/onboarding`, select **3–5 cultural threads** (e.g. `Streetwear`, `Dub & Reggae`, `Fermentation`) and click **"Start Exploring"**.

---

### 0:30 – 1:00 | Feed & Explainability (WhyStamp)
- **Action**: Navigate to Home feed (`/`).
- **What to say**: *"Notice the WhyStamp chips on every card. Dispatches aren't served by black-box algorithms — Hailey explicitly displays the exact reasoning: 'BECAUSE · STREETWEAR + JAPANESE'. Every 5th item interleaves adjacent discovery nodes from our culture graph."*
- **Action**: Click a like button on a post, and click into a tag chip (e.g. `/c/streetwear`) to show sub-movements and graph relationships.

---

### 1:00 – 1:45 | Communities & Archival Proposal
- **Action**: Click **"Communities"** in the top navigation. Open **"Tokyo Underground & Street Culture"** (`/communities/tokyo-underground`).
- **What to say**: *"Cultural collectives curate verified archives. Let's open the community's Harajuku collection and propose a primary source citation."*
- **Action**: Open the collection (`/collections/<id>`), click **"Propose Item"**, select **"Link Citation"**, paste `https://archive.org/details/harajuku-street-1993`, add note *"Early photographic evidence of small-batch Urahara drops"*, and submit.
- **Visual**: Show the proposal entering the queue.

---

### 1:45 – 2:30 | Curator Triage & Gasless Attestation
- **Action**: Switch to a second browser window logged in as `demo_curator@hailey.local`.
- **What to say**: *"As a designated community curator, I see the pending triage queue with strict anti-self-dealing guardrails. When I click 'Approve', Hailey canonically hashes the item via EIP-712 and queues a gasless attestation on Monad Testnet."*
- **Action**: Click **"Approve"**. Show the success confirmation.

---

### 2:30 – 3:00 | Verified Seal & Monad Ledger (/verify)
- **Action**: Switch back to the contributor window. Refresh the collection page and profile (`/u/demo_contributor`).
- **What to say**: *"The contribution now holds a permanent 'Verified · on Monad' seal. Anyone in the world can inspect the contributor's public onchain ledger without requiring an account."*
- **Action**: Click **"View Onchain Ledger"** or navigate to `/verify/<wallet_address>`. Show the onchain attestation count queried directly from the Monad smart contract.

---

## Fallback & Contingency Plan
- **If RPC latency spikes**: Point to local test receipt verification (`npm run check-chain`) and the RLS audit matrix (`npm run rls-check`).
- **If wallet extension is locked**: Demonstrate via the pre-seeded demo contributor profile with existing verified attestation receipts.
