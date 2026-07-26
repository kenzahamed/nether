# Nether Localization Architecture

**Status:** Approved for Phase A implementation (with tightened leaf-type gates)
**Author:** Nether Framework
**Scope:** Schema translations (`locales/*.schema.json`) — the merchant-facing strings that appear in the Theme Editor.
**Companion documents:** `LOCALIZATION_INVENTORY.md` (Phase 2) · `LOCALIZATION_MIGRATION_PLAN.md` (Phase 3)

---

## 1. Problem statement

Shopify enforces a hard platform limit of **3,400 translation values per schema locale file**. Nether currently ships **3,699 schema translation values** in `locales/en.default.schema.json` — **299 over the limit** — which blocks theme upload.

The missing-translation errors surfaced during Recovery Sprint QA were only a *symptom*. The measured root cause:

- **3,699** total values, but only **1,576** are distinct.
- **2,123** values (57%) are exact duplicates of a concept already defined elsewhere.
- Nether's own sections (`nether-hero`, `nether-content`, `nether-collection`, …) each redeclare generic vocabulary — `Heading`, `Layout`, `Left`, `Animation speed`, `Image ratio` — instead of referencing a shared source.

The architecture, not the translations, is what no longer scales. A framework that keeps adding sections will keep multiplying identical keys and will breach 3,400 again after every few features.

---

## 2. Reference architectures

### Dawn — hybrid shared + section-specific
Dawn keeps a global shared namespace **`sections.all.*`** for strings reused by many sections (e.g. `sections.all.heading`, `sections.all.image`, spacing/padding groups), while each section keeps a **section-local namespace** for wording unique to that section. Generic first, specific where it matters.

### Horizon — shared semantic vocabulary + reusable namespaces
Horizon formalizes the idea further: a **semantic vocabulary** of reusable concepts grouped into intent-based namespaces (typography, layout, media, motion…), referenced by `t:` from any block or section. Concepts are named by *meaning*, not by *where they happen to be used*.

### Shopify best practice (both themes)
1. **Reuse semantic keys** instead of duplicating identical concepts across sections.
2. **Keep context-specific wording section-specific.**
3. **Use literal strings only where Shopify itself does** — numeric values, units, placeholders.

Nether already has the seed of this: a `nether.common` namespace (635 keys). But it has become a **dumping ground** — it mixes genuinely shared vocabulary (`heading`, `left`, `fade`) with hundreds of section-specific keys (`bundle_strategy`, `header_media`, `feature_1_icon`). The redesign formalizes and cleans up what already exists rather than inventing a new mechanism.

---

## 3. Overall architecture

Nether adopts a **three-tier localization model**, combining Dawn's hybrid split with Horizon's semantic naming:

```
Tier 1  GLOBAL SETTINGS      settings_schema.*        (theme-level settings, unchanged)
Tier 2  SHARED VOCABULARY    nether.common.<domain>.* (reusable semantic concepts)  ← primary reuse layer
Tier 3  SECTION-SPECIFIC     sections.<section>.*      (wording unique to one section)
```

