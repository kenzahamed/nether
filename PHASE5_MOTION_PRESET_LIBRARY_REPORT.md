# Phase 5 — Nether Motion Preset Library

**Date:** 2026-07-14  
**Scope:** Reusable motion preset metadata library only  
**Constraint:** No section implementations; no Hero / Product / Collection / Commerce animation applications

---

## 1. Summary

The **Nether Motion Preset Library** is the single source of truth for animation behavior metadata consumed by **Motion Engine 2.0**.

It registers **69 reusable presets** across seven categories via `NetherMotion.packs.register('preset-library', …)`. Presets are **definitions only** — duration, delay, ease, transforms, opacity, scale, rotation, distance, direction, stagger, cleanup, responsive overrides, and reduced-motion fallbacks.

Nothing auto-binds to DOM. No Hero, Product, Collection, or Commerce sections were modified or animated. Future features call `NetherMotion.animate(targets, 'fade-up')` (etc.) instead of inventing section-local GSAP timelines.

---

## 2. Preset Categories

| Category | Count | Preset IDs |
|---|---|---|
| **Reveal** | 13 | `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-scale`, `scale-in`, `scale-out`, `blur-reveal`, `mask-reveal`, `clip-reveal`, `editorial-reveal`, `luxury-reveal`, `minimal-reveal` |
| **Stagger** | 9 | `stagger-cards`, `stagger-grid`, `stagger-gallery`, `stagger-list`, `stagger-text`, `stagger-features`, `stagger-testimonials`, `stagger-logos`, `stagger-stats` |
| **Hover** | 14 | `hover-lift`, `hover-soft-lift`, `hover-luxury-lift`, `hover-glow`, `hover-image-zoom`, `hover-image-pan`, `hover-border-draw`, `hover-underline`, `hover-button-fill`, `hover-button-sweep`, `hover-icon-slide`, `hover-arrow`, `hover-media`, `hover-glass` |
| **Scroll** | 8 | `scroll-parallax`, `scroll-layered-parallax`, `scroll-floating`, `scroll-sticky-reveal`, `scroll-progress`, `scroll-section-reveal`, `scroll-viewport-batch`, `scroll-timeline-sequence` |
| **Text** | 7 | `text-word-reveal`, `text-character-reveal`, `text-line-reveal`, `text-heading-reveal`, `text-editorial`, `text-luxury-heading`, `text-cta-reveal` |
| **Media** | 7 | `media-image-reveal`, `media-gallery-reveal`, `media-video-reveal`, `media-ken-burns`, `media-zoom`, `media-pan`, `media-before-after` |
| **Commerce** | 11 | `commerce-add-to-cart`, `commerce-cart-drawer`, `commerce-wishlist`, `commerce-compare`, `commerce-quick-view`, `commerce-bundle`, `commerce-recommendation-cards`, `commerce-price-change`, `commerce-inventory-update`, `commerce-badge-reveal`, `commerce-trust-reveal` |

**Total: 69 presets** (unique IDs).

Core Engine 2.0 scaffolds (`fade`, `slide`, `scale`, `stagger`, `reveal`, `parallax`, `editorial`, `luxury`, `minimal`, `custom`) remain registered and unchanged for backward compatibility.

---

## 3. Preset Architecture

Each preset is data-only metadata:

```javascript
{
  name: 'fade-up',
  category: 'reveal',
  direction: 'up',
  distance: 40,
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0 },
  defaults: { duration: 0.9, delay: 0, ease: 'power3.out' },
  stagger: null | number | object,
  scroll: true | false,
  interaction: null | 'hover',
  plugins: [],
  cleanup: { clearProps: 'opacity,transform,…' },
  responsive: {
    mobile: { from: { y: 24 }, defaults: { duration: 0.7 } },
    tablet: { … },
    desktop: { … }
  },
  reducedMotion: {
    mode: 'instant' | 'skip',
    from: { … },
    to: { … },
    defaults: { duration: 0.01, ease: 'none' }
  },
  meta: { /* optional consumer hints — not section bindings */ }
}
```

**Supported fields:** duration, delay, ease, transform props (x/y/scale/rotate), opacity, distance, direction, stagger, cleanup, responsive overrides, reduced-motion fallback.

**Not included:** section selectors, Hero/Product/Commerce wiring, or auto-scan behavior.

**Style pack enrichment:** Merchant Motion Style groups now also reference library presets:

| Style | Added library presets |
|---|---|
| `minimal` | `minimal-reveal`, `fade-up`, `stagger-logos` |
| `editorial` | `editorial-reveal`, `text-editorial`, `stagger-features`, `clip-reveal` |
| `luxury` | `luxury-reveal`, `text-luxury-heading`, `media-image-reveal`, `hover-luxury-lift` |

---

## 4. API Integration

```
nether-motion.js (Engine 2.0)
        │
        ├── presets.create / resolve / resolveReduced / list / listByCategory
        ├── packs.register
        ├── animate / timeline / createPreset / register
        │
        ▼
nether-motion-presets.js
        │
        └── packs.register('preset-library', { presets: […69], init })
```

### Consume presets

```javascript
// Reveal on scroll (opt-in only)
NetherMotion.animate('.nether-card', 'fade-up', { scope: root });

// Stagger grid
NetherMotion.animate(cards, 'stagger-grid', { scope: root, scroll: true });

// Custom override without forking the library
NetherMotion.animate(el, 'luxury-reveal', {
  duration: 1.6,
  preset: { from: { y: 32 } },
});

// Register future client presets
NetherMotion.createPreset('client-soft-rise', {
  category: 'reveal',
  from: { opacity: 0, y: 20 },
  to: { opacity: 1, y: 0 },
  defaults: { duration: 0.8, ease: 'power2.out' },
  scroll: true,
});

// Component host pattern
NetherMotion.register('future-feature', {
  init(root) {
    NetherMotion.animate(root.querySelectorAll('[data-item]'), 'stagger-features', {
      scope: root,
    });
  },
  destroy(root) {
    NetherMotion.destroy(root);
  },
});
```

