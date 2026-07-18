# Nether Phase 3 Architecture Audit

**Audit date:** July 13, 2026  
**Scope:** All completed Phase 3 Presentation Frameworks + shared Phase 1/2 systems  
**Mode:** Read-only inspection — no code changes were made  
**Auditor:** Automated architecture review of `c:\Shopify\nether-main`

---

## Executive Summary

Nether Phase 3 delivers ten production-grade presentation frameworks built on a coherent **extend-Dawn** architecture. The **Hero framework** acts as the compositional hub; **Banner**, **Content**, **Newsletter**, and **CTA** inherit from it. **Collection**, **Product**, and **Media** share a parallel grid/showcase model. **FAQ** and **Testimonials** are the most domain-rich frameworks with specialized snippet trees.

The architecture is **mature and scalable** for long-term client reuse. The primary risks are **copy-paste drift** across frameworks (dividers, block dispatchers, showcase CSS/JS), **merchant-facing schema settings that are not wired to runtime behavior**, and **inconsistent conventions** (setting ID prefixes, JS inheritance, Theme Editor reload handlers). None of these block Phase 4, but they should be stabilized early to avoid compounding debt.

**Phase 3 footprint (approximate):**

| Asset type | Count | Notes |
|------------|-------|-------|
| Section orchestrators | 10 | ~9,500 lines total |
| `nether-*` snippets | 117 | Block dispatchers, cards, shells, dividers |
| Framework CSS files | 12 | ~5,900 lines (excl. shared design system) |
| Framework JS files | 12 | ~2,900 lines (excl. `nether-motion.js`) |
| Shared design system CSS | 10 | Loaded globally via `layout/theme.liquid` |

---

## 1. Overall Architecture Score

### **7.8 / 10**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Composition & hierarchy | 8.5 | Clear section → custom element → dispatcher → snippet pattern |
| Code reuse | 7.0 | Strong at design-system layer; weak at framework boilerplate layer |
| Extension points | 8.0 | `data-nether-*` hooks, `@app` blocks, adapter params, motion registry |
| Scalability | 7.5 | Patterns scale; duplication will slow Phase 4 without consolidation |
| Maintainability | 7.0 | Large section files, parallel implementations, naming drift |
| Merchant experience | 7.5 | Rich schemas; several dead/placeholder settings create confusion |
| Production readiness | 8.0 | Semantic HTML, reduced motion, conditional assets, Theme Editor support |

---

## 2. Strengths

### Architectural foundations

1. **Hero as compositional hub** — `nether-hero__*` BEM namespace, `NetherHero` JS class, and `nether-hero-media.liquid` adapter pattern provide a genuine shared base. Banner extends Hero via CSS class stacking and JS inheritance rather than duplicating the entire implementation.

2. **Extend-Dawn philosophy** — Frameworks compose Dawn primitives (`deferred-media`, `card-product`, `slider-component`, `.button`, `.card`, `color-{{ scheme }}`) instead of replacing them. This preserves Shopify ecosystem compatibility and reduces upgrade friction.

3. **Custom element boundaries** — Each framework registers a `<nether-{framework}>` custom element with scoped lifecycle, motion registration, and Theme Editor reload handling. Clean separation of concerns.

4. **NetherMotion centralization** — `assets/nether-motion.js` provides lazy GSAP loading, plugin registry, `registerSection()` lifecycle, `prefersReducedMotion()`, and declarative `fx-*` utilities via `custom-animations.js`. Motion is opt-in and respects accessibility.

5. **Phase 1 design system integration** — All frameworks consistently load and use `component-button`, `component-badge`, `component-icon`, `component-typography`, `component-card-premium`, `component-shadow`, `component-radius`, with conditional `component-glass` and `component-gradient`.

6. **Shared Liquid UI API** — `snippets/button.liquid`, `card.liquid`, `badge.liquid`, `icon.liquid`, `form-field.liquid` are the real cross-framework abstraction layer. Phase 3 block snippets delegate to these consistently.

7. **Horizontal snippet reuse** — `nether-content-image`, `nether-content-video`, `nether-content-quote`, `nether-content-custom-html` are consumed by FAQ, CTA, Newsletter, and Testimonials. `nether-hero-stat` and `nether-hero-feature-list` are shared across Hero-derived frameworks.

8. **Rich Theme Editor schemas** — 10 layout modes per framework, grouped settings (Framework, Media, Visual, Motion, Responsive, Colors, Padding), block limits on headings, multiple presets, `disabled_on: header/footer`, and i18n via `t:sections.nether_*` keys.

9. **Performance-conscious defaults** — Conditional CSS loading (glass, gradient, deferred-media, slider, quick-add stack), lazy image loading with eager first-row strategy, `defer` on scripts, `fetchpriority` on hero/banner first sections, GSAP loaded on demand.

10. **FAQ accessibility leadership** — Native `<details>`/`<summary>` accordion, search with `aria-live`, expand/collapse controls, and answer panels with `role="region"` set a high bar for the rest of the framework.

11. **Commerce hooks already present** — `data-nether-wishlist-placeholder`, `data-nether-compare-placeholder`, dual product rendering (overlay vs Dawn `card-product`), quick-add integration path, predictive search snippets, badge type system.

12. **Documentation culture** — Per-framework `*_FRAMEWORK_REPORT.md` files and Theme Check output files demonstrate systematic delivery discipline.

---

## 3. Weaknesses

### Critical functional gaps

