# Nether Recovery Sprint 4 — QA Validation & Fix Report

**Date:** 2026-07-25  
**Status:** Validation complete — awaiting re-QA / approval  
**Scope:** Manual Theme Editor discrepancies vs Sprint 4 claims

---

## 1. Root Cause of Every Issue

### Issue 1 — Glass Style Dependency

| Question | Answer |
|---|---|
| Did `visible_if` exist? | **Yes** (Sprint 4 added it) |
| Does Shopify support it for `select`? | **Yes** — `select` is a basic input setting; conditional settings are supported |
| Why did QA still see Glass Style when Glass was OFF? | **Incorrect expression syntax**, not missing support |
| Root cause | Expressions used `{{ section.settings.*_enable_glass == true }}`. Select comparisons like `== 'image'` worked in QA (Issue 5), but checkbox `== true` did **not** hide dependents in the Theme Editor evaluator. Shopify community / working patterns use bare checkbox truthiness: `{{ section.settings.*_enable_glass }}`. |

### Issue 2 — Gradient Style Dependency

Same root cause as Issue 1: `visible_if` was present and platform-supported, but checkbox `== true` failed to drive hide/show. Fixed to bare truthiness: `{{ section.settings.*_enable_gradient }}`.

### Issue 3 — Image Overlay visual effect

| Question | Answer |
|---|---|
| Verdict | **A — Correctly implemented; can appear subtle** |
| Enable flag | Gates overlay markup: rendered only when `enable_image_overlay` **or** gradient is on (Hero / Banner / shared hero-shell frameworks) |
| Opacity binding | `--nether-hero-overlay-opacity` written from the range setting; CSS uses `rgba(var(--color-shadow), var(--nether-hero-overlay-opacity))` |
| Why little difference? | (1) Default ~35% darken depends on image + color-scheme shadow; (2) when **gradient is also enabled**, CSS sets solid overlay background to `transparent` so the image-overlay toggle adds little/no extra darkening; (3) Banner further scales overlay opacity (`* 0.5`) |
| Code change | **None** — no redesign; binding is correct |

### Issue 4 — Motion Controls

| Control | Binding | Frontend consumer | Verdict |
|---|---|---|---|
| Enable Parallax | `data-enable-parallax` + ScrollTrigger plugin attr | `component-hero.js` (`enableParallax` → `NetherMotion.scroll.parallax`) | **Live — not dead** |
| Media Hover Interaction | Banner: `data-banner-hover` ← `nether_banner_enable_hover` | `component-banner.js` (`enableHover`) + `component-banner.css` | **Live — not dead** |
| Hero | Has parallax; **no** separate “Media Hover Interaction” setting | Hover presets always soft via motion engine | Expected — hover toggle is Banner (and similar) merchant control, not Hero |

No animation redesign. No dead settings found for these two.

### Issue 5 — Media Type

QA confirmed Image / Video / Background Video work. Code review: media `visible_if` uses select string compares (`== 'image'`, etc.) — the pattern that already worked in the editor. **No regressions found; no changes.**

---

## 2. Shopify Support Summary

| Capability | Supported? | Notes |
|---|---|---|
| `visible_if` on `select` (glass/gradient style) | **Yes** | Basic input settings |
| `visible_if` on `checkbox`, `range`, `text`, headers | **Yes** | Basic + sidebar |
| `visible_if` on `image_picker`, `video`, `video_url` | **Yes** | Specialized list |
| `visible_if` on `product` / `collection` / resource pickers | **No** | Platform limitation (unchanged) |
| Checkbox condition form that works in editor | Bare truthiness `{{ section.settings.enable_x }}` | Prefer over `== true` for Theme Editor |

Sprint 4’s *intent* was valid. The **implementation syntax for checkbox parents was wrong**, which made the report’s “conditional controls work” claim inaccurate until this fix.

---

## 3. Exactly What Was Changed

### Fixed (this validation pass)

1. **Repaired and corrected all checkbox-parent `visible_if` expressions** across Nether section schemas + Nether Motion theme settings:
   - From: `{{ section.settings.nether_enable_glass == true }}`
   - To: `{{ section.settings.nether_enable_glass }}`
   - Same for gradient, overlay opacity parents, divider OR chains, scroll label, FAQ search, theme motion master switch
2. Restored any expressions briefly corrupted during an intermediate regex pass (now validated: no empty/`{{ ` leftovers).

### Not changed

- Overlay storefront Liquid / CSS (Issue 3 — correct binding)
- Parallax / hover JS or CSS architecture (Issue 4 — already wired)
- Media type schemas (Issue 5 — working)
- Setting IDs, Sprint 1–3 systems, layouts, design tokens

### Files touched (validation fix)

- `sections/nether-*.liquid` schemas that had checkbox-dependent `visible_if`
- `config/settings_schema.json` (Nether Motion dependents)

---

## 4. Theme Check Results

Full `shopify theme check` continues to report a large volume of **pre-existing** theme offenses (locale gaps, UnsupportedFilterArguments, etc.).

Validation-relevant:

- Patched schemas are **valid JSON**
- No remaining empty / truncated `visible_if` strings
- No evidence of InvalidSchema specifically introduced by corrected `visible_if` forms

(Re-run Theme Check in CI / local after push for a clean summary artifact if required.)

---

## 5. Regression Confirmation

| Area | Status |
|---|---|
| Sprint 1 contracts | Untouched |
| Sprint 2 locale architecture | Untouched (no locale edits this pass) |
| Sprint 3 bindings | Untouched |
| Setting IDs / defaults | Preserved |
| Media type conditionals | Preserved (select `==` form) |
| Storefront overlay / motion behavior | Unchanged by this pass |

---

## 6. Corrected Sprint 4 Claims

| Original Sprint 4 claim | Correction |
|---|---|
| “Introduced framework-wide `visible_if`” | Still true — attributes were added |
| Implied checkbox dependents hide reliably | **Was false in Theme Editor** until this QA fix (syntax) |
| Overlay / motion treated as merchant-control UX only | Overlay/motion storefront wiring was already correct; subtle overlay is not a dead toggle |

---

## 7. Merchant Re-QA Checklist

After pushing this theme revision to the preview theme:

1. **Hero / Banner · Glass** — OFF → Glass Style hidden; ON → style appears and changes panel.
2. **Hero / Banner · Gradient** — OFF → Gradient Style hidden; ON → style appears.
3. **Image Overlay** — Gradient OFF, Overlay ON/OFF → overlay node appears/disappears; raise opacity toward 100% on a bright image to confirm. With Gradient ON, expect little extra darkening from the image-overlay toggle (documented behavior).
4. **Banner · Media Hover** — ON/OFF with parallax OFF → media hover present/absent.
5. **Parallax** — ON → scroll media shift; OFF → no parallax tween.
6. **Media type** — reconfirm image / video / background video field switching.

---

## 8. Completion Status

**Sprint 4 QA validation & fix: COMPLETE.**

Stop here. Do **not** begin Sprint 5.
