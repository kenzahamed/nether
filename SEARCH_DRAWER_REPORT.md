# Nether Premium Search Drawer Framework Report

## 1. Summary

Built the **Nether Premium Search Drawer & Predictive Search Framework** as an extension of Dawn's existing search architecture. The system preserves Dawn's `header-search.liquid` modal, `predictive-search.js`, `search-form.js`, and `sections/predictive-search.liquid` while adding a reusable premium search drawer that integrates with the Nether Header Framework and Header Behavior System.

Merchants opt in via **Enable search drawer** in the header section. When disabled, Dawn search modal and placeholder behavior remain unchanged.

## 2. Files Created

| File | Purpose |
|------|---------|
| `assets/component-search-drawer.js` | `nether-search-drawer`, `nether-predictive-search`, `nether-search-form` custom elements |
| `assets/component-search-drawer.css` | Premium drawer layout, results, overlay, responsive, motion-aware styles |
| `snippets/nether-search-drawer.liquid` | Search drawer markup — input, results shell, footer, empty state |
| `snippets/nether-search-trigger.liquid` | Header search trigger button with Icon System integration |
| `snippets/nether-search-result-product.liquid` | Reusable product result card |
| `snippets/nether-search-result-collection.liquid` | Reusable collection result card |
| `snippets/nether-search-result-article.liquid` | Reusable article result card |
| `snippets/nether-search-result-page.liquid` | Reusable page result card |
| `snippets/nether-search-result-query.liquid` | Reusable query suggestion card |
| `sections/nether-predictive-search.liquid` | Premium predictive search section for drawer API rendering |
| `SEARCH_DRAWER_REPORT.md` | This report |

## 3. Files Modified

| File | Changes |
|------|---------|
| `sections/header.liquid` | Search drawer settings schema, conditional assets, drawer render, StickyHeader search drawer guard |
| `snippets/nether-header-actions.liquid` | Search drawer trigger integration with Dawn modal / placeholder fallback |
| `assets/component-header.js` | Search drawer `isOpen` guard for scroll behavior, overlay close on auto-hide |
| `locales/en.default.json` | Search drawer storefront strings |
| `locales/en.default.schema.json` | Theme Editor labels for search drawer settings |

## 4. Features Implemented

### Search Drawer

- Premium slide-in drawer from the right
- Open / close via header trigger and close button
- ESC key support
- Configurable overlay with click-to-close
- Focus trap via Dawn `trapFocus` / `removeTrapFocus`
- Body scroll lock (`overflow-hidden`)
- Search input with Dawn `.field` / `.search__input` patterns
- Clear search button (Dawn reset button pattern)
- Loading state (reuses `loading-spinner` snippet)
- Empty state before query entry
- Search results container with scrollable shell
- Search footer with view-all link (merchant-toggleable)

### Predictive Search

- Extends Dawn `PredictiveSearch` as `nether-predictive-search`
- Shopify Predictive Search API via `routes.predictive_search_url`
- Renders `sections/nether-predictive-search.liquid` for premium result cards
- Supports products, collections, pages, articles, and query suggestions
- Resource type filtering via API `resources[type]` params
- Maximum results via `resources[limit]`
- Loading, no results, and live region announcements preserved from Dawn
- Debounced input via inherited `SearchForm` (300ms)

### Search Results

Reusable result card snippets for:

- Product (thumbnail, vendor, price)
- Collection
- Article
- Page
- Search query suggestion

### Header Integration

- Integrates with Nether Header Framework action row
- Respects header announcement offset (`--nether-header-announcement-offset`)
- Respects header height tokens (`--header-height`)
- Pauses header scroll behavior when drawer is open
- Closes drawer on header auto-hide (`nether:header:state`)
- Closes drawer from Dawn `StickyHeader.closeSearchModal()`
- Dispatches `nether:search:open` / `nether:search:close` framework events
- `data-prevent-hide` on trigger for header interaction parity

