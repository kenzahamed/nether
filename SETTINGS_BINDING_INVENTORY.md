# Nether Framework — Settings Binding Inventory

**Date:** 2026-07-27  
**Companion to:** `SETTINGS_BINDING_AUDIT.md`  
**Mode:** Investigation only — findings grouped by **root cause**, not by section  
**Rule:** Estimates count merchant-visible defects attributable to each shared issue

---

## How to read this inventory

Each **Architecture Issue** lists:

- Failure mechanism in the Schema → Liquid → Snippet → CSS → JS → Storefront pipeline
- Affected surfaces
- Estimated defect count (how many merchant-visible “bugs” collapse into this one cause)
- Representative evidence
- Status classification used in the audit

**Total estimated merchant-visible binding defects attributable to shared architecture: ~35–55**  
(Many QA tickets will map to the same issue; fixing the issue removes a cluster.)

---

## Architecture Issue A — Hero shell reused without Hero height / adapt contract

**Pipeline break:** Liquid writes adapt `::before` spacer **and/or** frameworks inherit `.nether-hero` min-height, but framework CSS sets `--nether-hero-min-height: auto` and **never** applies `nether-hero--height-adapt` absolute-fill rules.

| Status patterns | ❌ Broken Binding · ❌ No Visible Effect · ❌ Overridden Later |
|-----------------|--------------------------------------------------------------|

**Affects:**

- Content
- CTA
- Newsletter
- FAQ
- Testimonials

**Does not affect (reference):** Hero, Banner (own height settings + adapt class)

**Evidence:**

- Height kill: `assets/component-content.css`, `component-cta.css`, `component-newsletter-showcase.css`, `component-faq.css`, `component-testimonials.css`
- Orphan `::before`: `sections/nether-content.liquid`, `nether-cta.liquid`, `nether-faq.liquid`, `nether-newsletter.liquid`, `nether-testimonials.liquid`
- Correct adapt contract: `assets/component-hero.css` (`.nether-hero--height-adapt …`)

**Estimated bugs:** **10** (5 orphan adapt + 5 “height doesn’t exist / doesn’t work” merchant expectations on hero-shell sections)

**QA mapping:** “Banner height” complaints on non-Banner hero-shell sections; odd media sizing; height looks dead.

---

## Architecture Issue B — Modifier classes without consumer DOM (content-shell gating)

**Pipeline break:** Section Liquid **always** appends `nether-hero--width-*` and `nether-hero--position-*`, but position/width CSS only affects `.nether-hero__content-shell` / `.nether-hero__content`. Layouts with `uses_hero_shell = false` (row layouts, centered CTA body path) never render that consumer.

| Status patterns | ❌ No Visible Effect · ⚠ Partially Working |
|-----------------|--------------------------------------------|

**Affects:**

- Content (`uses_row_layout` → grid path, no shell)
- CTA (`centered_cta` and other non-shell layouts)
- Any future hero-shell section that copies the “always append classes” preamble

**Evidence:**

- Classes always applied: `sections/nether-content.liquid` (~63–64), `sections/nether-cta.liquid` (~88–89)
- Shell conditional: Content `uses_hero_shell` / CTA `uses_hero_shell` render branches
- Position CSS targets shell: `assets/component-hero.css` (`.nether-hero__content-shell` + `--position-*` vars)

**Estimated bugs:** **≥4 layout modes** (content width + position dead on those modes)

**QA mapping:** “Content width works only for some options”; “Content position inconsistent.”

---

## Architecture Issue C — Layout CSS overrides merchant position on showcase cards

**Pipeline break:** Card snippets write `--position-*` assuming absolute overlay content. Showcase layouts `card_grid` / `minimal_layout` set `.nether-product-card__content { position: relative }`, neutralizing the 9-point grid.

| Status patterns | ❌ Overridden Later · ⚠ Partially Working |
|-----------------|------------------------------------------|

**Affects:**

- Product showcase
- Collection showcase (parallel CSS pattern)
- Likely Media if equivalent layout modifiers exist

