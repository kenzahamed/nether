# Nether Framework — Architecture Overview

**Audit phase:** Framework Architecture Audit (read-only)  
**Date:** 2026-07-18  
**Scope:** Entire Nether Shopify theme (`c:\Shopify\nether-main`)  
**Mode:** Documentation only — no code changes

---

## 1. Executive summary

Nether is a **Dawn-extended Shopify theme framework**. It layers premium presentation and commerce systems on Dawn primitives (cards, buttons, color schemes, deferred media, sliders) rather than replacing them.

Architecture layers (bottom → top):

1. **Global design tokens** — `layout/theme.liquid` + `config/settings_schema.json` → CSS variables on `:root`
2. **Shared design systems** — globally loaded CSS (`component-typography`, `button`, `glass`, `gradient`, `shadow`, `radius`, `badge`, `icon`, `form`, `card-premium`)
3. **Motion engine** — `nether-motion.js` + presets + config bridge
4. **Section frameworks** — `sections/nether-*.liquid` orchestrators with custom elements
5. **Snippet trees** — `snippets/nether-*` block dispatchers, cards, shells, media
6. **Framework CSS/JS** — per-section `component-*.css` / `component-*.js`

**Footprint (approx.):**

| Asset type | Count |
|------------|------:|
| Sections (all) | 79 |
| Nether sections (`nether-*`) | 20 |
| Snippets (all) | 313 |
| Nether snippets (`nether-*`) | ~262 |
| Assets CSS/JS | ~167 |
| Design-system CSS (global) | 10 |
| Existing framework reports (repo root) | 40+ |

---

## 2. Compositional model

### 2.1 Standard section pattern

Most Nether presentation sections follow:

```
section (schema + assets + assigns)
  └── <nether-{name}> custom element
        ├── media / overlay / shapes (optional)
        ├── content shell / grid
        │     └── block dispatcher snippets
        │           └── leaf snippets (image, video, card, form, …)
        └── divider (optional)
```

### 2.2 Two compositional families

| Family | Hub | Members | Pattern |
|--------|-----|---------|---------|
| **Hero-composed** | `nether-hero` + `component-hero.js` | Banner, Content, FAQ, Testimonials, Newsletter, CTA | Load `component-hero.css/js`; reuse `nether-hero-media` with `adapter:` |
| **Showcase / grid** | Parallel implementations | Collection, Product, Media | Own CSS/JS; near-duplicate card/position/ratio/motion patterns |

### 2.3 Commerce / page family

| Framework | Section | Notes |
|-----------|---------|-------|
| Product page | `nether-product-page` | Extends Dawn PDP (`section-main-product.css`, `product-info.js`) |
| Collection page | `nether-collection-page` (+ banner) | Facets + product grid + showcase CSS |
| Cart page / drawer | `nether-cart-page`, `cart-drawer` | `component-cart-framework.*` |
| Commerce modules | `nether-commerce` | Trust/inventory/shipping snippets |
| Bundles | `nether-bundles` | Bundle builder UI |
| Recommendations | `nether-recommendations` | Product recommendations |
| Wishlist / Compare | `nether-wishlist-page`, `nether-compare-page` | Dedicated pages + header triggers |
| Quick view | Header-mounted + `nether-quick-view-*` | Modal commerce overlay |

### 2.4 Chrome family

| Framework | Primary files |
|-----------|---------------|
| Header | `sections/header.liquid`, `component-header.*`, `nether-header-*`, mega menu, drawers |
| Announcement | `announcement-bar.liquid`, `component-announcement.*` |
| Footer | `sections/footer.liquid`, `component-footer.*`, `nether-footer-*` |
| Search | `nether-predictive-search`, `component-search-drawer.*` |

---

## 3. Framework inventory

### 3.1 Shared design systems (global)

Loaded in `layout/theme.liquid` for every page:

| System | File | Role |
|--------|------|------|
| Base / Dawn layout | `assets/base.css` | Page width, grid, ratio, media, Dawn utilities |
| Typography | `assets/component-typography.css` | `.type-*` scale, measure, rhythm tokens |
| Icons | `assets/component-icon.css` | Icon sizing / wrappers |
| Buttons | `assets/component-button.css` | Button variants extending Dawn `.button` |
| Premium cards | `assets/component-card-premium.css` | Premium card styles / glass-card bridges |
| Badges | `assets/component-badge.css` | Badge system |
| Forms | `assets/component-form.css` + `component-form.js` | Form controls |
| Shadows | `assets/component-shadow.css` | Shadow levels / intensity |
| Radius | `assets/component-radius.css` | Radius scale |
| Glass | `assets/component-glass.css` | `.glass-surface`, `.glass-*` utilities |
| Gradient | `assets/component-gradient.css` | `.grad-*` utilities (does not replace Dawn `.gradient`) |