| Issue | Location | Impact |
|-------|----------|--------|
| `category_highlight` blocks never render | `snippets/nether-collection-content.liquid` filters only `eyebrow/heading/subheading/text/buttons`; dispatcher in `nether-collection-block.liquid` handles the type but content loop never includes it | Merchants can add blocks that silently do nothing |
| Product source modes unimplemented | `best_sellers`, `new_arrivals`, `trending`, `recently_added` in schema; Liquid only handles `manual`, `featured`, `automatic`, and collection loop | Misleading Theme Editor options |
| Countdown blocks are placeholders | `nether-banner-countdown`, `nether-newsletter-countdown`, `nether-cta-countdown` — all `hidden` with no JS | Presets surface countdown; nothing renders |
| Media lightbox has markup only | `snippets/nether-media-lightbox.liquid` + `enable_lightbox` setting; zero JS in `component-media.js` | Merchant toggle with no behavior |
| Newsletter integration providers schema-only | Klaviyo/Mailchimp/Omnisend/custom expose `data-integration-provider` with no handler | Merchant-facing settings without runtime |

### Architectural debt

| Issue | Location | Impact |
|-------|----------|--------|
| ~85% JS duplication | `component-product-showcase.js` ≈ `component-media-showcase.js` | Maintenance burden; bug fixes must be applied twice |
| ~680 lines mirrored CSS | `component-product-showcase.css` ≈ `component-collection-showcase.css` | Same |
| 9 identical divider snippets | `snippets/nether-{banner,collection,content,cta,faq,media,newsletter,product,testimonials}-divider.liquid` | File sprawl; CSS duplicated per framework |
| `nether-hero-media.liquid` is a multi-framework adapter (~325 lines) | Adapters: `hero`, `banner`, `content`, `cta`, `faq`, `newsletter`, `testimonials` | High coupling; changes ripple across 8 sections |
| Parallel media renderers | `nether-hero-media.liquid` vs `nether-media-render.liquid` | ~200+ lines of parallel video/iframe/picture logic |
| Block dispatcher duplication | `nether-hero-block`, `nether-product-block`, `nether-media-block`, `nether-collection-block`, etc. | Eyebrow/heading/text/buttons cases copy-pasted with class prefix changes |
| Section preamble duplication | Animation speed mapping, class list builder, overlay gradient switch, padding `{% style %}` (~80–120 lines × 10) | Same logic maintained in 10 section files |

### Consistency drift

| Issue | Detail |
|-------|--------|
| JS inheritance split | Newsletter/CTA/Banner extend `NetherHero`; Testimonials/FAQ/Product/Media/Collection are standalone `HTMLElement` classes reimplementing ~150 lines of motion boilerplate |
| `handleSectionLoad` inconsistency | Hero/Content use `event.detail.sectionId`; Product/Media/Collection use `event.target.contains(this)`; behavior differs in Theme Editor |
| Schema setting ID prefixes | Hero uses generic `nether_*`; Banner uses `nether_banner_*`; Content uses `nether_content_*`; Collection/Product use generic `nether_*` within their schema |
| Text style tokens | Content uses `type-body-lg`; Product/Media use `body`/`subtitle` |
| Button style options | Content includes `ghost`; Product/Media do not |
| Translation namespace leak | Content blocks reference `t:sections.nether_hero.*` keys for `statistic`, `feature_list`, `content_card` |
| Video handling | Product card video lacks deferred poster-button pattern; Media/Content/Hero differ in implementation |
| Stat snippet duplication | `nether-hero-stat` vs `nether-collection-stat` vs `nether-product-stat` — parallel implementations; Hero stat lacks `aria-label` that Collection stat has |

### Minor issues

- Banner JS silently fails if `component-hero.js` is not loaded first (`customElements.get('nether-hero')?.constructor` guard).
- Media `initKeyboardNavigation()` checks `data-carousel-ready` but `sections/nether-media.liquid` never sets it (Product/Collection/Testimonials do).
- FAQ accordion questions always render as `<h3>` regardless of section `nether_heading_level`.
- Testimonials card quotes lack `<blockquote>` semantics (quote block via `nether-content-quote` does use it).
- `component-newsletter.css` overlaps Dawn newsletter styles partially covered by `component-form.css`.
- Theme Check reports ValidJSON errors in `locales/en.default.schema.json` (nested object type mismatches) and `UndefinedObject` warnings for `scheme_classes` in layout files.

---

## 4. Reuse Analysis

### Tier A — Strong reuse (working as intended)

| Abstraction | Consumers | Quality |
|-------------|-----------|---------|
| `snippets/button.liquid` | All Phase 3 frameworks, header, footer | Excellent |
| `snippets/badge.liquid` | Product, collection, media cards, trust badges | Excellent |
| `snippets/icon.liquid` | Header, hero, forms, product placeholders | Excellent |
| `snippets/card.liquid` | Hero, content, CTA blocks, mega menu | Excellent |
| `nether-hero-media.liquid` | Hero, banner, content, CTA, FAQ, newsletter, testimonials | Good (but overloaded) |
| `nether-content-{image,video,quote,custom-html}.liquid` | Content, FAQ, CTA, newsletter, testimonials | Excellent |
| `nether-hero-stat.liquid` | Hero, content, CTA, newsletter | Good |
| `component-glass.css` / `component-gradient.css` | All frameworks (conditional) | Excellent |
| `NetherMotion` API | All 10 framework JS files | Excellent |
| `--nether-hero-*` CSS bridge vars | CTA, newsletter, FAQ, testimonials, content, banner | Good pattern |

### Tier B — Partial reuse (opportunity for consolidation)

