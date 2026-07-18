# Nether Premium Shadow System — Report

## 1. Summary

The Nether Premium Shadow System extends Dawn's existing shadow architecture without replacing or duplicating it. All nine shadow levels, five interaction variants, and eleven category contexts build on the established Dawn token structure — `--color-shadow`, component-scoped `--shadow-*` variables, `--buttons-shadow-*`, `--inputs-shadow-*`, `--popup-shadow-*`, `--drawer-shadow-*`, and `--focused-base-box-shadow` — so every existing card, button, input, modal, drawer, and dropdown across the theme continues to work unchanged.

A single dedicated stylesheet (`assets/component-shadow.css`) provides reusable design tokens and utility classes for all future Nether sections. No JavaScript is required.

**Key design decisions:**

- **Extend, don't replace** — Dawn pseudo-element shadows on `.card::after`, `.button::before`, `.field::before`, popup/drawer components, and existing `.card--shadow-sm` / `.card--shadow-lg` in `component-card-premium.css` remain untouched.
- **Namespaced utilities** — Nether classes use the `.shadow-*`, `.shadow-vars-*`, `.shadow-context-*`, and `.shadow-hover-*` prefixes with no collisions in Dawn.
- **Merchant-friendly intensity** — Global `--shadow-intensity` multiplier (default `1`) scales all Nether levels without rewriting components; ready to wire to a future theme setting.
- **Dawn token reuse** — Modal and dropdown levels derive from `--popup-shadow-*`; drawer context uses `--drawer-shadow-*`; button/input/card contexts map to existing theme settings.
- **Accessible focus** — `.shadow-focus-*` utilities are supplementary only; interactive elements retain Dawn `--focused-base-box-shadow` focus rings.
- **Pure CSS** — Zero JavaScript; lightweight token + utility architecture.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-shadow.css` | Shadow level tokens, category bridges, and utility classes |
| `SHADOW_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-shadow.css` globally after `component-form.css` |
| `layout/password.liquid` | Added `component-shadow.css` for password layout parity |

---

## 4. Shadow Levels

| Level | CSS Token | Utility Class | Variable Bridge | Typical Use |
|---|---|---|---|---|
| **None** | `--shadow-level-none` | `.shadow-none` | `.shadow-vars-none` | Flat surfaces |
| **Extra Small** | `--shadow-level-xs` | `.shadow-xs` | `.shadow-vars-xs` | Badges, chips |
| **Small** | `--shadow-level-sm` | `.shadow-sm` | `.shadow-vars-sm` | Buttons, compact cards |
| **Medium** | `--shadow-level-md` | `.shadow-md` | `.shadow-vars-md` | Default elevation |
| **Large** | `--shadow-level-lg` | `.shadow-lg` | `.shadow-vars-lg` | Product/collection cards |
| **Extra Large** | `--shadow-level-xl` | `.shadow-xl` | `.shadow-vars-xl` | Hero cards, feature blocks |
| **Floating** | `--shadow-level-floating` | `.shadow-floating` | `.shadow-vars-floating` | FABs, sticky CTAs |
| **Modal** | `--shadow-level-modal` | `.shadow-modal` | — | Modals, popups (uses `--popup-shadow-*`) |
| **Dropdown** | `--shadow-level-dropdown` | `.shadow-dropdown` | — | Menus, tooltips, predictive search |

### Merchant Control

```css
:root {
  --shadow-intensity: 1; /* 0 = flat, 1 = default, 2 = dramatic */
}
```

All Nether level opacities scale via `calc(* * var(--shadow-intensity))`. Wire to a future `settings.shadow_intensity` theme setting by outputting the value in `theme.liquid` `:root`.

### Card System Bridge

Extends existing Card System modifiers without modifying `component-card-premium.css`:

| Class | Aligns With |
|---|---|
| `.card--shadow-xs` | New — extra small card elevation |
| `.card--shadow-sm` | Existing in `component-card-premium.css` |
| `.card--shadow-md` | New — medium card elevation |
| `.card--shadow-lg` | Existing in `component-card-premium.css` |
| `.card--shadow-xl` | New — extra large card elevation |
| `.card--shadow-floating` | New — floating card elevation |
| `.card--shadow-none` | Existing in `component-card-premium.css` |

---

## 5. Utility Classes

### Direct Box Shadow

| Class | Effect |
|---|---|
| `.shadow-none` | No shadow |
| `.shadow-xs` | Extra small elevation |
| `.shadow-sm` | Small elevation |
| `.shadow-md` | Medium elevation |
| `.shadow-lg` | Large elevation |
| `.shadow-xl` | Extra large elevation |
| `.shadow-floating` | Floating elevation |
| `.shadow-modal` | Modal/popup elevation |
| `.shadow-dropdown` | Dropdown/tooltip elevation |

### Dawn Variable Bridges

For components using `::before` / `::after` pseudo-element shadows (cards, buttons, fields):

| Class | Sets |
|---|---|
| `.shadow-vars-none` | Zeroes `--shadow-*` variables |
| `.shadow-vars-xs` through `.shadow-vars-floating` | Maps level tokens to `--shadow-horizontal-offset`, `--shadow-vertical-offset`, `--shadow-blur-radius`, `--shadow-opacity` |

### Category Context

| Class | Maps To |
|---|---|
| `.shadow-context-button` | `--buttons-shadow-*` |
| `.shadow-context-input` / `.shadow-context-field` | `--inputs-shadow-*` |
| `.shadow-context-product-card` | `--product-card-shadow-*` |
| `.shadow-context-collection-card` | `--collection-card-shadow-*` |
| `.shadow-context-media` / `.shadow-context-image` | `--media-shadow-*` |
| `.shadow-context-modal` / `.shadow-context-popover` | `--popup-shadow-*` via `--shadow-level-modal` |
| `.shadow-context-drawer` | `--drawer-shadow-*` via `filter: drop-shadow()` |
| `.shadow-context-dropdown` / `.shadow-context-tooltip` | `--shadow-level-dropdown` |

### Interaction Utilities

| Class | Trigger | Notes |
|---|---|---|
| `.shadow-hover-xs` through `.shadow-hover-floating` | `:hover` | Fine pointer only; disabled under `prefers-reduced-motion` |
| `.shadow-hover-none` | `:hover` | Removes shadow on hover |
| `.shadow-hover-vars-sm` through `.shadow-hover-vars-floating` | `:hover` | Variable bridge for pseudo-element components |
| `.shadow-active-sm` / `.shadow-active-md` | `:active` | Pressed state elevation |
| `.shadow-active-inset-sm` | `:active` | Pressed inset shadow |
| `.shadow-focus-sm` / `.shadow-focus-md` | `:focus-visible` | Supplementary only — pair with Dawn focus ring |
| `.shadow-focus-dropdown` | `:focus-visible` | Dropdown focus elevation |

### Inset Shadows

| Class | Effect |
|---|---|
| `.shadow-inset-sm` | Subtle inset depth |
| `.shadow-inset-md` | Medium inset depth |
| `.shadow-inset-lg` | Deep inset depth |

### Helpers

| Class | Effect |
|---|---|
| `.shadow-transition` | Smooth `box-shadow` transition using Dawn duration tokens |

---

## 6. Accessibility Improvements

- **Focus not shadow-only** — `.shadow-focus-*` utilities add supplementary elevation; `.button.shadow-focus-*` explicitly preserves `--focused-base-box-shadow` for keyboard focus visibility.
- **Reduced motion** — Hover shadow transitions and hover elevation changes disabled under `prefers-reduced-motion: reduce`.
- **Forced colours** — Decorative box shadows removed under `forced-colors: active` so borders and outlines remain the primary visual cues.
- **No focus regression** — Dawn `:focus-visible` rings on buttons, links, fields, and cards are untouched.
- **Contrast-safe** — All shadows use `rgba(var(--color-shadow), …)` from the active colour scheme, maintaining theme-consistent contrast.

---

## 7. Performance Improvements

- **Single CSS file** (~5 KB unminified) loaded once globally — no per-section stylesheets.
- **Zero JavaScript** — No runtime overhead.
- **Design token reuse** — Modal, dropdown, drawer, button, input, and card contexts reference existing Dawn theme settings tokens.
- **No duplicate styles** — `component-shadow.css` contains only delta rules; all foundational shadow rendering remains in `base.css` and component stylesheets.
- **GPU-friendly** — Uses `box-shadow` and `filter: drop-shadow()` only; no layout-triggering properties.
- **Theme Check** — Passes with no new errors.
- **Backward compatible** — All existing shadow usages across cards, buttons, inputs, popups, drawers, and media components are unaffected.

---

## 8. Example Usage

### Feature Card with Hover Elevation

```liquid
{% render 'card',
  heading: 'Premium feature',
  card_style: 'elevated',
  class: 'shadow-vars-md shadow-hover-vars-lg shadow-transition'
%}
```

Or with direct utility:

```html
<div class="content-container shadow-md shadow-hover-lg shadow-transition">
  ...
