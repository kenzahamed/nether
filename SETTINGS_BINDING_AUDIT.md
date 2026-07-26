# Nether Framework — Settings Binding Architecture Audit

**Date:** 2026-07-27  
**Type:** Framework architecture investigation only — **no code changes, no fixes**  
**Trigger:** Manual QA after Recovery Sprint 5 — multiple merchant settings across sections appear partially functional or inert  
**Status:** Root causes identified. Awaiting approval before implementation.

---

## Verdict

This is a **shared settings-binding architecture problem**, not a set of isolated section bugs.

After Sprints 3–5, **Schema → Liquid reference binding is largely healthy** (~1,900+ setting IDs; ~1 confirmed true dead section ID). The failures merchants see now live in **Layers 2–4 of the pipeline**:

| Layer | Status after Sprint 5 |
|-------|------------------------|
| 1. Schema → Liquid ID read | Mostly recovered (Sprint 3) |
| 2. Liquid → DOM (classes / CSS vars / data attrs) | Often writes modifiers even when consumer DOM is missing |
| 3. DOM → CSS consumption | Gaps, kills, overrides, weak differentiation |
| 4. Layout / responsive / media adapters | Frequently override or gate merchant controls |

The QA examples map cleanly to shared patterns:

| QA symptom | Shared architecture cause |
|------------|---------------------------|
| Banner height little/no effect | Height is **min-height only** + Banner presets are tight (28/36/48rem); content can force taller; dual Hero/Banner class cascade is fragile |
| Content width works only for some options | Width modifiers require `.nether-hero__content` / content-shell; **row / centered layouts skip the shell**; mobile forces `100%` (`component-responsive.css`) |
| Content position inconsistent | Position CSS targets `.nether-hero__content-shell` or absolute card content; **layouts without shell or with `position: relative` cards ignore it** |
| Content alignment inconsistent | Alignment is the healthiest control (snippet classes) but can look “broken” when position/width fail beside it |
| Media type does not switch correctly | Hero/Banner media adapter is solid; **layout presets force `background_video`**; FAQ/Testimonials **omit `background_video` from schema** while `visible_if` still references it; External is a URL field under video types, not a fourth `media_type` |

---

## 1. Scope

### In scope (custom Nether Framework sections — 20)

| Section | Role |
|---------|------|
| `nether-hero` | Reference hero shell |
| `nether-banner` | Hero-derived banner |
| `nether-content` | Hero-derived content |
| `nether-cta` | Hero-derived CTA |
| `nether-newsletter` | Hero-derived newsletter |
| `nether-faq` | FAQ (+ optional hero media) |
| `nether-testimonials` | Testimonials (+ optional hero media) |
| `nether-media` | Media showcase |
| `nether-collection` | Collection showcase |
| `nether-product` | Product showcase |
| `nether-collection-page` | Collection template |
| `nether-collection-page-banner` | Collection banner |
| `nether-product-page` | Product template |
| `nether-commerce` | Commerce widgets |
| `nether-bundles` | Bundles |
| `nether-recommendations` | Recommendations |
| `nether-cart-page` | Cart |
| `nether-wishlist-page` | Wishlist |
| `nether-compare-page` | Compare |
| `nether-predictive-search` | Predictive search (no merchant schema) |

### Related but not Netherized (Dawn-native)

`slideshow`, `image-banner`, `video`, and other Dawn sections use Dawn binding patterns. They are **outside** the Nether class → CSS-var architecture. Do not treat Dawn bugs as Nether shell defects (or vice versa).

### Prior recovery context

| Sprint | What it fixed | What it did **not** fix |
|--------|---------------|-------------------------|
| Sprint 3 | Schema/stat dual-read, tablet columns, duration token rename (wishlist/compare), glass enable surfaces | Layout shell gating, height kills, media schema drift |
| Sprint 4 | Theme Editor `visible_if` / info / headers | Runtime storefront binding |
| Sprint 5 | Shared responsive breakpoints / mobile width fluidization | Parallel column tokens; height/position architecture |

