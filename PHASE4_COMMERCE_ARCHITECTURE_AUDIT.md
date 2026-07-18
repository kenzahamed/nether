# Nether Phase 4 Commerce Architecture Audit

**Audit date:** July 14, 2026  
**Scope:** All completed Phase 4 Commerce Frameworks + shared Phase 1–3 systems where relevant  
**Mode:** Read-only inspection — no framework code changes were made  
**Auditor:** Automated architecture review of `c:\Shopify\nether-main`  
**Output file:** `PHASE4_COMMERCE_ARCHITECTURE_AUDIT.md` (this report only)

---

## Executive Summary

Nether Phase 4 delivers a **complete, production-oriented commerce stack** built on the same extend-Dawn philosophy established in Phases 1–3. Nine frameworks share a coherent compositional pattern: **section orchestrator → custom element → block dispatcher → reusable snippets**, with Dawn commerce primitives (`product-info`, `product-form`, `cart-drawer`, `facets`, `product-recommendations`) preserved rather than replaced.

The **shared Commerce Enhancements layer** (`nether-commerce-*`) is the Phase 4 architectural win — trust, inventory, shipping progress, payment methods, and related modules are thin-wrapped by Product Page, Cart, Quick View, and Footer instead of being rebuilt per surface.

Primary risks before Phase 5 are **wishlist↔compare clone debt (~75–80%)**, **Quick View asset weight + full-page fetch cost**, **recommendations embeds that skip the Nether CE**, **orphan event listeners / incomplete NetherMotion unregister**, and **merchant-facing Theme Editor settings that are structural or half-wired**. None of these require a ground-up rewrite. Phase 5 (Motion Library, micro-interactions, polish) can begin after a short critical-cleanup pass.

**Phase 4 footprint (approximate):**

| Asset type | Count | Notes |
|------------|------:|-------|
| Commerce section orchestrators | 10 | Product, Collection (+ banner), Cart page, Cart drawer, Wishlist, Compare, Recommendations, Bundles, Commerce |
| `nether-*` commerce snippets | ~144 | Across 9 framework prefixes |
| Framework CSS files | 9 | ~2,839 lines |
| Framework JS files | 9 + motion | ~4,188 lines (excl. Dawn hosts) |
| Guest stores | 2 | `nether:wishlist:v1`, `nether:compare:v1` |
| Window APIs | 6 | Wishlist, Compare, QuickView, BundlesAPI, RecommendationsAPI, CommerceAPI |

---

## 1. Overall Architecture Score

### **7.7 / 10**

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| Composition & hierarchy | 8.5 | Clear section → CE → dispatcher → snippet everywhere |
| Code reuse | 6.5 | Strong commerce layer; weak wishlist/compare & chrome twins |
| Extension points | 8.5 | Adapters, `extend()` hooks, placeholders, `@app` blocks |
| Scalability | 7.5 | Patterns scale; twin debt will compound without extraction |
| Maintainability | 7.0 | Large sections, parallel JS/CSS, stale CSS after Liquid moves |
| Merchant experience | 7.0 | Rich schemas; placeholder / half-wired settings create confusion |
| Production readiness | 8.0 | Dawn-compatible, a11y dialogs, reduced motion, conditional assets |

---

## 2. Commerce Architecture Score

### **7.8 / 10**

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| Surface coverage | 9.0 | PDP, PLP, Cart, Wishlist, Compare, QV, Recs, Bundles, Enhancements |
| Shared commerce layer | 8.5 | `nether-commerce-*` correctly centralizes trust/inventory/shipping UX |
| Store & persistence | 7.5 | Clean adapter pattern; no cross-tab sync; wishlist unbounded |
| Event consistency | 8.0 | Strong `nether:*` dialect; QV/commerce variances |
| Dawn integration | 9.0 | Extend-not-replace is disciplined and upgrade-friendly |
| Unification maturity | 6.5 | Recs embeds asymmetric; wishlist/compare not shared-base |

---

## 3. Strengths

### Architectural foundations

1. **Extend Dawn, don't replace** — Product Page wraps `product-info` / gallery / buy-buttons; Cart preserves Dawn drawer + Section Rendering; Collection reuses `facets` and `#product-grid`; Recommendations and Bundles reuse `<product-recommendations>`. Shopify ecosystem upgrades remain low-friction.

2. **Shared Commerce Enhancements layer** — 25 `nether-commerce-*` snippets + `component-commerce.{css,js}` give Product, Cart, Quick View, Footer, and buy-buttons a single presentation API for trust, stock, shipping progress, payment icons, notices, and meters.

3. **Thin surface adapters** — Wrappers such as `nether-product-page-trust`, `nether-cart-shipping-progress`, and `nether-quick-view-trust` correctly pass Theme Editor settings into shared modules while keeping surface BEM and `shopify_attributes`.

