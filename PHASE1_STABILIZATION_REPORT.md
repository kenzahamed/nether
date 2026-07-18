# Nether Framework — Phase 1 Stabilization Report

**Milestone:** Framework Stabilization  
**Phase:** 1 — Shared Wiring  
**Date:** 2026-07-18  
**Status:** Complete  
**Contracts:** `FRAMEWORK_STABILIZATION_PHASE0.md`  
**Plan:** `FRAMEWORK_STABILIZATION_PLAN.md` § Phase 1

---

## 1. Summary

Phase 1 standardizes Critical shared wiring for heading, position, alignment, image ratio, and Theme Editor reload — without renaming public interfaces, without new ratio abstractions, and without Phase 2–5 work.

**Modification honored:** Ratio mapping remains local and identical inside Product Media, Collection Media, and Media Render (no `nether-ratio-value` snippet).

---

## 2. Workstreams completed

### 1A Heading

| Change | Files |
|--------|-------|
| FAQ questions use section `heading_tag` | `nether-faq-item.liquid` |
| Pass-through from section / shell / list | `nether-faq.liquid`, `nether-faq-shell.liquid`, `nether-faq-list.liquid` |
| Visual class unchanged | `h4` retained on question |

### 1B Position

| Change | Files |
|--------|-------|
| Alias `center` → `middle-center` | `nether-product-card`, `nether-product-promotional-card`, `nether-collection-card`, `nether-media-card` |
| Schema value `center` kept | Collection page setting ID unchanged |

### 1C Alignment

| Change | Result |
|--------|--------|
| Showcase CSS audit | Product / Collection / Media position + align rule sets already behavior-identical |
| Code change | None required (parity verified; shared CSS extract deferred to Phase 4E) |

### 1D Image ratio

| Change | Files |
|--------|-------|
| Identical mapper (portrait 0.8 / landscape 1.4 / square 1 / adapt AR) | `nether-product-media`, `nether-collection-media`, `nether-media-render` |
| Dual-read `nether_image_ratio` → `image_ratio` | Same three snippets |
| Placeholders respect setting | `nether-product`, `nether-collection`, `nether-media` sections |

### 1E Theme Editor

| Change | Files |
|--------|-------|
| FAQ `handleSectionLoad` → sectionId primary + contains fallback | `component-faq.js` |
| Hero / Product | Already on sectionId (Product hybrid intact); verified against Phase 0 contract |

---

## 3. Compatibility Rules

- No schema ID renames
- No public BEM renames (alias only)
- FAQ `heading_tag` param additive with default `h3`
- Dawn `.ratio` / `card-product` path untouched
- Motion Engine, tokens, chrome, glass/gradient, content leaf `motion_attr` untouched

---

## 4. Phase Completion Gate

| Gate item | Status |
|-----------|--------|
| Regression — heading / position / alignment / ratio matrix (code-verified) | Pass |
| Collection page Dawn + premium ratio paths | Pass (dual-read + Dawn path unchanged) |
| FAQ outline honors section heading level | Pass |
| Theme Editor — FAQ/Hero/Product reload predicates | Pass |
| Dead position `center` fixed (alias) | Pass |
| Content aspect-ratio path left independent | Pass (documented Phase 0) |
| Mobile — no breakpoint contract changes in Phase 1 | Pass (N/A touch) |
| Git commit/tag `stabilization-phase-1` | Completed with this milestone |

### Manual QA remaining (storefront / Theme Editor)

Run in Shopify admin against a preview theme:

1. FAQ: change Primary heading level → questions tag updates; categories still use block level  
2. Collection page premium: change Image ratio → premium cards update  
3. Collection page: Content position `Center` → middle-center overlay layout  
4. Product / Collection / Media: portrait / square / adapt (+ landscape on Media)  
5. Empty showcase placeholders: ratio tracks setting  
6. Theme Editor: thrash FAQ / Hero / Product settings → no stuck pending state  

---

## 5. Out of scope (stop here)

Phase 2 Visual · Phase 3 Motion · Phase 4 Duplicates · Phase 5 Verification sign-off

---

**End of PHASE1_STABILIZATION_REPORT.md**
