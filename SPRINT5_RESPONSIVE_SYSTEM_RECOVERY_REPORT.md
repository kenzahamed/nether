# Nether Recovery Sprint 5 — Responsive System Recovery

**Date:** 2026-07-25  
**Status:** Complete — stop here (do not begin Sprint 6)  
**Scope:** Shared responsive architecture — breakpoints, spacing, media containment, grid shrink safety, viewport contract parity (CSS ↔ Motion ↔ JS)

---

## 1. Executive Summary

Sprint 5 recovered Nether’s **shared Responsive System** by introducing a single canonical viewport contract and applying it across CSS, Motion Engine, and critical shared JS/Liquid paths.

Primary wins:

- Added **`component-responsive.css`** as the framework Responsive System (tokens, containment, media, grid safety, visibility/overflow utilities)
- Unified breakpoint contract: **Mobile ≤749 · Tablet 750–989 · Desktop ≥990**
- Closed CSS↔Motion numeric debt (`FRAMEWORK_SETTINGS_MAP` §16.6 deferred item)
- Fixed off-by-one / always-true media-query bugs in shared Dawn paths (slider, peek grid, complementary products, menu drawer viewport height, header height listener)
- Wired Hero/Banner mobile insets to shared `--nether-inset-mobile` tokens

No section redesigns. No animation work. No typography redesign. Sprint 6 not started.

---

## 2. Root Cause Analysis

| Root cause | Effect |
|---|---|
| Responsive System was **distributed** (no shared CSS module) | Breakpoints, gutters, and containment reimplemented per framework |
| CSS used `750` / `990` while Motion used `749` / `989` (documented debt) | Boundary flicker risk between CSS layout and Motion device flags |
| Off-by-one queries (`min-width: 749` + `max-width: 990`) | 1px conflict zones where tablet and desktop rules both apply |
| Non-contract breakpoint (`1200px`) in complementary products | Laptop behavior diverged from Nether tablet/desktop contract |
| `matchMedia('(max-width: 990px)')` without `.matches` in `global.js` | Condition always truthy — viewport height set on every menu open |
| Fixed rem content widths on mobile without shared fluid override | Potential content overflow on narrow viewports |
| Grid children missing shared `min-width: 0` guarantee | Intrinsic media/text could force horizontal page scroll |

---

## 3. Responsive Systems Improved

| System area | Improvement |
|---|---|
| Breakpoint contract | Single documented Mobile / Tablet / Desktop map |
| Spacing rhythm | Shared gutter, inset, stack, section-pad-scale tokens |
| Grid adaptation | Shared `min-width: 0` on showcase/content/faq grids + children |
| Media adaptation | `max-width: 100%` on framework images/video/iframes (no `height: auto` — preserves absolute cover media) |
| Content widths | Mobile forces `--nether-hero-content-width: 100%` for narrow/medium/wide |
| Visibility | Nether aliases for mobile/tablet/desktop hide utilities |
| Overflow | Opt-in `.nether-overflow-x-auto` / `.nether-overflow-x-clip` (no layout-root overflow that would break sticky) |
| Motion parity | Extended `BREAKPOINTS` with `tabletMin`, `desktopMin`, named `queries`, `isDesktopOnly()`, `query()` |
| Button comfort | Mobile full-width button groups for Hero / Banner / CTA (containment only) |

---

## 4. Shared Responsive Components Modified

| Asset | Role |
|---|---|
| `assets/component-responsive.css` | **New** shared Responsive System |
| `layout/theme.liquid` | Global load after `base.css` |
| `layout/password.liquid` | Layout parity load |
| `assets/nether-motion.js` | Canonical breakpoint API |
| `assets/base.css` | Peek-grid breakpoint aligned to `750px` |
| `assets/component-slider.css` | Tablet range → `750–989` |
| `assets/component-complementary-products.css` | Tablet range → `750–989` (was `1200`) |
| `assets/global.js` | Fixed `.matches` + `989px` |
| `sections/header.liquid` | Header height MQ → `989px` |

Framework token hooks (shared inset only):

