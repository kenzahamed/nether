# Nether CTA Motion Framework — Implementation Report

**Phase:** 5.3.8  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation references:** Banner Motion (5.3.2), Newsletter Motion (5.3.7), Content / Media Motion (5.3.3–5.3.4)

---

## 1. Summary

The Nether CTA & Conversion Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Banner / Newsletter Motion implementation pattern** (Hero subclass).

All CTA animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Prior standalone `gsap.from` / `gsap.to` timelines in `component-cta.js` were replaced with preset consumption (`NetherMotion.animate` / `hover` / `scroll` / `timelines.batch`). CTA continues to extend `NetherHero`, registers its own motion host (`nether-cta`), and maps CTA layouts onto existing library presets.

Layouts mapped: editorial CTA, centered CTA, split CTA, image CTA, background image/video CTA, product promotion CTA, collection promotion CTA, minimal CTA, luxury CTA — plus glass / luxury / editorial timing via global Motion style + existing CTA animation / button reveal / card reveal / hover / parallax settings.

Motion tone emphasizes **clear conversion**: section → content roles → `text-cta-reveal` buttons → card stagger, with soft library hover lifts — no flashy fills or sweeps.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Analytics hooks, keyboard focus, and Theme Editor lifecycle are preserved.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| CTA host registration | `NetherMotion.register('nether-cta', …)` |
| Content (fade) | `minimal-reveal` |
| Content (slide) | `fade-up` |
| Content (scale) | `fade-scale` |
| Content (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Supporting text / subheading | Layout + style content preset |
| CTA buttons / button group | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Promotion / product / collection cards | `stagger-cards` + hover `hover-lift` / `hover-luxury-lift` |
| Trust content | `commerce-trust-reveal` + optional hover lift (merchant toggle) |
| Statistics | `stagger-stats` |
| Features | `stagger-features` |
| Optional badges / countdown | `commerce-badge-reveal` |
| Background media | `media-image-reveal` / `clip-reveal` / `media-video-reveal` |
| Overlay | `minimal-reveal` |
| Decorative elements / dividers | `fade-scale` + `scroll-floating` / `minimal-reveal` |
| Background parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Soft editorial / luxury parallax | `scroll.parallax` (when media parallax off) |
| Glass / floating panel | Inherited `hover-glass` / `hover-luxury-lift` |
| Viewport batching | Hero batch + CTA secondary trust / stats / cards / aside batch |
| Timeline sequencing | `timelines.batch` for media + overlay + dividers |

---

## 3. New Presets Created

None.

Every CTA motion need was satisfied by the existing Motion Preset Library. Button hover reuses `hover-soft-lift` / `hover-luxury-lift` (established CTA hover behavior). Zero new presets.

---

## 4. Files Modified

| File | Change |
|---|---|
| `assets/component-cta.js` | Full CTA Motion 2.0 integration — host registration, layout/style preset mapping, entrance sequencing, button/card reveal, scroll layers, hover, viewport batch, Theme Editor lifecycle; removed standalone GSAP |
| `assets/component-cta.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for CTA targets |
| `sections/nether-cta.liquid` | Motion DOM hooks: layout attrs, overlay attrs, floating flag, expanded ScrollTrigger plugin hint, centered body content hooks |
| `snippets/nether-cta-content.liquid` | `data-nether-hero-panel` / `data-nether-cta-panel` |
| `snippets/nether-cta-block.liquid` | Role hooks (eyebrow, heading, text, buttons, stats, features, card, divider, etc.) |
| `snippets/nether-cta-aside.liquid` | Aside card role hooks |
| `snippets/nether-cta-promotion-card.liquid` | Card role + `data-nether-cta-card` |
| `snippets/nether-cta-countdown.liquid` | Countdown role hook |
| `snippets/nether-cta-divider.liquid` | Divider motion role hooks |

**Not modified:** `component-hero.js`, `component-banner.js`, `component-newsletter-showcase.js`, Motion Engine, Preset Library, merchant schema settings, CTA layout CSS structure.

**Not deleted or renamed:** any existing files.

**Created:** `CTA_MOTION_REPORT.md` (this report)

---

## 5. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-cta` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, button/card reveal, decorative shapes, and primary CTA layouts.
- Entrance / hover use transforms/opacity (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Entrance overlays/dividers composed via `timelines.batch` when present.
- Tall sections use `scroll.batch` for secondary chrome (trust / stats / cards / aside / countdown).
- Nested button/card reveals skipped from content stagger when merchant toggles are enabled (avoids nested opacity fights).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns only when parallax is off and media is imagery.

---

## 6. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (CTA CSS).
- Hover uses Engine `hover()` with focus kept on CTA buttons; trust items use `focus: false`.
- Panel / media hover remain from Hero (`focus: false` where inappropriate).
- Analytics click hooks preserved; listeners de-duplicated across Theme Editor reloads.
- Semantic CTA markup unchanged (`role="region"`, heading levels, lists, labels).
- No new Theme Editor motion settings — global Motion Engine + existing CTA animation / button reveal / card reveal / hover / parallax controls only.

---

## 7. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherCta.resolvePresets()  ← Hero pattern + CTA layouts + button/card/glass/floating
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (host registration, resolvePresets, entrance / scroll / hover / batch, destroy lifecycle).
- Banner Motion is the primary implementation reference (Hero subclass + layout mapping).
- Newsletter Motion informs mid-page scroll reveals and secondary batching.
- CTA remains a Hero subclass (appropriate for Hero-shell + centered CTA layouts).
- No standalone CTA GSAP entrance / hover timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing CTA toggles.
- Hero, Banner, Newsletter, Content, Media, Testimonials, and FAQ files untouched — compatibility preserved.
- CTA functionality (layouts, settings, analytics, keyboard) unchanged except additive motion hooks.
- Motion tone kept conversion-clear / subtle — no flashy button fills.

---

## 8. Verification Checklist

- [x] CTA Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Banner + Newsletter Motion used as implementation references
- [x] No files deleted or renamed
- [x] CTA not redesigned — motion integration only
- [x] No new merchant motion settings / schema changes
- [x] No Presentation Polish started
- [x] No duplicate GSAP loaders
- [x] No standalone `gsap.from` / `gsap.to` in CTA JS
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Section reveal / eyebrow / heading / text / buttons / cards / trust / media / overlay / decor
- [x] Reveal / stagger / layer sequencing / parallax / batch support
- [x] Hover via reusable presets + Engine `hover()` (CTA = soft/luxury lift)
- [x] Button reveal / card reveal merchant toggles preserved
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Banner / Newsletter compatibility preserved (files untouched)
- [x] JS syntax validated (`node --check` on `component-cta.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all CTA layouts, button/card reveal, hover, parallax, reduced motion) recommended

---

**Stop condition:** CTA Motion Framework (Phase 5.3.8) complete. Ready for the next Presentation Framework motion pass.
