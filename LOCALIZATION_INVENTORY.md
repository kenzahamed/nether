# Nether Localization Inventory (Phase 2)
> Tightened Phase A gates (§8.1): only structural `.label` leaves auto-remap.
> `.default` / `.info` / presets / placeholders / `settings_schema` / `sections.all` are excluded.
> Regenerate with `py .nether-analysis/loc_generate.py`.

## 1. Totals
- **Total schema translation values:** 2327
- **Distinct English values:** 1576
- **Shopify platform limit:** 3,400
- **Current overage:** -1073 values above the limit

## 2. Classification summary
| Classification | Values | Notes |
|---|---:|---|
| Section-specific | 1126 | |
| Merge Candidate | 623 | |
| Shared (excluded — merchant/content/info/preset) | 560 | |
| Section-specific (literal) | 18 | |
| **Phase A remappable (subset)** | **0** | Collapse toward **0** canonical keys |

## 3. Phase A estimate
- Removable duplicate label leaves: ~0
- New nested shared keys to add: ~0
- **Estimated total after Phase A: ~2327**
- **Headroom below 3,400: ~1073**

## 4. Per-section Phase A footprint (top 30)
| Section namespace | Total keys | Phase A remappable labels |
|---|---:|---:|
| `sections.header` | 170 | 0 |
| `sections.nether_content` | 61 | 0 |
| `sections.main-product` | 58 | 0 |
| `sections.nether_bundles` | 54 | 0 |
| `sections.nether_media` | 52 | 0 |
| `sections.nether_commerce` | 48 | 0 |
| `sections.nether_recommendations` | 46 | 0 |
| `sections.nether_footer` | 43 | 0 |
| `sections.nether_hero` | 41 | 0 |
| `sections.nether_collection_page` | 41 | 0 |
| `sections.nether_collection` | 36 | 0 |
| `sections.nether_product_page` | 31 | 0 |
| `sections.announcement-bar` | 29 | 0 |
| `sections.all` | 26 | 0 |
| `sections.footer` | 23 | 0 |
| `sections.multicolumn` | 21 | 0 |
| `sections.nether_cart_page` | 21 | 0 |
| `sections.nether_compare_page` | 21 | 0 |
| `sections.nether_wishlist_page` | 20 | 0 |
| `sections.slideshow` | 18 | 0 |
| `sections.image-banner` | 18 | 0 |
| `sections.collage` | 17 | 0 |
| `sections.featured-product` | 17 | 0 |
| `sections.multirow` | 15 | 0 |
| `sections.image-with-text` | 15 | 0 |
| `sections.nether_cart_drawer` | 14 | 0 |
| `sections.featured-collection` | 14 | 0 |
| `sections.rich-text` | 14 | 0 |
| `sections.collapsible_content` | 13 | 0 |
| `sections.main-collection-product-grid` | 13 | 0 |

## 5. Deprecated keys

None.

## 6. Full classification data
See **`LOCALIZATION_INVENTORY.csv`** (`phase_a_remappable` column).