Supporting maps: `FRAMEWORK_SETTINGS_MAP.md`, `PHASE3_ARCHITECTURE_AUDIT.md`, `SPRINT3_SETTINGS_BINDING_RECOVERY_REPORT.md`.

---

## 2. Canonical binding pipeline

Nether’s intended pipeline for layout controls:

```
Schema setting
  → Section Liquid assign + class list / {% style %} CSS vars / data-*
    → Shared snippet (shell / card / media adapter)
      → CSS custom properties on .nether-hero / framework root
        → Framework CSS rules
          → (rarely) JS — motion/parallax only
            → Storefront
```

### Reference implementation (healthy)

**Hero** is the compositional hub:

1. Schema: `nether_hero_height`, `nether_content_width`, `nether_content_position`, `nether_content_alignment`, `nether_media_type`
2. Liquid (`sections/nether-hero.liquid`): builds `nether-hero--height-*`, `--width-*`, `--position-*`
3. Snippets: `nether-hero-media` (media type), `nether-hero-content` (alignment classes)
4. CSS (`assets/component-hero.css`): maps modifiers → `--nether-hero-min-height`, `--nether-hero-content-width`, `--nether-hero-content-align` / `--nether-hero-justify`
5. JS: does **not** own layout settings (correct — single source of truth)

**Banner** correctly extends Hero (dual classes + `component-banner.css` remaps `--nether-banner-min-height` → `--nether-hero-min-height`).

### Failure mode (downstream frameworks)

Content / CTA / Newsletter / FAQ / Testimonials **reuse Hero classes and media adapter** but:

- Framework CSS often sets `--nether-hero-min-height: auto`
- Adapt `::before` spacers are emitted **without** `nether-hero--height-adapt`
- Position/width classes are applied **even when** `uses_hero_shell` is false
- Layout presets override media type / height

This produces the merchant experience: “setting exists, sometimes does something, often doesn’t.”

---

## 3. Pipeline audit — focus control families

Legend used throughout:

| Status | Meaning |
|--------|---------|
| ✅ Fully Working | Schema → Liquid → consumer → visible effect across intended layouts |
| ⚠ Partially Working | Wired for some layouts/breakpoints; fails for others |
| ❌ No Visible Effect | Value changes but storefront does not visibly change |
| ❌ Broken Binding | Write without matching consumer (or consumer without write) |
| ❌ Overridden Later | Binding exists but later CSS/layout/adapter wins |
| ❌ Dead Setting | Schema-present, never meaningfully consumed |
| ❌ Duplicate Setting | Same concern exposed via divergent IDs / parallel systems |

### 3.1 Height / banner height / section height

| Surface | Schema | Liquid | CSS | Status |
|---------|--------|--------|-----|--------|
| Hero | `nether_hero_height` | `--height-*` + adapt `::before` when adapt | `component-hero.css` presets | ✅ (⚠ if layout=`fullscreen` overrides) |
| Banner | `nether_banner_height` | Dual `nether-banner--height-*` + `nether-hero--height-*` | Banner remaps min-height | ⚠ Partially Working — wired, weak deltas (28/36/48), min-height floor |
| Content / CTA / Newsletter / FAQ / Testimonials | **No height setting** | Orphan adapt `::before` when media+image | Framework CSS forces `--nether-hero-min-height: auto` | ❌ Broken Binding (spacer) + ❌ No merchant height control |
| Media / Collection / Product showcases | Absent (use image ratio) | Ratio / card media | Showcase CSS | N/A (by design) |
| Dawn Image Banner / Slideshow | `image_height` / `slide_height` | Dawn classes | Dawn CSS | Outside Nether |

**Evidence — height killed on hero-shell consumers:**

