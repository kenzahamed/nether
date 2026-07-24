# Nether Phase 4 Stabilization Report

**Date:** July 14, 2026  
**Scope:** Critical findings from Phase 4 Commerce Architecture Audit only (task C1–C5)  
**Mode:** Targeted stabilization — no redesign, no broad refactor, no new commerce features  
**Status:** Complete

---

## 1. Summary

The Phase 4 Stabilization Pass resolved the five critical commerce issues required before Phase 5. Shared wishlist/compare guest-list logic now lives in `NetherCommerceInteraction` while `window.NetherWishlist` and `window.NetherCompare` public APIs are preserved. Quick View prefers Section Rendering API fetches with Dawn-compatible full-page fallback. Recommendation embeds render through `<nether-recommendations>`. Dead/half-wired Theme Editor settings were implemented or removed from merchant exposure. PDP heading hierarchy and Bundles drawer focus trap are fixed.

**Outcome:** Phase 4 Commerce Framework is stabilized for lock. Architecture impact is minimal.

---

## 2. Critical Issues Resolved

### C1 — Wishlist / Compare Clone Debt (Fixed: Shared base extracted)

**Problem:** Wishlist and Compare duplicated ~75–80% of store, adapter, move-to-cart, count/toolbar sync, card render, and list UI base logic.

**Resolution:** Added `assets/nether-commerce-interaction.js` exposing `window.NetherCommerceInteraction` with:

- Guest adapter factory
- Guest list store factory (`createGuestListStore`)
- Shared helpers (`itemFromButton`, count/toolbar sync, card render, card motion)
- Shared list UI base factory (`createListUIBase`)

`component-wishlist.js` and `component-compare.js` now wrap the shared base. Compare-only table attribute logic remains in Compare. Public APIs unchanged:

- `window.NetherWishlist`
- `window.NetherCompare`

**Asset load order:** Interaction base loads before wishlist/compare in header, page sections, and asset snippets.

| File | Before | After |
|------|--------|-------|
| `component-wishlist.js` | ~942 lines | ~433 lines |
| `component-compare.js` | ~1156 lines | ~681 lines |
| `nether-commerce-interaction.js` | — | ~675 lines (new shared base) |

---

### C2 — Quick View Fetch Optimization (Fixed: Section render first)

**Problem:** Quick View always fetched full product HTML.

**Resolution:** `loadProduct` now calls `fetchProductInfo()` which:

1. Requests `productUrl?section_id=main` (configurable via `data-product-section-id`)
2. Extracts `product-info` from the lighter section payload
3. Falls back to full product URL fetch if section render does not yield `product-info` (Dawn-compatible)

**Preserved:** Lazy asset loading via `nether-quick-view-assets`, preprocessing, modal behavior, trust/chrome stripping.

---

### C3 — Recommendations Embedding (Fixed: Consistent CE path)

**Problem:** Related, complementary, and cart recommendation embeds used Dawn `<product-recommendations>` without wrapping `<nether-recommendations>`, skipping Nether motion/API/`ready`.

**Resolution:** Wrapped embed inner content with `<nether-recommendations>` while keeping Dawn `<product-recommendations>` as the fetch host:

- `snippets/nether-product-page-related.liquid`
- `snippets/nether-product-page-complementary.liquid`
- `snippets/nether-cart-recommendations.liquid`

Shopify Product Recommendations / Search & Discovery compatibility preserved.

---

### C4 — Merchant Settings Hygiene (Fixed: Implement or hide)

| Setting / Block | Action |
|-----------------|--------|
| Delivery estimate (PDP) | **Implemented** — merchant heading/message card now visible (no live ETA API; Shopify shipping remains source of truth) |
| Collection list view | **Implemented** — list toggle enabled; default view applied to host; toolbar pressed state synced |
| Gift wrap settings/block (cart page + drawer) | **Hidden** from Theme Editor until cart-attribute write path exists; Liquid render path preserved for existing blocks |
| Cart chrome placeholders (upsells, cross-sells, loyalty, gift cards, subscriptions, coupon, analytics) | **Hidden** from Theme Editor; Liquid extension dispatch preserved |
| PDP `subscriptions_placeholder` / `personalize_placeholder` | **Hidden** from Theme Editor; Liquid extension path preserved |
| Live `*_placeholder` labels (wishlist / compare / bundles) | **Relabeled** in schema locales to real names (no longer “placeholder”) |

---

### C5 — Accessibility (Fixed)

| Issue | Resolution |
|-------|------------|
| PDP dual headings (`h1` + linked `h2.h1`) | Linked title uses `<span class="h1">` — single document `h1`; QV/Dawn hide/show pattern preserved via existing CSS |
| Bundles drawer focus trap | Uses Dawn `trapFocus` / `removeTrapFocus` on open/close (matches wishlist/compare/QV) |
| Reduced motion | Unchanged — existing `prefersReducedMotion` / NetherMotion paths retained |

---

## 3. Files Modified

