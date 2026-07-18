# Nether GSAP Architecture Cleanup — Report

**Date:** Phase 1 → Phase 2 transition  
**Scope:** GSAP loading, initialization, lifecycle, Dawn conflict resolution  
**Constraint:** Refactor only — no animation features removed, no visual redesign

---

## 1. Summary

The Nether GSAP architecture has been consolidated into a single **Nether Motion** foundation layer. All GSAP usage now flows through one version (`3.12.7`), one deferred loading pipeline, and a shared lifecycle API prepared for future Motion Library development.

### Before

- GSAP + ScrollTrigger loaded **parser-blocking on every page** via `layout/theme.liquid`
- `video-scroll-scrub.liquid` **duplicated** the same CDN scripts
- Version split: **3.12.7** (theme/scrub) vs **3.12.5** (animated-continuous, caterpillar fallbacks)
- Three independent `loadScript()` implementations across sections
- Dawn + GSAP **dual-animation conflicts** in `image-banner` and `featured-collection`
- Caterpillar slider: no cleanup on section unload, no reduced-motion support
- `custom-animations.js`: no scoped re-init, no ScrollTrigger cleanup in Theme Editor
- Theme Check: **ParserBlockingScript** and **RemoteAsset** errors on GSAP CDN tags

### After

- **Conditional deferred loading** — GSAP loads only when the page contains `fx-*` utilities or motion sections
- **Single loader** — `assets/nether-motion.js` manages core + plugin loading with deduplicated promises
- **One GSAP version** — `3.12.7` everywhere
- **Scoped lifecycle** — section init/destroy, `data-fx-init` guards, ScrollTrigger/tween cleanup
- **Dawn conflicts resolved** — animation ownership separated between Dawn and GSAP per element
- Theme Check: **0 errors** — parser-blocking GSAP tags eliminated from Liquid

### Confirmation

| Requirement | Status |
|---|---|
| No animation features removed | ✅ |
| Existing visual behavior preserved | ✅ |
| Framework ready for Motion Library | ✅ |

---

## 2. Files Modified

| File | Change |
|---|---|
| `assets/nether-motion.js` | **New** — centralized GSAP loader, version pin, plugin registry, section lifecycle API |
| `assets/custom-animations.js` | Refactored — scoped init, cleanup, conditional plugin loading, `NetherMotion.Fx` API |
| `layout/theme.liquid` | Replaced parser-blocking CDN tags with deferred `nether-motion.js` + `custom-animations.js` |
| `sections/video-scroll-scrub.liquid` | Removed duplicate CDN scripts; uses `NetherMotion.load()`; debug logs gated |
| `sections/gsap-caterpillar-slider.liquid` | Uses `NetherMotion.load(['flip'])`; cleanup + reduced-motion + Theme Editor support |
| `sections/animated-continuous-section.liquid` | Removed local loader; uses `NetherMotion.load(['observer'])`; standardized version |
| `sections/image-banner.liquid` | Resolved Dawn/GSAP conflict on heading |
| `sections/featured-collection.liquid` | Resolved Dawn/GSAP conflict on product grid items |

### Files reviewed, not modified

| File | Reason |
|---|---|
| `sections/marquee-banner.liquid` | Uses `fx-marquee` via `custom-animations.js` — no section-level GSAP loading needed. CSS replacement documented as recommendation only. |

---

## 3. Duplicate Code Removed

| Duplicate | Locations (before) | Resolution |
|---|---|---|
| GSAP core CDN `<script>` | `theme.liquid`, `video-scroll-scrub.liquid` | Removed from both; single loader in `nether-motion.js` |
| ScrollTrigger CDN `<script>` | `theme.liquid`, `video-scroll-scrub.liquid` | Removed from both; loaded via `NetherMotion.load(['scrollTrigger'])` |
| `loadScript()` utility | `animated-continuous-section.liquid` (full), `gsap-caterpillar-slider.liquid` (partial) | Replaced by `NetherMotion.load()` |
| GSAP 3.12.5 fallback URLs | `animated-continuous-section.liquid`, `gsap-caterpillar-slider.liquid` | Removed; standardized on 3.12.7 |
| Triple `gsap.registerPlugin(Flip)` | `gsap-caterpillar-slider.liquid` | Single registration via loader |
| Duplicate `gsap.registerPlugin(ScrollTrigger)` | `video-scroll-scrub.liquid` | Removed; handled by loader |
| Unused `scrub_factor` Liquid assign | `video-scroll-scrub.liquid` | Removed (setting preserved in schema for future wiring) |
| Dawn `scroll-trigger` on grid `<li>` children | `featured-collection.liquid` | Removed — `fx-stagger-list` owns child animation |
| Dawn `scroll-trigger` on `banner__content` parent | `image-banner.liquid` | Removed — `fx-fade-up` owns heading; Dawn applied to sibling blocks |