- **Tier 2 is the reuse engine.** Any concept used by two or more sections lives here exactly once and is referenced by `t:nether.common.…`.
- **Tier 3 shrinks to only what is genuinely unique** to a section: merchant-authored copy, contextual help text, section-specific option wording.
- **`sections.all.*`** (Dawn's inherited shared namespace) is retained as-is for Shopify base sections so we never fight the upstream theme; Nether's own additions consolidate into `nether.common.*`. The two coexist — we do not migrate Dawn's base strings.

> Design rule: **`nether.common` is curated, not accumulated.** A key earns a place in Tier 2 only when it is a reusable *concept*. Section-specific strings never live in `nether.common`.

---

## 4. Canonical namespace structure

```
nether.common
├── ui                          ← Phase A shared structural vocabulary (nested; avoids colliding with legacy flat keys)
│   ├── layout      left · right · center · content_position · *_layout · full_width · split · grid · columns …
│   ├── sizing      small · medium · large · extra_large · compact · spacious …
│   ├── typography  heading · subheading · subtitle · body · eyebrow · caption · text · heading_size …
│   ├── media       image · video · image_ratio · portrait · square · adapt_to_image · overlay_opacity …
│   ├── motion      motion · animation_style · animation_speed · fade · slide · scale · stagger · slow · fast …
│   ├── actions     button_label · button_link · button_style · link · cta_label · outline · solid · ghost …
│   ├── states      none · default · standard · minimal · editorial · primary · secondary · glass · gradient …
│   ├── commerce    collection · product · badge_style · badge_type · sale · new · rating · quick_add …
│   ├── content     label · name · description · content · value · icon · accessibility_label …
│   └── labels      reusable field labels without a domain home (fallback)
├── (legacy flat keys)          ← pre-existing nether.common.* strings (info_*, group words, etc.); retained
└── groups                      ← future home for settings-group headers (Motion · Layout · Buttons · …)
```

> **Namespace note:** Shared Phase A keys live under `nether.common.ui.<domain>.*` so they never overwrite legacy flat strings such as `nether.common.layout` (“Layout”) or `nether.common.content` (“Content”).

Each leaf is defined **once** in `en.default.schema.json` (and mirrored across the 20 locale schema files) and referenced everywhere via `t:`.

---

## 5. Shared semantic namespaces (Tier 2)

| Namespace | Purpose | Representative keys |
|---|---|---|
| `nether.common.ui.layout` | Position, direction, responsive layout, column counts | `left`, `right`, `center`, `content_position`, `desktop_layout`, `mobile_layout`, `full_width`, `split`, `grid` |
| `nether.common.ui.sizing` | Size scales | `small`, `medium`, `large`, `extra_large`, `compact`, `spacious` |
| `nether.common.ui.typography` | Type roles & scales | `heading`, `subheading`, `subtitle`, `body`, `eyebrow`, `caption`, `text`, `heading_size` |
| `nether.common.ui.media` | Image/video concepts | `image`, `video`, `image_ratio`, `portrait`, `square`, `adapt_to_image`, `overlay_opacity`, `loop_video` |
| `nether.common.ui.motion` | Nether Motion Engine vocabulary | `motion`, `animation_style`, `animation_speed`, `fade`, `slide`, `scale`, `stagger`, `slow`, `fast` |
| `nether.common.ui.actions` | Buttons, links, CTAs | `button_label`, `button_link`, `button_style`, `link`, `outline`, `solid`, `ghost` |
| `nether.common.ui.states` | Style/variant states shared by button/card/badge systems | `none`, `default`, `standard`, `minimal`, `editorial`, `glass`, `gradient` |
| `nether.common.ui.commerce` | Commerce concepts | `collection`, `product`, `badge_style`, `badge_type`, `sale`, `new`, `rating`, `quick_add` |
| `nether.common.ui.content` | Generic field labels | `label`, `name`, `description`, `content`, `value`, `icon`, `accessibility_label` |
| `nether.common.ui.labels` | Fallback for reusable labels without a domain home | — |

These namespaces map 1:1 onto the existing Nether foundation systems (Button, Card, Typography, Icon, Badge, Motion), so localization vocabulary now mirrors the design-system vocabulary.

---

## 6. Section-specific namespace rules (Tier 3)

`sections.<section>` retains **only** strings that are unique to that section:

- Merchant-authored default copy (e.g. a hero's default heading text).
- Help/`info` text that references the section's specific behavior.
- Option wording that is genuinely different in meaning from any shared concept.
- Any string where a shared label would be *misleading* in context.

Everything else is a `t:nether.common.*` reference.

---

## 7. Naming conventions

1. **Concept, not location.** Name by meaning: `nether.common.motion.animation_speed`, never `nether.common.hero_animation_speed`.
2. **Domain-first path:** `nether.common.ui.<domain>.<concept>`. Domain ∈ the Tier-2 list in §5.
3. **`snake_case`** leaf keys; lowercase; ASCII.
4. **Options** keep Shopify's `options__N.label` shape inside their setting; the *values* those options resolve to are the shared concepts (e.g. an `image_ratio` setting's options reference `nether.common.media.portrait` / `.square` / `.adapt_to_image`).
5. **Group headers** live under `nether.common.groups.*` and reuse the same casing Shopify shows in the editor.
6. **No numeric suffixes for uniqueness** — if two concepts collide, the name is wrong; pick a more precise concept name.
7. **Literals stay literal** — numbers, units (`px`, `%`), and pure placeholders are section-local and are *not* added to `nether.common`.

---

## 8. Rules for when a key SHOULD be shared

Promote a string to `nether.common.*` when **all** hold:

- It is used (or is clearly reusable) in **≥ 2 sections**.
- Its meaning is **context-independent** — it reads correctly in any section.
- It is a **generic UI/design concept**, not merchant copy.
- Sharing it will **not** change the merchant's understanding of any setting.
- It is **structural UI vocabulary** (see §8.1) — not merchant content.

### 8.1 Phase A automatic remapping gate (tightened)

Phase A may auto-remap a leaf to `nether.common.*` **only** when it is structural UI vocabulary:

| Eligible (auto-remap) | Examples |
|---|---|
| Setting **labels** | `"label": "t:…"` |
| Option **labels** | `options__N.label` |
| Generic control / layout / motion / typography labels | `Animation speed`, `Left`, `Image ratio`, `Heading` (as a field label) |

| **Excluded from automatic remapping** (stay local unless explicitly reviewed & approved) | Path / role signals |
|---|---|
| Merchant default content | leaf = `.default` |
| Help / contextual guidance | leaf = `.info` |
| Preset picker text | path contains `.presets.` |
| Placeholder text | leaf = `.placeholder` |
| Other merchant-facing content blocks | paragraph/text defaults, rich default copy |
| Tier 1 theme settings | `settings_schema.*` (unchanged) |
| Dawn shared namespace | `sections.all.*` (unchanged) |

> **Merchant content stays local by default.** Identical English on an excluded leaf does **not** justify a shared remap. Those cases remain **Merge Candidate** until architect review.

## 9. Rules for when a key MUST stay section-specific

Keep a string in `sections.<section>.*` when **any** hold:

- It is **merchant-authored default content** (`.default`).
- It is **help / info text** (`.info`) not yet reviewed for sharing.
- It is **preset** or **placeholder** text.
- Its wording is **contextual** (the same word means something different elsewhere).
- It is a **one-off** concept used by a single section.
- It is a **literal** (number/unit/placeholder) — matching Shopify's own practice.
- Sharing would **reduce clarity** for the merchant.

---

## 10. Future development rules

Every new Nether section/block must follow this checklist **before** adding schema translations:

1. **Search `nether.common` first.** If the concept exists, reference it with `t:`.
2. **If it's generic and reusable**, add it to the correct `nether.common.<domain>` namespace — not to the section.
3. **Only truly unique wording** goes under `sections.<section>`.
4. **Never duplicate** an existing English value across sections.
5. **Keep literals literal.**
6. **Run the localization budget check** (see §12) as part of feature QA; a PR that pushes the count toward the ceiling must justify or refactor.
7. **Mirror every new `nether.common` key across all 20 locale schema files** in the same commit.

This makes Tier 2 grow *slowly and deliberately* while Tier 3 grows only with genuinely new copy — so adding sections no longer risks the 3,400 ceiling.

---

## 11. Estimated translation reduction

> Regenerated under the tightened Phase A leaf gate (§8.1). Live numbers come from `py .nether-analysis/loc_generate.py`.

| Phase | Strategy | Intent |
|---|---|---|
| **A (approved)** | Collapse **structural Shared labels/options only** | Clear the 3,400 ceiling with safe UI vocabulary |
| B (future) | Reviewed Merge Candidates + approved `.info`/content shares | Further headroom after architect review |
| Floor | Full semantic dedupe | Theoretical minimum (~1,576) |

Phase A prioritizes **correctness over maximum collapse**. Exact post-gate counts are recorded in the inventory / migration plan after each regen.

---

## 12. Target translation count & headroom

**Target: clear the 3,400 limit with ≥ 20% headroom after Phase A (≥ ~680 free values).**

Ideal stretch goal remains ~1,700 if later phases land; tightened gates may land higher than the original ~1,673 estimate while still safely under the ceiling.

Budget check (§10.6): warn at 2,800 (82% of limit), fail CI at 3,200 (94%).

---

## 13. What this design explicitly does NOT do

- Does **not** delete or rename any section, snippet, JS, or CSS file.
- Does **not** change any English (or translated) wording — every migration is a value-equality remap, so no re-translation is required across the 20 locale schema files.
- Does **not** touch `settings_schema.*` (Tier 1) or Dawn's `sections.all.*`.
- Does **not** auto-remap `.default`, `.info`, presets, placeholders, or other merchant content.
- Does **not** alter runtime behavior, the Theme Editor experience, or merchant-facing labels.

---

## 14. Deliverables in this design package

| Document | Phase | Contents |
|---|---|---|
| `LOCALIZATION_ARCHITECTURE.md` | 1 | This design (incl. §8.1 tightened gates). |
| `LOCALIZATION_INVENTORY.md` + `.csv` | 2 | Every key classified; Phase A remappable subset flagged. |
| `LOCALIZATION_MIGRATION_PLAN.md` | 3 | Old Key → New Key for **Phase A remappable leaves only**. |
| `LOCALIZATION_SHARED_VOCAB.csv` | 3 | Canonical shared keys required by Phase A. |

> Phase A implementation proceeds under §8.1. Merchant-content exclusions are mandatory.
