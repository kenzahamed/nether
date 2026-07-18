# Nether Premium Badge System — Report

## 1. Summary

The Nether Premium Badge System extends Dawn's existing `.badge` component without replacing or duplicating it. All seventeen badge types, six visual styles, three sizes, and five status utilities build on the established Dawn architecture — `--color-badge-*` tokens, `--badge-corner-radius`, `.card__badge` positioning, and `.price__badge-*` visibility rules — so every existing badge across product cards, pricing, gift cards, and blog cards continues to work unchanged.

A new reusable `snippets/badge.liquid` component provides a single, consistent API for rendering badges across all future Nether sections. Styling lives in one dedicated stylesheet (`assets/component-badge.css`) loaded globally after `component-card-premium.css`.

**Key design decisions:**

- **Extend, don't replace** — Dawn `.badge`, `.card__badge`, `.price__badge-sale`, `.price__badge-sold-out`, `.badge--expired`, and `.thumbnail__badge` are untouched.
- **Namespaced modifiers** — Nether classes use the `.badge--type-*`, `.badge--status-*`, and `.badge--*` style prefixes to avoid collisions with existing Dawn classes like `.badge--expired`.
- **Icon System integration** — Leading and trailing icons render via `{% render 'icon' %}` with decorative defaults and size mapping per badge size.
- **Design token reuse** — All colours reference existing CSS custom properties (`--color-badge-*`, `--color-button`, `--color-link`, `--color-foreground`).
- **No new JavaScript** — Pure CSS; zero runtime overhead.
- **Card integration** — Nether `snippets/card.liquid` now uses the badge snippet for its optional `badge_text` block.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-badge.css` | Premium badge types, styles, sizes, status variants, and group utilities |
| `snippets/badge.liquid` | Reusable Liquid component for all badge types |
| `BADGE_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-badge.css` globally after `component-card-premium.css` |
| `layout/password.liquid` | Added `component-badge.css` for password layout parity |
| `snippets/card.liquid` | Replaced inline `<span class="badge">` with `{% render 'badge' %}` for premium cards |

---

## 4. Badge Types

| Type | CSS Class | Default Label | Default Icon | Default Color Scheme |
|---|---|---|---|---|
| **Sale** | `.badge--type-sale` | `products.product.on_sale` (translated) | `discount` | `settings.sale_badge_color_scheme` |
| **New** | `.badge--type-new` | New | `star` | Merchant `color_scheme` param |
| **Bestseller** | `.badge--type-bestseller` | Bestseller | `star` | Merchant `color_scheme` param |
| **Featured** | `.badge--type-featured` | Featured | `star` | Merchant `color_scheme` param |
| **Limited Edition** | `.badge--type-limited_edition` | Limited Edition | `stopwatch` | Merchant `color_scheme` param |
| **Low Stock** | `.badge--type-low_stock` | Low Stock | `inventory_status` | Auto `.badge--status-warning` |
| **Out of Stock** | `.badge--type-out_of_stock` | `products.product.sold_out` (translated) | `unavailable` | `settings.sold_out_badge_color_scheme` |
| **Discount Percentage** | `.badge--type-discount_percentage` | `-{percent}%` | `discount` | `settings.sale_badge_color_scheme` |
| **Free Shipping** | `.badge--type-free_shipping` | Free Shipping | `truck` | Merchant `color_scheme` param |
| **Premium** | `.badge--type-premium` | Premium | `lock` | Merchant `color_scheme` param |
| **Organic** | `.badge--type-organic` | Organic | `leaf` | Merchant `color_scheme` param |
| **Handmade** | `.badge--type-handmade` | Handmade | — | Merchant `color_scheme` param |
| **Exclusive** | `.badge--type-exclusive` | Exclusive | `padlock` | Merchant `color_scheme` param |
| **Trending** | `.badge--type-trending` | Trending | `fire` | Merchant `color_scheme` param |
| **Coming Soon** | `.badge--type-coming_soon` | Coming Soon | `stopwatch` | Merchant `color_scheme` param |
| **Pre-Order** | `.badge--type-pre_order` | Pre-Order | `box` | Merchant `color_scheme` param |
| **Custom** | `.badge--type-custom` | `label` param (required) | Optional via `icon_leading` | Merchant `color_scheme` param |

All type defaults are overridable via the `label`, `icon_leading`, `color_scheme`, and `show_icon` parameters.

### Snippet Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `label` | String | — | Badge text (overrides type default) |
| `type` | String | `custom` | One of the seventeen badge types |
| `style` | String | `solid` | `solid`, `outline`, `soft`, `pill`, `rounded`, `minimal` |
| `size` | String | `medium` | `small`, `medium`, `large` |
| `status` | String | — | `success`, `warning`, `error`, `info`, `neutral` |
| `color_scheme` | String | — | Dawn scheme id, e.g. `scheme-4` |
| `icon_leading` | String | — | Leading icon (Nether Icon System name) |
| `icon_trailing` | String | — | Trailing icon |
| `show_icon` | Boolean | `true` | Render type default icon when mapped |
| `uppercase` | Boolean | `true` | Uppercase label text |
| `responsive` | Boolean | `false` | Scale size at breakpoints |
| `discount_percent` | Number | — | Discount value for `discount_percentage` type |
| `role` | String | — | ARIA role (`status` auto-set for stock types) |
| `id` | String | — | HTML id |
| `class` | String | — | Additional CSS classes |
| `attributes` | String | — | Extra HTML attributes |
| `shopify_attributes` | String | — | Theme Editor block attributes |

---

## 5. Badge Styles

| Style | CSS Class | Description |
|---|---|---|
| **Solid** | `.badge--solid` | Default filled badge using scheme `--color-badge-*` tokens |
| **Outline** | `.badge--outline` | Transparent background with visible border |
| **Soft** | `.badge--soft` | Tinted background at 12% foreground opacity |
| **Pill** | `.badge--pill` | Fully rounded caps (`--badge-pill-radius`) |
| **Rounded** | `.badge--rounded` | Fixed 0.4rem corner radius |
| **Minimal** | `.badge--minimal` | Text-only, no background or border |

### Sizes

| Size | CSS Class | Font Size | Notes |
|---|---|---|---|
| **Small** | `.badge--small` | 1.0rem | Compact product card overlays |
| **Medium** | `.badge--medium` | 1.2rem | Default — matches Dawn `.badge` |
| **Large** | `.badge--large` | 1.4rem | Hero and promotional sections |

Add `responsive: true` with `.badge--responsive` to scale between small and target size at the 750px breakpoint.

### Text Casing

| Class | Behaviour |
|---|---|
| `.badge--uppercase` | Uppercase with 0.1rem letter-spacing (default) |
| `.badge--normal-case` | Sentence case with normal tracking |

---

## 6. Utility Classes

### Status Variants

| Status | CSS Class | Token Mapping |
|---|---|---|
| **Success** | `.badge--status-success` | `--color-button` / `--color-button-text` |
| **Warning** | `.badge--status-warning` | `--color-foreground` / `--color-background` |
| **Error** | `.badge--status-error` | `--color-foreground` / `--color-background` |
| **Info** | `.badge--status-info` | `--color-link` / `--color-background` |
| **Neutral** | `.badge--status-neutral` | Inherits scheme `--color-badge-*` tokens |

Status variants compose with style modifiers — e.g. `.badge--soft.badge--status-info` produces a tinted info badge.

### Group Layout

| Class | Description |
|---|---|
| `.badge-group` | Horizontal flex wrap with 0.6rem gap |
| `.badge-group--stack` | Vertical stacked badges |
| `.badge-group--end` | Right-aligned group |
| `.badge-group--center` | Center-aligned group |

---

## 7. Accessibility Improvements

- **Semantic markup** — Badges render as `<span>` with optional `role="status"` for stock-related types (`low_stock`, `out_of_stock`).
- **Decorative icons** — Leading and trailing icons use `aria-hidden="true"` via the Nether Icon System defaults.
- **Label visibility** — Text always rendered in `.badge__label`; never icon-only without a label.
- **Contrast** — Status and style variants use existing theme colour schemes and button/link tokens for WCAG-compatible contrast.
- **Forced colours** — `forced-colors: active` media query ensures borders and underlines remain visible.
- **Reduced motion** — Transitions disabled under `prefers-reduced-motion: reduce`.
- **Backward compatible** — Existing Dawn badges without `.badge__inner` structure continue to render correctly.

---

## 8. Performance Improvements

- **Single CSS file** (~4 KB unminified) loaded once globally — no per-section stylesheets.
- **Zero new JavaScript** — No runtime overhead; badges are server-rendered HTML + CSS.
- **Design token reuse** — All colours, radii, and spacing reference existing CSS custom properties.
- **No duplicate styles** — `component-badge.css` contains only delta rules; base `.badge` layout remains in `base.css`.
- **SVG icons** — Uses Nether Icon System `inline_asset_content` pattern (no additional HTTP requests).
- **Theme Check** — Passes with no new errors. One expected `OrphanedSnippet` warning on `badge.liquid` until additional sections adopt the snippet.
- **Responsive** — Size classes use `rem` units; responsive modifier scales at a single breakpoint.
- **Backward compatible** — All existing `.badge` usages in `card-product.liquid`, `price.liquid`, `article-card.liquid`, and `gift_card.liquid` are unaffected.

---

## 9. Example Usage

### Product Card — Sale Badge

```liquid
{% render 'badge', type: 'sale', style: 'solid', size: 'small' %}
```

### Product Card — Discount Percentage

```liquid
{% assign discount = card_product.compare_at_price | minus: card_product.price | times: 100 | divided_by: card_product.compare_at_price %}
{% render 'badge',
  type: 'discount_percentage',
  discount_percent: discount,
  style: 'pill',
  size: 'small'
%}
```

### Product Page — Stock Status

```liquid
{% if product.available == false %}
  {% render 'badge', type: 'out_of_stock', style: 'soft' %}
{% elsif product.selected_or_first_available_variant.inventory_quantity < 5 %}
  {% render 'badge', type: 'low_stock', style: 'soft', size: 'small' %}
{% endif %}
```

### Product Gallery — Badge Group

```liquid
<div class="badge-group">
  {% render 'badge', type: 'new', style: 'pill', size: 'small' %}
  {% render 'badge', type: 'free_shipping', style: 'soft', size: 'small' %}
</div>
```

### Hero Section — Promotional Badge

```liquid
{% render 'badge',
  label: section.settings.badge_label,
  type: 'custom',
  style: 'outline',
  size: 'large',
  responsive: true,
  uppercase: false,
  color_scheme: section.settings.badge_color_scheme
%}
```

### Feature Card — Premium Badge with Icon

```liquid
{% render 'badge',
  type: 'premium',
  style: 'soft',
  icon_trailing: 'star'
%}
```

### Trust Row — Status Utilities

```liquid
<div class="badge-group badge-group--center">
  {% render 'badge', label: 'In stock', status: 'success', style: 'soft', uppercase: false %}
  {% render 'badge', label: 'Ships today', status: 'info', style: 'soft', uppercase: false %}
</div>
```

### Existing Dawn Price Badges (unchanged)

```liquid
{% render 'price', product: product, show_badges: true %}
```

### Nether Premium Card (integrated)

```liquid
{% render 'card',
  heading: 'Feature title',
  badge_text: 'New arrival',
  card_color: 'scheme-2'
%}
```

---

*Generated for the Nether Shopify Framework — Premium Badge System v1.0*
