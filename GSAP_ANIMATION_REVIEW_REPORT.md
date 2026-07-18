# Nether GSAP Animation Review — Report

**Review date:** Phase 1 post-foundation audit  
**Scope:** All GSAP-related files, sections, and integrations  
**Constraint:** Read-only review — no files were modified or deleted

---

## 1. Summary

The Nether theme currently runs **two parallel animation architectures**:

1. **Dawn native animations** — `assets/animations.js` + CSS `scroll-trigger` / `animate--*` classes (Intersection Observer, no GSAP)
2. **GSAP layer** — global CDN scripts in `layout/theme.liquid`, `assets/custom-animations.js`, and three bespoke GSAP sections

There are **7 animation touchpoints** across **5 source files** (plus `layout/theme.liquid` wiring). The reusable utility layer (`custom-animations.js`) is a sound foundation, but global GSAP loading, duplicated CDN/script-loader patterns, and **dual-animation conflicts** with Dawn create unnecessary cost on every page load.

### Critical findings

| Severity | Finding |
|---|---|
| 🔴 High | GSAP + ScrollTrigger loaded **globally on every page** via parser-blocking CDN scripts |
| 🔴 High | `video-scroll-scrub.liquid` **re-loads the same CDN scripts** a second time |
| 🔴 High | **Dual animation conflict** in `featured-collection.liquid` and `image-banner.liquid` (Dawn + GSAP on same elements) |
| 🟠 Medium | GSAP version split: **3.12.7** (theme) vs **3.12.5** (section fallbacks) |
| 🟠 Medium | Duplicated **text-splitting logic** in `custom-animations.js` and `animated-continuous-section.liquid` |
| 🟠 Medium | Duplicated **dynamic script loader** patterns across sections |
| 🟡 Low | `scrub_smoothing` setting in video-scroll-scrub is **assigned but never used** |
| 🟡 Low | Production `console.log` debugging throughout video-scroll-scrub |
| 🟡 Low | Custom GSAP sections appear **unused in any JSON templates** (presets only) |

### Overall recommendation

| Action | Scope |
|---|---|
| **Keep** | `custom-animations.js` utility architecture (refactor delivery, not concept) |
| **Refactor** | All CDN loading, section-specific scripts, and Dawn/GSAP conflicts |
| **Remove (conditional)** | Global GSAP on all pages — replace with conditional/deferred loading |
| **Evaluate per project** | Bespoke sections (`video-scroll-scrub`, `animated-continuous`, `caterpillar`) — high value for hero pages, too heavy for global theme defaults |

---

## 2. Animation Inventory

### 2.1 Global infrastructure

| File | Role | GSAP plugins | Load scope |
|---|---|---|---|
| `layout/theme.liquid` (L416–419) | Loads GSAP 3.12.7 + ScrollTrigger from jsDelivr CDN; loads `custom-animations.js` | Core, ScrollTrigger | **Every page** |
| `assets/custom-animations.js` | Reusable `fx-*` utility classes | ScrollTrigger | **Every page** (when GSAP present) |
| `assets/animations.js` | Dawn native scroll animations (non-GSAP) | — | Every page (when `animations_reveal_on_scroll` enabled) |

### 2.2 GSAP utility classes (`custom-animations.js`)

| Class | Animation type | Scroll-linked | Reduced motion |
|---|---|---|---|
| `.fx-fade-in` | Opacity fade | ✅ ScrollTrigger | ✅ |
| `.fx-fade-up` | Fade + slide up | ✅ ScrollTrigger | ✅ |
| `.fx-fade-down` | Fade + slide down | ✅ ScrollTrigger | ✅ |
| `.fx-slide-left` | Fade + slide from left | ✅ ScrollTrigger | ✅ |
| `.fx-slide-right` | Fade + slide from right | ✅ ScrollTrigger | ✅ |
| `.fx-stagger-list` | Staggered children reveal | ✅ ScrollTrigger | ✅ |
| `.fx-zoom-in` | Scale + fade | ✅ ScrollTrigger | ✅ |
| `.fx-text-reveal` | Word/char split reveal | ✅ ScrollTrigger | ✅ |
| `.fx-parallax` | Scroll-scrubbed parallax | ✅ ScrollTrigger scrub | ❌ (not in early-return list; entire script exits before parallax if reduced motion — **safe**) |
| `.fx-marquee` | Infinite horizontal loop | ❌ Time-based | ✅ (script returns before init) |

