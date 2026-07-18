# Phase 5 — Nether Motion Engine 2.0

**Date:** 2026-07-14  
**Scope:** Reusable motion framework infrastructure only  
**Constraint:** No section animation implementations; no Hero / Banner / Product / Collection / Commerce / Navigation motion packs

---

## 1. Summary

NetherMotion has been upgraded from a GSAP loader + section lifecycle helper into **Motion Engine 2.0** — the single source of truth for animation architecture across the Nether Framework.

This phase delivers the **engine**, not visual feature animations:

- Motion / animation / timeline / ScrollTrigger / preset / pack registries
- Clean public API (`register`, `animate`, `timeline`, `createPreset`, `destroy`, `refresh`, `observe`)
- Theme Editor merchant settings bridge (enabled, style, intensity, speed, reduced motion, viewport)
- Accessibility + breakpoint-aware motion controls
- Full **backward compatibility** with existing `NetherMotion` 1.x consumers

No section markup was changed. No Hero / Product / Collection / Commerce animations were added. Existing visual behavior remains unchanged at default settings.

---

## 2. Motion Architecture

```
Theme Editor settings
        │
        ▼
snippets/nether-motion-config.liquid  →  #nether-motion-config JSON
        │
        ▼
assets/nether-motion.js  (Motion Engine 2.0)
        │
        ├── Loader          → GSAP core + plugins (ScrollTrigger, Flip, Observer, custom)
        ├── Settings        → merchant config + intensity/speed scaling
        ├── ReducedMotion   → OS preference + merchant force/respect + viewport gates
        ├── Breakpoints     → mobile / desktop motion permission
        ├── Registry        → component hosts + section TE lifecycle
        ├── Animations      → tween / timeline instance tracking
        ├── Timelines       → create / batch / kill
        ├── Scroll          → reveal / parallax / sticky / batch / refresh
        ├── IO              → IntersectionObserver manager
        ├── Presets         → fade / slide / scale / stagger / reveal / parallax /
        │                      editorial / luxury / minimal / custom (definitions only)
        ├── Packs           → Motion Pack registration (future premium packs)
        ├── Lifecycle       → scoped destroy + refresh
        └── Events          → nether:motion:* CustomEvents
        │
        ▼
assets/custom-animations.js  (fx-* utilities — still valid; uses engine a11y/settings)
        │
        ▼
Future component consumers call NetherMotion.animate() / register() / scroll.*
```

**Design rule:** Components register motion through the engine. Standalone GSAP timelines outside NetherMotion are discouraged for new work.

---

## 3. Engine Modules

| Module | Namespace | Responsibility |
|---|---|---|
| Motion Loader | `NetherMotion.load()` / `plugins` | Deferred GSAP + plugin loading, deduplicated promises, custom plugin URLs |
| Settings | `NetherMotion.settings` / `getSettings()` | Reads Theme Editor config; intensity & speed multipliers |
| Reduced Motion Manager | `NetherMotion.reducedMotion` | System preference, force-reduce, viewport-gated reduce |
| Breakpoint Manager | `NetherMotion.breakpoints` | Mobile / tablet / desktop detection; `allowsMotion()` |
| Motion Registry | `NetherMotion.registry` / `register()` | Component host registration |
| Section Registry | `registerSection()` / `unregisterSection()` | Theme Editor load/unload (1.x compatible) |
| Animation Registry | `NetherMotion.animations` | Track / kill tweens & owned instances |
| Timeline Manager | `NetherMotion.timelines` / `timeline()` | Named timelines + batch helper |
| ScrollTrigger Manager | `NetherMotion.scroll` | create / batch / refresh / reveal / parallax / sticky |
| Intersection Observer | `NetherMotion.io` / `observe()` | Lazy viewport detection with cleanup |
| Preset Registry | `NetherMotion.presets` / `createPreset()` | Reusable preset definitions + style packs |
| Pack Registry | `NetherMotion.packs` | Future Motion Packs / premium packs |
| Motion Events | `NetherMotion.events` / `EVENT` | `nether:motion:ready\|refresh\|destroy\|reduced\|pack\|register` |
| Lifecycle | `NetherMotion.lifecycle` / `destroy()` / `refresh()` | Scoped cleanup + ScrollTrigger refresh |
| Utilities | `NetherMotion.utils` | merge, targets, uid, GPU-friendly var helpers |

---

## 4. API Design

### Compatibility (unchanged)

