# Locale Translation Fix Report

**Date:** 2026-07-14  
**Scope:** Theme Editor schema locale repair only  
**Excluded:** Section functionality, Motion Engine, Hero Motion

---

## 1. Summary

Theme Editor “missing translation” messages for Dawn presets (e.g. `t:sections.featured-collection.presets.name`) were **not** caused by missing Dawn keys. Those keys already existed in `locales/en.default.schema.json`.

**Root cause:** Shopify translation schemas treat keys ending in `_html` as **string-only** leave values. Nether schema locales used object values under keys such as `custom_html` and `mega_menu_custom_html`. Theme Check reported 7× `ValidJSON` (“Incorrect type. Expected string”), which prevented reliable schema-locale application in the Theme Editor and surfaced raw `t:` keys for many sections—including intact Dawn presets.

**Fix:** Renamed `_html` object keys to valid locale paths, updated matching `t:` references (labels only), backfilled missing Nether trees into non-English schema locales, and confirmed Theme Check reports **zero** locale offenses.

---

## 2. Audit Findings

| Check | Result |
|---|---|
| `en.default.schema.json` JSON.parse | Valid |
| Duplicate sibling keys | None |
| Dawn `featured-collection` / `featured-product` / `collection-list` `presets.name` | Present |
| Section schema `t:` keys vs `en.default.schema.json` | 0 missing paths |
| Theme Check `locales/` before fix | **7× ValidJSON errors** on `*_html` object keys |
| Non-English schema locales | Missing 21 Nether sections + 1 settings_schema group (English fallback incomplete) |

### Invalid `_html` object keys (before)

| Path (abbreviated) |
|---|
| `sections.nether_footer.blocks.custom_html` (+ nested `settings.custom_html`) |
| `sections.nether_content.blocks.custom_html` |
| `sections.nether_testimonials.blocks.custom_html` |
| `sections.nether_faq.blocks.custom_html` |
| `sections.nether_newsletter.blocks.custom_html` (+ nested `settings.custom_html`) |
| `sections.nether_cta.blocks.custom_html` (+ nested `settings.custom_html`) |
| `sections.header.blocks.mega_menu_custom_html` |

---

## 3. Repairs Applied

### 3.1 Rename `_html` object keys → valid locale keys

| Old locale key | New locale key |
|---|---|
| `blocks.custom_html` | `blocks.html_block` |
| `blocks.*.settings.custom_html` | `blocks.*.settings.html_content` |
| `blocks.mega_menu_custom_html` | `blocks.mega_menu_html_block` |

**Unchanged (functionality preserved):**

- Block `type` values (`custom_html`, `mega_menu_custom_html`)
- Setting `id` values (`custom_html`, `html`, …)
- Liquid markup / Motion / Hero

### 3.2 Update Theme Editor `t:` paths only

Patched schema strings in:

- `sections/footer.liquid`
- `sections/header.liquid`
- `sections/nether-content.liquid`
- `sections/nether-testimonials.liquid`
- `sections/nether-faq.liquid`
- `sections/nether-newsletter.liquid`
- `sections/nether-cta.liquid`

### 3.3 Backfill non-English schema locales

Filled gaps from `en.default.schema.json` into all 19 other `*.schema.json` files:

- Sections: **45 → 66** (added all Nether sections)
- `settings_schema` groups: **22 → 23** (added missing groups such as Nether Motion)

Existing translated Dawn strings were preserved; only missing keys were filled with English.

---

## 4. Files Modified

| File(s) | Change |
|---|---|
| `locales/en.default.schema.json` | Renamed invalid `_html` object keys |
| `locales/*.schema.json` (19 non-English) | Key rename pass (no-ops where absent) + Nether/English backfill |
| `sections/footer.liquid` | Label `t:` path updates only |
| `sections/header.liquid` | Label `t:` path updates only |
| `sections/nether-content.liquid` | Label `t:` path updates only |
| `sections/nether-testimonials.liquid` | Label `t:` path updates only |
| `sections/nether-faq.liquid` | Label `t:` path updates only |
| `sections/nether-newsletter.liquid` | Label `t:` path updates only |
| `sections/nether-cta.liquid` | Label `t:` path updates only |
| `LOCALE_TRANSLATION_FIX_REPORT.md` | This report |

**Not modified:** Motion Engine, Hero Motion, block types, setting IDs, storefront `*.json` locales (no `_html` object issues there).

---

## 5. Verification

| Verification | Status |
|---|---|
| All section `t:` keys resolve in `en.default.schema.json` | Pass (0 missing) |
| Dawn preset names (`featured-collection`, `featured-product`, `collection-list`, …) | Present |
| Nether section trees present in every schema locale | Pass (66 sections each) |
| Remaining `_html` object keys in schema locales | **0** |
| `shopify theme check --path locales` | **LOCALES CLEAN** (0 errors / 0 warnings) |
| Block types / setting IDs unchanged | Confirmed |

### Theme Check

```text
shopify theme check --path locales
→ no ValidJSON / translation offenses
```

---

## 6. Why Theme Editor Showed Dawn “Missing” Keys

1. Schema locale contained invalid `_html` → object entries.  
2. Shopify’s locale schema treats `_html` keys as strings (HTML unescape contract).  
3. Validation failure prevented the schema locale from applying cleanly.  
4. Theme Editor fell back to literal `t:sections…` strings for many sections—including Dawn presets whose keys were actually present in the file.

Repairing the `_html` object keys restores schema-locale loading so existing Dawn and Nether translations display correctly.

---

## 7. Notes for Future Work

- Avoid locale object keys ending in `_html`. Use `html_block` / `html_content` / `*_markup` for nested Theme Editor copy.
- Storefront HTML strings may still use `_html` **string** leaves (Shopify convention); do not use `_html` for nested objects.
- Non-English Nether strings are English placeholders until professionally translated.

---

**Stop condition:** Locale/schema translation repair complete. No Motion Engine or Hero Motion changes.
