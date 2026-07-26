# Localization Regression Investigation

**Date:** 2026-07-26  
**Type:** Investigation only — **no locale keys restored, no Liquid remaps changed, no fixes implemented**  
**Trigger:** Phase A validation reported **0** broken schema `t:` refs, while Theme Editor still shows raw keys such as:

- `t:sections.image-banner.settings.image.label`
- `t:sections.image-banner.settings.image_2.label`
- `t:sections.image-banner.settings.image_overlay_opacity.label`

**Status:** Root cause explained. Awaiting approval before any repair.

---

## Verdict

This is a **systemic Dawn-section localization problem**, not an Image Banner–only typo.

It has **two layered causes** that look like one Theme Editor symptom:

| Layer | What happened | Effect on Theme Editor |
|---|---|---|
| **A. Sprint 2 deletion** | Commit `c3aa347` removed entire Dawn section locale blocks (including `sections.image-banner`) | Every `t:sections.image-banner.*` key fails — including `image.label` / `image_2.label` |
| **B. Phase A remap + prune** | Commit `6b04297` remapped structural `.label` refs to `nether.common.ui.*` and **deleted** the old section-local label leaves | Any theme still running **pre-Phase-A Liquid** against **Phase A locales** fails on remapped paths such as `image_overlay_opacity.label` |

**Current local HEAD is internally consistent** for Image Banner: every `t:` in `sections/image-banner.liquid` resolves against `locales/en.default.schema.json` (**0 missing**).  
The Phase A validator measured that local pairing — and therefore reported zero broken refs — while **never live-auditing Image Banner in Theme Editor**.

---

## 1. Root cause

### 1.1 Historical deletion (Sprint 2)

Recovery Sprint 2 (`c3aa347`) rewrote schema locales and **dropped** Dawn-heritage section blocks. Parent of Phase A still shows:

| Revision | `sections` count | `image-banner` present? | Image Banner leaves |
|---|---:|---|---:|
| `0292423` (initial) | full Dawn set | Yes | **56** |
| `c3aa347` / `6b04297^` | **29** | **No** | **0** |
| `6b04297` / `HEAD` (Phase A) | **60** | Yes (pruned) | **18** |

QA later restored the missing Dawn blocks (Option A, documented in `QA_THEME_EDITOR_TRANSLATION_RESTORE_REPORT.md`), but that restore was **not** on the committed parent of Phase A. The pruned `image-banner` block landed in git as part of **`6b04297`**.

If Theme Editor is pointed at a theme that never received that restore/Phase A locale payload, merchants see raw keys for **all** Image Banner schema strings — including the two section-specific labels that still exist locally today.

### 1.2 Phase A intentional remap + deletion (not accidental omission)

Phase A did **not** accidentally drop `image.label` / `image_2.label`.

Those two keys are classified **Section-specific / not remappable** in `LOCALIZATION_INVENTORY.csv` and remain in locale:

```text
sections.image-banner.settings.image.label   = "Image 1"
sections.image-banner.settings.image_2.label = "Image 2"
```

What Phase A **did** delete for Image Banner are **38 Dawn structural `.label` leaves** after rewriting Liquid labels onto shared vocabulary. That set includes the third example:

```text
sections.image-banner.settings.image_overlay_opacity.label  → DELETED
```

Current Liquid no longer references that path. It uses:

```text
t:nether.common.ui.media.overlay_opacity  → "Overlay opacity"  (present)
```

So for the user’s three examples:

| Reported key | Fate | Present in current locale? | Referenced by current Liquid? |
|---|---|---|---|
| `…image.label` | Kept (section-specific) | **Yes** | **Yes** |
| `…image_2.label` | Kept (section-specific) | **Yes** | **Yes** |
| `…image_overlay_opacity.label` | **Deleted after remap** | **No** | **No** (remapped to `nether.common.ui.media.overlay_opacity`) |

**Classification of the overlay key:** deleted + remapped (intentional Phase A consolidation), **not** renamed in place, **not** merged into another `sections.image-banner.*` leaf, **not** “forgotten” from Liquid after the Phase A rewrite completed locally.

### 1.3 Why Theme Editor can still show all three

The triad matches **pre-Phase-A Dawn Liquid** (which still called `…image_overlay_opacity.label`) running against a locale that either:

