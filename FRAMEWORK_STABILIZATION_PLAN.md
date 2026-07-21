# Nether Framework — Stabilization Plan

**Milestone:** Framework Stabilization  
**Phase:** Planning only (no implementation)  
**Date:** 2026-07-18  
**Source of truth:**  
`FRAMEWORK_ARCHITECTURE.md` · `FRAMEWORK_DEPENDENCIES.md` · `FRAMEWORK_SETTINGS_MAP.md` · `FRAMEWORK_SHARED_SYSTEMS.md`

**Governing constraint:** Eliminate framework inconsistencies while preserving the existing architecture. The architecture itself is **not** being redesigned.

---

## 0. Stabilization principles

| Principle | Rule |
|-----------|------|
| Preserve composition | Keep Hero-composed family, Showcase/grid family, Commerce/page family, Chrome family |
| Preserve Dawn dependency | Do not replace Dawn primitives (`.button`, `.card`, `.ratio`, color schemes, deferred-media, sliders) |
| Standardize wiring, not product surface | Unify duplicated Liquid/CSS/JS *patterns*; keep framework-specific schemas and class prefixes where they exist |
| Prefer contracts over merges | Fix setting → snippet → CSS → JS contracts before collapsing files |
| One bug, one place | When a system is duplicated, either centralize the shared leaf or document intentional independence |
| No speculative scope | Only problems evidenced in the audits |

---

## Framework Compatibility Rules

Stabilization must preserve merchant-facing and developer-facing public interfaces. Behavior may be corrected; contracts must not break casually.

| Rule | Requirement |
|------|-------------|
| No schema ID renames | Do not rename setting IDs unless absolutely required to fix a Critical contract (prefer aliases, adapters, or dual-read). Banner/Content prefixes stay. |
| No snippet API changes | Do not change snippet parameter names, required args, or render contracts unless required to fix a Critical shared-leaf contract. Prefer additive params with defaults. |
| No CSS class contract changes | Do not rename or remove public BEM/modifier classes (`nether-*--position-*`, `--align-*`, glass/gradient utilities, etc.) unless required. Prefer adding missing rules over renaming. |
| No breaking changes to merchant settings | Existing theme JSON / section settings must keep working. Dead settings may be fixed or hidden per Phase 0 policy — not silently remapped to unrelated behavior. |
| Standardize behavior, not public interfaces | Unify Liquid/CSS/JS *behavior* and wiring. Keep schema IDs, class prefixes, and snippet call sites stable unless a gate-approved exception is documented. |

**Exception process:** Any required break must be called out in the phase PR, listed against these rules, and covered by that phase’s Completion Gate before the next phase starts.

---

## 1. System-by-system analysis

For each system: architecture → problems (audit-backed) → duplication → standardize? → independence → priority → risk → impact → regression tests.

---

### 1.1 Heading System

**1. Current Architecture**  
Each presentation section assigns `heading_tag` locally from `nether_heading_level` (or prefixed Banner/Content IDs). Block dispatchers render `<{{ heading_element }}>`. Visual size comes from Dawn size classes (`h0`–`h5`), independent of the semantic tag. FAQ categories honor block `heading_level`; FAQ questions use hardcoded `<h3>` in `nether-faq-item`.

**2. Current Problems**  
- Heading tag logic copy-pasted per section (`FRAMEWORK_SETTINGS_MAP` §16.1).  
- FAQ questions ignore section heading level.  
- Multiple Hero sections can each default to `<h1>`.  
- Visual size ≠ semantic level (merchant confusion).

**3. Duplication Level**  
Partially duplicated (shared pattern; per-section Liquid).

**4. Should it be standardized?**  
**YES** — same merchant control must produce consistent semantic outcomes across presentation sections and FAQ questions.

**5. Should it remain independent?**  
Section *defaults* may differ (Hero → `h1`, others → `h2`). FAQ category block `heading_level` stays independent. Do not force one schema ID across Banner/Content prefixes in this milestone.

**6. Priority**  
Critical

**7. Implementation Risk**  
Medium — changing FAQ question tags affects document outline and Theme Editor previews; Hero H1 policy needs an explicit rule.

**8. Expected Impact**  
- Merchant: heading level setting works where promised  
- Developer: one heading assign/contract  
- Maintainability: fewer heading drift bugs  
- QA: fewer “heading doesn’t change” tickets  
- Accessibility: clearer heading hierarchy  
- Theme Editor: predictable heading previews  

**9. Regression Tests Required**  
Hero, Banner, Content, FAQ (section header + accordion questions + categories), Collection, Product, Media, Testimonials, Newsletter, CTA — verify tag + visual size independently.

---

### 1.2 Typography

**1. Current Architecture**  
Centralized CSS (`component-typography.css`) + theme font/scale tokens in `theme.liquid`. Sections compose `.type-*` utilities with Dawn heading size classes.

**2. Current Problems**  
No typography CSS duplication issues in audits. Problems are heading *element* choice (covered in §1.1), not type scale.

**3. Duplication Level**  
Centralized (CSS). Heading element choice duplicated (see Heading System).

**4. Should it be standardized?**  
**NO** for the CSS/token layer — already centralized.  
Heading tag wiring: YES via Heading System.

**5. Should it remain independent?**  
Yes — keep typography CSS and theme tokens as global SOT.

**6. Priority**  
Low (as a standalone workstream)

**7. Implementation Risk**  
Low — avoid churning type tokens unless required by heading work.

**8. Expected Impact**  
Maintainability via *not* touching a stable layer; a11y gains come from heading fixes, not font CSS.

**9. Regression Tests Required**  
Spot-check type scale on Hero + one showcase after any heading-related class changes only.

---

### 1.3 Section Header System

**1. Current Architecture**  
Per-framework content/shell + block dispatcher trio (`nether-*-content` / `nether-*-block`). Shared behavior: eyebrow / heading / subheading / text / buttons with framework class prefixes. Not a single shared snippet.

**2. Current Problems**  
Parallel implementations cause “same bug, different section” for heading/buttons cases (`FRAMEWORK_SHARED_SYSTEMS` §6, §11).

**3. Duplication Level**  
Fully duplicated (parallel trios).

**4. Should it be standardized?**  
**YES** for *contracts* (heading tag pass-through, button markup, alignment modifiers).  
**NO** for collapsing all shells into one mega-snippet in this milestone — architecture preserves per-framework BEM prefixes.

**5. Should it remain independent?**  
Framework shells and class prefixes remain independent. Shared leaf behaviors (heading render rules, button markup) should converge.

**6. Priority**  
High

**7. Implementation Risk**  
High if merged aggressively; Medium if standardized via shared snippets/params without renaming BEM.

**8. Expected Impact**  
Developer/QA consistency for headers; merchant settings behave the same across frameworks.

**9. Regression Tests Required**  
All presentation frameworks’ header blocks (eyebrow, heading, subheading, text, buttons) in Theme Editor + storefront.

---

### 1.4 Block Dispatcher System

**1. Current Architecture**  
One `nether-*-block.liquid` per framework with near-identical `case` trees and class-prefix swaps.

**2. Current Problems**  
Heading/tag logic and buttons markup copied; fixes do not propagate (`FRAMEWORK_DEPENDENCIES` §F; `FRAMEWORK_SETTINGS_MAP` §16.1, §13).

**3. Duplication Level**  
Fully duplicated.

**4. Should it be standardized?**  
**YES** — extract shared cases (eyebrow/heading/text/buttons) behind a parameterized snippet or documented contract; keep framework-specific block types local.

**5. Should it remain independent?**  
Framework-unique blocks (FAQ item, countdown, media card cases, commerce-only cases) stay independent.

**6. Priority**  
High

