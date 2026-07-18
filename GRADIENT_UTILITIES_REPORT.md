# Nether Premium Gradient Utilities System — Report

## 1. Summary

The Nether Premium Gradient Utilities System extends Dawn and Nether color architecture without replacing or duplicating existing styles. All ten gradient types, five utility categories (background, text, border, overlay, hover), and animated-ready tokens build on established design tokens — `--color-background`, `--color-foreground`, `--color-button`, `--color-button-text`, `--color-link`, `--color-shadow`, `--gradient-background`, and optional Shadow / Radius / Glass System variables — so every existing `.gradient` surface, `.card--gradient-border`, category card overlay, and color-scheme background across the theme continues to work unchanged.

A single dedicated stylesheet (`assets/component-gradient.css`) provides reusable design tokens and utility classes for all future Nether sections. No JavaScript is required.

**Key design decisions:**

- **Extend, don't replace** — Dawn `.gradient` (merchant `--gradient-background`) and `.card--gradient-border` in `component-card-premium.css` remain untouched. New `.grad-*` utilities use a distinct namespace to avoid collisions.
- **Namespaced utilities** — Nether classes use the `.grad-*` prefix; Dawn `.gradient` is preserved for color-scheme backgrounds.
- **Merchant-friendly control** — Global `--gradient-intensity`, `--gradient-angle`, `--gradient-overlay-opacity`, and color stop tokens scale all recipes without rewriting components; ready to wire to future theme settings.
- **Token reuse** — All gradient stops derive from Dawn color channels; shadows compose with `--shadow-level-*` when the Shadow System is present.
- **Accessible contrast** — Text gradients include solid-color fallbacks; `.grad-readable` wrappers preserve legibility; `prefers-contrast: more` and `forced-colors` modes solidify surfaces.
- **Pure CSS** — Zero JavaScript; animated-ready custom properties prepared without keyframe implementation.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-gradient.css` | Gradient tokens, type utilities, category bridges, hover/animated-ready helpers, and accessibility fallbacks |
| `GRADIENT_UTILITIES_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-gradient.css` globally after `component-glass.css` |
| `layout/password.liquid` | Added `component-gradient.css` for password layout parity |

**Not modified (intentionally preserved):**

| File | Why |
|---|---|
| `assets/base.css` | Dawn `.gradient` class and `--gradient-background` left intact |
| `assets/component-card-premium.css` | Existing `.card--gradient-border` mask rules left intact |
| Button / Badge / Form / Glass / Shadow / Radius CSS | Integration via additive utility classes only |

---

## 4. Gradient Types

| Type | Utility Classes | CSS Recipe Token | Typical Use |
|---|---|---|---|
| **Linear** | `.grad-linear-brand`, `.grad-linear-subtle`, `.grad-linear-accent`, `.grad-linear-fade-down`, `.grad-linear-fade-up` | `--grad-linear-brand` | Backgrounds, fades, accents |
| **Radial** | `.grad-radial-glow`, `.grad-radial-corner`, `.grad-radial-vignette` | `--grad-radial-glow` | Glow effects, vignettes |
| **Conic** | `.grad-conic-brand` | `--grad-conic-brand` | Decorative panels, badges |
| **Mesh-inspired** | `.grad-mesh-brand`, `.grad-mesh-hero` | `--grad-mesh-brand` | Premium backgrounds, hero sections |
| **Overlay** | `.grad-overlay-bottom`, `.grad-overlay-top`, `.grad-overlay-vignette`, `.grad-overlay-brand`, `.grad-overlay-layer--*` | `--grad-linear-fade-up` | Media overlays, category cards |
| **Text** | `.grad-text-brand`, `.grad-text-accent`, `.grad-text-foreground` | `--grad-text-brand` | Headlines, accent copy |
| **Border** | `.grad-border-brand`, `.grad-border-accent`, `.grad-border-subtle` | `--grad-border-brand` | Cards, panels, inputs |
| **Button** | `.grad-button-brand`, `.grad-button-accent`, `.grad-button-subtle` | `--grad-button-brand` | Primary CTAs |
| **Hero** | `.grad-hero-brand`, `.grad-hero-dramatic`, `.grad-hero-mesh`, `.grad-hero-vignette` | `--grad-hero-dramatic` | Banner / hero sections |
| **Card** | `.grad-card-brand`, `.grad-card-accent`, `.grad-card-mesh`, `.grad-card-overlay` | `--grad-card-surface` | Content / category cards |

### Merchant Control

```css
:root {
  --gradient-intensity: 1;        /* 0.5 = softer stops, 1 = default, 1.5 = stronger */
  --gradient-angle: 135deg;       /* default diagonal for linear / conic / border */
  --gradient-angle-vertical: 180deg;
  --gradient-overlay-opacity: 1;  /* scales overlay gradient strength */
}
```

Color stops map to Dawn channels and can be overridden per section:

```css
.custom-hero {
  --grad-color-mid: var(--color-button);
  --grad-color-accent: var(--color-link);
  --gradient-angle: 160deg;
}
```

### Alignment with Existing Gradients

| Existing Style | Value | Nether Alignment |
|---|---|---|
| Dawn `.gradient` | `var(--gradient-background)` | Separate namespace — not replaced |
| `.card--gradient-border` | `135deg` foreground → button → foreground | `--grad-border-brand` extends via optional `.grad-border-*` bridges |
| `.card--type-category` overlay | `to top, shadow 0.55 → transparent` | `--grad-linear-fade-up` / `.grad-card-overlay` |

---

## 5. Utility Classes

### Background Gradients

| Class | Effect |
|---|---|
| `.grad-linear-brand` | Brand linear (background → button → foreground) |
| `.grad-linear-subtle` | Subtle background → contrast fade |
| `.grad-linear-accent` | Button → link accent |
| `.grad-linear-fade-down` | Top-down shadow fade |
| `.grad-linear-fade-up` | Bottom-up shadow fade |
| `.grad-radial-glow` | Center glow from button color |
| `.grad-radial-corner` | Top-right accent spotlight |
| `.grad-radial-vignette` | Edge vignette |
| `.grad-conic-brand` | Conic sweep using theme colors |
| `.grad-mesh-brand` | Layered radial mesh |
| `.grad-mesh-hero` | Hero-optimized mesh |

### Text Gradients

| Class | Effect |
|---|---|
| `.grad-text-brand` | Button → link gradient text |
| `.grad-text-accent` | Accent linear text |
| `.grad-text-foreground` | Foreground fade text |

All text utilities include `color: rgb(var(--color-foreground))` as a solid fallback.

### Border Gradients

| Class | Effect |
|---|---|
| `.grad-border-brand` | Brand border via mask pseudo-element |
| `.grad-border-accent` | Accent border |
| `.grad-border-subtle` | Subtle foreground border |

Uses the same mask technique as `.card--gradient-border` without replacing it.

### Overlay Gradients

| Class | Effect |
|---|---|
| `.grad-overlay-bottom` | Bottom fade fill |
| `.grad-overlay-top` | Top fade fill |
| `.grad-overlay-vignette` | Vignette fill |
| `.grad-overlay-brand` | Brand-tinted bottom fade |
| `.grad-overlay-layer--bottom` | `::after` bottom overlay layer |
| `.grad-overlay-layer--top` | `::after` top overlay layer |
| `.grad-overlay-layer--vignette` | `::after` vignette layer |
| `.grad-overlay-layer--brand` | `::after` brand overlay layer |

### Hover Gradients

| Class | Trigger | Effect |
|---|---|---|
| `.grad-hover-brand` | `:hover` | Applies brand linear gradient |
| `.grad-hover-accent` | `:hover` | Applies accent gradient |
| `.grad-hover-glow` | `:hover` | Radial glow + subtle base |
| `.grad-hover-text-brand` | `:hover` | Brand text gradient |
| `.grad-hover-button-brand` | `:hover` on `.button` | Reversed button gradient |

Hover utilities respect `prefers-reduced-motion: reduce`.

### Animated-Ready Gradients (CSS variables only)

| Class | Prepared Tokens | Future Use |
|---|---|---|
| `.grad-ready-linear` | `--grad-ready-size`, `--grad-ready-position`, `--grad-ready-recipe` | Animated linear sweep |
| `.grad-ready-accent` | Same + accent recipe | Animated accent shift |
| `.grad-ready-shimmer` | `--grad-ready-shimmer`, shimmer angle | Shimmer overlay animation |
| `.grad-ready-mesh` | `--grad-ready-mesh-a/b/c` | Animated mesh repositioning |
| `.grad-ready-conic` | `--grad-ready-conic-origin`, `--grad-ready-conic-from` | Conic rotation animation |

No `@keyframes` are implemented yet — only custom properties for future animation layers.

### System Integration

| System | Integration Method |
|---|---|
| **Button System** | `.grad-button-*` and `.grad-hover-button-brand` via `class` on `snippets/button.liquid` |
| **Card System** | `.grad-card-*`; `.card--gradient-border.grad-border-*` intensity bridges; `style: 'glass'` / `gradient_border: true` unchanged |
| **Badge System** | `.grad-badge-*` via `class` on `snippets/badge.liquid` |
| **Glass Effects** | `.grad-with-glass` helper; compose e.g. `.grad-hero-brand.glass-overlay` |
| **Shadow System** | `.grad-with-shadow-sm/md/lg` uses `--shadow-level-*` with local fallbacks |
| **Border Radius System** | `.grad-radius-inherit`; compose with `.radius-*` on same element |

---

## 6. Accessibility Improvements

| Feature | Implementation |
|---|---|
| **Text gradient fallback** | All `.grad-text-*` utilities set solid `color: rgb(var(--color-foreground))` before clip |
| **Readable wrappers** | `.grad-readable` / `.grad-readable--on-dark` keep nested copy at full contrast |
| **Overlay text safety** | `.grad-overlay-readable` disables text gradients inside overlays |
| **Text shadow helper** | `.grad-text-safe` adds subtle shadow for text on busy gradients |
| **High contrast mode** | `@media (prefers-contrast: more)` removes decorative gradients; strengthens overlay opacity |
| **Forced colors** | `@media (forced-colors: active)` solidifies backgrounds; hides border pseudo-elements; uses Canvas / CanvasText |
| **Reduced motion** | Hover filter/transition disabled under `prefers-reduced-motion: reduce` |
| **Existing overlays** | Category card overlay in `component-card-premium.css` unchanged |

**Guidance:** Place hero copy inside `.grad-readable` or `.grad-overlay-readable`. Use `.grad-hero-dramatic` with `.grad-text-safe` for headlines over photography.

---

## 7. Performance Improvements

| Aspect | Detail |
|---|---|
| **Pure CSS** | Zero JavaScript; no runtime overhead |
| **Single global file** | One `component-gradient.css` load in `theme.liquid` |
| **Token reuse** | Dawn color channels and existing system tokens — no duplicated component rules |
| **No duplication** | Does not copy `.gradient`, `.card--gradient-border`, or Dawn overlay styles |
| **GPU-friendly** | Gradients use CSS `background-image`; mesh uses layered radials (no images) |
| **Animated-ready without cost** | Custom properties only — no active animations until explicitly added later |
| **Theme Check compatible** | Standard `stylesheet_tag` asset reference; no Liquid in CSS |
| **Online Store 2.0** | Utilities work in sections, blocks, snippets, and schema class fields |

---

## 8. Example Usage

### Global Merchant Intensity (Future Theme Setting)

```css
:root {
  --gradient-intensity: 1.2;
  --gradient-angle: 160deg;
  --gradient-overlay-opacity: 0.85;
}
```

### Hero Section with Mesh + Overlay

```html
<section class="banner grad-hero-mesh grad-overlay-layer--bottom grad-readable">
  <div class="banner__content glass-hero-medium radius-lg">
    <h1 class="grad-text-brand grad-text-safe">New Collection</h1>
    <p>Designed for modern living.</p>
    {% render 'button', label: 'Shop Now', class: 'grad-button-brand radius-button-pill' %}
  </div>