</div>
```

### Product Card Shadow Levels

```html
<!-- Existing (unchanged) -->
<div class="card-wrapper product-card-wrapper">
  <div class="card card--shadow-sm">...</div>
</div>

<!-- New levels via Shadow System -->
<div class="card-wrapper product-card-wrapper shadow-context-product-card">
  <div class="card card--shadow-floating shadow-transition">...</div>
</div>
```

### Button with Context + Hover

```liquid
{% render 'button',
  label: 'Shop now',
  link: '/collections/all',
  style: 'primary',
  class: 'shadow-context-button shadow-hover-vars-md shadow-transition'
%}
```

### Form Field with Input Shadow Context

```liquid
{% render 'form-field',
  type: 'email',
  name: 'contact[email]',
  label: 'Email',
  class: 'shadow-context-input shadow-vars-input'
%}
```

### Modal / Popover Panel

```html
<div class="modal__content shadow-context-modal shadow-transition" role="dialog">
  ...
</div>
```

### Dropdown / Predictive Search

```html
<div class="predictive-search shadow-context-dropdown">
  ...
</div>
```

### Drawer

```html
<div class="cart-drawer shadow-context-drawer">
  ...
</div>
```

### Image Container

```html
<div class="global-media-settings shadow-context-media shadow-vars-md">
  <img src="..." alt="">
</div>
```

### Badge with Subtle Elevation

```liquid
{% render 'badge', type: 'new', style: 'soft', size: 'small', class: 'shadow-xs' %}
```

### Floating CTA

```html
<div class="fixed-cta shadow-floating shadow-transition">
  {% render 'button', label: 'Book now', style: 'primary' %}
</div>
```

### Merchant Intensity Override (future theme setting)

```liquid
{% style %}
  :root {
    --shadow-intensity: {{ settings.shadow_intensity | default: 100 | divided_by: 100.0 }};
  }
{% endstyle %}
```

### Inset Shadow on Input

```html
<div class="field shadow-inset-sm">
  <input class="field__input" type="text" placeholder="Code">
  <label class="field__label" for="code">Discount code</label>
</div>
```

### Existing Dawn Shadows (unchanged)

```html
<!-- Product card — uses theme editor card shadow settings -->
<div class="product-card-wrapper">
  <div class="card card--card">...</div>
</div>

<!-- Button — uses theme editor button shadow settings -->
<button class="button">Add to cart</button>

<!-- Popup — uses theme editor popup shadow settings -->
<div class="cart-notification">...</div>
```

---

*Generated for the Nether Shopify Framework — Premium Shadow System v1.0*