**7. Implementation Risk**  
High — Liquid render params and Theme Editor block schemas are brittle; do after Heading/Alignment contracts are defined.

**8. Expected Impact**  
Maintainability and QA: one fix for shared block types; merchant button/heading parity.

**9. Regression Tests Required**  
Every presentation section that uses a block dispatcher; especially Hero, Banner, Content, FAQ, CTA, Product, Collection.

---

### 1.5 Divider System

**1. Current Architecture**  
Thirteen near-identical `nether-*-divider.liquid` files across presentation, commerce, and page frameworks.

**2. Current Problems**  
A11y attributes / class names drift; fixes don’t propagate (`FRAMEWORK_ARCHITECTURE` §4; `FRAMEWORK_SETTINGS_MAP` §16.9).

**3. Duplication Level**  
Fully duplicated.

**4. Should it be standardized?**  
**YES** — single shared divider snippet with framework class prefix param (or thin wrappers calling one core).

**5. Should it remain independent?**  
Only if a framework needs unique markup; audits show near-identity, so independence is not justified.

**6. Priority**  
Medium

**7. Implementation Risk**  
Low–Medium — mostly markup consolidation; low behavioral surface.

**8. Expected Impact**  
Maintainability, a11y consistency, fewer duplicate QA fails.

**9. Regression Tests Required**  
Any section with a divider block enabled (Banner, Content, Media, Testimonials, FAQ, Newsletter, CTA, Collection, Product, plus page/commerce dividers if touched).

---

### 1.6 Card System (Dawn + Premium)

**1. Current Architecture**  
Layered: Dawn `component-card.css` + `card-product`; premium `component-card-premium.css`; framework modifiers (`nether_card_style`, block `card_style`).

**2. Current Problems**  
`nether_card_style` means different things (showcase size/editorial vs FAQ item style vs premium chrome) (`FRAMEWORK_SETTINGS_MAP` §16.5).

**3. Duplication Level**  
Partially duplicated (premium CSS centralized; meanings of settings diverge).

**4. Should it be standardized?**  
**YES** for *setting semantics and documentation/contracts* (what each ID does).  
**NO** for forcing FAQ item styles through showcase card size APIs.

**5. Should it remain independent?**  
FAQ item styles, testimonials cards, and showcase cards remain separate implementations; premium utilities stay global.

**6. Priority**  
High (contract clarity); Medium (code consolidation)

**7. Implementation Risk**  
Medium — renaming settings has Theme Editor / translation blast radius; prefer aliases/docs + consistent application paths first.

**8. Expected Impact**  
Merchant clarity; developer safer reuse of premium CSS; QA fewer “wrong card style” reports.

**9. Regression Tests Required**  
Product showcase, Collection showcase, Collection page (Dawn + premium paths), FAQ items, Testimonials cards, Hero/Banner/Content/CTA block cards.

---

### 1.7 Product Card

**1. Current Architecture**  
Showcase: `nether-product-card` + `nether-product-media` + showcase CSS. Dawn path: `card-product`. Collection page may load showcase CSS and choose Dawn vs premium path.

**2. Current Problems**  
Collection page premium path ignores schema `image_ratio` because media reads `nether_image_ratio` (`FRAMEWORK_SETTINGS_MAP` §5, §16.2). Product media omits `landscape` branch.

**3. Duplication Level**  
Partially duplicated (two card stacks intentionally; ratio mapping duplicated).

**4. Should it be standardized?**  
**YES** for media ratio / setting contract with collection page.  
**NO** for merging showcase card into Dawn `card-product`.

**5. Should it remain independent?**  
Showcase product card stays independent of Dawn card; both remain.

**6. Priority**  
Critical (collection page ratio contract)

**7. Implementation Risk**  
Medium — touches collection page grid + product media shared by product showcase.

**8. Expected Impact**  
Merchant image ratio works in premium collection page mode; QA consistency; maintainability of card contract.

**9. Regression Tests Required**  
`nether-product`, `nether-collection-page` (Dawn + premium card modes), recommendations/embeds using product media if shared.

---

### 1.8 Collection Card

**1. Current Architecture**  
`nether-collection-card` + `nether-collection-media` + `component-collection-showcase.css`. Parallel to product showcase.

**2. Current Problems**  
Near-duplicate position/align/ratio/motion with Product/Media; landscape ratio omitted like product media (`FRAMEWORK_ARCHITECTURE` §2.2, §4; `FRAMEWORK_SETTINGS_MAP` §16.2, §16.4).

**3. Duplication Level**  
Fully duplicated vs Product showcase patterns.

**4. Should it be standardized?**  
**YES** for shared layout/ratio/motion *contracts* with Product/Media.  
**NO** for deleting collection-specific card chrome.

**5. Should it remain independent?**  
Card markup/branding may stay collection-specific; shared media ratio mapper and layout CSS patterns should converge.

**6. Priority**  
High

**7. Implementation Risk**  
Medium–High when aligning CSS with product/media (visual drift).

**8. Expected Impact**  
Same position/align/ratio behavior as sibling showcases; lower maintenance cost.

**9. Regression Tests Required**  
`nether-collection` all layouts, card styles, positions, alignments, ratios; CTA collection highlight if it reuses snippets.

---

### 1.9 Image Ratio System

**1. Current Architecture**  
Dawn `.ratio` + `--ratio-percent` in `base.css`. Showcase media snippets map settings → numeric ratio. Content images use CSS `aspect-ratio` classes instead. Placeholders often hardcode `125%`.

**2. Current Problems**  
- Product/Collection media: no `landscape` (falls through to square).  
- Media render: landscape `1.4`.  
- Two mechanisms (padding-ratio vs aspect-ratio).  
- Collection page `image_ratio` vs `nether_image_ratio` mismatch.  
- Placeholder ignores setting (`FRAMEWORK_SETTINGS_MAP` §5, §16.2).

**3. Duplication Level**  
Partially duplicated (Dawn primitive centralized; mappers duplicated; Content uses alternate mechanism).

**4. Should it be standardized?**  
**YES** — one mapping table for showcase media; fix collection page contract; align placeholder behavior. Document Content’s aspect-ratio path as intentional or converge later.

**5. Should it remain independent?**  
Hero `adapt` height logic stays independent. Content image aspect-ratio may remain independent in Phase 1 if documented.

**6. Priority**  
Critical

**7. Implementation Risk**  
Medium — visual change to cards when landscape/adapt/placeholder corrected.

**8. Expected Impact**  
Merchant ratio settings reliable; QA; Theme Editor consistency; slight layout performance predictability.

**9. Regression Tests Required**  
Collection, Product, Media showcases; Collection page premium/Dawn; Content image blocks if touched; Bundles/Recommendations ratio settings if shared mappers.

---

### 1.10 Media System

**1. Current Architecture**  
Three tracks: (1) `nether-hero-media` adapters for hero family backgrounds; (2) showcase media snippets; (3) Media framework (`nether-media-render`, lightbox markup, before/after).

**2. Current Problems**  
Parallel ratio/position patterns; Media lightbox markup without JS controller; countdown-adjacent placeholders elsewhere not media-specific (`FRAMEWORK_SETTINGS_MAP` §16.8).

**3. Duplication Level**  
Partially duplicated (hero-media centralized; showcase media parallel).

**4. Should it be standardized?**  
**YES** for ratio/layout contracts with Product/Collection.  
**NO** for forcing Media showcase to inherit Hero CE.

**5. Should it remain independent?**  
Media framework (lightbox, before/after, gallery) remains its own framework. Hero-media stays the background media hub.

**6. Priority**  
High (contracts); Medium (lightbox — decide ship or hide)

**7. Implementation Risk**  
Medium for contracts; High if implementing lightbox from scratch (out of “stabilize wiring” unless scoped as complete or remove).