---

## 4. GSAP Version Standardization

| Component | Version (before) | Version (after) |
|---|---|---|
| `theme.liquid` | 3.12.7 | — (no direct CDN) |
| `video-scroll-scrub.liquid` | 3.12.7 (duplicate) | 3.12.7 via loader |
| `animated-continuous-section.liquid` | 3.12.5 fallback | 3.12.7 via loader |
| `gsap-caterpillar-slider.liquid` | 3.12.5 Flip fallback | 3.12.7 via loader |
| `nether-motion.js` | — | **3.12.7** (single source of truth) |

**Canonical CDN base:**

```
https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/
```

**Plugins loaded on demand:**

| Plugin | Loaded when |
|---|---|
| `ScrollTrigger` | `fx-*` scroll utilities or canvas scroll scrub present |
| `Flip` | Caterpillar slider section present |
| `Observer` | Animated continuous section present |
| Core only | `fx-marquee` only (no ScrollTrigger needed) |

---

## 5. Loading Improvements

### Strategy

```
Page load
  → nether-motion.js (defer)
  → DOMContentLoaded
  → needsMotion() scan (fx-* classes, motion sections, data-nether-motion)
  → if false: GSAP never loads (~80KB saved)
  → if true: load core + required plugins only (deferred, deduplicated)
  → custom-animations.js initializes fx-* within scope
```

### Detection selectors

- **fx utilities:** `.fx-fade-in`, `.fx-fade-up`, `.fx-stagger-list`, `.fx-marquee`, etc.
- **Motion sections:** `.section-canvas-scroll-scrub`, `.section-gsap-caterpillar-slider`, `.section-animated-continuous`, `.section-marquee-banner`
- **Explicit markers:** `[data-nether-motion]`, `[data-nether-motion-plugins="scrollTrigger,flip,observer"]`

### Script order in `theme.liquid`

```liquid
<script src="{{ 'nether-motion.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'custom-animations.js' | asset_url }}" defer="defer"></script>
```

Both scripts use `defer` — no parser-blocking GSAP in Liquid markup.

---

## 6. Performance Improvements

| Improvement | Impact |
|---|---|
| Conditional GSAP loading | Pages without motion features skip ~80KB+ of JS |
| Plugin-level granularity | Marquee-only pages load core GSAP without ScrollTrigger |
| Deduplicated load promises | Multiple sections calling `NetherMotion.load()` share one network fetch |
| Removed duplicate CDN fetches | Canvas scroll scrub no longer re-downloads GSAP |
| `data-fx-init` guards | Prevents duplicate ScrollTrigger instances on Theme Editor reload |
| Section-scoped cleanup | Kills orphaned ScrollTriggers and marquee tweens on section unload |
| Debug logging gated | `video-scroll-scrub` console output disabled in production (`DEBUG = false`) |
| Deferred script injection | All CDN scripts injected with `defer` attribute via loader |

---

## 7. Accessibility Improvements

| Feature | Implementation |
|---|---|
| `prefers-reduced-motion` | `custom-animations.js` — instant reveal, no ScrollTrigger created |
| `prefers-reduced-motion` | `video-scroll-scrub` — static first frame + visible overlays (unchanged) |
| `prefers-reduced-motion` | `animated-continuous-section` — first slide visible, no Observer (unchanged) |
| `prefers-reduced-motion` | `gsap-caterpillar-slider` — **new** instant slide navigation without Flip animation; keyboard buttons remain functional |
| `aria-label` on split text | Preserved in `fx-text-reveal` and animated-continuous heading splits |
| `aria-hidden` on marquee clones | Preserved in `fx-marquee` clone logic |
| Keyboard navigation | Caterpillar prev/next buttons remain accessible in all motion modes |

---

## 8. Theme Editor Compatibility

| Component | `section:load` | `section:unload` | `section:reorder` |
|---|---|---|---|
| `nether-motion.js` | Loads plugins for new section; dispatches `nether:motion:ready` | Calls registered `destroy` handlers | `ScrollTrigger.refresh()` |
| `custom-animations.js` | `NetherMotion.Fx.boot(section)` — scoped init | `NetherMotion.Fx.cleanup(section)` — kills triggers/tweens | — |
| `video-scroll-scrub` | `boot()` → destroy + re-init | `destroyInstances()` | — |
| `gsap-caterpillar-slider` | `boot()` via `registerSection` + event | `destroyCaterpillarSlider()` — removes listeners, kills tweens | — |
| `animated-continuous-section` | `boot()` via `registerSection` + event | `observerInstance.kill()` | — |

### Motion Library foundation API

