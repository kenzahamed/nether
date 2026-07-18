# Nether Framework — Dependency Map

**Audit phase:** Framework Architecture Audit (read-only)  
**Date:** 2026-07-18  
**Companion docs:** `FRAMEWORK_ARCHITECTURE.md`, `FRAMEWORK_SETTINGS_MAP.md`, `FRAMEWORK_SHARED_SYSTEMS.md`

---

## How to read this document

For each framework:

- **Location** — primary section / assets
- **Implements** — files that define behavior
- **Consumed by** — sections / snippets that depend on it
- **CSS dependents** — stylesheets involved
- **JS dependents** — scripts involved
- **Centralized?** — single implementation vs duplicated

---

## A. Global / shared systems

### A1. Design tokens & color system

| | |
|--|--|
| **Location** | `layout/theme.liquid` (`{% style %}`), `config/settings_schema.json` |
| **Implements** | CSS variables: `--color-*`, `--font-*`, `--page-width`, card/media/button/input tokens |
| **Consumed by** | All sections; all design-system CSS |
| **CSS** | `base.css` + every `component-*.css` referencing tokens |
| **JS** | None directly |
| **Centralized?** | Yes |

### A2. Typography system

| | |
|--|--|
| **Location** | `assets/component-typography.css` (global) |
| **Implements** | `--type-*` tokens; `.type-display-*`, `.type-h*`, `.type-body`, `.type-caption`, `.type-overline`, etc. |
| **Consumed by** | All Nether presentation sections; block headings use Dawn size classes (`h0`–`h5`) + type utilities |
| **CSS dependents** | Framework CSS composing typography classes |
| **JS** | None |
| **Centralized?** | Yes (CSS). Heading **element** choice is per-section Liquid (duplicated). |

### A3. Button system

| | |
|--|--|
| **Location** | `assets/component-button.css` (global + re-linked by sections) |
| **Implements** | Premium button variants on Dawn `.button` |
| **Consumed by** | Hero/Banner/Content/CTA/Newsletter/FAQ/Testimonials/Collection/Product/Commerce pages |
| **Snippets** | Block `buttons` cases; card CTAs; form submits |
| **JS** | Section motion may animate `.button` nodes |
| **Centralized?** | CSS yes; markup patterns duplicated in block dispatchers |

### A4. Glass effects

| | |
|--|--|
| **Location** | `assets/component-glass.css` (global; also conditionally re-linked) |
| **Implements** | `.glass-surface`, category utilities (`glass-card-*`, `glass-hero-*`, …) |
| **Consumed by** | Sections with `nether_enable_glass` / `nether_*_enable_glass`; cards add `--glass` modifiers |
| **Snippets** | Shells (`nether-*-content`, `nether-*-shell`), cards |
| **CSS** | Framework CSS modifiers (`--glass-enabled`) + glass utilities |
| **JS** | None for effect itself |
| **Centralized?** | CSS yes; **Liquid enable + style `case` duplicated** per section/snippet |

### A5. Gradient system

| | |
|--|--|
| **Location** | `assets/component-gradient.css` |
| **Implements** | `.grad-*` utilities; overlay recipes |
| **Consumed by** | Hero family overlays; card/panel gradient flags |
| **Snippets** | Overlay class builders in sections/shells |
| **Centralized?** | CSS yes; overlay `case section.settings.nether_*_gradient_style` duplicated |

### A6. Card system (Dawn + Premium)

| | |
|--|--|
| **Location** | `assets/component-card.css`, `assets/component-card-premium.css`, `snippets/card*.liquid` |
| **Implements** | Dawn card structure; premium editorial/glass/gradient card styles |
| **Consumed by** | Product/Collection/Media showcases; collection page; recommendations; hero card layouts |
| **Centralized?** | Partial — Dawn cards centralized; showcase cards are **framework-specific** |

### A7. Shadow & radius

| | |
|--|--|
| **Location** | `component-shadow.css`, `component-radius.css` |
| **Consumed by** | Cards, panels, headers, drawers |
| **Centralized?** | Yes |