| File | Change |
|------|--------|
| `assets/nether-commerce-interaction.js` | **Added** — shared commerce interaction base |
| `assets/component-wishlist.js` | Refactored onto shared base; public API preserved |
| `assets/component-compare.js` | Refactored onto shared base; table logic retained |
| `assets/component-quick-view.js` | Section Rendering API fetch + full-page fallback |
| `assets/component-bundles.js` | Drawer focus trap |
| `assets/component-collection-page.js` | List view apply/sync |
| `assets/component-collection-page.css` | List view single-column for all grids (minimal) |
| `snippets/nether-wishlist-assets.liquid` | Load interaction base |
| `snippets/nether-compare-assets.liquid` | Load interaction base |
| `snippets/nether-quick-view-modal.liquid` | `data-product-section-id="main"` |
| `snippets/nether-product-page-related.liquid` | Wrap with `nether-recommendations` |
| `snippets/nether-product-page-complementary.liquid` | Wrap with `nether-recommendations` |
| `snippets/nether-cart-recommendations.liquid` | Wrap with `nether-recommendations` |
| `snippets/nether-product-page-delivery-estimate.liquid` | Visible merchant delivery messaging |
| `snippets/nether-commerce-estimated-delivery.liquid` | Default visible when requested; comment hygiene |
| `snippets/nether-product-page-block.liquid` | Title heading hierarchy fix |
| `snippets/nether-collection-page-toolbar.liquid` | Enable list toggle |
| `sections/header.liquid` | Load interaction base before wishlist/compare |
| `sections/nether-wishlist-page.liquid` | Load interaction base |
| `sections/nether-compare-page.liquid` | Load interaction base |
| `sections/nether-collection-page.liquid` | Initial `data-view-mode` |
| `sections/nether-product-page.liquid` | Delivery setting copy; hide dead placeholders |
| `sections/nether-cart-page.liquid` | Hide gift wrap + dead placeholder blocks |
| `sections/cart-drawer.liquid` | Hide gift wrap + dead placeholder blocks |
| `locales/en.default.schema.json` | Live block labels (Wishlist/Compare/Bundles/Estimated delivery) |
| `locales/en.default.json` | Collection extension copy (remove stale “coming soon”) |
| `theme-check-phase4-stabilization.json` | Theme Check JSON snapshot |
| `theme-check-phase4-stabilization.txt` | Theme Check summary snapshot |
| `PHASE4_STABILIZATION_REPORT.md` | This report |

**Not modified:** Motion Engine, Design Tokens, framework file deletes/renames, Recommended/Optional audit items (cross-tab sync, AbortController-only hardening as a standalone item, QV asset preload redesign, etc.).

---

## 4. Merchant Settings Cleaned

| Setting / Block | Framework | Action |
|-----------------|-----------|--------|
| `delivery_estimate` | Product Page | Now visible merchant messaging |
| `nether_default_view` / list toggle | Collection Page | List view live |
| `nether_enable_gift_wrap` + gift wrap fields | Cart Page / Drawer | Removed from TE |
| `gift_wrap` block | Cart Page / Drawer | Removed from TE |
| Cart `*_placeholder` chrome blocks | Cart Page / Drawer | Removed from TE (except live Bundles) |
| PDP `subscriptions_placeholder` | Product Page | Removed from TE |
| PDP `personalize_placeholder` | Product Page | Removed from TE |
| Wishlist / Compare / Bundles block names | Schema locales | Relabeled to real feature names |

---

## 5. Accessibility Improvements

- Single PDP product title heading (`h1`); linked Quick View title is non-heading text styled as `.h1`
- Bundles drawer keyboard focus trapped while open; focus returned on close
- Recommendation embeds expose `role="region"` + aria labels via `nether-recommendations`
- Reduced-motion paths for wishlist/compare/bundles unchanged

---

## 6. Theme Check Results

**Command:** `shopify theme check --path . --output json`  
**Snapshots:** `theme-check-phase4-stabilization.json`, `theme-check-phase4-stabilization.txt`

| Metric | Result |
|--------|--------|
| Offense-bearing files | 25 |
| Total offenses | 36 |
| Errors | 7 |
| Warnings | 29 |
| New errors in stabilization files | **0** |

**Pre-existing errors (unchanged, out of scope):**

- 7× `ValidJSON` in `locales/en.default.schema.json` (nested object type mismatches at unrelated lines)

**Stabilization-touched files:** No new Theme Check errors. Pre-existing warning noise elsewhere (orphaned snippets, unused assigns) left untouched.

---

## 7. Regression Verification

| Area | Status | Notes |
|------|--------|-------|
| Wishlist API / drawer / page | Pass | Same storage key, events, CEs |
| Compare API / drawer / page / table | Pass | Max items + attributes intact |
| Quick View open/load/close | Pass | Section fetch with Dawn fallback |
| Recommendations embeds | Pass | Dawn fetch host + Nether CE |
| Bundles ATC + drawer | Pass | Focus trap additive |
| Collection list/grid toggle | Pass | Default view + toggle wired |
| Delivery estimate | Pass | Merchant card visible |
| Theme Editor schemas | Pass | Dead settings removed; live blocks labeled |
| Motion Engine | Pass | Not modified |
| Design Tokens | Pass | Not modified |
| Dawn / OS 2.0 commerce | Pass | Product Recommendations + cart AJAX preserved |

---

## 8. Architecture Impact

**Minimal.**

- One additive shared module (`NetherCommerceInteraction`) consumed by existing Wishlist/Compare
- No framework merges, renames, or deletions
- No Motion Engine or Design Token changes
- No new merchant-facing commerce features beyond wiring what schemas already advertised
- Future-ready gift wrap / chrome placeholder Liquid paths preserved offline from Theme Editor

---

## 9. Final Recommendation

### **Phase 4 Ready for Lock**

All requested critical fixes (C1–C5) are complete. Public Wishlist/Compare APIs are preserved. Theme Check shows no new errors from this pass. Remaining audit items are Recommended/Optional (cross-tab sync, deeper CSS twin consolidation, QV asset deferral further, AbortController hardening) and are Phase 5-adjacent — not lock blockers.

**Stop here.** Do not begin Phase 5 Motion Library work in this pass.
