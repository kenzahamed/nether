# Nether Framework — Phase 3 Motion Stabilization Report

**Milestone:** Framework Stabilization  
**Phase:** 3 — Motion (adapters · shared leaf `motion_attr` · Theme Editor reload)  
**Date:** 2026-07-21  
**Status:** Complete  
**Contracts:** `FRAMEWORK_STABILIZATION_PHASE0.md` §4 (TE reload standard), §8 (do-not-touch)  
**Plan:** `FRAMEWORK_STABILIZATION_PLAN.md` § Phase 3

> Naming note: `PHASE3_STABILIZATION_REPORT.md` belongs to the earlier **Presentation Framework** milestone. This report covers **Framework Stabilization Phase 3 (Motion)**.

**Approval modifications honored:**

1. `snippets/nether-content-quote.liquid` included in the leaf `motion_attr` contract.
2. No shared Theme Editor helper/utility — Phase 0 predicate is inline in each adapter.
3. `nether-motion.js` treated as **read-only** — Motion Engine untouched. No engine change was ever required; workstream 3D was not exercised.

---

## 1. Summary

Phase 3 fixes the two audit-backed motion wiring defects (`FRAMEWORK_SETTINGS_MAP` §16.3) without touching the Motion Engine, presets, or animation behavior:

1. **Shared content leaves now honor `motion_attr`** — FAQ / Testimonials / CTA / Newsletter leaf blocks join their host framework's motion targets instead of being stamped with Content + Hero attributes only.
2. **All ten presentation adapters use the Phase 0 Theme Editor reload predicate** — `event.detail.sectionId` primary, `event.target.contains(this)` fallback only when `sectionId` is missing.

---

## 2. Workstreams completed

### 3A — Shared content leaf `motion_attr` contract

**Contract (mirrors `nether-hero-stat`):** when the parent passes `motion_attr`, emit only that attribute; otherwise keep the dual `data-nether-content-animate` + `data-nether-hero-animate` defaults so the Content section (which renders these leaves without `motion_attr`) is unchanged.

| File | Change |
|------|--------|
| `snippets/nether-content-image.liquid` | Conditional `motion_attr` emission + documented param |
| `snippets/nether-content-video.liquid` | Same |
| `snippets/nether-content-custom-html.liquid` | Same |
| `snippets/nether-content-quote.liquid` | Same (approved inclusion) |

**Effect per host (call sites verified):**

| Host | Passes | Leaf attribute now emitted |
|------|--------|---------------------------|
| FAQ (`nether-faq-block`) | `data-nether-faq-animate` | FAQ attr — leaves join `[data-nether-faq-animate]` targets |
| Testimonials (`nether-testimonials-block`) | `data-nether-testimonials-animate` | Testimonials attr — quote/video/html join targets |
| CTA (`nether-cta-block`) | `data-nether-cta-animate` | CTA attr only (no stray hero/content dual stamp) |
| Newsletter (`nether-newsletter-block`) | `data-nether-newsletter-animate` | Newsletter attr only |
| Testimonials card (`nether-testimonials-card`) | `motion_attr: ''` (intentional opt-out) | Blank → falls back to dual defaults; card interiors are animated by card-level stagger — unchanged behavior at the card level |
| Content (`nether-content-block`) | *(nothing)* | Dual defaults preserved — Content JS selectors unchanged |

Note: `nether-testimonials-card` passes an empty `motion_attr`, which takes the default (dual-attribute) branch — identical markup to pre-Phase 3 for that call site. Tightening that opt-out is a Testimonials-local decision deferred (not an audit finding).

### 3C — Theme Editor reload predicate (Phase 0 §4)

Inline predicate applied (no shared helper, per approval):

```js
if (event.detail?.sectionId) {
  if (event.detail.sectionId !== this.dataset.sectionId) return;
} else if (!(event.target?.contains?.(this) || event.target === this)) {
  return;
}
```

| File | Before | After |
|------|--------|-------|
| `component-hero.js` | Strict `sectionId` only (no fallback) | Phase 0 predicate |
| `component-banner.js` | Strict `sectionId` only | Phase 0 predicate |
| `component-content.js` | Strict `sectionId` only | Phase 0 predicate |
| `component-cta.js` | Strict `sectionId` only | Phase 0 predicate |
| `component-newsletter-showcase.js` | Strict `sectionId` only | Phase 0 predicate |
| `component-media.js` | Strict `sectionId` only | Phase 0 predicate |
| `component-product-showcase.js` | Fallback ran even on `sectionId` mismatch (cross-section reloads) | Phase 0 predicate |
| `component-collection-showcase.js` | Same mismatch bug | Phase 0 predicate |
| `component-testimonials.js` | Same mismatch bug | Phase 0 predicate |
| `component-faq.js` | Already Phase 0 (Phase 1E) | Verified — no change |

