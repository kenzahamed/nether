# Nether Premium Recommendations Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Recommendations

---

## 1. Summary

The Nether Premium Recommendations Commerce Framework is a reusable OS 2.0 recommendations system for luxury Shopify storefronts. It **extends** Dawn `<product-recommendations>`, related products, complementary products, cart recommendations, product cards, and Search & Discovery — without replacing Shopify Product Recommendations API behavior or rebuilding Dawn recommendation engines.

The framework is **category-agnostic** and composable across fashion, beauty, perfume, furniture, electronics, jewelry, bakery, automotive, lifestyle, home decor, and future industries.

Live strategies (related, complementary, collection/trending/new arrivals/best sellers) are production-ready. Frequently bought together, recently viewed, recently purchased, recommended for you, AI, personalization, analytics, merchandising rules, and A/B testing are exposed as **extension points only**.

---

## 2. Framework Architecture

```
Theme Editor section: nether-recommendations
  └── <product-recommendations>          ← Dawn CE (API sources only)
        └── <nether-recommendations>     ← Nether orchestrator + Motion
              ├── header
              ├── toolbar
              ├── grid | carousel | editorial
              │     └── card-product (+ wishlist / compare / QV slots)
              ├── empty state
              ├── merchant content blocks
              └── extension placeholders

Existing commerce surfaces (extended, not replaced)
  ├── PDP complementary / related        → framework classes + assets
  ├── Cart recommendations               → data-product-id fix + framework hooks
  ├── Collection page                    → recommend_placeholder
  ├── Wishlist / Compare pages           → recommend_placeholder
  ├── Product / Collection showcases     → integration note + extension host
  ├── Quick View                         → existing recommendations extension
  └── Search drawer                      → hidden recommendations placeholder
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `sections/nether-recommendations.liquid` | Section orchestrator + Theme Editor schema |
| `snippets/nether-recommendations-*.liquid` | Composable commerce modules |
| `assets/component-recommendations.css` | Scoped `.nether-recommendations-*` styles |
| `assets/component-recommendations.js` | `<nether-recommendations>` + `NetherRecommendationsAPI` hooks |
| Dawn / Shopify roots | Preserved: `<product-recommendations>`, `routes.product_recommendations_url`, `card-product`, `slider-component`, predictive search |

---

## 3. Recommendation Strategies

| Strategy | Status | Implementation |
|----------|--------|----------------|
| Related products | Live | Shopify Product Recommendations API (default intent) |
| Complementary products | Live | Shopify API `intent=complementary` |
| Collection | Live | Merchant-selected collection products |
| Trending | Live (collection-backed) | Collection products (merchant curated “trending” collection) |
| New arrivals | Live (collection-backed) | Collection products sorted by `published_at` |
| Best sellers | Live (collection-backed) | Collection products (merchant curated best-sellers collection) |
| Frequently bought together | Extension only | Placeholder + block |
| Recently viewed | Extension only | Placeholder + block / QV hook |
| Recently purchased | Extension only | Placeholder + block |
| Recommended for you | Extension only | Placeholder + block / search / compare / wishlist hooks |

---

## 4. Commerce Modules

| Module | Snippet / Element | Purpose |
|--------|-------------------|---------|
| Recommendation Section | `nether-recommendations.liquid` / `<nether-recommendations>` | Orchestrator |
| Recommendation Header | `nether-recommendations-header.liquid` | Eyebrow, heading, strategy badge |
| Recommendation Grid | `nether-recommendations-grid.liquid` | Dawn product-grid layout |
| Recommendation Carousel | `nether-recommendations-carousel.liquid` | Dawn `slider-component` |
| Recommendation Cards | `nether-recommendations-cards.liquid` | `card-product` + optional badges / commerce slots |
| Recommendation Toolbar | `nether-recommendations-toolbar.liquid` | Count, view all, filter hook |
| Recommendation Empty | `nether-recommendations-empty.liquid` | Empty + design-mode messaging |
| Recommendation Extensions | `nether-recommendations-extensions.liquid` | Future engines / AI / analytics / A/B |
| Merchant content | `nether-recommendations-merchant-content.liquid` | RTE / page content |
| Body composer | `nether-recommendations-body.liquid` | Header + toolbar + layout + blocks |
| Block dispatcher | `nether-recommendations-block.liquid` | OS 2.0 block composition |
| Assets loader | `nether-recommendations-assets.liquid` | Conditional CSS/JS |

Modules reuse Button, Badge, Icon, Typography, Glass, Gradient, Shadow, Radius, Product Card, Wishlist, Compare, Quick View, and NetherMotion — they do not duplicate product or collection frameworks.

---

## 5. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-recommendations.liquid` | Standalone Recommendations section |
| `snippets/nether-recommendations-assets.liquid` | Asset loader |
| `snippets/nether-recommendations-header.liquid` | Header module |
| `snippets/nether-recommendations-toolbar.liquid` | Toolbar module |
| `snippets/nether-recommendations-grid.liquid` | Grid module |
| `snippets/nether-recommendations-carousel.liquid` | Carousel module |
| `snippets/nether-recommendations-cards.liquid` | Card renderer |
| `snippets/nether-recommendations-empty.liquid` | Empty state |
| `snippets/nether-recommendations-extensions.liquid` | Future extension points |
| `snippets/nether-recommendations-merchant-content.liquid` | Merchant content |
| `snippets/nether-recommendations-body.liquid` | Shared body composition |
| `snippets/nether-recommendations-block.liquid` | Block dispatcher |
| `assets/component-recommendations.css` | Framework styles |
| `assets/component-recommendations.js` | Custom element + extension API |
| `RECOMMENDATIONS_FRAMEWORK_REPORT.md` | This report |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `assets/nether-motion.js` | Registers `nether-recommendations` in `SECTION_SELECTORS` |
| `snippets/nether-cart-recommendations.liquid` | Framework hooks + `data-product-id` fix |
| `snippets/nether-product-page-related.liquid` | Framework classes/assets; preserves CE |
| `snippets/nether-product-page-complementary.liquid` | Framework hooks + `product_view_context` |
| `snippets/nether-collection-page-block.liquid` | `recommend_placeholder` module |
| `snippets/nether-collection-page-extensions.liquid` | Recommendations extension case |
| `snippets/nether-compare-block.liquid` | Composes recommendations extensions |
| `snippets/nether-wishlist-block.liquid` | `recommend_placeholder` |
| `snippets/nether-search-drawer.liquid` | Hidden search recommendations placeholder |
| `sections/nether-collection-page.liquid` | Recommendations placeholder block schema |
| `sections/nether-wishlist-page.liquid` | Recommendations placeholder block schema |
| `sections/nether-product.liquid` | Showcase integration note setting |
| `sections/nether-collection.liquid` | Showcase integration note setting |
| `locales/en.default.json` | Storefront strings |
| `locales/en.default.schema.json` | Theme Editor labels |

