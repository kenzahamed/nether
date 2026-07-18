# Nether Premium Wishlist Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Wishlist (Phase 4 continuation)

---

## 1. Summary

The Nether Premium Wishlist Commerce Framework is a reusable OS 2.0 wishlist system for luxury Shopify storefronts. It **extends** Dawn product cards, product page blocks, collection grids, header actions, and Shopify cart add APIs without replacing Product Form, Cart, Variants, Checkout, or product URLs.

The framework is **category-agnostic** and composable across fashion, beauty, perfume, furniture, electronics, jewelry, bakery, automotive, lifestyle, home decor, and future industries.

Guest wishlist UI (toggle, count, drawer, page, move to cart, remove) is production-ready via a pluggable adapter. Customer sync, advanced storage, apps, analytics, sharing, and notifications are exposed as **extension points only**.

---

## 2. Framework Architecture

```
Header (global)
  └── nether-wishlist-trigger          ← count bubble + drawer open
  └── <nether-wishlist-drawer>         ← overlay dialog (search-drawer pattern)
        ├── toolbar / empty / list
        └── wishlist cards → move to cart via routes.cart_add_url

Wishlist page (templates/page.wishlist.json)
  └── <nether-wishlist-page>
        ├── header + toolbar
        ├── client-rendered list
        └── sidebar extension blocks

Product surfaces
  ├── Product Page wishlist block      → nether-wishlist-button
  ├── Product Showcase cards           → nether-product-actions
  ├── Collection premium cards         → nether-product-actions
  └── Dawn card-product                → optional card__wishlist slot

Store layer
  └── window.NetherWishlist
        ├── guest adapter (baseline persistence for UI features)
        ├── events: nether:wishlist:change|open|close
        └── extensions: analytics / share / sync / notify hooks
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `sections/nether-wishlist-page.liquid` | Wishlist page orchestrator + Theme Editor schema |
| `snippets/nether-wishlist-drawer.liquid` | Drawer shell (header-mounted, search-drawer pattern) |
| `snippets/nether-wishlist-*.liquid` | Composable commerce modules |
| `assets/component-wishlist.css` | Scoped `.nether-wishlist-*` styles + token reuse |
| `assets/component-wishlist.js` | Store + custom elements + Motion hooks |
| Dawn / Shopify roots | Preserved: `product-form`, `cart-drawer`, `/cart/add`, product URLs |

---

## 3. Commerce Modules

| Module | Snippet / Element | Purpose |
|--------|-------------------|---------|
| Wishlist Button | `nether-wishlist-button.liquid` / `<nether-wishlist-button>` | Toggle add/remove |
| Wishlist Trigger | `nether-wishlist-trigger.liquid` | Header open + count |
| Wishlist Drawer | `nether-wishlist-drawer.liquid` / `<nether-wishlist-drawer>` | Slide-over panel |
| Wishlist Page | `nether-wishlist-page.liquid` / `<nether-wishlist-page>` | Dedicated page layout |
| Wishlist Card | `nether-wishlist-card.liquid` | Client template for list items |
| Wishlist Empty | `nether-wishlist-empty.liquid` | Empty state + login sync note |
| Wishlist Toolbar | `nether-wishlist-toolbar.liquid` | Count, clear, view page, share hook |
| Wishlist Actions | `nether-wishlist-actions.liquid` | Move to cart / remove |
| Wishlist Sharing | `nether-wishlist-extensions.liquid` | Future sharing placeholder |
| Wishlist Sync | `nether-wishlist-extensions.liquid` | Future sync / account / apps / analytics / notifications / recently |
| Block dispatcher | `nether-wishlist-block.liquid` | Page sidebar composition |
| Assets loader | `nether-wishlist-assets.liquid` | Conditional CSS/JS outside header |

Modules compose with existing Product Card, Button, Badge, Icon, Typography, Glass, Shadow, Radius, and NetherMotion systems — they do not duplicate product card or cart logic.

---

## 4. Files Created

| File | Purpose |
|------|---------|
| `snippets/nether-wishlist-button.liquid` | Reusable toggle |
| `snippets/nether-wishlist-trigger.liquid` | Header trigger + count |
| `snippets/nether-wishlist-drawer.liquid` | Drawer shell |
| `snippets/nether-wishlist-card.liquid` | Item card template |
| `snippets/nether-wishlist-empty.liquid` | Empty state |
| `snippets/nether-wishlist-toolbar.liquid` | Toolbar |
| `snippets/nether-wishlist-actions.liquid` | Move/remove actions |
| `snippets/nether-wishlist-extensions.liquid` | Future extension points |
| `snippets/nether-wishlist-block.liquid` | Page block dispatcher |
| `snippets/nether-wishlist-header.liquid` | Page header |
| `snippets/nether-wishlist-assets.liquid` | Conditional asset load |
| `sections/nether-wishlist-page.liquid` | Page section + schema |
| `templates/page.wishlist.json` | Wishlist page template |
| `assets/component-wishlist.css` | Framework styles |
| `assets/component-wishlist.js` | Store + UI custom elements |
| `WISHLIST_FRAMEWORK_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|------|--------|
| `snippets/nether-header-actions.liquid` | Upgrades wishlist placeholder → real trigger when framework enabled |
| `snippets/nether-product-actions.liquid` | Placeholder → `nether-wishlist-button` |
| `snippets/nether-product-page-block.liquid` | `wishlist_placeholder` renders live wishlist button |
| `snippets/nether-collection-page-block.liquid` | Collection wishlist module + extensions |
| `snippets/nether-collection-page-grid.liquid` | Passes `show_wishlist` into Dawn cards |
| `snippets/card-product.liquid` | Optional non-breaking `show_wishlist` slot |
| `sections/header.liquid` | Wishlist assets, drawer render, schema controls, sticky close coordination |
| `sections/nether-product-page.liquid` | Conditional wishlist assets |
| `sections/nether-collection-page.liquid` | Wishlist card setting + assets |
| `sections/nether-product.liquid` | Wishlist assets + setting info |
| `assets/nether-motion.js` | Registers `nether-wishlist-page`, `nether-wishlist-drawer` |
| `locales/en.default.json` | Wishlist storefront strings |
| `locales/en.default.schema.json` | Theme Editor labels |

