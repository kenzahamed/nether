# MEDIA FRAMEWORK REPORT

**Framework:** Nether Premium Media Framework  
**Date:** 2026-07-13  
**Scope:** Reusable category-agnostic media gallery system for luxury Shopify client builds  

---

## 1. Summary

The Nether Premium Media Framework is a new OS 2.0 section system that extends — not replaces — Dawn media sections (`image-banner`, `image-with-text`, `slideshow`, `collage`, `video`) and reuses established Nether showcase patterns from Hero, Banner, Collection, Product, and Content frameworks.

It provides a merchant-configurable media gallery with 10 layout modes, full media type support (image, video, background video), visual systems (glass, gradient, shadow, radius), NetherMotion animations, before/after comparisons, and lightbox-ready architecture for future modal integration.

**Verdict:** Production-ready. Dawn sections preserved. No duplicated framework CSS/JS. Theme Check passes on all new Media Framework files.

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-media.liquid` | Main OS 2.0 section with schema, presets, and grid orchestration |
| `assets/component-media.css` | Scoped layout, card, before/after, divider, and responsive styles |
| `assets/component-media.js` | `<nether-media>` custom element with NetherMotion integration |
| `snippets/nether-media-render.liquid` | Unified block-level media renderer (image, video, background video) |
| `snippets/nether-media-card.liquid` | Media card with overlay, badges, labels, CTA, glass/gradient |
| `snippets/nether-media-block.liquid` | Header block dispatcher (eyebrow, heading, text, buttons) |
| `snippets/nether-media-content.liquid` | Section header content shell |
| `snippets/nether-media-divider.liquid` | Optional top/bottom section dividers |
| `snippets/nether-media-before-after.liquid` | Before/after comparison block with accessible slider |
| `snippets/nether-media-lightbox.liquid` | Lightbox-ready data attributes and trigger markup |

---

## 3. Files Modified

| File | Change |
|------|--------|
| `assets/nether-motion.js` | Added `nether-media` to `SECTION_SELECTORS` for lazy GSAP boot |
| `locales/en.default.schema.json` | Added `sections.nether_media` Theme Editor translations |
| `locales/en.default.json` | Added storefront strings for grid, cards, lightbox, before/after |

**No existing files deleted or renamed.**

---

## 4. Media Layouts Implemented

| Layout ID | Merchant Label | Behavior |
|-----------|----------------|----------|
| `editorial_gallery` | Editorial Gallery | Alternating featured spans, editorial typography emphasis |
| `masonry_gallery` | Masonry Gallery | Variable row-span masonry grid |
| `grid_gallery` | Grid Gallery | Balanced luxury grid with shadow cards |
| `horizontal_gallery` | Horizontal Gallery | Scroll-snap horizontal media strip |
| `split_media` | Split Media | Featured hero item + stacked secondary items |
| `video_showcase` | Video Showcase | Video-emphasis layout with featured first item spanning full width |
| `lookbook` | Lookbook | Tall portrait ratio, floating labels, editorial positioning |
| `magazine_layout` | Magazine Layout | 12-column asymmetric editorial grid |
| `before_after` | Before / After | Dedicated before/after comparison blocks with drag slider |
| `minimal_gallery` | Minimal Gallery | Clean grid without overlays, content below media |

All layouts support responsive desktop / tablet / mobile modifiers via section settings.

---

## 5. Merchant Settings

### Framework
- Layout (10 options)
- Desktop / tablet / mobile columns
- Grid gap
- Media style (small, medium, large, editorial, glass, gradient, minimal)
- Content position (9-point grid)
- Content alignment
- Image ratio (adapt, portrait, square, landscape)
- Heading level, ARIA label, full width

### Visual
- Overlay opacity + enable toggle
- Glass cards
- Gradient overlay + style (brand, dramatic, vignette, fade-down)
- Floating cards
- Hover effect (zoom, lift, scale, shadow, glow, reveal)
- Top/bottom dividers + divider style

### Motion
- Animation style (fade, slide, stagger, scale)
- Animation speed (slow, medium, fast)
- Parallax enable

### Responsive
- Desktop layout (default, editorial, compact)
- Tablet layout (default, stacked, centered)
- Mobile layout (default, stacked, centered, minimal)

### Block: Media Item
- Media type: image, video, background video
- Desktop image, mobile image
- Shopify-hosted video, external video URL
- Poster image, video description, loop
- Per-block image ratio override
- Lightbox-ready toggle
- Title, caption, description
- Floating media label
- Badge label, type, style
- CTA label, link, style
- AR URL (future-ready)

### Block: Before / After
- Title, before/after images, labels, description

### Header Blocks
- Eyebrow, heading, subheading, text, buttons, `@app`

---

## 6. Motion Integration

| Feature | Implementation |
|---------|----------------|
| Engine | `NetherMotion.whenReady()` — no manual GSAP loading |
| Registration | `NetherMotion.registerSection(\`${sectionId}-media\`, …)` |
| Discovery | `nether-media` added to `SECTION_SELECTORS` in `nether-motion.js` |
| Reveal | Fade, slide, scale, stagger via ScrollTrigger (`top 85%`, once) |
| Stagger | 0.1s between `[data-nether-media-item]` elements |
| Parallax | Optional `scrollTrigger.scrub` on `[data-nether-media-parallax]` |
| Hover reveal | GSAP content reveal when `nether_hover_effect == reveal` |
| Before/after | Native range input slider (no GSAP required) |
| Reduced motion | `prefersReducedMotion()` → static visible state, `--motion-reduced` class |
| Theme Editor | `shopify:section:load` re-initializes motion and before/after handlers |

---

## 7. Accessibility Improvements

- Section `role="region"` with configurable `aria-label`
- Grid `role="list"` with translated `aria-label`
- Video poster buttons use Dawn `sections.video.load_video` pattern
- Deferred video with accessible play button labels
- Before/after: `role="group"`, labeled range slider, before/after badge labels
- Keyboard navigation: arrow keys between linked media cards in carousel-ready mode
- Focus-visible outlines on media card links
- `prefers-reduced-motion` respected in CSS and JS
- Lightbox trigger includes descriptive `aria-label`
- Semantic HTML: `article`, `figure`, `figcaption`, heading hierarchy

---

## 8. Performance Improvements

| Optimization | Detail |
|--------------|--------|
| Conditional CSS | Glass, gradient, deferred-media, slider loaded only when needed |
| Lazy images | First row eager, subsequent items lazy-loaded |
| Lazy motion | GSAP loads only when `nether-media` is present on page |
| Responsive images | `picture` + `srcset` + computed `sizes` per column count |
| Dawn primitives | Reuses `deferred-media`, `ratio`, `global-media-settings`, `media--hover-effect` |
| No duplicate assets | Single `component-media.css/js` pair; design tokens loaded from existing Phase 1 files |
| LCP-aware | `fetchpriority` support via render snippet parameters |

---

## 9. Framework Integration

### Reused Design Systems
- `component-button.css` + `snippets/button.liquid`
- `component-icon.css` + `snippets/icon.liquid`
- `component-badge.css` + `snippets/badge.liquid`
- `component-typography.css` (type-overline, type-heading-md, type-body-sm, type-caption)
- `component-card-premium.css` + `component-card.css`
- `component-shadow.css`, `component-radius.css`
- `component-glass.css` (conditional)
- `component-gradient.css` (conditional) + `grad-hero-*` utilities

### Reused Dawn Assets
- `component-deferred-media.css` + `<deferred-media>` custom element
- `component-slider.css` (horizontal gallery)
- `placeholder_svg_tag`, `color_scheme`, `page-width`, `section-padding`

### Architecture Pattern (matches Collection/Product showcase)
```
sections/nether-media.liquid
  └── <nether-media> custom element
        └── nether-media-content.liquid (header)
        └── <ul> nether-media__grid
              └── nether-media-card.liquid
                    └── nether-media-render.liquid
                    └── nether-media-lightbox.liquid
              └── nether-media-before-after.liquid (before/after layout)
```

### Media Render Pattern
`nether-media-render.liquid` consolidates block-level media branches previously distributed across `nether-collection-media.liquid`, `nether-content-image.liquid`, and `nether-hero-media.liquid` — without modifying those existing snippets.

### Future-Ready Slots
- `data-nether-media-future` — AR / 3D model integration point
- `data-nether-media-ar-url` — reserved AR experience URL
- `data-nether-media-lightbox` + `data-nether-media-src` — lightbox modal hook

---

## 10. Theme Editor Support

- Section name: **Nether media**
- 4 presets: Default gallery, Editorial gallery, Lookbook, Before / after
- Up to 24 blocks
- Disabled on header/footer groups
- All labels via `t:sections.nether_media.*` in `en.default.schema.json`
- Block `shopify_attributes` on all rendered blocks
- Placeholder grid when no media blocks configured
- Per-block media type, image, and content settings in block editor

---

## 11. Verification Checklist

| Check | Status |
|-------|--------|
| Dawn `image-banner.liquid` preserved | ✅ |
| Dawn `image-with-text.liquid` preserved | ✅ |
| Dawn `slideshow.liquid` preserved | ✅ |
| Dawn `collage.liquid` preserved | ✅ |
| Dawn `video.liquid` preserved | ✅ |
| Existing Nether Hero/Banner/Collection/Product/Content preserved | ✅ |
| No existing files deleted | ✅ |
| No existing files renamed | ✅ |
| No duplicated framework CSS (scoped to `.nether-media`) | ✅ |
| No duplicated framework JS (single custom element) | ✅ |
| No duplicated Liquid (unified `nether-media-render`) | ✅ |
| NetherMotion used (no manual GSAP) | ✅ |
| Theme Check — no errors on Media Framework files | ✅ |
| OS 2.0 section with blocks | ✅ |
| Responsive desktop / tablet / mobile | ✅ |
| `prefers-reduced-motion` support | ✅ |
| Lightbox-ready architecture | ✅ |
| AR / 3D future-ready slots | ✅ |

---

*End of Media Framework Report.*