- `assets/component-hero.css`
- `assets/component-banner.css`

---

## 5. Files Modified

### Created
- `assets/component-responsive.css`
- `SPRINT5_RESPONSIVE_SYSTEM_RECOVERY_REPORT.md` (this file)
- `theme-check-sprint5-responsive.txt` (Theme Check artifact)

### Modified
- `layout/theme.liquid`
- `layout/password.liquid`
- `assets/nether-motion.js`
- `assets/base.css`
- `assets/component-slider.css`
- `assets/component-complementary-products.css`
- `assets/global.js`
- `sections/header.liquid`
- `assets/component-hero.css`
- `assets/component-banner.css`

**Not deleted. Not renamed.**

---

## 6. Frameworks Improved

All presentation / commerce frameworks benefit from the shared stylesheet and Motion contract:

Hero · Banner · Content · CTA · Newsletter · FAQ · Testimonials · Media · Collection · Product · Product Page · Collection Page · Cart · Recommendations · Bundles · Commerce · Wishlist · Compare · Header · Footer

Targeted inset token wiring: **Hero**, **Banner**.

---

## 7. Verification

| Check | Result |
|---|---|
| Desktop (≥990) contract documented + used | Pass |
| Laptop (990 → page-width) uses desktop rules + `.page-width` | Pass (by design — no separate laptop MQ) |
| Tablet (750–989) range aligned CSS/JS/Motion | Pass |
| Mobile (≤749) fluid widths + containment | Pass |
| No layout-root `overflow-x` that breaks sticky | Pass (intentionally avoided) |
| Absolute cover media not forced to `height: auto` | Pass |
| JS syntax (`nether-motion.js`, `global.js`) | Pass (`node --check`) |
| Theme Editor load of responsive CSS | Pass (global `stylesheet_tag` after `base.css`) |

---

## 8. Regression Results

| Area | Result |
|---|---|
| Shopify Theme Check | Ran full check → artifact `theme-check-sprint5-responsive.txt`. **No new offenses** attributed to Sprint 5 changes. `theme.liquid` / `password.liquid` only show pre-existing `UndefinedObject` (`scheme_classes`) warnings. Large pre-existing error volume remains (same class as Sprint 4 QA note). |
| Liquid errors from Sprint 5 | None introduced |
| JS console (syntax) | Pass on modified JS |
| Sprints 1–4 systems | Untouched functionally — foundation CSS load order preserved; Responsive inserted after `base`, before Typography |
| Motion Engine | Additive API only; `isDesktop()` semantics preserved (tablet+desktop for merchant mobile/desktop flags) |

---

## 9. Remaining Responsive Risks

| Risk | Notes |
|---|---|
| Per-framework `--nether-*-columns-*` vars | Still parallel (accepted debt) — shared breakpoint *consumption* is unified; column *token names* remain framework-scoped |
| Dawn `section-image-banner.css` `1400px` rule | Left intact (Dawn heritage; not Nether presentation) |
| `animated-continuous-section.liquid` `max-width: 1200px` | Content max-width, not a viewport breakpoint — left intact |
| Liquid section padding still duplicates `* 0.75` inline | Token `--nether-section-pad-scale-mobile` exists for future CSS consumers; Liquid extract deferred |
| Manual visual QA at exact 749 / 750 / 989 / 990 boundaries | Recommended before client production deploys |
| Horizontal carousels | Still use intentional `overflow-x: auto` inside sections — verify after deploy |

---

## 10. Sprint 5 Completion Status

| Gate | Status |
|---|---|
| Phase 1 Audit | Complete |
| Phase 2 Root causes | Complete |
| Phase 3 Shared architecture | Complete (`component-responsive.css` + Motion contract) |
| Phase 4 Framework-specific only where needed | Complete (Hero/Banner inset tokens; shared path off-by-ones) |
| Phase 5 Verification | Complete |
| Phase 6 Regression | Complete (Theme Check artifact + syntax + load-order regression) |
| Engineering report | Complete |
| Sprint 6 | **Not started** |

**Sprint 5: COMPLETE.**
