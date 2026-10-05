# Hailey — UI/UX Specification

| | |
|---|---|
| Version | 0.1 |
| Date | 2026-10-05 |
| Status | Active — hackathon build |
| Authority | Existing Hailey Field Guide design system / System Design §11 |
| Basis | `src/styles/tokens.css` · PRD · SRS · Execution Plan |

> 🟡 **Design principle:** Hailey should feel like a cultural field guide with a tactile editorial character — not a generic SaaS dashboard and not a conventional social-media clone.

---

## 1. Existing visual authority

The implementation already establishes the core design tokens:

| Token | Value / role |
|---|---|
| `--paper` | `#F7F2E8` |
| `--paper-2` | `#EFE8D8` |
| `--ink` | `#1B1712` |
| `--ink-2` | `#5B5448` |
| `--line` | `#D9D0BC` |
| `--clay` | `#B8452E` |
| `--saffron` | `#D9942A` |
| `--moss` | `#4F7A57` |
| `--indigo` | `#3347A8` |
| `--rose` | `#C0527E` |
| `--teal` | `#2A8C8C` |
| `--plum` | `#7A4A7A` |
| `--onchain` | `#836EF9` |
| `--radius` | `6px` |
| `--shadow-hard` | `3px 3px 0 var(--ink)` |

**Important:** `--onchain` is reserved for verification/onchain meaning. It should not become a general brand accent.

---

## 2. Typography

Existing direction:

- **Fraunces** — display/editorial headings.
- **DM Sans** — body and interface.
- **JetBrains Mono** — metadata, technical states and `WhyStamp`.

### Rules

- Use display serif for editorial hierarchy.
- Use sans-serif for readable interface text.
- Use monospace sparingly for metadata and system-like labels.
- Avoid using monospace for paragraphs.
- Maintain clear contrast between editorial content and technical verification.

---

## 3. Colour semantics

Colours communicate meaning rather than decoration.

| Colour family | Use |
|---|---|
| Clay | Primary action / emphasis |
| Saffron | Warm secondary interest |
| Moss | Culture/nature-oriented thread |
| Indigo | Interest/category thread |
| Rose | Social/community thread |
| Teal | Secondary information |
| Plum | Additional thread |
| Onchain purple | Verified/onchain only |
| Ink | Text/borders |
| Paper | Primary surface |

Do not introduce arbitrary hard-coded colours in components when a token already exists.

---

## 4. Design principles

### 4.1 Field guide, not dashboard

Prefer:

- editorial cards
- topic relationships
- cultural context
- source metadata
- readable stories
- tactile borders

Avoid:

- KPI dashboard grids
- dense admin panels
- generic SaaS cards
- unnecessary charts

### 4.2 Explainability is visible

The `WhyStamp` is a product feature, not decorative UI.

Example:

```text
BECAUSE · STREETWEAR + PHOTOGRAPHY
```

It must correspond to actual feed signals.

### 4.3 Onchain meaning is explicit

Use verification styling only when a contribution has actually reached the attested state.

Never style a pending contribution as verified.

---

## 5. Global component rules

### Buttons

Primary buttons:

- strong contrast
- clear verb
- obvious disabled state
- keyboard focus
- loading state

### Cards

Cards should:

- preserve hierarchy
- show content first
- keep metadata secondary
- provide obvious action targets
- never hide essential content behind hover-only interaction

### Tags

Tags should:

- remain readable without colour
- use colour as reinforcement
- preserve semantic labels

### Status chips

Required states include:

- pending
- approved
- awaiting wallet
- submitted
- attested
- failed

Status text must remain understandable without colour.

---

## 6. Screen contracts

### Landing

| Field | Specification |
|---|---|
| Purpose | Explain Hailey and invite exploration |
| Primary action | Explore |
| Secondary action | Sign up |
| Loading | Minimal shell |
| Error | Clear retry |
| Mobile | Single-column |
| Accessibility | Keyboard navigation + visible focus |

### Onboarding

| Field | Specification |
|---|---|
| Purpose | Capture explicit interests |
| Primary action | Continue |
| Data | Tags/interests |
| Loading | Selection remains stable |
| Error | Explain persistence failure |
| Empty | Require enough selection for useful feed |
| Mobile | Large touch targets |

### Feed

| Field | Specification |
|---|---|
| Purpose | Personalized discovery |
| Primary action | Open post |
| Secondary actions | Save / hide / relevance |
| Data | `get_feed` + post rows |
| Key feature | `WhyStamp` |
| Empty | Editorial fallback + onboarding path |
| Error | Retry without losing current state |

### Explore

| Field | Specification |
|---|---|
| Purpose | Public discovery |
| Primary action | Open culture/topic |
| Data | Explore results |
| Visitor access | Yes |

### Culture page

Show:

- topic identity
- related tags
- sourced stories/posts
- relevant community
- collection where available
- join/explore actions

### Community

Show:

- community identity
- membership state
- posts
- collections
- contribution path
- curator state where authorized

### Collection

Show:

- collection title
- description
- ordered items
- contributor information
- item status
- verified seal only when attested

### Contribution

Show:

```text
Draft / pending
        ↓
Approved / rejected
        ↓
Awaiting wallet / submitted
        ↓
Attested / failed
```

Do not collapse these into one generic "verified" state.

### Curator

Curator-only actions must be clearly separated from member actions.

The interface should make it obvious:

- what is pending
- who contributed it
- what will happen on approval
- what cannot be undone onchain

### Verified contribution

Use:

- onchain purple
- `Verified · on Monad`
- explorer link
- transaction hash where appropriate

### `/verify/<address>`

The page must distinguish:

- wallet address
- community
- onchain count

The count must come from the contract according to the SRS.

---

## 7. Responsive requirements

Minimum supported viewport: **360px**.

### Required

- no horizontal overflow
- readable body text
- touch targets approximately ≥40px
- mobile bottom navigation remains usable
- forms remain visible above keyboard
- cards do not require hover
- long wallet addresses wrap safely
- explorer links remain reachable
- tables become scrollable or stacked where required

---

## 8. Accessibility

- Semantic buttons and links.
- Visible keyboard focus.
- Form labels.
- Meaningful `alt` text.
- Status not conveyed by colour alone.
- Sufficient text contrast.
- Reduced-motion support.
- Error messages associated with inputs.
- No essential hover-only behaviour.

---

## 9. Motion

Motion should clarify:

- navigation
- loading
- state changes
- feedback

Avoid:

- continuous decorative animation
- long transitions
- animation that delays the hero flow

The demo should remain fast even with motion disabled.

---

## 10. Content states

Every major asynchronous surface needs:

```text
Loading
Empty
Error
Success
```

Examples:

### Feed loading

Use lightweight placeholders without shifting the layout.

### Feed empty

Explain why the feed is empty and provide onboarding/fallback content.

### Contribution failure

Show the exact user-relevant state:

```text
Attestation failed.
Your contribution is still recorded.
Try again when the network/relayer is available.
```

Do not claim verification.

---

## 11. UI acceptance checklist

- [ ] Field Guide visual language remains intact.
- [ ] Tokens are reused.
- [ ] No arbitrary hard-coded colours.
- [ ] `WhyStamp` matches actual feed signals.
- [ ] Onchain purple appears only for onchain meaning.
- [ ] Pending is visually different from attested.
- [ ] Mobile works at 360px.
- [ ] Keyboard navigation works.
- [ ] Empty/error/loading/success states exist.
- [ ] No generic dashboard drift.
- [ ] No unimplemented feature is represented as available.

