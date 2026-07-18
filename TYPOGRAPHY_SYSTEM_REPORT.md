# Nether Premium Typography System — Report

## 1. Summary

The Nether Premium Typography System extends Dawn's existing typography architecture without replacing or duplicating it. All fourteen scale levels, weight utilities, and layout helpers build on the established Dawn type system — theme font settings, `--font-body-*` / `--font-heading-*` tokens, semantic `h1`–`h6` elements, and existing utility classes — so every section, snippet, and merchant Theme Setting continues to work unchanged.

**Key design decisions:**

- **Extend, don't replace** — Dawn's `.hxxl`, `.hxl`, `.h0`–`.h5`, `.text-body`, `.caption`, `.caption-with-letter-spacing`, `.caption-large`, `.left`/`.center`/`.right`, `.uppercase`, and `.font-body-bold` remain untouched in `base.css`
- **Namespaced classes** — New Nether classes use the `.type-*` prefix to avoid collisions (e.g. Dawn's `.light` sets opacity, not font weight — Nether uses `.type-weight-light`)
- **No hardcoded fonts** — All type styles reference `--font-body-family`, `--font-heading-family`, and merchant-controlled scale tokens from `theme.liquid`
- **Backward compatible** — Existing `heading_size` section settings (`h1`, `h2`, `hxl`, `hxxl`, etc.) continue to work; `.type-*` classes mirror the same computed values
- **No JavaScript** — Pure CSS utilities, zero runtime overhead

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-typography.css` | Premium type scale, utilities, rhythm, and measure styles |
| `TYPOGRAPHY_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-typography.css` globally after `base.css` |
| `layout/password.liquid` | Added `component-typography.css` for password layout parity |

---

## 4. Typography Scale

Each Nether class maps to an existing Dawn equivalent where one exists. Both can be used interchangeably.

| Nether Class | Dawn Equivalent | Size Behaviour | Use Case |
|---|---|---|---|
| `.type-display-xl` | `.hxxl` | Fluid `clamp()` — 5.6rem to 7.2rem × heading scale | Hero headlines, landing pages |
| `.type-display-lg` | `.hxl` | 5rem → 6.2rem at 750px+ | Large section titles |
| `.type-h1` | `.h1` / `h1` | 3rem → 4rem at 750px+ | Page titles |
| `.type-h2` | `.h2` / `h2` | 2rem → 2.4rem at 750px+ | Section headings |
| `.type-h3` | `.h3` / `h3` | 1.7rem → 1.8rem at 750px+ | Subsection headings |
| `.type-h4` | `.h4` / `h4` | 1.5rem × heading scale | Card titles, labels |
| `.type-h5` | `.h5` / `h5` | 1.2rem → 1.3rem at 750px+ | Small headings |
| `.type-h6` | `h6` *(extended)* | 1.1rem → 1.2rem at 750px+ | Meta headings, fine print titles |
| `.type-body-lg` | *(new)* | Fluid `clamp()` — 1.5rem to 1.7rem | Lead paragraphs, intros |
| `.type-body` | `.text-body` | 1.5rem → 1.6rem at 750px+ | Default body copy |
| `.type-body-sm` | *(new)* | 1.3rem fixed | Secondary body text |
| `.type-caption` | `.caption` | 1rem → 1.2rem at 750px+ | Image captions, footnotes |
| `.type-overline` | `.caption-with-letter-spacing` | 1rem, uppercase, wide tracking | Category labels, eyebrows |
| `.type-label` | `.caption-large` | 1.3rem | Form labels, UI labels |

### CSS Custom Properties (Design Tokens)

Defined in `:root` within `component-typography.css`:

| Token | Purpose |
|---|---|
| `--type-leading-tight` / `snug` / `normal` / `relaxed` | Line-height scale |
| `--type-tracking-tighter` → `widest` | Letter-spacing scale |
| `--type-weight-light` → `bold` | Font weight scale |
| `--type-space-xs` → `2xl` | Vertical rhythm spacing |
| `--type-measure` / `narrow` / `wide` | Readable line lengths (65ch / 45ch / 80ch) |

All size calculations use existing `--font-heading-scale` and `--font-body-scale` from Theme Settings.

### Usage Examples

```html
<h1 class="type-display-xl">Hero Headline</h1>

<h2 class="type-h2 type-weight-semibold">Section Title</h2>

<p class="type-overline">New Collection</p>
<h3 class="type-h3">Summer Essentials</h3>
<p class="type-body-lg type-measure">Lead paragraph with readable width…</p>

<p class="type-body type-clamp-3">Long description truncated to three lines…</p>

<span class="type-label type-uppercase">Size</span>
```

### Semantic Heading Pattern

Visual size can differ from semantic level for accessibility:

```html
<h2 class="type-h4">Visually small, semantically h2</h2>
```

---

## 5. Utility Classes

### Font Weight

| Class | Weight | Notes |
|---|---|---|
| `.type-weight-light` | 300 | Avoid Dawn's `.light` (opacity utility) |
| `.type-weight-regular` | `var(--font-body-weight)` | Theme body weight |
| `.type-weight-medium` | 500 | |
| `.type-weight-semibold` | 600 | |
| `.type-weight-bold` | `var(--font-body-weight-bold)` | Theme bold weight; complements `.font-body-bold` |

### Line Height

| Class | Value |
|---|---|
| `.type-leading-tight` | 1.15 |
| `.type-leading-snug` | Heading-scale-aware |
| `.type-leading-normal` | Body-scale-aware |
| `.type-leading-relaxed` | Body-scale-aware |

### Letter Spacing

| Class | Value |
|---|---|
| `.type-tracking-tighter` | -0.02em |
| `.type-tracking-tight` | Scale-aware |
| `.type-tracking-normal` | 0.06rem |
| `.type-tracking-wide` | 0.1rem |
| `.type-tracking-wider` | 0.13rem |
| `.type-tracking-widest` | 0.18rem |

### Text Transform

| Class | Effect | Dawn Equivalent |
|---|---|---|
| `.type-uppercase` | `uppercase` | `.uppercase` |
| `.type-lowercase` | `lowercase` | *(new)* |
| `.type-capitalize` | `capitalize` | *(new)* |
| `.type-normal-case` | `none` | *(new)* |

### Text Alignment

| Class | Effect | Dawn Equivalent |
|---|---|---|
| `.type-align-left` | `text-align: left` | `.left` |
| `.type-align-center` | `text-align: center` | `.center` |
| `.type-align-right` | `text-align: right` | `.right` |

### Truncation & Line Clamp

| Class | Effect |
|---|---|
| `.type-truncate` | Single-line ellipsis |
| `.type-clamp-2` | Clamp to 2 lines |
| `.type-clamp-3` | Clamp to 3 lines |
| `.type-clamp-4` | Clamp to 4 lines |
| `.type-clamp-5` | Clamp to 5 lines |

### Text Balance & Measure

| Class | Effect |
|---|---|
| `.type-balance` | `text-wrap: balance` (headings) |
| `.type-pretty` | `text-wrap: pretty` (paragraphs) |
| `.type-measure` | `max-width: 65ch` |
| `.type-measure-narrow` | `max-width: 45ch` |
| `.type-measure-wide` | `max-width: 80ch` |

### Vertical Rhythm

| Class | Effect |
|---|---|
| `.type-stack` | `1.6rem` gap between children |
| `.type-stack-sm` | `0.8rem` gap |
| `.type-stack-lg` | `2.4rem` gap |
| `.type-stack-xl` | `3.2rem` gap |
| `.type-prose` | Measure + relaxed leading + heading spacing |

### Font Family & Colour

| Class | Effect |
|---|---|
| `.type-heading` | Applies heading font family |
| `.type-body-font` | Applies body font family |
| `.type-muted` | 75% foreground opacity |
| `.type-subtle` | 55% foreground opacity |

---

## 6. Accessibility Improvements

- **Semantic HTML preserved** — Nether classes are visual only; developers keep proper `h1`–`h6`, `p`, `cite`, `blockquote` elements
- **Heading hierarchy** — `.type-*` classes decouple visual size from semantic level, supporting correct document outline with flexible design
- **Readable sizing** — Body text starts at 1.5rem (15px with Dawn's 62.5% root), scaling to 1.6rem on desktop — meets WCAG minimum size guidance
- **Line length control** — `.type-measure` constrains paragraphs to 65 characters for optimal readability
- **Text wrapping** — `.type-balance` and `.type-pretty` improve heading and paragraph layout on supported browsers
- **Contrast maintained** — Muted/subtle utilities use `rgba(var(--color-foreground), …)` inheriting theme colour schemes
- **No font hardcoding** — Merchants control fonts via Theme Settings; changes propagate automatically through CSS variables
- **h6 extension** — `.type-h6` adds proper sizing to the previously under-styled `h6` element without modifying `base.css`

---

## 7. Performance Improvements

- **Single CSS file** (~5 KB unminified) loaded once globally — no per-section duplication
- **Zero JavaScript** — No runtime overhead
- **No duplicate base styles** — `component-typography.css` contains only delta rules; all foundational typography remains in `base.css`
- **Design token reuse** — Every size, weight, and spacing value flows through existing `--font-body-scale`, `--font-heading-scale`, and font family variables set in `theme.liquid`
- **Fluid sizing** — `clamp()` on Display XL and Large Body reduces breakpoint-specific media queries
- **Font loading unchanged** — Uses existing `font_face` declarations and preload tags in `theme.liquid`; no additional font files
- **Theme Check** — Passes with no new errors
- **Backward compatible** — All existing `heading_size` settings, `.inline-richtext` headings, and Dawn utility classes across 30+ sections are unaffected

---

*Generated for the Nether Shopify Framework — Premium Typography System v1.0*
