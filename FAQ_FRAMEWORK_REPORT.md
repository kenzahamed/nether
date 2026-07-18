# Nether Premium FAQ & Knowledge Framework — Implementation Report

**Date:** 2026-07-13  
**Scope:** Premium FAQ & Knowledge Framework (Phase 3)  
**Approach:** Extend — do not replace Dawn or existing Nether systems  

---

## 1. Summary

The Nether Premium FAQ & Knowledge Framework adds a reusable, category-agnostic help and knowledge system for luxury Shopify client builds. It extends the established Nether showcase architecture (Hero, Banner, Collection, Product, Content, Media, Testimonials) without modifying or replacing Dawn's `collapsible-content`, `rich-text`, or `multicolumn` sections.

The framework is delivered as a single OS 2.0 section (`nether-faq`) with ten merchant-selectable layouts, seventeen reusable block types (plus `@app`), full design-token integration, Dawn `details`/`summary` accordion accessibility, client-side FAQ search with future AJAX endpoint architecture, sticky category navigation, and NetherMotion-powered animations including accordion reveal and category reveal modes.

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-faq.liquid` | Main OS 2.0 section with schema, presets, and layout orchestration |
| `assets/component-faq.css` | FAQ-specific layout modifiers (extends `component-hero.css`, `component-accordion.css`) |
| `assets/component-faq.js` | `nether-faq` custom element with accordion, search, expand/collapse, and NetherMotion lifecycle |
| `snippets/nether-faq-block.liquid` | Central block dispatcher |
| `snippets/nether-faq-content.liquid` | Section header renderer |
| `snippets/nether-faq-shell.liquid` | Hero-composed editorial/minimal shell |
| `snippets/nether-faq-list.liquid` | Layout-aware FAQ list with question/answer pairing |
| `snippets/nether-faq-item.liquid` | Single accordion item (extends Dawn collapsible-content pattern) |
| `snippets/nether-faq-category.liquid` | Category heading with scroll anchor |
| `snippets/nether-faq-nav.liquid` | Sticky category navigation sidebar |
| `snippets/nether-faq-sidebar.liquid` | Support sidebar (related questions, helpful links, CTAs) |
| `snippets/nether-faq-search.liquid` | Search-ready input with future AJAX endpoint attribute |
| `snippets/nether-faq-divider.liquid` | Section divider (line, gradient, wave) |
| `snippets/nether-faq-callout.liquid` | Callout card, tip, and warning panels |
| `snippets/nether-faq-related.liquid` | Related question link block |
| `snippets/nether-faq-links.liquid` | Helpful link block |
| `snippets/nether-faq-cta.liquid` | Contact and support CTA blocks |

---

## 3. Files Modified

| File | Change |
|------|--------|
| `snippets/nether-hero-media.liquid` | Added `adapter: 'faq'` namespace for section-level media reuse |
| `snippets/nether-content-image.liquid` | Added optional `motion_attr` parameter for cross-framework reuse |
| `assets/nether-motion.js` | Registered `nether-faq` in `SECTION_SELECTORS` for lazy motion boot |
| `locales/en.default.schema.json` | Added `sections.nether_faq` Theme Editor translations |
| `locales/en.default.json` | Added storefront strings for list, nav, sidebar, search, and controls |

**No files deleted. No files renamed.**

---

## 4. Layouts Implemented

| Layout key | Merchant label | Rendering strategy |
|------------|----------------|-------------------|
| `editorial_faq` | Editorial FAQ | Hero shell + optional section media (`nether-hero--layout-editorial`) |
| `classic_accordion` | Classic accordion | Header + single-column Dawn-style accordion list |
| `two_column_faq` | Two column FAQ | Header + responsive two-column accordion grid |
| `categorized_faq` | Categorized FAQ | Sticky category nav + grouped accordion with category anchors |
| `help_center` | Help center | Category nav + FAQ list + support sidebar |
| `knowledge_base` | Knowledge base | Card-style accordion grid with multi-column layout |
| `minimal_faq` | Minimal FAQ | Hero minimal shell without section media |
| `magazine` | Magazine layout | Featured-first accordion spanning 2×2 on desktop |
| `product_faq` | Product FAQ | Compact minimal accordion styling for product pages |
| `support_center` | Support center | Category nav + FAQ list + sidebar with CTAs and helpful links |

---

## 5. Merchant Settings

### Framework
- Layout (10 options)
- Desktop / tablet / mobile column counts
- Grid gap
- Card style (small / medium / large / editorial / glass / gradient / minimal)
- Category navigation toggle
- Expand first item
- Expand all by default
- Expand / collapse controls toggle
- FAQ search toggle + placeholder + optional AJAX endpoint URL
- Content alignment (left / center / right)
- Primary heading level (H2 / H3)
- Accessibility label
- Full width toggle
- Color scheme

### Section Media (editorial layout)
- Media type (image / video)
- Desktop image, mobile image
- Shopify video, external video URL
- Poster image, video description, loop toggle
- Background blur

### Visual
- Overlay opacity
- Image overlay toggle
- Glass panel (light / medium / heavy / frosted)
- Gradient overlay (brand / dramatic / vignette / fade-down)
- Floating cards
- Top / bottom section dividers (line / gradient / wave)

### Motion
- Animation style (fade / slide / scale / stagger / accordion reveal / category reveal)
- Animation speed (slow / medium / fast)
- Parallax toggle

### Responsive
- Desktop layout (default / editorial emphasis / compact)
- Tablet layout (default / stacked / centered)
- Mobile layout (default / stacked / centered / minimal)

---

## 6. Motion Integration

- All animations route through **NetherMotion** — GSAP is never loaded manually
- `NetherFaq` custom element registers via `NetherMotion.registerSection('{sectionId}-faq', …)`
- Animation styles:
  - **Fade / Slide / Scale / Stagger** — scroll-triggered reveal on FAQ items
  - **Accordion reveal** — GSAP height/opacity tween on `details` toggle
  - **Category reveal** — horizontal slide-in for category headings
- **Parallax** — optional media parallax via ScrollTrigger (editorial layout)
- Lazy initialization via `NetherMotion.whenReady()` and `NetherMotion.load(['scrollTrigger'])`
- `prefers-reduced-motion` respected in CSS and JS — native `details` behavior preserved without animation

---

## 7. Accessibility Improvements

- Native `<details>`/`<summary>` accordion pattern (Dawn-compatible, no-JS functional)
- `aria-expanded` synced on summary elements via JS
- `role="region"` + `aria-labelledby` on answer panels
- Proper heading hierarchy: section H2/H3 → question H3/H4
- Keyboard-accessible expand/collapse all controls
- Search input with visible label (`visually-hidden`) and `aria-live` status region
- Category navigation as semantic `<nav>` with list structure
- `prefers-reduced-motion` disables transitions and GSAP tweens
- Screen reader-friendly search result count announcements

---

## 8. Performance Improvements

- Reuses Dawn `component-accordion.css` — no duplicate accordion base styles
- Reuses `component-hero.css` for editorial shell layouts
- Conditional loading of glass and gradient CSS only when merchant enables them
- Conditional deferred-media CSS only when video blocks or section media require it
- Client-side search filter uses `data-search-text` attributes — no network requests unless endpoint configured
- GSAP loaded lazily through shared `NetherMotion.load()` promise
- ScrollTrigger loaded only when parallax or scroll-reveal animations are active
- Native `details` accordion works without JavaScript

---

## 9. Framework Integration

| Existing system | Integration point |
|-----------------|-------------------|
| Hero Framework | Editorial/minimal shell, media layer, overlay, responsive modifiers |
| Content Framework | `nether-content-image`, `nether-content-video`, `nether-content-custom-html` blocks |
| Button System | `button.liquid` for CTAs and header buttons |
| Icon System | `icon.liquid` for search, links; `icon-accordion.liquid` for FAQ item icons |
| Card Premium | Card style modifiers (glass, gradient, editorial, floating) |
| Typography System | `type-overline`, heading size classes |
| Shadow / Radius / Glass / Gradient | Section and item-level visual tokens |
| NetherMotion | Section registration, scroll reveal, accordion reveal, parallax |
| Dawn collapsible-content | `details`/`summary` accordion, `component-accordion.css` |

---

## 10. Theme Editor Support

- Section name: **Nether FAQ**
- 48 block limit
- Three presets:
  - **Nether FAQ** — classic accordion with 4 sample items
  - **Nether help center** — categorized layout with search enabled
  - **Nether product FAQ** — minimal product-page FAQ with expand-first
- Block types: eyebrow, heading, subheading, text, faq_item, question, answer, category, icon, image, video, button, buttons, divider, callout_card, tip, warning, contact_cta, support_cta, related_question, helpful_link, custom_html, `@app`
- `@app` block support in shell and list contexts for future help desk / chat app integrations

---

## 11. Verification Checklist

| Check | Status |
|-------|--------|
| Dawn `collapsible-content.liquid` preserved | ✅ |
| Dawn `rich-text.liquid` preserved | ✅ |
| Dawn `multicolumn.liquid` preserved | ✅ |
| Existing Nether systems reused | ✅ |
| No duplicated accordion CSS (extends Dawn) | ✅ |
| No duplicated Liquid block renderers | ✅ |
| No duplicated JS motion loading | ✅ |
| No existing functionality broken | ✅ |
| Theme Check — no FAQ file offenses | ✅ |
| Online Store 2.0 compatible | ✅ |
| `@app` block compatible | ✅ |
| Responsive (desktop / tablet / mobile) | ✅ |
| Reduced motion support | ✅ |
| Search-ready architecture | ✅ |
| Category navigation + sticky sidebar | ✅ |
| Expand / collapse all | ✅ |

**Note:** Full theme check reports 5 pre-existing JSON validation warnings in `en.default.schema.json` (unrelated to this implementation) and standard Dawn variable-naming warnings. Zero offenses in FAQ framework files.

---

**No files deleted. No files renamed. Dawn sections and existing Nether systems remain intact.**
