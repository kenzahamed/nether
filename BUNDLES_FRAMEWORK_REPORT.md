# Nether Premium Bundles & Product Packs Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Bundles & Product Packs

---

## 1. Summary

The Nether Premium Bundles & Product Packs Commerce Framework is a reusable OS 2.0 bundles system for luxury Shopify storefronts. It **extends** Dawn product cards, complementary recommendations, Cart AJAX (`/cart/add.js` with `items[]`), Product Page, Cart, Wishlist/Compare/Quick View card slots, and showcases — without replacing Shopify commerce roots or rebuilding product-form, product-info, variants, cart drawer, or checkout.

The framework is **category-agnostic** and composable across fashion, beauty, perfume, furniture, electronics, jewelry, bakery, automotive, lifestyle, home decor, and future industries.

Live strategies (frequently bought together, complete the look, product packs, volume discount display, mix & match, curated, gift sets) are production-ready for presentation and multi-item cart add. Build-your-own, subscription bundles, AI recommendations, dynamic merchandising, inventory validation, discount engines, personalization, analytics, and loyalty are exposed as **extension points only**.

---

## 2. Framework Architecture

```
Theme Editor section: nether-bundles
  └── <product-recommendations>          ← Dawn CE (FBT / Complete the look)
        └── <nether-bundles>             ← Nether orchestrator + Motion
              ├── header
              ├── grid (pack cards)
              │     └── card-product (+ wishlist / compare / QV slots)
              ├── summary
              │     ├── pricing
              │     ├── notes (optional)
              │     └── actions (multi-item Cart AJAX)
              ├── drawer (mobile summary)
              ├── empty state
              ├── merchant content blocks
              └── extension placeholders

Existing commerce surfaces (extended, not replaced)
  ├── PDP bundles_placeholder            → nether-product-page-bundles
  ├── Cart page / drawer bundles block   → nether-cart-bundles
  ├── Product / Collection showcases     → integration note + extension host
  ├── Quick View                         → existing bundles extension host
  ├── Recommendations complementary API  → reused for FBT / CTL strategies
  └── Wishlist / Compare / Quick View    → optional card slots
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `sections/nether-bundles.liquid` | Section orchestrator + Theme Editor schema |
| `snippets/nether-bundles-*.liquid` | Composable commerce modules |
| `assets/component-bundles.css` | Scoped `.nether-bundles-*` styles |
| `assets/component-bundles.js` | `<nether-bundles>` + `NetherBundlesAPI` hooks |
| Dawn / Shopify roots | Preserved: `product-form`, `product-info`, `quantity-input`, `<product-recommendations>`, cart drawer / notification, `card-product`, variants |

---

## 3. Bundle Strategies

| Strategy | Status | Implementation |
|----------|--------|----------------|
| Frequently bought together | Live | Complementary Product Recommendations API + optional current product |
| Complete the look | Live | Complementary API + optional current product |
| Product packs | Live | Bundle product blocks / product list (required by default) |
| Volume discount bundles | Live (display) | Pack UI + merchant display % (presentation only) |
| Mix & match | Live | Collection or product list with optional toggles |
| Curated bundles | Live | Blocks / product list with required/optional flags |
| Gift sets | Live | Pack-style curated products |
| Build your own | Extension only | Placeholder + block |
| Subscription bundles | Extension only | Placeholder + block |
| AI bundle recommendations | Extension only | Placeholder + block |
| Dynamic merchandising | Extension only | Placeholder + showcase note host |

---

## 4. Commerce Modules

| Module | Snippet / Element | Purpose |
|--------|-------------------|---------|
| Bundle Section | `nether-bundles.liquid` / `<nether-bundles>` | Orchestrator |
| Bundle Header | `nether-bundles-header.liquid` | Eyebrow, heading, strategy badge |
| Bundle Grid | `nether-bundles-grid.liquid` + body grid | Pack product layout |
| Bundle Cards | `nether-bundles-cards.liquid` | `card-product` + toggle / variant / qty |
| Bundle Summary | `nether-bundles-summary.liquid` | Selected items + pricing host |
| Bundle Pricing | `nether-bundles-pricing.liquid` | Total / compare / savings |
| Bundle Actions | `nether-bundles-actions.liquid` | Multi-item add to cart |
| Bundle Drawer | `nether-bundles-drawer.liquid` | Mobile summary dialog |
| Bundle Empty State | `nether-bundles-empty.liquid` | Empty / design / API contexts |
| Bundle Extensions | `nether-bundles-extensions.liquid` | Future-ready placeholders |
| Bundle Assets | `nether-bundles-assets.liquid` | Idempotent CSS/JS loader |
| Bundle Embedded | `nether-bundles-embedded.liquid` | PDP / Cart / host composer |
| Block dispatcher | `nether-bundles-block.liquid` | OS 2.0 blocks |
| Merchant content | `nether-bundles-merchant-content.liquid` | Freeform / page content |

---

## 5. Files Created

| File | Role |
|------|------|
| `sections/nether-bundles.liquid` | Theme Editor section |
| `snippets/nether-bundles-assets.liquid` | Asset loader |
| `snippets/nether-bundles-body.liquid` | Shared compose pipeline |
| `snippets/nether-bundles-block.liquid` | Block dispatcher |
| `snippets/nether-bundles-header.liquid` | Header module |
| `snippets/nether-bundles-grid.liquid` | Grid module |
| `snippets/nether-bundles-cards.liquid` | Card / pack item module |
| `snippets/nether-bundles-summary.liquid` | Summary module |
| `snippets/nether-bundles-pricing.liquid` | Pricing module |
| `snippets/nether-bundles-actions.liquid` | ATC actions |
| `snippets/nether-bundles-drawer.liquid` | Drawer shell |
| `snippets/nether-bundles-empty.liquid` | Empty state |
| `snippets/nether-bundles-extensions.liquid` | Extension points |
| `snippets/nether-bundles-merchant-content.liquid` | Merchant content |
| `snippets/nether-bundles-embedded.liquid` | Embedded host |
| `snippets/nether-product-page-bundles.liquid` | PDP integration |
| `snippets/nether-cart-bundles.liquid` | Cart integration |
| `assets/component-bundles.css` | Framework styles |
| `assets/component-bundles.js` | Custom element + API |
| `BUNDLES_FRAMEWORK_REPORT.md` | This report |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `assets/nether-motion.js` | Registered `nether-bundles` in `SECTION_SELECTORS` |
| `snippets/nether-product-page-block.liquid` | `bundles_placeholder` → live bundles module |
| `sections/nether-product-page.liquid` | Conditional assets + expanded bundles block settings |
| `snippets/nether-cart-block.liquid` | `bundles_placeholder` → live cart bundles module |
| `sections/nether-cart-page.liquid` | Expanded bundles block settings |
| `sections/cart-drawer.liquid` | Expanded bundles block settings |
| `sections/nether-product.liquid` | Bundles showcase integration note |
| `sections/nether-collection.liquid` | Bundles showcase integration note |
| `locales/en.default.json` | Storefront strings for bundles |
| `locales/en.default.schema.json` | Theme Editor schema strings |

**Not deleted / not renamed:** All Dawn and existing Nether commerce files remain intact.

---

## 7. Merchant Settings

Theme Editor controls include:

- Bundle strategy
- Layout (split / stacked / compact)
- Grid columns (desktop / tablet / mobile)
- Pricing style (stacked / inline / minimal)
- Savings + savings badge
- Bundle summary toggle
- Bundle notes
- Desktop / tablet / mobile layout density
- Animation style + speed
- Include current/seed product
- Required/optional + variant select + item qty
- Glass / gradient
- Wishlist / Compare / Quick View card slots
- Empty-state copy
- Color scheme + padding

Blocks: Bundle product (required/qty), merchant content, future-engine placeholders, `@app`.

---

## 8. Motion Integration

- Uses **NetherMotion only** (`data-nether-motion="bundles"`, `scrollTrigger` plugin).
- Section reveal, card stagger, summary reveal, hover lift.
- Drawer open/close via native dialog patterns + Escape.
- Respects `prefers-reduced-motion` and `NetherMotion.prefersReducedMotion()`.
- Theme Editor `shopify:section:load` re-init supported.

---

## 9. Shopify Integration

| Native capability | How reused |
|-------------------|------------|
| Product Recommendations | FBT / Complete the look via Dawn `<product-recommendations>` + complementary intent |
| Product Form / Variants | Primary PDP purchase path untouched; bundle items use native variant `<select>` |
| AJAX Cart | `/cart/add.js` multi-item `items[]` + cart drawer/notification section rendering |
| Cart Drawer | Existing `renderContents` / `PUB_SUB_EVENTS.cartUpdate` |
| Dynamic Checkout | Unchanged on primary product form |
| Product cards | `card-product` with `product_view_context: 'bundle'` |
| Quantity | Optional pack item qty inputs (not replacing `<quantity-input>` on PDP) |

Display discount percent is **presentation-only**. Real discounts should use Shopify discounts or a future discount-engine extension.

---

## 10. Accessibility

- Region labelling via `aria-label` / strategy labels
- Checkbox toggles with visually hidden labels
- Variant / quantity labelled controls
- Status + error live regions on add-to-cart
- Drawer uses `role="dialog"`, `aria-modal`, focusable panel, Escape to close
- Keyboard-friendly focus styles on pack toggles
- Reduced-motion path disables GSAP reveals

---

## 11. Performance

- Reuses Recommendations complementary fetch (no second recommendation engine)
- Reuses design systems (button, badge, icon, typography, glass, gradient, shadow, radius, card, price)
- Conditional Wishlist / Compare / Quick View asset loading
- Idempotent `nether-bundles-assets` loader
- Lazy card images after first row
- Deferred JS custom element; motion loads plugins only when needed

---

## 12. Future Extension Points

| Extension | Host attribute / block |
|-----------|------------------------|
| Build your own | `data-nether-bundles-byob-placeholder` |
| Subscriptions | `data-nether-bundles-subscription-placeholder` |
| AI bundles | `data-nether-bundles-ai-placeholder` |
| Dynamic merchandising | `data-nether-bundles-merchandising-placeholder` |
| Inventory validation | `data-nether-bundles-inventory-placeholder` |
| Discount engine | `data-nether-bundles-discount-placeholder` |
| Personalization | `data-nether-bundles-personalization-placeholder` |
| Analytics | `data-nether-bundles-analytics-placeholder` |
| Loyalty | `data-nether-bundles-loyalty-placeholder` |
| JS hooks | `window.NetherBundlesAPI.extend()` / `nether:bundles:*` events |

Quick View retains `data-nether-quick-view-bundles` as a mount host for future compact embeds.

---

## 13. Verification Checklist

- [x] Existing Shopify commerce preserved (`product-form`, cart drawer, recommendations, variants)
- [x] Existing Dawn functionality preserved (no deletes / renames of Dawn roots)
- [x] No duplicate ATC / recommendation / cart engines introduced
- [x] Online Store 2.0 section + blocks schema
- [x] Theme Editor settings for strategy, layout, columns, pricing, savings, summary, responsive, motion
- [x] NetherMotion + reduced motion
- [x] PDP + Cart placeholders fulfilled (extended, not rebuilt)
- [x] Wishlist / Compare / Quick View card reuse
- [x] Showcase integration notes
- [x] Locales (storefront + schema) — `sections.nether_bundles.*` verified in `en.default.json` / `en.default.schema.json`
- [x] Theme Check compatible architecture (full-theme path; partial `--path sections|snippets` reports false MissingTemplate outside scoped roots)
- [x] Implementation report generated

---

**Stop condition:** Premium Bundles & Product Packs Commerce Framework complete. No further unrelated systems modified.