### 2.3 Bespoke GSAP sections

| Section file | Animation | GSAP plugins | CDN strategy |
|---|---|---|---|
| `sections/video-scroll-scrub.liquid` | Canvas frame-sequence scroll scrub + overlay timeline | ScrollTrigger | **Inline duplicate** GSAP 3.12.7 + ScrollTrigger |
| `sections/animated-continuous-section.liquid` | Full-screen Observer-driven slide transitions + char split | Observer | Conditional load GSAP 3.12.5 + Observer 3.12.5 |
| `sections/gsap-caterpillar-slider.liquid` | Flip-based carousel reorder | Flip | Conditional load Flip 3.12.5 |
| `sections/marquee-banner.liquid` | Uses `.fx-marquee` from `custom-animations.js` | (inherits global) | No own JS |

### 2.4 Dawn + GSAP integration points

| File | GSAP classes added | Dawn animation classes on same tree | Conflict |
|---|---|---|---|
| `sections/image-banner.liquid` | `fx-fade-up` on heading | `scroll-trigger animate--slide-in` on parent `.banner__content` | 🔴 **Yes** |
| `sections/featured-collection.liquid` | `fx-stagger-list` on product grid `<ul>` | `scroll-trigger animate--slide-in` on each `<li>` child | 🔴 **Yes** |

### 2.5 Current usage in templates

No `templates/*.json` files reference `video-scroll-scrub`, `animated-continuous`, `gsap-caterpillar-slider`, or `marquee-banner`. These sections exist as **Theme Editor presets only** and are not deployed on any template in the repo.

`fx-*` classes are hardcoded in:
- `sections/image-banner.liquid` — `fx-fade-up`
- `sections/featured-collection.liquid` — `fx-stagger-list`

No frame assets (`ezgif-frame-*`) exist in the theme for `video-scroll-scrub`.

---

## 3. Files Reviewed

| File | Lines (approx.) | Reviewed |
|---|---|---|
| `layout/theme.liquid` | GSAP script tags | ✅ |
| `assets/custom-animations.js` | 287 | ✅ |
| `assets/animations.js` | 103 | ✅ (Dawn native — comparison baseline) |
| `sections/video-scroll-scrub.liquid` | 914 | ✅ |
| `sections/animated-continuous-section.liquid` | 404 | ✅ |
| `sections/gsap-caterpillar-slider.liquid` | 366 | ✅ |
| `sections/marquee-banner.liquid` | 80 | ✅ |
| `sections/image-banner.liquid` | GSAP integration | ✅ |
| `sections/featured-collection.liquid` | GSAP integration | ✅ |
| `config/settings_data.json` | `animations_reveal_on_scroll: true` | ✅ |
| `theme-check-out.txt` | ParserBlockingScript errors | ✅ |

**Files modified during this review:** None

---

## 4. Duplicates Identified

### 4.1 CDN / library loading

| Duplicate | Locations | Impact |
|---|---|---|
| GSAP core + ScrollTrigger CDN | `theme.liquid` + `video-scroll-scrub.liquid` | Double network fetch when scrub section present; parser-blocking both times |
| GSAP version mismatch | 3.12.7 (theme, scrub) vs 3.12.5 (animated-continuous fallback) | Inconsistent plugin behaviour if mixed |
| `gsap.registerPlugin(ScrollTrigger)` | `custom-animations.js`, `video-scroll-scrub.liquid` | Harmless but repeated |
| `gsap.registerPlugin(Flip)` | Called 3× in caterpillar init paths | Redundant calls |

### 4.2 Script loader utilities

Nearly identical `loadScript(src, marker)` Promise-based loader exists in:
- `animated-continuous-section.liquid` (full implementation)

Simpler variant in:
- `gsap-caterpillar-slider.liquid` (`ensureFlipAndInit`)

**Recommendation:** Extract to a shared `assets/gsap-loader.js` in a future refactor (not done in this review).

### 4.3 Text splitting logic

| Function | File | Approach |
|---|---|---|
| `initTextReveal()` | `custom-animations.js` | Splits words/chars into masked `<span>` elements, `aria-label` on parent |
| `splitHeadingIntoChars()` | `animated-continuous-section.liquid` | Splits chars with space handling, `aria-label` on parent |

~80% logic overlap. Different class names (`.acs-char` vs inline mask spans) but same DOM manipulation pattern.

### 4.4 Animation system overlap (Dawn vs GSAP)

