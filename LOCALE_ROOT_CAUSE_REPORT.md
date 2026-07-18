# Locale Root Cause Report

**Date:** 2026-07-14  
**Scope:** Theme Editor `t:` schema translation resolution  
**Excluded from edits:** Motion Engine, Hero Liquid/Motion behavior, Commerce Liquid

---

## Root cause

Shopify enforces a **hard platform limit of 3,400 translation leaves per locale file** (documented under [Theme locale requirements](https://shopify.dev/docs/storefronts/themes/architecture/locales)).

Nether’s `locales/en.default.schema.json` contained **4,556 translation leaves** (~1,156 over the limit).

When a schema locale exceeds that limit, Shopify does **not** apply the file reliably in the Theme Editor. Existing keys then surface as literal strings such as:

- `t:sections.multicolumn.presets.name`
- `t:sections.newsletter.presets.name`
- `t:sections.footer.name`
- `t:sections.video.presets.name`

Those Dawn keys were already present and correctly nested. The failure was **schema locale loading**, not missing individual entries.

### Why this presents as “missing Dawn keys”

| Layer | Finding |
|---|---|
| Key existence | Dawn + Nether `t:` paths resolve in the JSON file |
| Theme Check | Passes (does **not** enforce the 3,400 platform limit) |
| Locale hierarchy | `en.default.schema.json` naming/structure is valid |
| Duplicates / BOM / invalid nesting | None material |
| Storefront `en.default.json` | Separate file; ~732 leaves; not the Theme Editor schema path |
| Platform upload/runtime | Over-limit schema locale → translations not applied → literal `t:` |

### Secondary issue (non-blocking for Dawn)

Six Commerce option labels referenced **translation groups** (objects) instead of string leaves, e.g. `t:…options.stack` → `{ "label": "Stack" }`. That cannot resolve as a string. Flattened in locale only (Commerce Liquid unchanged).

---

## Why the previous fix did not resolve all translations

The prior repair (`LOCALE_TRANSLATION_FIX_REPORT.md`) fixed **ValidJSON** failures: object values under keys ending in `_html` (Shopify requires `_html` leaves to be strings).

That restored Theme Check cleanliness and fixed one reject/parse class, but:

1. The schema locale remained **above 3,400 leaves**.
2. Theme Check still reported a clean locales tree (no platform key-count check).
3. Non-English schema backfills copied the same oversized English trees into every `*.schema.json`, so **every** schema locale stayed over the limit.
4. Patching or verifying individual Dawn keys could not help: the file as a whole could not load under Shopify’s quota.

---

## Audit summary

| Check | Result |
|---|---|
| `en.default.schema.json` parse | Valid |
| Duplicate sibling keys | 0 |
| `_html` object leaves | 0 (post prior fix) |
| Section `t:` vs locale (pre-limit fix) | 0 missing paths |
| Translation leaf count (before) | **4,556** |
| Shopify max | **3,400** |
| Over by | **1,156** |
| Used `t:` references (before) | 4,487 |
| Unused leaves only | 75 (removing them alone still left ~4,481 — still over) |

Largest contributors included header + multiple Nether section trees (CTA, product, newsletter, banner, testimonials, FAQ, hero, etc.). Unique English strings were only ~1,555 — growth came from **per-section duplicated labels**, not unique copy.

---

## Minimal fix implemented

Reduce schema locale leaves **under 3,400** without touching Motion, Hero, or Commerce Liquid.

### 1. Inline excess Nether schema labels (non-protected)

Resolved `t:` → English strings inside `{% schema %}` for:

- `sections/nether-cta.liquid`
- `sections/nether-product.liquid`
- `sections/nether-newsletter.liquid`
- `sections/nether-banner.liquid`
- `sections/nether-testimonials.liquid`
- `sections/nether-faq.liquid`

Then removed the matching `sections.nether_*` trees from all `*.schema.json` files.

Theme Editor still shows readable English for those sections; they simply no longer consume schema-locale quota.

### 2. Prune unused schema leaves

Removed leftover unreferenced leaves across all schema locales.

### 3. Restore shared product keys used by collection page

`nether-collection-page` still references a small `t:sections.nether_product.settings.*` set. Restored a **minimal** `sections.nether_product.settings` subtree (20 leaves) in all schema locales.

### 4. Flatten Commerce option groups (locale only)

`trust_layout` / `inventory_display` option values are now strings so existing Commerce `t:` paths resolve. **No Commerce Liquid changes.**

### Preserved

- Hero section Liquid + full `sections.nether_hero` locale tree  
- Commerce Liquid + `sections.nether_commerce` locale tree  
- Motion (`settings_schema.nether_motion`, animations)  
- Dawn section `t:` keys and their locale entries  

---

## Files modified

| File(s) | Change |
|---|---|
| `locales/en.default.schema.json` | Leaf count 4556 → **3080**; removed inlined Nether trees; unused prune; commerce option flatten; minimal shared `nether_product` settings restored |
| `locales/*.schema.json` (19 non-English) | Same structural reduction |
| `sections/nether-cta.liquid` | Schema `t:` → English (schema only) |
| `sections/nether-product.liquid` | Schema `t:` → English (schema only) |
| `sections/nether-newsletter.liquid` | Schema `t:` → English (schema only) |
| `sections/nether-banner.liquid` | Schema `t:` → English (schema only) |
| `sections/nether-testimonials.liquid` | Schema `t:` → English (schema only) |
| `sections/nether-faq.liquid` | Schema `t:` → English (schema only) |
| `LOCALE_ROOT_CAUSE_REPORT.md` | This report |

**Not modified:** Motion assets/config behavior, Hero Liquid beyond no edits, Commerce Liquid, storefront `*.json` locales.

---

## Verification

| Check | Status |
|---|---|
| `en.default.schema.json` leaf count | **3080 ≤ 3400** |
| All schema locales leaf count | **3080 ≤ 3400** |
| Remaining schema `t:` keys resolve to strings | **0 missing / 0 object hits** |
| Dawn samples (`multicolumn` / `newsletter` / `footer` / `video`) | Present as strings |
| `shopify theme check --path locales` | **No offenses** |
| Hero / Motion / Commerce Liquid | Untouched |

After syncing this theme to the store, Theme Editor should resolve Dawn and remaining `t:` keys to translated labels instead of raw keys.

---

## Framework guidance (long-term)

1. Treat **3,400 schema leaves** as a hard architecture budget for Nether.  
2. Prefer a shared schema dictionary (`t:nether.common.*`) for repeated labels (Heading, Layout, Left/Right, etc.) — ~1,555 unique values would fit easily if shared.  
3. Do not backfill every Nether tree into every language blindly without measuring leaf count.  
4. Theme Check clean ≠ platform-loadable; always verify leaf count after large schema additions.  
5. Avoid `t:` paths that point at objects (translation groups); option labels must be string leaves.

---

**Stop condition:** Root cause identified; schema locales under platform limit; report written. No Motion / Hero / Commerce Liquid changes.