**8. Expected Impact**  
Consistent media framing; merchant honesty about lightbox; maintainability.

**9. Regression Tests Required**  
`nether-media` (all media types, ratios, lightbox toggle), Hero family background media via adapters, Product/Collection media.

---

### 1.11 Motion Engine

**1. Current Architecture**  
Global `nether-motion.js` + presets + `nether-motion-config` from theme settings. Sections register via `NetherMotion.registerSection`. Pending/ready CSS per framework. Reduced-motion flags global.

**2. Current Problems**  
Engine is solid; problems are adapters/wiring (below). Engine itself not listed as broken.

**3. Duplication Level**  
Centralized (engine).

**4. Should it be standardized?**  
**NO** — already centralized. Stabilize callers, not the engine core.

**5. Should it remain independent?**  
Yes — treat Motion Engine as a do-not-churn core unless a wiring bug requires a narrow API extension.

**6. Priority**  
Low (engine core); Critical for adapters (see next)

**7. Implementation Risk**  
High if engine internals are refactored unnecessarily.

**8. Expected Impact**  
Stability by protecting the hub; a11y via existing reduced-motion flags.

**9. Regression Tests Required**  
Global motion on/off, reduced motion, mobile/desktop flags — after any adapter work that touches registration.

---

### 1.12 Motion Adapters

**1. Current Architecture**  
Each `component-*.js` reimplements reveal/parallax/pending orchestration and Theme Editor reload. Shared content leaves hardcode `data-nether-content-animate` + `data-nether-hero-animate` and ignore `motion_attr`. FAQ `handleSectionLoad` uses `event.target.contains(this)`; most use `event.detail.sectionId`.

**2. Current Problems**  
Fully audit-supported (`FRAMEWORK_SETTINGS_MAP` §12, §16.3; `FRAMEWORK_DEPENDENCIES` §F).

**3. Duplication Level**  
Fully duplicated (orchestration); engine centralized.

**4. Should it be standardized?**  
**YES** — Theme Editor reload predicate; `motion_attr` contract on shared leaves; pending/ready patterns; plugin flag condition lists where identical.

**5. Should it remain independent?**  
Animation *presets* and framework-namespaced data attributes can stay; parallax targets may differ per framework.

**6. Priority**  
Critical

**7. Implementation Risk**  
High — motion regressions are visual and intermittent; Theme Editor reload bugs are merchant-facing.

**8. Expected Impact**  
Theme Editor consistency; motion parity across sections; developer clearer adapter contract; a11y preserved via engine flags.

**9. Regression Tests Required**  
All motion-registered presentation CEs + FAQ Theme Editor reload + shared content leaves inside CTA/Newsletter/FAQ/Testimonials; Collection/Product/Media parallax layouts.

---

### 1.13 Theme Editor Integration

**1. Current Architecture**  
Section `shopify:section:load` handlers in framework JS; global CSS also re-linked per section for preview isolation; motion config from theme settings.

**2. Current Problems**  
FAQ reload predicate divergence; settings ID prefixes make cross-section comparisons error-prone; unwired surfaces (countdown, lightbox) still exposed (`FRAMEWORK_SETTINGS_MAP` §16.3, §16.8, §15).

**3. Duplication Level**  
Partially duplicated.

**4. Should it be standardized?**  
**YES** — one `handleSectionLoad` pattern; policy for placeholder blocks (hide from schema or implement); document prefixed IDs as intentional for Banner/Content.

**5. Should it remain independent?**  
Banner/Content prefixed setting IDs remain for this milestone (renaming = migration project). Section-specific preview CSS re-links may remain.

**6. Priority**  
Critical

**7. Implementation Risk**  
Medium — TE-only bugs; careful with sectionId matching for nested CEs.

**8. Expected Impact**  
Theme Editor consistency; merchant trust; QA reduction of “works until I change a setting” bugs.

**9. Regression Tests Required**  
Add/remove/reorder blocks; change animation/glass/heading for Hero, FAQ, Banner, Product; section duplicate/delete in editor.

---

### 1.14 Position System

**1. Current Architecture**  
Hero: `nether-hero--position-*` on section shell. Showcases: `nether-*-card--position-*` with parallel CSS. Collection page: reduced option set; `center` maps to `--position-center` with **no CSS rule**.

**2. Current Problems**  
Parallel showcase CSS; collection page dead option (`FRAMEWORK_SETTINGS_MAP` §3, §16.4).

**3. Duplication Level**  
Fully duplicated across Product/Collection/Media CSS; Hero separate.

**4. Should it be standardized?**  
**YES** for showcase 9-grid CSS (shared partial or identical rules). Fix collection page options/CSS contract.

**5. Should it remain independent?**  
Hero shell positioning stays independent of card positioning.

**6. Priority**  
Critical (collection page dead setting); High (showcase CSS sync)

**7. Implementation Risk**  
Medium — layout visual changes.

**8. Expected Impact**  
Merchant position controls work; Theme Editor honesty; maintainability.

**9. Regression Tests Required**  
Hero positions; Product/Collection/Media card positions; Collection page banner/content position options; CTA/Newsletter if they reuse position classes.

---

### 1.15 Alignment System

**1. Current Architecture**  
`nether_content_alignment` (and Banner prefix) → `*-align-{left|center|right}` on section and/or cards; CSS duplicated per framework.

**2. Current Problems**  
Parallel CSS, not imported from one file (`FRAMEWORK_SETTINGS_MAP` §4, §16.4).

**3. Duplication Level**  
Partially duplicated (pattern shared; CSS parallel).

**4. Should it be standardized?**  
**YES** — shared alignment utility layer or single imported rule set for showcases + hero family text alignment.

**5. Should it remain independent?**  
FAQ/Testimonials may keep framework-specific flex nuances if documented; merchant values remain left/center/right.

**6. Priority**  
High

**7. Implementation Risk**  
Medium — text/flex alignment drift.

**8. Expected Impact**  
Consistent alignment across sections; developer one place to fix.

**9. Regression Tests Required**  
Hero, Banner, Content, FAQ, Testimonials, CTA, Newsletter, Collection, Product, Media — all three alignments.

---

### 1.16 Grid System

**1. Current Architecture**  
Per-framework `--nether-*-columns-*` CSS vars from `nether_columns_*` (and Content prefixed). Carousels may read column counts in JS.

**2. Current Problems**  
Duplicated vars and breakpoint coupling (`FRAMEWORK_SETTINGS_MAP` §7, §16.6).

**3. Duplication Level**  
Partially duplicated.

**4. Should it be standardized?**  
**YES** for breakpoint tokens and column var *patterns*.  
**NO** for forcing one CSS var name across all frameworks in a breaking rename (optional aliasing later).

**5. Should it remain independent?**  
Content grid and Collection page Dawn columns remain distinct systems.

**6. Priority**  
Medium

**7. Implementation Risk**  
Medium — grid reflow / carousel math.

**8. Expected Impact**  
Maintainability; responsive consistency; QA.

**9. Regression Tests Required**  
Collection, Product, Media, FAQ, Testimonials, Content — desktop/tablet/mobile column settings; carousel layouts.

---

### 1.17 Responsive System

**1. Current Architecture**  
Breakpoints ~750 / 990 in CSS; Motion `BREAKPOINTS` 749 / 989; layout modifiers `nether_layout_*`; padding mobile `* 0.75`.

**2. Current Problems**  
Breakpoint values slightly inconsistent between CSS and Motion (`FRAMEWORK_ARCHITECTURE` §3.8; `FRAMEWORK_SETTINGS_MAP` §16.6). Duplicated column/layout wiring.

**3. Duplication Level**  
Partially duplicated.