1. **Still lacks the whole `image-banner` block** (Sprint 2 / unsynced restore) → `image.*` and overlay all fail, or  
2. **Has Phase A pruned locales** but **not** the remapped Liquid → overlay (and ~37 other remapped labels) fail; `image.label` / `image_2.label` should still resolve unless the block is missing.

Phase A validation itself pushed **`shopify theme push --only locales/*.schema.json`** and performed **static** resolution only — no browser Theme Editor pass for Image Banner. That deploy pattern can create exactly the Liquid/locale skew in (2).

---

## 2. Compare: Dawn vs Nether vs current schema

### 2.1 Dawn reference (`Shopify/dawn` main)

Dawn `locales/en.default.schema.json` → `sections.image-banner`: **56** leaves.  
Dawn Liquid labels live under `t:sections.image-banner.settings.*` / `blocks.*` (including `image_overlay_opacity.label`).

### 2.2 Nether current locale (`en.default.schema.json`)

Retained Image Banner leaves (**18**):

```text
sections.image-banner.name
sections.image-banner.presets.name
sections.image-banner.settings.image.label
sections.image-banner.settings.image_2.label
sections.image-banner.settings.content.content
sections.image-banner.settings.mobile.content
sections.image-banner.settings.stack_images_on_mobile.label
sections.image-banner.blocks.heading.name
sections.image-banner.blocks.heading.settings.heading.default
sections.image-banner.blocks.text.name
sections.image-banner.blocks.text.settings.text.default
sections.image-banner.blocks.buttons.name
sections.image-banner.blocks.buttons.settings.header_1.content
sections.image-banner.blocks.buttons.settings.header_2.content
sections.image-banner.blocks.buttons.settings.button_label_1.default
sections.image-banner.blocks.buttons.settings.button_label_1.info
sections.image-banner.blocks.buttons.settings.button_label_2.default
sections.image-banner.blocks.buttons.settings.button_label_2.info
```

### 2.3 Nether current Liquid (`sections/image-banner.liquid`)

Structural labels point at `t:nether.common.ui.*` (layout, sizing, typography, media, actions, content).  
Section-local keys remain only for name / headers / merchant defaults / infos / the three section-specific labels above.

**Paired local check:** Image Banner schema refs vs English schema locale → **0 missing**.

---

## 3. Exact missing keys for Image Banner

### 3.1 Against current Liquid + current locale (authoritative local pairing)

**None.**

### 3.2 Dawn / pre-Phase-A Liquid vs current Nether locale (desync / Dawn parity gap)

These **38** keys exist in Dawn (and in Nether `0292423`) but are **absent** from current Nether schema locales. They are the Phase A deletions:

```text
sections.image-banner.settings.image_overlay_opacity.label
sections.image-banner.settings.image_height.label
sections.image-banner.settings.image_height.options__1.label
sections.image-banner.settings.image_height.options__2.label
sections.image-banner.settings.image_height.options__3.label
sections.image-banner.settings.image_height.options__4.label
sections.image-banner.settings.desktop_content_position.label
sections.image-banner.settings.desktop_content_position.options__1.label
sections.image-banner.settings.desktop_content_position.options__2.label
sections.image-banner.settings.desktop_content_position.options__3.label
sections.image-banner.settings.desktop_content_position.options__4.label
sections.image-banner.settings.desktop_content_position.options__5.label
sections.image-banner.settings.desktop_content_position.options__6.label
sections.image-banner.settings.desktop_content_position.options__7.label
sections.image-banner.settings.desktop_content_position.options__8.label
sections.image-banner.settings.desktop_content_position.options__9.label
sections.image-banner.settings.desktop_content_alignment.label
sections.image-banner.settings.desktop_content_alignment.options__1.label
sections.image-banner.settings.desktop_content_alignment.options__2.label
sections.image-banner.settings.desktop_content_alignment.options__3.label
sections.image-banner.settings.mobile_content_alignment.label
sections.image-banner.settings.mobile_content_alignment.options__1.label
sections.image-banner.settings.mobile_content_alignment.options__2.label
sections.image-banner.settings.mobile_content_alignment.options__3.label
sections.image-banner.settings.show_text_box.label
sections.image-banner.settings.show_text_below.label
sections.image-banner.blocks.heading.settings.heading.label
sections.image-banner.blocks.text.settings.text.label
sections.image-banner.blocks.text.settings.text_style.label
sections.image-banner.blocks.text.settings.text_style.options__1.label
sections.image-banner.blocks.text.settings.text_style.options__2.label
sections.image-banner.blocks.text.settings.text_style.options__3.label
sections.image-banner.blocks.buttons.settings.button_label_1.label
sections.image-banner.blocks.buttons.settings.button_label_2.label
sections.image-banner.blocks.buttons.settings.button_link_1.label
sections.image-banner.blocks.buttons.settings.button_link_2.label
sections.image-banner.blocks.buttons.settings.button_style_secondary_1.label
sections.image-banner.blocks.buttons.settings.button_style_secondary_2.label
```

