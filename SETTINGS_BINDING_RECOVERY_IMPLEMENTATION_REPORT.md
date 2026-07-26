# Nether Settings Binding Recovery — Implementation Report

**Date:** 2026-07-27  
**Status:** Complete — shared architecture restored  
**Scope:** Hero-shell contract, media rendering contract, CSS/layout overrides, high-leverage shared leaf fixes  
**Constraint:** No UI redesign · no setting renames · no feature removal · backwards compatible

---

## 1. Executive summary

Restored merchant settings binding by fixing **shared contracts** first (not per-section patches):

1. **Hero-shell contract** — orphan adapt spacers removed; width/position classes only when a CSS consumer exists  
2. **Media contract** — layout no longer silently overrides `media_type`; FAQ/Testimonials schema parity for `background_video`  
3. **CSS overrides** — Banner height tokens win over dual Hero height classes; Banner height steps made distinct; Hero fullscreen height honesty via TE `visible_if`  
4. **Shared leaf** — Media `nether_default_cta_label` now falls back like Product/Collection cards  
5. **Token hygiene** — Collection page animation duration now consumed; mobile width policy documented in Responsive CSS

---

## 2. Shared framework changes

| System | Change |
|--------|--------|
| `snippets/nether-hero-media.liquid` | Removed Newsletter/CTA layout forces that overwrote merchant `media_type` |
| `snippets/nether-media-card.liquid` | Dual-read `nether_default_cta_label` when block CTA label blank |
| `assets/component-hero.css` | Documented fullscreen layout height behavior (TE hides height when layout=fullscreen) |
| `assets/component-banner.css` | Wider height presets (24/40/56rem); Banner min-height wins over Hero `--height-*` class writes |
| `assets/component-responsive.css` | Documented: width presets apply from tablet up; mobile fluidizes to 100% |
| `assets/component-collection-page.css` | Wire `--nether-collection-page-duration` / transition-duration into card/hero transitions |
| `locales/en.default.schema.json` | Clarified media type + video field info (external URL under Video / Background video) |

---

## 3. Sections affected

| Section | Changes |
|---------|---------|
| **Hero** | Fullscreen layout forces height class to `fullscreen`; height setting `visible_if` when layout ≠ fullscreen |
| **Banner** | Height CSS contract (shared CSS) — more visible presets + cascade fix |
| **Content** | Width/position classes only when `uses_hero_shell`; removed orphan adapt `::before` |
| **CTA** | Position only on shell layouts; width on shell **or** `centered_cta`; removed orphan adapt; deferred-media gated on media_type only |
| **Newsletter** | Position only on shell; width on shell **or** `centered_signup`; removed orphan adapt |
| **FAQ** | Removed orphan adapt; added section `background_video` media option; image fields visible for bg video (poster) |
| **Testimonials** | Same as FAQ for media schema + orphan adapt removal |
| **Media** | Default CTA label binding via shared card snippet |
| **Collection page** | Animation speed CSS consumer wired |

---

## 4. Validation checklist (merchant controls)

| Control | Expected result after recovery |
|---------|--------------------------------|
| **Banner Height** | small/medium/large/adapt visibly change min-height (24/40/56 + adapt) |
| **Content Width** | Works on Hero/Banner; Content/CTA/Newsletter when shell or centered body path; mobile forces 100% by design (tablet+) |
| **Content Position** | Works when content-shell present (Hero/Banner/shell layouts); not emitted on row/centered-only paths |
| **Content Alignment** | Unchanged — snippet-owned; remains the healthiest control |
| **Media Type** | Honors merchant select; layout no longer forces background video |
| **Desktop / Mobile Image** | Bound via `nether-hero-media` adapters (unchanged paths) |
| **Background Video** | Selectable on Hero/Banner/Content/CTA/Newsletter/FAQ/Testimonials; renders via shared adapter |
| **Shopify-hosted Video** | `video` type → deferred-media path |
| **External Video** | YouTube/Vimeo URL under Video or Background video (documented in schema info) |

---

## 5. Theme Check / Liquid / JS

| Check | Result |
|-------|--------|
| Schema JSON parse (all touched sections) | **Pass** (Node JSON.parse) |
| Liquid sanity (no layout media-type force; no orphan adapt spacers) | **Pass** |
| Theme Check (full theme) | Pre-existing offenses remain (e.g. `UnsupportedFilterArguments` elsewhere). Running `--path sections` alone reports false `MissingTemplate` for snippets outside that path. **No new schema JSON errors** in recovered sections |
| JavaScript | **No JS files modified** — layout/media remain CSS/Liquid-owned (no new console risk from this recovery) |

---

## 6. Remaining known issues (accepted / deferred)

| Item | Notes |
|------|-------|
| Showcase `card_grid` / `minimal_layout` position override | Position still neutralized by `position: relative` card content — hide via `visible_if` or alternate mapping in a later slice |
| Newsletter `integration_provider` | Still schema theater (no JS consumer) — deferred |
| Product `best_sellers` / `trending` sources | Still weakly differentiated — deferred |
| Trust badge / divider dual-read drift | Sprint 3 leftover — deferred |
| Non-EN schema locale info strings | English `en.default.schema.json` updated; other `*.schema.json` may still show prior interim English until mirrored |
| Content/CTA/FAQ/Newsletter/Testimonials height setting | Intentionally **not** added (Option A) — those frameworks keep auto min-height |
| Mobile content width | Intentionally fluid (Sprint 5) — not a regression |

---

## 7. Files modified

### Shared
- `snippets/nether-hero-media.liquid`
- `snippets/nether-media-card.liquid`
- `assets/component-hero.css`
- `assets/component-banner.css`
- `assets/component-responsive.css`
- `assets/component-collection-page.css`
- `locales/en.default.schema.json`

### Sections
- `sections/nether-hero.liquid`
- `sections/nether-content.liquid`
- `sections/nether-cta.liquid`
- `sections/nether-newsletter.liquid`
- `sections/nether-faq.liquid`
- `sections/nether-testimonials.liquid`

**Not deleted. Not renamed.**

---

## 8. Stop condition

Shared settings architecture recovery for the approved audit scope is **complete**.

Recommended next (only if approved): Phase 4 leftovers — showcase position `visible_if`, newsletter integration honesty, product source modes, dual-read trust/dividers, mirror schema info locales.
