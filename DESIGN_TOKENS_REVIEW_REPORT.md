# Nether Design Tokens Review & Cleanup — Report

## 1. Summary

A comprehensive review was performed across all ten Phase 1 Premium Foundation systems. The review focused on token consistency, utility naming, system interoperability, duplication removal, accessibility, and Shopify compatibility — without adding features, redesigning systems, or breaking existing APIs.

**Outcome:** Phase 1 Foundation is **complete and production-ready**. All systems follow a consistent extend-don't-replace architecture. Targeted safe consolidations were applied where token references could be unified without visual or behavioral changes. No class names, snippet APIs, or Dawn functionality were removed.

**Cleanup applied:**

- Shadow composition helpers in Glass and Gradient systems now reference Shadow System tokens directly
- Duplicate hero gradient rules consolidated
- Category card overlay aligned to Gradient System token via additive bridge
- Button and Badge systems now reference Icon System spacing tokens
- Border Radius System gained a documented intensity alias
- Empty CSS rules removed
- Password layout brought to parity with main layout for Card System CSS

**Intentionally preserved:**

- Dawn `.gradient`, color schemes, and all merchant theme settings
- Existing hardcoded values in `component-card-premium.css` (radius, gradient border, category overlay source)
- Per-system readable/focus utility namespaces (`.glass-readable`, `.grad-readable`, `.radius-focus-safe`)
- Separate glass shadow tokens (`.glass-shadow-*`) — tuned independently from elevation shadows

---

## 2. Systems Reviewed

| # | System | CSS Asset | Snippet(s) | JS | Report | Status |
|---|---|---|---|---|---|---|
| 1 | Premium Button System | `component-button.css` | `button.liquid` | — | `BUTTON_SYSTEM_REPORT.md` | ✅ Complete |
| 2 | Premium Card System | `component-card-premium.css` | `card.liquid` | — | `CARD_SYSTEM_REPORT.md` | ✅ Complete |
| 3 | Premium Typography System | `component-typography.css` | — | — | `TYPOGRAPHY_SYSTEM_REPORT.md` | ✅ Complete |
| 4 | Premium Icon System | `component-icon.css` | `icon.liquid` | — | `ICON_SYSTEM_REPORT.md` | ✅ Complete |
| 5 | Premium Badge System | `component-badge.css` | `badge.liquid` | — | `BADGE_SYSTEM_REPORT.md` | ✅ Complete |
| 6 | Premium Form System | `component-form.css` | `form-*.liquid` | `component-form.js` | `FORM_SYSTEM_REPORT.md` | ✅ Complete |
| 7 | Premium Shadow System | `component-shadow.css` | — | — | `SHADOW_SYSTEM_REPORT.md` | ✅ Complete |
| 8 | Premium Border Radius System | `component-radius.css` | — | — | `BORDER_RADIUS_SYSTEM_REPORT.md` | ✅ Complete |
| 9 | Premium Glass Effects | `component-glass.css` | — | — | `GLASS_EFFECTS_REPORT.md` | ✅ Complete |
| 10 | Premium Gradient Utilities | `component-gradient.css` | — | — | `GRADIENT_UTILITIES_REPORT.md` | ✅ Complete |

### Global Load Order (`layout/theme.liquid`)

```
base.css
→ component-typography.css
→ component-icon.css
→ component-button.css
→ component-card-premium.css
→ component-badge.css
→ component-form.css
→ component-shadow.css
→ component-radius.css
→ component-glass.css
→ component-gradient.css
```

Effect systems (Shadow → Radius → Glass → Gradient) load in dependency order. Typography and Icon load first as foundational token providers.

---

## 3. Files Modified