Replacement targets in current Liquid (examples):

| Old section-local key | Current Liquid target |
|---|---|
| `…image_overlay_opacity.label` | `nether.common.ui.media.overlay_opacity` |
| `…image_height.*` | `nether.common.ui.labels.height` / `sizing.*` / `labels.adapt_to_first_image` |
| `…desktop_content_position.*` | `nether.common.ui.labels.position` / `layout.top_*` / `middle_*` / `bottom_*` |
| `…*_alignment.*` | `nether.common.ui.layout.alignment` / `left` / `center` / `right` |
| `…show_text_box/below.label` | `nether.common.ui.labels.container` |
| heading / text / style / button labels | `nether.common.ui.typography.*` / `content.label` / `actions.link` / `labels.outline_style` |

### 3.3 Against Sprint 2 locale (no `image-banner` block)

**Entire namespace missing** — every current Image Banner `t:sections.image-banner.*` ref fails (18+), plus any leftover Dawn-style remapped paths if Liquid was never updated.

---

## 4. Scope: Image Banner only, or systemic?

**Systemic across Dawn-heritage (hyphenated) sections.**

Phase A deleted remapped section-local `.label` keys while rewriting Liquid. Measuring **pre-Phase-A Liquid** (`6b04297^`) against **current locale** yields large desync counts, for example:

| Section | Init leaves | Current leaves | Deleted labels | Misses if old Liquid + new locale |
|---|---:|---:|---:|---:|
| `image-banner` | 56 | 18 | 38 | 38 |
| `image-with-text` | 57 | 15 | 42 | 42 |
| `main-product` | 163 | 58 | 105 | 105 |
| `email-signup-banner` | 44 | 12 | 32 | 32 |
| `announcement-bar` | 57 | 29 | 28 | 28 |
| `rich-text` | 39 | 14 | 25 | 25 |
| `featured-collection` | 37 | 14 | 23 | 23 |
| `featured-product` | 40 | 17 | 23 | 23 |
| … | … | … | … | … |
| **Hyphenated Dawn sections total** | | | | **~397** old-Liquid misses |

With **current** Liquid + current locale, those same sections report **0** still-referenced deleted keys (local pairing is clean).

So:

- **Isolated accidental Image Banner bug?** No.  
- **Systemic Phase A architecture change that is safe only when Liquid and locales deploy together?** Yes.  
- **Still-latent Sprint 2 “whole block missing” risk on any theme that never got the restore?** Yes.

Also documented during Phase A: first apply regex omitted `-`, so hyphenated refs like `t:sections.announcement-bar.*` could have locale keys deleted before Liquid rewrite (`loc_phase_a_fixup_hyphens.py`). That intermediate failure mode is the same class of Liquid/locale skew.

---

## 5. Why automated Phase A validation failed to detect this

