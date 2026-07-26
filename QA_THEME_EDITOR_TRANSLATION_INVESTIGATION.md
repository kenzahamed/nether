# QA Investigation — Theme Editor Missing Translation Errors

**Date:** 2026-07-25
**Type:** Investigation only — **no files modified, no keys added, no schemas changed**
**Trigger:** Theme Editor (dev theme) reports `missing translation: "t:sections.image-banner.name"`, `"t:sections.image-banner.settings.image.label"`, and similar.
**Status:** Root cause identified with evidence. Awaiting approval before any fix.

---

## 1. Executive Summary

The Theme Editor is emitting `missing translation` errors for **33 standard (Dawn-heritage) sections**, including `image-banner`, `rich-text`, `featured-product`, `main-product`, and the `main-*` account/cart/blog/collection templates.

The root cause is **not** Recovery Sprint 5 (Responsive). It traces to **Recovery Sprint 2 — "Recover translation and localization architecture"** (commit `c3aa347`), which rewrote `locales/en.default.schema.json` with **837 insertions / 2290 deletions**, removing **~780 object keys**. That rewrite retained the Nether (`nether_*`) section blocks and a small subset of Dawn blocks, but **dropped the translation blocks for all remaining standard Dawn sections** while their `.liquid` schemas still reference `t:sections.<key>.*`.

Impact is limited to **Theme Editor label rendering**. **Storefront rendering is unaffected** because every failing reference lives inside `{% schema %}` blocks (editor-only), with no `| t` usage in rendered Liquid bodies.

---

## 2. Root Cause

**Primary cause: Missing locale entries introduced by Sprint 2 locale restructure.**

Evidence chain:

1. **Referenced key does not exist.** `sections/image-banner.liquid` references `t:sections.image-banner.name` (L171) and `t:sections.image-banner.settings.image.label` (L181). The `sections` object in `locales/en.default.schema.json` contains **29 keys, none of which is `image-banner`** (nor `image_banner`).

   Existing `sections` keys (29):
   `all, apps, collage, footer, nether_footer, nether_hero, nether_collection, nether_content, nether_media, header, multirow, multicolumn, newsletter, page, video, slideshow, collapsible_content, nether_product_page, nether_collection_page_banner, nether_collection_page, nether_cart_page, nether_cart_drawer, nether_wishlist_page, nether_compare_page, nether_recommendations, nether_bundles, nether_commerce, disclosures, nether_product`

2. **The keys were deleted in Sprint 2.** `git log -S 'image-banner' -- locales/en.default.schema.json` returns only `0292423` (initial, added) and `c3aa347` (Sprint 02, changed). The Sprint 2 diff shows the blocks being **removed**:

   ```
   -    "featured-product": {
   -    "image-banner": {
   -    "main-product": {
   -    "rich-text": {
   ```

3. **Scale of the Sprint 2 rewrite:** `git show --stat c3aa347` → `1 file changed, 837 insertions(+), 2290 deletions(-)`. Object-key delta within that diff: **removed ≈ 780, added ≈ 101**.

4. **Not caused by section renaming.** `sections/image-banner.liquid` has only ever been touched in `0292423` (initial). The section filename and its `t:` references are unchanged; the locale side changed.

5. **Not caused by Sprint 5.** Sprint 5 modified `component-responsive.css` (new), `layout/theme.liquid`, `layout/password.liquid`, `nether-motion.js`, `base.css`, `component-slider.css`, `component-complementary-products.css`, `global.js`, `sections/header.liquid`, `component-hero.css`, `component-banner.css`. **No locale file and none of the 33 affected sections were touched.**

**Conclusion:** The failing references are **missing locale entries**, deleted during the **Sprint 2 localization-architecture rewrite**. This is not a typo, mis-nesting, or rename on the section side.

---

## 3. Affected Files

### 3.1 Section files referencing missing locale keys (33)

Each references `t:sections.<key>.*` inside its `{% schema %}` block, where `<key>` no longer exists in the locale:

