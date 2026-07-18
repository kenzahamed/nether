# Nether Premium Compare Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Compare (Phase 4 continuation)

---

## 1. Summary

The Nether Premium Compare Commerce Framework is a reusable OS 2.0 product comparison system for luxury Shopify storefronts. It **extends** Dawn product cards, product page blocks, collection grids, header actions, and Shopify cart add APIs without replacing Product Form, Cart, Variants, Checkout, or product URLs.

The framework is **category-agnostic** and composable across fashion, beauty, perfume, furniture, electronics, jewelry, bakery, automotive, lifestyle, home decor, and future industries. Attribute rows are built from native product fields (vendor, type, price, availability, SKU, weight, and product options).

Guest compare UI (toggle, count, drawer, page, attribute table, difference highlighting, move to cart, remove) is production-ready via a pluggable adapter. Customer sync, advanced storage, apps, analytics, sharing, notifications, and recommendations are exposed as **extension points only**.

---

## 2. Framework Architecture

```
Header (global)
  └── nether-compare-trigger           ← count bubble + drawer open
  └── <nether-compare-drawer>          ← overlay dialog (wishlist-drawer pattern)
        ├── toolbar / empty / cards
        ├── compare table (attributes)
        └── move to cart via routes.cart_add_url

Compare page (templates/page.compare.json)
  └── <nether-compare-page>
        ├── header + toolbar
        ├── attribute comparison table (+ optional cards)
        └── sidebar extension blocks

Product surfaces
  ├── Product Page compare block       → nether-compare-button
  ├── Product Showcase cards           → nether-product-actions
  ├── Collection premium cards         → nether-product-actions
  └── Dawn card-product                → optional card__compare slot

Store layer
  └── window.NetherCompare
        ├── guest adapter (baseline persistence)
        ├── max items (default 4)
        ├── events: nether:compare:change|open|close|full
        └── extensions: analytics / share / sync / notify / recommend hooks
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `sections/nether-compare-page.liquid` | Compare page orchestrator + Theme Editor schema |
| `snippets/nether-compare-drawer.liquid` | Drawer shell (header-mounted) |
| `snippets/nether-compare-*.liquid` | Composable commerce modules |
| `assets/component-compare.css` | Scoped `.nether-compare-*` styles + token reuse |
| `assets/component-compare.js` | Store + custom elements + table renderer + Motion hooks |
| Dawn / Shopify roots | Preserved: `product-form`, `cart-drawer`, `/cart/add`, product URLs |

---

## 3. Commerce Modules

| Module | Snippet / Element | Purpose |
|--------|-------------------|---------|
| Compare Button | `nether-compare-button.liquid` / `<nether-compare-button>` | Toggle add/remove + attribute snapshot |
| Compare Counter | `nether-compare-trigger.liquid` count bubble | Live count in header |
| Compare Drawer | `nether-compare-drawer.liquid` / `<nether-compare-drawer>` | Slide-over panel |
| Compare Page | `nether-compare-page.liquid` / `<nether-compare-page>` | Dedicated page layout |
| Compare Table | `nether-compare-table.liquid` | Attribute / specification matrix |
| Compare Toolbar | `nether-compare-toolbar.liquid` | Count, clear, view page, share hook |
| Compare Cards | `nether-compare-card.liquid` | Client template for list items |
| Compare Attributes | `nether-compare-attributes.liquid` | Attributes module note + extension surface |
| Compare Actions | `nether-compare-actions.liquid` | Move to cart / remove |
| Compare Empty | `nether-compare-empty.liquid` | Empty state + login sync note |
| Compare Extensions | `nether-compare-extensions.liquid` | Future sync / share / analytics / recommendations |
| Block dispatcher | `nether-compare-block.liquid` | Page sidebar composition |
| Assets loader | `nether-compare-assets.liquid` | Conditional CSS/JS outside header |

Modules compose with existing Product Card, Button, Badge, Icon, Typography, Glass, Shadow, Radius, Wishlist, Cart, and NetherMotion systems — they do not duplicate product card or cart logic.

---

## 4. Store Architecture

`window.NetherCompare` mirrors `window.NetherWishlist`:

| API | Purpose |
|-----|---------|
| `init()` | Load adapter data |
| `setAdapter(adapter)` | Pluggable persistence (`load` / `save`) |
| `setMaxItems(n)` | Soft commerce limit (2–6; default 4) |
| `extend(partial)` | Register extension hooks |
| `add` / `remove` / `toggle` / `clear` | Item mutations |
| `has` / `count` / `isFull` / `getItems` | Queries |
| `getAttributeRows` / `getAttributeValue` / `isAttributeDifferent` | Table helpers |
| `moveToCart(item)` | Dawn-compatible `/cart/add` + section render |
| `on(callback)` / `emit` / `mergeI18n` | Events + i18n |

**Guest adapter** persists to `localStorage` key `nether:compare:v1`.  
**Customer sync / account sync / API integrations** are extension points only (not implemented).

**Events:** `nether:compare:change`, `nether:compare:open`, `nether:compare:close`, `nether:compare:full`

---

## 5. Files Created

| File | Purpose |
|------|---------|
| `snippets/nether-compare-assets.liquid` | Conditional asset load |
| `snippets/nether-compare-button.liquid` | Reusable toggle + attribute JSON |
| `snippets/nether-compare-trigger.liquid` | Header trigger + count |
| `snippets/nether-compare-drawer.liquid` | Drawer shell |
| `snippets/nether-compare-card.liquid` | Item card template |
| `snippets/nether-compare-actions.liquid` | Move/remove actions |
| `snippets/nether-compare-toolbar.liquid` | Toolbar |
| `snippets/nether-compare-empty.liquid` | Empty state |
| `snippets/nether-compare-header.liquid` | Page header |
| `snippets/nether-compare-table.liquid` | Comparison table shell |
| `snippets/nether-compare-attributes.liquid` | Attributes module |
| `snippets/nether-compare-extensions.liquid` | Future extension points |
| `snippets/nether-compare-block.liquid` | Page block dispatcher |
| `sections/nether-compare-page.liquid` | Page section + schema |
| `templates/page.compare.json` | Compare page template |
| `assets/component-compare.css` | Framework styles |
| `assets/component-compare.js` | Store + UI custom elements |
| `COMPARE_FRAMEWORK_REPORT.md` | This report |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `snippets/nether-header-actions.liquid` | Placeholder → live compare trigger when framework enabled |
| `snippets/nether-product-actions.liquid` | Placeholder → `nether-compare-button` |
| `snippets/nether-product-page-block.liquid` | `compare_placeholder` renders live compare button |
| `snippets/nether-collection-page-block.liquid` | Collection compare module + extensions |
| `snippets/nether-collection-page-grid.liquid` | Passes `show_compare` into Dawn cards |
| `snippets/card-product.liquid` | Optional non-breaking `show_compare` slot |
| `sections/header.liquid` | Compare assets, drawer, schema controls, sticky close coordination |
| `assets/component-header.js` | Auto-hide respects open compare (and wishlist) drawers |
| `sections/nether-product-page.liquid` | Conditional compare assets |
| `sections/nether-collection-page.liquid` | Compare card setting + assets |
| `sections/nether-product.liquid` | Compare assets + card enable setting |
| `assets/nether-motion.js` | Registers `nether-compare-page`, `nether-compare-drawer` |
| `locales/en.default.json` | Compare storefront strings |
| `locales/en.default.schema.json` | Theme Editor labels |

**No existing files were deleted or renamed.**

---

## 7. Merchant Settings

### Header (`nether_compare` group)

| Setting | Control |
|---------|---------|
| Show compare | Visibility of header trigger (existing setting ID preserved) |
| Enable compare framework | Loads drawer + JS/CSS |
| Compare button style | icon / minimal / outlined |
| Compare drawer style | standard / minimal / editorial |
| Compare table style | standard / minimal / editorial |
| Highlight differences | Difference row highlighting |
| Maximum compare items | 2–6 (default 4) |
| Counter visibility | Show count bubble |
| Overlay / glass / width | Drawer chrome |
| Compare page URL | Link to `page.compare` page |
| Empty state copy | Heading, text, CTA |
| Animation style / speed | Drawer motion |
| Desktop / tablet / mobile | Responsive enablement |

### Compare page (`nether-compare-page`)

| Group | Settings |
|-------|----------|
| Framework | Heading, subheading, layout (table/cards/editorial), table style, highlight differences, max items, gap, count |
| Empty | Custom empty copy + CTA |
| Visual | Glass, gradient |
| Motion | Style + speed |
| Responsive | Desktop / tablet / mobile layouts |
| Blocks | Attributes, recently compared, sharing, sync, account, guest, apps, analytics, notifications, recommendations, merchant content |

### Product / Collection integration

| Surface | Setting |
|---------|---------|
| Product Showcase | Show compare on cards / enable compare cards |
| Collection page | Show compare on product cards |
| Product page | `compare_placeholder` block (upgraded to live button) |

---

## 8. Motion Integration

- Uses **NetherMotion only** (`registerSection`, `whenReady`, `prefersReducedMotion`)
- Toggle: icon scale pulse on click
- Drawer: GSAP slide + overlay fade (CSS fallback when reduced motion)
- Cards: fade / rise / stagger entrance
- Table: fade / rise reveal
- Page modules: entrance stagger
- `prefers-reduced-motion: reduce` disables tweens and uses instant open/close

---

## 9. Shopify Integration

| Concern | Approach |
|---------|----------|
| Product Form | Untouched |
| Variants | Stores `variantId` + option attributes from selected/first available |
| Cart | `moveToCart` uses Dawn `fetchConfig` + `routes.cart_add_url` + section rendering |
| Cart drawer | Calls `cart.renderContents` / pub-sub `cartUpdate` |
| Checkout | Untouched |
| Product URLs | Native `product.url` links on cards and table |
| Wishlist | Coexists; separate store and UI slots |
| Quick add | Untouched; compare sits beside existing actions |
| Online Store 2.0 | Section/blocks schema, JSON template, App blocks remaining on commerce sections |

---

## 10. Accessibility

- Drawer: `role="dialog"`, `aria-modal`, labelled title, ESC close, focus trap (`trapFocus` / `removeTrapFocus`)
- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`
- Toggle: `aria-pressed`, live labels for add/remove
- Count: visible number + visually-hidden count sentence
- Table: caption, `scope` on headers, scroll region label, difference rows classed for visual emphasis
- Status: `aria-live="polite"` region for add/remove/full/move feedback
- Controls: minimum 44px hit targets
- Keyboard: Enter/Space on trigger, ESC closes drawer
- Reduced motion respected