| Pattern | Dawn (`animations.js`) | GSAP (`custom-animations.js`) |
|---|---|---|
| Scroll reveal | `scroll-trigger` + CSS `animate--slide-in` / `animate--fade-in` | `fx-fade-up`, `fx-stagger-list`, etc. |
| Reduced motion | CSS `prefers-reduced-motion` in `base.css` | JS early return in `custom-animations.js` |
| Theme editor | `shopify:section:load` re-init | `ScrollTrigger.refresh()` only |
| Stagger/cascade | `data-cascade` + `--animation-order` CSS | `fx-stagger-list` GSAP stagger |

Both systems are active when `animations_reveal_on_scroll` is `true` (current default in `settings_data.json`).

### 4.5 Dead code

| Item | File | Detail |
|---|---|---|
| `scrub_factor` / `scrub_smoothing` | `video-scroll-scrub.liquid` | Liquid assigns setting; JS never references it. ScrollTrigger uses `scrub: true` (hardcoded) |
| `log()` console output | `video-scroll-scrub.liquid` | ~30+ `console.log` calls in production path |

---

## 5. Architectural Issues

### 5.1 Global-by-default GSAP loading

```
Every page visit
  → Download GSAP (~60KB gzip)
  → Download ScrollTrigger (~20KB gzip)
  → Parse + execute (parser-blocking — no defer/async)
  → Run custom-animations.js (queries entire DOM for fx-* classes)
```

**Problem:** ~99% of pages may have zero or one `fx-*` element, yet pay the full GSAP cost. Theme Check reports `ParserBlockingScript` errors for these tags.

### 5.2 No unified GSAP namespace

Each bespoke section uses its own IIFE with:
- Section-scoped selectors (`#shopify-section-{{ id }}`)
- Independent init/destroy lifecycle
- Separate CDN dependency management

This is acceptable for isolation but creates maintenance overhead and version drift.

### 5.3 No shared cleanup registry

| File | Init on section:load | Cleanup on section:unload |
|---|---|---|
| `custom-animations.js` | ❌ No re-init | ❌ No ScrollTrigger.kill() |
| `video-scroll-scrub.liquid` | ✅ `boot()` | ✅ `destroyInstances()` |
| `animated-continuous-section.liquid` | ✅ `ensureDependencies()` | ✅ `observerInstance.kill()` |
| `gsap-caterpillar-slider.liquid` | ✅ `ensureFlipAndInit()` | ❌ No cleanup; re-init stacks listeners |

### 5.4 Section CSS co-located with JS

All three bespoke sections embed large `<style>` and `<script>` blocks inline. This bypasses the Phase 1 design system architecture (`component-*.css` pattern), makes caching harder, and prevents reuse.

### 5.5 Hardcoded animation classes in Dawn sections

`fx-fade-up` and `fx-stagger-list` were added directly to Dawn fork sections rather than through schema settings or the Nether snippet layer. Merchants cannot disable GSAP animations without code changes.

---

## 6. Performance Analysis

### 6.1 Page-weight impact (global)

| Asset | Est. gzip | Loaded |
|---|---|---|
| `gsap.min.js` 3.12.7 | ~60 KB | Every page |
| `ScrollTrigger.min.js` | ~20 KB | Every page |
| `custom-animations.js` | ~3 KB | Every page |
| **Total GSAP tax** | **~83 KB + 2 blocking requests** | Even on cart, policy, account pages |

### 6.2 Per-section impact

| Section | Concern | Severity |
|---|---|---|
| **video-scroll-scrub** | Preloads up to 300 images via `Promise.all` — memory spike, parallel network saturation | 🔴 High |
| **video-scroll-scrub** | `ImageBitmap` usage + `requestAnimationFrame` throttling is good | ✅ |
| **video-scroll-scrub** | Pin + scrub ScrollTrigger on tall track (default 400vh) — main-thread scroll work | 🟠 Medium |
| **animated-continuous** | `touch-action: none` + `preventDefault: true` on Observer — blocks native scroll behaviour over section | 🟠 Medium |
| **animated-continuous** | `will-change: transform, opacity` on every char span | 🟡 Low |
| **caterpillar-slider** | `Flip.absolute: true` causes layout recalculation; acceptable for small slide counts | 🟡 Low |
| **fx-marquee** | `repeat: -1` runs indefinitely — GPU/CPU even when off-screen | 🟠 Medium |
| **fx-parallax** | ScrollTrigger scrub on scroll — one instance per `.fx-parallax` element | 🟡 Low |
| **fx-stagger-list** on product grid | One ScrollTrigger + N tweens for all product cards | 🟠 Medium |