| Pattern | Current state | Consolidation target |
|---------|---------------|---------------------|
| Section dividers | 9 near-identical snippets + CSS per framework | Single `nether-section-divider.liquid` + `.nether-divider` in `component-hero.css` |
| Block dividers | Inline in each `*-block.liquid` | Shared partial with `framework` param |
| Eyebrow/heading/text blocks | ~50 lines × 10 dispatchers | `nether-typography-blocks.liquid` partial |
| Grid showcase CSS | Product ≈ Collection (~680 lines mirrored) | Shared `component-showcase-grid.css` with BEM prefix param or CSS custom properties |
| Grid showcase JS | Product ≈ Media ≈ Collection (~200 lines shared) | `nether-grid-motion.js` base module |
| Overlay card Liquid | `nether-product-card` ≈ `nether-media-card` | Shared base with type-specific extensions |
| Media rendering | `nether-hero-media` vs `nether-media-render` | `nether-media-core.liquid` partial |
| Stat blocks | hero-stat, collection-stat, product-stat | Single `nether-stat.liquid` with `prefix` param |
| Section preamble Liquid | ~100 lines × 10 sections | `nether-section-preamble.liquid` render tag |
| Glass panel class logic | Duplicated in shell/content snippets | Shared liquid assign block |

### Tier C — Intentional divergence (correct)

| Pattern | Rationale |
|---------|-----------|
| Content uses Hero shell; Product/Media use grid model | Different layout paradigms |
| Product integrates Dawn `card-product` + quick-add | Commerce requirement |
| FAQ has richest snippet tree (14 files) | Domain complexity warrants it |
| Media has before/after + lightbox hooks | Unique media capabilities |
| Banner extends Hero rather than standalone | Correct inheritance model |

### Reuse score by framework

| Framework | Reuse of shared systems | Unique complexity | Reuse grade |
|-----------|------------------------|-------------------|-------------|
| Hero | Foundation layer | Media adapter hub | A (base) |
| Banner | Extends Hero (CSS, JS, blocks, media) | Countdown, dividers, collection bar | A |
| Content | Hero shell + content snippets | Row layouts, timeline | A− |
| CTA | Hero shell + content snippets | Promotion aside, analytics hooks | A− |
| Newsletter | Hero shell + form system | Companion field blocks | A− |
| Collection | Design system + motion | Own card/grid model | B+ |
| Product | Design system + Dawn commerce | Dual rendering paths | B+ |
| Media | Design system + motion | Before/after, lightbox stubs | B |
| Testimonials | Hero media + content snippets | 10 layouts, social proof cards | B+ |
| FAQ | Hero media + content snippets | Accordion, search, categories | B+ |

---

## 5. Liquid Review

### Composition quality: **Good**

The established pattern is consistent and well-documented in snippet comments:

```
sections/nether-{framework}.liquid
  → asset loading + {% style %} CSS vars
  → <nether-{framework}> custom element
  → nether-hero-media (adapter param) [hero-composed frameworks]
  → nether-{framework}-content / -shell
  → nether-{framework}-block (case block.type)
  → typed sub-snippets
  → nether-{framework}-divider (top/bottom)
```

### Duplicate snippets (high priority)

| Duplicates | Files | Lines each |
|------------|-------|------------|
| Section dividers | 9 files | ~21 |
| Block dispatchers (header blocks) | 10 files | ~50–90 |
| Stat blocks | 3 files | ~63–64 |
| Overlay cards | 2 files (product, media) | ~219–336 |

### Overly large templates

| File | ~Lines | Concern |
|------|--------|---------|
| `sections/nether-product.liquid` | 1,385 | Schema + grid loop + Dawn fallback in one file |
| `sections/nether-banner.liquid` | 1,093 | Schema dominates; layout mapping logic embedded |
| `sections/nether-faq.liquid` | 1,108 | Preamble + layout routing + schema |
| `snippets/nether-hero-media.liquid` | 325 | Multi-adapter hub — should not grow further |
| `snippets/nether-product-card.liquid` | 336 | Complex class-building logic |

**Recommendation:** Section files are large primarily due to comprehensive schemas (acceptable for Shopify). Runtime Liquid in sections is manageable. The risk is schema/maintenance coupling, not render performance.

### Naming consistency: **Mixed**

- File naming: **Consistent** — `nether-{framework}-{role}.liquid`
- CSS class naming: **Consistent** — BEM with `nether-{framework}__*` prefix
- Setting IDs: **Inconsistent** — see Weaknesses section
- Translation keys: **Mostly consistent** — `t:sections.nether_{framework}.*` with Hero namespace leaks in Content

### Merchant customization quality: **Good with caveats**

**Strengths:**
- 10 layout modes per framework with meaningful visual differences
- Granular block settings (per-card media, overlay, badge, CTA)
- Block limits prevent duplicate headings
- Multiple presets accelerate merchant onboarding
- `@app` block support on Hero, Banner, Product, Content, Media, Testimonials, CTA

**Caveats:**
- Dead settings (countdown, product sources, lightbox, integration providers) erode trust
- `category_highlight` block appears in Theme Editor but never renders
- VIP/waitlist/luxury layouts force glass/gradient CSS even if merchant didn't opt in via checkbox

### Liquid efficiency: **Good**

- Block filtering uses `{% case %}` in loops — standard Shopify pattern
- `needs_deferred_media` detection loops are bounded to section blocks
- No excessive nested `for` loops observed
- `{% liquid %}` tags used appropriately for assign blocks

---

## 6. CSS Review

### Design token usage: **Good**

**Global design tokens (Phase 1):**