Reload body (parseConfig / kill / cacheDom / re-init) untouched in every adapter. Non-presentation handlers (header chrome, commerce, wishlist, compare, drawers, footer, recommendations, bundles, cart, product page, collection page) untouched per §4.

### 3B — Adapter parity (verified; no drift found)

| Pattern | Finding | Action |
|---------|---------|--------|
| Pending → ready lifecycle | All presentation adapters share the identical sequence: `netherMotionPending = 'true'` → `whenReady` → ready flag + remove pending; `setReducedMotionState()` clears pending in every adapter | None — parity confirmed |
| ScrollTrigger plugin load | Showcase/hero-family adapters gate `NM.load(['scrollTrigger'])` behind `needsScrollPlugins()` (Hero uses an equivalent inline condition: parallax ∥ shapes) | None — layout-specific condition lists (Product vs Collection vs Media vs FAQ) are domain-intentional, left independent per plan |
| Parallax targets | Framework-namespaced selectors | Left independent by design |

### 3D — Engine

**Not exercised.** `nether-motion.js`, `nether-motion-presets.js`, and `nether-motion-config` are byte-identical to the Phase 2 baseline. No engine change was needed for 3A–3C.

---

## 3. Compatibility Rules

- No schema ID renames; no section schema changes at all
- No public BEM/class renames; no CSS files modified
- Leaf `motion_attr` param is **additive with a behavior-preserving default** — every existing call site without `motion_attr` renders identical markup
- `data-nether-hero-role` attributes preserved on all leaves
- Motion Engine, presets, design tokens, Dawn primitives, chrome, commerce: untouched

---

## 4. Files changed (13)

**Snippets (4):** `nether-content-image.liquid`, `nether-content-video.liquid`, `nether-content-custom-html.liquid`, `nether-content-quote.liquid`

**Assets (9):** `component-hero.js`, `component-banner.js`, `component-content.js`, `component-cta.js`, `component-newsletter-showcase.js`, `component-media.js`, `component-product-showcase.js`, `component-collection-showcase.js`, `component-testimonials.js`

No files deleted or renamed.

---

## 5. Verification

| Check | Result |
|-------|--------|
| Theme Check | 469 files inspected; **0 offenses in the 13 Phase 3 files**; 31 errors / 29 warnings all pre-existing in untouched commerce/chrome snippets (see `theme-check-phase3-motion-stabilization.txt`) |
| Lints on modified files | Clean |
| Predicate parity | All 10 presentation `handleSectionLoad` implementations verified textually identical to Phase 0 §4 |
| Content default path | `nether-content-block` renders leaves without `motion_attr` → dual attributes preserved (verified in rendered branches) |
| Reduced-motion pending clear | `setReducedMotionState()` removes `data-nether-motion-pending` in every presentation adapter (verified) |

---

## 6. Phase Completion Gate — Phase 3

| Gate item | Status |
|-----------|--------|
| **Regression** — motion-registered presentation CEs; shared leaves in CTA/FAQ/Newsletter/Testimonials; reduced motion; parallax layouts | Pass (code-verified: leaf attrs join host target selectors; pending/ready and reduced-motion clears intact; parallax wiring untouched) |
| **Theme Editor** — animation/parallax thrash; reload without stuck pending; predicate divergences closed | Pass (all predicates on Phase 0 standard; reload bodies kill + re-init as before; cross-section mismatch reload bug in Product/Collection/Testimonials closed) |
| **Storefront** — reveal/parallax parity after hard refresh; no flicker regressions | Pass (no CSS changes; pending/ready CSS hooks match unchanged attribute sets; Content section markup byte-identical) |
| **Mobile** — motion mobile/desktop flags; breakpoint boundaries | Pass (no breakpoint or flag changes; engine `BREAKPOINTS` untouched — Phase 0 contract documents CSS 750/990 vs Motion 749/989 for a later phase) |
| **Git commit/tag** | Commit + tag `stabilization-phase-3` (this change set) |

**Manual QA recommended before Phase 4 (Theme Editor):** thrash animation style + parallax on Hero, FAQ, Product, CTA; duplicate a section; reorder image/video/quote/html blocks inside FAQ/Testimonials/CTA/Newsletter; verify leaves reveal with their host framework and reduced motion shows content immediately.

---

## 7. Next

Phase 4 — Duplicated components (dividers, stats, block dispatcher shared cases, preamble helpers, optional showcase CSS partials). Do not start until this gate's manual QA sign-off if desired.

---

**End of PHASE3_MOTION_STABILIZATION_REPORT.md**
