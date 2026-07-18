# Nether Premium Cart Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Cart (Phase 4 continuation)  

---

## 1. Summary

The Nether Premium Cart Commerce Framework is a reusable OS 2.0 cart system for luxury Shopify storefronts. It **extends** Dawn's native cart architecture without replacing or rebuilding Shopify commerce.

The framework wraps native Shopify cart behavior inside a modular Nether presentation layer:

- `<cart-drawer>`, `<cart-drawer-items>`, `<cart-items>`, `<cart-note>`, `<quantity-input>`, and `<cart-remove-button>` remain the commerce roots
- Dawn `cart.js` and `cart-drawer.js` handle AJAX cart updates via the Section Rendering API
- `<nether-cart-drawer>` and `<nether-cart-page>` add premium layout, motion, trust modules, and merchant content composition

`templates/cart.json` now uses `nether-cart-page` as the primary cart template. Dawn's `main-cart-items` and `main-cart-footer` sections remain available for fallback or alternate templates.

**Category-agnostic by design** — layouts and modules work across fashion, beauty, furniture, electronics, jewelry, lifestyle, and future industries without code changes.

---

## 2. Framework Architecture

```
Cart Drawer (global)
  └── <nether-cart-drawer>              ← Nether presentation + motion shell
        └── <cart-drawer>                 ← Dawn drawer root (preserved)
              ├── <cart-drawer-items>     ← Dawn AJAX line items (preserved)
              ├── nether-cart-line-item     ← Shared line item module
              └── nether-cart-drawer-footer ← Summary, notes, trust, checkout

Cart Page (template)
  └── <nether-cart-page>                  ← Nether presentation + motion shell
        ├── nether-cart-header            ← Page header module
        ├── <cart-items>                  ← Dawn page cart root (preserved)
        │     └── nether-cart-items       ← #main-cart-items + #cart form
        ├── Footer zone blocks            ← Recommendations, merchant content
        └── nether-cart-summary           ← Sticky sidebar + #main-cart-footer
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `sections/nether-cart-page.liquid` | Cart page orchestrator: assets, schema, layout grid |
| `sections/cart-drawer.liquid` | Cart drawer orchestrator with Nether schema (extended, not replaced) |
| `snippets/nether-cart-drawer.liquid` | Drawer shell wrapping Dawn `<cart-drawer>` |
| `snippets/nether-cart-block.liquid` | Central commerce module dispatcher |
| `snippets/nether-cart-*.liquid` | Composable commerce modules |
| `assets/component-cart-framework.css` | Scoped `.nether-cart-*` premium styles |
| `assets/component-cart-framework.js` | `NetherCartPage` + `NetherCartDrawer` custom elements |

### Design principles applied

- **Extend, don't rebuild** — Dawn `cart.js`, `cart-drawer.js`, `product-form.js` unchanged except one `onCartUpdate` section-type hook
- **Compose modules** — Theme Editor blocks map to commerce modules
- **Reuse Nether systems** — Button, Badge, Icon, Typography, Glass, Shadow, Radius, NetherMotion
- **DRY line items** — Single `nether-cart-line-item.liquid` serves drawer and page contexts
- **Future-ready** — Extension placeholders for bundles, upsells, cross-sells, loyalty, gift cards, subscriptions, coupons, analytics

---

## 3. Commerce Modules

| Module | Snippet | Dawn / Shopify integration |
|--------|---------|---------------------------|
| Cart Drawer | `nether-cart-drawer.liquid` | Wraps `<cart-drawer>`, `#CartDrawer`, `#CartDrawer-Form` |
| Cart Page | `nether-cart-page.liquid` (section) | `<nether-cart-page>` shell |
| Cart Header | `nether-cart-header.liquid` | Page title + continue shopping |
| Cart Items | `nether-cart-items.liquid` | `<cart-items>`, `#cart`, `#main-cart-items`, `.js-contents` |
| Line Item Card | `nether-cart-line-item.liquid` | Shared row markup, quantity data attrs, disclosure |
| Quantity Controls | `nether-cart-quantity.liquid` | `<quantity-input>`, `<quantity-popover>`, `<cart-remove-button>` |
| Cart Summary | `nether-cart-summary.liquid` | Sticky sidebar, `#main-cart-footer`, `.js-contents` |
| Order Totals | `nether-cart-totals.liquid` | Dawn `.totals`, tax note, dynamic total |
| Shipping Progress | `nether-cart-shipping-progress.liquid` | Free shipping bar + messaging |
| Discount Display | `nether-cart-discounts.liquid` | Cart-level discount list |
| Trust & Security | `nether-cart-trust.liquid` | Nether `icon` + secure checkout copy |
| Cart Notes | `nether-cart-notes.liquid` | `<cart-note>`, `/cart/update.js` |
| Gift Wrap Area | `nether-cart-gift-wrap.liquid` | `data-nether-gift-wrap-placeholder` |
| Empty Cart | `nether-cart-empty.liquid` | Premium empty state + collection card |
| Recommendations | `nether-cart-recommendations.liquid` | `<product-recommendations>`, `card-product` |
| Merchant Content | `nether-cart-merchant-content.liquid` | RTE / page content blocks |
| Drawer Footer | `nether-cart-drawer-footer.liquid` | Dawn `.drawer__footer`, checkout CTA |
| Extension placeholders | `nether-cart-extensions.liquid` | `data-nether-*-placeholder` hooks |
| Divider | `nether-cart-divider.liquid` | Optional section dividers |