| System | Prefix | File |
|--------|--------|------|
| Typography | `--type-*` | `component-typography.css` |
| Icons | `--icon-*` | `component-icon.css` |
| Badges | `--badge-*` | `component-badge.css` |
| Forms | `--form-*` | `component-form.css` |
| Shadows | `--shadow-*`, `--shadow-level-*` | `component-shadow.css` |
| Radius | `--radius-*`, `--radius-level-*` | `component-radius.css` |
| Glass | `--glass-*` | `component-glass.css` |
| Gradients | `--grad-*`, `--gradient-*` | `component-gradient.css` |

**Section runtime tokens (Phase 3):**

- `--nether-hero-*` — bridge variables reused across hero-composed frameworks
- `--nether-{section}-gap`, `--nether-{section}-columns-*`, `--nether-{section}-overlay-opacity` — per-section layout tokens set in `{% style %}` blocks

**Note:** There is no unified `--nether-*` global design token file. This is intentional — Nether composes Dawn `--color-*` / `--font-*` with domain-specific token systems.

### Duplicate styles (estimated ~1,200+ lines recoverable)

| Duplication | Approx. lines | Files |
|-------------|---------------|-------|
| Product ≈ Collection showcase | ~680 | `component-product-showcase.css`, `component-collection-showcase.css` |
| Divider styles × 9 frameworks | ~180 | Per-framework CSS files |
| Glass panel logic (CSS classes) | ~100 | Shell/content CSS across frameworks |
| Hover-reveal / parallax / reduced-motion | ~150 | Per-framework CSS |
| Grid header styles | ~90 | Product, collection, media |

### Selector consistency: **Good**

- BEM naming is consistent within each framework
- Modifier pattern: `nether-{framework}--layout-*`, `--card-*`, `--desktop-*`, `--tablet-*`, `--mobile-*`
- Shared utility classes from design system: `card-hover-zoom`, `grad-hero-brand`, `glass-card-light`, `type-heading-md`
- Bridge classes connect premium cards to shadow/radius: `.card--shadow-*`, `.card--radius-*`, `.card--premium-glass`

### Glass/Gradient/Shadow/Radius reuse: **Excellent**

All frameworks conditionally load and apply the same utility classes. Glass styles (`glass-hero-*`, `glass-card-*`), gradient overlays (`grad-hero-brand`, `grad-hero-dramatic`), shadow levels, and radius levels are used consistently across hero-composed and grid frameworks.

### Performance

**Good:**
- Conditional CSS loading per section (glass, gradient, deferred-media, slider, mask-blobs, quick-add)
- `prefers-reduced-motion` overrides in all framework CSS files
- CSS custom properties minimize inline style duplication

**Concerns:**
- Each Nether section loads 9–11 `<link>` tags unconditionally (browser cache helps after first hit)
- Content always loads Hero CSS even for text-only `minimal` layouts
- Product section loads 10+ CSS files at section top on product showcase pages
- No CSS bundling strategy for Phase 3 frameworks

### Maintainability: **Moderate**

CSS is well-organized within files but cross-framework patterns are not DRY. A change to grid gap behavior or divider styling requires edits in multiple files.

---

## 7. JavaScript Review

### Architecture: **Good with duplication**

**Pattern (all frameworks):**
1. Custom element class (`Nether{Framework} extends HTMLElement` or `extends NetherHero`)
2. `connectedCallback` → parse config, register motion, init features
3. `disconnectedCallback` → kill tweens, remove listeners
4. `NetherMotion.registerSection('{sectionId}-{type}', { init, destroy })`
5. `data-nether-motion-ready="true"` after GSAP init

### Inheritance hierarchy

```
NetherHero (component-hero.js)
  ├── NetherBanner (component-banner.js)
  ├── NetherNewsletter (component-newsletter-showcase.js)
  └── NetherCta (component-cta.js)

Standalone HTMLElement classes:
  ├── NetherCollection (component-collection-showcase.js)
  ├── NetherProduct (component-product-showcase.js)
  ├── NetherContent (component-content.js)
  ├── NetherMedia (component-media.js)
  ├── NetherTestimonials (component-testimonials.js)
  └── NetherFaq (component-faq.js)
```

**Issue:** The standalone classes duplicate `parseConfig`, `prefersReducedMotion`, `getRevealFromProps`, `killMotionTweens`, stagger reveal, parallax, hover-reveal, and `handleSectionLoad` logic. Newsletter/CTA/Banner correctly inherit from Hero; the other six should follow the same pattern or use a shared `NetherFramework` base.

### Duplicate logic (estimated ~900+ lines recoverable)

| Duplication | Frameworks | Shared logic |
|-------------|------------|--------------|
| Motion registration + reveal | All 10 | ~80 lines each |
| Parallax + ScrollTrigger | 8 frameworks | ~40 lines each |
| Hover-reveal GSAP | Product, media, collection, testimonials | ~50 lines each |
| Carousel keyboard nav | Product, collection, testimonials, media (broken) | ~25 lines each |
| `killMotionTweens` cleanup | All 10 | ~20 lines each |

### Event architecture: **Good**

- `shopify:section:load` / `shopify:section:unload` for Theme Editor lifecycle
- `nether:motion:ready` custom event from `nether-motion.js`
- CTA analytics: `data-nether-cta-event` click dispatch
- FAQ search: client-side filter via `data-search-text` attributes
- Drawer coordination events from Phase 2 (`nether:drawer:*`, `nether:search:*`)

### NetherMotion integration: **Excellent**

- Lazy GSAP 3.12.7 load from jsDelivr CDN
- Plugin registry: ScrollTrigger, Flip, Observer
- `needsMotion()` discovery via `SECTION_SELECTORS` and `[data-nether-motion]`
- `prefersReducedMotion()` checked at JS and CSS layers
- Declarative `fx-*` classes via `custom-animations.js` / `NetherMotion.Fx`