4. **Guest store + adapter pattern** — `NetherWishlist` / `NetherCompare` expose `setAdapter({ load, save })` and `extend({ onAnalytics, onShare, onSync, … })`, enabling future customer-account sync without rewriting UI CEs.

5. **Consistent custom-event dialect** — `nether:wishlist:*`, `nether:compare:*`, `nether:quick-view:*`, `nether:bundles:*`, `nether:recommendations:*`, plus `nether:header:state` coordination for sticky header / drawer close.

6. **Shared cart line item** — `nether-cart-line-item.liquid` is consumed by cart page and drawer — strongest Liquid DRY win in Phase 4 page frameworks.

7. **Cart framework base class** — `NetherCartFrameworkBase` shared by `nether-cart-page` and `nether-cart-drawer` is the only cross-CE inheritance pattern in commerce JS (a model for Phase 5 consolidation).

8. **Quick View reuses real PDP markup** — Fetches product HTML, extracts `product-info`, remaps IDs, strips unsuitable modules — avoids rebuilding a second buy box.

9. **Bundles mount the orchestrator CE on embeds** — PDP/cart use `nether-bundles-embedded` → `<nether-bundles>`, so motion, selection, and ATC events work on host surfaces (contrast: recommendations embeds).

10. **Phase 1 design system integration** — Button, Badge, Icon, Typography, Card Premium, Shadow, Radius, Glass, Gradient load consistently; commerce meters and badges compose these primitives.

11. **NetherMotion registration** — Every commerce CE can register with the central engine; reduced-motion paths exist on drawers, QV, recs, bundles, and commerce reveal.

12. **Documentation culture** — Per-framework `*_FRAMEWORK_REPORT.md` / `COMMERCE_ENHANCEMENTS_REPORT.md` files track delivery; this audit closes Phase 4.

---

## 4. Weaknesses

### Critical functional / merchant-facing gaps

| Issue | Location | Impact |
|-------|----------|--------|
| Delivery estimate always hidden | `nether-product-page-delivery-estimate` + `nether-commerce-estimated-delivery` | Merchants can add blocks that never show |
| Collection list view offered but disabled | Schema `list` + toolbar button `disabled` / `list_future` | Misleading Theme Editor + UI affordance |
| Placeholder block picker noise | Many `*_placeholder` types across PDP/PLP/cart | Some are live (wishlist/compare/bundles), names outdated |
| Gift wrap is chrome only | `nether-cart-gift-wrap` | No cart attribute / line property writes |
| PDP title duplicate headings | Product title dispatcher emits `<h1>` + linked `<h2 class="h1">` | Accessibility / SEO heading hierarchy risk |

### Architectural debt

| Issue | Location | Impact |
|-------|----------|--------|
| Wishlist ↔ Compare ~75–80% clone | `component-wishlist.js` (818) ≈ `component-compare.js` (1007); CSS twins | Bugfixes and Phase 5 motion must be applied twice |
| Recommendations embeds skip CE | `nether-product-page-related`, `-complementary`, `nether-cart-recommendations` | No `NetherRecommendations` motion/API/`ready` on host surfaces |
| Chrome snippet duplication | `*-header`, `*-empty`, `*-extensions`, `*-merchant-content`, `*-assets`, `*-divider` across frameworks | File sprawl; same Phase 3 pattern carried forward |
| Stale PDP trust CSS | `component-product-page.css` still styles `__trust-*` while Liquid renders `.nether-commerce__trust-*` | Dead CSS / visual drift risk |
| No shared CE base for commerce | Most frameworks reimplement motion/TE reload | ~30–40% JS boilerplate duplication |
| NetherMotion registry key mismatch | Suffixed keys (`${sectionId}-product-page`) vs TE section IDs | Central TE unload often misses; relies on per-framework handlers |

### Consistency drift

| Issue | Detail |
|-------|--------|
| Asset naming | Cart uses `component-cart-framework.*` while others use `component-{domain}(-page).*` |
| Setting ID legacy | Phase 3 `nether_show_*_placeholder` coexists with `nether_enable_*` |
| Event bubbling | Wishlist/compare/bundles bubble; Quick View `emit` does not |
| Commerce API shape | Hook-only (`NetherCommerceAPI`) vs emit/extend bus (recs/bundles) |
| Motion unregister | Cart, wishlist, compare, commerce unregister; product/collection often do not |
| FBT ownership | Bundles implements FBT/CTL live; Recommendations lists FBT as extension-only — merchant naming confusion |

### Minor issues

