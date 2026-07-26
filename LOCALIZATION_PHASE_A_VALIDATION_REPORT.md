# Nether Localization Phase A — Validation Report

**Date:** 2026-07-26  
**Scope:** Validate completed Phase A refactor only (no Phase B, no architecture changes)  
**Shop / theme used for upload:** `mpb0jd-ux.myshopify.com` · Development theme `173889224740` (`Development (ceca91-Kenz)`)  
**Validation tooling:** `.nether-analysis/loc_phase_a_validate.py`, Theme Check JSON, `shopify theme push --only locales/*.schema.json`

---

## Verdict

### **PASS WITH MINOR ISSUES**

Phase A meets its primary goals: schema translation count is under Shopify’s 3,400 limit, structural labels resolve through `nether.common.ui.*`, merchant-facing content remains local, theme upload succeeds, and Theme Editor schema resolution shows no broken `t:` keys on audited sections.

Minor issues noted below are non-blocking (one unused shared key + known pre-existing gaps). No Phase A functional regressions were found that require an immediate fix before Phase B approval.

---

## 1. Translation integrity

| Check | Result |
|---|---|
| `en.default.schema.json` leaf count | **2,327** |
| Shopify schema translation limit | **3,400** |
| Headroom | **1,073 (~31.5%)** |
| Shared UI vocabulary keys (`nether.common.ui.*`) | **440** |
| Duplicate English values within UI namespace | **0 groups** |
| Broken / missing `t:` refs introduced by Phase A | **0** |
| Merchant `.info` / `.default` / `.placeholder` / presets on `ui.*` | **0** |
| Label refs on Phase A UI domains | **2,483** |
| Namespace collision (`layout` / `content` flat + nested `ui.*`) | **OK** — flat strings preserved |

### Missing translation keys (referenced, unresolved)

**19 keys** — all `settings_schema.social-media.*` in `config/settings_schema.json`.

- Documented in Phase A implementation report as **pre-existing / Tier 1 untouched**.
- **Not introduced by Phase A.**

### Orphaned shared keys

| Key | Status |
|---|---|
| `nether.common.ui.labels.sticky_buy_box_nether` | **Orphan** — present in all schema locales, **never referenced** |

Liquid still correctly uses the legacy flat key:

`t:nether.common.sticky_buy_box` → `"Sticky buy box (Nether)"`  
(e.g. `sections/nether-product-page.liquid`)

**Impact:** No Theme Editor raw-key symptom. One unused shared leaf (~1 translation value). Suitable for Phase B cleanup, not a blocking regression.

### Duplicate shared namespace conflicts

None. Domains under `nether.common.ui.*` coexist with legacy flat strings such as `nether.common.layout` / `nether.common.content` without overwrite.

### Cross-locale key parity

Non-English schema files have **2,324** leaves vs English **2,327** — a gap of **3** keys:

1. `sections.header.settings.nether_drawer_secondary_menu.info`
2. `sections.header.settings.nether_mega_secondary_menu.info`
3. `sections.nether_product_page.settings.nether_enable_sticky_summary.info`

**Pre-existing:** identical EN-only gap existed at `HEAD` before Phase A (3034 EN / 3031 FR). Phase A did not widen the gap.

Notes:

- Header settings **do** reference the two `*.info` keys; English provides the help text (other locales fall back).
- Product sticky setting in Liquid uses `t:nether.common.info_sticky_summary` (present in all locales). The section-local `…nether_enable_sticky_summary.info` leaf is unused EN-only inventory.

---

## 2. Shopify upload

| Check | Result |
|---|---|
| `shopify theme push --theme 173889224740 --only locales/*.schema.json` | **Success** (exit 0) |
| Schema translation limit error | **None** |
| Localization validation failure | **None** |
| Ongoing `shopify theme dev` sync of Phase A locale/section files | **Synced** with subsequent `GET 200` storefront responses |

Upload confirmation payload:

- Theme: Development (`173889224740`)
- Editor: `https://mpb0jd-ux.myshopify.com/admin/themes/173889224740/editor`
- Preview: `https://mpb0jd-ux.myshopify.com?preview_theme_id=173889224740`

**Upload status: PASS**

---

## 3. Theme Editor audit

Method: static schema resolution of every `name` / `label` / `info` / `placeholder` / `default` / `content` / `header` / preset `name` `t:` reference against `en.default.schema.json` for representative sections. Live admin UI was not driven by browser automation; resolution + successful schema upload are the validation signals.