**Color / token source:** Inline `{% style %}` in `theme.liquid` from `settings.color_schemes` and theme settings (`--page-width`, `--font-*`, `--product-card-*`, `--buttons-*`, spacing, media, etc.).

### 3.2 Motion / animation systems

| System | Location | Role |
|--------|----------|------|
| Nether Motion Engine 2.0 | `assets/nether-motion.js` | GSAP load, registries, section lifecycle, a11y |
| Motion presets | `assets/nether-motion-presets.js` | Preset library pack (metadata) |
| Motion config bridge | `snippets/nether-motion-config.liquid` | Theme settings → JSON `#nether-motion-config` |
| Custom FX | `assets/custom-animations.js` | `.fx-*` class animations |
| Dawn scroll reveals | `assets/animations.js` | Gated by `settings.animations_reveal_on_scroll` |
| Theme hover animations | `body.animate--hover-*` | `settings.animations_hover_elements` |

Global load order (body end of `theme.liquid`): motion config → `nether-motion.js` → `nether-motion-presets.js` → `custom-animations.js`.

### 3.3 Presentation section frameworks

| Framework | Section | CSS | JS | Snippet prefix |
|-----------|---------|-----|----|----------------|
| Hero | `nether-hero` | `component-hero.css` | `component-hero.js` | `nether-hero-*` |
| Banner | `nether-banner` | `component-banner.css` (+ hero) | `component-banner.js` (+ hero) | `nether-banner-*` |
| Content | `nether-content` | `component-content.css` (+ hero) | `component-content.js` (+ hero) | `nether-content-*` |
| Media | `nether-media` | `component-media.css` | `component-media.js` | `nether-media-*` |
| Testimonials | `nether-testimonials` | `component-testimonials.css` (+ hero) | `component-testimonials.js` (+ hero) | `nether-testimonials-*` |
| FAQ | `nether-faq` | `component-faq.css` (+ hero, accordion) | `component-faq.js` (+ hero) | `nether-faq-*` |
| Newsletter | `nether-newsletter` | `component-newsletter-showcase.css` (+ hero, form, newsletter) | `component-newsletter-showcase.js` (+ hero) | `nether-newsletter-*` |
| CTA | `nether-cta` | `component-cta.css` (+ hero) | `component-cta.js` (+ hero) | `nether-cta-*` |
| Collection showcase | `nether-collection` | `component-collection-showcase.css` | `component-collection-showcase.js` | `nether-collection-*` |
| Product showcase | `nether-product` | `component-product-showcase.css` | `component-product-showcase.js` | `nether-product-*` |

### 3.4 Commerce / page frameworks

| Framework | Section(s) | Primary assets |
|-----------|------------|----------------|
| Product page | `nether-product-page` | `component-product-page.*`, Dawn product assets |
| Collection page | `nether-collection-page`, `nether-collection-page-banner` | `component-collection-page.*` |
| Cart | `nether-cart-page`, `cart-drawer` | `component-cart-framework.*` |
| Commerce | `nether-commerce` | `component-commerce.*`, `nether-commerce-*` snippets |
| Bundles | `nether-bundles` | `component-bundles.*` |
| Recommendations | `nether-recommendations` | `component-recommendations.*` |
| Wishlist | `nether-wishlist-page` | `component-wishlist.*` |
| Compare | `nether-compare-page` | `component-compare.*` |
| Quick view | Header + snippets | `component-quick-view.*` |

### 3.5 Card / media subsystems

| System | Primary implementation | Consumers |
|--------|------------------------|-----------|
| Product card (showcase) | `nether-product-card.liquid` + showcase CSS | Product showcase, collection page (partial) |
| Collection card | `nether-collection-card.liquid` | Collection showcase |
| Media card | `nether-media-card.liquid` + `nether-media-render` | Media showcase |
| Testimonials card | `nether-testimonials-card.liquid` | Testimonials |
| Dawn product card | `card-product.liquid` + `component-card.css` | Product showcase Dawn path, collection page, recommendations |
| Premium card styles | `component-card-premium.css` | Most presentation sections |
| Image ratio (Dawn) | `.ratio` + `--ratio-percent` in `base.css` | All card media snippets |

### 3.6 Reusable cross-framework snippets