- No `storage` / BroadcastChannel sync → multi-tab guest wishlist/compare can diverge.
- Wishlist has no max-items cap (compare defaults to 4).
- Collection / wishlist / search recommendation hosts remain placeholders.
- Bundles drawer has Escape + scroll lock but **no focus trap** (unlike wishlist/compare/QV).
- Orphan hover listeners on collection product cards and cart quantity controls.
- Recommendations carousel `keydown` may not unbind on disconnect.
- DesignMode listeners added with `.bind(this)` in wishlist/compare drawers cannot be removed by reference.
- Hardcoded English schema label (`"Icon"`) on cart promotional notice.
- Zero `AbortController` usage; Quick View relies on `loadToken` only.

---

## 5. Reuse Analysis

### Tier A — Strong reuse (working as intended)

| Abstraction | Consumers | Quality |
|-------------|-----------|---------|
| `nether-commerce-*` primitives | PDP, Cart, QV, Footer, buy-buttons | Excellent |
| `snippets/button`, `badge`, `icon`, `card` | All Phase 4 surfaces | Excellent |
| `nether-cart-line-item.liquid` | Cart page + drawer | Excellent |
| Dawn `<product-recommendations>` | Recs standalone, embeds, Bundles FBT/CTL | Excellent |
| `NetherCartFrameworkBase` | Cart page + drawer CEs | Excellent pattern |
| Design tokens / glass / shadow / radius | Conditional across frameworks | Excellent |
| `PUB_SUB_EVENTS.cartUpdate` / `variantChange` | Cart, PDP sticky, wishlist/compare move-to-cart | Excellent Dawn bridge |
| Header `nether:header:state` | Wishlist, compare, QV close coordination | Excellent |

### Tier B — Partial reuse (consolidation opportunity)

| Pattern | Current state | Consolidation target |
|---------|---------------|----------------------|
| Wishlist ↔ Compare store + UI | Near clones | Shared `nether-guest-list` module + attribute plugin |
| Recs ↔ Bundles chrome | Header/empty/extensions/merchant/assets isomorphic | Shared `nether-commerce-section-chrome` |
| Merchant-content / divider / extensions | Triplicated across PDP/PLP/cart (+ others) | Shared partials with `framework` / BEM prefix param |
| Motion TE reload boilerplate | Reimplemented per CE | `NetherFramework` / `NetherMotionHost` base |
| Drawer focus/open/close | Wishlist, compare, QV (~50% shared) | Shared drawer host CE or mixin |
| Surface asset loaders | Parallel `*-assets.liquid` | Shared loader with dependency list |

### Tier C — Intentional non-reuse (keep separate)

| Systems | Why separate |
|---------|--------------|
| Recommendations vs Bundles | Discovery grid vs multi-item ATC + pricing presentation |
| Commerce Enhancements vs Product Page | Shared presentation vs page orchestration |
| Quick View vs Product Page | Modal fetch/preprocess vs full template ownership |
| Shipping progress vs delivery info | Cart threshold meter vs PDP info card — different jobs |

---

## 6. Liquid Review

### Snippet footprint by prefix

| Prefix | Snippet count | Role |
|--------|-------------:|------|
| `nether-commerce` | 25 | Shared enhancements layer |
| `nether-product-page` | 20 | PDP modules + thin commerce wrappers |
| `nether-cart` | 20 | Cart page/drawer modules |
| `nether-quick-view` | 17 | Modal chrome + contract hooks |
| `nether-bundles` | 14 | Strategy + embedded host |
| `nether-collection-page` | 13 | PLP zones |
| `nether-compare` | 13 | Guest compare UI |
| `nether-wishlist` | 11 | Guest wishlist UI |
| `nether-recommendations` | 11 | Discovery grids |

### Section orchestrator sizes (lines)

| Section | Lines | Notes |
|---------|------:|-------|
| `nether-product-page.liquid` | 1,206 | Largest; schema-dominant |
| `nether-bundles.liquid` | 858 | Strategy-heavy |
| `nether-recommendations.liquid` | 813 | Strategy + layouts |
| `nether-collection-page.liquid` | 780 | Grid + filters |
| `nether-commerce.liquid` | 642 | Optional composition host |
| `nether-cart-page.liquid` | 588 | Cleanest page schema among giants |
| `nether-compare-page.liquid` | 427 | |
| `nether-wishlist-page.liquid` | 380 | |
| `nether-collection-page-banner.liquid` | 378 | Sibling of collection page |
| `cart-drawer.liquid` | 286 | Dawn shell + Nether drawer |

### Naming & composition

- **Consistent:** `nether-{framework}__*` BEM, `data-nether-{framework}-*` hooks, block dispatchers.
- **Outdated names:** `wishlist_placeholder` / `compare_placeholder` / `bundles_placeholder` blocks often render **live** modules — Phase 3 names survived after Phase 4 wiring.
- **Quick View contract hooks:** `nether-quick-view-media|info|pricing|…` exist as hidden documentation hooks; live commerce comes from fetched `product-info` — intentional, not dead Liquid bugs.
- **Merchant customization:** Strong — rich block libraries, glass/gradient toggles, trust copy, empty states, strategy pickers on recs/bundles.

