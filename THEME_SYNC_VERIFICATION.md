# Theme Sync Verification

**Date:** 2026-07-26  
**Type:** Read-only verification — **no files modified, no keys restored, no uploads**  
**Shop:** `mpb0jd-ux.myshopify.com`  
**Method:** `shopify theme list` / `shopify theme info` + `shopify theme pull` of target files into a temp directory outside the repo, then SHA/JSON/Liquid comparison against local HEAD.

---

## Verdict

**The CLI current development theme (`#173889224740`) matches local HEAD** for:

- `sections/image-banner.liquid` — **byte-identical**
- all `locales/*.schema.json` — **JSON-identical** (byte size differs only by a Shopify pull banner comment)

Therefore Theme Editor missing translations are **not** explained by a stale or partial upload of these files on the development theme.

If the merchant is editing **live** (`#173520715812`) or **unpublished `nether-main`** (`#173813301284`), those themes **do not** match local HEAD — but even there, the three cited Image Banner keys are present and resolve against that theme’s own Liquid/locale pairing.

---

## 1. Currently running / current development theme

| Field | Value |
|---|---|
| Shop | `mpb0jd-ux.myshopify.com` |
| Theme ID | **`173889224740`** |
| Name | `Development (ceca91-Kenz)` |
| Role | `development` |
| CLI marker | **`[current]`** |
| Editor | https://mpb0jd-ux.myshopify.com/admin/themes/173889224740/editor |
| Preview | https://mpb0jd-ux.myshopify.com?preview_theme_id=173889224740 |

Other themes on the shop:

| ID | Name | Role | Matches local HEAD? |
|---|---|---|---|
| `173520715812` | `theme1` | **live** | **No** |
| `173813301284` | `nether-main` | unpublished | **No** |
| `173889224740` | `Development (ceca91-Kenz)` | development / current | **Yes** (sampled files) |

### `shopify theme dev` status

Local terminal history shows `theme dev` **is not currently running** (session returned to a PowerShell prompt after the Phase A commit). Last observed sync in that session was locale updates at **20:13**, then `git add` / `git commit` of Phase A.

Despite `theme dev` being stopped now, a fresh **pull from `#173889224740`** still matches local Image Banner Liquid and schema JSON payloads — so the development theme already contains the post–Phase A files.

---

## 2. Is the active preview using the latest local code?

| Check | Result |
|---|---|
| CLI current theme | Development `#173889224740` |
| Sampled development files vs local HEAD | **Match** (see §4) |
| Live theme vs local HEAD | **Mismatch** |
| Unpublished `nether-main` vs local HEAD | **Mismatch** |

**Implication:** Preview/editor URLs that omit `preview_theme_id=173889224740` (or open the live theme’s Customize link) are **not** the Phase A development snapshot. Use:

- Editor: `/admin/themes/173889224740/editor`
- Preview: `?preview_theme_id=173889224740`

---

## 3. Do schema locales on the running theme match local?

**Yes — for development theme `#173889224740`.**

Pulled all 20 `locales/*.schema.json` files. Raw bytes differ because Shopify’s pull payload prepends an auto-generated comment banner:

```text
/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 * ...
 * ------------------------------------------------------------
 */
```

That banner is **366 bytes** and accounts for the raw size delta (e.g. local EN `160994` vs pulled EN `161360`). After stripping the banner, **JSON content is identical** for every schema locale:

| File | Leaf count local | Leaf count remote | JSON equal? |
|---|---:|---:|---|
| `en.default.schema.json` | 2326 | 2326 | **Yes** |
| other 19 `*.schema.json` | 2323 each | 2323 each | **Yes** |

Key spot-checks on development remote EN:

| Key | Remote value |
|---|---|
| `sections.image-banner.settings.image.label` | `Image 1` |
| `sections.image-banner.settings.image_2.label` | `Image 2` |
| `sections.image-banner.settings.image_overlay_opacity.label` | **absent** (same as local) |
| `nether.common.ui.media.overlay_opacity` | `Overlay opacity` |
| `sections.image-banner` block present | **Yes** (`sections` count **60**) |

---

## 4. File comparison detail

### 4.1 `sections/image-banner.liquid`

| Theme | Byte-equal to local? | Overlay label `t:` path |
|---|---|---|
| Development `173889224740` | **Yes** | `t:nether.common.ui.media.overlay_opacity` |
| Live `173520715812` | No | `t:sections.image-banner.settings.image_overlay_opacity.label` |
| Unpublished `173813301284` | No | `t:sections.image-banner.settings.image_overlay_opacity.label` |

Development Liquid also still contains the setting **id** `image_overlay_opacity` (CSS/setting value), but the **schema label translation** is the shared UI key — not `sections.image-banner.settings.image_overlay_opacity.label`.

### 4.2 `locales/*.schema.json`

| Theme | EN leaves | Has `image-banner`? | JSON equal to local? |
|---|---:|---|---|
| Development | 2326 | Yes | **Yes** |
| Live | 1147 | Yes | No (different theme lineage) |
| Unpublished | 3080 | Yes | No (pre–Phase A Dawn-style labels retained) |

### 4.3 Remote Liquid ↔ remote locale resolution (Image Banner)