### 6.3 Runtime conflicts affecting performance

When Dawn `scroll-trigger` and GSAP both target the same elements:
- Elements start at `opacity: 0` from **both** systems
- Competing transforms cause layout thrashing and visual jank
- Effectively doubles animation work per element

---

## 7. Accessibility Verification

| Animation | Reduced motion | Keyboard | Screen reader | Focus |
|---|---|---|---|---|
| `custom-animations.js` utilities | ✅ Early return reveals content | N/A | ✅ `fx-text-reveal` sets `aria-label` | N/A |
| `video-scroll-scrub` | ✅ Static frame + visible overlays | N/A | Canvas `aria-hidden` | N/A |
| `animated-continuous` | ✅ Shows first slide only | ❌ No keyboard nav between slides | ✅ `aria-label` on split headings | ❌ Scroll hijacking may disorient |
| `caterpillar-slider` | ❌ No reduced-motion fallback | ⚠️ Buttons exist but no `aria-live` for slide changes | ✅ Image alt support | ✅ Prev/next buttons |
| `marquee-banner` | ✅ Via parent script early return | N/A | ✅ `aria-label` on section | N/A |
| Dawn `animations.js` | ✅ CSS fallback in `base.css` | N/A | N/A | N/A |

### Accessibility concerns

1. **animated-continuous** traps scroll input over a 100vh section with no skip link or keyboard alternative
2. **caterpillar-slider** Flip animation with no `prefers-reduced-motion` path still runs layout animation
3. **Dual animations** may leave elements at `opacity: 0` if one system fails and the other doesn't complete — content effectively hidden

---

## 8. Compatibility Verification

### Theme Check

| Issue | Source | Status |
|---|---|---|
| `ParserBlockingScript` — GSAP CDN without defer | `theme.liquid` L417–418 | 🔴 Error |
| `ParserBlockingScript` — GSAP CDN without defer | `video-scroll-scrub.liquid` L20–21 | 🔴 Error |
| `RemoteAsset` — jsDelivr CDN | `theme.liquid` | ⚠️ Warning |

### Shopify Online Store 2.0

| Requirement | Status |
|---|---|
| Section schema / presets | ✅ All bespoke sections valid |
| `shopify:section:load` handlers | ✅ Present (except `custom-animations.js`) |
| Theme Editor reorder | ⚠️ `custom-animations.js` only calls `ScrollTrigger.refresh()` — does not init new `fx-*` elements |
| App blocks | ✅ No conflicts |

### Browser support

| Feature | Support | Fallback |
|---|---|---|
| GSAP 3.12.x | Modern browsers | None — scripts fail silently in utilities |
| `createImageBitmap` | Most modern | Falls back to `Image` element |
| `backdrop-filter` | N/A for GSAP | — |
| Flip plugin | Modern | Caterpillar slider simply won't init |

---

## 9. Per-Animation Recommendations

### 9.1 `assets/custom-animations.js` — Utility layer

| Verdict | **KEEP — refactor delivery** |
|---|---|

**Strengths:**
- Clean `fx-*` API aligned with Nether utility-class architecture
- Shared `scrollReveal()` helper reduces internal duplication
- `prefers-reduced-motion` handled correctly
- Shopify Theme Editor `ScrollTrigger.refresh()` hook
- Composable with Phase 1 systems (classes on buttons, cards, etc.)

**Issues to refactor:**
- Should not depend on global parser-blocking GSAP — load GSAP only when `fx-*` elements exist
- No `shopify:section:load` re-initialization for dynamically added `fx-*` elements
- No `ScrollTrigger.kill()` on section unload — memory leak risk in editor
- `fx-marquee` runs infinitely without `ScrollTrigger` visibility pause

**Remove?** ❌ No — this is the correct long-term animation abstraction for the framework.

---

### 9.2 `layout/theme.liquid` — Global GSAP CDN tags

| Verdict | **REFACTOR — remove global blocking load** |
|---|---|

**Issues:**
- Parser-blocking scripts delay First Contentful Paint on every page
- Loads GSAP even when no animations are present
- jsDelivr CDN fails Theme Check `RemoteAsset` guidance (Shopify CDN preferred)
- Fixed version pin with no SRI integrity hashes

