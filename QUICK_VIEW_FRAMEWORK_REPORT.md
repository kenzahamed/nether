# Nether Premium Quick View Commerce Framework — Implementation Report

**Date:** 2026-07-14  
**Framework:** Nether Shopify Framework  
**Phase:** Commerce Framework — Quick View (Phase 4 continuation)

---

## 1. Summary

The Nether Premium Quick View Commerce Framework is a reusable OS 2.0 modal commerce system for luxury Shopify storefronts. It **extends** Dawn’s quick-add fetch pattern and **reuses** the Nether Product Page Commerce Framework by lazy-loading `product-info` from the product URL — without replacing Product Form, Variant Picker, Buy Buttons, Dynamic Checkout, Product Media, Cart, Wishlist, Compare, or Dawn `quick-add-modal`.

The framework is **category-agnostic** and composable across fashion, beauty, perfume, furniture, electronics, jewelry, bakery, automotive, lifestyle, home decor, and future industries.

Architecture for Quick Add / Quick Buy is provided through native Shopify purchase actions inside the modal. Image zoom, recently viewed, personalization, bundles, upsells, recommendations, and analytics are exposed as **extension points only**.

---

## 2. Framework Architecture

```
Header (global enable)
  └── <nether-quick-view> singleton modal
        ├── overlay (backdrop fade, outside click)
        ├── panel (focus trap, ESC, scroll lock)
        │     ├── header + quick actions (wishlist / compare / share / close)
        │     ├── body
        │     │     ├── loading / error states
        │     │     ├── [data-nether-quick-view-content] ← lazy product-info
        │     │     │     └── Nether Product Page + Dawn commerce roots
        │     │     ├── trust / highlights / merchant content
        │     │     └── module composition hooks (media, info, pricing, …)
        │     └── footer (view full details + future extensions)
        └── window.NetherQuickView (events + extension hooks)

Triggers
  ├── Collection Dawn cards          → nether-quick-view-trigger
  ├── Product Showcase overlay       → nether-product-actions
  ├── Predictive search              → nether-search-result-product
  ├── Wishlist / Compare cards       → data-nether-quick-view-open
  └── Future recommendations         → same open contract

Dawn (preserved)
  └── quick-add / quick-add-modal / product-form (unchanged when used)
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `snippets/nether-quick-view-modal.liquid` | Singleton modal shell + Theme Editor data attrs |
| `snippets/nether-quick-view-*.liquid` | Composable commerce chrome modules |
| `assets/component-quick-view.css` | Scoped `.nether-quick-view-*` styles + token reuse |
| `assets/component-quick-view.js` | Store API + custom elements + Dawn-compatible fetch/preprocess |
| Dawn / Product Page | Preserved: `product-info`, `product-form`, `variant-selects`, media gallery, Nether PDP modules |

---

## 3. Commerce Modules

| Module | Snippet / Element | Purpose |
|--------|-------------------|---------|
| Trigger | `nether-quick-view-trigger.liquid` / `<nether-quick-view-trigger>` | Opens modal with `data-product-url` |
| Modal | `nether-quick-view-modal.liquid` / `<nether-quick-view>` | Accessible overlay dialog |
| Header | `nether-quick-view-header.liquid` | Title, close, action cluster |
| Product Media | `nether-quick-view-media.liquid` | Contract hook — gallery from product-info |
| Product Information | `nether-quick-view-info.liquid` | Contract hook — buy box from Product Page |
| Pricing | `nether-quick-view-pricing.liquid` | Contract hook — native `#price-{id}` |
| Variant Selection | `nether-quick-view-variants.liquid` | Contract hook — `variant-selects` |
| Quantity | `nether-quick-view-quantity.liquid` | Contract hook — `quantity-input` |
| Buy Buttons | `nether-quick-view-buy.liquid` | Contract hook — `product-form` / dynamic checkout |
| Wishlist Integration | slot + clone of `nether-wishlist-button` | Reuses Wishlist framework |
| Compare Integration | slot + clone of `nether-compare-button` | Reuses Compare framework |
| Share | `nether-quick-view-share.liquid` | Web Share / clipboard / extension hook |
| Trust Area | `nether-quick-view-trust.liquid` | Merchant trust strip |
| Product Highlights | `nether-quick-view-highlights.liquid` | Optional merchant highlights |
| Quick Actions | `nether-quick-view-actions.liquid` | Action group composer |
| Merchant Content | `nether-quick-view-merchant-content.liquid` | Theme Editor RTE |
| Extensions | `nether-quick-view-extensions.liquid` | Future hooks (hidden) |
| Block / hooks | `nether-quick-view-block.liquid` | Module composition documentation hooks |
| Assets loader | `nether-quick-view-assets.liquid` | Conditional CSS/JS + PDP commerce preload |