**Risk:** FX selector strings duplicated between `nether-motion.js` and `custom-animations.js` — manual sync required.

**Risk:** Composite registry IDs (`{sectionId}-hero`, `{sectionId}-faq`) may not align with Theme Editor `event.detail.sectionId` for destroy/init in all cases.

### Lazy loading: **Good**

- GSAP loaded only when motion elements detected
- ScrollTrigger loaded on demand via `data-nether-motion-plugins`
- Scripts use `defer` attribute
- Background video autoplay with silent catch on play failure

### Memory management: **Good**

- `disconnectedCallback` kills GSAP tweens and ScrollTrigger instances
- `killMotionTweens()` pattern consistent across frameworks
- Event listeners removed on disconnect (FAQ, testimonials, media, product)
- Before/after slider teardown in media framework

### Animation architecture: **Good**

- Reveal types: fade, slide, stagger, scale, accordion_reveal, timeline_reveal, story_reveal
- Config via `data-nether-motion`, `data-nether-*-animate` attributes
- Animation speed mapped to duration in Liquid (slow: 0.8, default: 0.5, fast: 0.3)
- Reduced motion: JS sets opacity/transform reset; CSS disables blur/scroll animations

---

## 8. Theme Editor Review

### Merchant settings: **Comprehensive**

Each framework provides:
- **Framework group:** Layout mode (10 options), content width, alignment
- **Media group:** Type (image/video/background), aspect ratio, overlay opacity
- **Visual group:** Glass, gradient, card style, hover effects, floating cards, image shape
- **Motion group:** Animation style, speed, parallax toggle
- **Responsive group:** Desktop/tablet/mobile layout modifiers, column counts
- **Colors group:** `color_scheme` picker
- **Padding group:** Top/bottom padding with mobile scaling (0.75×)

### Consistency: **Mixed**

| Aspect | Status |
|--------|--------|
| Setting group headers | Consistent across all 10 frameworks |
| Block type naming | Consistent (eyebrow, heading, subheading, text, buttons) |
| Setting ID naming | Inconsistent (see Weaknesses) |
| Preset count | 1–3 per framework |
| `disabled_on` | Consistent (header, footer) |
| `@app` block | Partial — missing on FAQ and Newsletter |
| i18n coverage | Good — 471 `nether_*` keys in `en.default.schema.json` |

### Naming issues (developer/merchant confusion risk)

| Section | Setting pattern | Example |
|---------|----------------|---------|
| Hero | Generic `nether_*` | `nether_media_type` |
| Banner | Prefixed `nether_banner_*` | `nether_banner_media_type` |
| Content | Prefixed `nether_content_*` | `nether_content_layout` |
| Collection/Product | Generic `nether_*` | `nether_layout`, `nether_gap` |
| FAQ/Testimonials | Mixed | `nether_faq_media_type` + generic `nether_enable_parallax` |
| CTA/Newsletter | Mixed | `nether_cta_media_type` + generic `nether_layout` |

### Defaults: **Sensible**

- Hero: `h1`, classic layout, medium height, fade animation
- Banner: `h2`, promotional layout, hover enabled
- Collection: luxury_grid, stagger animation, 36px padding
- Product: manual source, overlay layout
- Content: editorial_story layout
- FAQ: classic accordion
- Testimonials: grid layout

### Presets: **Good variety**

- 1 preset (Hero) to 3 presets (Banner, Collection, FAQ, Testimonials, Newsletter, CTA)
- Presets include meaningful block combinations
- **Concern:** Some presets include countdown blocks that render hidden

### Merchant experience grade: **B+**

Rich customization surface with clear grouping. Deductions for dead settings, inconsistent naming, and blocks that appear functional but are placeholders.

---

## 9. Accessibility Review

### Overall grade: **B+**

### Strengths

| Pattern | Frameworks |
|---------|------------|
| `role="region"` + configurable `aria-label` | All 10 |
| Decorative overlays/shapes: `aria-hidden="true"` | Hero, banner, content, media |
| Heading level configurability | Hero (h1/h2), banner (h2), collection/product (h2/h3) |
| Grid `role="list"` + translated `aria-label` | Collection, product, media, testimonials |
| Native `<details>`/`<summary>` accordion | FAQ |
| Search: visually hidden label, `aria-controls`, `aria-live="polite"` | FAQ |
| Form `role="group"` + labeled fields | Newsletter |
| Rating `role="img"` + translated label | Testimonials |
| Reduced motion at CSS + JS layers | All frameworks |
| Hover-reveal: `focusin`/`focusout` handlers (not mouse-only) | Product, media, collection, testimonials |
| Trust badges: `role="list"` | Hero, testimonials |
| Feature list: `role="list"` | Hero, content |
| Dividers: `aria-hidden` + `role="presentation"` | All with dividers |
| Before/after range input: `aria-label` | Media |
| Wishlist/compare placeholders: `aria-disabled="true"`, `tabindex="-1"` | Product, header |

### Gaps

| Issue | Severity | Location |
|-------|----------|----------|
| FAQ questions always `<h3>` regardless of section heading level | Medium | `snippets/nether-faq-item.liquid` |
| Testimonials card quotes lack `<blockquote>` | Medium | `snippets/nether-testimonials-card.liquid` |
| Hero stat blocks lack `aria-label` on `role="group"` | Low | `snippets/nether-hero-stat.liquid` |
| CTA rendered as `<span class="button">` inside `<a>` | Medium | Product/media cards |
| Lightbox trigger is `visually-hidden` with no visible control | High (if wired) | `snippets/nether-media-lightbox.liquid` |
| Carousel lacks full ARIA carousel pattern | Medium | Testimonials, product, collection |
| Countdown blocks `hidden` but present in block list | Low | Banner, newsletter, CTA |
| Background videos autoplay without user control | Medium | Media, content, hero |
| Multiple Hero sections can produce multiple H1s | Medium | `sections/nether-hero.liquid` default |
| Product card CTA is visual-only inside single link | Low | By design for card-as-link pattern |

