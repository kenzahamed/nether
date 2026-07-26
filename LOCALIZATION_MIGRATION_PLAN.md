# Nether Localization Migration Plan (Phase 3 — tightened Phase A)

> **Status: Phase A applied.** See `LOCALIZATION_PHASE_A_REPORT.md` for outcomes.
> This file is regenerated from the **post-migration** schema (`py .nether-analysis/loc_generate.py`).
> Pre-migration Old→New mappings are preserved in git history of this file / inventory CSV from the design pass.

## 1. Outcome estimate
- **Before:** 2327 values
- **Phase A remappable label refs:** 0
- **Canonical shared keys required:** 0
- **After Phase A (estimate):** ~2327 values
- **Headroom below 3,400:** ~1073 values

## 2. Migration mechanic
For each mapping below, liquid/schema `t:` references on **label** fields are repointed to the canonical shared key. The old section-local label key is removed only if nothing else references it. `.default` / `.info` / presets / placeholders keep their local keys even when English matches.

## 3. Shared vocabulary catalog (Phase A)
| New shared key | English value | # label refs |
|---|---|---:|

## 4. Complete Old Key → New Key mapping (Phase A labels only)
