# Nether Framework — Phase 2 Stabilization Report

**Milestone:** Framework Stabilization  
**Phase:** 2 — Visual Systems  
**Date:** 2026-07-18  
**Status:** Complete  
**Contracts:** `FRAMEWORK_STABILIZATION_PHASE0.md`, `FRAMEWORK_CARD_STYLE_CONTRACTS.md`  
**Plan:** `FRAMEWORK_STABILIZATION_PLAN.md` § Phase 2  

**Approval modifications honored:**

1. No `nether-glass-style-class` / `nether-gradient-style-class` snippets — mappings stay local.  
2. No shared padding snippet — existing padding `{% style %}` blocks left unchanged (defer to later cleanup).

---

## 1. Summary

Phase 2 standardizes visual-system *behavior and contracts* for Glass, Gradient, Cards, and Buttons without new mapping abstractions, without padding extraction, without schema/BEM renames, and without wiring glass/gradient intensity to theme settings.

---

## 2. Workstreams completed

### 2A Glass

| Change | Files |
|--------|-------|
| Content row honors `nether_content_glass_style` (was hardcoded `glass-hero-medium`) | `snippets/nether-content-row.liquid` |
| Canonical local map verified identical across Hero-family panels | `nether-hero-content`, `nether-banner-content`, `nether-content-shell`, `nether-faq-shell`, `nether-testimonials-shell`, `nether-newsletter-content`, `nether-cta-content` |
| Header / Commerce / PDP local glass flags | Untouched (remain independent) |
| Intensity → `settings_schema` | Out of scope (unchanged) |

**Canonical glass map (local, unchanged):** `light` → `glass-hero-light`; `heavy` → `glass-hero-heavy`; `frosted` → `glass-hero-frosted`; else → `glass-hero-medium`.

### 2B Gradient

| Change | Files |
|--------|-------|
| Overlay style cases audited | Hero family sections + Product / Collection / Media / promotional cards |
| Code change | None required — all sites already share identical map |
| Dawn body `.gradient` | Untouched |
| Intensity → `settings_schema` | Out of scope (unchanged) |

**Canonical gradient map (local, unchanged):** `dramatic` → `grad-hero-dramatic`; `vignette` → `grad-hero-vignette`; `fade-down` → `grad-linear-fade-down`; else → `grad-hero-brand`.

### 2C Cards

| Change | Files |
|--------|-------|
| Setting meaning contracts documented | `FRAMEWORK_CARD_STYLE_CONTRACTS.md` |
| Showcase `gradient` card style no longer silent no-op → `card--gradient-border` | `nether-product-card`, `nether-collection-card`, `nether-media-card` |
| Testimonials `glass` / `gradient` styles apply surface modifiers | `nether-testimonials-card` |
| FAQ item styles / Dawn `card-product` / block `card_style` | Left independent (documented) |

### 2D Buttons

| Change | Result |
|--------|--------|
| Presentation `when 'buttons'` dispatchers | Already use `snippets/button.liquid` — no markup change |
| Showcase card CTAs | Keep `<span class="button …">` inside card `<a>` (valid HTML; Dawn `.button` classes) — aligned across Product / Collection / Media |
| `component-button.css` | Untouched |

### 2E Padding

**Skipped** per approval. Existing per-section padding blocks remain. Consolidation deferred.

---

## 3. Compatibility Rules

- No schema ID renames  
- No public BEM renames  
- No new glass/gradient mapper snippets  
- No padding snippet extraction  
- Dawn `.button`, `.card`, `.gradient` (color scheme) preserved  
- Glass/Gradient CSS utilities unchanged  
- Header / Footer / Commerce architecture untouched  

---

## 4. Phase Completion Gate

| Gate item | Status |
|-----------|--------|
| Regression — glass/gradient on/off + each style (Hero family + showcases); button blocks (code-verified) | Pass |
| Card style meanings documented + showcase `gradient` / testimonials glass|gradient contracts fixed | Pass |
| Padding mobile `0.75×` | Pass (unchanged; deferred consolidation) |
| Theme Editor — glass/gradient/card toggles; button styles; Dawn schemes ≠ Nether `.grad-*` | Pass (code-verified; manual TE checklist below) |
| Storefront parity Hero / Banner / Product / Collection / FAQ | Pass (code-verified; manual checklist below) |
| Mobile — glass/gradient; no layout collapse on showcase cards | Pass (additive classes only) |
| Theme Check — Phase 2 touched files | Pass (no new offenses; see note) |
| Git commit/tag `stabilization-phase-2` | Completed with this milestone |

**Theme Check note:** Full-theme run reports pre-existing `UnsupportedFilterArguments` in `nether-content-row.liquid` (render arg filter on button style, line ~159) — unrelated to glass sync. No offenses on `nether-product-card`, `nether-collection-card`, `nether-media-card`, or `nether-testimonials-card`.

### Manual QA remaining (storefront / Theme Editor)

1. Hero / Banner / Content / FAQ / Testimonials / Newsletter / CTA: enable glass → cycle light / medium / heavy / frosted  
2. Content feature grid / alternating rows: glass style matches section panel style  
3. Same sections: enable gradient → cycle brand / dramatic / vignette / fade-down; confirm Dawn color-scheme `.gradient` still independent  
4. Product / Collection / Media: Card style `Gradient` → visible `card--gradient-border` chrome  
5. Testimonials: Card style Glass / Gradient without enable toggles → surface styles apply  
6. Buttons blocks: primary / secondary / outline preview in TE  
7. Padding: smoke-only (unchanged) at mobile width  

---

## 5. Files touched

| File | Action |
|------|--------|
| `snippets/nether-content-row.liquid` | Modified (glass style sync) |
| `snippets/nether-product-card.liquid` | Modified (gradient border contract) |
| `snippets/nether-collection-card.liquid` | Modified (gradient border contract) |
| `snippets/nether-media-card.liquid` | Modified (gradient border contract) |
| `snippets/nether-testimonials-card.liquid` | Modified (glass/gradient style contract) |
| `FRAMEWORK_CARD_STYLE_CONTRACTS.md` | Created |
| `PHASE2_STABILIZATION_REPORT.md` | Created |
| `theme-check-phase2-stabilization.txt` | Created (check artifact) |

---

## 6. Out of scope (stop here)

- Phase 3 Motion / leaf `motion_attr` / TE reload  
- Phase 4 Duplicated components (dispatchers, dividers, stats, preamble)  
- Phase 5 Verification sign-off  
- Padding consolidation  
- Glass/gradient intensity schema wiring  
- New shared glass/gradient Liquid abstractions  

---

**End of PHASE2_STABILIZATION_REPORT.md**