### Keyboard navigation

- FAQ: full keyboard accordion via native `<details>`
- Product/Collection/Testimonials carousel: ArrowLeft/ArrowRight between card links
- Media: keyboard nav code exists but `data-carousel-ready` never set on section
- Mega menu: keyboard navigation via Phase 2 header system
- Mobile drawer: focus trap via Phase 2 drawer system

### Reduced motion: **Excellent**

All framework CSS files include `prefers-reduced-motion` overrides. All framework JS files check `prefersReducedMotion()` before initializing GSAP animations.

---

## 10. Performance Review

### Overall grade: **B+**

### DOM complexity: **Acceptable**

- Grid frameworks render `<ul>` > `<li>` > card markup — standard pattern
- Hero-composed frameworks use shallow DOM (media + overlay + content panel)
- FAQ with 48 max blocks is manageable for client-side search
- No observed excessive wrapper nesting

### Liquid efficiency: **Good**

- Section-level assigns computed once
- Block loops bounded to section scope
- Conditional rendering avoids empty containers
- `needs_deferred_media` / `needs_slider` detection avoids unnecessary asset loads

### CSS efficiency: **Moderate**

| Good | Concern |
|------|---------|
| Conditional glass/gradient/media/slider CSS | 9–11 `<link>` tags per section instance |
| Global design system loaded once in `theme.liquid` | No Phase 3 CSS bundling |
| CSS custom properties minimize repetition | Product section loads 10+ CSS files |
| `prefers-reduced-motion` reduces animation cost | Content loads Hero CSS for text-only layouts |

### JS efficiency: **Good**

| Good | Concern |
|------|---------|
| GSAP lazy-loaded via NetherMotion | External CDN dependency (jsDelivr) |
| ScrollTrigger on demand | Duplicate JS across frameworks (maintenance, not runtime) |
| `defer` on all framework scripts | Background video/iframe autoplay in grids |
| Theme Editor lifecycle cleanup | No shared motion base class |

### Lazy loading: **Good**

- Images: first row eager (`card_index <= columns_desktop`), rest `loading="lazy"`
- Hero: `fetchpriority: high` when `section.index == 1`
- Banner: `fetchpriority: high` when `section.index <= 2`
- Responsive `<picture>` with mobile `srcset`
- Video: `component-deferred-media.css` loaded only when video blocks present

### Potential bottlenecks

1. **Multiple Nether sections on one page** — each loads hero CSS/JS + framework CSS/JS (cache mitigates after first load)
2. **GSAP CDN** — additional RTT on first motion-enabled page; privacy consideration for client sites
3. **FAQ `data-search-text`** — embeds full Q+A in DOM attributes; minor HTML bloat for long answers
4. **Background videos in grids** — CPU/bandwidth on scroll without intersection observer pause
5. **Large schema JSON** — `en.default.schema.json` is substantial; affects Theme Editor load, not storefront

---

## 11. Motion Review

### NetherMotion usage: **Excellent foundation**

| Feature | Status |
|---------|--------|
| Centralized GSAP loader | Implemented |
| Plugin registry (ScrollTrigger, Flip, Observer) | Implemented |
| `registerSection()` lifecycle | Used by all 10 frameworks |
| `prefersReducedMotion()` | Used by all frameworks |
| `needsMotion()` discovery | Implemented |
| Declarative `fx-*` utilities | Implemented via `custom-animations.js` |
| `nether:motion:ready` event | Implemented |
| Theme Editor section reload | Implemented (with handler inconsistencies) |

### Animation consistency: **Good**

- All frameworks use the same animation speed mapping (slow/default/fast → duration)
- Reveal types are consistent within grid frameworks (fade, slide, stagger, scale)
- Hero-composed frameworks share `NetherHero` reveal logic
- Parallax uses ScrollTrigger with `scrub` consistently
- Hover-reveal uses GSAP on focus-capable events

### Future Phase 5 readiness: **Good**

**Extension points already in place:**
- `NetherMotion.registerSection()` — add new section types without modifying core
- `NetherMotion.load(['flip', 'observer'])` — plugin opt-in via `data-nether-motion-plugins`
- `NetherMotion.Fx` — declarative animations without custom JS
- `data-nether-motion="{type}"` — framework type registration
- `custom-animations.js` — scroll-scrub, marquee, caterpillar slider patterns from Phase 2

**Gaps for Phase 5:**
- No shared motion base class for grid frameworks (will duplicate more if not consolidated)
- FX selector strings must be manually synced between two files
- Composite registry IDs may cause Theme Editor motion state issues
- No intersection observer for pausing off-screen videos
- Countdown/timer module referenced but not implemented (needed for promotional animations)

### Possible improvements (no code changes made)

1. Extract `NetherFramework` base class from `NetherHero` for grid frameworks
2. Consolidate FX selectors into single source of truth
3. Add `NetherMotion.registerPlugin()` for custom Phase 5 plugins
4. Implement intersection observer utility for video/animation pause
5. Wire countdown module or remove from presets

---

## 12. File Organization Review

### Folder structure: **Good**