## 5. Merchant Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `nether_enable_search_drawer` | checkbox | `false` | Enable premium search drawer (preserves Dawn modal when off) |
| `nether_search_predictive` | checkbox | `true` | Enable predictive search in drawer |
| `nether_search_placeholder_text` | text | `""` | Custom search input placeholder |
| `nether_search_max_results` | range (2–10) | `4` | Maximum predictive results per resource type |
| `nether_search_enable_collections` | checkbox | `true` | Include collections in predictive search |
| `nether_search_enable_articles` | checkbox | `true` | Include articles in predictive search |
| `nether_search_enable_pages` | checkbox | `true` | Include pages in predictive search |
| `nether_search_show_footer` | checkbox | `true` | Show search footer |
| `nether_search_enable_overlay` | checkbox | `true` | Enable backdrop overlay |
| `nether_search_drawer_width` | range (320–640px) | `480` | Drawer panel width |
| `nether_search_animation_speed` | select | `default` | Fast (0.15s) / Default (0.3s) / Slow (0.5s) |
| `nether_search_desktop` | checkbox | `true` | Enable drawer on desktop |
| `nether_search_mobile` | checkbox | `true` | Enable drawer on mobile |

## 6. Motion Integration

- GSAP loaded exclusively via `NetherMotion.load([])` — no manual GSAP script tags
- Drawer panel slide-in/out with `power3.out` / `power3.in` easing
- Overlay fade with `power2` easing
- Results appearance animation (`opacity` + `y`) on new predictive results
- `data-nether-motion-ready` defers CSS transitions when GSAP is active
- `NetherMotion.registerSection()` lifecycle hook for Theme Editor reload
- `prefers-reduced-motion`: instant open/close, no GSAP tweens

## 7. Accessibility Improvements

- `role="dialog"`, `aria-modal="true"`, and translated `aria-label` on drawer panel
- Trigger uses `aria-haspopup="dialog"`, `aria-controls`, and `aria-expanded`
- ESC key closes drawer
- Focus trap on open; focus restored to trigger on close
- Predictive search combobox ARIA preserved from Dawn (`aria-owns`, `aria-controls`, `aria-activedescendant`)
- Live region status announcements for loading and result counts
- Empty and no-results states use `role="status"`
- Screen reader labels via Icon System and translated strings
- Reduced motion respected for all drawer animations

## 8. Performance Improvements

- **Lazy initialization** — drawer JS only loads when `nether_enable_search_drawer` is enabled
- **Conditional predictive assets** — predictive CSS/JS loaded when drawer predictive is active
- **Debounced search** — inherited 300ms debounce from Dawn `SearchForm`
- **Result caching** — inherited predictive search cache per query key
- **AbortController** — inherited fetch abort on rapid input changes
- **Minimal listeners** — bound on connect, removed on disconnect
- **Breakpoint gating** — drawer open blocked outside enabled desktop/mobile breakpoints
- **No duplicated Dawn logic** — extends `PredictiveSearch` and `SearchForm` classes directly

## 9. Framework Integration

| Nether System | Integration |
|---------------|-------------|
| Header Framework | Trigger in `nether-header-actions`, drawer rendered from `header.liquid` |
| Header Behavior | Scroll pause, auto-hide overlay close, announcement offset sync |
| Icon System | Search trigger and close icons via `snippets/icon.liquid` |
| Design Tokens | `--shadow-level-md`, `--radius-sm`, `--duration-default`, color scheme channels |
| Dawn Search | Extends `predictive-search.js`, `search-form.js`; Dawn modal preserved when drawer disabled |
| Dawn Form/Field | Reuses `.field`, `.field__input`, `.search__input`, reset/submit buttons |
| Price System | Product results use `snippets/price.liquid` |
| Nether Motion Engine | Drawer and results animations via `NetherMotion.load()` |
| Announcement System | Drawer top offset syncs with `--nether-header-announcement-offset` |

## 10. Verification Checklist

- [x] Existing Header Framework preserved — no rebuild of header architecture
- [x] Existing Header Behavior preserved — extended with `searchDrawer.isOpen` guard
- [x] Existing Dawn Search preserved — `header-search.liquid` and `predictive-search.js` unchanged
- [x] Existing Motion Engine reused — `NetherMotion.load()` only
- [x] No duplicated CSS — drawer styles scoped to `component-search-drawer.css`; Dawn search input styles reused
- [x] No duplicated Liquid — Dawn `header-search.liquid` and `predictive-search.liquid` unchanged
- [x] No duplicated JavaScript — extends Dawn classes; no fork of predictive-search.js
- [x] Theme Check compatible — no new offenses introduced
- [x] Online Store 2.0 compatible — section settings in `header.liquid` schema
- [x] Responsive — desktop panel width, full-width mobile, breakpoint-specific trigger visibility
- [x] Theme Editor compatible — `NetherMotion.registerSection()` destroy/init hooks