**Evidence:**

- Absolute default + position rules: `assets/component-product-showcase.css`
- Relative override: `.nether-product--layout-card_grid` / `--layout-minimal_layout` content rules

**Estimated bugs:** **2–4** (position setting “works” only on overlay-style layouts)

**QA mapping:** Content position inconsistent across layout presets.

---

## Architecture Issue D — Layout / preset overrides height and media_type

**Pipeline break:** A second control (layout select) writes a stronger CSS or Liquid assignment after the merchant’s height/media setting.

| Status patterns | ❌ Overridden Later · ⚠ Partially Working |
|-----------------|------------------------------------------|

**Sub-cases:**

| Override | Where | Effect |
|----------|-------|--------|
| `.nether-hero--layout-fullscreen` → `--nether-hero-min-height: 100svh` | `component-hero.css` | Height select ignored when layout is fullscreen |
| Newsletter layout `background_video` forces media type | `nether-hero-media.liquid` | Media type select overridden |
| CTA layout `background_video_cta` forces media type | `nether-hero-media.liquid` | Media type select overridden |
| CTA bg layouts hardcode `32rem` min-height | `component-cta.css` | Any future height binding would fight this |

**Affects:** Hero (fullscreen), Newsletter, CTA

**Estimated bugs:** **3–4**

**QA mapping:** Media type “doesn’t switch”; height ignored under certain layouts.

---

## Architecture Issue E — Media type schema / visible_if drift

**Pipeline break:** Sprint 4 added `visible_if` for `background_video`, but FAQ/Testimonials **section** schemas only expose `image` / `video`. Merchants cannot select background video; video field visibility references a dead option. FAQ **blocks** do include `background_video` — inconsistent.

| Status patterns | ❌ Dead Setting (visible_if branch) · ⚠ Partially Working · ❌ Duplicate Setting (section vs block option sets) |
|-----------------|-------------------------------------------------------------------------------------------------------------|

**Affects:**

- FAQ (section media)
- Testimonials (section media)

**Evidence:**

- Options image/video only: `sections/nether-testimonials.liquid`, `sections/nether-faq.liquid`
- `visible_if` still includes `background_video`
- FAQ block schema includes `background_video`

**Estimated bugs:** **2 sections** (~10 misleading `visible_if` clauses) + merchant confusion that media types “don’t match” across frameworks

**QA mapping:** Media type does not correctly switch among Image / Shopify video / Background video / External.

---

## Architecture Issue F — External video is not a media_type value

**Pipeline break:** Merchant mental model expects four media types. Runtime model is three (`image` | `video` | `background_video`) with External as `*_video_url` inside video modes.

| Status patterns | Design gap (not a broken Liquid read) · ⚠ Partially Working from merchant POV |
|-----------------|--------------------------------------------------------------------------------|

**Affects:** Hero, Banner, Content, CTA, Newsletter, FAQ, Testimonials, Media cards (shared pattern)

**Evidence:** `snippets/nether-hero-media.liquid` / `nether-media-render.liquid` — URL handled under video / background_video cases

**Estimated bugs:** **0 true dead bindings**; **1 systemic UX defect** affecting all media frameworks

**QA mapping:** “External Video” appears missing or non-functional as a type.

---

## Architecture Issue G — Content width collapsed on mobile by Responsive System

**Pipeline break:** Sprint 5 correctly fluidizes hero content widths on `max-width: 749px` to prevent overflow. Merchant setting still saves; desktop works; mobile shows no difference between narrow/medium/wide.

| Status patterns | ⚠ Partially Working (desktop ✅ · mobile ❌ No Visible Effect by design) |
|-----------------|------------------------------------------------------------------------|

**Affects:** All consumers of `nether-hero--width-*` (Hero, Banner, Content, CTA, Newsletter when shell present)

**Evidence:** `assets/component-responsive.css` (fluid content widths block)

**Estimated bugs:** **1 shared behavior** × **~5 frameworks** = **~5** “width broken on mobile” reports

**QA mapping:** Content width works only for some options / breakpoints.

