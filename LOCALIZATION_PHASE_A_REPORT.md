# Nether Localization Phase A — Implementation Report

## Gate (approved modification)

Tightened §8.1 before any remapping:

| Auto-remap | Excluded unless explicitly reviewed |
|---|---|
| Structural `.label` (settings + options) | `.default`, `.info`, `.placeholder` |
| Layout / motion / typography / generic controls | `.presets.*` |
| | `settings_schema.*`, `sections.all.*` |
| | Other merchant-facing content |

Liquid/JSON rewrites applied **only** to `"label": "t:…"` fields.

## Results

| Metric | Value |
|---|---:|
| Schema files with rewritten label `t:` refs | 31 + 21 hyphen fixup + 46 ui-namespace move |
| Label `t:` references rewritten (Phase A) | ~2,483 final nested `ui.*` refs |
| Canonical shared keys | 440 under `nether.common.ui.*` |
| **`en.default.schema.json` values before** | **3,699** |
| **`en.default.schema.json` values after** | **2,327** |
| **Headroom below 3,400** | **1,073 (~31.5%)** |
| Shopify limit cleared | Yes |

## Namespace

Shared structural vocabulary lives at:

`t:nether.common.ui.<domain>.<concept>`

Domains: `layout`, `sizing`, `typography`, `media`, `motion`, `actions`, `states`, `commerce`, `content`, `labels`.

Legacy flat keys such as `nether.common.layout` (“Layout”) and `nether.common.content` (“Content”) were **restored** and left intact so existing info/group refs keep working.

## Merchant-content exclusion verification

- `.default` refs remain on section-local keys (e.g. `t:sections.nether_hero.blocks.heading.settings.heading.default`).
- `.info` refs remain on local or legacy `nether.common.info_*` keys — **not** on Phase A `ui.*` vocabulary.
- Presets / placeholders were not remapped.

## Fixes applied during implementation

1. **Hyphenated section namespaces** — `t:` matcher updated to allow `-` (`announcement-bar`, `image-with-text`, …) so Dawn-style keys remapped correctly.
2. **Flat-key collision** — nested domains moved under `nether.common.ui.*` so they do not overwrite legacy flat strings.

## Out of scope / pre-existing

- `settings_schema.social-media.*` references in `config/settings_schema.json` remain missing from locale schema files (pre-existing; Tier 1 untouched by Phase A).
- Merge Candidates and excluded Shared English (`.info` / defaults) left for Phase B review.

## Notes

- No section/snippet/JS/CSS files were deleted or renamed.
- Wording was not changed; per-locale translations were copied from donor keys.
- Analysis/apply scripts live in `.nether-analysis/` (not uploaded as theme assets).