| Blind spot | Evidence |
|---|---|
| **Image Banner not in Theme Editor audit list** | `LOCALIZATION_PHASE_A_VALIDATION_REPORT.md` audited header/footer/Nether sections/`slideshow`/`featured-collection`/`main-product`, etc. — **not** `image-banner` |
| **“Theme Editor” check was static only** | Report states live admin UI was **not** driven; pass = local `t:` resolution + locale upload |
| **Validator resolves against local paired files** | `loc_phase_a_validate.py` scans workspace Liquid vs workspace `en.default.schema.json`. Local Image Banner pairing is clean → `PHASE_A_RELATED_MISSING = 0` |
| **Locale-only push can hide Liquid skew** | Validation used `theme push --only locales/*.schema.json`. Remapped section Liquid may lag on the live theme |
| **Theme Check localization checks are weak here** | `.theme-check.yml` sets `MatchingTranslations: enabled: false`. Full `shopify theme check` on HEAD reports **no** translation/schema-translation offenses; it does not prove Theme Editor parity |
| **Wrong confidence signal** | Upload under the 3,400 limit proves the locale file loads, not that every Dawn section was live-verified |

Phase A validation was correct about **local reference integrity after remap**. It was **not** a live Theme Editor proof for Image Banner or for deploy atomicity.

---

## 6. Recommended fix (for approval — do not apply yet)

Do **not** blindly restore all 38 Dawn Image Banner labels if current remapped Liquid is what should ship. That would undo Phase A headroom gains.

### Preferred sequence

1. **Confirm the live theme pairing** (same theme ID the merchant is editing):  
   - Does `sections/image-banner.liquid` use `t:nether.common.ui.media.overlay_opacity` or still `t:sections.image-banner.settings.image_overlay_opacity.label`?  
   - Does `en.default.schema.json` on that theme contain `sections.image-banner`?
2. **If the whole `image-banner` block is missing on the live theme:** sync/push current schema locales (restore already present in HEAD — no key invention required).
3. **If locales are Phase A but Liquid is pre-Phase-A:** atomically push **remapped section Liquid + schema locales** together (all Dawn sections touched by Phase A, not locales alone).
4. **Hardening (validation gate before Phase B):**  
   - Include every Dawn-heritage section in the static audit (especially hyphenated ones).  
   - Fail CI if any schema `t:` ref is missing.  
   - Re-enable or add `ValidSchemaTranslations`.  
   - Require a short live Theme Editor smoke list: Image Banner, Image with text, Rich text, Main product.  
   - Forbid locale-only deploys after label remaps.
5. **Only if product intent is “Dawn-identical section-local keys”:** restore the 38 leaves (and peers on other sections) — this conflicts with Phase A shared-vocabulary goals and should be an explicit decision.

### Not recommended without new evidence

- Restoring only `image.label` / `image_2.label` (they already exist locally).  
- Treating this as an Image Banner–only hotfix while leaving other Dawn sections desynced.

---

## 7. Isolated vs systemic

| Question | Answer |
|---|---|
| Isolated Image Banner regression? | **No** |
| Systemic Dawn-section issue? | **Yes** — Sprint 2 block deletion + Phase A remap/prune across many sections |
| Broken in current local HEAD pairing? | **No** for Image Banner refs (0 missing) |
| Broken in Theme Editor still plausible? | **Yes** — live theme desync and/or pre-Phase-A Liquid against pruned locales |
| Phase A validation false confidence? | **Yes** — static + non-representative audit + locale-only push |

---

## 8. Evidence log (read-only)

- Compared `0292423`, `c3aa347`, `6b04297^`, `6b04297` / `HEAD` locale trees for `sections.image-banner`.
- Diffed Image Banner leaves: Dawn/initial **56** → Phase A **18** (**38** structural labels removed).
- Resolved all `t:` refs in current `sections/image-banner.liquid` → **0 missing**.
- Simulated old Liquid + current locale → **38** missing (includes `image_overlay_opacity.label`).
- Scanned hyphenated Dawn sections for the same desync class → **~397** old-Liquid misses; **0** still-referenced deleted keys with current Liquid.
- Fetched Dawn `en.default.schema.json` / `image-banner.liquid` for parity.
- Reviewed `LOCALIZATION_PHASE_A_VALIDATION_REPORT.md`, QA restore/investigation docs, `loc_phase_a_validate.py`, `loc_phase_a_fixup_hyphens.py`, `.theme-check.yml`.
- Confirmed Theme Check run on HEAD shows no translation-key offenses (MatchingTranslations disabled).

**Files modified during this investigation:** none (report only).  
**Keys restored:** none.  
**Fixes implemented:** none.

---

## 9. Stop condition

Investigation complete. Awaiting explicit approval before any locale restore, Liquid sync, or validation-gate changes.