```
sections/          nether-{framework}.liquid (10 files)
snippets/          nether-{framework}-{role}.liquid (117 files)
assets/            component-{framework}.{css,js} (24 files)
                   component-{design-system}.css (10 files)
                   nether-motion.js, custom-animations.js
locales/           en.default.json, en.default.schema.json
layout/            theme.liquid (global asset loading)
```

### Naming: **Consistent**

- Sections: `nether-{name}.liquid`
- Snippets: `nether-{framework}-{role}.liquid`
- CSS: `component-{name}.css`
- JS: `component-{name}.js`
- Custom elements: `<nether-{framework}>`
- CSS classes: `nether-{framework}__*`

### Consistency: **Good with exceptions**

- Newsletter uses both `component-newsletter.css` (Dawn base) and `component-newsletter-showcase.css` (framework)
- Mega menu uses `component-mega-menu-premium.css` (premium suffix)
- Collection/Product use `component-{name}-showcase.css` (showcase suffix)
- Content/Media use `component-{name}.css` (no suffix)

### Scalability: **Good**

The `nether-{framework}-{role}` naming convention scales cleanly. Adding Phase 4 frameworks (e.g., `nether-product-page`, `nether-cart`) follows established patterns without restructuring.

### Future maintainability concerns

1. **117 snippets** — divider/stat/block duplication inflates count; consolidation would reduce to ~90
2. **Large section files** — schemas dominate line count; consider schema extraction if Shopify supports it in future
3. **No `AGENTS.md` or architecture doc** in repo root (framework reports exist per feature but no master index)
4. **Theme Check output files** (`theme-check-*.txt`) are useful artifacts but not integrated into CI

### File organization grade: **B+**

---

## 13. Commerce Readiness

Assessment of whether Phase 3 architecture supports upcoming Phase 4 commerce features.

| Feature | Readiness | Existing hooks | Gaps |
|---------|-----------|----------------|------|
| **Product Page Framework** | Ready | Dawn PDP templates intact; design tokens, badge system, form system, motion engine | Need Nether-branded PDP sections; wire global tokens to PDP |
| **Collection Framework** | Ready | `nether-collection` showcase exists; collection cards, media, stats | Collection *page* template (filters, sort, pagination) not started |
| **Cart Framework** | Partial | Dawn `cart-drawer.js`, `window.routes.cart_*`, header cart icon | No Nether-branded cart drawer/mini-cart; cart page untouched |
| **Wishlist** | Scaffolded | `data-nether-wishlist-placeholder` in header + product actions; settings exist | No JS module, no persistence layer, no UI |
| **Compare** | Scaffolded | `data-nether-compare-placeholder` in header + product actions | Same as wishlist |
| **Quick View** | Not started | Icon `eye` documented in icon system | No snippet, no modal, no JS |
| **Bundles** | Not started | Dawn bundle support may exist in base theme | No Nether integration |
| **Upsells / Cross-sells** | Partial | Product showcase supports promotional cards, collection picker in CTA/banner | No cart/checkout upsell integration |
| **Sticky Add To Cart** | Not started | Product actions snippet exists | No sticky bar component |
| **Quick Add (AJAX)** | Partial | Works via Dawn `card-product` path when `nether_quick_add != 'none'` | Overlay card path links to PDP only (placeholder in `nether-product-actions.liquid`) |

### Commerce architecture assessment

**Ready to proceed:** The design system (buttons, badges, cards, forms, motion) and product showcase dual-rendering strategy provide a solid foundation. Phase 4 can build commerce features by:

1. Replacing `data-nether-*-placeholder` nodes with real custom elements (same pattern as search drawer)
2. Extending `nether-product-actions.liquid` to call Dawn `product-form.js` / quick-add modal
3. Registering new sections via `NetherMotion.registerSection()`
4. Reusing overlay card patterns for quick view modals

**Recommended before/during Phase 4 start:**
- Consolidate product/media/collection JS into shared grid base (quick add, quick view, wishlist will need same motion patterns)
- Normalize schema setting ID conventions before adding PDP/cart schemas
- Implement or remove dead product source settings
- Wire overlay quick-add or rename setting to avoid merchant confusion

---

## 14. Recommended Improvements

### Critical (address before or at Phase 4 start)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| C1 | Fix `category_highlight` render path or remove from schema | Merchants can add blocks that never appear |
| C2 | Implement or remove product source modes (`best_sellers`, `new_arrivals`, `trending`, `recently_added`) | Misleading Theme Editor options |
| C3 | Implement or remove countdown blocks from schemas and presets | Presets advertise functionality that doesn't exist |
| C4 | Implement or remove media lightbox setting | Merchant toggle with no behavior |
| C5 | Fix media `data-carousel-ready` (set on section) or remove keyboard nav dead code | Broken accessibility feature |

### Recommended (address during Phase 4 stabilization)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| R1 | Extract shared `nether-section-divider.liquid` + centralize divider CSS | 9 duplicate snippets + CSS |
| R2 | Create `NetherFramework` JS base class; migrate 6 standalone CEs | ~900 lines duplicated motion logic |
| R3 | Consolidate `component-product-showcase.css` and `component-collection-showcase.css` | ~680 lines mirrored |
| R4 | Unify `nether-media-render.liquid` and `nether-hero-media.liquid` core logic | ~200 lines parallel media code |
| R5 | Standardize schema setting ID convention (pick prefixed or generic per section) | Developer/merchant confusion |
| R6 | Unify `handleSectionLoad` to use `event.detail.sectionId` everywhere | Theme Editor motion state consistency |
| R7 | Add `@app` block support to FAQ and Newsletter | Parity with other frameworks |
| R8 | Fix FAQ accordion heading levels to respect `nether_heading_level` | Accessibility hierarchy |
| R9 | Add `aria-label` to hero stat `role="group"` | Accessibility parity with collection stats |
| R10 | Resolve Theme Check ValidJSON errors in `en.default.schema.json` | Theme Check compatibility |
| R11 | Extract shared typography block partial for eyebrow/heading/text/buttons | 10 duplicate dispatcher cases |
| R12 | Implement or remove newsletter integration provider settings | Merchant confusion |

