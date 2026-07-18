# Nether Premium Glass Effects System — Report

## 1. Summary

The Nether Premium Glass Effects System extends Dawn and Nether background architecture without replacing or duplicating existing styles. All six glass styles, feature utilities (blur, transparency, borders, shadows, layered, overlay), and nine category contexts build on established design tokens — `--color-background`, `--color-foreground`, `--color-button`, `--color-button-text`, `--color-shadow`, and optional Shadow / Radius System variables — so every existing card, button, badge, form, drawer, popup, and hero section continues to work unchanged.

A single dedicated stylesheet (`assets/component-glass.css`) provides reusable design tokens and utility classes for all future Nether sections. No JavaScript is required.

**Key design decisions:**

- **Extend, don't replace** — Existing `.card--premium-glass` rules in `component-card-premium.css` remain untouched. New utilities and optional modifier bridges (`.card--premium-glass.glass-heavy`, etc.) extend that style without changing its defaults.
- **Namespaced utilities** — Nether classes use the `.glass-*` prefix with no collisions in Dawn.
- **Merchant-friendly intensity** — Global multipliers `--glass-blur-intensity`, `--glass-opacity-intensity`, `--glass-border-intensity`, and `--glass-bg-intensity` (all default `1`) scale glass surfaces without rewriting components; ready to wire to future theme settings.
- **Token reuse** — Glass tints and text colors derive from Dawn color channels; glass shadows fall back to local tokens and compose with `--shadow-level-*` / `--shadow-intensity` when the Shadow System is present.
- **Accessible contrast** — Light glass uses foreground text on background tint; dark/colored glass swaps to readable inverse / button-text colors. Reduced transparency and forced-colors modes disable blur and solidify backgrounds.
- **Pure CSS** — Zero JavaScript; lightweight token + utility architecture.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-glass.css` | Glass style tokens, feature utilities, category bridges, and accessibility fallbacks |
| `GLASS_EFFECTS_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-glass.css` globally after `component-radius.css` |
| `layout/password.liquid` | Added `component-glass.css` for password layout parity |

**Not modified (intentionally preserved):**

| File | Why |
|---|---|
| `assets/component-card-premium.css` | Existing `.card--premium-glass` background / blur / border rules left intact |
| `assets/base.css` | No existing overlay or background styles replaced |
| Button / Badge / Form / Shadow / Radius CSS | Integration via additive utility classes only |

---

## 4. Glass Styles

| Style | Utility Class | Blur Token | BG Opacity | Typical Use |
|---|---|---|---|---|
| **Light Glass** | `.glass-light` | `--glass-blur-light` (`0.6rem`) | `--glass-bg-opacity-light` (`0.35`) | Subtle panels, nav bars |
| **Medium Glass** | `.glass-medium` | `--glass-blur-medium` (`1.2rem`) | `--glass-bg-opacity-medium` (`0.55`) | Default cards / hero content |
| **Heavy Glass** | `.glass-heavy` | `--glass-blur-heavy` (`2rem`) | `--glass-bg-opacity-heavy` (`0.72`) | Dense overlays, drawers |
| **Frosted Glass** | `.glass-frosted` | `--glass-blur-frosted` (`2.4rem` + saturate) | `--glass-bg-opacity-frosted` (`0.48`) | Premium hero / modal panels |
| **Dark Glass** | `.glass-dark` | `--glass-blur-medium` | `--glass-bg-opacity-dark` (`0.55` on foreground) | Dark overlays on bright media |
| **Colored Glass** | `.glass-colored` | `--glass-blur-medium` | `--glass-bg-opacity-colored` (`0.45` on button) | Brand-tinted CTAs / badges |

### Merchant Control

```css
:root {
  --glass-blur-intensity: 1;      /* 0 = no blur scaling, 1 = default, 1.5 = stronger blur */
  --glass-opacity-intensity: 1;   /* scales all glass opacity tokens */
  --glass-border-intensity: 1;    /* scales glass border opacity */
  --glass-bg-intensity: 1;        /* scales glass background opacity */
}
```

Wire to future theme settings by outputting these values in `theme.liquid` `:root`.

### Alignment with Existing Card Glass

| Existing Style | Value | Nether Token Alignment |
|---|---|---|
| `.card--premium-glass` blur | `1.2rem` | `--glass-blur-medium` |
| `.card--premium-glass` background | `rgba(..., 0.55)` | `--glass-bg-opacity-medium` |
| `.card--premium-glass` border | `rgba(foreground, 0.08)` | Near `--glass-border-opacity-light` |

Existing `.card--premium-glass` continues to render exactly as before. Optional modifiers refine intensity:

```html
<div class="card card--card card--premium-glass glass-frosted">
```

---

## 5. Utility Classes

### Direct Glass Styles

| Class | Effect |
|---|---|
| `.glass-light` | Light blur + high transparency |
| `.glass-medium` | Balanced frosted panel (default recipe) |
| `.glass-heavy` | Stronger blur + higher opacity |
| `.glass-frosted` | Max blur + subtle saturation + inset highlight |
| `.glass-dark` | Foreground-tinted glass with light text |
| `.glass-colored` | Button-color tinted glass with button text |
| `.glass-surface` | Token-driven base surface (set `--glass-*` vars first) |

### Feature Utilities

| Class | Effect |
|---|---|
| `.glass-border` / `.glass-border-dark` | Glass edge only |
| `.glass-shadow` / `.glass-shadow-light` / `.glass-shadow-heavy` / `.glass-shadow-inset` | Glass-specific shadows |
| `.glass-blur-only` | Backdrop blur without opaque fill |
| `.glass-layered` | Dual-layer glass via `::before` underlay |
| `.glass-overlay` / `.glass-overlay--dark` | Full-bleed overlay glass (no border/shadow) |
| `.glass-text-contrast` / `.glass-text-contrast--on-dark` | Readable text on glass |
| `.glass-readable` / `.glass-readable--on-dark` | Contrast wrapper for nested content |
| `.glass-with-shadow-sm/md/lg` | Compose with Shadow System levels |

### Category Utilities

| Category | Pattern | Examples |
|---|---|---|
| **Cards** | `.glass-card-{style}` | `.glass-card-medium`, `.glass-card-frosted` |
| **Buttons** | `.glass-button-{style}` | `.glass-button-light`, `.glass-button-dark` |
| **Badges** | `.glass-badge-{style}` | `.glass-badge-frosted`, `.glass-badge-colored` |
| **Forms** | `.glass-form-{style}` | `.glass-form-light`, `.glass-form-frosted` |
| **Drawers** | `.glass-drawer-{style}` | `.glass-drawer-medium`, `.glass-drawer-dark` |
| **Popups / Modals** | `.glass-popup-{style}` / `.glass-modal-{style}` | `.glass-modal-frosted` |
| **Hero Content** | `.glass-hero-{style}` | `.glass-hero-medium`, `.glass-hero-colored` |
| **Navigation** | `.glass-nav-{style}` | `.glass-nav-frosted`, `.glass-nav-dark` |
| **Product Cards** | `.glass-product-card-{style}` | `.glass-product-card-medium` |

Replace `{style}` with: `light`, `medium`, `heavy`, `frosted`, `dark`, or `colored` (where defined for that category).

### System Integration

| System | Integration Method |
|---|---|
| **Card System** | `.glass-card-*` utilities; optional `.card--premium-glass.glass-*` intensity bridges; `snippets/card.liquid` `style: 'glass'` unchanged |
| **Button System** | `.glass-button-*` via `class` on `snippets/button.liquid` |
| **Badge System** | `.glass-badge-*` via `class` on `snippets/badge.liquid` |
| **Form System** | `.glass-form-*` on field wrappers / form containers |
| **Shadow System** | `.glass-with-shadow-*` uses `--shadow-level-*` with local fallbacks |
| **Border Radius System** | Compose freely (e.g. `.glass-medium.radius-lg`); hero glass defaults to `--radius-md` |

---

## 6. Accessibility Improvements

| Feature | Implementation |
|---|---|
| **Text contrast on light glass** | Uses `rgb(var(--color-foreground))` via `--glass-text-on-light` |
| **Text contrast on dark glass** | Uses `rgb(var(--color-background))` via `--glass-text-on-dark` |
| **Colored glass text** | Uses Dawn `--color-button-text` for brand surfaces |
| **Contrast helpers** | `.glass-text-contrast` and `.glass-readable` keep nested copy readable |
| **Reduced transparency** | `@media (prefers-reduced-transparency: reduce)` removes backdrop-filter and solidifies backgrounds |
| **Forced colors** | `@media (forced-colors: active)` switches to Canvas / CanvasText borders; disables blur and layered underlays |
| **Existing card glass** | High-contrast rules for `.card--premium-glass` in `component-card-premium.css` remain in place |

**Guidance:** Prefer `.glass-heavy` or `.glass-dark` when placing body text over busy imagery. Pair hero glass with `.glass-text-contrast` for headlines over photos.

---

## 7. Performance Improvements

| Aspect | Detail |
|---|---|
| **Pure CSS** | Zero JavaScript; no runtime overhead |
| **Single global file** | One `component-glass.css` load in `theme.liquid` — no per-section duplication |
| **Token reuse** | Uses Dawn color channels and existing Shadow / Radius tokens instead of redefining component rules |
| **No duplication** | Does not copy or replace `.card--premium-glass` or Dawn overlay styles |
| **Reduced transparency opt-out** | Disables expensive `backdrop-filter` for users who prefer less transparency |
| **Theme Check compatible** | Standard `stylesheet_tag` asset reference; no Liquid in CSS |
| **Online Store 2.0** | Compatible with sections, blocks, and theme editor — utilities work in custom Liquid and schema class fields |

---

## 8. Example Usage

### Global Merchant Intensity (Future Theme Setting)

```css
:root {
  --glass-blur-intensity: 1.25;
  --glass-bg-intensity: 1.1;
  --glass-border-intensity: 1;
  --glass-opacity-intensity: 1;
}
```

### Content Card with Glass + Radius + Shadow

```liquid
{% render 'card',
  type: 'feature',
  heading: 'Premium Materials',
  description: 'Designed for lasting quality.',
  style: 'glass',
  radius: 'lg',
  shadow: 'md',
  class: 'glass-frosted radius-focus-safe'
%}
```

### Direct Glass Card Utility

```html
<div class="card card--card glass-card-medium radius-lg shadow-md">
  <div class="card__inner color-scheme-1">
    <!-- card content -->
  </div>
