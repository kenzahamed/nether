# Nether Premium Border Radius System — Report

## 1. Summary

The Nether Premium Border Radius System extends Dawn's existing radius architecture without replacing or duplicating it. All eight radius levels, directional corner utilities, and nine category contexts build on the established Dawn token structure — `--buttons-radius`, `--inputs-radius`, `--border-radius`, `--media-radius`, `--popup-corner-radius`, `--badge-corner-radius`, `--product-card-corner-radius`, and `--collection-card-corner-radius` — so every existing card, button, input, modal, drawer, badge, and media element across the theme continues to work unchanged.

A single dedicated stylesheet (`assets/component-radius.css`) provides reusable design tokens and utility classes for all future Nether sections. No JavaScript is required.

**Key design decisions:**

- **Extend, don't replace** — Dawn pseudo-element radii on `.card::before`, `.button::before`, `.field::before`, popup/drawer components, and existing `.card--radius-none` / `.card--radius-sm` / `.card--radius-lg` / `.card--radius-full` in `component-card-premium.css` remain untouched.
- **Namespaced utilities** — Nether classes use the `.radius-*`, `.radius-vars-*`, `.radius-context-*`, and `.radius-{category}-*` prefixes with no collisions in Dawn.
- **Merchant-friendly scale** — Global `--radius-scale` multiplier (default `1`) scales rem-based levels without rewriting components; ready to wire to a future theme setting.
- **Dawn token reuse** — Category context bridges map to existing theme settings; button/form utilities derive outset values from `--buttons-border-width` and `--inputs-border-width`.
- **Accessible focus** — `.radius-focus-safe` prevents focus ring clipping; interactive elements retain Dawn `--focused-base-box-shadow` focus rings.
- **Pure CSS** — Zero JavaScript; lightweight token + utility architecture.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-radius.css` | Radius level tokens, category bridges, directional utilities, and system integration |
| `BORDER_RADIUS_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-radius.css` globally after `component-shadow.css` |
| `layout/password.liquid` | Added `component-radius.css` for password layout parity |
| `assets/component-badge.css` | Pointed `--badge-pill-radius` and `--badge-rounded-radius` at scale tokens with fallbacks |

---

## 4. Radius Levels

| Level | CSS Token | Composed Alias | Default Value | Typical Use |
|---|---|---|---|---|
| **None** | `--radius-none` | `--radius-level-none` | `0` | Flat surfaces, drawers |
| **Extra Small** | `--radius-xs` | `--radius-level-xs` | `0.2rem` | Chips, swatches, fine detail |
| **Small** | `--radius-sm` | `--radius-level-sm` | `0.4rem` | Badges, compact cards, sliders |
| **Medium** | `--radius-md` | `--radius-level-md` | `0.8rem` | Default content cards |
| **Large** | `--radius-lg` | `--radius-level-lg` | `1.6rem` | Product/collection cards |
| **Extra Large** | `--radius-xl` | `--radius-level-xl` | `2rem` | Hero cards, feature blocks |
| **Pill** | `--radius-pill` | `--radius-level-pill` | `10rem` | Badges, variant pills, CTAs |
| **Full Circle** | `--radius-circle` | `--radius-level-circle` | `50%` | Avatars, icon buttons, circular media |

### Merchant Control

```css
:root {
  --radius-scale: 1; /* 0.5 = tighter, 1 = default, 1.5 = rounder */
}
```

Rem-based levels (`xs` through `xl`) scale via `calc(* * var(--radius-scale))`. Pill and circle levels are intentionally fixed — pill uses `10rem` for fully rounded caps; circle uses `50%` for true circular elements. Wire to a future `settings.radius_scale` theme setting by outputting the value in `theme.liquid` `:root`.

### Alignment with Existing Values

| Existing Style | Value | Nether Token |
|---|---|---|
| `.card--radius-sm` | `0.4rem` | `--radius-sm` |
| `.card--radius-lg` | `1.6rem` | `--radius-lg` |
| `.card--radius-full` | `2rem` | `--radius-xl` |
| `.badge--rounded` | `0.4rem` | `--radius-sm` via `--badge-rounded-radius` |
| `.badge--pill` | `10rem` | `--radius-pill` via `--badge-pill-radius` |

---

## 5. Utility Classes

### Direct Border Radius (All Corners)

| Class | Effect |
|---|---|
| `.radius-none` | No rounding |
| `.radius-xs` | Extra small rounding |
| `.radius-sm` | Small rounding |
| `.radius-md` | Medium rounding |
| `.radius-lg` | Large rounding |
| `.radius-xl` | Extra large rounding |
| `.radius-pill` | Fully rounded caps |
| `.radius-circle` | Full circle (50%) |
| `.radius-inherit` | Inherit parent radius (nested media) |

### Dawn Variable Bridges

For components using `::before` / `::after` pseudo-element borders (cards, buttons, fields):

| Class | Sets |
|---|---|
| `.radius-vars-none` | `--border-radius: 0` |
| `.radius-vars-xs` through `.radius-vars-xl` | Maps level tokens to `--border-radius` |
| `.radius-vars-pill` | `--border-radius: var(--radius-pill)` |
| `.radius-vars-circle` | `--border-radius: var(--radius-circle)` |

### Category Context (Read Dawn Tokens)

| Class | Maps To |
|---|---|
| `.radius-context-button` | `--buttons-radius`, `--buttons-radius-outset` |
| `.radius-context-form` / `.radius-context-field` / `.radius-context-input` | `--inputs-radius`, `--inputs-radius-outset` |
| `.radius-context-card` | `--text-boxes-radius` via `--border-radius` |
| `.radius-context-image` / `.radius-context-media` | `--media-radius` |
| `.radius-context-badge` | `--badge-corner-radius` |
| `.radius-context-modal` / `.radius-context-popover` / `.radius-context-popup` | `--popup-corner-radius` |
| `.radius-context-drawer` | Flat (none) — drawers default square |
| `.radius-context-product-card` | `--product-card-corner-radius` |
| `.radius-context-collection-card` | `--collection-card-corner-radius` |
| `.radius-context-pill` | `--variant-pills-radius` |

### Directional Utilities

| Pattern | Effect |
|---|---|
| `.radius-t-{level}` | Top corners only |
| `.radius-b-{level}` | Bottom corners only |
| `.radius-l-{level}` | Left corners only |
| `.radius-r-{level}` | Right corners only |
| `.radius-tl-{level}` | Top-left corner only |
| `.radius-tr-{level}` | Top-right corner only |
| `.radius-bl-{level}` | Bottom-left corner only |
| `.radius-br-{level}` | Bottom corners only |

Replace `{level}` with: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `pill`, or `circle`.

**Example:** `.radius-t-lg` rounds only the top-left and top-right corners with the large token — ideal for drawer panels and bottom-anchored modals.

### Category Utilities

Apply radius to specific component types via CSS custom property bridges:

| Category | Pattern | Example |
|---|---|---|
| **Cards** | `.radius-card-{level}` | `.radius-card-lg` |
| **Buttons** | `.radius-button-{level}` | `.radius-button-pill` |
| **Forms** | `.radius-form-{level}` | `.radius-form-sm` |
| **Images** | `.radius-image-{level}` | `.radius-image-circle` |
| **Badges** | `.radius-badge-{level}` | `.radius-badge-pill` |
| **Modals** | `.radius-modal-{level}` | `.radius-modal-lg` |
| **Drawers** | `.radius-drawer-{level}` | `.radius-drawer-t-md` |
| **Product Cards** | `.radius-product-card-{level}` | `.radius-product-card-sm` |
| **Collection Cards** | `.radius-collection-card-{level}` | `.radius-collection-card-lg` |

### Card System Bridge

Extends existing Card System modifiers without modifying `component-card-premium.css`:

| Class | Aligns With |
|---|---|
| `.card--radius-none` | Existing in `component-card-premium.css` |
| `.card--radius-xs` | New — extra small card rounding |
| `.card--radius-sm` | Existing in `component-card-premium.css` |
| `.card--radius-md` | New — explicit medium (theme token default) |
| `.card--radius-lg` | Existing in `component-card-premium.css` |
| `.card--radius-xl` | New — extra large card rounding |
| `.card--radius-full` | Existing in `component-card-premium.css` (maps to `--radius-xl` value) |
| `.card--radius-pill` | New — pill-shaped cards |
| `.card--radius-circle` | New — circular cards |

The `snippets/card.liquid` `radius` parameter already outputs `card--radius-{value}` for any non-`md` value, so new levels work without snippet changes:

```liquid
{% render 'card', radius: 'xs', heading: 'Feature', description: 'Extra small corners' %}
{% render 'card', radius: 'pill', type: 'category', heading: 'Shop All' %}
```

### Button, Badge, and Form Bridges

| Integration | Classes |
|---|---|
| **Buttons** | `.radius-button-{level}` sets `--buttons-radius` and `--buttons-radius-outset` |
| **Badges** | `.radius-badge-{level}` applies direct `border-radius`; `.badge--pill` / `.badge--rounded` inherit scale tokens |
| **Forms** | `.radius-form-{level}` sets `--inputs-radius` and `--inputs-radius-outset`; `.field.radius-vars-sm` bridges pseudo-element borders |

### Shadow System Compatibility

Radius and shadow utilities compose freely — apply both on the same element:

```html
<div class="card card--card radius-card-lg shadow-lg card-hover-lift">
```

---

## 6. Accessibility Improvements

| Feature | Implementation |
|---|---|
| **Focus ring preservation** | `.radius-focus-safe` sets `overflow: visible` so Dawn `--focused-base-box-shadow` rings are not clipped by rounded containers |
| **Button focus** | `.button.radius-focus-safe:focus-visible` and `.button.radius-button-*:focus-visible` explicitly retain `var(--focused-base-box-shadow)` |
| **Form focus** | `.field.radius-focus-safe:focus-within` prevents clipping of input focus outlines |
| **Intentional clipping** | `.radius-clip-contents` available when overflow hidden is required (e.g. image zoom) — use separately from focus-safe |
| **No focus replacement** | Radius utilities never override Dawn focus styles; they only prevent accidental clipping |

**Guidance:** Pair `.radius-focus-safe` with interactive rounded containers. Use `.radius-clip-contents` only on non-interactive media wrappers.

---

## 7. Performance Improvements

| Aspect | Detail |
|---|---|
| **Pure CSS** | Zero JavaScript; no runtime overhead |
| **Single global file** | One `component-radius.css` load in `theme.liquid` — no per-section duplication |
| **Token reuse** | Category bridges read existing Dawn variables instead of redefining component rules |
| **No duplication** | Extends `component-card-premium.css`, `component-badge.css`, and Dawn `base.css` without copying their rules |
| **Lightweight selectors** | Utility classes use simple single-class selectors — no deep nesting |
| **Theme Check compatible** | Standard `stylesheet_tag` asset reference; no Liquid in CSS |
| **Online Store 2.0** | Compatible with sections, blocks, and theme editor — utilities work in custom Liquid and schema class fields |

---

## 8. Example Usage

### Global Token Override (Future Merchant Setting)

```css
/* In theme.liquid :root or a future settings output block */
:root {
  --radius-scale: 1.25;
}
```

### Content Card with Radius and Shadow

```liquid
{% render 'card',
  type: 'feature',
  heading: 'Premium Quality',
  description: 'Crafted with care.',
  radius: 'lg',
  shadow: 'md',
  hover: 'lift,shadow',
  class: 'radius-focus-safe'
%}
```

### Product Card Wrapper Override

```liquid
<div class="card-wrapper product-card-wrapper radius-product-card-md radius-focus-safe card-hover-lift">
  {% render 'card-product', card_product: product %}