| Section file | Missing top-level key |
|---|---|
| `announcement-bar.liquid` | `announcement-bar` |
| `collection-list.liquid` | `collection-list` |
| `contact-form.liquid` | `contact-form` |
| `custom-liquid.liquid` | `custom-liquid` |
| `email-signup-banner.liquid` | `email-signup-banner` |
| `featured-blog.liquid` | `featured-blog` |
| `featured-collection.liquid` | `featured-collection` |
| `featured-product.liquid` | `featured-product` |
| `image-banner.liquid` | `image-banner` |
| `image-with-text.liquid` | `image-with-text` |
| `main-account.liquid` | `main-account` |
| `main-activate-account.liquid` | `main-activate-account` |
| `main-addresses.liquid` | `main-addresses` |
| `main-article.liquid` | `main-article` |
| `main-blog.liquid` | `main-blog` |
| `main-cart-footer.liquid` | `main-cart-footer` |
| `main-cart-items.liquid` | `main-cart-items` |
| `main-collection-banner.liquid` | `main-collection-banner` |
| `main-collection-product-grid.liquid` | `main-collection-product-grid` |
| `main-list-collections.liquid` | `main-list-collections` |
| `main-login.liquid` | `main-login` |
| `main-order.liquid` | `main-order` |
| `main-page.liquid` | `main-page` |
| `main-password-footer.liquid` | `main-password-footer` |
| `main-password-header.liquid` | `main-password-header` |
| `main-product.liquid` | `main-product` |
| `main-register.liquid` | `main-register` |
| `main-reset-password.liquid` | `main-reset-password` |
| `main-search.liquid` | `main-search` |
| `quick-order-list.liquid` | `quick-order-list` |
| `bulk-quick-order-list.liquid` | `quick-order-list` |
| `related-products.liquid` | `related-products` |
| `rich-text.liquid` | `rich-text` |

> Note: `quick-order-list` is referenced by two section files (`quick-order-list.liquid`, `bulk-quick-order-list.liquid`) → **32 distinct missing keys across 33 files**.

### 3.2 Locale files affected

All schema-locale files lost the Dawn section blocks (checked for `"image-banner"` → absent in every one):

`en.default.schema.json` (default — drives the dev Theme Editor), plus `cs, da, de, es, fi, fr, it, ja, ko, nb, nl, pl, pt-BR, pt-PT, sv, th, tr, zh-CN, zh-TW` `.schema.json` — **20 schema-locale files total**.

> Storefront `*.json` locale files (e.g. `en.default.json`) are a separate namespace (rendered strings) and are **not** the source of these editor errors.

---

## 4. Missing Keys

The missing entries are **entire section blocks**, not individual leaf strings. For each key above, the following sub-trees are referenced by the schema and are absent from the locale:

- `t:sections.<key>.name`
- `t:sections.<key>.settings.*.label` / `.content` / `.info`
- `t:sections.<key>.settings.*.options__N.label`
- `t:sections.<key>.blocks.*.name` / `.settings.*.label` (for sections with blocks)

Representative confirmed-missing examples (from `image-banner.liquid`):

- `t:sections.image-banner.name` (L171)
- `t:sections.image-banner.settings.image.label` (L181)
- `t:sections.image-banner.settings.image_2.label` (L186)
- `t:sections.image-banner.settings.image_overlay_opacity.label` (L195)
- `t:sections.image-banner.settings.image_height.*` (L204–220)
- `t:sections.image-banner.settings.desktop_content_position.*` (L256–292)
- `t:sections.image-banner.blocks.heading.*` (L366+)

> Shared references such as `t:sections.all.animation.image_behavior.*` and `t:sections.all.colors.label` **do resolve** — the `all` block still exists. Only the per-section blocks are missing.

---

## 5. Incorrect Keys

**None identified.** This is not a case of incorrect references, typos, mis-nesting, or renames:

- All Nether (`nether_*`) section references resolve correctly against existing locale blocks.
- The affected section filenames and their `t:` reference strings are unchanged since the initial commit.
- `rich_text` / `featured_product` strings *do* appear in the locale (e.g. L7328, L7462) but only as **setting value labels inside `nether_*` blocks**, not as the top-level `rich-text` / `featured-product` section blocks the schemas require. These are unrelated matches, not valid targets.

The defect is purely **absent locale blocks**, not malformed references.

---

## 6. Impact Assessment

| Dimension | Finding |
|---|---|
| **Surface** | **Theme Editor only.** Every failing reference is inside a `{% schema %}` block (in samples, first `t:` ref is 2 lines after `{% schema %}`). Schema `t:` strings localize editor labels; they are not emitted to the storefront. |
| **Storefront rendering** | **Unaffected.** No `| t` usage of these `sections.<dawn-key>.*` keys was found in rendered Liquid bodies of the affected sections. |
| **Merchant experience** | Degraded editor UX: affected sections show raw `t:sections.<key>...` strings instead of human labels for section name, settings, options, and blocks. |
| **Scope** | **Framework-wide** across standard Dawn sections (33 files) and **all 20 schema-locale files**. Nether-native (`nether_*`) sections are **not** affected. |
| **Isolation** | Isolated to the **schema localization layer**; does not affect CSS, JS, motion, responsive behavior, or Sprint 1–5 functional systems. |