</div>
```

### Glass Button

```liquid
{% render 'button',
  label: 'Shop Collection',
  class: 'button--outline glass-button-frosted radius-button-pill'
%}
```

### Glass Badge on Product Media

```liquid
{% render 'badge',
  label: 'Limited',
  style: 'pill',
  class: 'glass-badge-dark'
%}
```

### Hero Content Glass Panel

```html
<section class="banner">
  <div class="banner__content glass-hero-medium glass-readable radius-lg">
    <h1 class="glass-text-contrast">New Season</h1>
    <p>Discover the latest arrivals.</p>
    {% render 'button', label: 'Explore', class: 'glass-button-light' %}
  </div>
</section>
```

### Sticky Navigation Glass

```html
<header class="header-wrapper glass-nav-frosted">
  <!-- header content -->
</header>
```

### Modal / Popup Glass

```html
<div class="product-popup-modal__content glass-modal-frosted radius-modal-lg radius-focus-safe">
  <!-- modal content -->
</div>
```

### Drawer Glass

```html
<cart-drawer class="drawer glass-drawer-medium radius-drawer-t-md">
  <!-- drawer content -->
</cart-drawer>
```

### Overlay Glass on Media

```html
<div class="media media--transparent">
  <img src="..." alt="">
  <div class="glass-overlay glass-overlay--dark">
    <p class="glass-text-contrast--on-dark">Featured look</p>
  </div>
