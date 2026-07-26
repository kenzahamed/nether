# Nether Framework — Settings Binding Recovery Plan

**Date:** 2026-07-27  
**Status:** Implemented — see `SETTINGS_BINDING_RECOVERY_IMPLEMENTATION_REPORT.md`  
**Inputs:** `SETTINGS_BINDING_AUDIT.md`, `SETTINGS_BINDING_INVENTORY.md`  
**Goal:** Eliminate the largest number of merchant-visible binding bugs with the fewest architectural changes

---

## Guiding principles

1. **Shared architecture first** — fix the Hero-shell contract once; do not patch each section ad hoc.
2. **Extend, don’t rebuild** — keep Hero as the reference; teach consumers to honor the same contract.
3. **Rebind, don’t delete** — merchant settings stay; dead *bindings* are repaired (Sprint 3 policy).
4. **Snippets before sections** — prefer `nether-hero-media`, shells, cards, shared CSS.
5. **No parallel systems** — no second height engine, no second position grid.
6. **Stop after each approved phase** — wait for explicit go-ahead before the next phase.

---

## Strategy overview

```
Phase 0  Contract freeze (docs + acceptance tests)     ← no product code
Phase 1  Shared Hero-shell binding contract            ← highest leverage
Phase 2  Shared media-type contract                    ← QA media failures
Phase 3  Shared leaf dual-read + CSS token hygiene     ← Sprint 3 leftovers
Phase 4  Framework-specific dishonest surfaces         ← last mile
Phase 5  Differentiation / UX polish (optional)        ← weak-but-wired controls
```

**Estimated defect collapse:**

| Phase | Architecture issues addressed | Est. bugs removed |
|-------|-------------------------------|-------------------|
| 1 | A, B, (partial D height), (partial H docs) | ~14–20 |
| 2 | D (media overrides policy), E, F (UX model) | ~8–12 |
| 3 | I (mitigation), J, K | ~10–18 |
| 4 | L, M | ~5–8 |
| 5 | G (policy), H (preset deltas) | ~3–6 merchant complaints |

---

## Phase 0 — Contract freeze (no code)

**Purpose:** Define the single source of truth before touching Liquid/CSS.

### Deliverables (documentation only)

1. **Hero Shell Binding Contract** — which settings map to which classes / CSS vars / required DOM nodes:
   - Height → `nether-hero--height-*` + `--nether-hero-min-height` + adapt absolute-fill rules
   - Width → `nether-hero--width-*` + `--nether-hero-content-width` + requires `.nether-hero__content`
   - Position → `nether-hero--position-*` + requires `.nether-hero__content-shell`
   - Alignment → snippet `*--align-*` (independent of shell)
   - Media type → `nether-hero-media` adapter only
2. **Layout override policy** — when may layout presets override height/media? (recommend: never silently; either hide the setting via `visible_if` or make layout set the default once)
3. **Responsive width policy** — document Sprint 5 mobile `100%` as intentional; optional future “respect merchant width on mobile” flag
4. **Acceptance matrix** — Theme Editor change → expected storefront delta for Hero, Banner, Content, CTA (golden paths)

**Exit criteria:** Contract approved. No code yet.

---

## Phase 1 — Shared Hero-shell binding contract (highest leverage)

**Priority:** 1 — Shared architecture  
**Issues:** A, B, partial D  

### 1.1 Shared adapt / height rules (CSS)

**Fix locus (preferred):** `assets/component-hero.css` (+ thin framework overrides)

- Ensure adapt absolute-fill rules are available to **all** `.nether-hero--height-adapt` consumers (already in hero.css — do not duplicate per framework).
- Stop framework CSS from blindly killing height **unless** the section intentionally has no height setting:
  - **Option A (recommended):** Sections without a height setting must **not** emit adapt `::before` spacers; media sizing uses framework-native rules only.
  - **Option B:** Introduce an explicit shared height setting on Content/CTA/… (larger scope — only if product requires parity with Banner).

**Default recommendation:** Option A for recovery speed (remove broken binding first). Option B only if merchants demand height on those sections.

### 1.2 Stop orphan adapt spacers (Liquid pattern)

**Fix locus:** Shared pattern in Content / CTA / FAQ / Newsletter / Testimonials section `{% style %}` blocks