---

## 7. Recovery Impact (Which Sprint?)

| Sprint | Related? | Evidence |
|---|---|---|
| **Sprint 2 — Translation & Localization Architecture** | **YES — root cause** | `c3aa347` rewrote `en.default.schema.json` (837+/2290−); diff explicitly removes `image-banner`, `rich-text`, `featured-product`, `main-product`, and peers. `git log -S 'image-banner'` confirms the block last changed in this commit. |
| Sprint 5 — Responsive | No | Touched CSS/JS/layout/header only; no locale or affected-section changes. |
| Sprint 4 — Merchant Controls | No | Added `visible_if` / shared keys to Nether schemas; did not restore or reference Dawn section blocks. Post-dates Sprint 2 with these blocks already absent. |
| Sprint 3 — Settings Binding | No | Separate commit (`443ebed`); no restoration of Dawn section locale blocks. |
| Sprint 1 | No | Predates the Sprint 2 locale rewrite. |

**Determination:** Sufficient evidence attributes the missing translations to **Recovery Sprint 2**. No guessing required.

---

## 8. Recommended Fix Strategy (for approval — not yet applied)

> Presented as options; **no changes made**. Awaiting approval.

**Option A — Restore Dawn section blocks from history (recommended).**
Recover the 32 missing `sections.<key>` blocks for the 33 affected files from the pre-Sprint-2 revision (`0292423`) of `locales/en.default.schema.json`, re-inserting them into the current `sections` object without disturbing the Nether blocks. Mirror into the other 19 schema-locale files (English fallback acceptable per the Sprint 4 locale-sync convention).

- Pros: Exact original labels; smallest behavioral surprise; reversible.
- Cons: Large block re-insertion; must preserve current Nether structure and valid JSON.

**Option B — Targeted restoration (minimum to clear editor errors).**
Restore only the blocks for sections actually installable/used in the merchant's templates (e.g. `image-banner`, `rich-text`, `featured-product`, `main-product`, `main-cart-*`, `main-collection-*`), deferring rarely used ones.

- Pros: Smaller change.
- Cons: Leaves latent errors for any later-added standard section; inconsistent.

**Option C — Reconcile intent.**
If Sprint 2 intentionally deprecated standard Dawn sections in favor of Nether equivalents, the correct fix may be to **remove/retire the orphaned Dawn section files** rather than restore locale keys. This is a **scope/product decision** and must be confirmed before acting (conflicts with the "do not delete files" rule unless explicitly authorized).

**Validation for any option:**
1. Re-run `shopify theme check` and confirm `TranslationKeyExists` / missing-translation offenses for these keys clear.
2. Open the Theme Editor and confirm affected sections show proper labels.
3. Confirm JSON validity of every modified `*.schema.json`.
4. Confirm no Nether (`nether_*`) blocks were altered.

**Recommended:** **Option A**, pending confirmation that standard Dawn sections are intended to remain part of Nether.

---

## 9. Evidence Log (commands run — all read-only)

- `sections/image-banner.liquid` references: `t:sections.image-banner.*` at L171–L366+ (all within `{% schema %}` starting L169).
- Locale `sections` keys enumerated via `ConvertFrom-Json` → 29 keys, no `image-banner`.
- Cross-reference of all `sections/*.liquid` → 33 files reference missing keys (32 distinct).
- `git show --stat c3aa347 -- locales/en.default.schema.json` → 837+/2290−.
- `git show c3aa347` diff → explicit `-"image-banner":`, `-"rich-text":`, `-"featured-product":`, `-"main-product":`.
- `git log -S 'image-banner' -- locales/en.default.schema.json` → `c3aa347`, `0292423` only.
- 20 `*.schema.json` files scanned for `"image-banner"` → absent in all.
- Body `| t` scan of affected sections for these keys → no matches (editor-only impact).

---

## 10. Investigation Status

- Root cause: **Identified (Sprint 2 locale rewrite).**
- Scope: **33 sections / 32 keys / 20 schema-locale files; Theme Editor only.**
- Files modified during investigation: **none.**
- Next step: **Await approval** on fix strategy (Option A recommended). Do not proceed to Sprint 6.