- `assets/component-content.css` → `--nether-hero-min-height: var(--nether-content-min-height)` with content min-height `auto`
- `assets/component-cta.css` → `--nether-hero-min-height: auto` (+ hardcoded `32rem` on some bg layouts)
- `assets/component-testimonials.css`, `component-newsletter-showcase.css`, `component-faq.css` → same auto kill

**Evidence — orphan adapt spacer (no `--height-adapt` class):**

- `sections/nether-content.liquid`, `nether-cta.liquid`, `nether-faq.liquid`, `nether-newsletter.liquid`, `nether-testimonials.liquid` emit `.nether-hero__media::before { padding-bottom: …% }` whenever section media image exists
- Hero only emits that spacer when `height == 'adapt'` **and** applies absolute-fill rules under `.nether-hero--height-adapt`

**Architectural note:** Height everywhere is **`min-height`**, not fixed height. Tall block content makes height appear “dead” even when binding is correct.

### 3.2 Content width

| Surface | Schema | Liquid | Consumer | Status |
|---------|--------|--------|----------|--------|
| Hero | `nether_content_width` | `nether-hero--width-*` | `.nether-hero__content` max-width | ✅ desktop; ⚠ mobile forced `100%` (Sprint 5) |
| Banner | `nether_banner_content_width` | same Hero width classes | same | ✅ / ⚠ mobile |
| Content | `nether_content_width` | always appends width class | only when `uses_hero_shell` | ⚠ Partial — ❌ No Effect on row layouts |
| CTA | `nether_content_width` | always appends | shell layouts only; centered path differs | ⚠ Partial |
| Newsletter | `nether_content_width` | shell path | framework CSS | ⚠ Partial |
| Media / Collection / Product | `nether_full_width` (binary) | page-width omit | Dawn `.page-width` | ⚠ binary only |

**Evidence — mobile override (intentional Sprint 5, still a merchant “broken width” symptom):**

```195:205:assets/component-responsive.css
@media screen and (max-width: 749px) {
  .nether-hero--width-narrow,
  .nether-hero--width-medium,
  .nether-hero--width-wide {
    --nether-hero-content-width: 100%;
  }
  ...
}
```

### 3.3 Content position

| Surface | Schema | Liquid | Consumer | Status |
|---------|--------|--------|----------|--------|
| Hero | 9-point `nether_content_position` | `nether-hero--position-*` | content-shell flex align/justify | ✅ stacked; ⚠ split |
| Banner | `nether_banner_content_position` | same | same | ✅ / ⚠ split |
| Content / CTA | same pattern | classes always applied | shell gated by layout | ⚠ / ❌ No Effect without shell |
| Media / Collection / Product cards | `nether_content_position` | card `--position-*` | absolute content + 9-grid CSS | ✅ default; ❌ Overridden on `card_grid` / `minimal_layout` (`position: relative`) |
| Collection page | truncated options incl. `center` | premium → `nether-product-card` aliases `center`→`middle-center` | card CSS | ⚠ Partial — Dawn card path ignores; premium aliased |

### 3.4 Content alignment

| Surface | Status | Notes |
|---------|--------|-------|
| Hero / Banner / Content / CTA / Newsletter / FAQ / Testimonials / Media / Collection / Product | ✅ Fully Working (most consistent family) | Snippet-owned `*-align-*` / `nether-hero__blocks--align-*` |
| Can appear inconsistent in QA | ⚠ perceived | When position/width fail, alignment changes look weak or “wrong” |

### 3.5 Media type