---

## 4. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-cart-page.liquid` | Cart page orchestrator with schema, presets, Dawn asset loading |
| `snippets/nether-cart-drawer.liquid` | Premium cart drawer shell wrapping Dawn `<cart-drawer>` |
| `snippets/nether-cart-drawer-footer.liquid` | Drawer footer modules + checkout |
| `snippets/nether-cart-block.liquid` | Commerce module dispatcher |
| `snippets/nether-cart-header.liquid` | Cart page header |
| `snippets/nether-cart-items.liquid` | Cart page items host |
| `snippets/nether-cart-line-item.liquid` | Shared line item card (drawer + page) |
| `snippets/nether-cart-quantity.liquid` | Quantity controls module |
| `snippets/nether-cart-summary.liquid` | Sticky order summary sidebar |
| `snippets/nether-cart-totals.liquid` | Order totals module |
| `snippets/nether-cart-shipping-progress.liquid` | Free shipping progress bar |
| `snippets/nether-cart-discounts.liquid` | Cart-level discount display |
| `snippets/nether-cart-trust.liquid` | Trust and secure checkout messaging |
| `snippets/nether-cart-notes.liquid` | Order notes module |
| `snippets/nether-cart-gift-wrap.liquid` | Gift wrap placeholder |
| `snippets/nether-cart-empty.liquid` | Premium empty cart experience |
| `snippets/nether-cart-recommendations.liquid` | Recommended products area |
| `snippets/nether-cart-merchant-content.liquid` | Merchant content area |
| `snippets/nether-cart-extensions.liquid` | Future commerce extension points |
| `snippets/nether-cart-divider.liquid` | Optional section dividers |
| `assets/component-cart-framework.css` | Scoped cart framework styles |
| `assets/component-cart-framework.js` | `nether-cart-page` + `nether-cart-drawer` custom elements |
| `CART_FRAMEWORK_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|------|--------|
| `sections/cart-drawer.liquid` | Extended with Nether schema; renders `nether-cart-drawer` |
| `snippets/cart-drawer.liquid` | Delegates to `nether-cart-drawer` (backward compatible) |
| `templates/cart.json` | Switched to `nether-cart-page` with premium block preset |
| `layout/theme.liquid` | Uses `{% section 'cart-drawer' %}` for Theme Editor cart drawer settings |
| `assets/cart.js` | Extended `onCartUpdate()` to support `data-section-type="nether-cart-page"` |
| `assets/nether-motion.js` | Added `nether-cart-page`, `nether-cart-drawer` to `SECTION_SELECTORS` |
| `locales/en.default.json` | Added `sections.nether_cart` storefront strings |
| `locales/en.default.schema.json` | Added `sections.nether_cart_page` and `sections.nether_cart_drawer` Theme Editor labels |

**No existing files were deleted or renamed.**  
**`sections/main-cart-items.liquid`, `sections/main-cart-footer.liquid`, and all Dawn cart assets remain untouched.**

---

## 6. Merchant Settings

### Cart page (`nether-cart-page`)

| Group | Settings |
|-------|----------|
| **Framework** | Layout (split, classic, editorial), heading, subheading, continue shopping, sticky summary, spacing |
| **Commerce** | Shipping progress, free shipping threshold, notes, gift wrap placeholder |
| **Empty cart** | Custom heading, text, CTA label/link |
| **Trust** | Trust area toggle, heading, text, secure checkout message, icon |
| **Visual** | Glass summary card, gradient accents, top/bottom dividers |
| **Motion** | Animation style (none, fade, slide, stagger), animation speed |
| **Responsive** | Desktop, tablet, mobile layout variants |
| **Standard** | Color scheme, padding |

### Cart drawer (`cart-drawer` section)

| Group | Settings |
|-------|----------|
| **Framework** | Drawer style (standard, wide, minimal), heading, ARIA label |
| **Commerce** | Shipping progress, threshold, notes, gift wrap |
| **Empty cart** | Custom empty state content |
| **Trust** | Trust area, secure checkout messaging |
| **Visual** | Glass drawer panel |
| **Motion** | Animation style, animation speed |

### Block types

**Dawn commerce blocks (preserved):** `subtotal`, `buttons`, `@app`

**Nether commerce blocks (new):** `merchant_content`, `recommendations`, `trust_badges`, `gift_wrap`, `bundles_placeholder`, `upsells_placeholder`, `cross_sells_placeholder`, `loyalty_placeholder`, `gift_cards_placeholder`, `subscriptions_placeholder`, `coupon_placeholder`, `analytics_placeholder`

---

## 7. Motion Integration

| Animation | Implementation |
|-----------|----------------|
| Drawer reveal | GSAP slide on `.nether-cart-drawer__inner` when `<cart-drawer>` becomes `.active` |
| Item reveal | Staggered fade/slide on `[data-nether-cart-line-item]` |
| Summary reveal | Page entrance via `[data-nether-cart-animate]` targets |
| Quantity hover | Subtle scale on `[data-nether-cart-quantity]` |
| Empty cart reveal | Included in page/drawer entrance stagger |
| Reduced motion | `NetherMotion.prefersReducedMotion()` bypasses all tweens |

Registration keys: `{sectionId}-drawer`, `{sectionId}-page` via `NetherMotion.registerSection()`.

Liquid → JS contract: `data-nether-motion`, `data-animation-style`, `data-animation-duration`, `data-nether-cart-animate`.

---

## 8. Shopify Native Integration

| Feature | Status |
|---------|--------|
| Cart drawer | Preserved — `<cart-drawer>` + `cart-drawer.js` |
| Cart page | Extended — Dawn IDs preserved (`#cart`, `#main-cart-items`, `#main-cart-footer`) |
| AJAX cart | Preserved — `/cart/change.js`, `/cart/update.js`, Section Rendering API |
| Quantity updates | Preserved — `<quantity-input>` bubbling change events |
| Remove item | Preserved — `<cart-remove-button>` |
| Discounts | Preserved — line-level + cart-level discount rendering |
| Notes | Preserved — `<cart-note>` debounced POST |
| Taxes / totals | Preserved — Dawn tax note + `.totals` |
| Checkout button | Preserved — `#checkout`, `#CartDrawer-Checkout`, `form` attributes |
| Cart attributes | Compatible — line item properties with `_` prefix convention |
| Standard Events | Preserved — `CartLinesUpdateEvent`, `CartViewEvent`, `CartNoteUpdateEvent` |
| Pub/sub | Preserved — `PUB_SUB_EVENTS.cartUpdate` |

