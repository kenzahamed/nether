# Nether Recovery Sprint 6 — Layout Engine Recovery

**Date:** 2026-07-27  
**Status:** Complete — stop here (do not begin Sprint 7)  
**Scope:** Shared Layout Engine — containers, wrappers, spacing, grid/flex primitives, layout reuse

---

## 1. Executive Summary

Sprint 6 recovered Nether’s **shared Layout Engine** by introducing a canonical layout CSS module and shared Liquid helpers, then applying them across presentation and commerce frameworks.

Primary wins:

- Added **`component-layout.css`** as the framework Layout Engine (containers, nested-container guard, content measures, stack/row/grid utilities, spacing tokens)
- Added shared Liquid helpers for **section padding**, **container classes**, and **header container classes**
- Eliminated duplicated mobile/desktop section-padding media-query blocks across **18 Nether sections**
- Fixed nested `.page-width` double-gutter debt in Media / Product / Collection / FAQ / Testimonials headers
- Defined missing **`.page-width--full`** (Commerce full-width was previously a no-op class)
- Bound framework gap / hero content-width tokens to shared layout tokens **without redesigning visuals**

No typography redesign. No button redesign. No Sprint 7 work.

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| No shared Layout Engine module | Containers, stacks, and grid contracts reimplemented per framework |
| Duplicated section-padding CSS in every Nether section | Same mobile `0.75` + tablet media query copied ~18×; Commerce omitted mobile scale |
| Nested `.page-width` on headers inside constrained shells | Double horizontal gutters; broken spacing rhythm |
| Header snippets always applied `.page-width` | Correct for full-width shells; wrong when parent was already constrained |
| `.page-width--full` referenced but undefined | Commerce “full width” setting did not expand the container |
| Hardcoded gap / content-width literals parallel to Responsive tokens | Spacing systems drifted from Sprint 5 stack/gutter contract |

---

## 3. Shared Layout Systems Improved

| System area | Improvement |
|---|---|
| Container contract | Documented `.page-width` as canonical; added `.nether-layout-container` alias + `--full` / `--bleed` |
| Nested wrappers | CSS guard + Liquid header class helper prevent double gutters |
| Section spacing | Single snippet uses `--nether-section-pad-scale` (Sprint 5) — no duplicated MQ |
| Content measure | Shared narrow/medium/wide/full tokens aligned with Hero width presets |
| Flex stacks / rows | Opt-in `.nether-layout-stack` / `.nether-layout-row` utilities |
| Grid primitive | Opt-in `.nether-layout-grid` with mobile/tablet/desktop column contract |
| Framework token binding | Media, Testimonials, FAQ, Product, Collection, Recommendations, Bundles, Hero alias gaps/widths to layout tokens |

---

## 4. Files Modified

### Created
- `assets/component-layout.css`
- `snippets/nether-section-padding.liquid`
- `snippets/nether-layout-container-class.liquid`
- `snippets/nether-layout-header-class.liquid`
- `SPRINT6_LAYOUT_ENGINE_RECOVERY_REPORT.md` (this file)
- `theme-check-sprint6-layout.txt` (Theme Check artifact)
- `.nether-analysis/_sprint6_padding_patch.py`
- `.nether-analysis/_sprint6_verify.py`

### Modified — global load
- `layout/theme.liquid`
- `layout/password.liquid`

### Modified — padding consolidation (18 sections)
- `sections/nether-hero.liquid`
- `sections/nether-banner.liquid`
- `sections/nether-content.liquid`
- `sections/nether-cta.liquid`
- `sections/nether-newsletter.liquid`
- `sections/nether-faq.liquid`
- `sections/nether-testimonials.liquid`
- `sections/nether-media.liquid`
- `sections/nether-product.liquid`
- `sections/nether-collection.liquid`
- `sections/nether-product-page.liquid`
- `sections/nether-collection-page.liquid`
- `sections/nether-cart-page.liquid`
- `sections/nether-recommendations.liquid`
- `sections/nether-bundles.liquid`
- `sections/nether-commerce.liquid`
- `sections/nether-wishlist-page.liquid`
- `sections/nether-compare-page.liquid`

