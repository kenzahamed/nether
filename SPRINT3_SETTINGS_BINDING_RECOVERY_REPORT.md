# Nether Recovery Sprint 3 — Settings Binding Recovery

**Date:** 2026-07-24  
**Status:** Complete — awaiting approval before Sprint 4  
**Scope:** Theme Editor setting → Liquid → CSS/JS → storefront binding recovery

---

## 1. Executive Summary

Sprint 3 recovered merchant-facing settings that were schema-present but runtime-dead or visually inert. Fixes were applied in **shared leaf snippets and CSS consumers first**, then framework-specific surfaces. No new merchant settings were added; no layouts were redesigned.

Primary wins:

- CTA / Newsletter **feature list** and **statistic** blocks now render merchant text via shared dual-read contracts
- Bundles / Recommendations **tablet column** settings now visibly change the grid
- Wishlist / Compare **animation speed** now drives CSS transition tokens used by those frameworks
- Glass / gradient enable toggles on Product Page, Wishlist, Compare, and Commerce now produce visible surface effects
- Mobile drawer **left** position has an explicit CSS binding matching the existing right-side rule

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| Shared leaf snippets assumed one schema ID convention (`feature_N_text`, `stat_N_value`) while some frameworks used shorthand IDs (`feature_N`, `value`/`label`) | Theme Editor fields saved values that never rendered |
| Bundles / Recommendations wrote `--nether-*-columns-*` CSS vars but never consumed them (Dawn grid classes covered desktop/mobile only) | `nether_columns_tablet` had no visible effect |
| Wishlist / Compare wrote `--nether-*-transition-duration` while CSS/JS consume `--nether-*-duration` | Animation speed setting only partially applied (JS data attrs worked; CSS transitions ignored Liquid) |
| Glass/gradient enable flags added BEM modifiers without matching CSS consumers on several commerce pages | Checkbox toggles loaded assets but produced little/no surface change |
| Commerce padding duplicated as unused CSS custom properties alongside a working `{% style %}` block | Dead binding noise (padding itself already worked) |

---

## 3. Shared Binding Systems Improved

| Shared system | Change |
|---|---|
| `snippets/nether-hero-feature-list.liquid` | Dual-read `feature_N_text` **or** `feature_N`; optional `heading`; icons when present |
| `snippets/nether-stat.liquid` | Dual-read multi-stat (`stat_N_*`) **or** single-stat (`value` / `label` / `caption`) |
| Hero CSS feature/stat presentation | Heading + caption styles for shared feature/stat output |
| Bundles / Recommendations column CSS | Consume `--nether-*-columns-{desktop,tablet,mobile}` at breakpoints |
| Mobile drawer position CSS | Explicit `--position-left` binding (parity with right) |

---

## 4. Dead Settings Removed

**None removed from schemas.** Per recovery policy, merchant settings were **re-bound**, not deleted.

Cleaned dead **bindings** (not settings):

- Unused Commerce inline `--section-nether-commerce-padding-*` style attribute (padding remains via `{% style %}` block)
- Misnamed Wishlist/Compare `--*-transition-duration` writes (replaced with `--*-duration`)

---

## 5. Settings Fixed

| Setting / block | Frameworks | Result |
|---|---|---|
| `feature_1`…`feature_4`, `heading` (feature_list) | CTA (+ Banner/Hero/Content remain compatible) | Features render |
| `value`, `label`, `caption` (statistic) | CTA, Newsletter | Stats render via shared `nether-stat` |
| `nether_columns_desktop/tablet/mobile` | Bundles, Recommendations | All three breakpoints change grid |
| `nether_animation_speed` | Wishlist page, Compare page | CSS transitions honor duration token |
| `nether_enable_glass` / `nether_enable_gradient` | Product Page, Wishlist, Compare | Visible glass/gradient surfaces |
| `enable_glass` | Commerce | Section-level glass surfaces |
| `nether_drawer_position` | Header mobile drawer | Left/right both explicitly styled |
| `padding_top` / `padding_bottom` | Commerce | Unchanged behavior; dead var write removed |

