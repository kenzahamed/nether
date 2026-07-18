# Nether Framework — Settings Map

**Audit phase:** Framework Architecture Audit (read-only)  
**Date:** 2026-07-18  
**Scope:** Merchant settings → Liquid → snippets → CSS → JS  
**Rule:** Only code-supported chains; no speculative fixes

---

## Legend

| Column | Meaning |
|--------|---------|
| **Origin** | Schema setting `id` (section unless noted theme-level) |
| **Liquid** | Where value is read / mapped |
| **Snippet** | Snippet that renders using it |
| **CSS** | Classes / custom properties |
| **JS** | Runtime consumer |
| **Shared?** | Same implementation across sections? |

Setting ID prefixes vary: generic `nether_*`, Banner `nether_banner_*`, Content `nether_content_*`.

---

## 1. Theme-level settings (global)

### 1.1 Typography & layout tokens

| Setting (theme) | Origin | Liquid | CSS | JS | Shared? |
|-----------------|--------|--------|-----|----|---------|
| `type_header_font`, `type_body_font`, `heading_scale`, `body_scale` | `settings_schema.json` | `theme.liquid` `{% style %}` | `--font-*`, typography system | — | Global |
| `page_width` | theme | `theme.liquid` | `--page-width`; used in image `sizes` formulas | — | Global |
| `spacing_sections`, grid spacing | theme | `theme.liquid` | `--spacing-sections-*`, `--grid-*` | — | Global |
| Color schemes | theme | `theme.liquid` scheme loop | `--color-*`, `.color-{id}` | — | Global |
| Card / media / button / input / badge tokens | theme | `theme.liquid` | `--product-card-*`, `--media-*`, `--buttons-*`, etc. | — | Global |

### 1.2 Dawn animations

| Setting | Origin | Liquid | CSS | JS | Shared? |
|---------|--------|--------|-----|----|---------|
| `animations_reveal_on_scroll` | theme | `theme.liquid` conditional script | Dawn reveal classes | `animations.js` | Global Dawn |
| `animations_hover_elements` | theme | `body` class `animate--hover-*` | Dawn hover CSS | — | Global Dawn |

### 1.3 Nether Motion Engine

| Setting | Origin | Liquid | Snippet | JS | Shared? |
|---------|--------|--------|---------|----|---------|
| `nether_motion_enabled` | theme `nether_motion` group | defaults in snippet | `nether-motion-config` → JSON | `nether-motion.js` | Global |
| `nether_motion_style` | theme | → `"style"` | same | Engine intensity/style | Global |
| `nether_motion_intensity` | theme | → `"intensity"` | same | distance scale | Global |
| `nether_motion_speed` | theme | → `"speed"` | same | duration scale | Global |
| `nether_motion_respect_reduced` | theme | → `"respectReducedMotion"` | same | a11y gate | Global |
| `nether_motion_force_reduced` | theme | → `"forceReducedMotion"` | same | force reduced | Global |
| `nether_motion_mobile` / `_desktop` | theme | → device flags | same | breakpoint enable | Global |

Section animation still controlled per-section via `nether_animation_style` / speed / parallax (below).

---

## 2. Heading level

### 2.1 Section heading level (presentation)

| Origin | Sections | Liquid mapping | Snippet | CSS | JS | Shared? |
|--------|----------|----------------|---------|-----|----|---------|
| `nether_heading_level` | Hero (`h1`/`h2`), Collection, Product, Media, FAQ, Testimonials, Newsletter, CTA (`h2`/`h3`) | Section assigns `heading_tag`; passed into content/shell | `nether-*-block` renders `<{{ heading_element }}>` | Visual size via `heading_size` class (`h0`–`h5`), **not** the tag | — | **Logic duplicated** per section; pattern shared |
| `nether_banner_heading_level` | Banner | same pattern | `nether-banner-*` | same | — | Prefixed ID |
| `nether_content_heading_level` | Content | same pattern | `nether-content-*` | same | — | Prefixed ID |

