# Nether Premium Header Behavior System Report

## 1. Summary

Extended the existing Nether Premium Header Framework with a scroll-driven behavior layer. This phase adds premium header behaviors only — no rebuild of the header architecture, Dawn sticky header element, navigation snippets, or announcement integration.

The behavior system introduces reusable framework state classes (`.is-transparent`, `.is-solid`, `.is-sticky`, `.is-shrunk`, `.is-hidden`, `.is-scrolled`), a scroll threshold engine, breakpoint-aware activation, smooth CSS transitions, and GSAP-powered hide/reveal animations via the Nether Motion Engine.

## 2. Files Created

- `HEADER_BEHAVIOR_REPORT.md`

## 3. Files Modified

- `assets/component-header.js` — scroll behavior system, state class API, NetherMotion integration, Dawn sticky coordination
- `assets/component-header.css` — reusable state class styles, shrink/transparent/solid transitions, motion-aware hide rules
- `sections/header.liquid` — behavior data attributes, CSS variables, merchant schema settings, Dawn `StickyHeader` delegation guard
- `locales/en.default.schema.json` — Theme Editor labels for behavior settings; updated glass effect info text

## 4. Header Behaviors Added

| Behavior | Implementation |
|----------|----------------|
| **Sticky Header** | `.is-sticky` state + existing Dawn `sticky-header` / `shopify-section-header-sticky` coordination |
| **Transparent Header** | `.is-transparent` at page top when enabled; structural `nether-header--state-transparent` preserved |
| **Solid Header** | `.is-solid` applied after scroll threshold; background transitions via CSS tokens |
| **Header Shrink** | `.is-shrunk` reduces min-height and logo scale using `--nether-header-shrink-height` |
| **Auto Hide On Scroll** | `.is-hidden` on scroll down past header bounds; `pointer-events: none` preserved |
| **Reveal On Scroll Up** | Removes `.is-hidden` and animates header back into view |
| **Scroll Threshold System** | Merchant-configurable `nether_scroll_threshold` (0–500px) gates all scroll behaviors |
| **Smooth State Transitions** | `--nether-header-transition-duration` drives CSS transitions; GSAP handles hide/reveal when motion is ready |

### Reusable state classes

Applied on `<nether-header>` and available framework-wide:

- `.is-transparent`
- `.is-solid`
- `.is-sticky`
- `.is-shrunk`
- `.is-hidden`
- `.is-scrolled`

Phase 1 compatibility classes (`is-nether-header-*`) are synced automatically.

### Framework events

- `nether:header:state` — dispatched on scroll state changes with `{ sectionId, scrollY, state }` detail

## 5. Merchant Settings Added

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `nether_enable_shrink` | checkbox | `false` | Enable header shrink on scroll |
| `nether_enable_auto_hide` | checkbox | `true` | Auto hide on scroll down, reveal on scroll up |
| `nether_scroll_threshold` | range (0–500px) | `50` | Scroll distance before behaviors activate |
| `nether_shrink_height` | range (40–120px) | `56` | Header height when shrunk |
| `nether_animation_speed` | select | `default` | Fast (0.15s) / Default (0.3s) / Slow (0.5s) |
| `nether_behavior_desktop` | checkbox | `true` | Enable behaviors on desktop (≥990px) |
| `nether_behavior_tablet` | checkbox | `true` | Enable behaviors on tablet (750–989px) |
| `nether_behavior_mobile` | checkbox | `true` | Enable behaviors on mobile (<750px) |

### Existing settings reused

- `nether_enable_sticky` — sticky behavior
- `nether_enable_transparent` — transparent → solid transition
- `nether_enable_glass` — glass effect when solid/sticky
- `sticky_header_type` — Dawn sticky modes; defers scroll hide to Nether when `nether_enable_auto_hide` is enabled

## 6. Motion Integration

- GSAP loaded exclusively via `NetherMotion.load([])` — no manual GSAP script tags
- Hide/reveal animations use `gsap.to()` on `.header-wrapper` when motion is ready
- `data-nether-motion-ready` attribute set after GSAP loads; CSS defers transform transitions to GSAP when active
- Shrink, transparent → solid, and scrolled shadow transitions use CSS with `--nether-header-transition-duration`
- `NetherMotion.registerSection()` init/destroy hooks reinitialize behavior on Theme Editor section load/unload
- `prefers-reduced-motion`: instant state changes, no GSAP tweens, CSS transitions disabled

## 7. Accessibility Improvements

- Preserved Dawn skip-to-content and scroll-padding awareness
- Preserved ARIA labels on all interactive header controls
- `pointer-events: none` on hidden header prevents focus traps on invisible elements
- Menu disclosures and search modal closed when header auto-hides
- `prefers-reduced-motion` respected for all behavior transitions
- Focus-visible outline styles unchanged on interactive controls
- Placeholder icons remain `aria-disabled` and removed from tab order

## 8. Performance Improvements

- **Lazy initialization** — scroll listener attached only when behavior features are enabled for the active breakpoint
- **Single scroll listener** — one passive `scroll` handler with `requestAnimationFrame` throttling
- **Breakpoint gating** — behaviors deactivate outside enabled breakpoints without polling
- **Minimal layout reads** — `offsetHeight` / `getBoundingClientRect` only on resize and announcement changes
- **IntersectionObserver** — header bounds captured once for scroll calculations
- **Dawn delegation** — Dawn `StickyHeader.onScroll` exits early when Nether auto-hide is active, preventing duplicate scroll logic
- **CSS variable-driven** — merchant settings applied via scoped variables, no inline style recalculation per frame

## 9. Framework Integration

| Nether System | Integration |
|---------------|-------------|
| Header Framework | Extended `NetherHeader` custom element and existing CSS modifiers |
| Nether Motion Engine | `NetherMotion.load()`, `registerSection()`, `prefersReducedMotion()` |
| Design Token System | `--duration-default`, `--shadow-level-*`, `--glass-blur-*`, color channels |
| Glass Effects System | Glass styling on `.is-solid` / `.is-sticky` when enabled |
| Shadow System | Subtle shadow on `.is-scrolled` via `--nether-header-shadow` |
| Announcement System | `nether:announcement:change` offset sync preserved; sticky top offset aware |

No duplicate header snippets, navigation components, or Dawn base layout CSS were created.

## 10. Verification Checklist

- [x] Existing Header Framework preserved
- [x] Existing Announcement System preserved (`nether:announcement:change` bridge intact)
- [x] Existing Motion Engine reused (no direct GSAP loading)
- [x] No duplicated CSS — extended `component-header.css` only
- [x] No duplicated JavaScript — extended `component-header.js` only
- [x] No files deleted
- [x] No files renamed
- [x] Dawn sticky header, drawer, dropdown, mega menu preserved
- [x] Cart notification and schema.org markup preserved
- [x] Theme Check passes (no new offenses introduced)
- [x] Online Store 2.0 schema compatible
- [x] Reusable state classes available framework-wide
- [x] Responsive breakpoint controls (desktop / tablet / mobile)
- [x] Reduced motion support
- [ ] Manual Theme Editor behavior preview (recommended)
- [ ] Manual keyboard navigation audit on staging store (recommended)
- [ ] Manual cross-browser scroll behavior test (recommended)

## Confirmation

- **Existing header functionality preserved** — Dawn header behavior, menus, icons, sticky element, and cart flows remain intact.
- **Behavior-only phase** — architecture, snippets, and layout presets from phase 1 unchanged.
- **No files deleted.**
- **No existing functionality broken.**
