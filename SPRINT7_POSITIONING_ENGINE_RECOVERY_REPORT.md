# Nether Recovery Sprint 7 — Positioning Engine Recovery

**Date:** 2026-07-27  
**Status:** Complete — stop here (do not begin Sprint 8)  
**Scope:** Shared Positioning Engine — 9-point placement, alignment, safe-area, overlay/shell bridges

---

## 1. Executive Summary

Sprint 7 recovered Nether’s **shared Positioning Engine** by introducing a canonical positioning CSS module and Liquid normalizer, then wiring Hero-shell and overlay-card frameworks to one token map.

Primary wins:

- Added **`component-position.css`** as the framework Positioning Engine (9-point tokens, shell/overlay primitives, safe-area insets, stack-layout horizontal preservation)
- Added **`nether-position-value`** Liquid helper (`center` → `middle-center`)
- Deduplicated 9-point CSS previously copied across Hero, Product, Collection, and Media
- Removed floating-card **hard `align-items: flex-end` overrides** that silently killed merchant vertical position (Banner / Content / CTA)
- Applied safe-area insets to Hero content-shell padding
- Preserved intentional tablet/mobile `--*-centered` responsive overrides

No layout redesign. No typography redesign. No animation work. Sprint 8 not started.

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| No shared Positioning Engine module | Identical 9-point grids reimplemented in Hero + 3 card frameworks |
| Floating-card CSS forced `align-items: flex-end` | Merchant content position ignored whenever floating was enabled |
| Hero layout defaults loaded after global CSS | Without a local re-bridge, layout-centered could outrank merchant position |
| Legacy `center` schema values | Required scattered Liquid aliases; easy to miss on new consumers |
| No safe-area contract on shell padding | Notched devices could clip positioned content |
| Absolute overlay vs stack card layouts | Relative content layouts made full 9-point vertical placement meaningless; TE already hid position on some layouts, but CSS still fought itself |

---

## 3. Shared Positioning Systems Improved

| System area | Improvement |
|---|---|
| Canonical tokens | `--nether-pos-x` / `--nether-pos-y` / `--nether-pos-text` |
| 9-point map | Shared modifiers for Hero + Product / Collection / Media cards |
| Legacy alias | CSS + Liquid map `center` → `middle-center` |
| Shell surface | Hero content-shell consumes tokens via `--nether-hero-content-align` / `--nether-hero-justify` bridge |
| Overlay surface | Card `__content` panels consume shared tokens |
| Stack layouts | `card_grid` / `card_layout` / `minimal_*` keep horizontal + text alignment only |
| Safe areas | `--nether-safe-*` from `env(safe-area-inset-*)`; Hero shell padding includes them |
| Opt-in helpers | `.nether-pos-shell`, `.nether-pos-overlay`, `.nether-pos-safe`, `.nether-pos-align-*` |

### Verified 9-point slots

| | Left | Center | Right |
|---|---|---|---|
| **Top** | ✓ | ✓ | ✓ |
| **Middle** | ✓ | ✓ | ✓ |
| **Bottom** | ✓ | ✓ | ✓ |

---

## 4. Files Modified

### Created
- `assets/component-position.css`
- `snippets/nether-position-value.liquid`
- `SPRINT7_POSITIONING_ENGINE_RECOVERY_REPORT.md` (this file)
- `theme-check-sprint7-position.txt` (Theme Check artifact)
- `.nether-analysis/_sprint7_position_patch.py`
- `.nether-analysis/_sprint7_verify.py`
- `.nether-analysis/_sprint7_verify.json`

### Modified — global load
- `layout/theme.liquid`
- `layout/password.liquid`

### Modified — engine consumers (CSS)
- `assets/component-hero.css` (safe-area padding, remove duplicated 9-point literals, re-bridge after layout defaults)
- `assets/component-product-showcase.css` (remove duplicated 9-point rules)
- `assets/component-collection-showcase.css` (remove duplicated 9-point rules)
- `assets/component-media.css` (remove duplicated 9-point rules)
- `assets/component-banner.css` (floating override)
- `assets/component-content.css` (floating override)
- `assets/component-cta.css` (floating override)

### Modified — Liquid normalize
- `sections/nether-hero.liquid`
- `sections/nether-banner.liquid`
- `sections/nether-content.liquid`
- `sections/nether-cta.liquid`
- `sections/nether-newsletter.liquid`
- `snippets/nether-product-card.liquid`
- `snippets/nether-product-promotional-card.liquid`
- `snippets/nether-collection-card.liquid`
- `snippets/nether-media-card.liquid`

**Not deleted. Not renamed.**

---

## 5. Frameworks Improved

| Framework | Positioning improvements |
|---|---|
| Hero | Token bridge + safe-area shell padding; merchant position beats layout-centered |
| Banner | Same Hero bridge; floating no longer forces bottom |
| Content | Floating no longer forces bottom; normalize wired |
| CTA | Floating no longer forces bottom; normalize wired |
| Newsletter | Normalize wired (shell layouts) |
| Product showcase | Shared overlay 9-point; stack layouts keep X/text only |
| Collection showcase | Shared overlay 9-point; `card_layout` / `minimal_grid` stack handling |
| Media showcase | Shared overlay 9-point; `minimal_gallery` stack handling |
| Collection page | Benefits via `nether-product-card` + shared CSS (no redesign) |

---

## 6. Verification

| Check | Result |
|---|---|
| Static 9-point token map (9 slots + center alias) | Pass (40/40 `_sprint7_verify.py`) |
| Theme loads `component-position.css` (theme + password) | Pass |
| Hero / Banner / Content / CTA / Newsletter normalize | Pass |
| Card snippets normalize | Pass |
| Floating overrides removed | Pass |
| Safe-area tokens present | Pass |
| Shopify Theme Check (Sprint 7 files) | **No new errors** — only pre-existing `scheme_classes` warnings on layouts |
| Theme Check repo totals | 30 errors / 30 warnings — **pre-existing**, unrelated commerce/filter debt |

Theme Editor: merchant `--position-*` classes unchanged; controls continue to write the same schema values. Floating sections now honor the selected grid slot.

---

## 7. Regression Results

| Sprint / system | Status |
|---|---|
| Sprint 1–2 foundation | Untouched |
| Sprint 3 settings binding | Untouched (IDs unchanged) |
| Sprint 4 merchant controls / `visible_if` | Untouched |
| Sprint 5 Responsive System | Preserved (same breakpoints; position complements responsive centered overrides) |
| Sprint 6 Layout Engine | Preserved (`component-layout.css` still loads; position loads after it) |
| Premium Button / Card / Typography / Icon / Badge / Form / Shadow / Radius / Glass / Gradient | Untouched |
| Nether Motion Engine | Untouched |

---

## 8. Remaining Positioning Risks

| Risk | Notes |
|---|---|
| Non-shell layouts (Content row modes, CTA `centered_cta`) | Position classes correctly gated off when no content-shell exists — control may still appear depending on schema `visible_if` |
| Stack card layouts | Vertical 9-point has no overlay plane; horizontal/text alignment preserved |
| Tablet/mobile `--*-centered` | Intentionally overrides merchant desktop position on those viewports |
| Collection page schema subset | Only exposes bottom-left / bottom-center / center (aliased) — not full 9-point in TE |
| Dawn-native banners/slideshow | Outside Nether Positioning Engine (unchanged by design) |
| Badge / fixed UI chrome | No dedicated badge placement system yet |

---

## 9. Sprint 7 Completion Status

**COMPLETE.**

Stop after Sprint 7.  
Do **not** begin Sprint 8.