| Theme | Missing schema `t:` refs for Image Banner |
|---|---:|
| Development | **0** |
| Live | **0** (old Dawn paths still present in that theme’s locale) |
| Unpublished | **0** (old Dawn paths still present in that theme’s locale) |

---

## 5. Why bytes differ but content matches (development)

| Observation | Explanation |
|---|---|
| All 20 schema files show raw SHA/size DIFF | Shopify pull adds a `/* … */` banner before the JSON object |
| After banner strip | **0** key additions/removals/value mismatches vs local |
| Image Banner Liquid raw SHA | **Identical** — no banner, no drift |

This is **not** a partial upload and **not** a wrong development theme ID for the CLI current theme.

---

## 6. If Theme Editor still shows missing keys — precise path analysis

Because development Liquid + locales **match local** and resolve with **0** missing refs, the cited examples cannot be produced by “key absent from development locale” for the current development pairing.

### 6.1 Code path for each cited key on development `#173889224740`

**A. `t:sections.image-banner.settings.image.label`**

1. `sections/image-banner.liquid` `{% schema %}` → setting `id: "image"`  
2. `"label": "t:sections.image-banner.settings.image.label"`  
3. Locale leaf `sections.image-banner.settings.image` → `"label": "Image 1"`  
4. **Expected Theme Editor string:** `Image 1`  
5. **Cannot be “missing” due to absent key** on this theme.

**B. `t:sections.image-banner.settings.image_2.label`**

Same path for `image_2` → `"Image 2"`. **Resolves.**

**C. `t:sections.image-banner.settings.image_overlay_opacity.label`**

1. **Not referenced** by development/local Image Banner schema labels.  
2. Actual label path is `t:nether.common.ui.media.overlay_opacity`.  
3. Locale provides `nether.common.ui.media.overlay_opacity` = `"Overlay opacity"`.  
4. Locale does **not** contain `sections.image-banner.settings.image_overlay_opacity.label` (Phase A deletion after remap).  
5. **Theme Editor cannot emit this raw `t:` string from current development Liquid**, because that `t:` string is not in the schema.

### 6.2 What can still make Theme Editor look “broken”

| Cause | Fits evidence? |
|---|---|
| Stale development upload of locales/Liquid | **No** — pull matches local |
| Partial locale-only upload leaving old Liquid | **No** — development Liquid is already remapped and matches local |
| Wrong theme in the browser (live / unpublished) | **Possible** — those themes ≠ local; confirm editor URL theme ID |
| Reading Dawn-style key names / old QA notes while viewing remapped schema | **Possible** — especially for `…image_overlay_opacity.label` |
| `shopify theme dev` not running (no live re-sync) | True, but **does not** create the current mismatch — pull already matches |
| Platform/UI cache after prior Sprint 2 missing-block errors | Possible; hard-refresh / reopen editor on `#173889224740` |

### 6.3 Live / unpublished are out of sync with local (but not via the three cited misses)

If the merchant opens:

- https://mpb0jd-ux.myshopify.com/admin/themes/173520715812/editor (live), or  
- https://mpb0jd-ux.myshopify.com/admin/themes/173813301284/editor (unpublished),

they are **not** on the Phase A development snapshot. Those themes still use Dawn-local overlay labels and pre–Phase A locale shapes. Their Image Banner pairing still resolves the three cited keys internally; they are simply **not** the local repository version.

---

## 7. Conclusions

1. **Development theme ID in use by CLI:** `173889224740` (`Development (ceca91-Kenz)`), marked `[current]`.
2. **Latest local Image Banner + schema locales are on that development theme.**
3. **Schema locales match local JSON exactly** (ignore Shopify pull comment banner when comparing bytes).
4. **`image-banner.liquid` on development is byte-identical to local.**
5. **Difference vs local is not the cause** of unresolved `image.label` / `image_2.label` on development — those keys exist and are referenced correctly.
6. **`image_overlay_opacity.label` is not on the development Theme Editor code path** — overlay uses `nether.common.ui.media.overlay_opacity`.
7. Next debugging step (still no code changes): confirm the browser Theme Editor URL theme ID is **`173889224740`**, hard-refresh, and re-check whether the raw strings shown are exactly those three keys or different remapped/`t:nether.common.ui.*` keys.

---

## 8. Evidence log (read-only)

- `shopify theme list --json` → themes `173520715812` (live), `173813301284` (unpublished), `173889224740` (development).
- `shopify theme info --theme 173889224740` → development role; editor/preview URLs.
- `shopify theme list` (human) → development marked `[current]`.
- `shopify theme pull --theme 173889224740 --only locales/*.schema.json --only sections/image-banner.liquid` → temp compare dir.
- Same pull for live + unpublished themes for contrast.
- Python JSON leaf walks + Liquid `t:` resolution against pulled files.
- Terminal `1.txt`: `theme dev` not active; last locale sync 20:13; Phase A commit afterward.

**Repo files modified:** none (report only).  
**Temp pull dirs used (outside repo):**  
`%LOCALAPPDATA%\Temp\nether-theme-sync-173889224740`, `nether-theme-sync-live`, `nether-theme-sync-unpublished`.

---

## 9. Stop condition

Sync verification complete. No restores, remaps, or uploads performed. Awaiting further instruction.