```javascript
// Load plugins (deduplicated)
NetherMotion.load(['scrollTrigger', 'flip', 'observer']);

// Check if scope needs motion
NetherMotion.needsMotion(element);

// Get required plugins for a DOM scope
NetherMotion.getRequiredPlugins(element);

// Register section lifecycle (for future Motion Library modules)
NetherMotion.registerSection(sectionId, { init, destroy });

// fx utility API
NetherMotion.Fx.init(root);
NetherMotion.Fx.cleanup(root);
NetherMotion.Fx.hasElements(root);
NetherMotion.Fx.boot(root);
```

---

## 9. Remaining Recommendations

### Marquee Banner — CSS alternative (not implemented)

The `fx-marquee` utility uses GSAP `repeat: -1` tweening. A CSS `@keyframes` marquee could replace GSAP for this single use case, reducing core GSAP load on marquee-only pages. **Not replaced** per task scope — behavior preserved.

**Recommendation for Phase 2:** Evaluate `animation: marquee-scroll` with `transform: translateX()` and duplicated content — test seamless loop timing against `data-fx-duration`.

### `scrub_smoothing` setting

The Theme Editor setting remains in `video-scroll-scrub` schema but is not wired to ScrollTrigger `scrub` value. **Recommendation:** Wire to `scrub: {{ section.settings.scrub_smoothing }}` in a future enhancement (default `2.5` preserves current `scrub: true` feel).

### Local GSAP assets

CDN scripts trigger Theme Check `RemoteAsset` info when referenced in Liquid. Current loader injects scripts via JavaScript (no Liquid CDN tags). **Recommendation for production hardening:** Vendor GSAP 3.12.7 + plugins into `assets/` and update `nether-motion.js` URLs to Shopify CDN.

### Text splitting deduplication

`custom-animations.js` (`initTextReveal`) and `animated-continuous-section.liquid` (`splitHeadingIntoChars`) share ~80% logic. **Recommendation for Motion Library:** Extract shared `NetherMotion.splitText()` utility.

### GSAP sections not in templates

`video-scroll-scrub`, `animated-continuous`, `gsap-caterpillar-slider`, and `marquee-banner` exist as presets only. No template JSON changes needed for this cleanup.

### Dawn animation on `image-banner` text/buttons

Dawn `scroll-trigger` was moved from the parent `banner__content` wrapper to individual `text` and `buttons` blocks. The heading uses GSAP `fx-fade-up` exclusively. Text and buttons retain Dawn entrance animation — visually similar to the previous parent-slide behavior.

---

## 10. Verification Checklist

### Architecture

- [x] Single GSAP version (3.12.7) across framework
- [x] No duplicate GSAP CDN tags in Liquid files
- [x] Conditional deferred loading via `nether-motion.js`
- [x] Plugin loading granular (core / ScrollTrigger / Flip / Observer)
- [x] Motion Library foundation API exposed on `window.NetherMotion`

### Features preserved

- [x] All `fx-*` utility classes functional
- [x] Canvas scroll scrub section functional
- [x] GSAP caterpillar slider functional
- [x] Animated continuous section functional
- [x] Marquee banner functional

### Conflicts resolved

- [x] `image-banner` — heading no longer double-animated by Dawn parent + GSAP child
- [x] `featured-collection` — grid items no longer double-animated by Dawn per-item + GSAP stagger

### Performance

- [x] GSAP skipped on pages without motion features
- [x] ScrollTrigger skipped when only `fx-marquee` present
- [x] No duplicate script loaders in sections
- [x] Section unload cleans up listeners and tweens

### Accessibility

- [x] `prefers-reduced-motion` respected across all motion components
- [x] Caterpillar slider keyboard navigation works in reduced-motion mode
- [x] ARIA attributes preserved on animated text

### Theme Check

- [x] `shopify theme check` — **0 errors**
- [x] ParserBlockingScript errors for GSAP — **resolved**
- [x] RemoteAsset errors for GSAP in Liquid — **resolved**
- [x] Pre-existing Dawn warnings unchanged (not introduced by this cleanup)

### Theme Editor

- [x] Section load re-initializes motion features
- [x] Section unload destroys ScrollTriggers, Observers, listeners, tweens
- [x] Section reorder triggers `ScrollTrigger.refresh()`
- [x] Duplicate initialization prevented via `data-fx-init` and destroy-before-init pattern

---

## Confirmation

- **No animation features were removed.**
- **Existing visual behavior was preserved** (conflict fixes separate animation ownership without eliminating effects).
- **Framework is ready for future Motion Library development** via `NetherMotion` namespace, plugin loader, section registry, and `NetherMotion.Fx` utility API.

---

*Nether GSAP Architecture Cleanup — Phase 1 complete. Ready for Phase 2 Motion Library.*