| Section | Role | Issues |
|---|---|---:|
| `header.liquid` | Header | 0 |
| `footer.liquid` | Footer | 0 |
| `nether-hero.liquid` | Hero | 0 |
| `nether-product-page.liquid` / `main-product.liquid` / `featured-product.liquid` | Product | 0 |
| `nether-collection.liquid` / `nether-collection-page.liquid` | Collection | 0 |
| `nether-cart-page.liquid` | Cart | 0 |
| `main-search.liquid` | Search | 0 |
| `nether-media.liquid` | Lookbook / media gallery | 0 |
| `featured-collection.liquid` | Featured products/collection | 0 |
| `nether-bundles.liquid` | Bundles | 0 |
| `nether-testimonials.liquid` | Testimonials | 0 |
| `nether-commerce.liquid` / `nether-cta.liquid` / `nether-content.liquid` | Custom Nether | 0 |
| `slideshow.liquid` | Additional storefront section | 0 |

Verified outcomes:

- Section names resolve to human-readable strings (e.g. `Nether hero`, `Header`, `Featured collection`).
- Setting labels / option labels resolve (including remapped `nether.common.ui.*` vocabulary).
- Group / paragraph `content` headers resolve.
- Preset names remain on section-local (or legacy common) keys — **not** remapped to `ui.*`.
- **No raw `t:` keys** in the resolved set for audited schemas.
- **No missing translation keys** among audited schema references (excluding the known pre-existing social-media Tier 1 set outside these sections).

**Theme Editor status: PASS** (static resolution + upload)

---

## 4. Theme Check summary

Command: `shopify theme check --output json`  
Totals: **60** offenses · **30** error · **30** warning · **40** files

### Localization-related

| Check | Count | Notes |
|---|---:|---|
| Translation / MatchingTranslations / schema translation checks | **0** | No localization-specific Theme Check failures |

### Existing unrelated issues (not modified)

| Check | Count | Severity |
|---|---:|---|
| `UnsupportedFilterArguments` | 30 | error |
| `UnusedAssign` | 13 | warning |
| `OrphanedSnippet` | 10 | warning |
| `UndefinedObject` | 3 | warning |
| `RemoteAsset` | 2 | warning |
| `VariableName` | 2 | warning |

These match known pre-existing framework debt (commerce snippets, form snippets, layout scheme assign, etc.) and were **not** treated as Phase A defects. No unrelated code was changed during validation.

**Theme Check (localization): PASS**

---

## 5. Regression audit

| Gate | Result |
|---|---|
| Merchant `.default` remapped onto `ui.*` | **No** (0 refs) |
| Merchant `.info` remapped onto `ui.*` | **No** (0 refs) |
| Merchant `.placeholder` remapped onto `ui.*` | **No** (0 refs) |
| Preset names remapped onto `ui.*` | **No** (0 refs) |
| Sample defaults still local & resolvable | **Yes** (e.g. Hero → `Hero`, Featured collection → `Featured collection`, Footer Quick links, Media gallery) |
| Sample infos still local / legacy `info_*` | **Yes** (layout/content-position help text unchanged in role) |
| Section Liquid/JS/CSS functionality rewritten | **No** — Phase A touched schema `label` `t:` refs + locale schema files only (per implementation report); validation found no functional schema breakage |

**Regression status: PASS** — Phase A did not change merchant-facing default/help/placeholder/preset content architecture.

---

## 6. Localization issues found

### Phase A–related (minor, non-blocking)

1. **Orphan shared key** `nether.common.ui.labels.sticky_buy_box_nether`  
   - Created during shared vocabulary promotion but Liquid still references `nether.common.sticky_buy_box`.  
   - Recommended Phase B hygiene: either remap the label ref to the UI key **or** drop the unused leaf.  
   - **Not fixed in this validation** (cleanup, not a broken regression).

### Pre-existing (out of Phase A scope)

1. **19** missing `settings_schema.social-media.*` keys.
2. **3** English-only `.info` leaves absent from other schema locales (unchanged vs `HEAD`).
3. Theme Check non-localization errors/warnings listed above.

No Phase A–introduced broken references or merchant-content leaks were found that require an immediate code fix under the validation rules.

---

## 7. Final recommendation

| Decision | |
|---|---|
| **Result** | **PASS WITH MINOR ISSUES** |
| **Block Phase B?** | **No** |
| **Required fixes before Phase B?** | **None** (optional orphan-key hygiene only) |

Phase A successfully clears the 3,400 schema translation limit with healthy headroom, preserves merchant-facing content locally, uploads cleanly, and presents resolved Theme Editor labels on audited Nether and base sections.

**Stop here.** Await explicit approval before beginning Phase B.