**4. Should it be standardized?**  
**YES** — single documented breakpoint contract (CSS + Motion + section layouts).

**5. Should it remain independent?**  
Dawn’s own breakpoints remain; Nether should align *internally*.

**6. Priority**  
High

**7. Implementation Risk**  
Medium–High — off-by-one breakpoint changes can shift layouts at common device widths.

**8. Expected Impact**  
Responsive predictability; motion enablement parity; QA.

**9. Regression Tests Required**  
Resize/device tests at 749/750/989/990 for Hero, showcases, Motion mobile/desktop flags, section layouts.

---

### 1.18 Glass System

**1. Current Architecture**  
Central CSS `component-glass.css`. Enable flags + style `case` duplicated in sections/shells. Intensity CSS vars noted as future, not in `settings_schema`.

**2. Current Problems**  
Liquid enable/style cases diverge; prefixed Banner/Content IDs; intensity not theme-wired (`FRAMEWORK_SETTINGS_MAP` §10, §16.7, §16.8).

**3. Duplication Level**  
CSS centralized; Liquid partially duplicated.

**4. Should it be standardized?**  
**YES** for Liquid mapping cases (shared snippet or macro).  
**NO** for implementing intensity theme settings unless product asks (document as out of scope / future).

**5. Should it remain independent?**  
Header/commerce glass flags may stay local. CSS utilities stay global.

**6. Priority**  
High

**7. Implementation Risk**  
Medium — visual effect drift if case maps differ intentionally.

**8. Expected Impact**  
Visual consistency; merchant glass style parity; maintainability.

**9. Regression Tests Required**  
All sections with glass enable/style (Hero family + showcases + pages + header if touched).

---

### 1.19 Gradient System

**1. Current Architecture**  
Central `component-gradient.css` (`.grad-*`). Distinct from Dawn body `.gradient`. Overlay style cases duplicated. Intensity multipliers not theme-wired.

**2. Current Problems**  
Same as glass Liquid duplication; intensity unused (`FRAMEWORK_SETTINGS_MAP` §11, §16.7, §16.8).

**3. Duplication Level**  
CSS centralized; Liquid partially duplicated.

**4. Should it be standardized?**  
**YES** for overlay style Liquid mapping. Do not merge with Dawn `.gradient`.

**5. Should it remain independent?**  
Dawn color-scheme `.gradient` remains untouched. Intensity settings stay future unless scoped.

**6. Priority**  
High

**7. Implementation Risk**  
Medium — overlay appearance.

**8. Expected Impact**  
Overlay consistency; clearer separation from Dawn gradients; maintainability.

**9. Regression Tests Required**  
Hero family overlays + showcase gradient flags; verify Dawn color schemes unaffected.

---

### 1.20 Button System

**1. Current Architecture**  
Central `component-button.css` on Dawn `.button`. Markup patterns duplicated in block dispatchers and cards (sometimes `<span class="button">` inside `<a>`).

**2. Current Problems**  
CSS OK; markup duplication in dispatchers (`FRAMEWORK_DEPENDENCIES` §A3; `FRAMEWORK_SETTINGS_MAP` §13).

**3. Duplication Level**  
CSS centralized; markup partially duplicated.

**4. Should it be standardized?**  
**YES** for button markup in shared dispatcher cases.  
**NO** for redesigning button variants.

**5. Should it remain independent?**  
Theme button tokens and CSS stay as-is.

**6. Priority**  
Medium

**7. Implementation Risk**  
Low–Medium — markup-only if CSS untouched.

**8. Expected Impact**  
Developer DX; a11y of link/button patterns; motion stagger targets consistent.

**9. Regression Tests Required**  
Buttons blocks across presentation sections; card CTAs on Product/Collection/Media.

---

### 1.21 Padding System

**1. Current Architecture**  
Identical `{% style %}` block per section: `.section-{{ id }}-padding` with mobile `* 0.75` from `padding_top` / `padding_bottom`.

**2. Current Problems**  
Pure duplication of Liquid; behavior consistent (`FRAMEWORK_ARCHITECTURE` §4; `FRAMEWORK_SETTINGS_MAP` §9).

**3. Duplication Level**  
Fully duplicated (pattern identical).

**4. Should it be standardized?**  
**YES** — shared snippet for padding style emission (behavior-preserving).

**5. Should it remain independent?**  
Theme `--spacing-sections-*` remains separate (between-section spacing).

**6. Priority**  
Medium

**7. Implementation Risk**  
Low — mechanical extraction.

**8. Expected Impact**  
Maintainability; identical merchant padding behavior.

**9. Regression Tests Required**  
Padding top/bottom on a sample of sections (Hero, Product, FAQ, Cart) at mobile and desktop.

---

### 1.22 Spacing System

**1. Current Architecture**  
Theme tokens `--spacing-sections-*`, `--grid-*` from `settings_schema` via `theme.liquid`; section padding separate.

**2. Current Problems**  
No audit finding that spacing tokens are broken.

**3. Duplication Level**  
Centralized (tokens).

**4. Should it be standardized?**  
**NO** — already centralized. Coordinate with Padding System only.

**5. Should it remain independent?**  
Yes.

**6. Priority**  
Low

**7. Implementation Risk**  
Low if left alone; High if token names change.

**8. Expected Impact**  
Stability.

**9. Regression Tests Required**  
None unless tokens change.

---

### 1.23 Design Tokens

**1. Current Architecture**  
`:root` CSS variables from `theme.liquid` + `settings_schema` (colors, fonts, page width, card/media/button tokens).

**2. Current Problems**  
Glass/gradient intensity multipliers exist in CSS comments without schema wiring — incomplete future surface, not a broken token core.

**3. Duplication Level**  
Centralized.

**4. Should it be standardized?**  
**NO** for restructuring tokens. Optionally document unwired intensity vars as non-goals for this milestone.

**5. Should it remain independent?**  
Yes — foundational SOT.

**6. Priority**  
Low (protect)

**7. Implementation Risk**  
High if renamed/restructured.

**8. Expected Impact**  
Preserve merchant theme settings stability.

**9. Regression Tests Required**  
Color scheme + page width smoke tests only if anything near `theme.liquid` is touched.

---

### 1.24 Hero Framework

**1. Current Architecture**  
Compositional hub: `nether-hero` + `component-hero.*` + `nether-hero-media` adapters. Consumed by Banner, Content, FAQ, Testimonials, Newsletter, CTA.

**2. Current Problems**  
Consumers inherit preamble duplication; heading H1 default risk; motion attr issues in shared leaves used by consumers. Hub itself is the right architecture.

**3. Duplication Level**  
Hub centralized; consumer wiring partially duplicated.

**4. Should it be standardized?**  
**YES** for shared consumer contracts (media adapter, motion leaves, preamble helpers).  
**NO** for redesigning Hero as a different hub.

**5. Should it remain independent?**  
Hero remains the hub; do not fold Showcase family into Hero.

**6. Priority**  
High (as hub of Phase 1 wiring)

**7. Implementation Risk**  
High if Hero internals churn — prefer additive shared helpers.

**8. Expected Impact**  
All hero-family sections stabilize together; maintainability of the main compositional model.

**9. Regression Tests Required**  
Hero + all six consumers (Banner, Content, FAQ, Testimonials, Newsletter, CTA) for media, overlays, glass/gradient, motion, headings.

---

### 1.25 Banner Framework

**1. Current Architecture**  
Extends Hero (CSS/JS/media adapter). Settings use `nether_banner_*` prefixes. Countdown snippet always `hidden`; Banner JS still queries countdown nodes.

**2. Current Problems**  
Naming drift (intentional-but-costly); countdown placeholder (`FRAMEWORK_SETTINGS_MAP` §15, §16.8).