| Surface | Schema options | Adapter | Status |
|---------|----------------|---------|--------|
| Hero | image / video / background_video | `nether-hero-media` (`hero`) | ✅ Fully Working |
| Banner | same | adapter `banner` | ✅ Fully Working |
| Content / CTA / Newsletter | prefixed `*_media_type` | adapters in `nether-hero-media` | ⚠ Partial — layout can force `background_video`; layout-gated media |
| FAQ / Testimonials section media | **image / video only** | adapters | ⚠ Partial — `visible_if` still checks `background_video` (schema drift) |
| FAQ block media | includes `background_video` | block render | ✅ for blocks; inconsistent with section |
| Media / Collection / Product cards | block `media_type` | `nether-media-render` / product/collection media | ✅ Fully Working |
| External video | **not a media_type value** | `*_video_url` under video / background_video | Design gap — merchants seeking a 4th type won’t find it |

**Evidence — layout overrides media type:**

```17:21:snippets/nether-hero-media.liquid
if section.settings.nether_layout == 'background_video'
  assign media_type = 'background_video'
endif
```

```65:68:snippets/nether-hero-media.liquid
if section.settings.nether_layout == 'background_video_cta'
  assign media_type = 'background_video'
endif
```

---

## 4. Broader binding health (beyond layout/media)

Static Schema→Liquid scans after Sprint 3 show **near-zero true dead IDs**. Remaining defects cluster as:

| Category | Approx. scale | Examples |
|----------|---------------|----------|
| True dead schema IDs | ~1 confirmed | Media `nether_default_cta_label` (card reads style default, not label default) |
| CSS vars written, unused | ~4–8 | Collection-page transition duration; Footer padding vars (padding works via other path) |
| BEM modifiers without CSS / weak CSS | several | Section `--glass-enabled` modifiers (glass often via panel utilities instead) |
| Placeholder / dishonest surfaces | ~5–8 | Newsletter `integration_provider`; product `best_sellers`/`trending` sources; countdown/lightbox stubs (TE-removed, snippets remain) |
| Schema ID prefix drift | ~12–15 concept families | Banner/Content prefixes vs generic `nether_*` |
| Dual-read leaf debt | ~4–6 block families | Trust badges, dividers, merchant_content (feature/stat fixed in Sprint 3) |

---

## 5. Root cause summary (shared failures)

See `SETTINGS_BINDING_INVENTORY.md` for full grouping. Highest-leverage causes:

1. **Hero shell reused without Hero height/adapt contract** (Content/CTA/Newsletter/FAQ/Testimonials)
2. **Modifier classes applied without consumer DOM** (position/width without content-shell)
3. **Layout CSS overrides position/media/height** (fullscreen layout, card_grid, background_video layouts)
4. **Schema ID / option drift** (prefixed IDs; FAQ/Testimonials media options vs `visible_if`)
5. **min-height semantics + weak preset differentiation** (Banner height QA)
6. **Responsive fluidization collapses width on mobile** (Sprint 5 — correct for overflow, looks like dead setting)
7. **External video not modeled as media_type** (merchant mental model mismatch)
8. **Parallel token names** (`--*-transition-duration` vs `--*-duration`; per-framework columns)

---

## 6. What is healthy (do not rebuild)

- Hero (+ Banner) as the **reference binding architecture**
- Shared media adapter `snippets/nether-hero-media.liquid`
- Alignment snippet pattern across frameworks
- Media/Collection/Product **card** media_type + default card position/alignment
- Motion Engine staying out of layout settings (JS not a second source of truth)
- Sprint 3 dual-read for feature_list / statistic
- Sprint 5 breakpoint contract (`component-responsive.css` + Motion `BREAKPOINTS`)

---

## 7. Explicit non-actions (this audit)

- **No code was modified**
- **No settings were removed or added**
- **No section bug-fixing started**
- Implementation waits for approval of `SETTINGS_BINDING_RECOVERY_PLAN.md`

---

## 8. Deliverables

| File | Purpose |
|------|---------|
| `SETTINGS_BINDING_AUDIT.md` | This document — pipeline + root causes |
| `SETTINGS_BINDING_INVENTORY.md` | Findings grouped by architecture issue |
| `SETTINGS_BINDING_RECOVERY_PLAN.md` | Prioritized fix strategy (approval required) |