| File | Change | Risk |
|---|---|---|
| `assets/component-glass.css` | `.glass-with-shadow-*` now uses `--shadow-level-*` directly | None — Shadow loads first |
| `assets/component-gradient.css` | Merged duplicate `.grad-hero-brand` / `.grad-hero-mesh`; simplified `.grad-with-shadow-*`; category overlay token bridge | None — equivalent defaults |
| `assets/component-radius.css` | Added `--radius-intensity` alias; removed empty button bridge rules | None — additive alias |
| `assets/component-button.css` | Button icon size/gap now reference Icon System tokens | None — same computed values |
| `assets/component-badge.css` | `--badge-icon-gap-md` now references `--icon-gap-sm` | None — same value (0.4rem) |
| `assets/component-shadow.css` | Documented cross-system intensity naming convention | None — comment only |
| `layout/password.liquid` | Added `component-card-premium.css` for layout parity | None — additive |

**Files reviewed but not modified:** `base.css`, `component-card-premium.css`, `component-typography.css`, `component-icon.css`, `component-form.css`, all Liquid snippets, `component-form.js`, `layout/theme.liquid`.

---

## 4. Duplicates Removed

| Duplicate | Location | Resolution |
|---|---|---|
| Hardcoded shadow fallbacks in `.glass-with-shadow-*` | `component-glass.css` | Removed — uses `--shadow-level-sm/md/lg` from Shadow System |
| Hardcoded shadow fallbacks in `.grad-with-shadow-*` | `component-gradient.css` | Removed — uses `--shadow-level-sm/md/lg` |
| Identical `.grad-hero-brand` and `.grad-hero-mesh` rules | `component-gradient.css` | Merged into shared selector block |
| Empty `.button.radius-vars-*` bridge rules | `component-radius.css` | Removed — no-op rules |
| Hardcoded `0.8rem` button inner gap | `component-button.css` | Replaced with `var(--icon-gap-md)` |
| Hardcoded `1.6rem` button icon dimensions | `component-button.css` | Replaced with `var(--icon-size-sm)` |
| Hardcoded `0.4rem` badge icon gap | `component-badge.css` | Replaced with `var(--icon-gap-sm)` |

### Duplicates Intentionally Retained

| Pattern | Reason |
|---|---|
| `.glass-readable` / `.grad-readable` | Domain-specific contrast wrappers — different fallback colors and child selectors |
| `.glass-shadow-*` tokens vs `--shadow-level-*` | Glass shadows tuned for frosted surfaces (different blur/opacity than elevation) |
| `.card--radius-sm` hardcoded `0.4rem` in card-premium | Existing API preserved — aligns with `--radius-sm` but not replaced to avoid cascade risk |
| `.card--gradient-border` mask rules | Existing Card System feature — extended by `.grad-border-*`, not replaced |
| Dawn `.gradient` vs Nether `.grad-*` | Separate namespaces by design — Dawn handles scheme backgrounds, Nether handles utility gradients |
| Form field sizing literals (`1.6rem` padding) | Dawn input geometry — not part of icon/spacing token scale |
| Per-system `:root` blocks | Acceptable separation of concerns — each system owns its token namespace |

### Liquid & JavaScript Review

| Area | Finding |
|---|---|
| **Liquid snippets** | No duplicated snippet logic found. Each component (`button`, `card`, `badge`, `icon`, `form-*`) has a single authoritative snippet with consistent `assign *_classes` patterns |
| **JavaScript** | Single Phase 1 JS file: `component-form.js` (FormField, FormTextarea, FormFile custom elements). No duplication with `global.js`. No JS in other Phase 1 systems |
| **Icon resolution** | `icon.liquid` is the canonical icon renderer; `button.liquid` and `card.liquid` inline SVG references are intentional for performance in those contexts |

---

## 5. Token Standardization

### Naming Convention (Verified)

| Pattern | Example | Used By |
|---|---|---|
| `{system}-{property}-{scale}` | `--shadow-sm-blur`, `--radius-sm`, `--glass-blur-medium` | Shadow, Radius, Glass |
| `{system}-level-{name}` | `--shadow-level-md`, `--radius-level-lg` | Shadow, Radius |
| `{system}-{category}-{variant}` | `--badge-size-md-font`, `--form-field-height-md` | Badge, Form |
| `{system}-intensity` | `--shadow-intensity`, `--gradient-intensity` | Shadow, Gradient |
| `{system}-scale` | `--radius-scale` | Radius |
| `{system}-{axis}-intensity` | `--glass-blur-intensity`, `--glass-bg-intensity` | Glass (multi-axis) |
| Composed recipes | `--grad-linear-brand`, `--grad-mesh-hero` | Gradient |
| Dawn bridges | `--border-radius`, `--buttons-radius`, `--gradient-background` | All effect systems |