### A8. Badge & icon systems

| | |
|--|--|
| **Location** | `component-badge.css`, `component-icon.css`, `snippets/icon.liquid`, `icon-*.liquid` |
| **Consumed by** | Product cards, header, FAQ, commerce badges |
| **Centralized?** | Yes |

### A9. Form system

| | |
|--|--|
| **Location** | `component-form.css`, `component-form.js` (global), plus `component-newsletter.css` |
| **Consumed by** | Newsletter showcase, contact, account (Dawn) |
| **Centralized?** | Yes for base; newsletter form is framework-specific (`nether-newsletter-form`) |

### A10. Motion engine

| | |
|--|--|
| **Location** | `nether-motion.js`, `nether-motion-presets.js`, `nether-motion-config.liquid`, `custom-animations.js` |
| **Implements** | GSAP CDN load, `NetherMotion.registerSection`, presets, reduced-motion, FX selectors |
| **Consumed by** | Every custom element listed in `SECTION_SELECTORS` inside `nether-motion.js` |
| **Section CSS** | `[data-nether-motion-pending]` / `[data-nether-motion-ready]` hide/show rules per framework |
| **Section JS** | Each `component-*.js` registers with Motion Engine |
| **Centralized?** | Engine yes; **section motion orchestration duplicated** across JS files |

### A11. Layout / spacing / page width

| | |
|--|--|
| **Location** | Theme tokens `--page-width`, `--spacing-sections-*`; Dawn `.page-width` |
| **Section pattern** | `nether_full_width` toggles `.page-width` on inner wrappers; `padding_top` / `padding_bottom` via `.section-{{id}}-padding` |
| **Centralized?** | Token yes; **padding Liquid block duplicated** in every Nether section |

---

## B. Presentation frameworks

### B1. Hero

| | |
|--|--|
| **Section** | `sections/nether-hero.liquid` |
| **Snippets** | `nether-hero-media`, `nether-hero-content`, `nether-hero-block`, `nether-hero-stat`, `nether-hero-feature-list`, `nether-hero-trust-badges`, scroll indicator |
| **CSS** | `component-hero.css` + shared design system (+ conditional glass/gradient/deferred-media) |
| **JS** | `component-hero.js` |
| **Depends on** | Motion Engine, typography, buttons, badges, icons, card-premium |
| **Depended on by** | Banner, Content, FAQ, Testimonials, Newsletter, CTA (CSS/JS/media adapter) |
| **Centralized?** | Hub is centralized; consumers extend it |

### B2. Banner

| | |
|--|--|
| **Section** | `sections/nether-banner.liquid` |
| **Snippets** | `nether-banner-content`, `nether-banner-block`, `nether-banner-countdown`, `nether-banner-divider`; reuses `nether-hero-media` (`adapter: 'banner'`) |
| **CSS** | `component-banner.css` + `component-hero.css` |
| **JS** | `component-banner.js` + `component-hero.js` |
| **Depends on** | Hero framework, Motion, glass/gradient |
| **Centralized?** | Extends Hero (good). Settings use `nether_banner_*` prefix (naming drift). |

### B3. Content

| | |
|--|--|
| **Section** | `sections/nether-content.liquid` |
| **Snippets** | `nether-content-shell`, `nether-content-grid`, `nether-content-block`, `nether-content-row`, image/video/quote/icon-list/custom-html |
| **CSS** | `component-content.css` + hero |
| **JS** | `component-content.js` + hero |
| **Shared exports** | `nether-content-image/video/custom-html/quote` used by FAQ/CTA/Newsletter/Testimonials |
| **Centralized?** | Leaf snippets shared; settings prefixed `nether_content_*` |

### B4. Media showcase