- Gate `::before` padding-bottom behind the same condition Hero uses: height mode is adapt **and** height-adapt class is present.
- If section has no height setting → **remove** the orphan spacer emission (rebinding honesty).

### 1.3 Shell-gated modifiers (Liquid pattern)

**Fix locus:** Content / CTA (and any copy-paste preambles)

- Only append `nether-hero--position-*` / `nether-hero--width-*` when `uses_hero_shell` (or equivalent consumer) is true.
- OR always render a minimal content-shell wrapper when those settings are exposed (prefer gating classes if layouts intentionally omit shell).

### 1.4 Layout vs height override clarity

**Fix locus:** `component-hero.css` + Hero/Banner schema `visible_if`

- When layout is `fullscreen`, either:
  - hide height control (`visible_if`), or
  - stop layout CSS from forcing `100svh` when an explicit height class is set (specificity / order contract).

**Do not** invent a second height system in Banner/Content CSS.

### Phase 1 exit criteria

- No orphan adapt `::before` without `--height-adapt`
- Position/width classes never applied without a consumer
- Hero + Banner + Content + CTA manual TE QA pass for height/width/position on primary layouts
- Theme Check clean on touched Liquid

**Stop and await approval before Phase 2.**

---

## Phase 2 — Shared media-type contract

**Priority:** 2 — Shared snippets / schema consistency  
**Issues:** D (media), E, F  

### 2.1 Single option set for section media

**Fix locus:** FAQ + Testimonials schemas (align to Hero/Banner)

- Add `background_video` to section `*_media_type` options **or** remove `background_video` from `visible_if` (choose one — prefer full parity with Hero).
- Keep block-level FAQ media consistent with section policy.

### 2.2 Layout must not silently override media_type

**Fix locus:** `snippets/nether-hero-media.liquid`

- **Recommended policy:** Layout presets may *default* media type in schema presets, but runtime adapter must not force `background_video` when the merchant selected another type.
- If a layout *requires* background video, hide media_type via `visible_if` for that layout instead of overriding.

### 2.3 External video merchant model

**Fix locus:** Schema labels/info + optional schema option (careful)

- Short term: clarify `info` that External URL is used when media type is Video / Background Video (Sprint 4 info keys).
- Medium term (optional): add explicit `external_video` value that maps to the existing URL branch in `nether-hero-media` / `nether-media-render` — **only if** it doesn’t break existing saved settings (map legacy video+URL → external).

### Phase 2 exit criteria

- FAQ/Testimonials media options match visible_if
- Changing media type on Hero/Banner/Content/CTA/Newsletter visibly switches image / deferred video / background video / URL embed
- No silent layout force without matching Theme Editor visibility

**Stop and await approval before Phase 3.**

---

## Phase 3 — Shared leaves + token hygiene

**Priority:** 3 — Shared utilities / snippets  
**Issues:** J, K, mitigation of I  

### 3.1 Dual-read leaves (Sprint 3 pattern)

**Fix locus:**

- Trust badge snippets (Hero/Footer/Testimonials)
- Divider core + wrappers (`nether-divider` + `nether-*-divider`)

Apply dual-read the same way feature_list / statistic were recovered — **do not** rename schema IDs (no merchant data loss).

### 3.2 Duration / transition token alias

**Fix locus:** Shared CSS convention

- Standardize on one name (`--nether-*-duration` **or** `--*-transition-duration`)
- Provide CSS aliases so both writes resolve during migration
- Fix Collection page animation speed consumer gap

### 3.3 Stop writing unused CSS vars

**Fix locus:** Footer / Collection page / Newsletter style blocks

- Remove dead var *writes* only when an alternate live binding already exists (padding pattern)
- Or wire the var into real CSS — prefer wire if the setting is merchant-facing and currently inert

### 3.4 Prefix drift mitigation (without mass rename)

**Do not** mass-rename Banner/Content IDs in this recovery (breaks existing section JSON).

Instead:

- Keep `nether-hero-media` as the **only** media settings adapter
- Document ID map in contract (Phase 0)
- Any new shared snippet must accept an `adapter` / explicit param object — never assume generic `nether_*`

### Phase 3 exit criteria

