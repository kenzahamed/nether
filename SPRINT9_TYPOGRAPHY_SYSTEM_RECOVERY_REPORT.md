# Nether Recovery Sprint 9 — Typography System Recovery

**Date:** 2026-07-27  
**Status:** Complete — stop here (do not begin Sprint 10)  
**Scope:** Shared Typography System — hierarchy, tokens, responsive scaling, readability, accessibility, spacing

---

## 1. Executive Summary

Sprint 9 recovered Nether’s **shared Typography System** by completing the missing type scale aliases Liquid already depended on, introducing a canonical `--type-size-*` token contract, normalizing merchant `text_style` / `heading_size` values, and soft-binding framework emphasis rules to shared tokens.

Primary wins:

- Defined missing classes used across commerce frameworks: **`type-display-sm`**, **`type-heading-lg|md|sm|xs`**
- Added semantic roles: **subtitle**, **quote**, **price**, **nav**, **section-title**
- Introduced shared Liquid helpers: **`nether-type-text-class`**, **`nether-type-heading-class`**
- Fixed invalid schema class **`body`** → **`type-body`** via shared header normalization
- Raised caption floor to **1.2rem** for readability
- Soft-bound Hero / Content / Product / Collection / Media / FAQ / Testimonials / Price / Form / Footer to typography tokens **without redesigning layouts**

No layout redesign. No button redesign. No animation work. Sprint 10 not started.

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| Liquid used `type-display-sm`, `type-heading-*` but CSS never defined them | Page headers, cards, stats, empty states silently fell back to browser/inherited sizes — broken hierarchy |
| Schema `text_style: "body"` applied class `body` | No `.body` rule exists — body copy ignored type system |
| Framework CSS hardcoding `font-size` / `clamp()` / `calc()` | Parallel typography contracts; drift from shared scale |
| Incomplete size token scale | Utilities existed, but frameworks could not soft-bind to a single source of truth |
| Missing `.type-h0` / display-sm | Dawn `.h0` had no Nether alias despite page-header usage |
| Caption at 1rem mobile (~10px root) | Weak readability / accessibility floor |

---

## 3. Shared Typography Systems Improved

| System area | Improvement |
|---|---|
| Size tokens | Full `--type-size-*` scale (display → caption, price, quote, card, emphasis) |
| Leading / tracking | Extended tokens (`emphasis`, `hero`, `magazine`, `quote`, `heading`, `editorial`) |
| Missing aliases | `type-display-sm`, `type-heading-{lg,md,sm,xs}`, `type-h0`, `type-section-title` |
| Semantic roles | `type-subtitle*`, `type-quote*`, `type-price*`, `type-nav*`, `type-unit-price` |
| Text style mapping | `nether-type-text-class` maps `body` / `subtitle` / captions → valid classes |
| Heading mapping | `nether-type-heading-class` maps Dawn `h0`–`hxxl` ↔ Nether `type-*` (`mode: both`) |
| Shared header | All frameworks using `nether-shared-header-block` inherit normalized type classes |
| Caption a11y | Floor raised to `1.2rem` |
| Framework binds | Emphasis / card / quote / price / form / footer use `var(--type-…)` |

### Verification checklist

| Capability | Status |
|---|---|
| Heading hierarchy | ✓ |
| Typography tokens | ✓ |
| Responsive scaling | ✓ (tokenized clamps + breakpoint steps) |
| Accessibility | ✓ (caption floor, semantic HTML preserved, balance/pretty opt-in) |
| Readability | ✓ (measure tokens, leading scale, prose rhythm) |
| Consistent spacing | ✓ (`--type-space-*` + stack utilities) |

---

## 4. Files Modified

### Created
- `snippets/nether-type-text-class.liquid`
- `snippets/nether-type-heading-class.liquid`
- `SPRINT9_TYPOGRAPHY_SYSTEM_RECOVERY_REPORT.md` (this file)
- `.nether-analysis/_sprint9_verify.js`
- `.nether-analysis/_sprint9_verify.json`
- `theme-check-sprint9-typography.json` (Theme Check artifact)
- `theme-check-sprint9-summary.json`

### Modified — shared typography engine
- `assets/component-typography.css`

### Modified — shared consumers (Liquid)
- `snippets/nether-shared-header-block.liquid`

### Modified — framework soft-binds (CSS, no redesign)
- `assets/component-hero.css`
- `assets/component-content.css`
- `assets/component-product-page.css`
- `assets/component-testimonials.css`
- `assets/component-faq.css`
- `assets/component-product-showcase.css`
- `assets/component-collection-showcase.css`
- `assets/component-media.css`
- `assets/component-price.css`
- `assets/component-card-premium.css`
- `assets/component-form.css`
- `assets/component-cta.css`
- `assets/section-footer.css`

---

## 5. Frameworks Improved

| Framework | Typography recovery |
|---|---|
| Shared header (Hero, Banner, Content, CTA, Newsletter, FAQ, Testimonials, Media, Product, Collection, Commerce…) | Normalized heading + text classes |
| Hero | Editorial emphasis → `--type-size-emphasis-hero` |
| Content | Magazine heading → `--type-size-emphasis-magazine` |
| Product Page | Editorial title → `--type-size-emphasis-product-title` |
| Testimonials | Quote / quote-mark / featured → quote tokens |
| FAQ | Editorial question + controls → type tokens |
| Product / Collection / Media showcases | Card size/editorial headings → card tokens |
| Price | Regular / large / sale / unit → price tokens |
| Premium cards | Editorial + testimonial quote bind |
| Forms | Field font tokens alias type sizes |
| Footer | Block headings → footer type tokens |
| Cart / Wishlist / Compare / Bundles / Recommendations | Existing `type-display-sm` / `type-heading-*` now resolve |

---

## 6. Verification

| Check | Result |
|---|---|
| Static verify (`.nether-analysis/_sprint9_verify.js`) | **60/60 passed** |
| Heading aliases defined | ✓ |
| Token scale present | ✓ |
| Shared header wired to helpers | ✓ |
| Framework soft-binds | ✓ |
| Sprints 5–8 CSS still loaded in `theme.liquid` | ✓ |

---

## 7. Regression Results

| Area | Status |
|---|---|
| Shopify Theme Check | Full theme: 31 errors / 30 warnings — **all pre-existing**. Sprint 9 files (`nether-type-*`, `nether-shared-header-block`) have **0 offenses**. |
| Liquid errors | None introduced in Sprint 9 helpers |
| JavaScript console | No JS changes in Sprint 9 |
| Theme Editor | Merchant `heading_size` / `text_style` settings preserved; `body` now maps correctly |
| Sprint 1–8 systems | Responsive / Layout / Position / Media engines still globally loaded; typography only soft-binds |

---

## 8. Remaining Typography Risks

| Risk | Notes |
|---|---|
| Dawn `base.css` still owns raw `h1`–`h5` / `.hxxl` literals | Intentional — Nether extends, does not replace Dawn |
| Button font sizes remain local literals | Out of scope (do not redesign buttons) |
| Some frameworks still use opacity for muted text vs `.type-muted` | Cosmetic consistency; non-blocking |
| Schema defaults still say `"body"` in JSON | Runtime-normalized; future sprint may align defaults to `type-body` |
| Mega-menu / facets / cart-items hardcodes | Lower priority Dawn-adjacent surfaces; not Nether presentation frameworks |

---

## 9. Sprint 9 Completion Status

**COMPLETE**

Stop after Sprint 9.  
Do **NOT** begin Sprint 10.