### Liquid grade: **B+**

---

## 7. CSS Review

### Framework CSS sizes (~lines)

| File | Lines | Tokens |
|------|------:|--------|
| `component-compare.css` | 500 | `--nether-compare-*` |
| `component-wishlist.css` | 404 | `--nether-wishlist-*` |
| `component-bundles.css` | 389 | `--nether-bundles-*` |
| `component-quick-view.css` | 331 | `--nether-quick-view-*` |
| `component-commerce.css` | 327 | `--nether-commerce-*` |
| `component-collection-page.css` | 280 | `--nether-collection-page-*` |
| `component-product-page.css` | 252 | `--nether-product-page-*` |
| `component-recommendations.css` | 203 | `--nether-recommendations-*` |
| `component-cart-framework.css` | 153 | `--nether-cart-*` |

### Findings

- **Design token usage is good** — scoped `--nether-*` with fallbacks to Dawn/`--radius-*`/`--shadow-*`/`--glass-*`.
- **Glass / gradient / shadow reuse** — Product, Collection, Cart, Recs, Bundles gate glass/gradient via settings; commerce uses shared card/meter patterns.
- **Duplication** — Wishlist and Compare CSS are near twins (drawer panel, count bubble, empty state, toolbar). Shared gap/transition defaults (`2.4rem`, `0.5s`) repeat across product/collection/cart/recs/bundles.
- **Radius source inconsistency** — Some files prefer `--nether-radius-*`, others `--radius-*`.
- **Stale selectors** — Product-page trust item styles likely ineffective after commerce Liquid migration.
- **Performance** — CSS volumes are moderate; larger cost is **multiple stylesheet tags** (design system + framework + commerce assets often loaded together, sometimes twice via commerce-assets).

### CSS grade: **B**

---

## 8. JavaScript Review

### Framework JS sizes (~lines)

| File | Lines | Primary CEs |
|------|------:|-------------|
| `component-compare.js` | 1,007 | button, drawer, page + store |
| `component-wishlist.js` | 818 | button, drawer, page + store |
| `component-quick-view.js` | 577 | trigger, modal |
| `component-bundles.js` | 473 | bundles (+ stub drawer) |
| `component-product-page.js` | 239 | product-page |
| `component-collection-page.js` | 239 | collection-page |
| `component-cart-framework.js` | 220 | cart-page, cart-drawer |
| `component-recommendations.js` | 220 | recommendations |
| `component-commerce.js` | 195 | commerce, commerce-meter |
| `nether-motion.js` | 206 | Shared engine |

### Findings

- **Modern ES6, no jQuery** — Custom elements, modules-style IIFEs, `fetch`, async adapters.
- **Largest duplication cluster** — Wishlist/Compare store normalization, guest adapter, move-to-cart, UIBase drawer/page (~75–80%).
- **Second cluster** — Recs ↔ Bundles motion/hover/API/extensions (~55–65%).
- **Third cluster** — Product ↔ Collection motion + TE reload (~45–55%).
- **Overall duplication estimate:** ~40–45% of Phase 4 commerce JS is structural boilerplate.
- **Custom elements:** 17 tags registered; only Cart and Wishlist/Compare internal UIBases share inheritance. No cross-framework `NetherCommerceElement` base.
- **Lazy loading:** Conditional `*-assets` snippets; GSAP via NetherMotion on demand; QV unfortunately preloads a large PDP stack whenever enabled.
- **Memory:** Mixed — strong observer/store unsubscribe in many CEs; hover leaks on collection/cart; missing AbortControllers; TE `.bind(this)` leaks in wishlist/compare drawers.

### JavaScript grade: **B**

---

## 9. Store & Adapter Review

### Persisted stores

| API | Storage key | Max | Adapter | Sync |
|-----|-------------|-----|---------|------|
| `window.NetherWishlist` | `nether:wishlist:v1` | None | Guest localStorage; `setAdapter` | Same-tab only |
| `window.NetherCompare` | `nether:compare:v1` | Default 4 (`setMaxItems`) | Same | Same-tab only |

**Item identity:** `productId` + `variantId` required. Compare adds `type` + `attributes[]` snapshot at toggle time (good — no refetch).

### Non-persisted window APIs

| API | Role |
|-----|------|
| `NetherQuickView` | Open/close/load/error bus; no list store |
| `NetherBundlesAPI` | `extend` + `emit` → `nether:bundles:*` |
| `NetherRecommendationsAPI` | `extend` + `emit` → `nether:recommendations:*` |
| `NetherCommerceAPI` | Versioned hooks + `setProgress` (no CustomEvent bus) |

