# Hailey — Definition of Done

| | |
|---|---|
| Version | 0.1 |
| Date | 2026-10-05 |
| Status | Release gate |
| Basis | PRD · SRS · Execution Plan · Task Specification · Test Plan |

> ⚫ **Central rule:** **CODE EXISTING ≠ FEATURE COMPLETE.**

A feature is Done only when the implementation, behaviour, security boundary, tests, UI states, production behaviour and acceptance evidence are complete.

---

## 1. Universal DoD

Every P0 feature must satisfy:

- [ ] Requirement identified.
- [ ] Existing architecture followed.
- [ ] Implementation complete.
- [ ] Typecheck passes.
- [ ] Lint passes where applicable.
- [ ] Build passes.
- [ ] Relevant automated tests pass.
- [ ] Loading state handled.
- [ ] Empty state handled.
- [ ] Error state handled.
- [ ] Success state handled.
- [ ] Authorization/security checked.
- [ ] Mobile behaviour checked where applicable.
- [ ] Production behaviour checked where applicable.
- [ ] `PROGRESS.md` updated.
- [ ] No unrelated scope added.

---

## 2. Database DoD — `DoD-DB`

- [ ] New schema change uses a numbered migration.
- [ ] Applied migration was not edited.
- [ ] Constraints are present.
- [ ] Foreign keys are correct.
- [ ] Indexes are appropriate.
- [ ] RLS is enabled.
- [ ] Policies are tested.
- [ ] Functions/triggers are tested.
- [ ] Seed operation is idempotent.
- [ ] Recovery/rollback implications are understood.

---

## 3. API DoD — `DoD-API`

- [ ] Authentication verified.
- [ ] JWT/session checked.
- [ ] Authorization checked server-side.
- [ ] Input validated.
- [ ] Invalid input returns safe error.
- [ ] No secret leaks.
- [ ] Service-role access is server-only.
- [ ] Success path tested.
- [ ] Failure path tested.
- [ ] Duplicate request behaviour defined.

---

## 4. Frontend DoD — `DoD-FE`

- [ ] SRS behaviour implemented.
- [ ] Existing design tokens used.
- [ ] No arbitrary colour drift.
- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Success state exists.
- [ ] Keyboard interaction works.
- [ ] Mobile layout works at 360px.
- [ ] No unimplemented feature is presented as available.

---

## 5. Security DoD — `DoD-SEC`

- [ ] Browser treated as untrusted.
- [ ] RLS verified.
- [ ] API authorization verified.
- [ ] Curator authorization verified.
- [ ] Self-approval blocked.
- [ ] Wallet nonce replay blocked.
- [ ] Duplicate attestation blocked.
- [ ] XSS boundary reviewed.
- [ ] Server-only secrets protected.
- [ ] No private key in bundle/Git/logs.
- [ ] Security failures produce safe errors.

---

## 6. Smart-contract DoD — `DoD-CHAIN`

- [ ] Contract compiles.
- [ ] `forge test` passes.
- [ ] Attestor restriction tested.
- [ ] Duplicate hash restriction tested.
- [ ] Count increment tested.
- [ ] Event emission tested.
- [ ] Attestor rotation tested.
- [ ] Zero-address protection tested.
- [ ] No personal/free text stored.
- [ ] Testnet status documented.
- [ ] Unaudited status documented.

---

## 7. Wallet DoD — `DoD-WAL`

- [ ] Wallet can connect.
- [ ] Wrong chain is detected.
- [ ] Network switching is handled.
- [ ] Server nonce is generated.
- [ ] Signature is verified server-side.
- [ ] Nonce cannot be reused.
- [ ] Wallet association persists.
- [ ] User rejection has a safe UI state.
- [ ] Real wallet popup manually verified.

---

## 8. Attestation DoD — `DoD-ATT`

- [ ] Contribution is approved before attestation.
- [ ] Contributor identity is correct.
- [ ] Deterministic content hash is used.
- [ ] Duplicate attestation is prevented.
- [ ] Relayer is server-only.
- [ ] Balance threshold is checked.
- [ ] Transaction hash is stored.
- [ ] Receipt is awaited according to the existing timeout.
- [ ] Success becomes `attested`.
- [ ] Revert becomes `failed`.
- [ ] Timeout can remain `submitted`.
- [ ] Explorer link is correct.
- [ ] Verified UI appears only after actual attestation.

