# Nether Premium Icon System — Report

## 1. Summary

The Nether Premium Icon System extends Dawn's existing SVG icon architecture without replacing or duplicating it. All 83 native Shopify/Dawn icon assets, the `icon-accordion.liquid` snippet, `social-icons.liquid`, and the `.svg-wrapper` / `.icon` CSS patterns remain untouched and fully functional.

A new reusable `snippets/icon.liquid` component provides a single, consistent API for rendering icons with configurable size, colour, spacing, accessibility, and category metadata. Styling lives in one dedicated stylesheet (`assets/component-icon.css`) loaded globally after `base.css`.

**Key design decisions:**

- **Extend, don't replace** — `icon-accordion.liquid`, `icon-with-text.liquid`, `social-icons.liquid`, and all direct `inline_asset_content` usages continue to work unchanged
- **Same asset resolution** — Uses Dawn's `icon-{name}.svg` naming convention with underscore-to-hyphen conversion (`chat_bubble` → `icon-chat-bubble.svg`)
- **Composes with Dawn** — `.icon-wrap` layers on top of `.svg-wrapper`; both classes are applied by default for backward compatibility
- **Inline SVG only** — Uses Shopify's `inline_asset_content` filter; zero additional HTTP requests
- **No new JavaScript** — Pure CSS utilities, zero runtime overhead
- **Custom SVG support** — Drop new `icon-*.svg` files into `assets/` and reference by name

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-icon.css` | Icon size, colour, alignment, spacing, and composition utilities |
| `snippets/icon.liquid` | Reusable Liquid component for all icon rendering |
| `ICON_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-icon.css` globally after `component-typography.css` |
| `layout/password.liquid` | Added `component-icon.css` for password layout parity |

### Preserved (unchanged)

| File | Role |
|---|---|
| `snippets/icon-accordion.liquid` | Simple Dawn icon renderer for section settings |
| `snippets/icon-with-text.liquid` | Icon + text block layout |
| `snippets/social-icons.liquid` | Social media icon list |
| `assets/icon-*.svg` (83 files) | Native Shopify/Dawn SVG icon library |

---

## 4. Icon Categories

All 83 existing Dawn SVG assets are available through the icon system. Below is the recommended category mapping for Nether framework usage.

### Navigation

| Icon Name | Asset | Common Use |
|---|---|---|
| `hamburger` | `icon-hamburger.svg` | Mobile menu toggle |
| `caret` | `icon-caret.svg` | Dropdowns, accordions, sliders |
| `arrow` | `icon-arrow.svg` | Links, CTAs, card arrows |
| `account` | `icon-account.svg` | Account/login links |
| `search` | `icon-search.svg` | Search toggle/input |
| `filter` | `icon-filter.svg` | Collection filtering |
| `close` | `icon-close.svg` | Close modals, drawers |
| `close_small` | `icon-close-small.svg` | Compact close buttons |
| `reset` | `icon-reset.svg` | Reset filters/forms |

### Commerce

| Icon Name | Asset | Common Use |
|---|---|---|
| `cart` | `icon-cart.svg` | Cart with items |
| `cart_empty` | `icon-cart-empty.svg` | Empty cart state |
| `discount` | `icon-discount.svg` | Sale badges, promotions |
| `price_tag` | `icon-price-tag.svg` | Pricing, deals |
| `inventory_status` | `icon-inventory-status.svg` | Stock indicators |

### Product

| Icon Name | Asset | Common Use |
|---|---|---|
| `3d_model` | `icon-3d-model.svg` | 3D product viewer |
| `zoom` | `icon-zoom.svg` | Image zoom |
| `eye` | `icon-eye.svg` | Quick view |
| `apple` | `icon-apple.svg` | Product attributes |
| `banana` | `icon-banana.svg` | Product attributes |
| `bottle` | `icon-bottle.svg` | Product attributes |
| `box` | `icon-box.svg` | Product attributes |
| `carrot` | `icon-carrot.svg` | Product attributes |
| `dairy` | `icon-dairy.svg` | Dietary info |
| `dairy_free` | `icon-dairy-free.svg` | Dietary info |
| `gluten_free` | `icon-gluten-free.svg` | Dietary info |
| `nut_free` | `icon-nut-free.svg` | Dietary info |
| `pepper` | `icon-pepper.svg` | Product attributes |
| `pants` | `icon-pants.svg` | Apparel |
| `shirt` | `icon-shirt.svg` | Apparel |
| `shoe` | `icon-shoe.svg` | Footwear |
| `leather` | `icon-leather.svg` | Material info |
| `lipstick` | `icon-lipstick.svg` | Beauty |
| `perfume` | `icon-perfume.svg` | Fragrance |
| `paw_print` | `icon-paw-print.svg` | Pet products |
| `plant` | `icon-plant.svg` | Natural/organic |
| `leaf` | `icon-leaf.svg` | Eco/sustainability |
| `snowflake` | `icon-snowflake.svg` | Frozen goods |
| `fire` | `icon-fire.svg` | Hot/spicy |
| `recycle` | `icon-recycle.svg` | Recycled materials |
| `ruler` | `icon-ruler.svg` | Sizing guides |
| `serving_dish` | `icon-serving-dish.svg` | Food/kitchen |
| `silhouette` | `icon-silhouette.svg` | Generic product |
| `washing` | `icon-washing.svg` | Care instructions |
| `dryer` | `icon-dryer.svg` | Care instructions |
| `iron` | `icon-iron.svg` | Care instructions |

### Shipping

| Icon Name | Asset | Common Use |
|---|---|---|
| `truck` | `icon-truck.svg` | Delivery/shipping |
| `plane` | `icon-plane.svg` | Express/air shipping |
| `box` | `icon-box.svg` | Packaging |
| `map_pin` | `icon-map-pin.svg` | Store locator, tracking |
| `return` | `icon-return.svg` | Returns policy |

### Trust

| Icon Name | Asset | Common Use |
|---|---|---|
| `lock` | `icon-lock.svg` | Security |
| `padlock` | `icon-padlock.svg` | Secure checkout |
| `checkmark` | `icon-checkmark.svg` | Confirmation |
| `check_mark` | `icon-check-mark.svg` | Feature lists |
| `tick` | `icon-tick.svg` | Success indicators |
| `success` | `icon-success.svg` | Success states |
| `heart` | `icon-heart.svg` | Wishlist, favourites |
| `star` | `icon-star.svg` | Ratings, reviews |
| `stopwatch` | `icon-stopwatch.svg` | Limited time offers |

### Social

| Icon Name | Asset | Common Use |
|---|---|---|
| `facebook` | `icon-facebook.svg` | Social links |
| `instagram` | `icon-instagram.svg` | Social links |
| `twitter` | `icon-twitter.svg` | Social links |
| `youtube` | `icon-youtube.svg` | Social links |
| `tiktok` | `icon-tiktok.svg` | Social links |
| `pinterest` | `icon-pinterest.svg` | Social links |
| `snapchat` | `icon-snapchat.svg` | Social links |
| `tumblr` | `icon-tumblr.svg` | Social links |
| `vimeo` | `icon-vimeo.svg` | Social links |
| `shopify` | `icon-shopify.svg` | Platform branding |

### Communication

| Icon Name | Asset | Common Use |
|---|---|---|
| `chat_bubble` | `icon-chat-bubble.svg` | Chat, support |
| `share` | `icon-share.svg` | Share buttons |
| `clipboard` | `icon-clipboard.svg` | Copy actions |

### Arrows

| Icon Name | Asset | Common Use |
|---|---|---|
| `arrow` | `icon-arrow.svg` | Directional links |
| `caret` | `icon-caret.svg` | Expand/collapse, carousel |

### Media Controls

| Icon Name | Asset | Common Use |
|---|---|---|
| `play` | `icon-play.svg` | Video play |
| `pause` | `icon-pause.svg` | Video pause |
| `3d_model` | `icon-3d-model.svg` | AR/3D viewer |
| `zoom` | `icon-zoom.svg` | Image magnification |

### Interface

| Icon Name | Asset | Common Use |
|---|---|---|
| `plus` | `icon-plus.svg` | Add, expand |
| `minus` | `icon-minus.svg` | Remove, collapse |
| `info` | `icon-info.svg` | Information tooltips |
| `question_mark` | `icon-question-mark.svg` | Help, FAQ |
| `error` | `icon-error.svg` | Error states |
| `warning` | `icon-warning.svg` | Warning alerts |
| `unavailable` | `icon-unavailable.svg` | Unavailable state |
| `remove` | `icon-remove.svg` | Delete items |
| `copy` | `icon-copy.svg` | Copy to clipboard |
| `lightning_bolt` | `icon-lightning-bolt.svg` | Flash sale, urgency |

### Custom SVG Icons

Add new icons to `assets/` following the naming convention:

```
assets/icon-your-icon.svg
```

Reference in Liquid:

```liquid
{% render 'icon', icon: 'your_icon', size: 'lg' %}
```

---

## 5. Utility Classes

### Size

| Class | Size | Dawn Equivalent |
|---|---|---|
| `.icon-wrap--sm` | 1.6rem (16px) | — |
| `.icon-wrap--md` | 2rem (20px) | `.svg-wrapper` default (20px) |
| `.icon-wrap--lg` | 2.4rem (24px) | `.header__icon .icon` (2rem) |
| `.icon-wrap--xl` | 3.2rem (32px) | — |
| `.icon-wrap--responsive` | 1.6rem → 2rem at 750px+ | — |

### Colour

| Class | Effect |
|---|---|
| `.icon-wrap--inherit` | `color: inherit` (default — uses `currentColor` on SVG) |
| `.icon-wrap--foreground` | Theme foreground colour |
| `.icon-wrap--muted` | 75% foreground opacity |
| `.icon-wrap--subtle` | 55% foreground opacity |
| `.icon-wrap--link` | Theme link colour |
| `.icon-wrap--button` | Theme button text colour |

### Alignment

| Class | Effect |
|---|---|
| `.icon-wrap--align-start` | `align-self: flex-start` |
| `.icon-wrap--align-center` | `align-self: center` |
| `.icon-wrap--align-end` | `align-self: flex-end` |
| `.icon-wrap--block` | `display: flex` |
| `.icon-wrap--inline` | `display: inline-flex` |

### Spacing

| Class | Effect |
|---|---|
| `.icon-wrap--gap-before-sm` | `margin-right: 0.4rem` |
| `.icon-wrap--gap-before-md` | `margin-right: 0.8rem` |
| `.icon-wrap--gap-before-lg` | `margin-right: 1.2rem` |
| `.icon-wrap--gap-after-sm` | `margin-left: 0.4rem` |
| `.icon-wrap--gap-after-md` | `margin-left: 0.8rem` |
| `.icon-wrap--gap-after-lg` | `margin-left: 1.2rem` |

### Composition

| Class | Effect |
|---|---|
| `.icon-text` | Flex row with icon + text, 0.8rem gap |
| `.icon-text--sm` | 0.4rem gap |
| `.icon-text--lg` | 1.2rem gap |
| `.icon-text--stack` | Vertical icon + text layout |

### Stroke Normalisation

| Class | Effect |
|---|---|
| `.icon-wrap--stroke` | Consistent `1.5` stroke width with `non-scaling-stroke` |

### CSS Custom Properties

| Token | Value |
|---|---|
| `--icon-size-sm` | 1.6rem |
| `--icon-size-md` | 2rem |
| `--icon-size-lg` | 2.4rem |
| `--icon-size-xl` | 3.2rem |
| `--icon-gap-sm` | 0.4rem |
| `--icon-gap-md` | 0.8rem |
| `--icon-gap-lg` | 1.2rem |
| `--icon-stroke-width` | 1.5 |

---

## 6. Accessibility Improvements

- **Decorative by default** — Icons render with `aria-hidden="true"` unless `decorative: false` is set
- **Functional icon labels** — When `decorative: false`, the wrapper gets `role="img"` and `aria-label` from the `label` parameter
- **Supplementary titles** — Optional `title` parameter adds visually hidden text for additional context
- **Parent element labels** — When an icon is inside a `<button>` or `<a>` with its own `aria-label`, keep `decorative: true` (default) to avoid redundant announcements
- **Colour inheritance** — Icons use `currentColor` / `fill: currentColor`, inheriting theme contrast from parent elements
- **High contrast** — `forced-colors: active` rule ensures icons render as `CanvasText` (extends Dawn's `.icon` rule)
- **No empty icons** — Passing `none` or blank `icon` renders nothing, preventing broken markup
- **Category metadata** — Optional `data-icon-category` attribute for developer tooling without affecting assistive tech

### Accessibility Patterns

```liquid
{%- comment -%} Decorative — inside a labelled button {%- endcomment -%}
<button aria-label="Add to cart">
  {% render 'icon', icon: 'cart', size: 'lg' %}