### Adapter quality

- **Strength:** Clear `load`/`save` contract enables account sync / CRM later without UI rewrite.
- **Strength:** Extension hooks (`onAnalytics`, `onSync`, `onNotify`, `onRecommend`) are Phase 5–ready attachment points.
- **Gap:** No cross-tab `storage` listener or BroadcastChannel.
- **Gap:** Wishlist unbounded growth risk for long-lived guest sessions.
- **Gap:** Customer sync remains Liquid/extension placeholder only (intentional for Phase 4).

### Store & adapter grade: **B+**

---

## 10. Event Architecture Review

### Custom event inventory

| Event | Emitter | Purpose |
|-------|---------|---------|
| `nether:wishlist:change` / `open` / `close` | Wishlist store / drawer | UI sync + external open |
| `nether:compare:change` / `open` / `close` / `full` | Compare store / button | UI sync + capacity |
| `nether:quick-view:open` / `load` / `close` / `error` | Quick View API | Lifecycle + analytics |
| `nether:bundles:ready` / `selection:change` / `bundle:added` / `bundle:error` / `drawer:*` | Bundles API | Selection + ATC |
| `nether:recommendations:ready` | Recommendations API | Lifecycle |
| `nether:motion:ready` | NetherMotion | DesignMode |
| `nether:header:state` | Header | Close drawers when header hides |

### Dawn bridges (intentional)

- `PUB_SUB_EVENTS.cartUpdate`, `PUB_SUB_EVENTS.variantChange`
- `shopify:section:load` / `:unload` / `:reorder`
- `product-info:loaded` (Quick View)

### Consistency assessment

- Naming is **largely excellent** (`nether:<domain>:<action>`).
- **Dual path** on compare full: document event + change payload `action: 'full'`.
- **Bubbling inconsistency** on Quick View emits.
- Product / Collection / Cart page CEs emit **no** commerce custom events (rely on Dawn pub/sub) — acceptable hybrid, but asymmetrically silent vs wishlist/QV.
- Commerce Enhancements lack a document event bus — extensions must use hook registry only.

### Event architecture grade: **B+**

---

## 11. Theme Editor Review

### Strengths

- Rich grouping across frameworks (Framework / Commerce / Visual / Motion / Responsive / Padding).
- Dedicated sections for Recommendations, Bundles, Commerce composition, Wishlist page, Compare page, Cart page, Product page, Collection (+ banner).
- Presets exist on major sections (PDP strongest; Collection grid preset weakest — single `collection_info`).
- Conditional asset loading gated by header `nether_enable_*` flags and surface toggles.

### Weaknesses

| Issue | Severity |
|-------|----------|
| Dual settings: `nether_show_*_placeholder` vs `nether_enable_*` | Merchant confusion |
| Placeholder block types still marketed after going live | Naming debt |
| Delivery estimate / gift wrap / some collection extension blocks structural only | Dead affordances |
| List view setting + disabled control | Half-wired UX |
| Enable-order coupling (header flags before surface toggles) | Easy misconfiguration |
| Hardcoded English label on cart notice icon setting | i18n debt |
| Collection recommendations_placeholder is a note, not a live grid | Expectation mismatch |

### Theme Editor grade: **B-**

---

## 12. Accessibility Review

### Strengths

- Wishlist / Compare / Quick View dialogs: `role="dialog"`, `aria-modal`, labelled titles, Escape, Dawn `trapFocus` / `removeTrapFocus`, body scroll lock.
- Live regions: wishlist/compare status, QV loading (`status`) / error (`alert`), ATC status on bundles, inventory/price `role="status"` on PDP.
- Commerce meters expose real `role="progressbar"` via `<nether-commerce-meter>`.
- Recommendations toolbar `role="toolbar"`; carousel arrow-key support in CE.
- Reduced motion respected across drawers, QV, recs, bundles, commerce reveal (via NetherMotion and/or `matchMedia`).

### Weaknesses

| Issue | Impact |
|-------|--------|
| PDP dual headings (`h1` + `h2.h1`) | Hierarchy / SR noise |
| Bundles drawer lacks focus trap | Keyboard users can tab behind drawer |
| Orphan hover listeners (not a11y, but focus styling/motion intertwined) | Cleanup debt |
| QV wishlist/compare via clone may miss CE upgrade/`connectedCallback` | Pressed state / labels can stale |
| Duplicate collection product counts (Dawn + Nether live regions) | Redundant announcements |
| Inconsistent reduced-motion helper (NetherMotion vs raw matchMedia) | Drift risk |

### Accessibility grade: **B+**