### Optional (nice to have, can defer)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| O1 | Create `nether-section-preamble.liquid` for shared Liquid preamble | ~100 lines × 10 sections |
| O2 | Bundle Phase 3 CSS into `nether-phase3.css` or conditional render tag | Reduce `<link>` tag count |
| O3 | Add `<blockquote>` to testimonials card quotes | Semantic HTML improvement |
| O4 | Add full ARIA carousel pattern to slider layouts | Enhanced screen reader UX |
| O5 | Add intersection observer for off-screen video pause | Performance optimization |
| O6 | Consolidate FX selectors into single source of truth | Prevent drift between motion files |
| O7 | Create master `ARCHITECTURE.md` index linking framework reports | Developer onboarding |
| O8 | Wire merchant multipliers (`--shadow-intensity`, `--radius-scale`) to theme settings | Design token completeness |
| O9 | Rename `featured` product source to reflect actual behavior (block order) | Naming accuracy |
| O10 | Add CI integration for Theme Check | Automated quality gate |

---

## 15. Final Verdict

### **Ready after minor improvements**

Nether Phase 3 has achieved a **coherent, reusable, production-grade presentation architecture**. The Hero hub pattern, design system integration, NetherMotion engine, and custom element boundaries provide a strong foundation for long-term client development.

Phase 4 commerce work **can begin now**. The recommended approach:

1. **Week 0 stabilization** — Address Critical items (C1–C5) to eliminate merchant-facing dead settings. These are small, targeted fixes that do not require architectural refactoring.

2. **Phase 4 build** — Proceed with Product Page, Cart, Wishlist, and Quick View using existing hooks (`data-nether-*-placeholder`, dual product rendering, Dawn commerce primitives).

3. **Phase 4 parallel debt reduction** — Address Recommended items (R1–R12) as consolidation passes between commerce features. Prioritize R2 (JS base class) and R4 (media unification) before building Quick View and Sticky Add To Cart, which will need the same patterns.

The framework does **not** need a ground-up architecture rework. The weaknesses are primarily **duplication debt** and **schema/runtime mismatches** — both are normal at the end of a rapid framework expansion phase and are straightforward to address incrementally.

---

## Appendix A: Framework Inventory

| Framework | Section | Snippets | CSS (lines) | JS (lines) | Layouts | Presets |
|-----------|---------|----------|-------------|------------|---------|---------|
| Hero | 969 | 7 | 562 | 222 | 6 | 1 |
| Banner | 1,093 | 4 | 213 | 75 | 8 | 3 |
| Collection | 1,040 | 7 | 711 | 279 | 9 | 3 |
| Product | 1,385 | 9 | 824 | 280 | 9 | 3 |
| Content | 1,064 | 10 | 506 | 233 | 10 | 3 |
| Media | 956 | 7 | 613 | 317 | 10 | 3 |
| Testimonials | 1,030 | 13 | 444 | 361 | 10 | 3 |
| FAQ | 1,108 | 14 | 578 | 457 | 10 | 3 |
| Newsletter | 915 | 5 | 367 | 202 | 10 | 3 |
| CTA | 929 | 6 | 280 | 247 | 10 | 3 |

## Appendix B: Per-Framework Architecture Pattern

| Framework | Pattern | Hero dependency | JS base |
|-----------|---------|-----------------|---------|
| Hero | Base orchestrator | — | `NetherHero` |
| Banner | Hero extension | Strong (CSS, JS, media, blocks) | `extends NetherHero` |
| Content | Hero shell + row grid | Strong (CSS, JS, media, classes) | Standalone |
| CTA | Hero shell + aside | Strong (CSS, JS, media) | `extends NetherHero` |
| Newsletter | Hero shell + form | Strong (CSS, JS, media) | `extends NetherHero` |
| Collection | Grid showcase | None (parallel) | Standalone |
| Product | Grid showcase + Dawn commerce | None (parallel) | Standalone |
| Media | Grid showcase + before/after | None (parallel) | Standalone |
| Testimonials | Hero shell + card grid | Medium (media adapter) | Standalone |
| FAQ | Hero shell + accordion | Medium (media adapter) | Standalone |

## Appendix C: Existing Documentation

| Report | Path |
|--------|------|
| Hero | `HERO_FRAMEWORK_REPORT.md` |
| Banner | `BANNER_FRAMEWORK_REPORT.md` |
| Collection | `COLLECTION_SHOWCASE_REPORT.md` |
| Product | `PRODUCT_SHOWCASE_REPORT.md` |
| Content | `CONTENT_FRAMEWORK_REPORT.md` |
| Media | `MEDIA_FRAMEWORK_REPORT.md` |
| Testimonials | `TESTIMONIALS_FRAMEWORK_REPORT.md` |
| FAQ | `FAQ_FRAMEWORK_REPORT.md` |
| Newsletter | `NEWSLETTER_FRAMEWORK_REPORT.md` |
| CTA | `CTA_FRAMEWORK_REPORT.md` |
| Header | `HEADER_FRAMEWORK_REPORT.md` |
| Footer | `FOOTER_FRAMEWORK_REPORT.md` |

---

*End of Phase 3 Architecture Audit. No code changes were made during this review.*