```javascript
NetherMotion.VERSION                // GSAP version string (still 3.12.7)
NetherMotion.load(['scrollTrigger'])
NetherMotion.needsMotion(root)
NetherMotion.getRequiredPlugins(root)
NetherMotion.prefersReducedMotion()
NetherMotion.whenReady(callback, root)
NetherMotion.registerSection(id, { init, destroy })
NetherMotion.unregisterSection(id)
NetherMotion.Fx.init / cleanup / boot / hasElements
```

### Motion Engine 2.0

```javascript
NetherMotion.ENGINE_VERSION         // '2.0.0'
NetherMotion.GSAP_VERSION           // '3.12.7'

NetherMotion.register('card', { init, destroy, presets, plugins })
NetherMotion.unregister('card')

NetherMotion.animate(targets, 'fade', { scope, duration, scrollTrigger })
NetherMotion.animate(targets, { opacity: 1 }, { from: { opacity: 0 } })

NetherMotion.timeline({ id, paused, scope, defaults })
NetherMotion.createPreset('client-reveal', { from, to, defaults, scroll })
NetherMotion.destroy(idOrElement)   // id string, DOM scope, or full teardown
NetherMotion.refresh(optionalRoot)
NetherMotion.observe(targets, { onEnter, onExit, once, rootMargin })

NetherMotion.isEnabled()
NetherMotion.isActive()
NetherMotion.getSettings()

// Advanced namespaces
NetherMotion.scroll.reveal(el, opts)
NetherMotion.scroll.parallax(el, opts)
NetherMotion.scroll.sticky(el, opts)
NetherMotion.scroll.refresh()
NetherMotion.packs.register('luxury-pack', { presets, init, destroy })
NetherMotion.plugins.register('customEase', url, 'CustomEase')
```

### Future usage pattern

```javascript
NetherMotion.register('nether-hero', {
  plugins: ['scrollTrigger'],
  init(root) {
    NetherMotion.animate(root.querySelectorAll('[data-hero-item]'), 'luxury', {
      scope: root,
      stagger: 0.12,
    });
  },
  destroy(root) {
    NetherMotion.destroy(root);
  },
});
```

---

## 5. Preset Architecture

Presets are **definitions only**. Nothing auto-binds to existing sections.

| Preset | Category | Role |
|---|---|---|
| `fade` | base | Opacity reveal |
| `slide` | base | Fade + vertical slide |
| `scale` | base | Fade + scale |
| `stagger` | base | Staggered children scaffold |
| `reveal` | base | Mask-style reveal scaffold |
| `parallax` | scroll | Scrubbed parallax scaffold |
| `editorial` | style | Editorial timing / easing profile |
| `luxury` | style | Slower luxury profile |
| `minimal` | style | Soft opacity-only profile |
| `custom` | custom | Empty shell for overrides |

Style packs map merchant **Motion Style** setting to preset groups:

| Style | Preset group |
|---|---|
| `minimal` | minimal, fade |
| `editorial` | editorial, reveal, stagger |
| `luxury` | luxury, scale, parallax |
| `custom` | custom |

New presets / packs require **no architectural changes** — call `createPreset()` or `packs.register()`.

---

## 6. Performance Strategy

| Strategy | Implementation |
|---|---|
| Lazy GSAP loading | Unchanged — loads only when `needsMotion()` detects fx / motion hosts |
| Plugin granularity | ScrollTrigger / Flip / Observer / custom on demand |
| Deduplicated fetches | Shared `loadPromises` map |
| Timeline batching | `timelines.batch(factories)` |
| Intersection Observer | `observe()` for lazy init without ScrollTrigger cost |
| Animation cleanup | `destroy(scope)` kills tweens, timelines, triggers, observers |
| Memory management | Animation Registry tracks instances for targeted kill |
| GPU-friendly transforms | Presets use opacity / x / y / scale; `utils.sanitizeVars` hook |
| ScrollTrigger refresh | Design Mode load/reorder + `refresh()` API |
| Minimal layout thrashing | Prefer transforms; scoped queries; no section-wide auto scans from new APIs |
| Merchant disable | Master switch short-circuits `animate()` / scroll helpers; Fx reveals instantly |

---

## 7. Accessibility

| Concern | Behavior |
|---|---|
| `prefers-reduced-motion` | Honored when **Respect reduced motion** is on (default) |
| Force reduced motion | Merchant can disable motion for everyone |
| Mobile / desktop gates | Viewport toggles treat blocked viewports as reduced |
| `NetherMotion.prefersReducedMotion()` | Single helper used by header, commerce, wishlist, compare, bundles, Fx |
| Fx utilities | Instant reveal path when reduced or master-disabled |
| Focus management | Engine does not trap focus; consumers keep existing keyboard paths |
| Events | `nether:motion:reduced` fires on system preference change |