### Engine extensions (backward compatible)

| API | Role |
|---|---|
| `presets.resolve(name, overrides)` | Merges responsive breakpoint + intensity/speed scaling |
| `presets.resolveReduced(name)` | Safe a11y fallback metadata |
| `presets.listCategories()` / `listByCategory()` | Catalog introspection |
| `animate()` | Honors `reducedMotion.mode` (`instant` set vs `skip`) |

---

## 5. Performance Strategy

| Strategy | How presets support it |
|---|---|
| GPU transforms | Prefers `opacity`, `x`, `y`, `scale`, `rotate`, `filter`, `clipPath` |
| Minimal layout thrashing | No width/height/top/left animation in library defaults |
| Timeline reuse | Scroll sequence presets designed for `NetherMotion.timeline()` |
| Batching | `scroll-viewport-batch` + stagger metadata for `scroll.batch` |
| Lazy initialization | Pack registers metadata only; GSAP still loads via engine `needsMotion()` |
| Cleanup | Every animated preset includes `cleanup.clearProps` |
| Reduced motion | Skip continuous/hover/scrub presets; instant settle for reveals |
| No section scans | Library never queries Hero/Product/Commerce DOM |

---

## 6. Accessibility

| Concern | Behavior |
|---|---|
| Every preset | Includes `reducedMotion` metadata |
| Reveal / stagger / text / media / commerce open states | `mode: 'instant'` → visible end state without motion |
| Hover / parallax / ken-burns / floating / progress | `mode: 'skip'` → no animation / no forced visual change |
| Engine `animate()` | Uses `presets.resolveReduced()` when `prefersReducedMotion()` |
| Safe fallback | Instant sets clear motion props to readable end values |
| Merchant controls | Still gated by Theme Editor enabled / force-reduce / viewport toggles |

---

## 7. Files Created

| File | Purpose |
|---|---|
| `assets/nether-motion-presets.js` | Full preset library pack (`preset-library` v1.0.0) |
| `PHASE5_MOTION_PRESET_LIBRARY_REPORT.md` | This report |

---

## 8. Files Modified

| File | Change |
|---|---|
| `assets/nether-motion.js` | Extended PresetRegistry (responsive resolve, resolveReduced, category index, richer defaults); `animate()` honors preset reduced-motion metadata |
| `layout/theme.liquid` | Loads `nether-motion-presets.js` after `nether-motion.js`, before `custom-animations.js` |

### Explicitly not modified

- All `sections/*`
- Hero / Product / Collection / Commerce / Banner animation logic
- Component commerce JS behavior
- `custom-animations.js` fx utilities (still valid)

---

## 9. Future Usage Examples

```javascript
// Hero (future phase — not applied now)
NetherMotion.animate(heroItems, 'luxury-reveal', { stagger: 0.12, scope: hero });

// Product grid (future)
NetherMotion.animate(cards, 'stagger-cards', { scope: collectionRoot });

// Cart drawer (future)
NetherMotion.animate(drawer, 'commerce-cart-drawer', { scope: drawer, scroll: false });

// Editorial text (future — after split utility)
NetherMotion.animate(words, 'text-word-reveal', { scope: contentRoot });

// Media gallery (future)
NetherMotion.animate(figures, 'media-gallery-reveal', { scope: mediaRoot });
```

Debug helpers (non-engine catalog mirror):

```javascript
NetherMotionPresets.count          // 69
NetherMotionPresets.list()
NetherMotionPresets.byCategory()
NetherMotion.presets.list('reveal')
NetherMotion.packs.get('preset-library')
```

---

## 10. Verification Checklist

### Scope discipline

- [x] No section files modified
- [x] No Hero animations added or applied
- [x] No Product / Collection animations added or applied
- [x] No Commerce animations applied (presets are metadata only)
- [x] No existing section behavior changed
- [x] Only reusable presets created + minimal engine support hooks

### API / Engine compatibility

- [x] Integrates with `NetherMotion.register()`
- [x] Integrates with `NetherMotion.animate()`
- [x] Integrates with `NetherMotion.timeline()`
- [x] Integrates with `NetherMotion.createPreset()`
- [x] Custom future presets still supported
- [x] Core Engine 2.0 seed presets preserved
- [x] Pack registered as `preset-library`
- [x] JS syntax checks pass for engine + library

### Preset completeness

- [x] Reveal (13)
- [x] Stagger (9)
- [x] Hover (14)
- [x] Scroll (8)
- [x] Text (7)
- [x] Media (7)
- [x] Commerce metadata (11)
- [x] Duration / delay / ease / transform / opacity / scale / stagger / cleanup
- [x] Responsive overrides where motion distance matters
- [x] Reduced-motion alternative on every preset

### Performance / a11y

- [x] GPU-oriented transform props
- [x] Cleanup metadata present
- [x] Reduced-motion fallbacks present
- [x] No auto DOM binding / no layout-wide scans from library

---

## Confirmation

- **Reusable Motion Preset Library is complete.**
- **Motion Engine 2.0 remains the runtime; this pack is the behavior catalog.**
- **No Hero / Product / Collection / Commerce section behavior was changed.**
- **Future Nether animations should consume these presets instead of custom section timelines.**

---

*Nether Motion Preset Library — stop here.*