---

## 13. Performance Review

### Strengths

- Conditional framework CSS/JS via asset snippets and header flags.
- Idempotent asset snippets (browser cache tolerates multi-render).
- Dawn lazy Section Rendering for recommendations; IntersectionObserver patterns.
- Quick View clears content on close; compare attributes snapshotted (no refetch).
- GSAP loaded on demand through NetherMotion.
- Cart CSS is lean (153 lines); shared line-item avoids duplicate markup.

### Bottlenecks & risks

| Risk | Evidence |
|------|----------|
| Quick View global preload | `nether-quick-view-assets` pulls PDP + commerce + media scripts whenever QV enabled |
| Full product HTML fetch on each QV open | Bandwidth/CPU; mitigated only by `loadToken` cancel |
| Design-system CSS loaded twice | Section + `nether-commerce-assets` overlap on PDP/cart |
| Collection MutationObserver + GSAP re-animate on facet AJAX | Intentional but heavier than CSS-only |
| Wishlist/Compare JS payload | ~1.8k combined lines for near-twin logic |
| Large schema-heavy sections | PDP 1,206 lines — editor/parse cost, not storefront runtime |

### Performance grade: **B**

---

## 14. Motion Readiness

### Current integration

| Framework | Registers with NetherMotion | Unregisters | Reduced motion |
|-----------|----------------------------:|------------:|----------------|
| Product Page | Yes (`-product-page`) | Often no | Yes |
| Collection Page | Yes (banner/grid keys) | Often no | Yes |
| Cart | Yes | Yes | Yes |
| Wishlist | Yes | Yes | Yes |
| Compare | Yes | Yes | Yes |
| Quick View | Yes | Partial | Yes |
| Recommendations | Yes (standalone CE) | Via CE | Yes |
| Bundles | Yes | Via CE | Yes |
| Commerce | Yes (+ standalone bootstrap) | Yes | Yes |

### Phase 5 implications

- **Ready:** Central engine, section registration API, plugin registry (ScrollTrigger/Flip/Observer), `prefersReducedMotion`, declarative FX path from earlier phases.
- **Not ready without care:** Suffixed registry keys vs Shopify section IDs will fight a global Motion Library if TE lifecycle is assumed central.
- **Extension points exist** for hover micro-interactions (recs/bundles/commerce already tear down hover pairs — collection/cart should match that pattern before expanding hover library).
- **Recommendations embeds** will miss Motion Library upgrades until they mount `<nether-recommendations>` or a shared motion host.
- **Wishlist/Compare twin** will double Phase 5 animation work unless extracted first.

### Motion readiness grade: **B+** (ready with registry/lifecycle hygiene)

---

## 15. File Organization Review

### Strengths

- Predictable prefixes: `nether-{framework}-*.liquid`, `component-{framework}.{css,js}`.
- Clear split: sections = orchestration/schema; snippets = modules; assets = behavior/style.
- Shared commerce folder pattern is discoverable (`nether-commerce-*`).
- Report artifacts document each delivery.

### Weaknesses

| Issue | Detail |
|-------|--------|
| Naming outlier | `component-cart-framework.*` vs `*-page` convention |
| Report/theme-check clutter at repo root | Many `*_REPORT.md` / `theme-check-*.txt` — fine for private framework, noisy for onboarding |
| Extension snippet proliferation | One `*-extensions.liquid` per framework with near-identical hidden hosts |
| Phase 3 placeholder setting IDs retained | Intentional compatibility vs long-term clarity tradeoff |

### File organization grade: **A-**

---

## 16. Phase 5 Readiness

Assessment of whether Phase 4 architecture supports upcoming Phase 5 work.

| Phase 5 stream | Readiness | Existing hooks | Gaps |
|----------------|-----------|----------------|------|
| **Motion Library** | Ready with caveats | `NetherMotion`, CE `registerSection`, SECTION_SELECTORS | Registry key mismatch; incomplete unregister |
| **Premium Animations** | Ready | GSAP lazy load, ScrollTrigger usage on several CEs | Dual application cost on wishlist/compare clones |
| **Micro Interactions** | Partial | Hover pairs on recs/bundles/commerce | Collection/cart leaky hover; no shared hover API |
| **Hover Library** | Partial | Per-framework ad-hoc | Need shared host + cleanup contract |
| **Scroll Experiences** | Ready | ScrollTrigger plugin registry | Ensure embeds (recs) participate |
| **Performance Optimization** | Needs attention | Conditional assets | QV preload/fetch, duplicate CSS tags, twin JS |
| **Accessibility Polish** | Ready after Critical fixes | Dialogs, traps, live regions, reduced motion | Dual headings, bundles focus trap, live region duplicates |
| **Documentation** | Ready | Per-framework reports + this audit | Need master ARCHITECTURE index optional |