</button>

{%- comment -%} Functional — standalone icon {%- endcomment -%}
{% render 'icon', icon: 'search', decorative: false, label: 'Search' %}

{%- comment -%} Icon with visible text — decorative icon {%- endcomment -%}
<span class="icon-text">
  {% render 'icon', icon: 'truck', size: 'sm', category: 'shipping' %}
  Free shipping on orders over $50
</span>
```

---

## 7. Performance Improvements

- **Single CSS file** (~3 KB unminified) loaded once globally — no per-section duplication
- **Zero JavaScript** — No runtime overhead
- **Inline SVG** — `inline_asset_content` inlines SVG at render time; no additional HTTP requests per icon
- **No duplicate SVG code** — Single snippet resolves asset path; SVG markup lives in one asset file
- **Reuses existing assets** — All 83 Dawn icons used as-is; no copies or rewrites
- **Composes with Dawn** — `.svg-wrapper` class co-applied for compatibility with existing header, card, and form styles
- **Custom icons** — New SVGs added to `assets/` are automatically available without snippet changes
- **Theme Check** — Passes with no new errors; one expected `OrphanedSnippet` warning until sections adopt the snippet
- **Backward compatible** — All existing `icon-accordion`, `social-icons`, and direct `inline_asset_content` usages across 40+ files are unaffected

---

## 8. Example Usage

### Basic Icons

```liquid
{% render 'icon', icon: 'cart' %}
{% render 'icon', icon: 'heart', size: 'lg', color: 'muted' %}
{% render 'icon', icon: 'arrow', size: 'sm', gap: 'after-sm' %}
```

### Trust Badge Row

```liquid
<ul class="icon-text icon-text--lg list-unstyled">
  <li class="icon-text">
    {% render 'icon', icon: 'truck', category: 'shipping' %}
    <span class="type-body-sm">Free Shipping</span>
  </li>
  <li class="icon-text">
    {% render 'icon', icon: 'return', category: 'shipping' %}
    <span class="type-body-sm">Easy Returns</span>
  </li>
  <li class="icon-text">
    {% render 'icon', icon: 'lock', category: 'trust' %}
    <span class="type-body-sm">Secure Checkout</span>
  </li>