</div>
```

### Pill Button

```liquid
{% render 'button',
  label: 'Shop Now',
  class: 'button--primary radius-button-pill radius-focus-safe'
%}
```

### Form Field with Small Radius

```liquid
{% render 'form-field',
  id: 'contact-email',
  name: 'contact[email]',
  label: 'Email',
  class: 'radius-form-sm radius-focus-safe'
%}
```

### Badge with Pill Radius

```liquid
{% render 'badge', label: 'New Arrival', style: 'pill', class: 'radius-badge-pill' %}
```

### Image with Circle Crop

```html
<div class="media global-media-settings radius-image-circle">
  <img src="..." alt="Team member portrait" width="200" height="200">
</div>
```

### Modal with Top-Only Radius

```html
<div class="product-popup-modal__content radius-modal-lg radius-t-lg radius-focus-safe">
  <!-- modal content -->
</div>
```

### Drawer with Rounded Top Corners

```html
<cart-drawer class="drawer radius-drawer-t-md radius-focus-safe">
  <!-- drawer content -->
</cart-drawer>
```

### Directional Corner on a Section

```html
<div class="banner radius-t-xl radius-b-none shadow-lg">
  <!-- hero banner with rounded top only -->
</div>
```

### Composing Variable Bridges on Dawn Pseudo-Element Cards

```html
<div class="card card--card radius-vars-lg shadow-vars-md radius-focus-safe">
  <div class="card__inner color-scheme-1 gradient">
    <!-- card content -->
  </div>
</div>
```

### Collection Card with Context + Utility

```html
<div class="collection-card-wrapper radius-context-collection-card radius-collection-card-sm">
  {% render 'card-collection', card_collection: collection %}
</div>
```

---

## Integration Summary

| System | Integration Method |
|---|---|
| **Button System** | `.radius-button-*` utilities set `--buttons-radius` / `--buttons-radius-outset`; composes with `snippets/button.liquid` via `class` param |
| **Card System** | New `.card--radius-xs/md/xl/pill/circle` bridges; existing modifiers preserved; `snippets/card.liquid` `radius` param supports all levels |
| **Form System** | `.radius-form-*` utilities set `--inputs-radius` / `--inputs-radius-outset`; composes with `snippets/form-*.liquid` via `class` param |
| **Badge System** | Token aliases in `component-badge.css`; `.radius-badge-*` utilities for direct override |
| **Shadow System** | Independent utility namespaces — `.radius-*` and `.shadow-*` compose on the same element |

---

*Nether Premium Border Radius System — production-ready, Theme Check compatible, Online Store 2.0 compatible.*