### Architectural improvements recommended before Phase 5

1. **Critical merchant/a11y cleanup** (delivery estimate visibility, list-view honesty, dual headings, bundles focus trap) — small and blocking only for quality, not for starting Motion Library scaffolding.
2. **Highly recommended:** Extract shared wishlist/compare store/UI base **before** heavy motion work — otherwise every premium animation is implemented twice.
3. **Highly recommended:** Fix NetherMotion unregister consistency and document registration key convention for the Motion Library.
4. **Recommended (can parallel Phase 5):** Align recommendations embeds with orchestrator CE; prune stale trust CSS; unify chrome snippets.

Phase 5 does **not** require a commerce rewrite. It requires **hygiene + selective extraction**.

---

## 17. Recommended Improvements

### Critical (address before or at Phase 5 start)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| C1 | Implement or remove delivery estimate blocks (stop advertising always-`hidden` UI) | Merchant-facing dead setting |
| C2 | Align collection list-view setting with reality (enable, or remove from schema/UI) | Misleading Theme Editor + disabled control |
| C3 | Fix PDP title heading duplication (`h1` + `h2.h1`) | Accessibility / SEO risk |
| C4 | Add focus trap to bundles drawer (match wishlist/compare/QV) | Keyboard accessibility gap |
| C5 | Rename or relabel live `*_placeholder` blocks in Theme Editor to reflect real behavior | Merchant trust / clarity |

### Recommended (stabilize early Phase 5 / parallel)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| R1 | Extract shared guest-list module for Wishlist + Compare (store + UIBase + drawer chrome) | Eliminates ~75–80% twin debt before Motion Library |
| R2 | Introduce lightweight `NetherMotionHost` / framework CE base (register/unregister, TE reload, reduced motion) | Cuts ~30–40% boilerplate; Phase 5 motion consistency |
| R3 | Mount `<nether-recommendations>` (or shared body) on PDP/cart embeds | Motion/API/`ready` parity with standalone |
| R4 | Unify recs/bundles chrome snippets (header/empty/extensions/merchant/assets) | File sprawl reduction |
| R5 | Shared merchant-content / divider / extensions partials across page frameworks | Carries Phase 3 debt into Phase 4 |
| R6 | Remove or rewrite stale `.nether-product-page__trust-*` CSS after commerce migration | Dead CSS / visual drift |
| R7 | Add cross-tab sync (`storage` or BroadcastChannel) for wishlist/compare | Multi-tab correctness |
| R8 | Cap wishlist max items or document unbounded growth | Storage/UX risk |
| R9 | Unbind hover listeners on collection cards and cart quantity (match recs/bundles pattern) | Memory hygiene |
| R10 | Normalize Quick View `emit` bubbling + reduce QV asset preload to on-demand | Event consistency + performance |
| R11 | Align `NetherCommerceAPI` with emit/extend bus used by recs/bundles | Extension DX consistency |
| R12 | Document FBT ownership (Bundles ATC vs Recommendations discovery) in merchant-facing copy | Strategy naming confusion |
| R13 | Fix Theme Editor `.bind(this)` listener leaks on wishlist/compare drawers | Memory / TE reload hygiene |
| R14 | Collapse dual `nether_show_*_placeholder` / `nether_enable_*` settings over time | Merchant UX simplification |

### Optional (defer without blocking Phase 5)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| O1 | Rename `component-cart-framework.*` toward naming parity | Consistency only |
| O2 | Implement gift-wrap cart attributes or remove block | Completeness |
| O3 | Live recommendations embeds for collection / wishlist / search | Product decision |
| O4 | AbortController for Quick View / cart fetches | Hardening |
| O5 | Shared CSS custom properties sheet for commerce gap/transition defaults | Minor DRY |
| O6 | Radius token source unification (`--nether-radius-*` vs `--radius-*`) | Design system purity |
| O7 | Master `ARCHITECTURE.md` index linking Phase 1–4 reports | Onboarding |
| O8 | CI Theme Check gate | Automation |
| O9 | i18n for hardcoded cart schema `"Icon"` label | Localization polish |
| O10 | Split oversized PDP schema into includes if Shopify tooling allows later | Maintainability |

---

## 18. Final Verdict

### **Ready after minor improvements**

Nether Phase 4 has achieved a **coherent, reusable, production-grade commerce architecture**. The extend-Dawn discipline, shared Commerce Enhancements layer, guest stores with adapters, `nether:*` event dialect, and consistent custom-element boundaries are suitable for long-term client reuse.

Phase 5 (Motion Library, premium animations, micro-interactions, hover/scroll experiences, performance + a11y polish, documentation) **can begin** after a short critical pass:

