# Nether Banner Motion Framework — Implementation Report

**Phase:** 5.3.2  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)

---

## 1. Summary

The Nether Banner Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard**.

All Banner animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Banner extends `NetherHero`, registers its own motion host (`nether-banner`), and maps Banner layouts (promotional, split, editorial, collection, brand story, minimal, glass, gradient) onto existing library presets.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Motion control remains: existing Banner animation style / speed / parallax / hover toggles + global Motion Engine configuration.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Banner host registration | `NetherMotion.register('nether-banner', …)` |
| Content (fade) | `minimal-reveal` |
| Content (slide) | `fade-up` |
| Content (scale) | `fade-scale` |
| Content (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `media-image-reveal`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Subheading / rich text | Layout + style content preset |
| CTA buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Trust badges | `commerce-trust-reveal` (items) |
| Statistics | `stagger-stats` |
| Feature lists | `stagger-features` |
| Promotional / hero cards | `stagger-cards` + `hover-lift` / `hover-luxury-lift` |
| Collection bar | `text-cta-reveal` + hover lift |
| Countdown (future slot) | `commerce-badge-reveal` |
| Media (image) | `media-image-reveal` |
| Media (video / BG video) | `media-video-reveal` |
| Split / collection / brand story | `fade-left` / `fade-right` (content ↔ media) |
| Overlay | `minimal-reveal` |
| Decorative shapes | `fade-scale` + `scroll-floating` + layered `scroll.parallax` |
| Background parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Brand story soft content parallax | `scroll.parallax` (when not already covered by Hero luxury/editorial) |
| Glass layouts | `hover-glass` / `hover-luxury-lift` on panel |
| Gradient layouts | Overlay `minimal-reveal` + content presets |
| Minimal layouts | `minimal-reveal` |
| Editorial layouts | `editorial-reveal` / heading presets |
| Promotional + luxury | `luxury-reveal` + CTA emphasis |
| Media hover (merchant toggle) | `hover-media` via `NetherMotion.hover` |
| Viewport batching | Inherited Hero `scroll.batch` for tall banners |
| Timeline sequencing | Inherited `timelines.batch` for media + overlay entrance |

---

## 3. New Presets Created

None.

Every Banner motion need was satisfied by the existing Motion Preset Library. No Banner-only GSAP timelines were introduced.

---

## 4. Files Created

| File | Purpose |
|---|---|
| `BANNER_MOTION_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `assets/component-banner.js` | Full Banner Motion 2.0 integration — host registration, layout preset mapping, hover, scroll layers, Theme Editor lifecycle |
| `assets/component-banner.css` | Additive motion pending/ready hooks; reduced-motion guards; remove CSS transform transition that fought GSAP hover |
| `sections/nether-banner.liquid` | Motion DOM hooks: layout attrs, overlay, decor, collection bar roles |
| `snippets/nether-banner-content.liquid` | `data-nether-hero-panel` for glass/panel hover |
| `snippets/nether-banner-countdown.liquid` | `data-nether-hero-role="countdown"` |

**Not modified:** `component-hero.js`, Motion Engine, Preset Library, merchant schema settings, Banner layout CSS structure.

**Not deleted or renamed:** any existing files.

---

## 6. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-banner` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand when parallax or decorative shapes need it.
- Transforms/opacity only (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance media/overlay composed via inherited `timelines.batch`.
- Tall banners inherit Hero `scroll.batch` for secondary groups (trust / stats / features / cards).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns inherited only when parallax is off.
- Media hover withheld when parallax is enabled (avoids competing transforms).

---

## 7. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (Hero + Banner CSS).
- Hover uses Engine `hover()` (`pointerenter`/`pointerleave` + `focusin`/`focusout` where appropriate).
- Panel / media hover disables focus binding where inappropriate (`focus: false`).
- Collection link retains keyboard focus styles (`:focus-visible`).
- Semantic Banner markup unchanged (`role="region"`, heading levels, lists, labels).
- No new Theme Editor motion settings — global Motion Engine + existing Banner toggles only.

---

## 8. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherBanner.resolvePresets()  ← extends Hero resolvePresets + banner layouts
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (inheritance + same Engine APIs).
- No standalone Banner GSAP timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing Banner animation / parallax / hover controls.
- CTA / Newsletter subclasses remain on Hero (unaffected).
- Banner functionality (layouts, settings, media adapter, blocks) unchanged except additive motion hooks.

---

## 9. Verification Checklist

- [x] Banner Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] No files deleted or renamed
- [x] Banner not redesigned — motion integration only
- [x] No new merchant motion settings
- [x] No duplicate GSAP
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Reveal / stagger / parallax / layered / batch / timeline support
- [x] Hover via reusable presets + Engine `hover()`
- [x] Merchant media-hover toggle preserved
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] JS syntax validated (`node --check` on `component-banner.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes / attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all Banner layouts, parallax, hover, reduced motion) recommended

---

**Stop condition:** Banner Motion Framework (Phase 5.3.2) complete. Ready for the next Presentation Framework motion pass.