---

## Architecture Issue H — Height is min-height with weak preset differentiation

**Pipeline break:** Binding may be correct, but visual delta is small and content can exceed the floor.

| Status patterns | ⚠ Partially Working |
|-----------------|---------------------|

**Affects:**

- Banner especially (28 / 36 / 48rem — 8–12rem steps)
- Hero less so (42 / 60 / 72 / 100svh — clearer)
- Any section where blocks add vertical mass

**Evidence:** `assets/component-banner.css` height presets; `min-height: var(--nether-hero-min-height)` in `component-hero.css`

**Estimated bugs:** **1–2** high-visibility “Banner height does nothing” tickets even when wired

**QA mapping:** Banner height produces little or no visible effect.

---

## Architecture Issue I — Schema ID prefix drift (same concept, different IDs)

**Pipeline break:** Shared snippets/adapters must special-case Banner/Content/FAQ/… namespaces. Fixes applied to `nether_*` miss `nether_banner_*` / `nether_content_*` / `nether_*_media_type`.

| Status patterns | ❌ Duplicate Setting (parallel IDs) · maintenance hazard |
|-----------------|--------------------------------------------------------|

**Concept families (representative):**

| Concern | Generic | Banner | Content | Others |
|---------|---------|--------|---------|--------|
| Position | `nether_content_position` | `nether_banner_content_position` | `nether_content_position` | — |
| Alignment | `nether_content_alignment` | `nether_banner_content_alignment` | same | — |
| Media type | `nether_media_type` | `nether_banner_media_type` | `nether_content_media_type` | `nether_{faq,cta,newsletter,testimonials}_media_type` |
| Glass / gradient / overlay / blur / animation | `nether_*` | `nether_banner_*` | `nether_content_*` | prefixed per framework |
| Glass (Commerce) | — | — | — | `enable_glass` (unprefixed) |

**Affects:** All presentation frameworks + Header/Footer nesting

**Estimated bugs:** Not counted as storefront defects directly; **amplifies every other issue** (same fix must be re-applied N times). Treat as **multiplier**, not additive count.

**Shared locus today:** `snippets/nether-hero-media.liquid` adapter branches (already the fragile central map).

---

## Architecture Issue J — Dual-read / parallel leaf contracts (block field shapes)

**Pipeline break:** Same block type uses different setting IDs across sections. Theme Editor saves values the shared snippet does not read.

| Status patterns | ❌ Broken Binding · ❌ Dead Setting (from merchant POV) |
|-----------------|--------------------------------------------------------|

**Fixed in Sprint 3:** feature_list, statistic  

**Still open:**

- Trust badges (Hero/Footer `badge_N_*` vs Testimonials `label` / `badge_type`)
- Dividers (`nether_divider_style` vs `nether_banner_divider_style` vs `nether_content_divider_style` vs block `divider_style`)
- Merchant content blocks (accepted drift)

**Affects:** Hero, Banner, Content, CTA, Newsletter, Testimonials, Footer, Collection page (divider toggles)

**Estimated bugs:** **~6–12** remaining leaf mismatches (depends on which blocks merchants use)

---

## Architecture Issue K — CSS custom properties written but unused

**Pipeline break:** `{% style %}` or inline style sets `--nether-*` tokens that no CSS `var()` consumes (or consumes under a different name).

| Status patterns | ❌ Broken Binding · ❌ Dead Setting (token) |
|-----------------|--------------------------------------------|

**Examples:**

| Token / setting | Surface | Notes |
|-----------------|---------|-------|
| `--nether-collection-page-transition-duration` | Collection page | Animation speed inert |
| `--nether-footer-padding-*` | Footer | Padding works via `.section-*-padding`; vars unused |
| Duration naming split | Wishlist/Compare use `--*-duration` (Sprint 3); many others `--*-transition-duration` | Copy-paste hazard |
| Newsletter gap | CSS expects `--nether-newsletter-gap`; Liquid may not write merchant gap | Gap not merchant-bound |

**Estimated bugs:** **4–8**