1. **Week 0 critical hygiene** — Address C1–C5 (dead/half-wired Theme Editor affordances, PDP headings, bundles focus trap, placeholder labeling). Small, targeted, no architecture rewrite.

2. **Phase 5 kickoff** — Start Motion Library scaffolding on the existing `NetherMotion` engine and CE registration sites.

3. **Early Phase 5 parallel extraction** — Prioritize R1 (wishlist/compare shared module) and R2 (motion host base) before investing heavily in premium animations that would otherwise be duplicated.

The framework does **not** need stabilization of the Phase 3 “broken showcase settings” kind as a hard gate — Phase 4 commerce is largely live and wired. The residual issues are **duplication debt**, **merchant schema honesty**, and **lifecycle/performance hygiene**. Those are normal at the end of a rapid commerce expansion and are straightforward to address incrementally without blocking Phase 5.

**Do not unify** Recommendations + Bundles, or fold Commerce Enhancements back into Product Page. Prefer **shared bases and chrome**, not monolithic merges.

---

## Appendix A: Framework Inventory

| Framework | Primary section(s) | Snippets (~) | CSS lines | JS lines | Window API |
|-----------|--------------------|-------------:|----------:|---------:|------------|
| Product Page | `nether-product-page` | 20 | 252 | 239 | — |
| Collection Page | `nether-collection-page` + banner | 13 | 280 | 239 | — |
| Cart | `nether-cart-page` + `cart-drawer` | 20 | 153 | 220 | — |
| Wishlist | `nether-wishlist-page` + header drawer | 11 | 404 | 818 | `NetherWishlist` |
| Compare | `nether-compare-page` + header drawer | 13 | 500 | 1,007 | `NetherCompare` |
| Quick View | Header modal (snippet host) | 17 | 331 | 577 | `NetherQuickView` |
| Recommendations | `nether-recommendations` | 11 | 203 | 220 | `NetherRecommendationsAPI` |
| Bundles | `nether-bundles` | 14 | 389 | 473 | `NetherBundlesAPI` |
| Commerce Enhancements | `nether-commerce` (optional) | 25 | 327 | 195 | `NetherCommerceAPI` |

## Appendix B: Custom Element Registry (Phase 4 Commerce)

| Tag | Inheritance |
|-----|-------------|
| `nether-product-page` | `HTMLElement` |
| `nether-collection-page` | `HTMLElement` |
| `nether-cart-page` / `nether-cart-drawer` | `NetherCartFrameworkBase` |
| `nether-wishlist-button` / `drawer` / `page` | Button → HTMLElement; Drawer/Page → `NetherWishlistUIBase` |
| `nether-compare-button` / `drawer` / `page` | Parallel to wishlist |
| `nether-quick-view` / `nether-quick-view-trigger` | `HTMLElement` |
| `nether-recommendations` | `HTMLElement` |
| `nether-bundles` / `nether-bundles-drawer` | `HTMLElement` (drawer stub) |
| `nether-commerce` / `nether-commerce-meter` | `HTMLElement` |

## Appendix C: Should Commerce Systems Unify Further?

| Proposal | Verdict |
|----------|---------|
| Merge Wishlist + Compare into one framework | **No merge** — **Yes extract shared guest-list base** |
| Merge Recommendations + Bundles | **No** — different jobs; keep complementary API sharing |
| Fold Commerce Enhancements into PDP | **No** — shared layer is correct |
| Force all recs embeds through Nether CE | **Yes** — consistency, not a framework merge |
| Single mega commerce JS bundle | **No** — keep conditional loaders; extract shared primitives instead |

## Appendix D: Existing Phase 4 Documentation

| Report | Path |
|--------|------|
| Product Page | `PRODUCT_PAGE_FRAMEWORK_REPORT.md` |
| Collection Page | `COLLECTION_PAGE_FRAMEWORK_REPORT.md` |
| Cart | `CART_FRAMEWORK_REPORT.md` |
| Wishlist | `WISHLIST_FRAMEWORK_REPORT.md` |
| Compare | `COMPARE_FRAMEWORK_REPORT.md` |
| Quick View | `QUICK_VIEW_FRAMEWORK_REPORT.md` |
| Recommendations | `RECOMMENDATIONS_FRAMEWORK_REPORT.md` |
| Bundles | `BUNDLES_FRAMEWORK_REPORT.md` |
| Commerce Enhancements | `COMMERCE_ENHANCEMENTS_REPORT.md` |
| Phase 3 Architecture Audit | `PHASE3_ARCHITECTURE_AUDIT.md` |
| This audit | `PHASE4_COMMERCE_ARCHITECTURE_AUDIT.md` |

---

*End of Phase 4 Commerce Architecture Audit. No framework code was modified. Only this audit report was created.*