**Implementation pattern (repeated):**

```liquid
assign heading_tag = 'h2'  # hero defaults h1
if section.settings.nether_heading_level == 'h3'  # or 'h2' for hero
  assign heading_tag = 'h3'
endif
```

Subheading element steps down (`h3`→`h4`) inside each `nether-*-block.liquid`.

### 2.2 Block-level heading level

| Origin | Where | Liquid | Notes |
|--------|-------|--------|-------|
| `heading_level` | FAQ category block | `nether-faq-category.liquid` uses `<{{ heading_level }}>` | **Does** honor setting |
| FAQ question markup | `nether-faq-item.liquid` | **Hardcoded `<h3>`** | Section `nether_heading_level` does **not** change FAQ questions |

### 2.3 Recurring QA implication (heading)

Supported by code: merchants changing section heading level affect **section header blocks** only. FAQ accordion questions stay `<h3>` regardless. Multiple Hero sections can each default to `<h1>`.

---

## 3. Content position

| Origin | Sections | Liquid | Snippet / markup | CSS | JS | Shared? |
|--------|----------|--------|------------------|-----|----|---------|
| `nether_content_position` | Hero, Collection, Product, Media, CTA, Newsletter, Collection page | Appended to section/card class list | Cards: `nether-{x}-card--position-{value}` | Showcase CSS position grids (top/middle/bottom × left/center/right) | — | **Parallel CSS** in product/collection/media (near-duplicate rules) |
| `nether_banner_content_position` | Banner | `nether-banner--position-*` / hero classes | Banner content | `component-banner.css` / hero | — | Prefixed |
| `nether_content_position` (Content section) | Content | Content layout classes | Shell/grid | `component-content.css` | — | Prefixed sibling of generic name |

Hero uses position on **section shell** (`nether-hero--position-*`). Showcase frameworks apply position primarily on **cards**.

**Collection page position drift:** schema options are only `bottom-left` / `bottom-center` / `center` (not the full 9-grid). Value `center` becomes class `--position-center`, but **no CSS rule** for `position-center` exists under `assets/` — merchant selection has no styled effect.

---

## 4. Content alignment

| Origin | Sections | Liquid | CSS | JS | Shared? |
|--------|----------|--------|-----|----|---------|
| `nether_content_alignment` | Hero, Collection, Product, Media, FAQ, Testimonials, CTA, Newsletter | `*-align-{left\|center\|right}` on section and/or cards | Framework CSS text-align / flex alignment | — | Pattern shared; CSS duplicated per framework |
| `nether_banner_content_alignment` | Banner | Prefixed | Banner/hero CSS | — | Prefixed |

---

## 5. Image / media ratio

| Origin | Sections | Liquid | Snippet | CSS | JS | Shared? |
|--------|----------|--------|---------|-----|----|---------|
| `nether_image_ratio` | Collection, Product, Media, Bundles, Recommendations | Maps adapt/portrait/square/(landscape) → numeric `ratio` | `nether-collection-media`, `nether-product-media`, `nether-media-render`, bundles/recs cards | `.ratio` + inline `--ratio-percent` (`base.css`) | — | **Shared Dawn ratio primitive**; **mapping Liquid duplicated** |
| `image_ratio` (block) | Media blocks, Content image blocks, FAQ, Product page blocks, Cart recommendations, Collection page | Block override or content class | `nether-media-render` (block overrides section); `nether-content-image` uses class `--{{ image_ratio }}` | Content CSS `aspect-ratio` rules **and/or** `--ratio-percent` | — | **Two mechanisms** (padding-ratio vs CSS aspect-ratio) |
| Hero height `adapt` | Hero | Uses image `aspect_ratio` for `::before` padding | `nether-hero` style block | Hero CSS | — | Hero-specific |

**Code-supported ratio differences:**