### Cross-System Token References (Verified)

| Consumer | References | Provider |
|---|---|---|
| Badge System | `--radius-pill`, `--radius-sm` | Border Radius System |
| Button System | `--icon-size-sm`, `--icon-gap-md` | Icon System |
| Badge System | `--icon-gap-sm` | Icon System |
| Glass System | `--shadow-intensity`, `--shadow-level-*` | Shadow System |
| Gradient System | `--shadow-level-*`, `--color-*` channels | Shadow / Dawn |
| Glass / Gradient / Radius | `--radius-md` (hero glass default) | Border Radius System |
| All effect systems | `--color-background`, `--color-foreground`, `--color-button`, `--color-shadow` | Dawn `theme.liquid` |
| Typography | `--font-body-*`, `--font-heading-*` | Dawn `theme.liquid` |

### Intensity Multiplier Alignment

| System | Primary Token | Alias Added | Notes |
|---|---|---|---|
| Shadow | `--shadow-intensity` | — | Reference implementation |
| Radius | `--radius-scale` | `--radius-intensity` ✅ | Alias added for naming consistency |
| Glass | `--glass-blur-intensity`, `--glass-opacity-intensity`, `--glass-border-intensity`, `--glass-bg-intensity` | — | Multi-axis by design (blur ≠ opacity) |
| Gradient | `--gradient-intensity`, `--gradient-overlay-opacity` | — | Angle stored separately as `--gradient-angle` |

### Utility Class Namespace (Verified)

| System | Prefix | Collision Risk |
|---|---|---|
| Typography | `.type-*` | None |
| Icon | `.icon-wrap--*` | None |
| Button | `.button--*` | None — extends Dawn `.button` |
| Card | `.card--premium-*`, `.card--radius-*`, `.card--shadow-*`, `.card-hover-*` | None |
| Badge | `.badge--*` | None — extends Dawn `.badge` |
| Form | `.field--*`, `.form-*` | None |
| Shadow | `.shadow-*`, `.shadow-vars-*`, `.shadow-context-*` | None |
| Radius | `.radius-*`, `.radius-vars-*`, `.radius-context-*`, `.radius-{category}-*` | None |
| Glass | `.glass-*`, `.glass-{category}-*` | None |
| Gradient | `.grad-*` | None — Dawn `.gradient` is separate |

### System Composition (Verified)

All effect systems compose freely on the same element:

```html
<div class="card card--card card--premium-glass grad-mesh-brand glass-medium radius-lg shadow-md grad-readable radius-focus-safe">
```

```liquid
{% render 'button',
  label: 'Shop',
  class: 'grad-button-brand glass-button-frosted radius-button-pill shadow-sm'
%}
```

---

## 6. Performance Improvements

| Improvement | Detail |
|---|---|
| **Reduced CSS duplication** | Removed 6 hardcoded shadow fallback values; merged duplicate hero gradient block; removed 4 empty rules |
| **Token indirection** | Button/Badge now resolve sizes through Icon tokens — single source of truth for spacing scale |
| **No added assets** | Zero new stylesheets or scripts — cleanup only |
| **Load order preserved** | 10 Phase 1 CSS files + 1 JS file; no redundant imports |
| **GPU-friendly effects** | Glass (`backdrop-filter`) and gradients (`background-image`) remain CSS-only with `prefers-reduced-transparency` opt-out |
| **Password layout parity** | Card premium CSS now available on password layout — prevents missing styles if card utilities are used |

---

## 7. Accessibility Verification