| Snippet | Used by |
|---------|---------|
| `nether-hero-media` | Hero, Banner, Content, FAQ, Testimonials, Newsletter, CTA (`adapter:`) |
| `nether-content-image` | Content, CTA, Newsletter, FAQ |
| `nether-content-video` | Content, CTA, Newsletter, FAQ, Testimonials |
| `nether-content-custom-html` | Content, CTA, Newsletter, FAQ, Testimonials |
| `nether-content-quote` | Content, Testimonials |
| `nether-hero-stat` | Hero, Content, CTA, Newsletter, Collection page |
| `nether-hero-feature-list` | Hero, Content, CTA |
| `nether-hero-trust-badges` | Hero, CTA, Newsletter |
| `nether-product-highlight` | Product, CTA |
| `nether-collection-highlight` | Collection, CTA |
| `nether-motion-config` | Layout (global) |

### 3.7 Accessibility system

Not a single file — distributed patterns:

- Skip link + `accessibilityStrings` in `theme.liquid`
- `role="region"` + configurable `aria-label` on presentation custom elements
- `prefers-reduced-motion` in framework CSS and Motion Engine (`nether_motion_respect_reduced`)
- Visually hidden labels, focus traps in drawers/modals
- Native `<details>`/`<summary>` for FAQ

### 3.8 Responsive system

- Theme breakpoints used in CSS/JS: **750px** (mobile/desktop), **990px** (tablet/desktop in many frameworks)
- Motion engine: `BREAKPOINTS.mobileMax: 749`, `tabletMax: 989`
- Section settings: `nether_columns_*`, `nether_layout_{desktop,tablet,mobile}`, content width classes
- Padding pattern: mobile = `padding_* * 0.75` via `.section-{{ id }}-padding`

---

## 4. Centralization vs duplication

### Centralized (single source of truth)

- Design tokens (`theme.liquid` + `settings_schema.json`)
- Global design-system CSS
- Motion Engine + config bridge
- `nether-hero-media` adapter for background media across hero family
- Shared leaf content snippets (`nether-content-image/video/html`)

### Duplicated (parallel copies)

- **Section preamble** (~80–120 lines): animation speed mapping, class list builder, glass/gradient flags, padding `{% style %}` — copied across presentation sections
- **Block dispatchers** (`nether-*-block.liquid`): eyebrow/heading/text/buttons cases with class-prefix swaps
- **Dividers**: 13 near-identical `nether-*-divider.liquid` files
- **Stat snippets**: `nether-hero-stat`, `nether-collection-stat`, `nether-product-stat`, `nether-testimonials-stat`
- **Showcase CSS/JS**: Product ≈ Collection ≈ Media (position/align/ratio/motion pending states)
- **Glass/gradient class mapping**: repeated `case` blocks in shells/content snippets
- **Theme Editor `handleSectionLoad`**: mostly `event.detail.sectionId`; FAQ uses `event.target.contains(this)`

### Naming drift (architectural)

| Section group | Setting ID pattern |
|---------------|-------------------|
| Hero, Collection, Product, Media, FAQ, Testimonials, CTA, Newsletter (many) | Generic `nether_*` |
| Banner | Prefixed `nether_banner_*` |
| Content | Prefixed `nether_content_*` |
| Mixed (FAQ/CTA media type etc.) | Domain prefix + generic toggles |

---

## 5. Dependency on Dawn

Nether intentionally depends on Dawn:

- Color schemes / `.gradient` body class
- `.button`, `.card`, `.page-width`, `.ratio`, `.media`
- `deferred-media`, `slider-component`
- Product form / quick-add / facets / cart drawer primitives
- Locale keys under `sections.all.*` for shared padding labels

---

## 6. Related prior audits

This audit complements (does not replace) existing reports such as:

- `PHASE3_ARCHITECTURE_AUDIT.md`
- Per-framework `*_FRAMEWORK_REPORT.md` / `*_MOTION_REPORT.md`
- Design-system reports (`TYPOGRAPHY_*`, `GLASS_*`, `GRADIENT_*`, `BUTTON_*`, `CARD_*`, etc.)

---

## 7. Audit status

| Phase | Document |
|-------|----------|
| Inventory + overview | **This file** |
| Dependency map | `FRAMEWORK_DEPENDENCIES.md` |
| Setting → implementation map | `FRAMEWORK_SETTINGS_MAP.md` |
| Shared systems × section matrix | `FRAMEWORK_SHARED_SYSTEMS.md` |

**No fixes applied.** Findings that may explain recurring QA issues are listed under “Recurring bug analysis” in `FRAMEWORK_SETTINGS_MAP.md` and the shared-systems matrix.
