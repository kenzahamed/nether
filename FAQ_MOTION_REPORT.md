# Nether FAQ Motion Framework — Implementation Report

**Phase:** 5.3.6  
**Date:** 2026-07-14  
**Status:** Complete  
**Reference architecture:** Hero Motion Framework (Phase 5.1)  
**Implementation references:** Banner Motion (5.3.2), Content Motion (5.3.3), Media Motion (5.3.4), Testimonials Motion (5.3.5)

---

## 1. Summary

The Nether FAQ & Knowledge Framework is now a **first-class Presentation Framework** for premium motion, following the **Hero Motion standard** and the **Banner / Content / Media / Testimonials Motion implementation pattern**.

FAQ is a **standalone** knowledge host (`nether-faq`) — it does not extend `NetherHero` because its DOM is a multi-item accordion / category surface rather than a single Hero shell. All FAQ animations route through **NetherMotion Engine 2.0** and the **Motion Preset Library**. Standalone GSAP timelines previously in `component-faq.js` were replaced with preset consumption + Engine `AnimationRegistry` for accordion expand/collapse height and caret rotation.

Layouts mapped: editorial FAQ, classic accordion, two-column, categorized, help center, knowledge base, minimal, magazine, product FAQ, support center — plus glass / luxury / editorial timing via global Motion style + existing FAQ animation / card settings.

Motion intent is **quick, refined, and responsive** (soft reveals, measured staggers, subtle hover, snappy accordion) rather than excessive.

No layouts were redesigned. No merchant settings were added or changed. No Presentation Polish was started. Dawn `details`/`summary` accordion behavior, search, expand/collapse controls, keyboard navigation, and aria-expanded sync are preserved.

---

## 2. Motion Presets Used

| Layer / element | Preset(s) |
|---|---|
| FAQ host registration | `NetherMotion.register('nether-faq', …)` |
| Header (fade) | `minimal-reveal` |
| Header (slide) | `fade-up` |
| Header (scale) | `fade-scale` |
| Header (stagger) | `stagger-features` |
| Global luxury style | `luxury-reveal`, `text-luxury-heading`, `hover-luxury-lift` |
| Global editorial style | `editorial-reveal`, `text-heading-reveal`, `clip-reveal` |
| Eyebrow | `fade-up` / `minimal-reveal` |
| Heading | `text-heading-reveal` / `text-luxury-heading` |
| Intro / subheading / text | Layout + style content preset |
| CTA buttons | `text-cta-reveal` + hover `hover-soft-lift` / `hover-luxury-lift` |
| FAQ items / accordion rows | `stagger-list` / `stagger-cards` / `stagger-grid` / `minimal-reveal` |
| FAQ groups / category headings | `stagger-features` / `fade-left` / `fade-up` |
| Questions | `fade-up` (role mapping; items carry primary stagger) |
| Answers (entrance context) | `minimal-reveal` / `fade-up` (`accordion_reveal`) |
| Icons (shell / header) | `fade-scale` + hover `hover-icon-slide` |
| Dividers / overlay | `minimal-reveal` |
| Background media | `media-image-reveal` / `clip-reveal` / `media-video-reveal` |
| Background parallax | `NetherMotion.scroll.parallax` (merchant toggle) |
| Soft editorial header parallax | `scroll.parallax` (editorial / magazine when media parallax off) |
| Nav links | `minimal-reveal` / `fade-up` + hover `hover-soft-lift` |
| Search / expand controls | `minimal-reveal` / content preset |
| Magazine featured | `fade-up` + secondary `stagger-list` / `stagger-cards` |
| Glass panels | `hover-glass` / `hover-luxury-lift` |
| FAQ items hover | `hover-soft-lift` / `hover-luxury-lift` |
| Viewport batching | `scroll.batch` for tall help / category sections |
| Timeline sequencing | `timelines.batch` for overlay + divider entrance |
| Accordion expand / collapse / caret | Engine `animations.add` (height + opacity + rotation; preserves existing behavior) |

---

## 3. New Presets Created

None.

Every FAQ motion need was satisfied by the existing Motion Preset Library. Accordion expand / collapse height transitions and caret rotation remain scoped Engine-registered animations (interactive state, not entrance presets) so existing merchant accordion behavior is preserved without a new preset.

---

## 4. Files Modified

| File | Change |
|---|---|
| `assets/component-faq.js` | Full FAQ Motion 2.0 integration — host registration, layout/style preset mapping, entrance sequencing, scroll layers, hover, viewport batch, layer sequencing, accordion expand/collapse/caret via AnimationRegistry, Theme Editor lifecycle; search / expand-all / aria preserved |
| `assets/component-faq.css` | Additive motion pending/ready hooks; reduced-motion guards; will-change for FAQ targets; caret CSS fight guard while motion owns rotation |
| `sections/nether-faq.liquid` | Motion DOM hooks: card-style attr, expanded ScrollTrigger plugin hint, overlay attr |
| `snippets/nether-faq-content.liquid` | `data-nether-faq-header` + `data-nether-faq-content-panel` |
| `snippets/nether-faq-shell.liquid` | `data-nether-faq-content-panel` on panel |
| `snippets/nether-faq-block.liquid` | `data-nether-faq-role` on header/content blocks |
| `snippets/nether-faq-item.liquid` | Item / question / answer / icon / caret role hooks |
| `snippets/nether-faq-category.liquid` | Category / group role hooks |
| `snippets/nether-faq-divider.liquid` | Divider motion role hooks |