| Snippet | Portrait | Landscape | Square | Adapt |
|---------|----------|-----------|--------|-------|
| `nether-product-media` | `0.8` | **not handled** (falls through → 1) | `1` | image AR |
| `nether-collection-media` | `0.8` | **not handled** | `1` | image AR |
| `nether-media-render` | `0.8` | `1.4` | `1` | image AR |

Media section schema includes `landscape`; product/collection schemas typically do not — but if an unexpected value appears, product/collection treat unknown as square (`ratio = 1`).

Placeholder cards often hardcode `style="--ratio-percent: 125%;"` (portrait-ish) independent of setting.

**Collection page contract mismatch (code-supported):**

- Schema setting ID is `image_ratio` (`sections/nether-collection-page.liquid`).
- Dawn card path correctly passes `media_aspect_ratio: section.settings.image_ratio` (`nether-collection-page-grid.liquid`).
- Premium card path renders `nether-product-card` → `nether-product-media`, which reads `section.settings.nether_image_ratio` and defaults to `portrait` when that ID is absent — so merchant `image_ratio` is ignored in premium mode.

---

## 6. Card style

| Origin | Sections | Liquid | Snippet | CSS | JS | Shared? |
|--------|----------|--------|---------|-----|----|---------|
| `nether_card_style` | Collection, Product, FAQ, Testimonials, Collection page | Section class `nether-{x}--card-{style}`; card size classes | `nether-product-card`, `nether-collection-card`, FAQ item `--style-*`, testimonials | Showcase CSS `--size-small/large/editorial`; FAQ item styles; `card--premium-{{ style }}` | Data attrs e.g. `data-nether-product-card-style` | **Not one system** — showcase size vs FAQ item style vs premium card modifiers |
| `card_style` (block) | Hero, Banner, Content, CTA, FAQ related cards | Block-level card chrome | Various card/promotion snippets | `component-card-premium.css` | — | Block setting shared by name across schemas |

---

## 7. Columns / responsive grid

| Origin | Sections | Liquid | CSS vars / classes | JS | Shared? |
|--------|----------|--------|--------------------|----|---------|
| `nether_columns_desktop/tablet/mobile` | Collection, Product, Media, FAQ, Testimonials | Written to CSS custom properties on section | `--nether-{x}-columns-*`; grid `repeat(var(...))` | Carousels may read column counts | Duplicated per showcase CSS |
| `nether_content_columns_*` | Content | Content grid | `component-content.css` | — | Prefixed |
| `columns_desktop` / `columns_mobile` | Collection page, Product page related blocks | Facet/grid Dawn + Nether | Collection page CSS | Facets JS | Mixed Dawn/Nether |
| `columns` (block) | Content icon-list / row blocks | Block layout | Content CSS | — | Block-local |

---

## 8. Section width / full width

| Origin | Sections | Liquid | CSS | Shared? |
|--------|----------|--------|-----|---------|
| `nether_full_width` | Collection, Product, Media, FAQ, Testimonials | Omits `.page-width` on inner; may add `slider-component-full-width` | Dawn `.page-width` | Shared Dawn class |
| `nether_content_width` | Hero, CTA, Newsletter, Content | `--width-{narrow\|medium\|wide\|full}` classes | Framework CSS max-widths | Parallel CSS |
| `nether_banner_content_width` | Banner | Prefixed width classes | Banner/hero | Prefixed |
| Theme `page_width` | Global | Token | All constrained layouts | Global |

---

## 9. Spacing / padding

| Origin | Sections | Liquid | CSS | JS | Shared? |
|--------|----------|--------|-----|----|---------|
| `padding_top`, `padding_bottom` | **All major Nether sections** | `{% style %}` `.section-{{ id }}-padding` with mobile `* 0.75` | Utility class on custom element | — | **Identical pattern duplicated** in every section file |
| Theme `spacing_sections` | Global | `--spacing-sections-*` | Between sections (Dawn) | — | Global |

