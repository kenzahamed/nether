# Nether Premium Card System — Report

## 1. Summary

The Nether Premium Card System extends Dawn's existing `.card` / `.card-wrapper` architecture without replacing or duplicating it. All eight card types, six visual styles, seven hover effects, and layout utilities build on the established Dawn card structure — `card__inner`, `card__media`, `card__content`, `card__heading`, stretched links, and design token scoping — so every existing product, collection, and blog card across the theme continues to work unchanged.

**Existing snippets preserved:**
- `card-product.liquid` — Product cards
- `card-collection.liquid` — Collection cards
- `article-card.liquid` — Blog/article cards

**New generic snippet** (`card.liquid`) handles Feature, Testimonial, Team, Category, and Generic Content cards. Premium modifier classes can also be applied to any existing card wrapper for enhanced styling and hover effects.

**Key design decisions:**

- **Extend, don't replace** — `component-card.css` and all existing card snippets remain untouched
- **Global premium CSS** — `component-card-premium.css` loaded once in `theme.liquid` so modifiers work on existing cards without per-section changes
- **No new JavaScript** — All interactions are CSS-only; interactive cards use Dawn's stretched-link pattern
- **Design token reuse** — Product/collection/blog cards inherit their existing token scopes; content cards use `--text-boxes-*` tokens
- **Button system integration** — Card CTAs render via `snippets/button.liquid`

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-card-premium.css` | Premium card styles, types, hovers, and utilities |
| `snippets/card.liquid` | Reusable Liquid component for content card types |
| `CARD_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-card-premium.css` globally after `component-button.css` |

---

## 4. Card Types

| Type | Snippet | CSS Class | Description |
|---|---|---|---|
| **Product** | `card-product.liquid` *(existing)* | `.product-card-wrapper` | Full product card with quick-add, pricing, badges |
| **Collection** | `card-collection.liquid` *(existing)* | `.collection-card-wrapper` | Collection image, title, description, arrow |
| **Blog** | `article-card.liquid` *(existing)* | `.article-card-wrapper` | Article image, date, author, excerpt, badge |
| **Category** | `card.liquid` | `.card--type-category` | Image overlay card for category navigation |
| **Feature** | `card.liquid` | `.card--type-feature` | Icon + heading + description, centered layout |
| **Testimonial** | `card.liquid` | `.card--type-testimonial` | Quote, attribution, semantic `<blockquote>` / `<cite>` |
| **Team** | `card.liquid` | `.card--type-team` | Photo, name, role — centered profile layout |
| **Content** | `card.liquid` | `.card--type-content` | Generic heading, caption, description, CTA, footer |

### Applying Premium Modifiers to Existing Cards

Existing cards can adopt premium styles and hovers by adding classes to their wrapper — no snippet changes required:

```liquid
<div class="card-wrapper product-card-wrapper card-hover-lift card-hover-zoom">
  {%- comment -%} existing card-product render {%- endcomment -%}
</div>
```

```liquid
<div class="card card--card card--premium-elevated card--radius-lg card--shadow-lg">
```

### Snippet Usage

```liquid
{% render 'card',
  type: 'feature',
  heading: 'Free Shipping',
  description: 'On all orders over $100',
  icon: 'truck',
  style: 'elevated',
  hover: 'lift,shadow'
%}

{% render 'card',
  type: 'testimonial',
  quote: 'Exceptional quality and service.',
  attribution: 'Jane Smith',
  attribution_detail: 'Verified Buyer',
  style: 'outline',
  radius: 'lg'
%}

{% render 'card',
  type: 'team',
  heading: 'Alex Rivera',
  caption: 'Creative Director',
  image: block.settings.photo,
  link: '/pages/team',
  hover: 'zoom,border'
%}

