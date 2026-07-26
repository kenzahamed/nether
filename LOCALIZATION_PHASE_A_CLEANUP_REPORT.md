# Nether Localization Phase A — Cleanup Report

**Date:** 2026-07-26  
**Scope:** Cleanup-only pass after Phase A validation  
**Out of scope:** Phase B · architecture redesign · `.default` / `.info` / `.placeholder` / preset migration

---

## Summary

Removed **1** orphaned shared UI key from all **20** schema locale files.

- Every remaining `nether.common.ui.*` key has **≥1** active theme reference.
- **No** legacy `nether.common.*` key was safe to remove.
- No Liquid, JS, CSS, or schema `t:` references were changed.
- **Behavior unchanged.**

---

## Removed orphan keys

| Key | English value | Why removed | Locales updated |
|---|---|---|---:|
| `nether.common.ui.labels.sticky_buy_box_nether` | Sticky buy box (Nether) | Created during Phase A vocabulary promotion but never referenced. Liquid continues to use legacy `t:nether.common.sticky_buy_box`. | 20 |

Active label that remains in use:

```text
t:nether.common.sticky_buy_box  →  "Sticky buy box (Nether)"  (1 reference)
```

Example consumer: `sections/nether-product-page.liquid` (`nether_enable_sticky_summary` label).

---

## Shared namespace verification

| Check | Result |
|---|---|
| `nether.common.ui.*` keys before cleanup | 440 |
| Orphans found | 1 |
| Orphans removed | 1 |
| `nether.common.ui.*` keys after cleanup | **439** |
| Remaining UI orphans | **0** |
| Every UI key has ≥1 active reference | **Yes** |

### Domain breakdown (post-cleanup)

| Domain | Keys |
|---|---:|
| `labels` | 303 |
| `layout` | 42 |
| `media` | 16 |
| `actions` | 15 |
| `motion` | 15 |
| `states` | 14 |
| `typography` | 13 |
| `commerce` | 11 |
| `content` | 5 |
| `sizing` | 5 |
| **Total** | **439** |

---

## Remaining legacy keys

Legacy flat / common inventory under `nether.common.*` (excluding `ui.*`) was **not** deleted.

| Metric | Count |
|---|---:|
| Legacy `nether.common.*` leaves (non-`ui`) | **634** |
| Referenced | **632** |
| Unreferenced (retained) | **2** |

### Unreferenced legacy keys retained (not safely removable in this pass)

| Key | Reason retained |
|---|---|
| `nether.common.info_parallax` | Unused `.info` help string. No referenced `ui.*` twin. Removing would be inventory hygiene outside Phase A shared-label cleanup; left for later review. |
| `nether.common.info_collection_layout_only` | Same as above. |

### Legacy removal gate

A legacy key is **safely removable** only if:

1. It has **zero** theme references, **and**
2. A referenced `nether.common.ui.*` twin already carries the same English value for all active call sites.

| Gate result | Count |
|---|---:|
| Legacy keys meeting both criteria | **0** |

Therefore: **no legacy key can now be safely removed.**

Notable kept twin:

- `nether.common.sticky_buy_box` — still referenced; must remain until an explicit remapping task moves the Liquid `t:` ref (out of scope here).

---

## Final schema translation count

| Metric | Before cleanup | After cleanup |
|---|---:|---:|
| `en.default.schema.json` leaf values | 2,327 | **2,326** |
| Shopify limit | 3,400 | 3,400 |
| Headroom | 1,073 | **1,074** |

Non-English schema files remain at **2,323** leaves (English still has the same **3** pre-existing EN-only `.info` keys documented in the Phase A validation report). Cleanup did not change that gap.

---

## Behavior confirmation

| Surface | Changed? |
|---|---|
| Section / snippet / config Liquid | **No** |
| JavaScript / CSS | **No** |
| Schema `t:` label / info / default / placeholder / preset refs | **No** |
| Theme Editor visible strings | **No** — removed key was never referenced |
| Storefront rendering | **No** |

Cleanup deleted only an unused locale leaf. Merchant-facing defaults, help text, placeholders, and presets were not migrated.

---

## Files touched

- `locales/*.schema.json` (20 files) — deleted `nether.common.ui.labels.sticky_buy_box_nether` only
- Analysis helpers (not theme assets):
  - `.nether-analysis/loc_phase_a_cleanup_scan.py`
  - `.nether-analysis/loc_phase_a_cleanup_apply.py`

---

## Stop

Phase A cleanup is complete. **Do not begin Phase B** until explicit approval.