**3. Duplication Level**  
Extends Hero (good); countdown duplicated with Newsletter/CTA.

**4. Should it be standardized?**  
**YES** for countdown policy and shared wiring helpers.  
**NO** for renaming all `nether_banner_*` IDs in this milestone.

**5. Should it remain independent?**  
Prefixed settings stay; Banner-specific countdown/promos stay Banner-owned until a real countdown system ships.

**6. Priority**  
High (TE/countdown honesty); Medium (prefix migration — defer)

**7. Implementation Risk**  
Medium.

**8. Expected Impact**  
Merchant honesty in Theme Editor; alignment with Hero contracts.

**9. Regression Tests Required**  
Banner media/position/alignment/animation/glass; countdown block visibility/behavior decision.

---

### 1.26 Content Framework

**1. Current Architecture**  
Hero-composed; exports shared leaves (`nether-content-image/video/html/quote`). Prefixed `nether_content_*` settings. Own grid/columns.

**2. Current Architecture note**  
Leaves ignore `motion_attr` while parents pass it — cross-framework bug source.

**3. Current Problems**  
Motion attr contract; dual animate attributes; ratio mechanism differs from showcase (`FRAMEWORK_SETTINGS_MAP` §12, §16.2, §16.3).

**4. Duplication Level**  
Leaves shared (centralized); section preamble duplicated.

**5. Should it be standardized?**  
**YES** for leaf motion/ratio contracts. Setting ID prefix rename: **NO** this milestone.

**6. Should it remain independent?**  
Content layout/grid stays Content-specific.

**7. Priority**  
Critical (leaf contracts affect many frameworks)

**8. Implementation Risk**  
High — leaves used by FAQ/CTA/Newsletter/Testimonials.

**9. Expected Impact**  
Motion correctness across hero family; maintainability of shared content atoms.

**10. Regression Tests Required**  
Content section + every consumer of content leaves (CTA, Newsletter, FAQ, Testimonials).

---

### 1.27 Collection Framework (showcase)

**1. Current Architecture**  
Parallel showcase (not Hero-inherited). Near-duplicate of Product/Media for layout/motion.

**2. Current Problems**  
Duplication hotspot with Product; ratio/landscape; parallel CSS (`FRAMEWORK_DEPENDENCIES` §B9, §F).

**3. Duplication Level**  
Fully duplicated vs Product showcase patterns.

**4. Should it be standardized?**  
**YES** for shared showcase layout/motion/ratio layers. Keep collection card content model.

**5. Should it remain independent?**  
Yes as a framework; no merge into Product section.

**6. Priority**  
High

**7. Implementation Risk**  
Medium–High (visual parity work).

**8. Expected Impact**  
Bugfix propagation; merchant parity with Product showcase.

**9. Regression Tests Required**  
Full Collection showcase matrix (layout, columns, card style, glass, motion, ratio, position, alignment).

---

### 1.28 Product Framework (showcase)

**1. Current Architecture**  
Parallel to Collection; richer commerce hooks (quick-add, wishlist, compare, product sources). Source modes `best_sellers` / `trending` treated as generic collection loops for some paths.

**2. Current Problems**  
Showcase duplication; ratio mapping; product source modes incomplete (`FRAMEWORK_SETTINGS_MAP` §16.2, §16.8).

**3. Duplication Level**  
Fully duplicated vs Collection for layout stack; commerce hooks unique.

**4. Should it be standardized?**  
**YES** for layout/ratio/motion shared with Collection/Media.  
Product source selection: standardize behavior or remove/hide unwired modes.

**5. Should it remain independent?**  
Commerce actions, quick-add, secondary image remain Product-specific.

**6. Priority**  
High (layout); Medium (source modes honesty)

**7. Implementation Risk**  
High for commerce-adjacent changes; Medium for layout sync.

**8. Expected Impact**  
Parity with Collection; merchant honesty for product sources; QA.

**9. Regression Tests Required**  
Product showcase all sources/layouts; quick-add/wishlist/compare triggers; media hover secondary image.

---

### 1.29 FAQ Framework

**1. Current Architecture**  
Hero-composed; accordion via native `<details>`/`<summary>`; hardcoded question `<h3>`; divergent Theme Editor reload.

**2. Current Problems**  
Heading ignore; TE reload predicate; `nether_card_style` meaning differs; uses content leaves with motion attr bug (`FRAMEWORK_SETTINGS_MAP` §16.1, §16.3, §16.5).

**3. Duplication Level**  
Partially (hero hub + local FAQ systems).

**4. Should it be standardized?**  
**YES** for heading + TE reload + motion leaf contracts. FAQ search/categories remain FAQ-owned.

**5. Should it remain independent?**  
Accordion item, search, categories, callouts stay independent.

**6. Priority**  
Critical

**7. Implementation Risk**  
Medium — heading changes affect outline; TE reload must be verified carefully.

**8. Expected Impact**  
A11y heading hierarchy; Theme Editor reliability; merchant heading control.

**9. Regression Tests Required**  
FAQ all blocks (item, category, search, media leaves, CTA, divider); Theme Editor reload after every setting group.

---

### 1.30 Newsletter Framework

**1. Current Architecture**  
Hero-composed; form system + showcase; countdown placeholder hidden.

**2. Current Problems**  
Countdown placeholder; inherits motion leaf issues; preamble duplication.

**3. Duplication Level**  
Extends Hero; countdown duplicated with Banner/CTA.

**4. Should it be standardized?**  
**YES** for countdown policy and hero-family wiring. Form remains newsletter-specific.

**5. Should it remain independent?**  
`nether-newsletter-form` and form CSS stay independent.

**6. Priority**  
Medium–High

**7. Implementation Risk**  
Medium.

**8. Expected Impact**  
TE honesty; form stability preserved.

**9. Regression Tests Required**  
Newsletter form submit UX, media, glass/gradient, countdown decision, motion.

---

### 1.31 CTA Framework

**1. Current Architecture**  
Highest cross-snippet reuse in hero family (hero media/stat/trust/feature-list + content leaves + product/collection highlights). Countdown placeholder.

**2. Current Problems**  
Inherits shared leaf motion bugs; countdown placeholder; preamble duplication.

**3. Duplication Level**  
Compositionally centralized reuse; local aside/promotion.

**4. Should it be standardized?**  
**YES** via shared leaf/hero contracts (CTA benefits most from Phase 1). Aside/promotion stay CTA-owned.

**5. Should it remain independent?**  
Promotion card / aside layouts independent.

**6. Priority**  
High

**7. Implementation Risk**  
Medium — many shared dependencies.

**8. Expected Impact**  
Broad regression coverage from one framework; merchant consistency.

**9. Regression Tests Required**  
CTA with image/video/html, highlights, trust, stats, countdown decision, motion, glass/gradient.

---

### 1.32 Commerce Framework

**1. Current Architecture**  
Centralized snippet library `nether-commerce-*` (~25) hosted by commerce section, PDP, cart, quick view. Interaction bridge JS.

**2. Current Problems**  
Audits do not list commerce snippet library as a duplication hotspot for presentation bugs. Local `enable_glass` naming differs.

**3. Duplication Level**  
Centralized (library).

**4. Should it be standardized?**  
**NO** for structural refactor. Optional glass flag naming alignment only if touching commerce glass.

**5. Should it remain independent?**  
Yes — out of presentation stabilization core.

**6. Priority**  
Low (this milestone)

**7. Implementation Risk**  
High if refactored — checkout-adjacent merchant risk.

**8. Expected Impact**  
Stability by non-interference.

**9. Regression Tests Required**  
Only if glass/motion shared wiring touches commerce hosts — smoke trust badges / modules on PDP.

---