---

## 9. Mobile DoD — `DoD-MOB`

At minimum:

- [ ] 360px viewport checked.
- [ ] No horizontal overflow.
- [ ] Touch targets are usable.
- [ ] Forms remain usable with keyboard.
- [ ] Navigation does not cover content.
- [ ] Feed cards are readable.
- [ ] Contribution flow works.
- [ ] Wallet flow is manually checked.
- [ ] `/verify` remains readable.

---

## 10. E2E DoD — `DoD-E2E`

The complete hero flow must work:

```text
Discover
→ Personalize
→ Understand Why
→ Join
→ Contribute
→ Curate
→ Verify
```

Acceptance:

- [ ] Fresh account.
- [ ] Three interests.
- [ ] Personalized feed.
- [ ] Why explanation.
- [ ] Community join.
- [ ] Collection.
- [ ] Contribution.
- [ ] Curator approval.
- [ ] Wallet.
- [ ] Monad attestation.
- [ ] Verified state.
- [ ] `/verify/<address>`.
- [ ] No manual database edits.

---

## 11. Content DoD — `DoD-CONTENT`

- [ ] Minimum seed targets satisfied.
- [ ] Seed is idempotent.
- [ ] Sources reviewed.
- [ ] Image licences reviewed.
- [ ] Attribution recorded.
- [ ] No fabricated claims.
- [ ] No unsupported cultural assertions.
- [ ] Hero journey has complete content.
- [ ] `SEED-REVIEW.md` reviewed.

---

## 12. Documentation DoD — `DoD-DOC`

- [ ] PRD accurate.
- [ ] SRS accurate.
- [ ] Architecture accurate.
- [ ] Execution Plan accurate.
- [ ] Task Spec accurate.
- [ ] Test Plan accurate.
- [ ] Security Model accurate.
- [ ] Content Plan accurate.
- [ ] Definition of Done accurate.
- [ ] README explains setup/demo.
- [ ] `PROGRESS.md` reflects reality.
- [ ] No secrets in documentation.

---

## 13. Demo DoD — `DoD-DEMO`

- [ ] Demo takes ≤5 minutes.
- [ ] Hero journey is complete.
- [ ] Demo account works.
- [ ] Curator account works.
- [ ] Wallet prepared.
- [ ] Explorer transaction available.
- [ ] `/verify` works.
- [ ] Backup recording exists.
- [ ] Failure fallbacks prepared.
- [ ] No false claims.

---

## 14. Production release DoD — `DoD-PROD`

- [ ] Public URL works.
- [ ] Fresh signup works.
- [ ] Production feed works.
- [ ] Community flow works.
- [ ] Contribution works.
- [ ] Curator approval works.
- [ ] Attestation works.
- [ ] Verification works.
- [ ] Mobile hero flow works.
- [ ] No secrets exposed.
- [ ] Repository is clean.
- [ ] README setup is truthful.
- [ ] Limitations are disclosed.

---

## 15. Submission DoD — `DoD-REL`

Before submission:

- [ ] Production URL recorded.
- [ ] Repository URL recorded.
- [ ] Demo video works.
- [ ] README is complete.
- [ ] Architecture diagram is present.
- [ ] Test evidence is present.
- [ ] Contract address recorded.
- [ ] Explorer link works.
- [ ] Testnet/unaudited disclosure included.
- [ ] Hackathon rules rechecked.
- [ ] Submission fields reviewed.
- [ ] No secrets in repository/history.
- [ ] Feature freeze respected.

---

## 16. Completion states

| State | Meaning |
|---|---|
| `NOT STARTED` | Work has not begun |
| `IN PROGRESS` | Implementation underway |
| `CODE COMPLETE` | Code exists |
| `TESTED` | Automated/relevant tests pass |
| `HUMAN VERIFIED` | Required manual checks passed |
| `PRODUCTION VERIFIED` | Live deployment passes |
| `DONE` | All applicable DoD gates pass |

> A task must not be labelled `DONE` merely because its code exists.

