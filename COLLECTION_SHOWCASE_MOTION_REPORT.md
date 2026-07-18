# Nether Collection Showcase Motion Framework — Implementation Report

**Phase:** 5.3.9  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation references:** Testimonials Motion (5.3.5), Media Motion (5.3.4), CTA Motion (5.3.8)

---

## 1. Summary

The Nether Premium Collection Showcase Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Testimonials / Media Motion implementation pattern**.

Collection Showcase is a **standalone** merchandising host (`nether-collection`) — it does not extend `NetherHero` because its DOM is a multi-item collection surface (grid / carousel / magazine / split) rather than a single Hero shell. All Collection Showcase animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Standalone `gsap.from` / `gsap.to` timelines previously in `component-collection-showcase.js` were replaced with preset consumption (`NetherMotion.animate` / `hover` / `scroll` / `timelines.batch`).

Layouts mapped: editorial grid, luxury grid, masonry grid, magazine, split collection, card layout, minimal grid, horizontal scroll, carousel — plus glass / luxury / editorial timing via global Motion style + existing Collection Showcase animation / hover / parallax settings.

Motion tone emphasizes **clear merchandising hierarchy**: section → header roles → card stagger → media / overlay / badge layer sequencing on featured layouts → viewport-batched titles / descriptions / CTAs on tall sections, with soft library hover lifts — no flashy effects.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Dawn `slider-component` carousel behavior, keyboard navigation, and Shopify media APIs are preserved.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Collection host registration | `NetherMotion.register('nether-collection', …)` |
| Header (fade) | `minimal-reveal` |
| Header (slide) | `fade-up` |
| Header (scale) | `fade-scale` |
| Header (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `hover-luxury-lift` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Intro / subheading / text | Layout + style content preset |
| CTA / view-all buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Collection cards / grid | `stagger-grid` / `stagger-cards` / `fade-up` / `minimal-reveal` |
| Collection images | `media-image-reveal` / `clip-reveal` (layer sequencing) |
| Collection video media | `media-video-reveal` |
| Collection titles | `fade-up` (card stagger + viewport batch) |
| Collection descriptions | `fade-up` (card stagger + viewport batch) |
| Card CTA labels | `text-cta-reveal` (viewport batch) |
| Badges | `commerce-badge-reveal` |
| Overlays | `minimal-reveal` |
| Decorative dividers | `minimal-reveal` + `timelines.batch` |
| Highlights / notes | `stagger-cards` / `fade-up` |
| Navigation controls | `minimal-reveal` / `fade-up` + hover `hover-soft-lift` |
| Featured magazine / split | `fade-up` + secondary `stagger-cards` |
| Cards hover | `hover-lift` / `hover-luxury-lift` / `hover-glow` / `hover-soft-lift` |
| Media hover (zoom) | `hover-image-zoom` |
| Glass panels | `hover-glass` / `hover-luxury-lift` |
| Hover reveal (merchant) | Engine `hover()` + soft-lift override |
| Background / card media parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Soft editorial header parallax | `scroll.parallax` (editorial / magazine when media parallax off) |
| Floating ambient | `scroll-floating` (max 3 floating cards) |
| Viewport batching | `scroll.batch` for tall sections (badges / titles / descriptions / CTAs / stats) |
| Timeline sequencing | `timelines.batch` for divider entrance |

---

## 3. New Presets Created

None.

Every Collection Showcase motion need was satisfied by the existing Motion Preset Library. Zero new presets.

---

## 4. Files Modified

| File | Change |
|---|---|
| `assets/component-collection-showcase.js` | Full Collection Showcase Motion 2.0 integration — host registration, layout/style preset mapping, entrance sequencing, scroll layers, hover, viewport batch, layer sequencing, Theme Editor lifecycle; removed standalone GSAP |
| `assets/component-collection-showcase.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for Collection targets |
| `sections/nether-collection.liquid` | Motion DOM hooks: layout/card-style attrs, expanded ScrollTrigger plugin hint, nav control hooks, view-all role |
| `snippets/nether-collection-content.liquid` | `data-nether-collection-header` / `data-nether-collection-panel` / highlights hook |
| `snippets/nether-collection-block.liquid` | Role hooks (eyebrow, heading, subheading, intro, buttons, app) |
| `snippets/nether-collection-card.liquid` | Overlay / badge / title / description / CTA / content motion hooks |
| `snippets/nether-collection-divider.liquid` | Divider motion role hooks |
| `snippets/nether-collection-highlight.liquid` | Highlight role hook |
| `snippets/nether-collection-stat.liquid` | Stat motion hook |

**Created:** `COLLECTION_SHOWCASE_MOTION_REPORT.md` (this report)

**Not modified:** `component-hero.js`, `component-testimonials.js`, `component-media.js`, `component-cta.js`, Motion Engine, Preset Library, merchant schema settings, Collection Showcase layout CSS structure, Dawn slider behavior.

**Not deleted or renamed:** any existing files.

---

## 5. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-collection` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, stagger / editorial / magazine / masonry / carousel / tall grids.
- Entrance / hover use transforms/opacity (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance dividers composed via `timelines.batch` when present.
- Tall sections use `scroll.batch` for secondary chrome (badges / titles / descriptions / CTAs / stats).
- Nested card interior sequencing limited to media / overlay / badge on featured/editorial layouts (titles / CTAs ride primary card stagger or viewport batch) — reduces nested opacity fights.
- Per-item scroll reveals used for editorial / masonry and large grids (>6) to avoid one heavy entrance burst.
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Soft parallax uses modest speeds; floating ambient limited to first 3 floating cards.

---

## 6. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (Collection CSS).
- Hover uses Engine `hover()` (`pointerenter`/`pointerleave` + focus where appropriate).
- Card / media / panel hover disables focus binding where inappropriate (`focus: false`).
- Navigation controls and header / view-all buttons keep focusable hover for keyboard users.
- Carousel arrow-key navigation between collection card links preserved.
- Semantic Collection Showcase markup unchanged (`role="region"`, list grid, article cards, labels).
- No new Theme Editor motion settings — global Motion Engine + existing Collection animation / parallax / hover controls only.

---

## 7. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherCollection.resolvePresets()  ← Hero pattern + Collection layouts + card_style + animation styles
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (host registration, resolvePresets, entrance / scroll / hover / batch, destroy lifecycle).
- Testimonials + Media Motion are the primary implementation references (standalone multi-item host, layout mapping, Theme Editor load, additive DOM/CSS hooks).
- Collection Showcase remains a standalone merchandising host (appropriate for multi-item grids/carousels; not a Hero shell subclass).
- No standalone Collection Showcase GSAP entrance / hover / parallax timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing Collection Showcase animation / parallax / hover controls.
- Hero, Testimonials, Media, CTA, and other Presentation Framework files untouched — compatibility preserved.
- Collection Showcase functionality (layouts, settings, Dawn slider, keyboard nav, lazy images) unchanged except additive motion hooks.
- Motion tone kept clear / premium / merchandising-forward — no flashy effects.

---

## 8. Verification Checklist

- [x] Collection Showcase Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Testimonials + Media Motion used as implementation references
- [x] No files deleted or renamed
- [x] Collection Showcase not redesigned — motion integration only
- [x] No new merchant motion settings / schema changes
- [x] No Presentation Polish started
- [x] No duplicate GSAP loaders
- [x] No standalone `gsap.from` / `gsap.to` in Collection Showcase JS
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Section reveal / eyebrow / heading / intro / cards / images / titles / descriptions / CTAs / badges / overlays / decorative elements
- [x] Reveal / stagger / layer sequencing / parallax / viewport batch support
- [x] Hover via reusable presets + Engine `hover()` (cards / media zoom / reveal / soft-luxury lifts)
- [x] Merchant animation style / speed / hover / parallax toggles preserved
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Testimonials / Media / CTA compatibility preserved (files untouched)
- [x] JS syntax validated (`node --check` on `component-collection-showcase.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all Collection layouts, hover, parallax, reduced motion) recommended

---

**Stop condition:** Collection Showcase Motion Framework (Phase 5.3.9) complete. Ready for the next Presentation Framework motion pass.