### 1.33 Header Framework

**1. Current Architecture**  
Chrome hub: header section, mega menu, drawers, hosts quick view / wishlist / compare, optional glass, `data-nether-motion="header"`.

**2. Current Problems**  
Large nested settings surface; not a primary source of cross-section presentation bugs in §16. Glass/motion flags are header-local.

**3. Duplication Level**  
Centralized for chrome.

**4. Should it be standardized?**  
**NO** in this milestone beyond ensuring Motion TE reload patterns don’t regress header if shared JS helpers are introduced.

**5. Should it remain independent?**  
Yes — treat as protected chrome.

**6. Priority**  
Low (protect)

**7. Implementation Risk**  
High — sitewide chrome regressions.

**8. Expected Impact**  
Preserve storefront navigation stability.

**9. Regression Tests Required**  
Smoke only if shared motion helpers change registration: open mega menu, drawers, quick view triggers.

---

### 1.34 Stats (cross-cutting, audit hotspot)

**1. Current Architecture**  
Four snippets: `nether-hero-stat`, `nether-collection-stat`, `nether-product-stat`, `nether-testimonials-stat`. Hero-stat also reused by Content/CTA/Newsletter/Collection page.

**2. Current Problems**  
Inconsistent a11y (`aria-label` on some only); duplication (`FRAMEWORK_SETTINGS_MAP` §16.9; `FRAMEWORK_DEPENDENCIES` §F).

**3. Duplication Level**  
Fully duplicated (with one shared hero-stat consumer path).

**4. Should it be standardized?**  
**YES** — one stat atom with prefix/a11y params; migrate wrappers.

**5. Should it remain independent?**  
Framework-specific styling hooks via classes only.

**6. Priority**  
Medium

**7. Implementation Risk**  
Low–Medium.

**8. Expected Impact**  
A11y consistency; maintainability.

**9. Regression Tests Required**  
Hero, Content, CTA, Newsletter, Collection, Product, Testimonials, Collection page stat blocks.

---

## 2. What should be standardized vs independent vs never touched

### 2.1 Standardize (this milestone)

| Area | Standardization target |
|------|------------------------|
| Heading tag assign + FAQ questions | One contract; FAQ questions honor section/block policy |
| Image ratio mappers + collection page ID contract | One showcase mapping table; fix `image_ratio` → media |
| Position/alignment showcase CSS | Single shared rule source or guaranteed sync |
| Motion adapter contracts | `motion_attr` on shared leaves; TE `handleSectionLoad` |
| Glass/gradient Liquid cases | Shared mapping helper |
| Section padding style block | Shared snippet |
| Dividers | Shared core snippet |
| Stats | Shared core snippet |
| Block dispatcher shared cases | Parameterized shared cases (eyebrow/heading/text/buttons) |
| Breakpoint contract | Document + align CSS ↔ Motion |
| Placeholder merchant surfaces | Implement or remove/hide (countdown, lightbox, unwired product sources) |

### 2.2 Remain independent (by design)

| Area | Why |
|------|-----|
| Hero vs Showcase families | Different compositional models; architecture preserves both |
| Banner/Content prefixed setting IDs | Migration cost; document, don’t rename now |
| FAQ accordion / search / categories | Domain-specific |
| Newsletter form | Domain-specific |
| Product commerce actions (quick-add, wishlist, compare) | Domain-specific |
| Media lightbox/before-after as features | Framework-local (once policy decided) |
| Dawn `card-product` vs showcase cards | Dual paths intentional |
| Content aspect-ratio path vs Dawn `.ratio` | May converge later; document in Phase 1 |
| Header / Footer / Announcement chrome | Separate family |
| Commerce snippet library | Already centralized and page-critical |
| PDP / Cart / Wishlist / Compare page shells | Page frameworks; stabilize only shared contracts they consume |

### 2.3 Never touch (unless blocking a Critical contract)

See §4 for the full protected list and rationale.

---

## 3. Implementation roadmap

Order optimizes for: fix merchant-visible contracts first → shared visual wiring → motion/TE → duplicate leaf consolidation → verify. Architecture is preserved; each phase is shippable with regression gates.

**Phase rule:** A phase is not complete—and the next phase must not start—until its **Phase Completion Gate** passes (regression, Theme Editor, storefront, mobile, git commit/tag).

---

### Phase 0 — Contracts & freeze (no feature work)

**Goal:** Lock decisions so implementers don’t re-litigate architecture.

Deliverables (docs/checklists only):

1. Heading policy (Hero H1 rules; FAQ question tag behavior).  
2. Ratio mapping table (adapt/portrait/square/landscape → values) for Product/Collection/Media.  
3. Collection page setting contract (`image_ratio` vs `nether_image_ratio`).  
4. Theme Editor reload standard (`event.detail.sectionId` unless documented exception).  
5. Placeholder policy: countdown, lightbox, `best_sellers`/`trending` — **ship, hide, or explicitly document as unsupported**.  
6. Breakpoint contract (750/990 vs 749/989).  
7. Do-not-touch list signed off (§4).

**Exit criteria:** Written decisions referenced by PR checklist.

#### Phase Completion Gate — Phase 0

Do not start Phase 1 until all items pass:

- [ ] **Regression testing** — Phase 0 decisions reviewed against audit recurring bugs (§16); checklist attached to milestone
- [ ] **Theme Editor verification** — Confirm policies cover TE reload standard and placeholder honesty (no code required if docs-only)
- [ ] **Storefront verification** — Confirm contracts do not imply storefront redesign; do-not-touch list signed off
- [ ] **Mobile verification** — Breakpoint contract (750/990 vs 749/989) documented and agreed
- [ ] **Git commit/tag before continuing** — Commit Phase 0 docs/decisions; tag e.g. `stabilization-phase-0`

---

### Phase 1 — Shared wiring (Critical)

**Systems:** Heading · Alignment · Position · Image Ratio · Theme Editor (predicate + setting honesty for dead options)

| Workstream | Scope |
|------------|--------|
| 1A Heading | Shared assign pattern; FAQ questions honor policy; do not change visual `heading_size` semantics |
| 1B Position | Fix collection page `center` dead CSS/options; sync showcase position rule sets |
| 1C Alignment | Sync or extract shared alignment rules for presentation frameworks |
| 1D Image ratio | Unify Product/Collection/Media mappers; fix collection page premium path; fix placeholders to respect setting |
| 1E Theme Editor | Normalize `handleSectionLoad`; remove or fix dead position options |

**Risk:** Medium overall; Critical business value.  
**Regression gate:** Full presentation matrix for heading/position/align/ratio + collection page card modes + FAQ outline + TE reload on FAQ/Hero/Product.

#### Phase Completion Gate — Phase 1

Do not start Phase 2 until all items pass:

- [ ] **Regression testing** — Full presentation matrix for heading / position / alignment / image ratio; collection page Dawn + premium card paths; FAQ outline
- [ ] **Theme Editor verification** — `handleSectionLoad` on FAQ, Hero, Product; dead position options fixed or removed; settings update preview without stuck state
- [ ] **Storefront verification** — Same sections hard-refresh match TE; multiple Hero sections respect heading policy
- [ ] **Mobile verification** — Position / alignment / ratio at mobile widths; breakpoint boundaries if touched
- [ ] **Git commit/tag before continuing** — Commit Phase 1 work; tag e.g. `stabilization-phase-1`

---

### Phase 2 — Visual systems

**Systems:** Glass · Gradient · Cards (contracts) · Buttons (markup) · Spacing/Padding

