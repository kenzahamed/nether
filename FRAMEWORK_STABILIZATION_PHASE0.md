# Nether Framework — Stabilization Phase 0 Contracts

**Milestone:** Framework Stabilization  
**Phase:** 0 — Contracts & freeze  
**Date:** 2026-07-18  
**Status:** Locked for Phase 1+

These decisions are the approved contracts for Framework Stabilization. Implementers must not re-litigate them without a Compatibility Rules exception.

---

## 1. Heading policy

| Rule | Contract |
|------|----------|
| Hero default | `heading_tag = 'h1'`; merchant may set `h2` via `nether_heading_level` |
| Other presentation sections | Default `h2`; optional `h3` via `nether_heading_level` (Banner/Content use prefixed IDs) |
| Multiple Hero H1 | Merchant responsibility — set secondary Heroes to `h2`; no auto-demote |
| FAQ questions | Honor section `heading_tag` (passed into `nether-faq-item`); visual class remains `h4` |
| FAQ categories | Block `heading_level` stays independent |
| Visual size | `heading_size` / Dawn `h0`–`h5` classes stay independent of semantic tag |

---

## 2. Image ratio mapping table (Product / Collection / Media)

| Setting value | Numeric ratio | Notes |
|---------------|---------------|-------|
| `portrait` | `0.8` | Requires image in media snippets; placeholders apply without image |
| `landscape` | `1.4` | Same branch in all three media snippets |
| `square` | `1` | |
| `adapt` | image `aspect_ratio` | Fallback `1` when missing/zero; placeholders use `1` |

**CSS emission:** Dawn `.ratio` + `--ratio-percent: {{ 1 | divided_by: ratio | times: 100 }}%`

**Content framework:** Continues using CSS `aspect-ratio` classes — intentional independence (do not converge in Phase 1).

---

## 3. Collection page ratio contract

| Path | Setting ID | Behavior |
|------|------------|----------|
| Dawn cards | `image_ratio` | Unchanged — passed as `media_aspect_ratio` |
| Premium cards | Dual-read | `nether_image_ratio` → else `image_ratio` → else `portrait` |

**No schema ID rename.** Existing theme JSON keeps working.

---

## 4. Theme Editor reload standard

```js
if (event.detail?.sectionId) {
  if (event.detail.sectionId !== this.dataset.sectionId) return;
} else if (!(event.target?.contains?.(this) || event.target === this)) {
  return;
}
```

- Primary: `event.detail.sectionId === this.dataset.sectionId`
- Fallback: `event.target.contains(this)` only when `sectionId` is missing

---

## 5. Placeholder honesty (deferred product decisions)

| Surface | Phase 0 policy |
|---------|----------------|
| Countdown (Banner/Newsletter/CTA) | Documented; ship/hide deferred past Phase 1 |
| Media lightbox | Documented; ship/hide deferred past Phase 1 |
| Product sources `best_sellers` / `trending` | Previously stabilized separately; out of Phase 1 scope |

---

## 6. Breakpoint contract

| Layer | Tablet | Desktop |
|-------|--------|---------|
| CSS (section layouts) | `750px` | `990px` |
| Motion Engine | `749` / `989` (max-width style) | Align callers in later phases; document only in Phase 0 |

Nether internal alignment is a later-phase concern unless a Phase 1 change touches breakpoints (Phase 1 did not).

---

## 7. Position `center` (collection page)

Schema value `center` is retained (no ID rename). Liquid aliases `center` → `middle-center` when building `nether-*-card--position-*` classes so existing merchant JSON works and showcase CSS applies.

---

## 8. Do-not-touch (signed off)

See `FRAMEWORK_STABILIZATION_PLAN.md` §4. Phase 1 must not refactor Motion Engine core, design tokens, Dawn primitives, Hero hub role, Banner/Content setting ID prefixes, Header/Footer/Commerce architecture, or glass/gradient intensity schema wiring.

---

**End of FRAMEWORK_STABILIZATION_PHASE0.md**