### Modified — container / header layout reuse
- `sections/nether-media.liquid`
- `sections/nether-product.liquid`
- `sections/nether-collection.liquid`
- `sections/nether-faq.liquid`
- `sections/nether-testimonials.liquid`
- `sections/nether-recommendations.liquid`
- `sections/nether-bundles.liquid`
- `sections/nether-commerce.liquid`
- `snippets/nether-media-content.liquid`
- `snippets/nether-product-content.liquid`
- `snippets/nether-collection-content.liquid`
- `snippets/nether-faq-content.liquid`
- `snippets/nether-testimonials-content.liquid`

### Modified — token binding (no visual redesign)
- `assets/component-hero.css`
- `assets/component-media.css`
- `assets/component-testimonials.css`
- `assets/component-faq.css`
- `assets/component-product-showcase.css`
- `assets/component-collection-showcase.css`
- `assets/component-recommendations.css`
- `assets/component-bundles.css`

**Not deleted. Not renamed.**

---

## 5. Frameworks Improved

| Framework | Layout improvements |
|---|---|
| Hero / Banner / Content / CTA / Newsletter | Shared padding snippet; Hero width → layout content tokens |
| Media / Product / Collection | Container class helper; header nested-page-width fix; gap token bind |
| FAQ / Testimonials | Container + header helpers; gap/inner-gap token bind |
| Recommendations / Bundles | Container class helper; gap token bind |
| Commerce | Shared padding (adds mobile scale); `.page-width--full` now defined |
| Product Page / Collection Page / Cart / Wishlist / Compare | Shared padding snippet |

---

## 6. Verification

| Check | Result |
|---|---|
| Container consistency (`.page-width` + helpers) | Pass |
| Wrapper consistency (header only constrains when full-width) | Pass |
| Nested container double-gutter guard | Pass (Liquid + CSS) |
| Grid / flex primitives available + framework grids unchanged visually | Pass |
| Layout reuse via shared snippets | Pass (18 padding + 8 container + 5 headers) |
| Spacing rhythm via `--nether-section-pad-scale` + layout gap tokens | Pass |
| Theme Editor loads layout CSS globally | Pass (`stylesheet_tag` after responsive) |
| No new JS (no console regression from Sprint 6) | Pass |

---

## 7. Regression Results

| Check | Result |
|---|---|
| Shopify Theme Check | **477 files · 60 offenses · 30 errors / 30 warnings** — pre-existing volume; **no offenses in Sprint 6 layout files** |
| Liquid errors in new snippets / patched sections | None observed in Theme Check for Sprint 6 paths |
| JavaScript | No JS files modified |
| Sprint 5 Responsive System | Preserved — layout engine consumes `--nether-gutter`, `--nether-stack-*`, `--nether-section-pad-scale` |
| Sprint 4 Merchant Controls | Untouched schemas / `visible_if` |
| Sprint 3 Settings Binding | Untouched runtime bindings |
| Sprint 2 Localization | Untouched locale architecture |
| Sprint 1 contracts | Untouched storefront behavior beyond layout container hygiene |

---

## 8. Remaining Layout Risks

| Risk | Notes |
|---|---|
| Dawn leftover sections still use inline padding MQ blocks | Out of Nether framework scope; optional future consolidation |
| Opt-in utilities (`.nether-layout-grid` / stack) not yet adopted by all grids | Frameworks keep local grid CSS; gradual adoption is intentional |
| Nested `.page-width` may still exist in Dawn templates | Guard CSS mitigates; Dawn not rewritten |
| `nether-collection-page-banner` / `nether-predictive-search` have no padding settings | Skipped by design (no padding block to consolidate) |
| Non-English schema locales | Unrelated to layout |

---

## 9. Sprint 6 Completion Status

**Complete.**

Layout Engine recovered at the shared architecture layer. Framework-specific layout hacks reduced. Spacing and containers are predictable and reusable.

**Stop after Sprint 6. Do not begin Sprint 7.**
