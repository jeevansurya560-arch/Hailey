# Hailey — Hackathon Submission

## Project Name
**Hailey — Autonomous Cultural Atlas & Onchain Archival Ledger**

---

## Elevator Pitch
Hailey replaces black-box recommendation algorithms with an open cultural graph and transparent community curation. Contributors document underground movements and heritage traditions, earning cryptographic verification seals on the **Monad Testnet** blockchain.

---

## The Problem
Modern social platforms rely on opaque, engagement-maximizing algorithms that commodify culture, flatten subcultures into viral trends, and offer zero verifiable provenance for historical documentation. Contributors who preserve niche cultural history have no tamper-proof proof of attribution.

---

## The Solution & "Why Onchain?"
1. **Explainable Curation**: Recommendation reasons are transparently computed in-database using open graph dot-products (`WhyStamp`), completely demystifying content distribution.
2. **Anti-Self-Dealing Governance**: Community collectives curate archival collections where curator decisions are enforced by database check constraints and smart contracts.
3. **Immutable Provenance on Monad**: Each approved citation is canonically serialized and hashed with Keccak256, minted on Monad Testnet via a gasless relayer. Anyone can verify contribution counts directly from the contract (`/verify/:address`) without platform lock-in.

---

## Key Features
- **Culture Graph Taxonomy**: 65+ curated cultural threads with 148 thematic adjacency edges.
- **Explainable Feed**: Dot-product in-database ranking with exponential decay and serendipitous exploration interleaving.
- **Curator Triage Workflow**: Multi-party review queue for community collection items.
- **Gasless Monad Attestations**: EIP-712 hashing and automated transaction relaying.
- **Zero-Knowledge Preference Privacy**: 17 PostgreSQL Row-Level Security (RLS) policies guaranteeing that private interaction vectors can never be scraped or leaked.

---

## What's Next for Hailey
- **Decentralized Multi-Sig Curation**: Upgrading from single-curator approval to threshold m-of-n community attestations.
- **IPFS / Arweave Permanent Media Pinning**: Decentralized asset archiving for primary media sources.
- **Decentralized Identity (DID) Integration**: Cross-chain reputation badges for verified cultural archivists.