| | |
|--|--|
| **Section** | `sections/nether-media.liquid` |
| **Snippets** | `nether-media-content`, `nether-media-block`, `nether-media-card`, `nether-media-render`, `nether-media-before-after`, lightbox, divider |
| **CSS** | `component-media.css` |
| **JS** | `component-media.js` |
| **Depends on** | Card CSS, slider, deferred-media, Motion |
| **Centralized?** | Media render is local; ratio logic parallel to product/collection media |

### B5. Testimonials

| | |
|--|--|
| **Section** | `sections/nether-testimonials.liquid` |
| **Snippets** | shell, content, block, grid, card, author, rating, logo, stat, award, press, trust, divider |
| **CSS** | `component-testimonials.css` + hero + rating + slider |
| **JS** | `component-testimonials.js` + hero |
| **Depends on** | Hero media adapter, content-video, Motion |
| **Centralized?** | Framework-local with hero composition |

### B6. FAQ

| | |
|--|--|
| **Section** | `sections/nether-faq.liquid` |
| **Snippets** | shell, content, block, item, category, list, search, callout, cta, related, links, divider |
| **CSS** | `component-faq.css` + accordion + hero |
| **JS** | `component-faq.js` + hero |
| **Depends on** | content-image/video/html; hero-media adapter |
| **Centralized?** | Accordion uses Dawn patterns; **question heading hardcoded `<h3>`** in `nether-faq-item` |

### B7. Newsletter

| | |
|--|--|
| **Section** | `sections/nether-newsletter.liquid` |
| **Snippets** | content, block, form, countdown, divider |
| **CSS** | newsletter + newsletter-showcase + form + hero |
| **JS** | `component-newsletter-showcase.js` + hero |
| **Depends on** | Hero media, content-image/video, hero-stat/trust, form system |
| **Centralized?** | Extends Hero; countdown is placeholder |

### B8. CTA

| | |
|--|--|
| **Section** | `sections/nether-cta.liquid` |
| **Snippets** | content, block, aside, countdown, promotion-card, divider |
| **CSS** | `component-cta.css` + hero |
| **JS** | `component-cta.js` + hero |
| **Depends on** | Hero media/trust/stat/feature-list; content-image/video; product/collection highlights |
| **Centralized?** | Highest cross-snippet reuse of hero family |

### B9. Collection showcase

| | |
|--|--|
| **Section** | `sections/nether-collection.liquid` |
| **Snippets** | content, block, card, media, highlight, stat, divider |
| **CSS** | `component-collection-showcase.css` + card stack |
| **JS** | `component-collection-showcase.js` |
| **Depends on** | Motion, glass/gradient, card-premium |
| **Parallel to** | Product showcase (structure/CSS/JS near-duplicate) |
| **Centralized?** | **No** — duplicated with Product |

### B10. Product showcase

| | |
|--|--|
| **Section** | `sections/nether-product.liquid` |
| **Snippets** | content, block, card, promotional-card, media, actions, highlight, stat, divider |
| **CSS** | `component-product-showcase.css` + price/rating/quick-add/mask-blobs |
| **JS** | `component-product-showcase.js` + product-form/quick-add stack |
| **Depends on** | `nether-product-media`, quick-view/wishlist/compare triggers, Motion |
| **Parallel to** | Collection showcase |
| **Centralized?** | **No** — duplicated with Collection |

---

## C. Commerce / page frameworks

### C1. Product page

| | |
|--|--|
| **Section** | `nether-product-page.liquid` |
| **Snippets** | `nether-product-page-*`, commerce modules, recommendations |
| **CSS/JS** | `component-product-page.*` + Dawn product stack |
| **Depends on** | Commerce snippets, Motion, glass/gradient toggles |
| **Centralized?** | PDP-specific; reuses commerce + recommendation subsystems |

### C2. Collection page

| | |
|--|--|
| **Section** | `nether-collection-page.liquid`, `nether-collection-page-banner.liquid` |
| **CSS/JS** | `component-collection-page.*`; facets; may load product-showcase CSS |
| **Depends on** | Card-product, facets, quick-add, Motion |
| **Centralized?** | Page-specific; card style settings overlap showcase IDs |