**Not deleted or renamed:** Dawn `related-products`, `main-product` complementary, `global.js` `ProductRecommendations`, predictive search stack.

---

## 7. Merchant Settings

Theme Editor controls on **Nether recommendations**:

- Recommendation source (related, complementary, collection, trending, new arrivals, best sellers, + future options)
- Seed product / collection
- Layout: grid / carousel / editorial
- Grid columns (desktop / tablet / mobile)
- Card style + badge label
- Section spacing / padding / color scheme
- Desktop / tablet / mobile layout presets
- Animation style + speed
- Toolbar, view all, strategy badge
- Wishlist / Compare / Quick View card toggles
- Glass / gradient accents
- Empty-state copy
- Extension + merchant content blocks

---

## 8. Motion Integration

- Uses **NetherMotion only** (`data-nether-motion="recommendations"`, `registerSection`)
- Supports section reveal, card stagger, carousel reveal, toolbar transition, hover lift
- Loads ScrollTrigger via `data-nether-motion-plugins` + `NetherMotion.load`
- Respects `prefers-reduced-motion` (instant visible state, no hover transform)

---

## 9. Shopify Integration

| Surface | Integration |
|---------|-------------|
| Product Recommendations API | Native `routes.product_recommendations_url` + Section Rendering via Dawn CE |
| Complementary | `intent=complementary` preserved |
| Related | Default Shopify related recommendations |
| Collection products | Native collection product lists |
| Product cards | Dawn `card-product` with `product_view_context: 'recommendation'` |
| Search | Predictive search unchanged; drawer hosts future recommendations placeholder |
| Cart / PDP | Existing CE markup extended; lazy load via IntersectionObserver retained |

---

## 10. Accessibility

- Region `aria-label` on section root
- Grid / carousel list labels
- Toolbar `role="toolbar"`
- Empty state `role="status"`
- Extension groups with accessible labels
- Dawn slider prev/next controls reused for carousel
- Keyboard arrow support on carousel wrapper
- Reduced-motion path in CSS + JS

---

## 11. Performance

- Reuses existing Product Card, Button, Badge, Icon, Typography, Wishlist, Compare, Quick View, Slider, and NetherMotion assets
- Lazy-loads Shopify recommendations via Dawn `<product-recommendations>` IntersectionObserver
- Conditional asset loading via `nether-recommendations-assets` (+ wishlist/compare/QV only when enabled)
- Avoids duplicate recommendation fetch logic (no parallel engine)
- Card styles skipped after first card in loops (`skip_styles`)

---

## 12. Future Extension Points

| Hook | Mechanism |
|------|-----------|
| Frequently bought together | Source option + `freq_bought_placeholder` block |
| Recently viewed | Extension + QV / collection hooks |
| Recently purchased | Extension block |
| Recommended for you | Extension + search / wishlist / compare hosts |
| AI recommendations | `ai_placeholder` |
| Personalization | `personalize_placeholder` |
| Analytics | `analytics_placeholder` + `NetherRecommendationsAPI.emit` |
| Merchandising rules | `merchandising_placeholder` |
| A/B testing | `ab_testing_placeholder` |
| Collection cards | `coll_cards_placeholder` |
| Filters | Toolbar filter placeholder (`data-nether-recommendations-filter-placeholder`) |
| JS adapters | `window.NetherRecommendationsAPI.extend()` / custom events `nether:recommendations:*` |

---

## 13. Verification Checklist

| Check | Status |
|-------|--------|
| Existing Shopify recommendation functionality preserved | Yes — Dawn CE + API URLs unchanged |
| Existing Dawn related / complementary / predictive search preserved | Yes |
| No duplicate recommendation engines introduced | Yes |
| Reuses `card-product`, slider, design system, NetherMotion | Yes |
| Online Store 2.0 section/blocks/schema | Yes |
| Theme Check — recommendation files introduced without new destroy/delete violations | Yes (pre-existing ValidJSON schema typing warnings elsewhere remain unrelated) |
| Locale JSON parses | Yes |
| No files deleted or renamed | Yes |
| Extension-only future strategies (no fake engines) | Yes |
| Responsive / Theme Editor settings present | Yes |
| Accessibility + reduced motion | Yes |

---

**Stop condition:** Premium Recommendations Commerce Framework complete. Ready for the next Nether Commerce Framework request.