{% render 'card',
  type: 'category',
  heading: 'New Arrivals',
  image: block.settings.image,
  link: '/collections/new',
  style: 'minimal',
  hover: 'zoom,arrow'
%}
```

### Snippet Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | String | `content` | `feature`, `testimonial`, `team`, `category`, `content` |
| `style` | String | `default` | `default`, `elevated`, `outline`, `glass`, `minimal`, `editorial` |
| `radius` | String | `md` | `none`, `sm`, `md`, `lg`, `full` |
| `shadow` | String | `md` | `none`, `sm`, `md`, `lg` |
| `gradient_border` | Boolean | `false` | Gradient border effect |
| `image` | Object | — | Shopify image object |
| `link` | String | — | Interactive card link |
| `heading` | String | — | Card title |
| `caption` | String | — | Subtitle / role |
| `description` | String | — | Body text |
| `quote` | String | — | Testimonial quote |
| `attribution` | String | — | Testimonial author |
| `badge_text` | String | — | Badge label |
| `icon` | String | — | Feature icon name |
| `cta_label` / `cta_link` | String | — | CTA button (uses button snippet) |
| `footer` | String | — | Footer content |
| `hover` | String | — | Comma-separated: `lift`, `shadow`, `zoom`, `scale`, `border`, `arrow`, `glow` |
| `equal_height` | Boolean | `true` | Stretch to grid row height |
| `skip_styles` | Boolean | `false` | Skip stylesheet tags in loops |

---

## 5. Card Styles

| Style | CSS Class | Description |
|---|---|---|
| **Default** | *(none — uses Dawn base)* | Standard `card--card` or `card--standard` with theme tokens |
| **Elevated** | `.card--premium-elevated` | Increased shadow depth and blur |
| **Outline** | `.card--premium-outline` | Transparent background, visible border, no shadow |
| **Glass** | `.card--premium-glass` | Frosted glass with `backdrop-filter: blur(1.2rem)` |
| **Minimal** | `.card--premium-minimal` | No border, no shadow, transparent background |
| **Editorial** | `.card--premium-editorial` | Large heading typography, generous padding — magazine layout |

### Border Radius Options

| Option | CSS Class |
|---|---|
| None | `.card--radius-none` |
| Small | `.card--radius-sm` (0.4rem) |
| Medium | *(default — theme token)* |
| Large | `.card--radius-lg` (1.6rem) |
| Full | `.card--radius-full` (2rem) |

### Shadow Levels

| Level | CSS Class |
|---|---|
| None | `.card--shadow-none` |
| Small | `.card--shadow-sm` |
| Medium | *(default — theme token)* |
| Large | `.card--shadow-lg` |

### Gradient Border

| Feature | CSS Class |
|---|---|
| Gradient border | `.card--gradient-border` |

Uses a `::before` pseudo-element with a foreground-to-button gradient mask, compatible with both `card--card` and `card--standard` layouts.

### Equal Height

| Feature | CSS Class |
|---|---|
| Equal height card | `.card--equal-height` |
| Equal height grid | `.premium-card-grid` |

Extends Dawn's `.card--extend-height` for consistent grid row heights.

---

## 6. Hover Features

All hover effects are CSS-only modifier classes applied to `.card-wrapper`. Multiple effects can be combined.

| Effect | CSS Class | Behaviour |
|---|---|---|
| **Lift** | `.card-hover-lift` | `translateY(-0.4rem)` on hover |
| **Shadow increase** | `.card-hover-shadow` | Deepens box-shadow on hover |
| **Image zoom** | `.card-hover-zoom` | Scales image to 1.06× (extends Dawn's `media--hover-effect` at 1.03×) |
| **Image scale** | `.card-hover-scale` | Scales the media container to 1.02× |
| **Border highlight** | `.card-hover-border` | Increases `--border-opacity` to 0.35 |
| **Arrow movement** | `.card-hover-arrow` | Translates `.icon-wrap` and CTA arrow icons |
| **Glow** | `.card-hover-glow` | Adds `rgba(--color-button)` glow to shadow |

All effects respect `prefers-reduced-motion: reduce` and only activate under `@media (hover: hover)`.

### Combining Effects

```liquid
hover: 'lift,shadow,arrow'
hover: 'zoom,glow,border'
```

Works on both new `card.liquid` renders and existing card wrappers:

```html
<div class="card-wrapper collection-card-wrapper card-hover-lift card-hover-arrow animate-arrow">
```

---

## 7. Accessibility Improvements

- **Semantic HTML** — Testimonial and content cards render as `<article>`; testimonials use `<blockquote>` and `<cite>`
- **Stretched links** — Interactive cards use Dawn's `full-unstyled-link` + `card__heading a::after` pattern for full-card click targets
- **Keyboard focus** — Inherits Dawn's `:focus-visible` ring on card heading links; `.premium-card-wrapper:focus-within` ensures visible focus when tabbing into the card
- **Decorative elements** — Icons, arrows, and badges use `aria-hidden="true"` where appropriate
- **Image alt text** — Falls back through `image_alt` → `image.alt` → `heading`
- **Reduced motion** — All hover transforms and transitions disabled under `prefers-reduced-motion: reduce`
- **High contrast** — Glass effect falls back to solid border; gradient border pseudo-element hidden in `forced-colors` mode
- **CTA buttons** — Rendered via the Premium Button System with proper focus states and `aria-label` support

---

## 8. Performance Improvements

- **Single global CSS file** (~7 KB unminified) — loaded once in `theme.liquid`, no per-section duplication
- **Zero new JavaScript** — No runtime overhead; all hover effects are pure CSS
- **No duplicate base styles** — `component-card-premium.css` contains only delta rules; `component-card.css` remains the single source of card layout styles
- **Lazy loading** — Card images use `loading="lazy"` by default with responsive `srcset`
- **Design token reuse** — All colours, radii, borders, and shadows reference existing CSS custom properties:
  - Product cards: `--product-card-*`
  - Collection cards: `--collection-card-*`
  - Blog cards: `--blog-card-*`
  - Content cards: `--text-boxes-*`
- **Stylesheet on demand** — `card.liquid` supports `skip_styles: true` for loops (matching `card-product.liquid` pattern)
- **SVG icons** — Uses Dawn's `inline_asset_content` pattern (no extra HTTP requests)
- **Theme Check** — Passes with no new errors; one expected `OrphanedSnippet` warning until sections adopt the snippet
- **Backward compatible** — All existing card renders across 10+ sections are unaffected

---

*Generated for the Nether Shopify Framework — Premium Card System v1.0*
