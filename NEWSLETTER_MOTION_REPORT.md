# Nether Newsletter Motion Framework — Implementation Report

**Phase:** 5.3.7  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation references:** Banner Motion (5.3.2), Content Motion (5.3.3), Media Motion (5.3.4), Testimonials Motion (5.3.5), FAQ Motion (5.3.6)

---

## 1. Summary

The Nether Newsletter & Lead Generation Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Banner Motion implementation pattern** (Hero subclass).

All Newsletter animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Prior standalone `gsap.from` timelines in `component-newsletter-showcase.js` were replaced with preset consumption (`NetherMotion.animate` / `hover` / `scroll` / `timelines.batch`). Newsletter continues to extend `NetherHero`, registers its own motion host (`nether-newsletter`), and maps Newsletter layouts onto existing library presets.

Layouts mapped: editorial newsletter, centered signup, split, image with signup, background image/video, minimal, magazine, VIP membership, early access / waitlist — plus glass / luxury / editorial timing via global Motion style + existing Newsletter animation / form reveal / hover / parallax settings.

Form motion communicates **confidence and clarity**: wrap → fields → submit sequencing, subtle input focus, soft submit press (`commerce-add-to-cart`), and success fade-scale — without distracting effects or changing Shopify form submission.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Dawn customer form behavior, keyboard focus, and Theme Editor lifecycle are preserved.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| Newsletter host registration | `NetherMotion.register('nether-newsletter', …)` |
| Content (fade) | `minimal-reveal` |
| Content (slide) | `fade-up` |
| Content (scale) | `fade-scale` |
| Content (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `hover-luxury-lift`, `media-ken-burns` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Intro / subheading / text | Layout + style content preset |
| CTA buttons (outside form) | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| Newsletter form wrap | `fade-up` / `minimal-reveal` / `editorial-reveal` / `fade-scale` / `luxury-reveal` |
| Email / name / consent fields | `fade-up` (subtle y override) |
| Submit button reveal | `text-cta-reveal` |
| Submit press feedback | `commerce-add-to-cart` |
| Input focus | `hover-soft-lift` / `hover-luxury-lift` (soft y/scale override) |
| Success state | `fade-scale` / `commerce-badge-reveal` (waitlist) |
| Privacy note | `minimal-reveal` |
| Trust content | `commerce-trust-reveal` + optional hover lift (merchant toggle) |
| Statistics | `stagger-stats` |
| Countdown slot | `commerce-badge-reveal` |
| Background media | `media-image-reveal` / `clip-reveal` / `media-video-reveal` |
| Overlay | `minimal-reveal` |
| Decorative elements / dividers | `fade-scale` + `scroll-floating` / `minimal-reveal` |
| Background parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Soft editorial / magazine parallax | `scroll.parallax` (when media parallax off) |
| Glass / VIP panel | Inherited `hover-glass` / `hover-luxury-lift` (Hero + resolvePresets) |
| Viewport batching | Hero batch + Newsletter secondary trust / stats / privacy batch |
| Timeline sequencing | `timelines.batch` for media + overlay + dividers |

---

## 3. New Presets Created

None.

Every Newsletter motion need was satisfied by the existing Motion Preset Library. Form focus / press reuse `hover-soft-lift` / `hover-luxury-lift` and `commerce-add-to-cart` with scoped overrides — no Newsletter-only presets.

---

## 4. Files Modified

| File | Change |
|---|---|
| `assets/component-newsletter-showcase.js` | Full Newsletter Motion 2.0 integration — host registration, layout/style preset mapping, entrance sequencing, form reveal / focus / submit / success, scroll layers, hover, viewport batch, Theme Editor lifecycle; removed standalone GSAP |
| `assets/component-newsletter-showcase.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for Newsletter targets |
| `sections/nether-newsletter.liquid` | Motion DOM hooks: layout attrs, overlay attrs, floating flag, expanded ScrollTrigger plugin hint, centered body content hooks |
| `snippets/nether-newsletter-content.liquid` | `data-nether-hero-panel` / `data-nether-newsletter-panel` |
| `snippets/nether-newsletter-block.liquid` | Role hooks (eyebrow, heading, text, buttons, stats, divider, etc.) |
| `snippets/nether-newsletter-form.liquid` | Form / field / submit / privacy / success role hooks |
| `snippets/nether-newsletter-countdown.liquid` | Countdown role hook |
| `snippets/nether-newsletter-divider.liquid` | Divider motion role hooks |

**Not modified:** `component-hero.js`, `component-banner.js`, `component-content.js`, `component-media.js`, `component-testimonials.js`, `component-faq.js`, Motion Engine, Preset Library, merchant schema settings, Newsletter layout CSS structure.

**Not deleted or renamed:** any existing files.

**Created:** `NEWSLETTER_MOTION_REPORT.md` (this report)

---

## 5. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-newsletter` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, form reveal, decorative shapes, and primary Newsletter layouts.
- Entrance / hover / focus / press use transforms/opacity (GPU-friendly); Engine `sanitizeVars` still applies.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Form focus / submit listeners are destroyed on section unload and Theme Editor reload.
- Entrance overlays/dividers composed via `timelines.batch` when present.
- Tall sections use `scroll.batch` for secondary chrome (trust / stats / privacy / countdown).
- Nested field/button reveals skipped from content stagger when form reveal is enabled (avoids nested opacity fights).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Luxury Ken Burns only when parallax is off and media is imagery.
- Soft focus / press durations kept short for clarity without distraction.

---

## 6. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (Newsletter CSS).
- Shopify customer form markup and submission unchanged — no `preventDefault` on submit.
- Submit press uses `pointerdown` feedback only; form still posts normally.
- Input focus motion respects keyboard focus (`focusin` / `focusout`).
- Hover uses Engine `hover()` with focus kept on submit / outer buttons; trust items use `focus: false`.
- Panel / media hover remain from Hero (`focus: false` where inappropriate).
- Success state retains `role="status"`, `aria-live="polite"`, and `tabindex="-1"`.
- Semantic Newsletter markup unchanged (`role="region"`, form labels, field grouping).
- No new Theme Editor motion settings — global Motion Engine + existing Newsletter animation / form reveal / hover / parallax controls only.

---

## 7. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherNewsletter.resolvePresets()  ← Hero pattern + Newsletter layouts + form / glass / floating
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover | form focus/press listeners
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (host registration, resolvePresets, entrance / scroll / hover / batch, destroy lifecycle).
- Banner Motion is the primary implementation reference (Hero subclass + layout mapping).
- Content / Media / Testimonials / FAQ Motion inform mid-page scroll reveals and refined tone.
- Newsletter remains a Hero subclass (appropriate for Hero-shell layouts + centered signup).
- No standalone Newsletter GSAP entrance / hover timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing Newsletter toggles.
- Hero, Banner, Content, Media, Testimonials, and FAQ files untouched — compatibility preserved.
- Newsletter functionality (layouts, settings, Shopify form, keyboard) unchanged except additive motion hooks.
- Motion tone kept confident / clear / subtle.

---

## 8. Verification Checklist

- [x] Newsletter Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Banner + Content + Media + Testimonials + FAQ Motion used as implementation references
- [x] No files deleted or renamed
- [x] Newsletter not redesigned — motion integration only
- [x] No new merchant motion settings / schema changes
- [x] No Presentation Polish started
- [x] No duplicate GSAP loaders
- [x] No standalone `gsap.from` / `gsap.to` in Newsletter showcase JS
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Section reveal / eyebrow / heading / intro / form / input / submit / success / trust / media / decor
- [x] Form reveal / input focus / submit interaction / success feedback
- [x] Reveal / stagger / layer sequencing / parallax / batch support
- [x] Hover via reusable presets + Engine `hover()`
- [x] Shopify form submission preserved (no preventDefault)
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Banner compatibility preserved (Banner files untouched)
- [x] Content / Media / Testimonials / FAQ compatibility preserved (files untouched)
- [x] JS syntax validated (`node --check` on `component-newsletter-showcase.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all Newsletter layouts, form submit/success, focus, hover, parallax, reduced motion) recommended

---

**Stop condition:** Newsletter Motion Framework (Phase 5.3.7) complete. Ready for the next Presentation Framework motion pass.
