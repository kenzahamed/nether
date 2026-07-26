# Nether Recovery Sprint 8 — Media Engine Recovery

**Date:** 2026-07-27  
**Status:** Complete — stop here (do not begin Sprint 9)  
**Scope:** Shared Media Engine — image/video rendering, ratios, lazy loading, fit/crop, focal position, deferred media

---

## 1. Executive Summary

Sprint 8 recovered Nether’s **shared Media Engine** by introducing a canonical media CSS module and shared Liquid helpers, then wiring Hero, Banner/Content/CTA adapters, Media, Product, and Collection renderers onto one contract.

Primary wins:

- Added **`component-media-engine.css`** (fit/crop tokens, object-position, fill primitives, ratio CLS guard, background-video rules)
- Added shared Liquid helpers: **`nether-media-ratio`**, **`nether-media-loading`**, **`nether-media-picture`**, **`nether-media-video`**
- Removed duplicated picture / deferred-video / ratio logic across Media, Product, Collection, Hero, and Content snippets
- Fixed **boolean `loading: true`** attrs (invalid HTML) → normalized `'lazy' | 'eager'`
- Fixed Product / Collection **broken deferred-media** (inline `video_tag` without poster+template)
- Added **Shopify focal-point** → `--nether-media-object-position` / inline `object-position`
- Bound Hero / Product / Collection / Media CSS `object-fit` to shared tokens (no visual redesign)

No layout redesign. No typography work. No animation work. Sprint 9 not started.

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| No shared Media Engine module | Picture, video, ratio, and loading logic reimplemented per framework |
| `loading: is_lazy` (boolean) on `image_tag` | Invalid `loading="true"` — browsers ignore; lazy-load unreliable |
| Product / Collection put `video_tag` inside `<deferred-media>` | Video loaded immediately; Dawn deferred poster contract broken |
| Hero images omitted `loading` | Inconsistent LCP / below-fold loading priorities across adapters |
| Ratio math copied 3× (Product / Collection / Media) | Drift risk for portrait / landscape / adapt contract |
| No shared fit / object-position tokens | Cropping & focal points could not be standardized |
| Framework `object-fit: cover` literals | Parallel crop behavior with no single override point |

---

## 3. Shared Media Systems Improved

| System area | Improvement |
|---|---|
| Ratio contract | Shared `nether-media-ratio` — portrait 0.8 · landscape 1.4 · square 1 · adapt |
| Loading / fetchpriority | Shared `nether-media-loading` — `'lazy'\|'eager'`; `fetchpriority=high` forces eager |
| Responsive picture | Shared `nether-media-picture` — desktop + mobile `<source>`, card/hero/content presets |
| Video engine | Shared `nether-media-video` — deferred (poster+template) + background (muted autoplay) |
| Fit / crop tokens | `--nether-media-fit`, `--nether-media-object-position` |
| Focal points | `image.presentation.focal_point` wired into CSS var + img style |
| CLS | Ratio containers + reserved `--ratio-percent` space before paint |
| Background video | Decorative pointer-events none; Shopify + YouTube/Vimeo paths |

### Verification checklist

| Capability | Status |
|---|---|
| Images | ✓ |
| Background images (hero-shell adapters) | ✓ |
| Videos (deferred) | ✓ |
| Shopify-hosted videos | ✓ |
| External videos (YouTube / Vimeo) | ✓ |
| Responsive images (`<picture>`) | ✓ |
| Aspect ratios | ✓ |
| Lazy loading | ✓ |
| Fetch priority / LCP eager | ✓ |
| No CLS (ratio reserve) | ✓ |

---

## 4. Files Modified

### Created
- `assets/component-media-engine.css`
- `snippets/nether-media-ratio.liquid`
- `snippets/nether-media-loading.liquid`
- `snippets/nether-media-picture.liquid`
- `snippets/nether-media-video.liquid`
- `SPRINT8_MEDIA_ENGINE_RECOVERY_REPORT.md` (this file)
- `theme-check-sprint8-media.json` (Theme Check artifact)
- `.nether-analysis/_sprint8_verify.js`
- `.nether-analysis/_sprint8_verify.json`

### Modified — global load
- `layout/theme.liquid`
- `layout/password.liquid`

### Modified — shared consumers (Liquid)
- `snippets/nether-media-render.liquid`
- `snippets/nether-hero-media.liquid`
- `snippets/nether-product-media.liquid`
- `snippets/nether-collection-media.liquid`
- `snippets/nether-content-image.liquid`
- `snippets/nether-content-video.liquid`
- `snippets/nether-product-promotional-card.liquid`

### Modified — token binding (CSS, no redesign)
- `assets/component-hero.css`
- `assets/component-product-showcase.css`
- `assets/component-collection-showcase.css`
- `assets/component-media.css`

**Not deleted. Not renamed.**

---

## 5. Frameworks Improved

| Framework | Media improvements |
|---|---|
| Hero (+ Banner / CTA / Newsletter / FAQ / Testimonials / Content adapters) | Shared picture/video/loading; focal point; eager when `fetchpriority=high` |
| Media gallery | Shared ratio/picture/video; deferred + background paths |
| Product showcase | Shared media; **fixed deferred video**; secondary hover image preserved |
| Collection showcase | Shared media; **fixed deferred video** |
| Content | Inline image/video use shared engine |
| Product promotional card | Normalized loading attr |

---

## 6. Verification

| Check | Result |
|---|---|
| Static Sprint 8 verify script | **54/54 passed**, 0 failures |
| Theme Check (Sprint 8 media files) | **0 errors / 0 warnings** on new/modified media engine files |
| Theme Check (repo baseline) | Pre-existing unrelated offenses remain (commerce/footer/etc.) — not introduced by Sprint 8 |
| Responsive picture breakpoints | Mobile source at `max-width: 749px` (parity with Responsive System) |
| Theme Editor | Deferred-media poster + `shopify:section:load` paths preserved in `component-media.js` |

---

## 7. Regression Results

| Sprint / system | Status |
|---|---|
| Sprint 1–4 merchant controls / bindings | Preserved — media settings still dual-read (`nether_image_ratio` / `image_ratio`) |
| Sprint 5 Responsive | Breakpoints unchanged (749 / 750 / 990) |
| Sprint 6 Layout Engine | Untouched |
| Sprint 7 Positioning Engine | Untouched — content position remains separate from media crop position |
| Nether Motion / GSAP | Untouched — media motion selectors still match |
| Premium Button / Card / Typography / Icon / Badge / Form / Shadow / Radius / Glass / Gradient | Untouched |

---

## 8. Remaining Media Risks

| Risk | Notes |
|---|---|
| `nether-content-row` still has local picture markup | Lower traffic path; can migrate to `nether-media-picture` later |
| Dawn product gallery (`product-media*`) | Intentionally out of scope — PDP Dawn path, not Nether showcase Media Engine |
| Before/after images | Still local markup in `nether-media-before-after` (already correct `loading: 'lazy'`) |
| External background iframes | Still autoplay-on-load (by design for BG video); deferred mode remains poster-gated |
| Merchant `media_fit` on PDP | Product-page Dawn setting; showcase cards default to cover via token |

---

## 9. Sprint 8 Completion Status

**COMPLETE.**

Stop after Sprint 8.  
Do **not** begin Sprint 9.