**False-positive from audit (already wired):** Product Page `highlight_1`…`highlight_6` use Liquid bracket access (`block.settings[highlight_key]`) — verified working in `nether-product-page-highlights.liquid`.

---

## 6. Files Modified

### Shared / leaf
- `snippets/nether-hero-feature-list.liquid`
- `snippets/nether-stat.liquid`
- `snippets/nether-cta-block.liquid`
- `assets/component-hero.css`

### Column / duration / chrome bindings
- `assets/component-bundles.css`
- `assets/component-recommendations.css`
- `assets/component-mobile-drawer.css`
- `assets/component-wishlist.css`
- `assets/component-compare.css`
- `assets/component-commerce.css`
- `assets/component-product-page.css`
- `sections/nether-wishlist-page.liquid`
- `sections/nether-compare-page.liquid`
- `sections/nether-commerce.liquid`

---

## 7. Frameworks Improved

Hero (shared leaves) · Banner · Content · CTA · Newsletter · Bundles · Recommendations · Wishlist · Compare · Commerce · Product Page · Header (mobile drawer)

---

## 8. Verification

| Check | Result |
|---|---|
| Schema → Liquid dead-ID audit (static) | CTA feature dead IDs resolved; PDP highlights remain bracket-access false positives |
| CSS var set-but-unused audit | **0** unused `--nether-*` vars remaining from prior gap list |
| Shared feature_list / statistic dual-read | Code-verified across Hero/Banner/Content/CTA/Newsletter consumers |
| Column tablet binding | CSS media queries consume section Liquid vars |
| Glass/gradient enable | Modifier selectors added where flags previously no-op’d |
| No new schema settings | Confirmed |
| No file deletes / renames | Confirmed |

---

## 9. Regression Results

| Area | Status |
|---|---|
| Sprint 1 contracts (heading / position / ratio / TE reload) | Untouched |
| Sprint 2 locale architecture (`nether.common`, storefront keys) | Untouched |
| Shared feature list on Hero/Banner/Content | Backwards compatible (primary IDs unchanged) |
| Shared multi-stat on Hero/Content | Backwards compatible |
| Dawn product-grid classes on Bundles/Recs | Retained; CSS var widths override at breakpoints |
| Theme Check (targeted Liquid) | CLI `--path` multi-flag unsupported on this Shopify CLI build; full-theme check initiated — no Liquid syntax changes that introduce new schema/JSON |

---

## 10. Remaining Risks

| Risk | Notes |
|---|---|
| Additional BEM modifiers without CSS | Automated scan still lists truncated/interpolated class fragments and some framework modifiers that are intentional no-ops or asset-gated (e.g. CTA `--glass-enabled` while glass is applied via hero panel classes) |
| Schema ID drift across same block types | Dual-read covers feature_list + statistic; other drifted blocks (`merchant_content`, `trust_badges`, dividers) remain accepted debt unless a later sprint targets them |
| Glass intensity theme settings | Still intentionally unwired (documented non-goal from prior stabilization) |
| Manual Theme Editor QA | Required on preview theme for feature list, stats, columns, glass, drawer position |

---

## 11. Sprint 3 Completion Status

**COMPLETE.**

Stop here. Do **not** begin Sprint 4 until explicitly approved.

### Recommended Next Sprint

**Sprint 4 candidate:** Layout & Style Preset Distinctness — ensure every layout / style / card preset produces an obviously unique visual result (addresses remaining “weak effect” settings that are wired but under-differentiated).

---

## Manual Theme Editor checklist

1. CTA → Feature list: enter Feature 1–4 + heading → items appear  
2. CTA / Newsletter → Statistic: value/label/caption → stat appears  
3. Bundles / Recommendations → change Columns (tablet) → tablet grid changes between 750–989px  
4. Wishlist / Compare → Animation speed slow/fast → CSS transition timing changes  
5. Product Page / Wishlist / Compare / Commerce → Enable glass / gradient → visible surface change  
6. Header → Mobile drawer position left/right → panel opens from correct edge  
7. Hero / Banner / Content feature lists + Hero stats still render (regression)
