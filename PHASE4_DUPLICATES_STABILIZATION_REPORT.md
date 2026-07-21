# Nether Framework — Phase 4 Stabilization Report

**Milestone:** Framework Stabilization  
**Phase:** 4 — Duplicated Components  
**Date:** 2026-07-21  
**Status:** Complete (4A–4C + conservative 4D)  
**Contracts:** `FRAMEWORK_STABILIZATION_PHASE0.md`  
**Plan:** `FRAMEWORK_STABILIZATION_PLAN.md` § Phase 4  

**Approval modifications honored:**

1. Implement 4A, 4B, 4C, and conservative 4D only.  
2. **4E deferred** — no showcase CSS extraction.  
3. 4D only when Liquid is byte-identical; otherwise leave duplication.  
4. Wrappers own setting IDs / schema / framework behavior; cores receive normalized params only.  
5. Cart + Commerce dividers remain independent.  
6. Testimonials stat remains independent.  
7. Public APIs, BEM classes, schema IDs, and filenames preserved (no deletes/renames).

> **Naming note:** This report is **Framework Stabilization Phase 4 (Duplicated Components)**. It is not the Commerce Framework Phase 4 docs (`PHASE4_STABILIZATION_REPORT.md` / commerce audit).

---

## 1. Summary

Phase 4 consolidates duplicated presentation leaves behind shared cores while keeping existing wrapper/dispatcher filenames and call-site APIs stable. A11y parity improves for multi-stat groups. Section preamble Liquid is intentionally left in place (see 4D).

---

## 2. Workstreams completed

### 4A Dividers

| Change | Files |
|--------|-------|
| New presentation divider core | `snippets/nether-divider.liquid` |
| Thin wrappers (setting IDs + optional data attrs) | banner, content, media, testimonials, faq, newsletter, cta, collection, product, collection-page, product-page |
| Left independent | `nether-cart-divider`, `nether-commerce-divider` |

**Core params (normalized):** `class_prefix`, `position`, `style`, optional `attributes`.

### 4B Stats

| Change | Files |
|--------|-------|
| New multi-stat core (up to 3 value/label pairs) | `snippets/nether-stat.liquid` |
| Thin wrappers | `nether-hero-stat`, `nether-product-stat`, `nether-collection-stat` |
| Left independent | `nether-testimonials-stat` (single counter + JS attrs) |

**Core params (normalized):** `block`, `class_prefix`, `value_type_class`, optional `aria_label`, optional `attributes`.

**A11y:** Product/Collection retain locale `aria-label`. Hero keeps prior markup (no label) via blank `aria_label`. All use `role="group"`.

### 4C Block dispatchers

| Change | Files |
|--------|-------|
| New shared header cases | `snippets/nether-shared-header-block.liquid` |
| Wired shared `@app` / eyebrow / heading / subheading / text / buttons | hero, content, faq, cta, newsletter, testimonials, product, collection, media, collection-page |
| Verify-only (already delegates to hero) | `nether-banner-block` |

**Core params (normalized):** `class_prefix`, `heading_element`, `subheading_element`, `motion_attr`, optional `role_attr` / `secondary_role_attr`, `text_role`, optional button extras.

Unique `when` branches stay local (FAQ items, countdown, media leaves, CTA promotions, etc.).

### 4D Section preamble (conservative — no extract)

| Candidate | Decision |
|-----------|----------|
| Animation speed → duration (`0.8` / `0.3` / `0.5`) | **Left duplicated** — mapping is logically identical, but Liquid `render` cannot assign into the parent without capture indirection; Header uses different duration values and must not share a presentation mapper |
| Class-list building | **Left** — framework-specific branching |
| Glass/gradient enable + layout overrides | **Left** — not byte-identical (CTA/Newsletter/Banner layout forces) |
| Padding `{% style %}` | **Out of scope** (deferred Phase 2E; not pulled into 4D) |

---

## 3. Compatibility Rules

- No schema ID renames  
- No public BEM renames  
- No file deletes or renames  
- Wrapper public render APIs unchanged  
- Cart / Commerce dividers untouched  
- Testimonials stat untouched  
- Motion Engine, design tokens, Dawn primitives, Header architecture untouched  
- 4E showcase CSS not modified  

---

## 4. Phase Completion Gate

| Gate item | Status |
|-----------|--------|
| **Regression** — shared header block palette; dividers; multi-stats; dispatchers preserve unique branches | Pass (code-verified) |
| **Theme Editor** — wrappers/dispatchers keep filenames + params; shared cores render via existing call sites | Pass (code-verified; manual TE checklist below) |
| **Storefront** — class prefixes and public CSS contracts unchanged | Pass |
| **Mobile** — no layout CSS changes (4E deferred) | Pass (Liquid-only) |
| **Theme Check** — Phase 4 files | Pass — **0 offenses** on new/touched Phase 4 snippets (see `theme-check-phase4-duplicates.txt`; full theme 60 pre-existing offenses) |
| **4E** | Deferred (approved) |
| **Git commit/tag** `stabilization-phase-4` | Pending explicit user request |

### Manual QA recommended (Theme Editor)

1. Hero / Banner / FAQ / CTA / Product / Collection — add eyebrow, heading, text, buttons; reorder; duplicate section.  
2. Toggle section top/bottom dividers where available.  
3. Edit Hero / Product / Collection stats (3-up); confirm Testimonials single counter unchanged.  
4. CTA dual roles + button classes; Content dual motion attrs; FAQ motion roles.  
5. Hard refresh storefront — class names and motion attrs match TE.

---

## 5. Files touched

### New

- `snippets/nether-divider.liquid`
- `snippets/nether-stat.liquid`
- `snippets/nether-shared-header-block.liquid`
- `PHASE4_DUPLICATES_STABILIZATION_REPORT.md` (this file)
- `theme-check-phase4-duplicates.txt`

### Modified (wrappers / dispatchers)

- 11 presentation `nether-*-divider.liquid`  
- `nether-hero-stat`, `nether-product-stat`, `nether-collection-stat`  
- `nether-hero-block`, `nether-content-block`, `nether-faq-block`, `nether-cta-block`, `nether-newsletter-block`, `nether-testimonials-block`, `nether-product-block`, `nether-collection-block`, `nether-media-block`, `nether-collection-page-block`

### Untouched (by design)

- Cart / Commerce dividers  
- Testimonials stat  
- Showcase CSS/JS (4E)  
- Section preamble assigns  
- Banner block (already reuses hero)  

---

## 6. Next

Phase 5 — Framework verification & sign-off. Do not start until this gate’s manual QA (and commit/tag, when requested) are satisfied.

---

**End of PHASE4_DUPLICATES_STABILIZATION_REPORT.md**