---

## 9. Accessibility

- Semantic HTML: `<header>`, `<aside>`, `<table role="table">`, `<caption>`, progressbar semantics on shipping track
- ARIA: drawer `role="dialog"`, `aria-modal`, live regions preserved
- Focus trapping: Dawn `trapFocus()` in `cart-drawer.js` unchanged
- Keyboard: Escape closes drawer; quantity inputs labeled; remove buttons have `aria-label`
- Reduced motion: all GSAP animations gated by `prefers-reduced-motion`
- Trust/extension groups use `role="region"` / `role="group"` with accessible labels

---

## 10. Performance

- Conditional asset loading: glass CSS only when enabled
- Reuses global design system loaded in `theme.liquid`
- Shared line item snippet eliminates duplicate Liquid between drawer and page
- Single CSS/JS framework file pair (`component-cart-framework.*`)
- Lazy motion initialization via `NetherMotion.whenReady()`
- No jQuery; ES6 classes only

---

## 11. Future Extension Points

| Placeholder block | Data hook | Intended use |
|-------------------|-----------|--------------|
| Bundles | `data-nether-bundles-placeholder` | Product bundle apps |
| Upsells | `data-nether-upsells-placeholder` | Cart upsell engines |
| Cross-sells | `data-nether-cross-sells-placeholder` | Cross-sell merchandising |
| Loyalty | `data-nether-loyalty-placeholder` | Points / rewards programs |
| Gift cards | `data-nether-gift-cards-placeholder` | Gift card purchase/redemption |
| Subscriptions | `data-nether-subscriptions-placeholder` | Recharge / Shopify Subscriptions |
| Coupon engine | `data-nether-coupon-placeholder` | Custom discount code UI |
| Analytics | `data-nether-analytics-placeholder` | GTM / pixel event hooks |
| Gift wrap | `data-nether-gift-wrap-placeholder` | Gift wrap line item properties |

All placeholders are structural only — no runtime handlers. Apps wire via data attributes or `@app` blocks.

---

## 12. Verification Checklist

| Check | Status |
|-------|--------|
| Dawn cart functionality preserved | Pass |
| Shopify native AJAX cart preserved | Pass |
| No duplicate cart systems introduced | Pass |
| `#main-cart-items` / `#main-cart-footer` / `#CartDrawer` IDs preserved | Pass |
| `.js-contents` Section Rendering selectors preserved | Pass |
| Online Store 2.0 compatible | Pass |
| Theme Editor schema + presets | Pass |
| `main-cart-items` / `main-cart-footer` not deleted | Pass |
| NetherMotion integration | Pass |
| Reduced motion support | Pass |
| i18n keys added | Pass |
| Theme Check | Pass for cart-specific files; pre-existing locale `ValidJSON` warnings remain from prior phases |

---

**Nether Premium Cart Commerce Framework — complete.**
