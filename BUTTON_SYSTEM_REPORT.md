# Nether Premium Button System — Report

## 1. Summary

The Nether Premium Button System extends Dawn's existing `.button` component without replacing or duplicating it. All seven variants, three sizes, and six interaction states build on the established Dawn architecture — design tokens, pseudo-element borders, loading spinner pattern, and focus ring — so every existing button across the theme continues to work unchanged.

A new reusable `snippets/button.liquid` component provides a single, consistent API for rendering buttons and links across all future Nether sections. Styling lives in one dedicated stylesheet (`assets/component-button.css`) loaded globally after `base.css`.

**Key design decisions:**

- **Extend, don't replace** — `.button--primary`, `.button--secondary`, `.button--tertiary`, `.button--small`, `.button.loading`, and `.button--full-width` are untouched. New variants layer on top.
- **Fix existing gap** — `.button--outline` was referenced in `main-password-header.liquid` but had no styles. It is now fully implemented.
- **No new JavaScript** — Loading state reuses the existing `.button.loading` class and `loading-spinner` snippet, compatible with `product-form.js` and `quick-add.js`.
- **Arrow animation** — The arrow variant reuses `icon-arrow.svg` and mirrors the existing `.animate-arrow` hover pattern.

---

## 2. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-button.css` stylesheet after `base.css` |
| `layout/password.liquid` | Added `component-button.css` stylesheet (password page uses `button--outline`) |

---

## 3. Files Created

| File | Purpose |
|---|---|
| `assets/component-button.css` | Premium button variant, size, state, and layout styles |
| `snippets/button.liquid` | Reusable Liquid component for all button types |
| `BUTTON_SYSTEM_REPORT.md` | This documentation |

---

## 4. Button Variants

| Variant | CSS Class | Description | Maps to Existing |
|---|---|---|---|
| **Primary** | `.button--primary` | Solid fill using `--color-button` / `--color-button-text` | Default `.button` behaviour, now explicit |
| **Secondary** | `.button--secondary` | Outlined secondary palette | Dawn `.button--secondary` (unchanged) |
| **Outline** | `.button--outline` | Transparent background, visible border | **New** — fixes unstyled class on password page |
| **Ghost** | `.button--ghost` | Transparent, no border/shadow, subtle hover fill | Distinct from `.button--tertiary` (which keeps its smaller sizing) |
| **Text** | `.button--text` | Underlined text link styled as a button | Complements `.link` / `.underlined-link` for button semantics |
| **Icon** | `.button--icon` | Square icon-only button with `aria-label` | **New** — uses existing `.svg-wrapper` pattern |
| **Arrow** | `.button--arrow` | Primary button with animated trailing arrow | Extends `.button--primary`, reuses `icon-arrow.svg` |

### Sizes

| Size | CSS Class | Dimensions |
|---|---|---|
| **Small** | `.button--small` | 3.8rem min-height, 1.3rem font |
| **Medium** | `.button--medium` | 4.5rem min-height, 1.5rem font (default) |
| **Large** | `.button--large` | 5.5rem min-height, 1.6rem font |

### Snippet Usage

```liquid
{%- comment -%} Primary link {%- endcomment -%}
{% render 'button', label: 'Shop now', link: '/collections/all', style: 'primary' %}

{%- comment -%} Secondary submit with loading {%- endcomment -%}
{% render 'button', label: 'Add to cart', style: 'secondary', size: 'large', type: 'submit', loading: true %}

{%- comment -%} Icon-only {%- endcomment -%}
{% render 'button', label: 'Search', style: 'icon', icon_leading: 'search', aria_label: 'Search' %}

{%- comment -%} Arrow CTA {%- endcomment -%}
{% render 'button', label: 'View collection', link: collection.url, style: 'arrow' %}

{%- comment -%} Ghost with leading icon {%- endcomment -%}
{% render 'button', label: 'Learn more', style: 'ghost', icon_leading: 'info', size: 'small' %}
```