| Workstream | Scope |
|------------|--------|
| 2A Glass | Shared Liquid enable/style mapper; keep CSS utilities |
| 2B Gradient | Shared overlay style mapper; do not touch Dawn `.gradient` |
| 2C Cards | Document/enforce setting meaning per framework; fix contract bugs only — no card redesign |
| 2D Buttons | Align dispatcher button markup with Dawn `.button` patterns |
| 2E Padding | Extract shared padding `{% style %}` snippet |

**Risk:** Medium (visual).  
**Regression gate:** Glass/gradient on/off + each style across Hero family + showcases; button blocks; padding mobile 0.75×.

**Out of scope here:** Wiring glass/gradient intensity to `settings_schema` (future product decision).

#### Phase Completion Gate — Phase 2

Do not start Phase 3 until all items pass:

- [ ] **Regression testing** — Glass/gradient on/off + each style across Hero family + showcases; button blocks; padding top/bottom including mobile `0.75×`
- [ ] **Theme Editor verification** — Toggle glass/gradient/card-related settings; button style changes preview correctly; Dawn color schemes still distinct from Nether `.grad-*`
- [ ] **Storefront verification** — Visual parity with TE for glass/gradient/buttons/padding on Hero, Banner, Product, Collection, FAQ
- [ ] **Mobile verification** — Glass/gradient/padding at mobile; no layout collapse on showcase cards
- [ ] **Git commit/tag before continuing** — Commit Phase 2 work; tag e.g. `stabilization-phase-2`

---

### Phase 3 — Motion

**Systems:** Motion adapters · Animation consistency · Theme Editor reload · shared content leaf `motion_attr`

| Workstream | Scope |
|------------|--------|
| 3A Leaf contract | `nether-content-image/video/custom-html` honor `motion_attr`; stop incorrect dual hardcoding where parents pass attrs |
| 3B Adapter parity | Align pending/ready + parallax plugin flag patterns across showcase JS where identical |
| 3C TE reload | Complete any remaining divergences after Phase 1E |
| 3D Engine | Touch `nether-motion.js` only if adapter API requires a narrow extension |

**Risk:** High.  
**Regression gate:** All `SECTION_SELECTORS` presentation frameworks; reduced motion; mobile/desktop motion flags; TE setting thrash under animation/parallax; CTA/FAQ/Newsletter leaves.

#### Phase Completion Gate — Phase 3

Do not start Phase 4 until all items pass:

- [ ] **Regression testing** — All motion-registered presentation CEs; shared content leaves in CTA/FAQ/Newsletter/Testimonials; reduced motion / force-reduced; parallax layouts
- [ ] **Theme Editor verification** — Animation/parallax setting thrash; section reload without pending stuck; remaining TE predicate divergences closed
- [ ] **Storefront verification** — Reveal/parallax matches TE after hard refresh; no flicker regressions on Hero family + showcases
- [ ] **Mobile verification** — Motion mobile/desktop theme flags; behavior at 749/750 and 989/990 if breakpoint contract applied
- [ ] **Git commit/tag before continuing** — Commit Phase 3 work; tag e.g. `stabilization-phase-3`

---

### Phase 4 — Duplicated components

**Systems:** Block dispatchers · Dividers · Stats · shared preamble helpers · (optional) showcase CSS partial extraction

| Workstream | Scope |
|------------|--------|
| 4A Dividers | One core + thin wrappers |
| 4B Stats | One core + thin wrappers / migrate to hero-stat params |
| 4C Block dispatchers | Shared cases for eyebrow/heading/text/buttons; keep unique `when` branches local |
| 4D Section preamble | Shared helper for animation speed mapping, glass/gradient flags, class list building — behavior-preserving |
| 4E Showcase CSS/JS | Extract shared position/align/columns partials used by Product/Collection/Media — **no** merging section CEs |

**Risk:** High if over-merged; keep wrappers to preserve BEM/class prefixes.  
**Regression gate:** Every presentation section block palette; dividers; stats; showcase layout matrix.

#### Phase Completion Gate — Phase 4

Do not start Phase 5 until all items pass:

- [ ] **Regression testing** — Every presentation section block palette (eyebrow/heading/text/buttons); dividers; stats; Product/Collection/Media showcase layout matrix
- [ ] **Theme Editor verification** — Add/remove/reorder shared block types; divider/stat blocks; no broken snippet renders after consolidation
- [ ] **Storefront verification** — Class prefixes and public CSS contracts unchanged (Compatibility Rules); visual parity with pre–Phase 4 baselines where behavior was not intentionally fixed
- [ ] **Mobile verification** — Showcase columns/layouts and shared header blocks on mobile
- [ ] **Git commit/tag before continuing** — Commit Phase 4 work; tag e.g. `stabilization-phase-4`

---

### Phase 5 — Framework verification

**Systems:** All stabilized contracts · merchant settings · storefront · Theme Editor · a11y · performance smoke

| Workstream | Scope |
|------------|--------|
| 5A Merchant settings matrix | For each Critical/High system, verify setting → DOM → CSS → JS chain |
| 5B Storefront | Desktop + mobile widths at breakpoint boundaries |
| 5C Theme Editor | Add/remove/reorder blocks; duplicate section; toggle glass/gradient/motion/heading/ratio |
| 5D Placeholder audit | Confirm countdown/lightbox/sources match Phase 0 policy |
| 5E Accessibility | Headings outline, reduced motion, divider/stat labels, FAQ details |
| 5F Performance smoke | No new global asset architecture; confirm no accidental duplicate engine loads |
| 5G Sign-off | Update audit companions with “stabilized” checkmarks (docs only) |

**Exit criteria:** No known Critical contract defects from §16 recurring bugs; Medium issues triaged or accepted.

#### Phase Completion Gate — Phase 5

Do not declare the Framework Stabilization milestone complete until all items pass:

- [x] **Regression testing** — Full presentation matrix + recurring-bug closure checklist (§6.3); Critical defects closed or explicitly deferred with ticket — **Pass** (`PHASE5_STABILIZATION_REPORT.md`)
- [x] **Theme Editor verification** — Add/remove/reorder blocks; duplicate section; toggle glass/gradient/motion/heading/ratio across Hero family + showcases + FAQ — **Pass** (code-verified; manual checklist in Phase 5 report §7)
- [x] **Storefront verification** — Merchant settings matrix (Critical/High); hard refresh matches TE; chrome/commerce smoke if shared helpers were touched — **Pass** (code-verified)
- [x] **Mobile verification** — Desktop + mobile at breakpoint boundaries; reduced motion on mobile — **Pass** (contract documented; no Phase 5 code churn)
- [ ] **Git commit/tag before continuing** — Final milestone commit; tag e.g. `stabilization-phase-5` / `framework-stabilization` — **Pending** user request

---

### Phase dependency diagram

```
Phase 0 Contracts
    │
    ▼
Phase 1 Shared Wiring (Heading, Position, Align, Ratio, TE)
    │
    ▼
Phase 2 Visual Systems (Glass, Gradient, Cards contracts, Buttons, Padding)
    │
    ▼
Phase 3 Motion Adapters + Leaf motion_attr
    │
    ▼
Phase 4 Duplicated Components (Dispatchers, Dividers, Stats, Preamble, Showcase partials)
    │
    ▼
Phase 5 Verification & Sign-off
```

**Parallelization notes:**  
- Within Phase 1, 1A and 1D can proceed in parallel if owners coordinate FAQ vs collection page.  
- Phase 2A/2B can run in parallel.  
- Phase 4 must not start until Phase 1 contracts are green (dispatchers depend on heading rules).  
- Cross-phase: no phase advances until the prior phase’s Completion Gate (including git commit/tag) is satisfied.

---

## 4. Do not touch

Systems that **must not** be refactored unless a Critical Phase 1–3 contract is impossible without a surgical change:

| System | Why protected |
|--------|----------------|
| **Motion Engine core** (`nether-motion.js` registries, GSAP load, a11y gates) | Already centralized; high blast radius; stabilize adapters instead |
| **Design token emission in `theme.liquid`** | Global SOT for all sections; renaming breaks merchant CSS assumptions |
| **Dawn primitives** (`.button`, `.card`, `.ratio`, color schemes, `deferred-media`, sliders, facets, cart drawer primitives) | Intentional dependency; replacing them redesigns the architecture |
| **Dawn body `.gradient` / color scheme model** | Distinct from Nether `.grad-*`; conflating them causes theme-wide visual breakage |
| **Hero compositional hub role** | Banner/Content/FAQ/Testimonials/Newsletter/CTA depend on it; do not replace with a new inheritance model |
| **Showcase family independence** | Product/Collection/Media are parallel by design — share partials, don’t force Hero inheritance |
| **Banner/Content setting ID prefixes** | Renaming is a merchant migration / translation project, not stabilization |
| **Header / mega menu / drawers** | Sitewide chrome; not a presentation duplication hotspot |
| **Footer / Announcement** | Chrome family; out of milestone unless shared motion helper forces smoke fixes |
| **Commerce snippet library structure** | Already centralized; PDP/cart/quick-view critical path |
| **Product page / Cart / Wishlist / Compare / Bundles page architecture** | Page frameworks; only consume stabilized shared contracts |
| **Typography CSS token scale** | Centralized and stable; heading *tags* are the issue, not type CSS |
| **Shadow / Radius / Badge / Icon CSS** | Centralized; no audit defects requiring restructure |
| **Form system core** | Newsletter depends on it; don’t redesign forms while stabilizing |
| **Glass/Gradient intensity → settings_schema** | Explicitly unwired future surface; implementing is product scope, not inconsistency fix |
| **Merging Product card into Dawn `card-product`** | Dual paths intentional |
| **Large-scale snippet renaming / BEM prefix unification** | Cosmetic architecture change; high TE/CSS risk, low merchant bug payoff |

**Surgical exception rule:** If a Critical bug’s only correct fix requires a one-line engine or token touch, document the exception in the PR, limit diff, and run Phase 5 chrome + global smoke tests.

---

## 5. Risk register

| Risk | Phase | Severity | Mitigation |
|------|-------|----------|------------|
| Visual drift when syncing showcase CSS | 1, 4 | High | Side-by-side screenshots before/after; shared partials with identical selectors first |
| Motion flicker / pending stuck | 3 | High | Test TE thrash + reduced motion; don’t rewrite engine |
| FAQ heading outline SEO/a11y change | 1 | Medium | Explicit heading policy in Phase 0; content QA |
| Collection page ratio fix changes premium grids | 1 | Medium | Test Dawn vs premium paths separately |
| Over-merging block dispatchers | 4 | High | Shared cases only; keep unique `when` branches |
| Hiding countdown/lightbox surprises merchants | 0–2 | Medium | Phase 0 policy + release notes |
| Breakpoint off-by-one | 1/3 | Medium | Explicit contract; test 749/750/989/990 |
| Accidental Header/Commerce churn | Any | High | Enforce §4 in review checklist |

---

## 6. Regression strategy

### 6.1 Per-phase minimum matrix

| Phase | Must retest |
|-------|-------------|
| 1 | Hero, Banner, Content, FAQ, Collection, Product, Media, Collection page (both card paths), CTA, Newsletter — heading/position/align/ratio/TE |
| 2 | Same set for glass/gradient/buttons/padding; Testimonials included for glass/card meanings |
| 3 | All motion-registered presentation CEs + shared leaves hosts + reduced motion |
| 4 | All divider/stat/block-dispatcher sections; showcase layout matrix |
| 5 | Full presentation + smoke chrome/commerce hosts |

### 6.2 Always-on checks

1. Theme Editor: change setting → visual update without full page reload failure.  
2. Storefront: hard refresh matches TE.  
3. Mobile and desktop at Nether breakpoints.  
4. `prefers-reduced-motion` / theme force-reduced.  
5. Multiple sections of same type on one template (esp. Hero H1 policy).  
6. Dawn color scheme switch does not break Nether gradients/glass.

### 6.3 Recurring bug closure checklist (from `FRAMEWORK_SETTINGS_MAP` §16)

Stabilization is incomplete until these are **verified closed or explicitly deferred with ticket**:

- [x] Heading level affects intended elements including FAQ questions (per Phase 0 policy) — **Closed** (Phase 1A; Phase 5 verified)  
- [x] Image ratio consistent across Product/Collection/Media; collection page premium honors merchant ratio — **Closed** (Phase 1D; Phase 5 verified)  
- [x] Shared content leaves honor motion attributes — **Closed** (Phase 3A; Phase 5 verified)  
- [x] FAQ Theme Editor reload matches standard predicate — **Closed** (Phase 1E + 3C; Phase 5 verified all 10 presentation adapters)  
- [x] Position/align showcase parity; collection page position options all styled or removed — **Closed** (Phase 1B/1C; `center` → `middle-center` alias)  
- [x] Card style meanings documented and applied consistently within each framework — **Closed** (`FRAMEWORK_CARD_STYLE_CONTRACTS.md` + Phase 2C)  
- [x] Glass/gradient style maps do not diverge silently — **Closed** (Phase 2A/2B; Content row glass sync)  
- [x] Countdown / lightbox / product source modes match Phase 0 honesty policy — **Closed** (countdown/lightbox schema-hidden; product sources implemented — Presentation Phase 3; Stabilization Phase 5 re-verified)  
- [x] Divider/stat a11y fixes propagate (post Phase 4) — **Closed** (Phase 4A/4B cores; Phase 5 verified)

---

## 7. Success criteria

This plan is the engineering blueprint for Framework Stabilization when:

1. **Architecture preserved** — Hero hub, Showcase parallels, Commerce library, Dawn dependency, and chrome family unchanged in role.  
2. **Critical contracts fixed** — Heading, ratio, position (incl. collection page), motion leaf attrs, TE reload.  
3. **Duplication reduced where it causes bugs** — dividers, stats, padding, glass/gradient cases, shared dispatcher cases, showcase layout CSS — without renaming the theme.  
4. **Protected systems untouched** — §4 respected.  
5. **Merchant honesty** — no settings that silently no-op (or they are removed/hidden per policy).  
6. **Another engineer can implement** Phase 0–5 with decisions already made: standardize vs independent vs never-touch is explicit per system.  
7. **Regression matrix** above is the QA definition of done.  
8. **No redesign** — no new compositional family, no Dawn replacement, no token system rewrite.

---

## 8. Suggested implementation ownership slices

| Slice | Primary phases | Notes |
|-------|----------------|-------|
| Contracts owner | 0 | Writes policies; blocks merge without checklist |
| Showcase layout/ratio | 1, 4E | Product/Collection/Media + collection page |
| Hero-family wiring | 1A, 2, 3A | Hero + six consumers + content leaves |
| Motion/TE | 1E, 3 | Adapters only |
| Duplicate leaves | 4A–4D | Dividers, stats, preamble, dispatchers |
| QA | 5 | Owns matrix sign-off |

---

## 9. Document control

| Item | Value |
|------|-------|
| Status | Phase 5 verification complete — milestone ready for commit/tag on request |
| Code changes in this doc | Checklist §6.3 updated 2026-07-21 |
| Next step after approval | Execute Phase 0 decisions, then Phase 1 PRs against this blueprint |
| Companion audits | Remain historical SOT for *as-found* architecture; this plan is SOT for *stabilization work*; Phase 5 closure recorded in `PHASE5_STABILIZATION_REPORT.md` |

---

**End of FRAMEWORK_STABILIZATION_PLAN.md**