**No existing files were deleted or renamed.**

---

## 6. Merchant Settings

### Header (`nether_enable_wishlist` group)

| Setting | Control |
|---------|---------|
| Show wishlist | Visibility of header trigger (existing setting ID preserved) |
| Enable wishlist framework | Loads drawer + JS/CSS |
| Wishlist button style | icon / minimal / outlined |
| Wishlist drawer style | standard / minimal / editorial |
| Counter visibility | Show count bubble |
| Overlay / glass / width | Drawer chrome |
| Wishlist page URL | Link to `page.wishlist` page |
| Empty state copy | Heading, text, CTA |
| Animation style / speed | Drawer motion |
| Desktop / tablet / mobile | Responsive enablement |

### Wishlist page (`nether-wishlist-page`)

| Group | Settings |
|-------|----------|
| Framework | Heading, subheading, layout (grid/list/editorial), gap, count |
| Empty | Custom empty copy + CTA |
| Visual | Glass, gradient |
| Motion | Style + speed |
| Responsive | Desktop / tablet / mobile layouts |
| Blocks | Recently, sharing, sync, account, guest, apps, analytics, notifications, merchant content |

### Product / Collection integration

| Surface | Setting |
|---------|---------|
| Product Showcase | Show wishlist on cards |
| Collection page | Show wishlist on product cards |
| Product page | `wishlist_placeholder` block (upgraded to live button) |

---

## 7. Motion Integration

- Uses **NetherMotion only** (`registerSection`, `whenReady`, `prefersReducedMotion`)
- Toggle: heart scale pulse on click
- Drawer: GSAP slide + overlay fade (CSS fallback when reduced motion)
- Cards: fade / rise / stagger entrance
- Page modules: entrance stagger
- `prefers-reduced-motion: reduce` disables tweens and uses instant open/close