---

## 10. Glass effects

| Origin | Sections | Liquid | Snippet | CSS | JS | Shared? |
|--------|----------|--------|---------|-----|----|---------|
| `nether_enable_glass` | Most Nether sections (generic) | Conditional stylesheet; section `--glass-enabled`; card `--glass` | Cards insert `glass-card-light` (etc.) panels | `component-glass.css` + framework modifiers | — | CSS shared; wiring duplicated |
| `nether_glass_style` | Hero family + FAQ/Testimonials/Newsletter/CTA | `case` → glass utility class on panel | Shells/content | Glass utilities | — | Case lists can diverge |
| `nether_content_enable_glass` / `_glass_style` | Content | Prefixed | Content shell/row | same | — | Prefixed |
| `nether_banner_enable_glass` / `_glass_style` | Banner | Prefixed | Banner content | same | — | Prefixed |
| `enable_glass` | Commerce section | Commerce schema | Commerce modules | glass CSS | — | Commerce-local |
| Header `nether_enable_glass` (+ wishlist/compare/quick_view variants) | Header | Header chrome / overlays | Header snippets | glass + header CSS | Header JS | Header-local |

---

## 11. Gradient

| Origin | Sections | Liquid | CSS | Shared? |
|--------|----------|--------|-----|---------|
| `nether_enable_gradient` | Most sections | Conditional `component-gradient.css`; overlay classes | `.grad-hero-*`, `.grad-linear-*` | CSS shared; Liquid duplicated |
| `nether_gradient_style` | Same | Overlay class `case` | Gradient utilities | Case duplicated |
| Banner/Content prefixed variants | Banner, Content | Prefixed IDs | same utilities | Prefixed |

Dawn body class `.gradient` is separate (color-scheme background), not Nether `.grad-*`.

---

## 12. Motion / animations (section-level)

| Origin | Sections | Liquid | CSS | JS | Shared? |
|--------|----------|--------|-----|----|---------|
| `nether_animation_style` | Most presentation + pages | `data-animation-style` on CE | Pending/ready opacity rules | Framework JS chooses reveal strategy; Motion Engine | Pattern shared; **implementations per JS file** |
| `nether_content_animation_style` | Content | Prefixed | Content CSS | `component-content.js` | Prefixed |
| `nether_banner_animation_style` | Banner | Prefixed | Banner | `component-banner.js` | Prefixed |
| `nether_animation_speed` | Most | Maps slow/normal/fast → duration seconds; `--*-transition-duration`; `data-animation-duration` | CSS vars | JS duration | Duplicated mapping |
| `nether_enable_parallax` | Most | `data-nether-motion-plugins="scrollTrigger"`; media `data-*-parallax` | — | Framework + Motion ScrollTrigger | Shared engine; per-section wiring |
| Prefixed parallax (banner/content) | Banner, Content | Prefixed IDs | — | same | Prefixed |
| Layout-driven plugin flags | Collection/Product/Media/FAQ/Testimonials | Long `{% if layout == ... or animation == ... %}` | — | ScrollTrigger | **Duplicated condition lists** |

Motion data attributes are framework-namespaced (`data-nether-hero-animate`, `data-nether-product-animate`, …). Shared snippets like `nether-content-image` hardcode `data-nether-content-animate` **and** `data-nether-hero-animate`, and **do not read** a `motion_attr` parameter — even when CTA/Newsletter/FAQ pass `motion_attr:`.

---

## 13. Buttons

| Origin | Where | Liquid | Snippet | CSS | JS | Shared? |
|--------|-------|--------|---------|-----|----|---------|
| Block `buttons` (labels, links, styles) | Nearly all presentation sections | Block dispatcher `when 'buttons'` | Inside `nether-*-block` | `.button` + `component-button.css` | Motion may stagger buttons | Markup duplicated per dispatcher |
| Theme button tokens | Global | `theme.liquid` | — | `--buttons-*` | — | Global |
| Card CTA labels | Product/collection/media cards | Card snippets | Card | Button classes; sometimes `<span class="button">` inside `<a>` | — | Card pattern |

