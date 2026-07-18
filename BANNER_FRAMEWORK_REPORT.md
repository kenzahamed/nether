# Nether Premium Banner Framework Report

## 1. Summary

Built the **Nether Premium Banner Framework** as a new, standalone OS 2.0 section that extends the Nether Hero architecture and Dawn banner/media patterns without modifying or replacing `image-banner.liquid`, `collage.liquid`, `email-signup-banner.liquid`, `main-collection-banner.liquid`, or `nether-hero.liquid`.

The framework delivers a **category-agnostic, merchant-configurable banner system** suitable for luxury client websites across fashion, beauty, furniture, electronics, bakery, jewelry, perfume, lifestyle, home decor, automotive, and other industries.

Architecture follows established Nether conventions:

- `<nether-banner>` custom element as the integration boundary
- **Composition over duplication** — reuses `component-hero.css` structural primitives, `nether-hero-media.liquid` (banner adapter), and `nether-hero-block.liquid` for all shared content blocks
- Scoped banner modifiers (`--nether-banner-*`, `nether-banner--layout-*`)
- Conditional asset loading for performance
- NetherMotion for all GSAP animations (no manual GSAP loading)
- Full integration with Phase 1 design systems (Button, Typography, Card, Badge, Icon, Shadow, Radius, Glass, Gradient)

**Verdict:** Production-ready. Dawn sections and Hero Framework preserved. No duplicated design-system CSS or block Liquid.

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `sections/nether-banner.liquid` | Premium banner section with schema, settings, and 3 presets |
| `assets/component-banner.css` | Banner-only layout modifiers (extends hero CSS) |
| `assets/component-banner.js` | `nether-banner` custom element extending `NetherHero` motion + hover |
| `snippets/nether-banner-content.liquid` | Content shell with glass/card/floating panel integration |
| `snippets/nether-banner-block.liquid` | Block dispatcher — delegates to hero blocks |
| `snippets/nether-banner-countdown.liquid` | Future-ready countdown placeholder |
| `snippets/nether-banner-divider.liquid` | Optional top/bottom section dividers |
| `BANNER_FRAMEWORK_REPORT.md` | This report |

---

## 3. Files Modified

| File | Changes |
|------|---------|
| `snippets/nether-hero-media.liquid` | Extended with `adapter: 'banner'` mode — maps `nether_banner_*` settings, collection image fallback; no hero behavior changed |
| `assets/nether-motion.js` | Added `nether-banner` to `SECTION_SELECTORS` for lazy motion boot |
| `locales/en.default.json` | Added `sections.nether_banner.collection.view` storefront string |
| `locales/en.default.schema.json` | Added full `sections.nether_banner` Theme Editor translations |

**Not modified (preserved):** `sections/image-banner.liquid`, `sections/collage.liquid`, `sections/nether-hero.liquid`, `sections/email-signup-banner.liquid`, `sections/main-collection-banner.liquid`, Dawn banner CSS/JS, all existing hero snippets (except media adapter extension).

---

## 4. Banner Layouts Implemented

| Layout | Merchant value | Hero base class | Description |
|--------|----------------|-----------------|-------------|
| Promotional Banner | `promotional` | `classic` | Full-bleed promotional overlay with CTA emphasis |
| Split Banner | `split` | `split` | Side-by-side media and content |
| Editorial Banner | `editorial` | `editorial` | Asymmetric typography emphasis |
| Collection Banner | `collection` | `split` | Collection-linked media fallback + shop link bar |
| Brand Story Banner | `brand_story` | `split` | Storytelling split with refined column ratio |
| Minimal Banner | `minimal` | `minimal` | Reduced padding, subtle overlay |
| Glass Banner | `glass` | `card` | Glass panel auto-enabled via Glass System |
| Gradient Banner | `gradient` | `overlay` | Gradient overlay auto-enabled via Gradient System |

Split layouts support merchant-selectable media position (left / right).

---

## 5. Merchant Settings

### Framework

| Setting | Purpose |
|---------|---------|
| `nether_banner_layout` | 8 layout presets |
| `nether_banner_collection` | Collection picker for Collection layout |
| `nether_banner_height` | Adapt / Small / Medium / Large |
| `nether_banner_content_width` | Narrow / Medium / Wide / Full |
| `nether_banner_content_position` | 9-point content positioning grid |
| `nether_banner_content_alignment` | Left / Center / Right text alignment |
| `nether_banner_split_media_position` | Split layout media side |
| `nether_banner_heading_level` | H2 or H3 for primary heading |
| `nether_banner_aria_label` | Region accessibility label |

### Media

| Setting | Purpose |
|---------|---------|
| `nether_banner_media_type` | Image / Video / Background video |
| `nether_banner_image_desktop` | Desktop banner image |
| `nether_banner_image_mobile` | Optional mobile-specific image |
| `nether_banner_video` | Shopify-hosted video |
| `nether_banner_video_url` | YouTube / Vimeo URL |
| `nether_banner_poster_image` | Video poster image |
| `nether_banner_video_description` | Screen reader video description |
| `nether_banner_video_loop` | Video loop toggle |

### Visual

| Setting | Purpose |
|---------|---------|
| `nether_banner_overlay_opacity` | Image overlay opacity (0–100%) |
| `nether_banner_enable_image_overlay` | Toggle image overlay |
| `nether_banner_enable_glass` | Glass content panel (Glass System) |
| `nether_banner_glass_style` | Light / Medium / Heavy / Frosted |
| `nether_banner_enable_gradient` | Gradient overlay (Gradient System) |
| `nether_banner_gradient_style` | Brand / Dramatic / Vignette / Fade down |
| `nether_banner_enable_blur` | Background media blur |
| `nether_banner_show_decorative_shapes` | Optional decorative shapes |
| `nether_banner_enable_floating_card` | Floating elevated content card |
| `nether_banner_show_divider_top` | Top section divider |
| `nether_banner_show_divider_bottom` | Bottom section divider |
| `nether_banner_divider_style` | Line / Wave / Slant |