---

## 11. Performance

- Reuses NetherWishlist architecture pattern (no second persistence engine invented)
- Reuses Button, Icon, Typography, Shadow, Radius, Glass, Gradient, Product Card systems
- Conditional CSS/JS loading via header enable + `nether-compare-assets`
- Deferred scripts; GSAP loaded on demand through NetherMotion
- Lazy image loading on rendered cards/table media
- Attribute snapshot captured at toggle time (no extra AJAX product fetches)

Theme Check (scoped): compare files introduce **no new errors**. Shared pre-existing schema `ValidJSON` offenses remain elsewhere. Compare card shares the same template `RemoteAsset` warning pattern as wishlist cards (placeholder `src` filled by JS).

---

## 12. Future Extension Points

| Hook / Placeholder | Purpose |
|--------------------|---------|
| `NetherCompare.setAdapter()` | Customer / account / API persistence |
| `NetherCompare.extend({ onAnalytics })` | Analytics events |
| `NetherCompare.extend({ onShare })` | Share compare sets |
| `NetherCompare.extend({ onSync })` | Cross-device sync |
| `NetherCompare.extend({ onNotify })` | Notifications |
| `NetherCompare.extend({ onRecommend })` | Recommendations based on compare set |
| `data-nether-compare-*-placeholder` | Liquid extension modules |
| Page blocks | Recently compared, apps, recommendations, merchant content |
| Quick View / Recommendations surfaces | Architecture ready via button + store reuse |

---

## 13. Verification Checklist

- [x] Existing Shopify commerce preserved (Product Form, Variants, Cart, Checkout, Product URLs)
- [x] Existing Dawn functionality preserved (extend-only integrations)
- [x] No files deleted or renamed
- [x] No duplicate Product Card / Wishlist / Cart systems introduced
- [x] `window.NetherCompare` follows NetherWishlist architecture
- [x] Guest adapter + `setAdapter()` + events + extension hooks
- [x] Compare button, counter, drawer, page, table, toolbar, cards, attributes, actions, empty, extensions
- [x] Attribute + specification comparison with difference highlighting
- [x] Remove product + move to cart
- [x] Integrated with Product Page, Collection Page, Product Cards, Product Showcase, Wishlist coexistence, Cart add API
- [x] Future Quick View / Recommendations hooks only (not implemented)
- [x] NetherMotion only; reduced motion respected
- [x] Theme Editor settings for button, drawer, page layout, table style, highlight, counter, responsive, animation
- [x] ARIA + keyboard + live regions
- [x] Online Store 2.0 JSON template (`page.compare`)
- [x] Theme Check: no new errors on compare files

---

**Stop.** Premium Compare Commerce Framework implementation complete.