- Trust/divider dual-read verified across consumers
- Zero known unused `--nether-*` writes from the gap list
- Collection page animation speed visibly works

**Stop and await approval before Phase 4.**

---

## Phase 4 — Framework-specific dishonest surfaces

**Priority:** 4 — Framework-specific  
**Issues:** L, M, residual C  

### 4.1 Media default CTA label

**Fix locus:** `snippets/nether-media-card.liquid`  
Mirror product/collection fallback for `nether_default_cta_label`.

### 4.2 Newsletter integration provider

**Choose one:**

- Implement minimal JS consumer, **or**
- Hide/remove from merchant schema once approved (rebinding policy prefers implement-or-hide; do not leave theater)

### 4.3 Product source modes

**Fix locus:** `sections/nether-product.liquid`  
Real sort/filter for `best_sellers` / `trending`, **or** constrain schema options to honest modes.

### 4.4 Showcase position vs layout

**Fix locus:** Product/Collection showcase CSS  

- When layout forces `position: relative` content, hide position setting via `visible_if`, **or**
- Provide an alternate non-overlay position mapping for those layouts

### 4.5 Collection page path gating

- Document that Nether position applies in premium card mode
- Optionally pass through equivalents for Dawn path, or hide setting when not premium

### Phase 4 exit criteria

- No known schema theater remaining from the L list (or explicitly accepted deferred with TE hide)
- Position setting either works or is hidden per layout/mode

**Stop and await approval before Phase 5.**

---

## Phase 5 — Differentiation & responsive policy (optional polish)

**Priority:** 5 — Merchant clarity for wired-but-weak controls  
**Issues:** G, H  

### 5.1 Banner height preset differentiation

Widen Banner min-height steps (still one system — only token values), e.g. closer to Hero proportions scaled down — **only after** Phase 1 confirms binding honesty.

### 5.2 Mobile content width policy

Pick one and document:

- **Keep Sprint 5 fluidization** (recommended for overflow safety) + Theme Editor `info` that width applies from tablet up
- **Or** introduce a merchant toggle “Constrain content width on mobile”

### Phase 5 exit criteria

- Banner height deltas obviously visible on empty/light content
- Width behavior matches documented policy on mobile QA

---

## What not to do

| Anti-pattern | Why |
|--------------|-----|
| Per-section one-off height CSS copies | Recreates Issue A in five places |
| Renaming all prefixed schema IDs in one PR | Breaks saved merchant settings / section JSON |
| Deleting “dead” settings without rebinding or TE hide | Violates recovery policy; confuses existing client themes |
| Teaching JS to own layout position/width | Dual source of truth |
| Netherizing Dawn slideshow/image-banner in this recovery | Out of scope — separate track |
| Mixing localization key repair into this work | Separate investigation |

---

## Suggested implementation order (once approved)

1. Approve Phase 0 contract  
2. Implement Phase 1 (shared shell) → report → stop  
3. Implement Phase 2 (media) → report → stop  
4. Implement Phase 3 (leaves/tokens) → report → stop  
5. Implement Phase 4 (framework dishonest surfaces) → report → stop  
6. Optional Phase 5 polish → report → stop  

Each implementation phase should produce a short recovery report (same style as Sprint 3–5).

---

## Proposed first implementation slice (when approved)

**Name:** Settings Binding Recovery — Phase 1 (Hero Shell Contract)

**Touch targets (expected):**

- `assets/component-hero.css` (only if override policy needs specificity fix)
- `assets/component-content.css` / `component-cta.css` / `component-faq.css` / `component-newsletter-showcase.css` / `component-testimonials.css` (stop harmful height kills **or** align with Option A)
- `sections/nether-content.liquid`, `nether-cta.liquid`, `nether-faq.liquid`, `nether-newsletter.liquid`, `nether-testimonials.liquid` (orphan spacer + class gating)
- Hero/Banner schema `visible_if` only if fullscreen/height policy requires it

**Out of scope for first slice:** media schema parity, dual-read leaves, Banner preset widening, newsletter integrations.

---

## Approval gate

No implementation will start until you explicitly approve:

1. This recovery plan (phases + priorities), and  
2. The Phase 0 contract decisions (especially height Option A vs B, and layout-vs-media override policy).

Reply with approval (and any contract choices) to begin Phase 0/1.