---

## 8. Extensibility

| Extension | API |
|---|---|
| Motion Packs | `NetherMotion.packs.register(name, { presets, plugins, init, destroy })` |
| Premium / Luxury / Editorial packs | Same pack API — no core changes |
| Client-specific packs | Register unique pack IDs per client theme fork |
| Custom GSAP plugins | `NetherMotion.plugins.register(key, url, globalName)` then `load([key])` |
| Custom presets | `createPreset(name, definition)` |
| Custom events | `NetherMotion.events.on / once / emit` |
| Override config at runtime | `window.NetherMotionConfig = { … }` before/alongside JSON bridge |

Core pack `core` is registered at boot as the engine baseline.

---

## 9. Files Created

| File | Purpose |
|---|---|
| `snippets/nether-motion-config.liquid` | Theme Editor → JSON config bridge (`#nether-motion-config`) |
| `PHASE5_MOTION_ENGINE_REPORT.md` | This report |

---

## 10. Files Modified

| File | Change |
|---|---|
| `assets/nether-motion.js` | Expanded into Motion Engine 2.0 (registries, API, scroll, presets, packs, a11y, settings) |
| `assets/custom-animations.js` | Respects `isEnabled()` + centralized reduced-motion helper (defaults unchanged) |
| `layout/theme.liquid` | Renders `nether-motion-config` before deferred motion scripts |
| `config/settings_schema.json` | Adds **Nether Motion** merchant settings group |
| `locales/en.default.schema.json` | Labels / info copy for Nether Motion settings |

### Explicitly not modified

- All `sections/*` implementations
- Header / Hero / Banner / Product / Collection / Commerce visual animation logic
- Dawn `animations.js` native reveal system

---

## 11. Future Motion Roadmap

| Phase | Focus |
|---|---|
| 5.1 | Wire Hero / Banner frameworks to `NetherMotion.register()` + presets |
| 5.2 | Product / Collection page reveal + stagger via engine presets |
| 5.3 | Commerce micro-interactions (drawers, ATC feedback) via pack |
| 5.4 | Navigation / header shared motion utilities (extend, don’t replace) |
| 5.5 | Premium Motion Pack (editorial + luxury sequences) |
| 5.6 | Client Motion Packs per project |
| 5.7 | Optional local vendoring of GSAP assets (Theme Check RemoteAsset hardening) |
| 5.8 | Shared `splitText` utility extracted from Fx + animated-continuous |

**Rule going forward:** New animations register through NetherMotion — no new standalone GSAP loaders or orphan timelines.

---

## 12. Verification Checklist

### Compatibility

- [x] `NetherMotion.load` / `whenReady` / `needsMotion` / `getRequiredPlugins` preserved
- [x] `registerSection` / `unregisterSection` preserved
- [x] `VERSION` still reports GSAP `3.12.7`
- [x] `NetherMotion.Fx` still attached by `custom-animations.js`
- [x] Design Mode still emits `nether:motion:ready` and refreshes ScrollTrigger
- [x] Existing consumers (header, announcement, bundles, collection-page, quick-view, wishlist, compare, commerce) keep prior call sites

### Scope discipline

- [x] No section files modified
- [x] No Hero / Product / Collection / Commerce / Navigation animation features added
- [x] Presets are scaffolds only — not auto-applied to DOM
- [x] No duplicate animation systems introduced (engine extends the single NetherMotion namespace)

### Defaults / regressions

- [x] Default settings match prior runtime behavior (motion on, respect OS reduced motion, mobile + desktop on, intensity 50, speed 100)
- [x] `fx-*` utilities still initialize via existing path
- [x] Conditional GSAP loading preserved
- [x] JSON schemas parse; JS syntax checks pass

### Theme Editor

- [x] Nether Motion settings group available in theme settings
- [x] Config bridge outputs boolean-safe JSON (no `default` filter false-collapse)
- [x] Section load invalidates settings cache + re-runs registered handlers

### Accessibility

- [x] Reduced motion manager centralizes OS + merchant + viewport rules
- [x] Fx instant-reveal path honors engine reduced / disabled state

---

## Confirmation

- **Existing NetherMotion users remain compatible.**
- **No section behavior changes were introduced.**
- **No intentional visual regressions at default settings.**
- **Animation systems were not duplicated — the engine is the single registry.**
- **Architecture is future-ready for Motion Packs and component registration.**

---

*Nether Motion Engine 2.0 — Phase 5 infrastructure complete. Stop here.*