### C3. Cart framework

| | |
|--|--|
| **Section** | `nether-cart-page`, `cart-drawer` |
| **Snippets** | `nether-cart-*` |
| **CSS/JS** | `component-cart-framework.*`, Dawn cart assets |
| **Depends on** | Commerce trust/shipping; recommendations embed |
| **Centralized?** | Framework yes for cart shell |

### C4. Commerce modules

| | |
|--|--|
| **Section** | `nether-commerce.liquid` |
| **Snippets** | `nether-commerce-*` (~25 files) |
| **CSS/JS** | `component-commerce.*`, `nether-commerce-interaction.js` |
| **Consumed by** | Product page, cart, quick view, standalone commerce section |
| **Centralized?** | Yes (snippet library) |

### C5. Bundles / Recommendations / Wishlist / Compare / Quick view

| Framework | Section / mount | Assets | Centralized? |
|-----------|-----------------|--------|--------------|
| Bundles | `nether-bundles` | `component-bundles.*` | Framework-local |
| Recommendations | `nether-recommendations` | `component-recommendations.*` | Shared embed snippets |
| Wishlist | `nether-wishlist-page` + header | `component-wishlist.*` | Shared interaction layer |
| Compare | `nether-compare-page` + header | `component-compare.*` | Shared interaction layer |
| Quick view | Header settings + modal snippets | `component-quick-view.*` | Centralized modal |

---

## D. Chrome frameworks

### D1. Header

| | |
|--|--|
| **Section** | `sections/header.liquid` |
| **Snippets** | `nether-header-logo`, `nether-header-navigation`, `nether-header-actions`, mega-menu tree, search/wishlist/compare triggers |
| **CSS/JS** | `component-header.*`, mega-menu, mobile-drawer, search-drawer |
| **Depends on** | Glass (optional), Motion (`data-nether-motion="header"`), cart drawer |
| **Hosts** | Quick view / wishlist / compare enable settings |

### D2. Announcement / Footer / Search

| Framework | Key files | Depends on |
|-----------|-----------|------------|
| Announcement | `announcement-bar`, `component-announcement.*` | Motion; header offset |
| Footer | `footer.liquid`, `component-footer.*`, `nether-footer-*` | Payment/social lists, Motion |
| Predictive search | `nether-predictive-search`, search drawer | Predictive search Dawn JS |

---

## E. Cross-cutting dependency graph (simplified)

```
settings_schema + theme.liquid tokens
        │
        ├── base.css + design-system CSS (global)
        │
        ├── nether-motion-config → nether-motion.js → presets / custom-animations
        │         ▲
        │         │ registerSection()
        │         │
        ├── Hero CE ◄──── Banner / Content / FAQ / Testimonials / Newsletter / CTA
        │         │
        │         └── nether-hero-media (adapter)
        │
        ├── Showcase CE: Collection ║ Product ║ Media  (parallel, not inherited)
        │
        ├── Page CE: Product Page / Collection Page / Cart / Wishlist / Compare
        │         └── Commerce snippet library
        │
        └── Header CE → drawers / mega menu / quick view hosts
```

---

## F. Duplication hotspots (dependency debt)

| Hotspot | Files | Risk |
|---------|-------|------|
| Showcase CSS/JS | `component-{product,collection,media}-*` | Same bug fixed in one may remain in others |
| Dividers | 13 `nether-*-divider.liquid` | Drift in a11y attributes / class names |
| Stats | 4 `*-stat.liquid` | Inconsistent a11y (`aria-label` present on some only) |
| Block dispatchers | `nether-*-block.liquid` | Heading/tag logic copied |
| Glass/gradient Liquid | Many shells | Style option sets diverge |
| Theme Editor reload | FAQ vs others | Different `handleSectionLoad` predicates |

---

## G. Asset load pattern note

Many design-system CSS files are loaded **globally in `theme.liquid` and again per section**. This is redundant but intentional for section isolation / Theme Editor preview; it does not create separate implementations, only duplicate network references.
