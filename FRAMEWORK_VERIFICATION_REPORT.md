# Nether Framework Verification Report — Settings Binding

**Date:** 2026-07-27  
**Mode:** Complete framework verification after shared settings binding recovery  
**Constraint:** No deletes · no renames · extend existing systems · Theme Editor honesty

---

## Summary

| Metric | Count |
|--------|------:|
| **Total sections audited** | **20** |
| **Total settings verified** | **1,679+** (cart gift-wrap settings added) |
| **Settings with confirmed Liquid consumers** | **100%** (includes dynamic-key + liquid-tag renders) |
| **Framework-level issue clusters fixed** | **12** |
| **Media schema drift remaining** | **0** |
| **True dead schema IDs** | **0** |

Cross-audit consensus ([hero-shell](ef804286-f4d9-4c21-b89c-afaba76f7c1c), [showcase](9b022464-592a-48df-922f-eadbe707273a), [page sections](3670bcfd-e5ae-4ede-9fde-0ec7a54dacf5)): recovery restored shared contracts; remaining work was TE honesty, CSS consumers, and schema drift — not wholesale rebuilds.

---

## Verification method

1. Automated Schema → Liquid → transitive snippet render-tree scan (all `nether-*.liquid` sections)
2. Media-type option vs `visible_if` drift scan
3. Modifier / CSS-var write vs CSS consumer checks
4. Manual Layer 3–4 review of height, width, position, alignment, media modes, overlays, glass, buttons
5. Parallel deep audits (hero-shell / showcase / page sections) then re-verify after fixes

Scanner note: `highlight_1`…`highlight_6` and `share_label` are live (dynamic keys / `{% liquid %} render`).

---

## Issues fixed this pass

| # | Issue | Fix |
|---|--------|-----|
| 1 | Collection block `media_type` `visible_if` referenced `background_video` but option absent | Cleaned `visible_if` to `video` only |
| 2 | Product block same drift | Same |
| 3 | Content `content_row` same drift | Same |
| 4 | Media card size modifiers had no CSS | Added size rules in `component-media.css` |
| 5 | Showcase position inert on stacked layouts | Layout-gated `visible_if` (Media / Collection / Product) |
| 6 | Content width/position on row layouts | Shell-capable `visible_if` |
| 7 | CTA/Newsletter position on centered layouts | Hide when centered |
| 8 | Media position on non-split layouts | Split-only `visible_if` |
| 9 | Cart gradient class had no CSS | Added title gradient consumer |
| 10 | Wishlist/Compare mobile `compact` had no CSS | Added compact spacing rules |
| 11 | Collection-page-banner `stacked` only targeted toolbar | Stack hero inner/media on tablet/mobile |
| 12 | Product Dawn layouts left overlay/glass/gradient/alignment visible | Gate those settings off for `card_grid` / `minimal_layout` |
| 13 | Cart gift-wrap Liquid with no schema IDs | Added enable/label/text settings |

### Files modified

**Sections:** `nether-collection`, `nether-product`, `nether-content`, `nether-cta`, `nether-newsletter`, `nether-media`, `nether-cart-page`

**CSS:** `component-media.css`, `component-cart-framework.css`, `component-wishlist.css`, `component-compare.css`, `component-collection-page.css`

**Not deleted. Not renamed.**

---

## Recovery integrity (prior sprint) — reconfirmed

| Contract | Status |
|----------|--------|
| Hero-shell width/position gated on `uses_hero_shell` | ✅ |
| Orphan adapt spacers removed on non-Hero/Banner shells | ✅ |
| `nether-hero-media` does not force `media_type` from layout | ✅ |
| Banner height cascade + distinct presets | ✅ |
| FAQ/Testimonials section `background_video` | ✅ |
| Media `nether_default_cta_label` dual-read | ✅ |
| Collection-page animation duration tokens | ✅ |

---

## Remaining issues

### Manual visual judgement
- Banner/Hero height feel with tall content (min-height)
- Overlay/glass strength, hover/motion intensity
- Showcase editorial vs luxury composition
- Collection banner hero layout deltas

### Platform / deferred product
- Mobile content width 100% (&lt;750px) — intentional
- No height setting on auto-min-height shells — intentional Option A
- Product `best_sellers` / `trending` need catalog strategy
- Newsletter `integration_provider` data-hook without first-party ESP JS
- Collection-page-banner lacks full Hero height/width/position API — feature gap, not dead IDs
- Gift wrap module remains a placeholder surface

### Architecture notes (non-bugs)
- `--glass-enabled` BEM often JS/panel-driven, not standalone CSS
- Card `--glass`/`--gradient` BEM secondary to panel/overlay utilities

---

## Stop condition

Framework-level settings binding issues from the three audits are resolved. Remaining items need visual judgement or external/product work, not another binding fix cycle.