**Recommendation:**
- Remove global `<script>` tags from `theme.liquid`
- Move to a deferred loader in `custom-animations.js` (or `gsap-loader.js`) that only fetches GSAP when `document.querySelector('[class*="fx-"]')` matches
- Self-host GSAP in `assets/` for Theme Check compliance and cache control
- Pin a single version (3.12.7) across all files

**Remove?** ⚠️ Remove global load pattern — not the animation capability itself.

---

### 9.3 `sections/video-scroll-scrub.liquid` — Canvas scroll scrub

| Verdict | **KEEP for hero/product storytelling — refactor heavily** |
|---|---|

**Strengths:**
- Sophisticated canvas renderer with `ImageBitmap`, RAF throttling, cover-fit caching
- Proper `destroyInstances()` lifecycle with `section:unload`
- `prefers-reduced-motion` fallback to static frame
- Overlay timeline synced to scroll percentage is a premium effect worth keeping

**Issues:**
- Duplicate GSAP CDN scripts (remove — rely on shared loader)
- `scrub_smoothing` setting is dead code
- `Promise.all` loads all frames simultaneously — should batch/lazy-load (e.g., 20-frame chunks)
- Verbose `console.log` in production
- No frame assets in theme — section is non-functional out of the box
- 300 frames × WebP in `assets/` would add significant theme ZIP weight
- Not used in any template

**Remove?** ❌ Not the concept — but **remove from default templates** and treat as an optional premium section. Consider lazy frame loading before client deployment.

---

### 9.4 `sections/animated-continuous-section.liquid` — Observer full-screen slider

| Verdict | **REFACTOR or REMOVE from framework defaults** |
|---|---|

**Strengths:**
- Impressive full-screen transition effect
- `prefers-reduced-motion` shows static first slide
- Observer cleanup on `section:unload`
- Section-scoped init

**Issues:**
- Scroll hijacking (`preventDefault: true`, `touch-action: none`) — poor UX/accessibility on mobile
- Duplicates text-split logic from `custom-animations.js`
- Loads GSAP 3.12.5 fallback (version drift)
- Heavy 100vh section — not suitable for e-commerce content density
- Not used in any template
- No integration with Nether design systems (hardcoded styles)

**Remove?** ⚠️ **Candidate for removal from the framework** unless a specific client needs a full-screen storytelling experience. If kept, refactor scroll handling to be less invasive and share text-split utility.

---

### 9.5 `sections/gsap-caterpillar-slider.liquid` — Flip carousel

| Verdict | **KEEP — refactor moderately** |
|---|---|

**Strengths:**
- Flip plugin used appropriately for DOM reorder carousel
- CSS-driven active slide sizing + GSAP for position animation is a sound hybrid
- Section-scoped, relatively lightweight
- Accessible prev/next buttons with `aria-label`
- Section Editor block support

**Issues:**
- No `prefers-reduced-motion` fallback (Flip still runs)
- No `section:unload` cleanup — event listeners stack on re-init in editor
- No `aria-live` region for slide changes
- Flip CDN loaded separately (could be bundled in shared loader)
- Hardcoded styles not using Phase 1 tokens (`border-radius: 12px` vs `--radius-md`)
- Not used in any template

**Remove?** ❌ No — good reusable portfolio/gallery component. Refactor for cleanup, a11y, and design token alignment.

---

### 9.6 `sections/marquee-banner.liquid` — Marquee strip

| Verdict | **KEEP — refactor marquee engine** |
|---|---|

**Strengths:**
- Thin section correctly delegates animation to `fx-marquee`
- Simple merchant settings (text, colors, font size)
- Accessible `aria-label` on section

**Issues:**
- Depends on global GSAP for a simple horizontal scroll (could be pure CSS `@keyframes` for this use case)
- `fx-marquee` runs continuously without viewport visibility check
- Not used in any template

**Remove?** ❌ No — but consider replacing GSAP marquee with **CSS-only marquee** for this section to eliminate GSAP dependency for the most common animation use case. Keep `fx-marquee` utility for complex cases.

---

### 9.7 `sections/image-banner.liquid` — `fx-fade-up` on heading

| Verdict | **REFACTOR — remove hardcoded GSAP class** |
|---|---|

**Issue:** Heading has `fx-fade-up` while parent `.banner__content` already uses Dawn `scroll-trigger animate--slide-in`. This creates nested competing animations.

**Recommendation:**
- Remove `fx-fade-up` from the hardcoded heading class
- Let Dawn `animations_reveal_on_scroll` setting control banner animation
- OR add a section setting: `animation_style: dawn | gsap | none`