---

## 8. Shopify Integration

| Concern | Approach |
|---------|----------|
| Product Form | Untouched |
| Variants | Stores `variantId` from selected/first available; PDP can target selected variant via dataset |
| Cart | `moveToCart` uses Dawn `fetchConfig` + `routes.cart_add_url` + section rendering |
| Cart drawer | Calls `cart.renderContents` / pub-sub `cartUpdate` |
| Checkout | Untouched |
| Product URLs | Native `product.url` links on cards |
| Quick add | Untouched; wishlist sits beside existing actions |
| Online Store 2.0 | Section/blocks schema, JSON template, App blocks remaining on commerce sections |

---

## 9. Accessibility

- Drawer: `role="dialog"`, `aria-modal`, labelled title, ESC close, focus trap (`trapFocus` / `removeTrapFocus`)
- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`
- Toggle: `aria-pressed`, live labels for add/remove
- Count: visible number + visually-hidden count sentence
- Status: `aria-live="polite"` region for add/remove/move feedback
- Controls: minimum 44px hit targets
- Keyboard: Enter/Space on trigger, ESC closes drawer
- Reduced motion respected

---

## 10. Performance

- Reuses Phase 1 systems (button, icon, badge, typography, glass, shadow, radius)
- Reuses product card surfaces — no duplicate card markup system
- Lazy Motion: GSAP only through NetherMotion
- Assets load only when wishlist is enabled (header) or when a section/block requests them
- List cards render from `<template>` — no Liquid loop over opaque client state
- JS custom elements initialize once; store singleton on `window.NetherWishlist`

---

## 11. Future Extension Points

| Hook | Attribute / API | Status |
|------|-----------------|--------|
| Sharing | `data-nether-wishlist-share-placeholder`, `NetherWishlist.extensions.onShare` | Placeholder |
| Synchronization | `data-nether-wishlist-sync-placeholder`, `extensions.onSync` | Placeholder |
| Customer / account storage | `data-nether-wishlist-account-placeholder` + `setAdapter()` | Placeholder |
| Guest / alternate storage | Baseline guest adapter + `setAdapter()` for replacements | Baseline + extension |
| App integrations | `data-nether-wishlist-app-placeholder` | Placeholder |
| Analytics | `extensions.onAnalytics` | Hook ready |
| Notifications | `data-nether-wishlist-notifications-placeholder`, `extensions.onNotify` | Placeholder |
| Recently wishlisted | `data-nether-wishlist-recently-placeholder` | Placeholder |
| Quick View / Recommendations | Button snippet reusable at future mounts | Ready to compose |
| Cart commerce | Already publishes `PUB_SUB_EVENTS.cartUpdate` | Integrated |

**Not implemented (by design):** multi-device customer sync engines, app backends, share links, push notifications.

---

## 12. Verification Checklist

| Check | Status |
|-------|--------|
| Existing Shopify Product Form preserved | Pass |
| Existing Dawn cart / quick-add / card-product preserved | Pass (optional wishlist slot only) |
| No deleted/renamed files | Pass |
| No duplicate product card / cart / button / motion systems | Pass |
| Header placeholder upgrade is backward compatible | Pass (`nether_show_wishlist_placeholder` ID kept) |
| Theme Editor schemas parse as JSON | Pass |
| Locale JSON valid | Pass |
| Online Store 2.0 section + JSON template | Pass |
| NetherMotion selectors registered | Pass |
| Accessibility (ARIA, keyboard, reduced motion) | Implemented |
| Responsive drawer/page settings | Implemented |
| Category-agnostic modules | Pass |

### Merchant enablement

1. Header → enable **Show wishlist** + **Enable wishlist framework**
2. Optional: create a page with template **page.wishlist** and assign **Wishlist page** URL
3. Collection page → **Show wishlist on product cards**
4. Product Showcase → **Show wishlist on cards**
5. Product page → add **Wishlist** block

---

**Stop condition met:** Premium Wishlist Commerce Framework complete. No further systems in this change set.