| System | Feature | Status |
|---|---|---|
| **Typography** | Readable measure (`.type-measure`), semantic heading scale | ✅ |
| **Icon** | `aria-hidden`, `role="img"`, forced-colors support | ✅ |
| **Button** | Dawn focus rings preserved; `prefers-reduced-motion`; forced-colors | ✅ |
| **Card** | Stretched links; reduced-motion hover guards; forced-colors glass/border fallbacks | ✅ |
| **Badge** | Semantic text labels; forced-colors borders | ✅ |
| **Form** | `aria-describedby`, error/success states, `prefers-reduced-motion`, forced-colors | ✅ |
| **Shadow** | `.shadow-focus-*` supplementary only; never replaces Dawn focus rings | ✅ |
| **Radius** | `.radius-focus-safe` prevents focus ring clipping | ✅ |
| **Glass** | `prefers-reduced-transparency` solidifies surfaces; `.glass-readable` contrast wrappers | ✅ |
| **Gradient** | Text gradient fallbacks; `prefers-contrast: more`; forced-colors solidification | ✅ |

**No accessibility regressions introduced by cleanup changes.**

---

## 8. Compatibility Verification

### Theme Check

| Check | Result |
|---|---|
| New asset references (`component-*.css`) | ✅ Valid `stylesheet_tag` usage |
| Liquid in CSS | ✅ None |
| Phase 1 file errors | ✅ None introduced |
| Pre-existing errors | ⚠️ 4 `ParserBlockingScript` warnings for external GSAP CDN in `theme.liquid` (pre-existing, unrelated to Phase 1) |

### Shopify Online Store 2.0

| Requirement | Status |
|---|---|
| Section/block schema class fields compatible with utility classes | ✅ |
| `{% render %}` snippet APIs unchanged | ✅ |
| Color scheme tokens (`.color-{id}`) drive all system color channels | ✅ |
| JSON templates unaffected | ✅ |
| App blocks unaffected | ✅ |

### Browser Support

| Feature | Fallback |
|---|---|
| `backdrop-filter` (Glass) | Solid background under `prefers-reduced-transparency` |
| `background-clip: text` (Gradient) | Solid `color` fallback on all text gradients |
| `mask-composite` (Border gradients) | Solid border under `forced-colors` |
| CSS custom properties | Supported in all Shopify-supported browsers |

---

## 9. Final Phase 1 Verification

### Foundation Checklist

| Criterion | Status |
|---|---|
| 10 Premium systems implemented | ✅ |
| 10 system reports generated | ✅ |
| Global CSS load order established | ✅ |
| Reusable Liquid snippets for components | ✅ (`button`, `card`, `badge`, `icon`, `form-*`) |
| Design tokens use CSS custom properties | ✅ |
| Merchant-global multipliers prepared | ✅ (intensity/scale tokens in effect systems) |
| Dawn extend-don't-replace architecture | ✅ |
| No existing functionality removed | ✅ |
| No existing class names broken | ✅ |
| System composition verified | ✅ |
| Accessibility patterns consistent | ✅ |
| Theme Check compatible | ✅ |
| Online Store 2.0 compatible | ✅ |
| Design tokens review complete | ✅ |

### Phase 1 Foundation Status

**Phase 1 Foundation is COMPLETE.**

The Nether Shopify Framework now has a unified, composable design token layer spanning typography, icons, components (button, card, badge, form), and visual effects (shadow, radius, glass, gradient). All systems are:

- **Consistent** — shared naming conventions, load order, and Dawn token bridges
- **Reusable** — utility classes and snippets work across any section or client build
- **Integrated** — cross-system token references verified and strengthened
- **Production-ready** — accessible, performant, Theme Check compatible, OS 2.0 compatible

### Recommended Phase 2 Prerequisites (Informational Only)

These are not blockers — noted for future work:

1. Wire `--shadow-intensity`, `--radius-scale`, `--glass-*-intensity`, and `--gradient-intensity` to `settings_schema.json` theme settings
2. Consider a `component-tokens.css` aggregator only if Phase 2 introduces many more systems
3. Resolve pre-existing GSAP parser-blocking script warnings in `theme.liquid`
4. Add `prefers-reduced-transparency` handling to `.card--premium-glass` in a future card system pass (currently handled at Glass utility level and forced-colors in card-premium)

---

*Nether Design Tokens Review — Phase 1 Foundation verified complete.*
