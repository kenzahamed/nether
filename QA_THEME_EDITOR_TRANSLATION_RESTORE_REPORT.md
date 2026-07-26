# QA Fix Report — Theme Editor Translation Restore (Option A)

**Date:** 2026-07-25  
**Status:** Complete  
**Authority:** Approved Option A after verification that all 32 missing keys map to section files still present in `/sections`  
**Scope:** Schema locale restoration only — **no section schemas, no Liquid, no CSS/JS modified**

---

## 1. Executive Summary

Restored the **32 missing Dawn section translation blocks** from pre–Recovery Sprint 2 revision **`0292423`** into the current schema locale files.

- Source: `git show 0292423:locales/<file>`
- Target: current `locales/*.schema.json` (20 files)
- Strategy: **additive merge only** — copy a block only if the key is absent in the current file
- Result: `sections` count **29 → 61** in every schema locale
- Nether (`nether_*`) entries: **unchanged** (SHA-256 fingerprints match pre-restore)

Theme Editor labels such as `t:sections.image-banner.name` now resolve again (e.g. English → `"Image banner"`).

---

## 2. Restored Keys (32)

All restored under `sections.<key>` from revision `0292423`:

| # | Restored key |
|---|---|
| 1 | `announcement-bar` |
| 2 | `collection-list` |
| 3 | `contact-form` |
| 4 | `custom-liquid` |
| 5 | `email-signup-banner` |
| 6 | `featured-blog` |
| 7 | `featured-collection` |
| 8 | `featured-product` |
| 9 | `image-banner` |
| 10 | `image-with-text` |
| 11 | `main-account` |
| 12 | `main-activate-account` |
| 13 | `main-addresses` |
| 14 | `main-article` |
| 15 | `main-blog` |
| 16 | `main-cart-footer` |
| 17 | `main-cart-items` |
| 18 | `main-collection-banner` |
| 19 | `main-collection-product-grid` |
| 20 | `main-list-collections` |
| 21 | `main-login` |
| 22 | `main-order` |
| 23 | `main-page` |
| 24 | `main-password-footer` |
| 25 | `main-password-header` |
| 26 | `main-product` |
| 27 | `main-register` |
| 28 | `main-reset-password` |
| 29 | `main-search` |
| 30 | `quick-order-list` |
| 31 | `related-products` |
| 32 | `rich-text` |

Per-file merge stats for `en.default.schema.json`:

- Restored: **32**
- Skipped because already present: **0**
- Missing from historical source: **0**
- Sections after merge: **61**

---

## 3. Affected Locale Files (20)

Each file restored **32** blocks from its own `0292423` revision (native translations where historically present, not English-forced):

| Locale file | Restored | Sections after | Nether preserved |
|---|---:|---:|---|
| `locales/en.default.schema.json` | 32 | 61 | Yes |
| `locales/cs.schema.json` | 32 | 61 | Yes |
| `locales/da.schema.json` | 32 | 61 | Yes |
| `locales/de.schema.json` | 32 | 61 | Yes |
| `locales/es.schema.json` | 32 | 61 | Yes |
| `locales/fi.schema.json` | 32 | 61 | Yes |
| `locales/fr.schema.json` | 32 | 61 | Yes |
| `locales/it.schema.json` | 32 | 61 | Yes |
| `locales/ja.schema.json` | 32 | 61 | Yes |
| `locales/ko.schema.json` | 32 | 61 | Yes |
| `locales/nb.schema.json` | 32 | 61 | Yes |
| `locales/nl.schema.json` | 32 | 61 | Yes |
| `locales/pl.schema.json` | 32 | 61 | Yes |
| `locales/pt-BR.schema.json` | 32 | 61 | Yes |
| `locales/pt-PT.schema.json` | 32 | 61 | Yes |
| `locales/sv.schema.json` | 32 | 61 | Yes |
| `locales/th.schema.json` | 32 | 61 | Yes |
| `locales/tr.schema.json` | 32 | 61 | Yes |
| `locales/zh-CN.schema.json` | 32 | 61 | Yes |
| `locales/zh-TW.schema.json` | 32 | 61 | Yes |

All 20 files parse as valid JSON after the write.

---

## 4. Nether Locale Preservation Confirmation

**Confirmed: no existing Nether locale entries were overwritten.**

Method:

1. Before merge, SHA-256 fingerprints (first 12 hex chars) of every `sections.nether_*` block in `en.default.schema.json` were recorded.
2. Merge logic only assigned a key when `!(key in current.sections)` — existing keys were never reassigned.
3. After merge, fingerprints were recomputed and matched exactly.

| Nether key | Pre-restore fingerprint | Post-restore | Status |
|---|---|---|---|
| `nether_footer` | `9fa85694ebe5` | identical | Preserved |
| `nether_hero` | `2b5b398c8194` | identical | Preserved |
| `nether_collection` | `4abfe2405796` | identical | Preserved |
| `nether_content` | `c271fbe0116c` | identical | Preserved |
| `nether_media` | `2f4cbae4a947` | identical | Preserved |
| `nether_product_page` | `20bfa076a682` | identical | Preserved |
| `nether_collection_page_banner` | `b371a6b4759c` | identical | Preserved |
| `nether_collection_page` | `05b3c60bd090` | identical | Preserved |
| `nether_cart_page` | `f9c1b11b9373` | identical | Preserved |
| `nether_cart_drawer` | `bcb1b8a79b68` | identical | Preserved |
| `nether_wishlist_page` | `706075e563cc` | identical | Preserved |
| `nether_compare_page` | `b685144edf24` | identical | Preserved |
| `nether_recommendations` | `bc91fa20546b` | identical | Preserved |
| `nether_bundles` | `36b9620bb3ed` | identical | Preserved |
| `nether_commerce` | `735e2664c5fc` | identical | Preserved |
| `nether_product` | `c2b380d79cac` | identical | Preserved |

Across all 20 schema locales: `netherChanged = []`, `netherRemoved = []`, `netherAdded = []`.

Also preserved (non-Nether, already present): `all`, `apps`, `collage`, `footer`, `header`, `multirow`, `multicolumn`, `newsletter`, `page`, `video`, `slideshow`, `collapsible_content`, `disclosures`, and shared keys such as `common` / `settings_schema` trees — untouched by the additive merge.

---

## 5. Files Not Modified

Per approval constraints:

- **No** section `{% schema %}` blocks modified
- **No** Liquid files modified
- **No** CSS / JS / layout changes
- Storefront `locales/*.json` (non-schema) untouched — not in scope

---

## 6. Verification Checklist

| Check | Result |
|---|---|
| All 32 keys present in `en.default.schema.json` | Pass |
| `sections.image-banner.name` resolves to `"Image banner"` | Pass |
| Sections count 61 (matches historical Dawn + retained Nether set) | Pass |
| Nether fingerprints unchanged | Pass |
| All 20 schema JSON files valid | Pass |
| No section Liquid / schema edits | Pass |

**Manual follow-up:** Reload the Theme Editor for the development theme and confirm the previous `missing translation: "t:sections.image-banner.*"` banners are gone.

---

## 7. Root Cause Reminder

These blocks were removed in Recovery Sprint 2 (`c3aa347`) during the localization architecture rewrite. Section files remained; only schema locale blocks were dropped. This restore reverses that deletion without altering Nether localization work introduced afterward.