---

## Architecture Issue L — True dead or dishonest merchant surfaces

**Pipeline break:** Schema (or data attribute) exists; no meaningful runtime consumer — or consumer ignores distinct modes.

| Status patterns | ❌ Dead Setting · ⚠ Partially Working (misleading) |
|-----------------|----------------------------------------------------|

| Setting / surface | Affects | Notes |
|-------------------|---------|-------|
| `nether_default_cta_label` | Media | Card uses `cta_label` + `nether_default_cta_style` only |
| `integration_provider` | Newsletter | `data-integration-provider` with no JS consumer |
| `nether_product_source` ∈ `best_sellers` / `trending` | Product | Same collection loop; only some sources get distinct sort |
| Countdown / lightbox stubs | Banner/CTA/Newsletter/Media | TE exposure removed in stabilization; snippets remain |
| Section `--glass-enabled` BEM without CSS | Multiple | Glass often via panel utilities — checkbox can look inert at section level |

**Estimated bugs:** **5–8**

---

## Architecture Issue M — Collection page / premium vs Dawn path gating

**Pipeline break:** Setting exists on section schema; only premium card path consumes Nether position/alignment/ratio contracts. Dawn `card-product` path ignores Nether layout settings.

| Status patterns | ⚠ Partially Working |
|-----------------|---------------------|

**Affects:** Collection page (`nether_card_mode`), related dual-render showcases

**Notes:** `center` → `middle-center` alias in `nether-product-card.liquid` is present (Phase 1 stabilization). Remaining issue is **path gating**, not missing CSS for `--position-center`.

**Estimated bugs:** **1–3**

---

## Architecture Issue N — Alignment perceived failures (usually secondary)

**Pipeline break:** Alignment bindings are generally healthy. Failures reported in QA often co-occur with Issues B/C (position/width dead), making alignment appear inconsistent.

| Status patterns | ✅ Fully Working (primary) · ⚠ perceived when B/C present |
|-----------------|----------------------------------------------------------|

**Affects:** All frameworks with `nether_content_alignment` / banner prefixed variant

**Estimated bugs:** **0 primary**; secondary noise on top of B/C

---

## Roll-up by affected framework

| Framework | Primary architecture issues |
|-----------|----------------------------|
| Hero | D (fullscreen), G (mobile width), F (external UX), H (min-height semantics) |
| Banner | H (weak height deltas), G, F, I (prefix IDs) |
| Content | A, B, G, I, J |
| CTA | A, B, D, G, I |
| Newsletter | A, D, G, I, L (integration) |
| FAQ | A, E, I, J |
| Testimonials | A, E, I, J |
| Media | F, L (`nether_default_cta_label`), C (if layout overrides) |
| Collection / Product | C, I, L (product sources), M (if dual path) |
| Collection page | M, K (duration), J (dividers) |
| Commerce / Wishlist / Compare / Bundles / Recs | K/L residuals; Sprint 3 recovered many |
| Predictive search | No schema — N/A |

---

## Status tally (layout/media focus controls)

| Control family | ✅ | ⚠ | ❌ cluster |
|----------------|----|----|-----------|
| Height | Hero ✅ | Banner ⚠ | A on 5 frameworks |
| Content width | Hero/Banner desktop ✅ | shell-gated + mobile | B, G |
| Content position | Hero/Banner stacked ✅ | split / cards | B, C, M |
| Content alignment | Most ✅ | perceived | N |
| Media type | Hero/Banner/Media cards ✅ | layout force / FAQ-Testimonials | D, E, F |

---

## Inventory completeness notes

- Inventory prioritizes **shared causes** that explain multi-section QA.
- Per-setting exhaustive matrices for all ~1,900 IDs are not duplicated here; Schema→Liquid reference health is already high post–Sprint 3.
- Dawn-native sections are excluded except where merchants may confuse them with Nether.
- Localization/`t:` key issues are a **separate** track (`LOCALIZATION_REGRESSION_INVESTIGATION.md`) and are not counted as settings-binding defects.
