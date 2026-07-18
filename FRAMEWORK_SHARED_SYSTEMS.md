# Nether Framework — Shared Systems Matrix

**Audit phase:** Framework Architecture Audit (read-only)  
**Date:** 2026-07-18  
**Companion docs:** `FRAMEWORK_ARCHITECTURE.md`, `FRAMEWORK_DEPENDENCIES.md`, `FRAMEWORK_SETTINGS_MAP.md`

---

## Purpose

List every reusable Nether system and **which sections depend on it**, based on stylesheet tags, snippet renders, data attributes, and JS registration in code.

Legend: **●** = direct dependency · **○** = indirect / optional / adapter · **—** = not used

---

## 1. Global design systems × sections

| System | Primary files | Hero | Banner | Content | Media | Testimonials | FAQ | Newsletter | CTA | Collection | Product | Coll. page | Prod. page | Cart | Commerce | Bundles | Recs | Wishlist | Compare | Header | Footer |
|--------|---------------|:----:|:------:|:-------:|:-----:|:------------:|:---:|:----------:|:---:|:----------:|:-------:|:----------:|:----------:|:----:|:--------:|:-------:|:----:|:--------:|:-------:|:------:|:------:|
| Design tokens / color | `theme.liquid`, `settings_schema` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Typography CSS | `component-typography.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ○ | ○ |
| Button CSS | `component-button.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ○ | ○ |
| Icon CSS | `component-icon.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ● | ○ |
| Badge CSS | `component-badge.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ● | ● | — | — | ○ | — |
| Premium card CSS | `component-card-premium.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | — | — | — | — | — | — | — | — |
| Dawn card CSS | `component-card.css` | — | — | — | ● | — | — | — | — | ● | ● | ● | ○ | — | — | ○ | ○ | — | — | — | — |
| Shadow CSS | `component-shadow.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | — | ● | ● | ● | ● | ○ | ○ |
| Radius CSS | `component-radius.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | — | ● | ● | ● | ● | ○ | ○ |
| Glass CSS | `component-glass.css` | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | — |
| Gradient CSS | `component-gradient.css` | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | — | ○ | ○ | ○ | ○ | — | — |
| Form CSS/JS | `component-form.*` | — | — | — | — | — | — | ● | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Base / page-width / ratio | `base.css` | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |

○ for glass/gradient = loaded when enable setting is true (also present globally in `theme.liquid`).

---

## 2. Motion systems × sections

| System | Files | Depends |
|--------|-------|---------|
| Motion config | `nether-motion-config.liquid` | All pages via `theme.liquid` |
| Motion Engine 2.0 | `nether-motion.js` | Registers: hero, banner, content, media, testimonials, faq, newsletter, cta, collection, product, product-page, collection-page, cart-page, cart-drawer, wishlist, compare, quick-view, recommendations, bundles, commerce, header-related CEs, plus legacy GSAP sections |
| Preset library | `nether-motion-presets.js` | Global (pack metadata; no auto-bind) |
| Custom FX | `custom-animations.js` | Elements with `.fx-*` classes |
| Dawn scroll animations | `animations.js` | Theme setting gated |
| Per-section motion CE | `component-*.js` | Each framework’s custom element |

| Section custom element | `data-nether-motion` value | Framework JS |
|------------------------|---------------------------|--------------|
| `nether-hero` | `hero` | `component-hero.js` |
| `nether-banner` | `banner` | `component-banner.js` |
| `nether-content` | `content` | `component-content.js` |
| `nether-media` | `media` | `component-media.js` |
| `nether-testimonials` | `testimonials` | `component-testimonials.js` |
| `nether-faq` | `faq` | `component-faq.js` |
| `nether-newsletter` | `newsletter` | `component-newsletter-showcase.js` |
| `nether-cta` | `cta` | `component-cta.js` |
| `nether-collection` | `collection` | `component-collection-showcase.js` |
| `nether-product` | `product` | `component-product-showcase.js` |
| Header | `header` | `component-header.js` |

---

## 3. Hero compositional hub × dependents

| Shared piece | Files | Consumers |
|--------------|-------|-----------|
| Hero CSS/JS | `component-hero.css`, `component-hero.js` | Hero, Banner, Content, FAQ, Testimonials, Newsletter, CTA |
| `nether-hero-media` | snippet + adapters | Hero (default), Banner (`banner`), Content (`content`), FAQ (`faq`), Testimonials (`testimonials`), Newsletter (`newsletter`), CTA (`cta`) |
| `nether-hero-stat` | snippet | Hero, Content, CTA, Newsletter, Collection page blocks |
| `nether-hero-feature-list` | snippet | Hero, Content, CTA |
| `nether-hero-trust-badges` | snippet | Hero, CTA, Newsletter |
| Hero BEM / overlay patterns | classes `nether-hero__*` | Banner stacks hero classes; others reuse overlay/media roles |

---

## 4. Shared content leaf snippets × dependents

| Snippet | Content | CTA | Newsletter | FAQ | Testimonials | Notes |
|---------|:-------:|:---:|:----------:|:---:|:------------:|-------|
| `nether-content-image` | ● | ● | ● | ● | — | Hardcodes content+hero animate attrs; ignores `motion_attr` |
| `nether-content-video` | ● | ● | ● | ● | ● | Same contract note |
| `nether-content-custom-html` | ● | ● | ● | ● | ● | Same |
| `nether-content-quote` | ● | — | — | — | ● | |
| `nether-content-icon-list` | ● | — | — | — | — | |
| `nether-product-highlight` | — | ● | — | — | — | Also Product |
| `nether-collection-highlight` | — | ● | — | — | — | Also Collection |

---

## 5. Card / media systems × sections

| System | Key files | Sections |
|--------|-----------|----------|
| Product showcase card | `nether-product-card`, `nether-product-media`, `component-product-showcase.css` | `nether-product`; CSS also loaded by collection page |
| Collection showcase card | `nether-collection-card`, `nether-collection-media`, `component-collection-showcase.css` | `nether-collection` |
| Media card + render | `nether-media-card`, `nether-media-render`, `component-media.css` | `nether-media` |
| Testimonials card | `nether-testimonials-card`, grid | `nether-testimonials` |
| Dawn `card-product` | `snippets/card-product.liquid` | Product showcase Dawn path, collection page, recommendations, related modules |
| Premium card utilities | `component-card-premium.css` | Hero family + showcases |
| Image ratio (Dawn `.ratio`) | `base.css` `--ratio-percent` | All showcase media snippets; many Dawn cards |
| Content aspect ratios | `component-content.css` `aspect-ratio` | Content image blocks |

---

## 6. Section header / block dispatcher systems

Each presentation framework has a parallel trio:

| Framework | Content / shell | Block dispatcher | Divider |
|-----------|-----------------|------------------|---------|
| Hero | `nether-hero-content` | `nether-hero-block` | — (shapes/scroll instead) |
| Banner | `nether-banner-content` | `nether-banner-block` | `nether-banner-divider` |
| Content | `nether-content-shell` / grid | `nether-content-block` | `nether-content-divider` |
| Media | `nether-media-content` | `nether-media-block` | `nether-media-divider` |
| Testimonials | shell + content | `nether-testimonials-block` | `nether-testimonials-divider` |
| FAQ | shell + content | `nether-faq-block` | `nether-faq-divider` |
| Newsletter | `nether-newsletter-content` | `nether-newsletter-block` | `nether-newsletter-divider` |
| CTA | `nether-cta-content` | `nether-cta-block` | `nether-cta-divider` |
| Collection | `nether-collection-content` | `nether-collection-block` | `nether-collection-divider` |
| Product | `nether-product-content` | `nether-product-block` | `nether-product-divider` |

**Shared behavior:** eyebrow / heading / subheading / text / buttons / divider / `@app` cases with framework class prefixes. **Not** a single shared snippet.

Additional dividers: cart, commerce, collection-page, product-page.

---

## 7. FAQ / Newsletter / CTA specialized systems

| System | Files | Section |
|--------|-------|---------|
| FAQ accordion item | `nether-faq-item`, accordion CSS | FAQ |
| FAQ search / categories | `nether-faq-search`, `nether-faq-category`, `nether-faq-list` | FAQ |
| Newsletter form | `nether-newsletter-form`, form CSS | Newsletter |
| CTA aside / promotion | `nether-cta-aside`, `nether-cta-promotion-card` | CTA |
| Countdown placeholders | `nether-*-countdown` | Banner, Newsletter, CTA (hidden) |

---

## 8. Commerce shared library × hosts

| Snippet group | Approx. count | Hosted by |
|---------------|--------------:|-----------|
| `nether-commerce-*` | ~25 | `nether-commerce`, product page, cart, quick view |
| `nether-product-page-*` | many | Product page |
| `nether-cart-*` | ~20 | Cart page / drawer |
| `nether-quick-view-*` | ~17 | Header quick view |
| `nether-wishlist-*` | ~11 | Wishlist page + header |
| `nether-compare-*` | ~13 | Compare page + header |
| `nether-bundles-*` | ~14 | Bundles |
| `nether-recommendations-*` | ~11 | Recommendations + embeds on PDP/cart |

Interaction bridge: `nether-commerce-interaction.js` (wishlist/compare related flows).

---

## 9. Chrome systems × dependents

| System | Files | Used by |
|--------|-------|---------|
| Header shell | `header.liquid`, `component-header.*` | All storefront pages (header group) |
| Header logo/nav/actions | `nether-header-*` | Header |
| Mega menu | `nether-mega-*`, `component-mega-menu.*` | Header navigation |
| Mobile drawer | `component-mobile-drawer.*` | Header |
| Search drawer | `component-search-drawer.*` | Header |
| Announcement | `component-announcement.*` | Announcement bar; header offset |
| Footer | `footer.liquid`, `component-footer.*`, `nether-footer-*` | Footer group |
| Cart drawer | `cart-drawer` section + cart framework | When `settings.cart_type == drawer` |

---

## 10. Accessibility & responsive (cross-cutting)

| System | Mechanism | Sections |
|--------|-----------|----------|
| Skip link / a11y strings | `theme.liquid` | Global |
| Region labeling | `role="region"` + `aria-label` settings | Presentation CEs |
| Reduced motion | CSS `prefers-reduced-motion` + Motion Engine flags | All motion-enabled |
| Native accordion a11y | `<details>`/`<summary>` | FAQ |
| Focus management | Drawer/modal JS | Header drawers, quick view, bundles drawer |
| Responsive columns | `nether_columns_*` + CSS vars | Collection, Product, Media, FAQ, Testimonials, Content |
| Responsive layouts | `nether_layout_{desktop,tablet,mobile}` / hero layout modifiers | Hero family + showcases |
| Padding scale | `.section-{{id}}-padding` 0.75× mobile | All major Nether sections |

---

## 11. Duplicated “systems” (appear shared, are not)

These look like one framework to merchants but are **parallel implementations**:

| Apparent system | Actual files | Sections affected |
|-----------------|--------------|-------------------|
| Showcase layout (position/align/gap/columns) | `component-product-showcase.css`, `component-collection-showcase.css`, `component-media.css` | Product, Collection, Media |
| Showcase motion JS | matching `component-*-showcase.js` / `component-media.js` | same |
| Section dividers | 13 `nether-*-divider.liquid` | All with dividers |
| Stat blocks | 4 `*-stat.liquid` | Hero, Collection, Product, Testimonials |
| Heading level assign | Inline in each `sections/nether-*.liquid` | All presentation |
| Glass/gradient enable cases | Inline in sections + shells | All with visual effects |
| Padding `{% style %}` block | Inline in each section | All with padding settings |

---

## 12. Inventory checklist (requested systems)

| Requested system | Status in Nether | Primary locus |
|------------------|------------------|---------------|
| Typography System | Present | `component-typography.css` + theme fonts |
| Layout System | Present (split) | Hero layouts + showcase grids + `.page-width` |
| Spacing System | Present | Theme spacing tokens + section padding |
| Section Header System | Present (duplicated) | `nether-*-content` + `nether-*-block` |
| Card System | Present (layered) | Dawn card + premium + showcase cards |
| Collection Card System | Present | `nether-collection-card` |
| Product Card System | Present | `nether-product-card` + `card-product` |
| Media System | Present | Media framework + hero-media |
| Image System | Present | Media snippets + content-image + Dawn image tags |
| Video System | Present | deferred-media + hero-media + content-video |
| Motion System | Present | `nether-motion.js` |
| Animation System | Present | Section animation settings + FX + Dawn animations |
| Button System | Present | `component-button.css` |
| Glass Effects | Present | `component-glass.css` |
| Gradient System | Present | `component-gradient.css` |
| Color System | Present | Color schemes in `theme.liquid` |
| Design Tokens | Present | `:root` CSS variables |
| Accessibility System | Distributed | Patterns across CSS/JS/Liquid (no single file) |
| Responsive System | Distributed | Columns/breakpoints/layout modifiers |
| Collection Framework | Present | Showcase + collection page |
| Product Framework | Present | Showcase + product page |
| Newsletter Framework | Present | `nether-newsletter` |
| FAQ Framework | Present | `nether-faq` |
| Banner Framework | Present | `nether-banner` |
| CTA Framework | Present | `nether-cta` |
| Hero Framework | Present | `nether-hero` (compositional hub) |
| Reusable snippets | ~262 `nether-*` | `snippets/` |
| Reusable components | Custom elements + Dawn CEs | `assets/component-*.js` |
| Base CSS | Present | `base.css` |
| Shared JavaScript | Present | Motion, global.js, form, pubsub, commerce interaction |

---

## 13. Suggested reading order for fix planning (no fixes here)

1. `FRAMEWORK_ARCHITECTURE.md` — mental model  
2. This file — what is truly shared vs parallel  
3. `FRAMEWORK_DEPENDENCIES.md` — blast radius of a change  
4. `FRAMEWORK_SETTINGS_MAP.md` §16 — recurring QA root causes  

When a QA bug repeats across sections, start with the **shared system row** in this matrix, then confirm whether the implementation is **centralized** or **duplicated** before changing code.
