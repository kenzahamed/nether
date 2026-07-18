# Nether Framework — Card Style Contracts

**Milestone:** Framework Stabilization  
**Phase:** 2C — Cards (contracts)  
**Date:** 2026-07-18  
**Status:** Locked for Phase 2+

`nether_card_style`, `nether_media_style`, and block `card_style` are **not one system**. Same option labels may appear in schemas, but meanings differ by framework. Do not force FAQ/Testimonials through showcase size APIs. Do not rename setting IDs.

---

## 1. Showcase cards (Product / Collection / Media)

| Setting ID | Sections |
|------------|----------|
| `nether_card_style` | Product showcase, Collection showcase, Collection page (premium path) |
| `nether_media_style` | Media showcase (same option set; Media-prefixed ID) |

| Value | Meaning | Liquid / CSS effect |
|-------|---------|---------------------|
| `small` / `medium` / `large` | Card size | `--size-*` modifier classes (medium = default, no size class) |
| `editorial` | Size + premium chrome | `--size-editorial` + `card--premium-editorial` |
| `glass` | Premium chrome | `card--premium-glass` (+ `--style-glass` wrapper class) |
| `gradient` | Premium chrome | `card--gradient-border` (existing premium utility; not a silent no-op) |
| `minimal` | Premium chrome | `card--premium-minimal` |

**Separate toggles (not card style):**

| Setting | Effect |
|---------|--------|
| `nether_enable_glass` | Glass panel (`glass-card-light`) + `--glass` wrapper class |
| `nether_enable_gradient` | Overlay uses `nether_gradient_style` → `.grad-*` utilities |

Dawn `card-product` path on Collection page / Product showcase remains independent.

---

## 2. FAQ item style

| Setting ID | Section |
|------------|---------|
| `nether_card_style` | FAQ |

| Value | Meaning | CSS |
|-------|---------|-----|
| `small` / `medium` / `large` | Item density / floating pairing | Floating rules target medium/large |
| `editorial` | Question typography emphasis | `.nether-faq__item--style-editorial` |
| `glass` | Item panel glass treatment | `.nether-faq__item--style-glass` |
| `gradient` | Item panel gradient fill | `.nether-faq__item--style-gradient` |
| `minimal` | Borderless / transparent item | `.nether-faq__item--style-minimal` |

Applied as `nether-faq__item--style-{{ value }}` on each FAQ item. **Not** showcase size or `card--premium-*`.

---

## 3. Testimonials card style

| Setting ID | Section |
|------------|---------|
| `nether_card_style` | Testimonials |

| Value | Meaning | Effect |
|-------|---------|--------|
| `small` / `medium` / `large` | Layout density class | `--style-{value}` (editorial/minimal have dedicated CSS) |
| `editorial` | Quote emphasis | `.nether-testimonials-card--style-editorial` |
| `minimal` | Flattened inner | `.nether-testimonials-card--style-minimal` |
| `glass` | Glass surface | Applies `--glass` (same as enable toggle path) |
| `gradient` | Gradient surface | Applies `--gradient` (same as enable toggle path) |

`nether_enable_glass` / `nether_enable_gradient` remain valid and compose with style (OR with `glass` / `gradient` style values).

---

## 4. Block `card_style` (Hero family content cards)

| Setting ID | Blocks |
|------------|--------|
| `card_style` | Hero / Banner / Content / CTA card blocks; mega menu cards (Header-local options) |

| Typical values | Meaning |
|----------------|---------|
| `default` / `elevated` / `glass` / `outline` | Premium chrome via `snippets/card.liquid` → `card--premium-{{ style }}` |

Independent of showcase `nether_card_style`. Do not rename to unify with showcase options in this milestone.

---

## 5. Compatibility rules

- No schema ID renames.
- No public BEM renames.
- FAQ / Testimonials / Showcase implementations stay independent.
- Dual Dawn + premium product card paths stay intentional.
- Intensity / new premium card variants are out of Phase 2 scope.

---

**End of FRAMEWORK_CARD_STYLE_CONTRACTS.md**
