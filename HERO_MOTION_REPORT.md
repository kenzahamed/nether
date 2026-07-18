# Nether Hero Motion Framework — Implementation Report

**Phase:** 5.1 (first Motion implementation after Engine 2.0 + Preset Library)  
**Date:** 2026-07-14  
**Status:** Complete

---

## 1. Summary

The Nether Hero Framework is now a **reference Presentation Framework** for premium motion. All Hero animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Standalone GSAP timelines in Hero were removed.

Merchant control continues to use existing global Motion settings (`style`, `intensity`, `speed`, reduced-motion) plus the Hero section’s existing animation style / speed / parallax / scroll-indicator controls. No isolated Hero-only motion settings were added.

Child Presentation Frameworks (Banner, CTA, Newsletter) remain functional via preserved legacy APIs (`killMotionTweens`, `runRevealAnimation`, `getRevealFromProps`, `initParallax`). Banner hover now uses `NetherMotion.hover('hover-media')`.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Hero host registration | `NetherMotion.register('nether-hero', …)` |
| Content (fade) | `minimal-reveal` |
| Content (slide) | `fade-up` |
| Content (scale) | `fade-scale` |
| Content (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `media-image-reveal`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Subheading / rich text | Layout + style content preset |
| Buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Trust badges | `commerce-trust-reveal` (items) |
| Statistics | `stagger-stats` |
| Feature lists | `stagger-features` |
| Floating / hero cards | `stagger-cards` + `hover-lift` / `hover-luxury-lift` |
| Media (image) | `media-image-reveal` |
| Media (video / BG video) | `media-video-reveal` |
| Split layouts | `fade-left` / `fade-right` (content ↔ media) |
| Overlay | `minimal-reveal` |
| Decorative shapes | `fade-scale` (opacity capped) + `scroll-floating` + layered `scroll.parallax` |
| Background parallax | `NetherMotion.scroll.parallax` (scrubbed) |
| Scroll indicator | `scroll-cue` + `minimal-reveal` |
| Glass layouts | Content luxury/content presets + panel `hover-soft-lift` / `hover-luxury-lift` |
| Luxury layouts (global) | Style pack mapping above |
| Minimal layouts | `minimal-reveal` |
| Editorial layouts | `editorial-reveal` / heading presets |
| Viewport batching | `scroll.batch` → content preset (tall heroes) |
| Timeline sequencing | `timelines.batch` for media + overlay entrance |

---

## 3. New Presets Created

| Preset | Category | Why |
|---|---|---|
| `scroll-cue` | scroll | Gentle yoyo bounce for scroll indicators. Distinct from `scroll-floating` (ambient ±12px / 4s float). Reusable across all Presentation Frameworks. |

No Hero-named one-off presets were created. All other motion reuses the existing library.

**Engine extension (reusable, not Hero-specific):**

| API | Role |
|---|---|
| `NetherMotion.hover(targets, preset, options)` | Wires hover/focus from hover presets; cleaned via `destroy(scope)` |
| `NetherMotion.hoverInteractions` | Hover registry namespace |

---

## 4. Files Created

| File | Purpose |
|---|---|
| `HERO_MOTION_REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `assets/component-hero.js` | Full Motion 2.0 integration — presets, scroll, hover, sequencing, cleanup |
| `assets/component-banner.js` | Hover via `NetherMotion.hover('hover-media')`; destroy via Hero cleanup API |
| `assets/nether-motion.js` | Added `hover()` + HoverManager; wired into lifecycle destroy |
| `assets/nether-motion-presets.js` | Added `scroll-cue`; enriched style packs |
| `assets/component-hero.css` | Pending/ready motion hooks; reduced-motion FOUC guard |
| `sections/nether-hero.liquid` | Overlay/decor motion hooks; `data-nether-hero-layout` |
| `snippets/nether-hero-content.liquid` | `data-nether-hero-panel` |
| `snippets/nether-hero-media.liquid` | `data-nether-hero-media-type` |
| `snippets/nether-hero-block.liquid` | `data-nether-hero-role` on content blocks |
| `snippets/nether-hero-trust-badges.liquid` | `data-nether-hero-role="trust"` |
| `snippets/nether-hero-stat.liquid` | `data-nether-hero-role="stats"` |
| `snippets/nether-hero-feature-list.liquid` | `data-nether-hero-role="features"` |

**Not deleted or renamed:** any existing Hero / Motion / Framework files.

---

## 6. Performance Notes

- GSAP still lazy-loads via `NetherMotion.whenReady` / `needsMotion()` (`nether-hero` already in section selectors).
- ScrollTrigger loaded on demand when parallax or decorative layers need it.
- Transforms/opacity only (GPU-friendly); sanitizeVars still applied by Engine.
- Animations scoped + registered; `NetherMotion.destroy(root)` kills tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance media/overlay composed via `timelines.batch`; content uses staggered delays.
- Tall heroes use `scroll.batch` once for secondary groups (trust / stats / features / cards).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns only when parallax is off (avoids competing media transforms).
- Media hover withheld when parallax is enabled.

---

## 7. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport motion gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide is forced visible under `prefers-reduced-motion: reduce` (CSS).
- Hover uses `pointerenter`/`pointerleave` and `focusin`/`focusout` (keyboard-visible).
- Panel media hover disables focus binding where inappropriate (`focus: false`).
- Semantic Hero markup unchanged (`role="region"`, heading levels, lists, labels).
- Scroll cue skipped under reduced motion (`scroll-cue` → `mode: 'skip'`).

---

## 8. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherHero.resolvePresets()
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (70 presets) + scroll-cue
```

**Rules followed:**

- No standalone Hero GSAP timelines for core motion.
- Existing presets reused wherever reasonable.
- One new reusable preset (`scroll-cue`) registered in the library.
- Theme Editor control remains global Motion settings + existing Hero animation controls.
- Hero is the Phase 5.1 reference for future Banner / Content / Media / Product Presentation motion packs.
- Legacy subclass APIs preserved so CTA / Newsletter continue without regression.

---

## 9. Verification Checklist

- [x] Hero Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed (69 → 70 with `scroll-cue`)
- [x] No files deleted or renamed
- [x] Hero not rebuilt — extended via motion integration
- [x] No duplicate GSAP loaders
- [x] Motion through NetherMotion throughout
- [x] Reveal / stagger / parallax / layered / batch / timeline support
- [x] Hover via reusable presets + Engine `hover()`
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Banner hover migrated to presets
- [x] CTA / Newsletter subclass APIs preserved (`killMotionTweens`, etc.)
- [x] JS syntax validated (`node --check`)
- [ ] Theme Check CLI not installed in environment — Liquid changes are additive data attributes only; run Theme Check locally before deploy
- [ ] Visual QA in Theme Editor (Design Mode load/unload/reorder) recommended

---

**Stop condition:** Hero Motion Framework complete. Ready for the next Presentation Framework motion pass (Banner full preset migration, Content, Media, etc.).
