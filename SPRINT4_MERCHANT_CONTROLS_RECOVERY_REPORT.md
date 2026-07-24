# Nether Recovery Sprint 4 — Merchant Controls & Theme Editor Experience

**Date:** 2026-07-24  
**Status:** Complete — **QA validation fix applied 2026-07-25** (see `SPRINT4_QA_VALIDATION_REPORT.md`) — awaiting re-QA / approval before Sprint 5  
**Scope:** Theme Editor merchant-control architecture (grouping, conditional visibility, descriptions, shared locale UX)

> **QA correction:** Checkbox-parent `visible_if` originally used `== true`, which did not hide dependents in the Theme Editor. Correct form is bare truthiness (`{{ section.settings.enable_* }}`). Select-based conditions were already valid.

---

## 1. Executive Summary

Sprint 4 recovered the merchant editing experience across the Nether Framework by fixing **shared Theme Editor architecture** first, then applying framework-specific refinements.

Primary wins:

- Introduced framework-wide **`visible_if` conditional settings** (previously **0** usages in Nether)
- Added shared **`nether.common` help text / header keys** so controls explain themselves consistently
- Localized **42 hardcoded English schema headers** into shared translation keys
- Reordered dependent controls (overlay enable → opacity; divider toggles → style; sticky pair grouping)
- Clarified Product Page dual sticky controls that previously looked like duplicates

No storefront layouts, typography, or responsive behavior were redesigned. No settings were removed. No parallel systems were created.

---

## 2. Root Cause Analysis

| Root cause | Merchant effect |
|---|---|
| Zero `visible_if` anywhere in Nether schemas | Advanced / dependent controls always visible → editor clutter and “why doesn’t this do anything?” confusion |
| Dependent style/opacity/media fields shown regardless of parent enable/media type | Glass style, gradient style, overlay opacity, video fields, divider style, scroll label always present |
| Hardcoded English headers in Banner / CTA / FAQ / Newsletter / Product / Testimonials | Inconsistent Theme Editor organization vs translated frameworks; weaker i18n |
| Sparse `info` coverage on high-impact controls | Merchants lacked guidance for layout, position, heading level, glass/gradient, motion, responsive overrides |
| Overlay opacity listed before enable overlay | Poor control sequencing; opacity appeared before its parent toggle |
| Divider style listed before show top/bottom toggles (Collection Page / Banner) | Style control appeared irrelevant until toggles were found below |
| Product Page `nether_enable_sticky_summary` + `enable_sticky_info` | Two sticky checkboxes looked redundant without clear purpose labels |
| Global Motion paragraph still said sections “not wired yet” | Undermined commercial Theme Settings trust |

---

## 3. Shared Merchant Systems Improved

| Shared system | Change |
|---|---|
| Conditional settings architecture | Standardized `visible_if` patterns for enable→style, overlay→opacity, media type→fields, animation none→speed, divider toggles→style, scroll indicator→label, motion master→dependents |
| `nether.common` schema locale layer | Added shared header keys + merchant `info_*` strings used across frameworks |
| Theme Settings · Nether Motion | Dependent controls / headers hide when motion is disabled; production-ready paragraph copy |
| Schema header localization | Hardcoded English headers mapped to `t:nether.common.*` / padding shared key |
| Locale sync | New shared keys mirrored into all schema locale files (English interim for non-EN) |

---

## 4. Merchant Controls Refined

| Control pattern | Behavior now |
|---|---|
| `*_glass_style` | Visible only when matching `*_enable_glass` is on |
| `*_gradient_style` | Visible only when matching `*_enable_gradient` is on |
| `*_overlay_opacity` | Visible only when overlay enable is on; enable listed first |
| Media pickers / video fields | Appear for the active media type (image / video / background video) |
| `*_split_media_position` | Hero: only for split layout · Banner: split / collection / brand_story |
| `*_animation_speed` | Hidden when animation style is `none` (where that option exists) |
| `*_divider_style` | Visible when top or bottom divider is enabled; ordered after toggles |
| `nether_scroll_label` | Visible when scroll indicator is enabled |
| FAQ search placeholder / endpoint | Visible when FAQ search is enabled |
| Product sticky pair | Grouped + distinct labels/info (Nether buy box vs gallery info column) |
| Layout / position / alignment / heading / aria / glass / gradient / motion / responsive | Shared info tooltips where previously blank |