</section>
```

### Content Card with Gradient Surface

```liquid
{% render 'card',
  type: 'feature',
  heading: 'Sustainable',
  description: 'Responsibly sourced materials.',
  class: 'grad-card-mesh radius-lg shadow-md'
%}
```

### Gradient Border Card (extends existing)

```liquid
{% render 'card',
  type: 'testimonial',
  quote: 'Outstanding quality.',
  attribution: 'Alex M.',
  gradient_border: true,
  class: 'grad-border-accent radius-lg'
%}
```

### Gradient Button

```liquid
{% render 'button',
  label: 'Add to Cart',
  class: 'button--primary grad-button-brand grad-hover-button-brand radius-button-md'
%}
```

### Gradient Badge

```liquid
{% render 'badge',
  label: 'Sale',
  style: 'pill',
  class: 'grad-badge-brand'
%}
```

### Text Gradient Headline

```html
<h2 class="grad-text-brand grad-readable">Premium Craftsmanship</h2>
```

### Category Card Overlay

```liquid
{% render 'card',
  type: 'category',
  heading: 'Accessories',
  image: collection.image,
  class: 'grad-card-overlay'
%}
```

### Border Gradient Panel

```html
<div class="grad-border-brand radius-lg grad-with-shadow-md grad-readable" style="padding: 2rem;">
  <h3>Membership Benefits</h3>
  <p>Exclusive access and early releases.</p>