**Remove?** ⚠️ Remove the hardcoded `fx-fade-up` integration — not the banner section itself.

---

### 9.8 `sections/featured-collection.liquid` — `fx-stagger-list` on grid

| Verdict | **REFACTOR — remove hardcoded GSAP class** |
|---|---|

**Issue:** Product grid `<ul>` has `fx-stagger-list` while each `<li>` child has Dawn `scroll-trigger animate--slide-in` with `data-cascade`. GSAP sets all children to `opacity: 0` while Dawn CSS also manages entrance state.

**Recommendation:**
- Remove `fx-stagger-list` from the grid — Dawn's cascade animation already handles staggered product card reveal
- If GSAP stagger is preferred, remove Dawn `scroll-trigger` classes from children (pick one system)

**Remove?** ⚠️ Remove the `fx-stagger-list` class — Dawn animation is sufficient and already merchant-controlled.

---

## 10. Recommended Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Page load                                              │
│    → animations.js (Dawn — always, if setting enabled)  │
│    → gsap-loader.js (deferred, conditional)             │
│         ↳ Only loads if [class*="fx-"] found OR           │
│           [data-gsap-section] present                     │
│    → custom-animations.js (after GSAP ready)              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Bespoke sections                                       │
│    → data-gsap-section="scroll-scrub|continuous|flip"  │
│    → Section JS requests only needed plugins            │
│    → Shared: gsap-loader.js, text-split utility,        │
│              destroyRegistry                            │
└─────────────────────────────────────────────────────────┘
```

### Priority refactor sequence (future work)

1. **P0 — Fix conflicts:** Remove `fx-fade-up` from `image-banner.liquid` and `fx-stagger-list` from `featured-collection.liquid`
2. **P0 — Fix global load:** Defer/conditional GSAP loading; remove parser-blocking CDN from `theme.liquid`
3. **P1 — Deduplicate:** Remove inline GSAP scripts from `video-scroll-scrub.liquid`; unify version to 3.12.7
4. **P1 — Shared utilities:** Extract `loadScript()`, `splitText()`, and `destroyRegistry()` to `assets/gsap-utils.js`
5. **P2 — Section hardening:** Add reduced-motion, cleanup, and `aria-live` to caterpillar; batch frame loading in scroll-scrub
6. **P2 — CSS marquee:** Replace GSAP marquee in `marquee-banner` with CSS animation
7. **P3 — Evaluate:** Decide if `animated-continuous-section` stays in the framework or becomes a client-specific section

---

## 11. Summary Decision Matrix

| Animation / File | Keep | Refactor | Remove | Priority |
|---|---|---|---|---|
| `custom-animations.js` | ✅ | ✅ delivery & lifecycle | ❌ | P0 |
| `theme.liquid` GSAP CDN | — | ✅ conditional/deferred | ⚠️ global pattern | P0 |
| `video-scroll-scrub.liquid` | ✅ | ✅ loader, frames, logging | ❌ | P1 |
| `animated-continuous-section.liquid` | ⚠️ niche | ✅ a11y, dedup | ⚠️ consider | P3 |
| `gsap-caterpillar-slider.liquid` | ✅ | ✅ cleanup, a11y, tokens | ❌ | P2 |
| `marquee-banner.liquid` | ✅ | ✅ CSS alternative | ❌ | P2 |
| `image-banner` `fx-fade-up` | — | — | ✅ class only | P0 |
| `featured-collection` `fx-stagger-list` | — | — | ✅ class only | P0 |
| Dawn `animations.js` | ✅ | ❌ | ❌ | — |

---

## 12. Conclusion

The GSAP layer adds genuine premium capability to the Nether framework — especially the `fx-*` utility system and the canvas scroll-scrub section. However, the current implementation prioritizes developer convenience over performance by loading GSAP globally, duplicates library loading in sections, and **conflicts with Dawn's native animation system** in two core sections.

**No animations should be deleted immediately.** The highest-impact improvements are:
1. Stop loading GSAP on every page
2. Resolve Dawn/GSAP conflicts in `image-banner` and `featured-collection`
3. Consolidate CDN strategy and shared utilities before building Phase 2 sections

Once these three items are addressed, the animation architecture will align with the Phase 1 Foundation principles: modular, reusable, performant, and merchant-friendly.

---

*Read-only review — no source files were modified. Recommendations are for future implementation.*
