# Nether Premium Product Showcase Framework — Implementation Report

**Date:** 2026-07-13  
**Framework:** Nether Shopify Framework  
**Phase:** Premium Product Showcase  

---

## 1. Summary

The Nether Premium Product Showcase Framework is a reusable OS 2.0 section system for showcasing products across luxury storefronts. It follows the same architectural pattern as the Collection Showcase, Hero, and Banner frameworks: a thin section orchestrator, composable snippets, scoped CSS variables, a `nether-product` custom element, and NetherMotion integration.

The framework **extends** Dawn's `featured-collection`, `card-product`, and `price` systems without modifying or replacing them. Dawn sections and product presentation remain fully intact.

**Key capabilities delivered:**

- 9 merchant-selectable layouts (editorial, luxury, masonry, magazine, split, card grid, minimal, horizontal scroll, carousel)
- 8 product source modes (manual, featured, collection, best sellers, new arrivals, trending, recently added, automatic)
- 7 card styles reusing the Card Premium system
- Full Dawn `card-product` integration on card grid and minimal layouts (including quick add)
- Premium overlay cards for editorial/luxury layouts with price, savings, ratings, stock, badges, and video support
- Optional promotional card block
- NetherMotion animations (fade, slide, stagger, scale, hover reveal, parallax-ready)
- Wishlist and compare placeholders aligned with the header framework

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-product.liquid` | Main OS 2.0 section orchestrator with schema, presets, and grid logic |
| `snippets/nether-product-card.liquid` | Premium overlay product card |
| `snippets/nether-product-media.liquid` | Product image/video media with parallax hooks |
| `snippets/nether-product-content.liquid` | Section header shell |
| `snippets/nether-product-block.liquid` | Header block dispatcher |
| `snippets/nether-product-stat.liquid` | Per-card statistics |
| `snippets/nether-product-highlight.liquid` | Product highlight chips in header |
| `snippets/nether-product-divider.liquid` | Optional section dividers |
| `snippets/nether-product-promotional-card.liquid` | Optional promotional grid card |
| `snippets/nether-product-actions.liquid` | Wishlist/compare placeholders and overlay quick-action link |
| `assets/component-product-showcase.css` | Scoped product showcase styles |
| `assets/component-product-showcase.js` | `nether-product` custom element and motion |
| `PRODUCT_SHOWCASE_REPORT.md` | This report |

---

## 3. Files Modified

| File | Change |
|------|--------|
| `assets/nether-motion.js` | Added `nether-product` to `SECTION_SELECTORS` for lazy GSAP boot |
| `locales/en.default.json` | Added `sections.nether_product` storefront strings |
| `locales/en.default.schema.json` | Added `sections.nether_product` Theme Editor schema labels |

**No existing files were deleted or renamed.**

---

## 4. Product Layouts Implemented

| Layout | CSS Modifier | Card Renderer |
|--------|--------------|---------------|
| Editorial Grid | `nether-product--layout-editorial_grid` | `nether-product-card` |
| Luxury Grid | `nether-product--layout-luxury_grid` | `nether-product-card` |
| Masonry Layout | `nether-product--layout-masonry_grid` | `nether-product-card` |
| Magazine Layout | `nether-product--layout-magazine` | `nether-product-card` (featured first item) |
| Split Product Layout | `nether-product--layout-split_product` | `nether-product-card` (featured first item) |
| Card Grid | `nether-product--layout-card_grid` | Dawn `card-product` |
| Minimal Layout | `nether-product--layout-minimal_layout` | Dawn `card-product` |
| Horizontal Scroll | `nether-product--layout-horizontal_scroll` | Context-dependent |
| Product Carousel | `nether-product--layout-carousel` | Context-dependent + Dawn `slider-component` |

---

## 5. Merchant Settings

### Section settings (grouped)

| Group | Settings |
|-------|----------|
| **Framework** | Product source, collection, products to show, layout, columns (desktop/tablet/mobile), gap, card style, content position/alignment, image ratio/shape, heading level, aria label, full width, description/vendor/rating/savings/stock toggles |
| **Product features** | Quick add (none/standard/bulk), wishlist placeholder, compare placeholder |
| **Visual** | Overlay opacity, glass, gradient style, floating cards, hover effect, dividers |
| **CTA** | Default card CTA label/style, view-all button |
| **Motion** | Animation style, speed, parallax |
| **Responsive** | Desktop/tablet/mobile layout modifiers |
| **Standard** | Color scheme, padding |

### Product source modes

| Mode | Behavior |
|------|----------|
| Manual products | Renders `product` and `promotional_card` blocks in block order |
| Featured products | Same as manual (curated block selection) |
| Collection products | Products from selected collection (up to limit) |
| Best sellers | Collection-based — merchant sorts collection in admin |
| New arrivals | Collection-based — merchant sorts collection in admin |
| Trending products | Collection-based — merchant sorts collection in admin |
| Recently added | Collection-based — merchant sorts collection in admin |
| Automatic | Uses product blocks when present; otherwise falls back to collection |

### Block types

| Block | Limit | Role |
|-------|-------|------|
| `product` | 16 (shared max) | Grid product with media overrides, badges, stats, CTA |
| `promotional_card` | 1 | Non-product promotional card in grid |
| `eyebrow` | 1 | Header overline |
| `heading` | 1 | Section title |
| `subheading` | 1 | Secondary title |
| `text` | 1 | Body copy |
| `buttons` | 1 | Header CTAs |
| `product_highlight` | 3 | Compact product highlight row |
| `@app` | — | App blocks in header |

---

## 6. Motion Integration

- Custom element: `<nether-product>` with `data-nether-motion="product"`
- Registered via `NetherMotion.registerSection('{sectionId}-product', { type: 'product', ... })`
- GSAP loaded only through `NetherMotion.whenReady()` — no manual script tags
- Animation styles: fade, slide, stagger, scale
- ScrollTrigger reveal on grid items (`data-nether-product-item`)
- Optional parallax on media (`data-nether-product-parallax`) when enabled
- Hover reveal via GSAP when `nether_hover_effect` is `reveal`
- `prefers-reduced-motion` respected in JS and CSS
- Theme Editor: `shopify:section:load` re-initializes motion

---

## 7. Accessibility Improvements

- `role="region"` on section with configurable `aria-label`
- `role="list"` on product grid with translated `aria-label`
- Single primary link per overlay card with descriptive `aria-label`
- `product-component` + Standard Events on product cards
- Rating stars use `role="img"` with screen reader labels when metafield data exists
- Wishlist/compare placeholders use `aria-disabled="true"` and `tabindex="-1"`
- Carousel arrow-key navigation between product links
- `:focus-visible` and `:focus-within` support for hover reveal
- Reduced motion: `nether-product-card--motion-reduced` class and CSS overrides

---

## 8. Performance Improvements

- Conditional asset loading: glass, gradient, slider, deferred-media, rating, quick-add scripts only when needed
- `card-product` `skip_styles` pattern for grid loops
- Lazy image loading after first visible row
- Dawn `card-product` reused on card grid/minimal — no duplicate product card implementation
- NetherMotion lazy boot via `SECTION_SELECTORS` — GSAP loads only when `nether-product` exists
- Parallax GSAP plugins loaded only when parallax setting enabled
- Reused Phase 1 design system CSS (no duplicated token definitions)

---

## 9. Framework Integration

| Nether System | Integration |
|---------------|-------------|
| **Card System** | `card--premium-*`, `card-hover-*` on overlay cards; full `card-product` on card grid |
| **Button System** | Header CTAs, card CTAs, view-all, overlay quick-action |
| **Badge System** | Sale/sold out auto-badges + custom block badges |
| **Typography System** | `type-overline`, `type-heading-md`, `type-body-sm`, `type-caption`, `type-display-sm` |
| **Icon System** | Wishlist/compare placeholders |
| **Glass System** | `glass-card-light` panels |
| **Gradient System** | `grad-hero-*`, `grad-linear-fade-down` overlays |
| **Shadow/Radius** | Inherited via Card Premium and design tokens |
| **NetherMotion** | Section registration, GSAP lifecycle, reduced motion |
| **Collection Showcase** | Parallel architecture (orchestrator → snippets → CSS → JS) |
| **Dawn slider-component** | Carousel layout |
| **Dawn quick-add** | Card grid and minimal layouts via `card-product` |

---

## 10. Theme Editor Support

- Section name: **Nether products**
- 4 presets: Default, Card grid, Editorial products, Split product
- Placeholder state when no products configured
- `shopify_attributes` on all blocks
- `max_blocks: 16`
- `disabled_on: header, footer`
- Full schema translations in `en.default.schema.json`
- Block-order preserved for manual/featured sources (including promotional cards)

---

## 11. Verification Checklist

| Check | Status |
|-------|--------|
| Existing Dawn `featured-collection.liquid` preserved | ✅ |
| Existing Dawn `featured-product.liquid` preserved | ✅ |
| Existing `card-product.liquid` preserved | ✅ |
| No existing files deleted | ✅ |
| No existing files renamed | ✅ |
| Phase 1 design systems reused | ✅ |
| Collection Showcase architecture mirrored | ✅ |
| No duplicate product card Liquid | ✅ (card grid uses `card-product`) |
| No manual GSAP script tags | ✅ |
| NetherMotion integration | ✅ |
| OS 2.0 blocks and settings | ✅ |
| Theme Check — no new errors in product files | ✅ (1 pre-existing schema warning unrelated) |
| Responsive layouts (desktop/tablet/mobile) | ✅ |
| Reduced motion support | ✅ |
| Quick add on card grid via Dawn | ✅ |
| Wishlist/compare placeholders | ✅ |

---

## Architecture Diagram

```
sections/nether-product.liquid
├── nether-product-content.liquid
│   └── nether-product-block.liquid
│       ├── button.liquid
│       └── nether-product-highlight.liquid
├── [grid loop]
│   ├── card-product.liquid (card grid / minimal)
│   ├── nether-product-card.liquid (overlay layouts)
│   │   ├── nether-product-media.liquid
│   │   ├── price.liquid
│   │   ├── badge.liquid
│   │   ├── nether-product-stat.liquid
│   │   └── nether-product-actions.liquid
│   └── nether-product-promotional-card.liquid
├── nether-product-divider.liquid
├── component-product-showcase.css
├── component-product-showcase.js → NetherMotion
└── nether-motion.js (SECTION_SELECTORS)
```

---

**Verdict:** The Nether Premium Product Showcase Framework is production-ready for client deployments. It extends Dawn product presentation with a premium, category-agnostic showcase layer while preserving all existing functionality.