### Motion

| Setting | Purpose |
|---------|---------|
| `nether_banner_animation_style` | Fade / Slide / Stagger / Scale |
| `nether_banner_animation_speed` | Slow / Medium / Fast |
| `nether_banner_enable_parallax` | Scroll parallax on media (ScrollTrigger) |
| `nether_banner_enable_hover` | Subtle media scale on hover |

### Responsive

| Setting | Purpose |
|---------|---------|
| `nether_banner_layout_desktop` | Default / Editorial emphasis |
| `nether_banner_layout_tablet` | Default / Stacked / Centered |
| `nether_banner_layout_mobile` | Default / Stacked / Centered / Minimal |

### Blocks

Eyebrow, Heading, Subheading, Rich Text, Buttons, Trust Badges, Statistics, Feature List, Promotional Card (`hero_card`), Countdown (future-ready placeholder), `@app`.

---

## 6. Motion Integration

| Feature | Implementation |
|---------|----------------|
| Motion engine | NetherMotion via `component-hero.js` base class |
| Banner registration | `NetherMotion.registerSection('{sectionId}-banner')` in `component-banner.js` |
| Lazy init | `nether-banner` in `SECTION_SELECTORS`; motion boots on viewport intersection |
| Reveal animations | Fade, slide, stagger, scale — same engine as hero |
| Parallax | ScrollTrigger plugin loaded on demand via `data-nether-motion-plugins` |
| Hover interaction | Optional media scale via GSAP in `component-banner.js` |
| Reduced motion | `prefersReducedMotion()` check; CSS fallbacks disable blur/hover |
| GSAP loading | Never loaded manually — always via `NetherMotion.whenReady()` / `NetherMotion.load()` |

---

## 7. Accessibility Improvements

| Feature | Implementation |
|---------|----------------|
| Region landmark | `<nether-banner role="region" aria-label="...">` |
| Heading hierarchy | Merchant-selectable H2/H3 primary heading; subheading demoted automatically via hero block dispatcher |
| Keyboard buttons | Premium Button System with disabled state for blank links |
| Screen reader video | `aria-label` on deferred video posters; iframe `title` attributes |
| Trust badges | `role="list"`, optional `aria-labelledby` on heading |
| Section dividers | `aria-hidden="true"` + `role="presentation"` |
| Countdown placeholder | `hidden` + `aria-hidden="true"` until future implementation |
| Collection link | Focus-visible outline; descriptive link text |
| Reduced motion | Full respect via JS and CSS |

---

## 8. Performance Improvements

| Optimization | Detail |
|--------------|--------|
| Shared hero CSS | Loads `component-hero.css` once — banner CSS is modifiers only (~180 lines) |
| Conditional assets | Glass, Gradient, deferred-media CSS loaded only when needed |
| Lazy motion | NetherMotion lazy initialization via section selectors |
| Image priority | `fetchpriority: high` for first two sections |
| Responsive images | Reuses hero media snippet `picture` / `srcset` / `sizes` |
| No jQuery | ES6 custom elements only |
| No duplicate block Liquid | All content blocks delegate to `nether-hero-block.liquid` |
| Collection fallback | Avoids blank media when collection has image |

---

## 9. Framework Integration

| System | Integration |
|--------|-------------|
| Hero Framework | Composes `nether-hero` structural classes; extends media snippet |
| Button System | `button.liquid` via hero block dispatcher |
| Typography System | `type-overline`, `type-body`, heading size classes |
| Card System | `card.liquid` for promotional card block |
| Badge System | `badge.liquid` via trust badges snippet |
| Icon System | `icon.liquid` for feature list and collection link |
| Shadow System | `--shadow-*` tokens on floating card |
| Radius System | `--radius-level-*` on glass/card panels |
| Glass System | `glass-hero-*` utility classes |
| Gradient System | `grad-hero-*` / `grad-linear-*` overlay classes |
| NetherMotion | Section registry + lazy GSAP boot |
| Dawn fallbacks | `image-banner.liquid`, `collage.liquid` untouched |

---

## 10. Theme Editor Support

- **Section name:** Nether banner
- **3 presets:** Default promotional, Collection banner, Glass banner
- **10 block types** + app blocks
- **Full locale coverage** in `en.default.schema.json`
- **Design mode:** Section reload handled via inherited `shopify:section:load` listener
- **OS 2.0:** Section blocks, color scheme, padding controls
- **disabled_on:** Header and footer groups

---

## 11. Verification Checklist

| Check | Status |
|-------|--------|
| Dawn `image-banner.liquid` preserved | ✅ |
| Dawn `collage.liquid` preserved | ✅ |
| Nether Hero Framework preserved | ✅ |
| No duplicated design-system CSS | ✅ |
| No duplicated block Liquid | ✅ (delegates to hero blocks) |
| No duplicated media Liquid | ✅ (banner adapter in hero media) |
| No duplicated motion core | ✅ (extends `NetherHero`) |
| No existing functionality broken | ✅ |
| Theme Check — no banner-specific errors | ✅ |
| Theme Check — pre-existing locale JSON warnings | ⚠️ Unrelated (`custom_html` blocks in schema) |
| Online Store 2.0 compatible | ✅ |
| Responsive (desktop / tablet / mobile) | ✅ |
| `prefers-reduced-motion` respected | ✅ |
| GSAP never loaded manually | ✅ |

---

**Implementation complete.** The Nether Premium Banner Framework is ready for use across future client builds.