</div>
```

### Layered Glass Panel

```html
<div class="glass-medium glass-layered radius-xl shadow-lg">
  <h2>Layered depth</h2>
  <p>Underlay blur plus primary glass surface.</p>
</div>
```

### Product Card Wrapper

```liquid
<div class="card-wrapper product-card-wrapper glass-product-card-medium radius-product-card-sm">
  {% render 'card-product', card_product: product %}
</div>
```

### Form on Glass Surface

```html
<div class="newsletter glass-form-frosted radius-md">
  {% render 'form-field', id: 'email', name: 'contact[email]', label: 'Email' %}
</div>
```

### Colored Brand Glass CTA

```html
<div class="glass-colored radius-lg glass-with-shadow-md">
  <p>Members save 15% this week.</p>
  {% render 'button', label: 'Join', class: 'glass-button-colored' %}
</div>
```

---

## Integration Summary

| System | Status |
|---|---|
| **Button System** | Additive `.glass-button-*` utilities |
| **Card System** | Additive `.glass-card-*` + optional `.card--premium-glass.glass-*` bridges; existing glass style preserved |
| **Badge System** | Additive `.glass-badge-*` utilities |
| **Shadow System** | `.glass-with-shadow-*` + shared `--color-shadow` / `--shadow-intensity` |
| **Border Radius System** | Compose with `.radius-*` / category radius utilities |

---

*Nether Premium Glass Effects System — production-ready, Theme Check compatible, Online Store 2.0 compatible.*