### Snippet Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `label` | String | — | Button text |
| `link` | String | — | Renders `<a>` when set, `<button>` otherwise |
| `style` | String | `primary` | `primary`, `secondary`, `outline`, `ghost`, `text`, `icon`, `arrow` |
| `size` | String | `medium` | `small`, `medium`, `large` |
| `icon_leading` | String | — | Icon name (e.g. `cart` → `icon-cart.svg`) |
| `icon_trailing` | String | — | Trailing icon name |
| `show_arrow` | Boolean | `false` | Append animated arrow icon |
| `loading` | Boolean | `false` | Show loading spinner |
| `disabled` | Boolean | `false` | Disabled state |
| `full_width` | Boolean | `false` | Full-width layout |
| `type` | String | `button` | `button`, `submit`, `reset` |
| `id` | String | — | HTML id |
| `class` | String | — | Additional CSS classes |
| `attributes` | String | — | Extra HTML attributes |
| `aria_label` | String | — | Accessible label (required for icon-only) |
| `new_window` | Boolean | `false` | Open link in new tab |
| `shopify_attributes` | String | — | Theme Editor block attributes |

---

## 5. States Implemented

| State | Implementation | Notes |
|---|---|---|
| **Default** | Dawn `.button` base + variant overrides | Uses `--color-button`, `--buttons-radius`, shadow tokens |
| **Hover** | `::after` border expansion (Dawn) + variant-specific fills | Outline/ghost/text get `background-color` transitions; arrow gets `translateX` on icon |
| **Active** | `:active` pseudo-class | Primary/secondary/outline compress border offset; ghost/text deepen fill |
| **Focus** | `:focus-visible` ring (Dawn) | Text buttons use `--focused-base-outline` instead of box-shadow ring |
| **Disabled** | `:disabled`, `[aria-disabled='true']`, `.disabled` | Dawn 0.5 opacity + extended 0.45 opacity for text/ghost/outline |
| **Loading** | `.button.loading` + `loading-spinner` snippet | Reuses Dawn spinner positioning; text variant strokes match `--color-link` |

---

## 6. Accessibility Improvements

- **Semantic elements** — Renders `<button>` for actions and `<a>` for navigation; never uses `<div>` click handlers.
- **Icon-only labels** — `.button--icon` requires `aria_label`; visible label is moved to `.visually-hidden`.
- **Decorative icons** — Leading, trailing, and arrow icons use `aria-hidden="true"`.
- **Disabled links** — Anchor buttons use `aria-disabled="true"` and `tabindex="-1"` (matching Dawn rich-text pattern).
- **Keyboard focus** — Inherits Dawn's `:focus-visible` ring on solid variants; text buttons use visible `outline` per `--focused-base-outline`.
- **Reduced motion** — Arrow hover animation disabled under `prefers-reduced-motion: reduce`.
- **High contrast** — `forced-colors: active` media query ensures outline/ghost buttons retain visible borders.
- **Loading state** — Spinner visible in forced-colors mode (inherited from Dawn `.button.loading` rule).

---

## 7. Performance Notes

- **Single CSS file** (~4 KB unminified) loaded once globally — no per-section stylesheets.
- **Zero new JavaScript** — No runtime overhead; loading state managed by existing form modules.
- **Design token reuse** — All colours, radii, borders, and shadows reference existing CSS custom properties (`--color-button`, `--buttons-radius`, `--duration-short`, etc.).
- **No duplicate styles** — `component-button.css` only contains delta styles; base button layout, pseudo-elements, and focus rings remain in `base.css`.
- **SVG icons** — Uses Dawn's `inline_asset_content` pattern (no additional HTTP requests).
- **Theme Check** — Passes with no new errors. One expected `OrphanedSnippet` warning on `button.liquid` until sections adopt the snippet.
- **Responsive** — Size classes use `rem` units; icon buttons scale per size breakpoint without media queries.
- **Backward compatible** — All 30+ existing `.button` usages across snippets and sections are unaffected.

---

*Generated for the Nether Shopify Framework — Premium Button System v1.0*