---

## 14. Media / video / image

| Origin | Sections | Liquid | Snippet | CSS | JS | Shared? |
|--------|----------|--------|---------|-----|----|---------|
| `nether_media_type` / prefixed `*_media_type` | Hero family | Selects image/video/background | `nether-hero-media` (+ adapters) | Hero/deferred-media | Hero/Banner JS | **Centralized in hero-media** |
| Section image/video pickers | Hero, Banner, etc. | Passed to hero-media | `nether-hero-media` | — | — | Shared |
| Block `media_type`, images, video, poster | Product/Collection/Media cards | Card media snippets | `nether-product-media`, `nether-collection-media`, `nether-media-render` | Card media CSS | Parallax attrs | Parallel snippets |
| Overlay opacity | Hero family / showcases | CSS var `--*-overlay-opacity` | Overlay div | Framework CSS | — | Parallel |
| `nether_show_secondary_image` | Product | Product media | `nether-product-media` | hover effect | — | Product-local |

---

## 15. Setting ID consistency matrix

| Concern | Generic `nether_*` | Prefixed Banner | Prefixed Content |
|---------|--------------------|-----------------|------------------|
| Heading level | `nether_heading_level` | `nether_banner_heading_level` | `nether_content_heading_level` |
| Content position | `nether_content_position` | `nether_banner_content_position` | `nether_content_position` (same name, Content section) |
| Alignment | `nether_content_alignment` | `nether_banner_content_alignment` | `nether_content_alignment` |
| Glass | `nether_enable_glass` | `nether_banner_enable_glass` | `nether_content_enable_glass` |
| Gradient | `nether_enable_gradient` | `nether_banner_enable_gradient` | `nether_content_enable_gradient` |
| Animation style | `nether_animation_style` | `nether_banner_animation_style` | `nether_content_animation_style` |

---

## 16. Recurring bug analysis (code-supported only)

These architectural facts can explain **the same QA failure appearing across multiple sections**. No fixes applied.

### 16.1 Heading level — shared pattern, incomplete consumers

| Finding | Evidence |
|---------|----------|
| Heading tag logic copy-pasted per section | Every presentation section assigns `heading_tag` locally |
| FAQ questions ignore section heading level | `nether-faq-item.liquid` hardcodes `<h3>` |
| FAQ categories honor block `heading_level` | `nether-faq-category.liquid` |
| Visual size ≠ semantic level | `heading_size` CSS classes independent of tag |
| Multiple H1 risk | Hero defaults `heading_tag = 'h1'` |

**Shared framework responsible:** Section Header / Typography heading-tag pattern + FAQ item snippet.

### 16.2 Image ratio — duplicated mappers, divergent option sets

| Finding | Evidence |
|---------|----------|
| Product/Collection media omit `landscape` branch | `nether-product-media`, `nether-collection-media` |
| Media render supports landscape `1.4` | `nether-media-render.liquid` |
| Content images use CSS aspect-ratio classes, not `--ratio-percent` | `nether-content-image` + `component-content.css` |
| Placeholders hardcode `125%` ratio | Product/Collection/Media section placeholders |
| Collection page premium cards ignore schema `image_ratio` | Page schema uses `image_ratio`; `nether-product-media` reads `nether_image_ratio` |

**Shared framework responsible:** Image/Ratio system (Dawn `.ratio`) + per-framework media snippets + shared product-card contract.

### 16.3 Motion — shared engine, divergent wiring

