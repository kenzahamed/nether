# Nether Content Motion Framework — Implementation Report

**Phase:** 5.3.3  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation reference:** Banner Motion Framework (Phase 5.3.2)

---

## 1. Summary

The Nether Content Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Banner Motion implementation pattern**.

All Content animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Content extends `NetherHero`, registers its own motion host (`nether-content`), and maps Content layouts (editorial story, magazine, brand story, minimal, split, image-with-text, glass, alternating story, timeline, multi-column, feature grid) onto existing library presets — including Content-specific merchant animation styles (`story_reveal`, `timeline_reveal`).

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Motion control remains: existing Content animation style / speed / parallax toggles + global Motion Engine configuration.

Standalone GSAP timelines previously in `component-content.js` were replaced with NetherMotion preset consumption.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Content host registration | `NetherMotion.register('nether-content', …)` |
| Content (fade) | `minimal-reveal` |
| Content (slide) | `fade-up` |
| Content (scale) | `fade-scale` |
| Content (stagger) | `stagger-features` |
| Story reveal | `editorial-reveal` / `luxury-reveal` (stagger 0.16) |
| Timeline reveal / timeline layout | `fade-left` / `fade-right` via scroll |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `media-image-reveal`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Subheading / rich text | Layout + style content preset |
| CTA buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Statistics | `stagger-stats` |
| Feature lists | `stagger-features` |
| Icon lists | `stagger-list` + hover `hover-soft-lift` |
| Quote blocks | `editorial-reveal` / `text-editorial` / `luxury-reveal` |
| Content cards | `stagger-cards` + `hover-lift` / `hover-luxury-lift` |
| Inline image / video | `media-image-reveal` / `media-video-reveal` |
| Dividers | `minimal-reveal` |
| Multi-column / feature grid | `stagger-grid` |
| Alternating story | `stagger-cards` / directional `fade-left` / `fade-right` |
| Split / image-with-text | `fade-left` / `fade-right` (content ↔ media) |
| Overlay | `minimal-reveal` |
| Background parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Brand story / magazine soft content parallax | `scroll.parallax` (when not already covered by Hero luxury/editorial) |
| Glass layouts | `hover-glass` / `hover-luxury-lift` on panel |
| Minimal layouts | `minimal-reveal` |
| Editorial / magazine layouts | `editorial-reveal` / heading presets |
| Media hover (split layouts) | `hover-media` via `NetherMotion.hover` |
| Viewport batching | `scroll.batch` for tall content (quotes / icons / cards / rows / stats / features) |
| Timeline sequencing | Inherited `timelines.batch` for media + overlay entrance |

---

## 3. New Presets Created

None.

Every Content motion need was satisfied by the existing Motion Preset Library. No Content-only GSAP timelines were introduced.

---

## 4. Files Created

| File | Purpose |
|---|---|
| `CONTENT_MOTION_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `assets/component-content.js` | Full Content Motion 2.0 integration — extends NetherHero, host registration, layout/style preset mapping, story/timeline reveal, hover, scroll layers, Theme Editor lifecycle |
| `assets/component-content.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for content targets |
| `sections/nether-content.liquid` | Motion DOM hooks: `data-nether-hero-layout`, overlay attr, ScrollTrigger plugin hint for timeline/row layouts |
| `snippets/nether-content-shell.liquid` | `data-nether-hero-content` + `data-nether-hero-panel` |
| `snippets/nether-content-block.liquid` | Dual animate hooks + `data-nether-hero-role` on content blocks |
| `snippets/nether-content-row.liquid` | Row motion roles for stagger / timeline sequencing |
| `snippets/nether-content-quote.liquid` | Quote motion roles |
| `snippets/nether-content-icon-list.liquid` | Icons motion roles |
| `snippets/nether-content-image.liquid` | Image motion roles |
| `snippets/nether-content-video.liquid` | Video motion roles |
| `snippets/nether-content-custom-html.liquid` | Custom HTML motion roles |

**Not modified:** `component-hero.js`, `component-banner.js`, Motion Engine, Preset Library, merchant schema settings, Content layout CSS structure.

**Not deleted or renamed:** any existing files.

---

## 6. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-content` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, timeline reveal, and row layouts (`data-nether-motion-plugins` + `needsScrollPlugins()`).
- Transforms/opacity only (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance media/overlay composed via inherited `timelines.batch`.
- Tall Content sections use `scroll.batch` for secondary groups (quotes / icons / cards / rows / stats / features).
- Timeline / timeline_reveal rows avoid double animation (entrance headers only; rows use scroll sequencing).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns inherited only when parallax is off.
- Media hover withheld when parallax is enabled (avoids competing transforms).

---

## 7. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (Content CSS).
- Hover uses Engine `hover()` (`pointerenter`/`pointerleave` + `focusin`/`focusout` where appropriate).
- Panel / media / row-card hover disables focus binding where inappropriate (`focus: false`).
- Semantic Content markup unchanged (`role="region"`, heading levels, lists, quote figure/blockquote, labels).
- No new Theme Editor motion settings — global Motion Engine + existing Content animation / parallax controls only.

---

## 8. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherContent.resolvePresets()  ← extends Hero resolvePresets + content layouts + story/timeline
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (inheritance + same Engine APIs).
- Banner Motion is the implementation reference (host registration, layout mapping, hover, scroll layers).
- No standalone Content GSAP timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing Content animation / parallax controls.
- Hero and Banner files untouched — compatibility preserved.
- Content functionality (layouts, settings, media adapter, blocks) unchanged except additive motion hooks.

---

## 9. Verification Checklist

- [x] Content Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Banner Motion used as implementation reference
- [x] No files deleted or renamed
- [x] Content not redesigned — motion integration only
- [x] No new merchant motion settings
- [x] No duplicate GSAP
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Reveal / stagger / parallax / layered / batch / timeline / story / editorial support
- [x] Hover via reusable presets + Engine `hover()`
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Banner compatibility preserved (Banner files untouched)
- [x] JS syntax validated (`node --check` on `component-content.js`, `component-hero.js`, `component-banner.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all Content layouts, story/timeline reveal, parallax, hover, reduced motion) recommended

---

**Stop condition:** Content Motion Framework (Phase 5.3.3) complete. Ready for the next Presentation Framework motion pass.