---

## 5. Frameworks Improved

Hero · Banner · Content · CTA · Newsletter · FAQ · Testimonials · Collection · Product · Media · Bundles · Recommendations · Collection Page · Collection Page Banner · Product Page · Cart Page · Wishlist · Compare · Commerce · Theme Settings (Nether Motion)

---

## 6. Files Modified

### Shared architecture
- `locales/en.default.schema.json` (+ mirrored keys in all `locales/*.schema.json`)
- `config/settings_schema.json`
- `_sprint4_merchant_controls_patch.js` (one-shot architecture patcher; retained for audit trail)

### Section schemas (merchant controls only)
- All `sections/nether-*.liquid` with `{% schema %}` (except predictive-search which has no schema)

Notable framework-specific schema refinements:
- `sections/nether-product-page.liquid` — sticky control grouping + clear labels
- `sections/nether-faq.liquid` — search field conditionals
- Overlay / divider ordering across media/hero-shell frameworks

---

## 7. Verification

| Check | Result |
|---|---|
| All Nether section schemas parse as JSON | Pass |
| `settings_schema.json` parses | Pass |
| All `t:nether.common.*` references used by patched schemas resolve in `en.default.schema.json` | Pass (0 missing) |
| Conditional visibility coverage | Section/block `visible_if` bindings + theme motion bindings (checkbox parents use bare truthiness after QA fix) |
| Info coverage on Nether section settings | **~448** settings with `info` (up from sparse single-digit / low-double counts per section) |
| Hardcoded English headers in Nether schemas | **0** remaining from prior hardcoded set |
| No new storefront Liquid/CSS/JS behavior changes intended | Confirmed (schema/locale only aside from unused binding risk: none introduced) |
| Manual Theme Editor QA | Recommended on preview theme (glass/gradient toggles, media type switching, split layout, FAQ search, motion disable, product sticky labels) |

---

## 8. Regression Results

| Area | Status |
|---|---|
| Sprint 1 contracts (heading / position / ratio / TE reload) | Untouched storefront logic |
| Sprint 2 locale architecture (`nether.common`) | Extended (additive keys only) |
| Sprint 3 settings binding recovery | Untouched runtime bindings; schemas now better describe those controls |
| Setting IDs / defaults | Preserved (no removals, no renames of setting IDs) |
| Theme Check (full theme) | Pre-existing large offense volume remains (locale gaps in Dawn leftovers, UnsupportedFilterArguments, etc.). **No InvalidSchema / visible_if parse failures observed** in Sprint 4 schema work; all patched schemas JSON-valid |

---

## 9. Remaining Merchant UX Risks

| Risk | Notes |
|---|---|
| Resource pickers (`product`, `collection`, `product_list`) cannot use `visible_if` | Strategy/layout-specific pickers must stay visible; rely on `info` text (Shopify platform limit) |
| Non-English schema locales use English interim for new Sprint 4 keys | Functional; professional translation pass still recommended |
| Some frameworks still have dense setting counts | Conditional visibility reduces clutter; further progressive disclosure (e.g. pack-only bundle fields) can continue later where IDs allow |
| Manual Theme Editor QA still required | `visible_if` is editor-only — must be validated in Shopify admin preview |
| Pre-existing Theme Check locale/filter offenses | Outside Sprint 4 scope; do not block merchant-control recovery |

---

## 10. Sprint 4 Completion Status

**COMPLETE.**

Stop here. Do **not** begin Sprint 5 until explicitly approved.

### Recommended Next Sprint

**Sprint 5 candidate:** Layout & Style Preset Distinctness — ensure every layout / style / card / glass / gradient preset produces an obviously unique visual result (addresses remaining “weak effect” settings that are wired and now clearly exposed, but may still be under-differentiated on the storefront).