**Not modified:** `component-hero.js`, `component-banner.js`, `component-content.js`, `component-media.js`, `component-testimonials.js`, Motion Engine, Preset Library, merchant schema settings, FAQ layout CSS structure, Dawn accordion base styles.

**Not deleted or renamed:** any existing files.

---

## 5. Performance Notes

- GSAP continues to lazy-load via `NetherMotion.whenReady` (`nether-faq` already in `SECTION_SELECTORS`).
- ScrollTrigger loads on demand for parallax, stagger / accordion / category reveal, editorial / magazine / categorized / help layouts, and tall lists.
- Entrance / hover / scroll use transforms/opacity (GPU-friendly); Engine `sanitizeVars` still applies.
- Accordion height is intentional for expand (cleared via `clearProps: 'height'` after expand) — collapse remains a short opacity fade so native `details` close is not fought.
- Animations scoped + registered; `NetherMotion.destroy(this)` cleans tweens, timelines, ScrollTriggers, IO, and hover binds.
- Accordion tweens registered via `NetherMotion.animations.add` with DOM targets so `killWithin` cleans them up.
- Entrance overlays/dividers composed via `timelines.batch` when present.
- Tall sections use `scroll.batch` for secondary chrome (callouts / sidebar).
- Per-item scroll reveals used for editorial / categorized / help / knowledge / large lists (>8) to avoid one heavy entrance burst.
- Nested question/answer interior entrance reveals avoided on list items (items carry primary stagger).
- `will-change` applied only while `data-nether-motion-ready='true'`.
- Soft parallax uses modest speeds; accordion durations capped for a quick, responsive feel.

---

## 6. Accessibility Notes

- `prefers-reduced-motion` / merchant force-reduced / viewport gates via `NetherMotion.prefersReducedMotion()` and preset `reducedMotion` metadata.
- Pending opacity hide forced visible under `prefers-reduced-motion: reduce` (FAQ CSS).
- Native `<details>`/`<summary>` accordion logic unchanged; `aria-expanded` continues to sync on toggle.
- Hover uses Engine `hover()` (`pointerenter`/`pointerleave` + focus where appropriate).
- Item / icon / panel hover disables focus binding where inappropriate (`focus: false`).
- Nav / control / button hover keeps focusable hover for keyboard users.
- Search focus management and related-question scroll/open behavior preserved.
- Semantic FAQ markup unchanged (`role="region"`, answer regions, category nav).
- No new Theme Editor motion settings — global Motion Engine + existing FAQ animation / parallax controls only.
- Under reduced motion, CSS caret rotation remains available as the open-state indicator.

---

## 7. Motion Architecture Review

```
Theme settings (style / intensity / speed / reduced)
        ↓
  nether-motion-config → NetherMotion.getSettings()
        ↓
  NetherFaq.resolvePresets()  ← Hero pattern + FAQ layouts + card_style + animation styles
        ↓
  NetherMotion.animate | timeline/batch | scroll.* | hover | animations.add (accordion)
        ↓
  Preset Library (existing presets only)
```

**Rules followed:**

- Hero Motion is the architectural reference (host registration, resolvePresets, entrance / scroll / hover / batch, destroy lifecycle).
- Banner + Content + Media + Testimonials Motion are the implementation references (layout mapping, Theme Editor load, additive DOM/CSS hooks).
- FAQ remains a standalone knowledge host (appropriate for accordion groups; not a Hero shell subclass).
- No standalone FAQ GSAP entrance timelines.
- No duplicate GSAP loaders.
- Existing presets reused throughout; zero new presets.
- Theme Editor control remains global Motion settings + existing FAQ animation / parallax controls.
- Hero, Banner, Content, Media, and Testimonials files untouched — compatibility preserved.
- FAQ functionality (layouts, settings, search, expand/collapse, keyboard, aria) unchanged except additive motion hooks.
- Motion tone kept quick / refined / responsive.

---

## 8. Verification Checklist

- [x] FAQ Framework reviewed before changes
- [x] Motion Engine 2.0 reviewed
- [x] Motion Preset Library reviewed
- [x] Hero Motion used as reference architecture
- [x] Banner + Content + Media + Testimonials Motion used as implementation references
- [x] No files deleted or renamed
- [x] FAQ not redesigned — motion integration only
- [x] No new merchant motion settings / schema changes
- [x] No Presentation Polish started
- [x] No duplicate GSAP loaders
- [x] Motion through NetherMotion throughout
- [x] Existing presets reused (none created)
- [x] Reveal / stagger / layer sequencing / parallax / batch / accordion support
- [x] Hover via reusable presets + Engine `hover()` (items, icons, nav, controls)
- [x] Accordion expand / collapse / caret rotation via Engine AnimationRegistry
- [x] Accordion logic / search / expand-all / aria / keyboard preserved
- [x] Reduced motion respected
- [x] Lazy GSAP + GPU transforms + cleanup
- [x] Hero compatibility preserved (Hero files untouched)
- [x] Banner compatibility preserved (Banner files untouched)
- [x] Content compatibility preserved (Content files untouched)
- [x] Media compatibility preserved (Media files untouched)
- [x] Testimonials compatibility preserved (Testimonials files untouched)
- [x] JS syntax validated (`node --check` on `component-faq.js`)
- [ ] Full Theme Check CLI — Liquid changes are additive data attributes only; run `shopify theme check` locally before deploy
- [ ] Visual QA in Theme Editor (load/unload/reorder, all FAQ layouts, accordion expand/collapse, search, category nav, parallax, hover, reduced motion) recommended

---

**Stop condition:** FAQ Motion Framework (Phase 5.3.6) complete. Ready for the next Presentation Framework motion pass.