Modules compose with Product Page, Wishlist, Compare, Button, Icon, Typography, Glass, Shadow, Radius, and NetherMotion — they do not duplicate PDP Liquid commerce logic.

---

## 4. Files Created

| File | Purpose |
|------|---------|
| `snippets/nether-quick-view-assets.liquid` | Asset + PDP script preload |
| `snippets/nether-quick-view-trigger.liquid` | Reusable open trigger |
| `snippets/nether-quick-view-modal.liquid` | Modal shell |
| `snippets/nether-quick-view-header.liquid` | Modal header |
| `snippets/nether-quick-view-actions.liquid` | Quick actions composer |
| `snippets/nether-quick-view-share.liquid` | Share control |
| `snippets/nether-quick-view-trust.liquid` | Trust area |
| `snippets/nether-quick-view-highlights.liquid` | Highlights chrome |
| `snippets/nether-quick-view-merchant-content.liquid` | Merchant RTE |
| `snippets/nether-quick-view-media.liquid` | Media module hook |
| `snippets/nether-quick-view-info.liquid` | Information module hook |
| `snippets/nether-quick-view-pricing.liquid` | Pricing module hook |
| `snippets/nether-quick-view-variants.liquid` | Variants module hook |
| `snippets/nether-quick-view-quantity.liquid` | Quantity module hook |
| `snippets/nether-quick-view-buy.liquid` | Buy / Quick Buy module hook |
| `snippets/nether-quick-view-block.liquid` | Module dispatcher / contracts |
| `snippets/nether-quick-view-extensions.liquid` | Future extension points |
| `assets/component-quick-view.css` | Framework styles |
| `assets/component-quick-view.js` | Store + UI custom elements |
| `QUICK_VIEW_FRAMEWORK_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|------|--------|
| `sections/header.liquid` | Quick View assets, modal render, schema controls, sticky close coordination |
| `assets/component-header.js` | Auto-hide respects open Quick View |
| `assets/nether-motion.js` | Registers `nether-quick-view` |
| `snippets/card-product.liquid` | Optional non-breaking `show_quick_view` slot |
| `snippets/nether-collection-page-grid.liquid` | Passes `show_quick_view` into Dawn cards |
| `snippets/nether-collection-page-block.liquid` | `quick_view_placeholder` → live collection note + extensions |
| `sections/nether-collection-page.liquid` | Card enable setting + assets |
| `snippets/nether-product-actions.liquid` | Prefers Quick View trigger when enabled |
| `sections/nether-product.liquid` | Assets, card setting, card-product wiring |
| `snippets/nether-wishlist-actions.liquid` | Quick View action on wishlist cards |
| `snippets/nether-compare-actions.liquid` | Quick View action on compare cards |
| `assets/component-wishlist.js` | Wires card Quick View URLs |
| `assets/component-compare.js` | Wires card Quick View URLs |
| `snippets/nether-search-result-product.liquid` | Search Quick View trigger (sibling, valid HTML) |
| `locales/en.default.json` | Storefront strings |
| `locales/en.default.schema.json` | Theme Editor labels |

**No existing files were deleted or renamed.**  
**Dawn `quick-add.js` / `quick-add.css` / `quick-add-modal` remain intact.**  
**Product Page Framework files were not rebuilt.**

---

## 6. Merchant Settings

### Header (`nether_enable_quick_view` group)

| Setting | Control |
|---------|---------|
| Enable quick view framework | Loads modal + commerce assets |
| Modal style | standard / minimal / editorial |
| Modal width | 640–1200px |
| Gallery layout | stacked / media-focus |
| Information layout | standard / compact / editorial |
| Trust area | show + heading + richtext |
| Highlights | show + richtext |
| Quick actions | wishlist / compare / share toggles |
| Merchant content | richtext |
| Overlay / glass | modal chrome |
| Animation style / speed | none / fade / slide + speed |
| Desktop / tablet / mobile | Responsive enablement |

### Collection page / Product showcase

| Setting | Control |
|---------|---------|
| Enable quick view on cards | Shows triggers on surfaces |
| Collection `quick_view_placeholder` block | Merchant note module |

**Enable order:** turn on the framework in **Header**, then enable triggers on Collection / Product Showcase.

Dawn `quick_add` (standard / bulk) remains available independently and is not replaced.

---

## 7. Motion Integration

### NetherMotion registration

```javascript
window.NetherMotion.registerSection(`${sectionId}-quick-view`, {
  type: 'quick-view',
  element: this,
  init: () => { /* motion ready */ },
  destroy: () => { /* kill tweens */ },
});
```

### Supported animations

| Animation | Trigger | Reduced motion |
|-----------|---------|----------------|
| Modal reveal | Open (fade scale or slide) | Instant visible |
| Backdrop fade | Open / close | Instant opacity |
| Product reveal | After lazy load | Static opacity |
| Button / hover | CSS on triggers | Non-motion CSS preserved |

`prefers-reduced-motion: reduce` skips GSAP tweens and uses static open/close.

---

## 8. Shopify Integration

### Preserved contracts

| Contract | Preserved |
|----------|-----------|
| Fetch product URL → extract `product-info` (Dawn quick-add pattern) | ✓ |
| `data-update-url="false"` in modal | ✓ |
| ID remapping (`quickview-{sectionId}`) | ✓ |
| `<product-form>` / buy buttons / dynamic checkout | ✓ |
| `<variant-selects>` / quantity / inventory | ✓ |
| Media gallery + PaymentButton + ProductModel init | ✓ |
| Cart drawer / notification `setActiveElement` on close | ✓ |
| Dawn `quick-add` / `quick-add-modal` when merchant uses them | ✓ |

### Product Page reuse

Lazy-injected HTML is the live Product Page section (`nether-product-page` inside `product-info`). Sticky summary, pickup availability, nested modals, and recommendations are stripped for modal safety — commerce roots remain.

---

## 9. Accessibility

| Feature | Implementation |
|---------|----------------|
| ARIA dialog | `role="dialog"` `aria-modal="true"` `aria-labelledby` |
| Focus trap | Dawn `trapFocus` / `removeTrapFocus` |
| ESC close | Keydown on `ESCAPE` |
| Outside click | Overlay click when overlay enabled |
| Scroll locking | `document.body.overflow-hidden` |
| Trigger semantics | `aria-haspopup="dialog"` + accessible labels |
| Screen reader status | Loading / error regions |
| Reduced motion | GSAP skipped; CSS motion disabled |

---

## 10. Performance

- Singleton modal (not one modal per card)
- Lazy-load product HTML only on open
- Conditional asset loading via header / section flags
- Reuses Product Page, Wishlist, Compare, Button, Icon, Typography, Badge, Glass, Gradient, Shadow, Radius, NetherMotion
- Avoids duplicate Liquid commerce for variants/price/form
- Clears modal content on close to free DOM

---

## 11. Reuse Analysis

| System | Reuse |
|--------|-------|
| Product Page Framework | Full commerce via fetched `product-info` / `nether-product-page` |
| Dawn quick-add | Pattern extended; original files untouched |
| Wishlist / Compare | Header actions + card/actions integration |
| Cart | Native form submit → existing cart drawer/notification |
| Design tokens / Button / Icon / Typography | Modal chrome + triggers |
| Glass / Shadow / Radius | Modal panel modifiers |
| NetherMotion | Modal + content reveal |
| Collection / Product Showcase / Search / Cards | Trigger integration only |

**No duplicate Product Page section or rebuilt variant/buy systems were introduced.**

---

## 12. Future Extension Points

| Hook | Surface |
|------|---------|
| Recently viewed | `data-nether-quick-view-recently-viewed` + `NetherQuickView.extensions.onRecentlyViewed` |
| Personalization | `data-nether-quick-view-personalization` |
| Bundles | `data-nether-quick-view-bundles` |
| Upsells | `data-nether-quick-view-upsells` |
| Recommendations | `data-nether-quick-view-recommendations` |
| Analytics | `NetherQuickView.extensions.onAnalytics` + events |
| Image zoom | `data-nether-quick-view-image-zoom` |
| Custom share | `NetherQuickView.extensions.onShare` |

### Public API / events

| API / Event | Purpose |
|-------------|---------|
| `window.NetherQuickView.open(url\|trigger)` | Programmatic open |
| `window.NetherQuickView.close()` | Programmatic close |
| `window.NetherQuickView.extend(partial)` | Register hooks |
| `nether:quick-view:open \| load \| close \| error` | Lifecycle events |

---

## 13. Verification Checklist

- [x] Product Page Framework reused (lazy `product-info` / `nether-product-page`)
- [x] Existing Shopify product functionality preserved
- [x] Existing Dawn quick-add functionality preserved (not replaced)
- [x] No duplicate Product Page / variant / buy systems
- [x] No files deleted or renamed
- [x] Online Store 2.0 section schema + block placeholders compatible
- [x] Modal: overlay, focus trap, ESC, outside click, scroll lock
- [x] NetherMotion only; reduced motion respected
- [x] Theme Editor controls for enable, width, layouts, trust, actions, responsive, animation
- [x] Integrated with Collection, Product Cards, Product Showcase, Search, Wishlist, Compare
- [x] Extension points for zoom, recently viewed, personalization, bundles, upsells, recommendations, analytics
- [x] Report generated: `QUICK_VIEW_FRAMEWORK_REPORT.md`

---

**Stop condition met:** Premium Quick View Commerce Framework complete.
