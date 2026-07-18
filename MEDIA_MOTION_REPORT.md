# Nether Media Motion Framework — Implementation Report

**Phase:** 5.3.4  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation references:** Banner Motion (Phase 5.3.2), Content Motion (Phase 5.3.3)

---

## 1. Summary

The Nether Media Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Banner / Content Motion implementation pattern**.

Media is a **standalone** gallery host (`nether-media`) — it does not extend `NetherHero` because its DOM is a multi-item media grid rather than a Hero shell. All Media animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Standalone GSAP timelines previously in `component-media.js` were replaced with preset consumption.

Layouts mapped: editorial gallery, masonry, grid, horizontal carousel, split media, video showcase, lookbook, magazine, before/after, minimal gallery, plus glass / luxury / editorial timing via global Motion style + existing Media style settings.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Motion control remains: existing Media animation style / speed / parallax / hover toggles + global Motion Engine configuration.

Before/After slider interaction, carousel keyboard navigation, lazy loading, deferred video, and Shopify media APIs are preserved.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Media host registration | `NetherMotion.register('nether-media', …)` |
| Header (fade) | `minimal-reveal` |
| Header (slide) | `fade-up` |
| Header (scale) | `fade-scale` |
| Header (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `media-image-reveal`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Subheading / text | Layout + style content preset |
| CTA buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Gallery grids | `stagger-gallery` / `stagger-grid` / `media-gallery-reveal` |
| Images | `media-image-reveal` / `clip-reveal` (editorial) |
| Videos / BG video | `media-video-reveal` |
| Hero media (split / magazine featured) | `fade-left` / `fade-up` + media presets |
| Secondary split items | `fade-right` / `stagger-gallery` / `stagger-cards` |
| Carousel (horizontal) | `stagger-cards` |
| Editorial / lookbook / magazine | `editorial-reveal` / cinematic per-item scroll reveals |
| Luxury layouts | Style pack + Ken Burns (parallax off) |
| Glass layouts | `hover-glass` / `hover-luxury-lift` on panel / cards |
| Minimal gallery | `minimal-reveal` |
| Before / After blocks | Block `editorial-reveal` / heading reveal / handle `fade-scale` (slider keeps clip-path) |
| Captions | `fade-up` |
| Floating labels | `fade-up` + ambient `scroll-floating` |
| Badges | `commerce-badge-reveal` |
| Overlay content | `minimal-reveal` / reveal hover via soft-lift |
| Decorative layers | `fade-scale` + `scroll.parallax` |
| Background / media parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Editorial header soft parallax | `scroll.parallax` (magazine / lookbook / editorial when media parallax off) |
| Media cards hover | `hover-lift` / `hover-luxury-lift` / `hover-glow` |
| Media / thumbnails hover | `hover-media` / `hover-image-zoom` |
| Play controls hover | `hover-soft-lift` |
| Before/after handles hover | `hover-soft-lift` |
| Viewport batching | `scroll.batch` for tall galleries (labels / badges / captions) |
| Timeline sequencing | `timelines.batch` for overlay + decorative entrance |

---

## 3. New Presets Created

None.

Every Media motion need was satisfied by the existing Motion Preset Library. No Media-only GSAP timelines were introduced.

`media-before-after` remains available in the library / host preset list for scrub-friendly comparisons elsewhere; Media’s interactive range slider owns clip-path at runtime, so entrance uses block/handle reveals instead of fighting the slider.

---

## 4. Files Created

| File | Purpose |
|---|---|
| `MEDIA_MOTION_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `assets/component-media.js` | Full Media Motion 2.0 integration — host registration, layout/style preset mapping, entrance sequencing, scroll layers, hover, viewport batch, Theme Editor lifecycle; before/after + carousel behavior preserved |
| `assets/component-media.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for Media targets |
| `sections/nether-media.liquid` | Motion DOM hooks: layout/style attrs, ScrollTrigger plugin hint, `data-nether-media-shell` |
| `snippets/nether-media-content.liquid` | `data-nether-media-header` + `data-nether-media-panel` |
| `snippets/nether-media-block.liquid` | `data-nether-media-role` on header blocks |
| `snippets/nether-media-card.liquid` | Media type / hero role hooks; overlay, caption, float-label, glass attrs |
| `snippets/nether-media-render.liquid` | `data-nether-media-media-type`, media-inner + play control hooks |
| `snippets/nether-media-before-after.liquid` | Role + caption hooks for BA motion |
| `snippets/nether-media-divider.liquid` | Divider motion role hooks |

**Not modified:** `component-hero.js`, `component-banner.js`, `component-content.js`, Motion Engine, Preset Library, merchant schema settings, Media layout CSS structure.

**Not deleted or renamed:** any existing files.

---

## 6. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-media` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, editorial/magazine/lookbook, before/after, floating, and tall galleries.
- Transforms/opacity only (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance overlays/decor composed via `timelines.batch` when present.
- Tall galleries use `scroll.batch` for secondary chrome (labels / badges / captions).
- Per-item scroll reveals used for editorial / lookbook / masonry / large grids to avoid one heavy entrance burst.
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns only when parallax is off and first image media exists.
- Media hover withheld when parallax is enabled (avoids competing transforms).
- Floating CSS transform transition disabled while motion-ready to avoid fighting GSAP hover.

---

## 7. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (Media CSS).
- Hover uses Engine `hover()` (`pointerenter`/`pointerleave` + focus where appropriate).
- Card / media / panel / BA-handle hover disables focus binding where inappropriate (`focus: false`).
- Play controls keep focusable hover for keyboard users.
- Carousel arrow-key navigation between linked cards preserved.
- Before/After range slider interaction unchanged (ARIA labels intact).
- Semantic Media markup unchanged (`role="region"`, list grid, figures, deferred-media poster buttons).
- No new Theme Editor motion settings — global Motion Engine + existing Media animation / parallax / hover controls only.

---

## 8. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherMedia.resolvePresets()  ← Hero pattern + Media layouts + media_style + hover_effect
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (host registration, resolvePresets, entrance / scroll / hover / batch, destroy lifecycle).
- Banner + Content Motion are the implementation references (layout mapping, Theme Editor load, additive DOM/CSS hooks).
- Media remains a standalone gallery host (appropriate for multi-item media grids; not a Hero shell subclass).
- No standalone Media GSAP timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing Media animation / parallax / hover controls.
- Hero, Banner, and Content files untouched — compatibility preserved.
- Media functionality (layouts, settings, render pipeline, before/after, carousel, lightbox hooks) unchanged except additive motion hooks.

---

## 9. Verification Checklist

- [x] Media Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Banner + Content Motion used as implementation references
- [x] No files deleted or renamed
- [x] Media not redesigned — motion integration only
- [x] No new merchant motion settings
- [x] No Presentation Polish started
- [x] No duplicate GSAP
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Reveal / stagger / layer sequencing / parallax / batch / cinematic / editorial support
- [x] Hover via reusable presets + Engine `hover()`
- [x] Lazy loading / responsive images / video / BA slider / carousel preserved
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Banner compatibility preserved (Banner files untouched)
- [x] Content compatibility preserved (Content files untouched)
- [x] JS syntax validated (`node --check` on `component-media.js`)
- [x] Theme Check — no new offenses attributed to Media Motion liquid hooks (existing theme-wide warnings unrelated)
- [ ] Visual QA in Theme Editor (load/unload/reorder, all Media layouts, parallax, hover, before/after, carousel, reduced motion) recommended

---

**Stop condition:** Media Motion Framework (Phase 5.3.4) complete. Ready for the next Presentation Framework motion pass.