</ul>
```

### Header-Scale Icon

```liquid
{% render 'icon', icon: 'search', size: 'lg', decorative: false, label: 'Search' %}
```

### Feature Card Icon

```liquid
{% render 'card',
  type: 'feature',
  heading: '24/7 Support',
  description: 'Our team is here to help.',
  icon: 'chat_bubble',
  style: 'elevated'
%}
```

### Button with Icon (via Button System)

```liquid
{% render 'button',
  label: 'Shop now',
  link: '/collections/all',
  style: 'arrow',
  show_arrow: true
%}
```

### FAQ Accordion (existing Dawn pattern still works)

```liquid
{% render 'icon-accordion', icon: block.settings.icon %}
```

### Custom Client Icon

```liquid
{%- comment -%} After adding assets/icon-warranty.svg {%- endcomment -%}
{% render 'icon', icon: 'warranty', size: 'xl', category: 'trust', color: 'foreground' %}
```

### Future Component Integration

| Component | Recommended Usage |
|---|---|
| **Buttons** | `{% render 'icon', icon: 'arrow', gap: 'after-sm' %}` inside `button.liquid` |
| **Header** | `{% render 'icon', icon: 'cart', size: 'lg' %}` for cart/account |
| **Hero** | `{% render 'icon', icon: 'play', size: 'xl' %}` for video CTAs |
| **Product Cards** | `{% render 'icon', icon: 'heart', size: 'sm' %}` for wishlist |
| **FAQ** | `{% render 'icon-accordion', icon: block.settings.icon %}` (existing) |
| **Trust Badges** | `icon-text` + `{% render 'icon' %}` pattern |
| **Footer** | `{% render 'icon', icon: 'instagram', category: 'social' %}` |

---

*Generated for the Nether Shopify Framework — Premium Icon System v1.0*