| Finding | Evidence |
|---------|----------|
| Global Motion Engine is single | `nether-motion.js` + config snippet |
| Each framework JS reimplements reveal/parallax/pending | `component-{hero,banner,content,media,faq,testimonials,newsletter,cta,product,collection}-*.js` |
| FAQ Theme Editor reload predicate differs | `component-faq.js` uses `event.target.contains(this)`; most others use `event.detail.sectionId` |
| Shared content snippets ignore `motion_attr` | `nether-content-image/video/custom-html` have no `motion_attr`; parents still pass it |
| Content image always stamps hero + content animate attrs | Hardcoded dual `data-nether-*-animate` |

**Shared framework responsible:** Motion Engine + per-section motion adapters + shared content leaf snippets.

### 16.4 Alignment / position — parallel CSS

| Finding | Evidence |
|---------|----------|
| Same BEM modifiers (`--position-*`, `--align-*`) | Product, collection, media showcase CSS |
| Rules are copy-adjacent, not imported from one file | Separate `component-*-showcase.css` / `component-media.css` |

**Shared framework responsible:** Showcase Layout system (duplicated).

### 16.5 Card style — multiple meanings

| Finding | Evidence |
|---------|----------|
| Showcase `nether_card_style` drives size/editorial classes | Product/collection cards |
| FAQ `nether_card_style` drives item style modifier | `nether-faq-item` |
| Block `card_style` drives premium card chrome | Hero/Banner/Content/CTA blocks |
| Premium CSS is global | `component-card-premium.css` |

**Shared framework responsible:** Card System (layered: Dawn card + premium CSS + framework modifiers).

### 16.6 Responsive columns — duplicated vars

| Finding | Evidence |
|---------|----------|
| Each showcase defines own `--nether-*-columns-*` | Product/collection/media/FAQ/testimonials CSS |
| Breakpoints 750 / 990 repeated | Framework CSS + Motion `BREAKPOINTS` |

**Shared framework responsible:** Responsive / Grid system (tokenized per framework).

### 16.7 Glass / gradient — shared CSS, duplicated Liquid

| Finding | Evidence |
|---------|----------|
| Utilities centralized | `component-glass.css`, `component-gradient.css` |
| Enable flags + style cases repeated | Every presentation section + shells |
| Prefixed IDs on Banner/Content | Easy to “fix” wrong setting when comparing sections |

**Shared framework responsible:** Glass Effects + Gradient System.

### 16.8 Placeholder / unwired merchant surfaces

| Finding | Evidence |
|---------|----------|
| Countdown blocks always `hidden` | `nether-banner-countdown`, `nether-newsletter-countdown`, `nether-cta-countdown` |
| Banner JS still queries countdown nodes | `component-banner.js` selectors |
| Schema still exposes countdown blocks / presets | Section schemas |
| Media lightbox markup without JS controller | `enable_lightbox` / `nether-media-lightbox`; no lightbox handling in `component-media.js` |
| Product source modes `best_sellers` / `trending` | Treated as generic collection loops; only some sources get distinct sort (`nether-product.liquid`) |
| Glass/gradient intensity CSS vars not theme-wired | `component-glass.css` / `component-gradient.css` comments: multipliers for future settings; absent from `settings_schema.json` |

**Shared framework responsible:** Banner/Newsletter/CTA block system (placeholder leaf snippets); Media lightbox; Product source selection; Glass/Gradient token layer.

### 16.9 Dividers / stats duplication

| Finding | Evidence |
|---------|----------|
| 13 divider snippets | `nether-*-divider.liquid` |
| 4 stat snippets | hero/collection/product/testimonials |

A fix or a11y tweak in one often does not propagate — recurring “same bug, different section.”

---

## 17. Trace completeness notes

- Dawn-only sections (`image-banner`, `multicolumn`, etc.) are outside Nether framework settings naming and are not fully mapped here.
- Header contains a large nested settings surface (mega menu, drawers, quick view, wishlist, compare) — glass/motion flags traced; full header schema is documented in `HEADER_FRAMEWORK_REPORT.md`.
- Locale keys (`t:sections...`) do not change implementation chains.