</div>
```

### Product Card with Hover Gradient

```html
<div class="card-wrapper product-card-wrapper grad-hover-brand radius-product-card-sm">
  {% render 'card-product', card_product: product %}
</div>
```

### Animated-Ready Hero (future animation)

```html
<div class="grad-linear-brand grad-ready-linear grad-hero-dramatic radius-xl">
  <!-- Wire keyframes later using --grad-ready-size / --grad-ready-position -->
</div>
```

### Compose with Glass and Shadow

```html
<div class="grad-mesh-brand glass-medium radius-lg grad-with-shadow-lg grad-readable">
  <h2>Layered premium surface</h2>
</div>
```

### Section Background Override

```html
<div class="color-scheme-1 gradient grad-mesh-brand section-{{ section.id }}-padding">
  <!-- Dawn .gradient provides scheme background; grad-mesh-brand adds mesh layer -->
</div>
```

---

## Integration Summary

| System | Status |
|---|---|
| **Button System** | Additive `.grad-button-*` utilities |
| **Card System** | Additive `.grad-card-*` + `.card--gradient-border.grad-border-*` bridges |
| **Badge System** | Additive `.grad-badge-*` utilities |
| **Glass Effects** | `.grad-with-glass` composition helper |
| **Shadow System** | `.grad-with-shadow-*` composition helper |
| **Border Radius System** | `.grad-radius-inherit` + free `.radius-*` composition |
| **Dawn `.gradient`** | Preserved — `.grad-*` is a separate additive namespace |

---

*Nether Premium Gradient Utilities System — production-ready, Theme Check compatible, Online Store 2.0 compatible.*
