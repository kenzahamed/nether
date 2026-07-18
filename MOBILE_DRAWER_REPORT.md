# Nether Premium Mobile Navigation Drawer Framework Report

## 1. Summary

Extended the existing Dawn `header-drawer` / `MenuDrawer` implementation with a reusable Nether Premium Mobile Navigation Drawer Framework. The framework wraps Dawn's mobile menu without replacing it — `HeaderDrawer`, `MenuDrawer`, focus trapping, scroll lock, and submenu navigation all continue to work.

The new `<nether-mobile-drawer>` coordinator adds premium overlay, GSAP-powered animations via NetherMotion, swipe-to-close, multi-level navigation events, a structured footer area, secondary menu support, and full header/search/announcement integration.

When `nether_enable_mobile_drawer` is disabled, the original Dawn `header-drawer` markup and behavior are preserved unchanged.

## 2. Files Created

| File | Purpose |
|------|---------|
| `assets/component-mobile-drawer.css` | Premium drawer styles extending Dawn `.menu-drawer` tokens |
| `assets/component-mobile-drawer.js` | `NetherMobileDrawer` custom element — motion, events, swipe, coordination |
| `snippets/nether-mobile-drawer-nav-item.liquid` | Recursive navigation item snippet (Dawn-compatible markup) |
| `snippets/nether-mobile-drawer-footer.liquid` | Drawer footer — account, cart, search, social, contact, secondary menu |
| `MOBILE_DRAWER_REPORT.md` | This report |

## 3. Files Modified

| File | Changes |
|------|---------|
| `snippets/header-drawer.liquid` | Wrapped with `<nether-mobile-drawer>` when enabled; premium nav/footer snippets; ARIA enhancements; Dawn fallback preserved |
| `sections/header.liquid` | Asset loading, mobile drawer schema settings, sticky header overlay guards |
| `assets/component-header.js` | Closes mobile drawer on auto-hide; skips scroll behavior when drawer is open |
| `locales/en.default.json` | Mobile drawer translation strings |
| `locales/en.default.schema.json` | Theme Editor labels for mobile drawer settings |

## 4. Features Implemented

| Feature | Implementation |
|---------|----------------|
| **Mobile Navigation Drawer** | `<nether-mobile-drawer>` wraps existing `header-drawer` |
| **Overlay** | Fixed `.nether-mobile-drawer__overlay` with fade animation; Dawn pseudo-overlay suppressed |
| **Open / Close** | Dawn `details` toggle preserved; coordinator syncs premium state + animations |
| **ESC Key Support** | Root ESC closes drawer; nested ESC triggers back navigation |
| **Focus Trap** | Reuses Dawn `trapFocus` / `removeTrapFocus` from `global.js` |
| **Scroll Lock** | Reuses Dawn `overflow-hidden-{breakpoint}` body class |
| **Swipe Close** | Touch swipe left (left drawer) or right (right drawer) to close |
| **Multi-level Navigation** | Recursive `nether-mobile-drawer-nav-item` snippet (3+ levels) |
| **Expand / Collapse** | Dawn `details`/`summary` submenu pattern preserved |
| **Active Navigation Indicators** | `.nether-mobile-drawer__link--active` + visual indicator bar |
| **Smooth Height Animation** | Submenu slide animations via GSAP; chevron rotation via CSS |
| **Back Navigation** | Dawn `menu-drawer__close-button` back pattern + `data-nether-drawer-back` |
| **Drawer Footer Area** | `nether-mobile-drawer-footer.liquid` with utility actions |
| **Optional Secondary Menu** | Merchant link list setting in footer |
| **Primary Navigation** | Main menu via recursive nav item snippet |
| **Account Link** | Footer account link with avatar support |
| **Cart Link** | Footer cart link with item count |
| **Search Shortcut** | Opens Nether search drawer when enabled |
| **Social Icons** | Reuses `social-icons` snippet |
| **Contact Information** | Optional phone, email, and text fields |
| **Custom Blocks (future ready)** | `[data-nether-drawer-blocks]` placeholder in footer |

## 5. Merchant Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `nether_enable_mobile_drawer` | checkbox | `true` | Enable premium mobile drawer framework |
| `nether_drawer_width` | range (280–480px) | `360` | Drawer panel width |
| `nether_drawer_position` | select | `left` | Left or right slide position |
| `nether_drawer_enable_overlay` | checkbox | `true` | Dimmed background overlay |
| `nether_drawer_animation_speed` | select | `default` | Fast (0.15s) / Default (0.3s) / Slow (0.5s) |
| `nether_drawer_enable_social` | checkbox | `true` | Show social icons in footer |
| `nether_drawer_enable_contact` | checkbox | `false` | Show contact information |
| `nether_drawer_contact_phone` | text | — | Phone number |
| `nether_drawer_contact_email` | text | — | Email address |
| `nether_drawer_contact_text` | textarea | — | Additional contact text |
| `nether_drawer_enable_secondary_menu` | checkbox | `false` | Enable secondary menu |
| `nether_drawer_secondary_menu` | link_list | — | Secondary navigation menu |
| `nether_drawer_desktop` | checkbox | `false` | Enable on desktop (≥990px) |
| `nether_drawer_tablet` | checkbox | `true` | Enable on tablet (750–989px) |
| `nether_drawer_mobile` | checkbox | `true` | Enable on mobile (<750px) |

## 6. Motion Integration

- GSAP loaded exclusively via `NetherMotion.load([])` — no manual GSAP script tags
- Drawer slide: `gsap.to(panel, { x: 0 })` on open; reverse on close
- Overlay fade: `gsap.to(overlay, { opacity })` synchronized with drawer
- Submenu slide: GSAP animates `[data-nether-drawer-panel]` on level change
- Back navigation: submenu close tween via GSAP
- `data-nether-motion-ready` defers CSS transforms to GSAP when motion is loaded
- `NetherMotion.registerSection()` init/destroy hooks for Theme Editor compatibility
- `prefers-reduced-motion`: instant state changes, no GSAP tweens

## 7. Accessibility Improvements

- `role="dialog"` + `aria-modal="true"` on drawer panel
- `aria-expanded` synced on menu summary trigger
- `aria-current="page"` on active navigation links
- `aria-label` on navigation regions and drawer dialog
- ESC key: back navigation at submenu level, close at root level
- Focus trap via existing Dawn `trapFocus` utilities
- Screen reader: Dawn submenu `submenu-open` visibility rules preserved
- Reduced motion: CSS transitions disabled; GSAP bypassed
- Decorative icons marked `aria-hidden="true"`

## 8. Performance Improvements

- Lazy GSAP initialization via NetherMotion (loads on section registration, not page load)
- `display: contents` on coordinator — no extra layout box
- MutationObserver for `menu-opening` class — minimal polling
- Touch handlers use `{ passive: true }` where possible
- Single document-level keydown listener only while drawer is open
- Submenu animations killed before new tweens
- Conditional asset loading — CSS/JS only when drawer is enabled
- Theme Check compatible (exit code 0)

## 9. Framework Integration

| System | Integration |
|--------|-------------|
| **Header Framework** | Drawer lives inside `nether-header` via `nether-header-navigation` → `header-drawer` |
| **Header Behavior** | Scroll behaviors paused when drawer open; auto-hide closes drawer |
| **Search Drawer** | Mutual exclusion — opening one closes the other |
| **Announcement System** | `--nether-drawer-header-offset` synced from announcement offset |
| **Header Events** | Listens to `nether:header:state` for auto-hide coordination |
| **Header Buttons** | Hamburger remains Dawn `summary` inside `header-drawer` |
| **Design Tokens** | `--duration-default`, `--shadow-level-md`, `--radius-md`, color scheme tokens |
| **Social Icons** | Reuses `snippets/social-icons.liquid` |
| **Localization** | Reuses Dawn country/language localization forms in footer |

## 10. Events Added

| Event | When | Detail |
|-------|------|--------|
| `nether:drawer:open` | Drawer opens | `{ sectionId }` |
| `nether:drawer:close` | Drawer closes | `{ sectionId }` |
| `nether:drawer:level-change` | Submenu level changes | `{ sectionId, level, previousLevel, detailsId }` |

Future components can subscribe:

```javascript
document.addEventListener('nether:drawer:open', (event) => {
  console.log('Drawer opened', event.detail.sectionId);
});
```

## 11. Verification Checklist

| Check | Status |
|-------|--------|
| Existing Header Framework preserved | ✅ `nether-header`, navigation, actions unchanged |
| Existing Header Behavior preserved | ✅ Extended with drawer-aware guards only |
| Existing Search Drawer preserved | ✅ Mutual exclusion only; no search drawer changes |
| Existing Motion Engine reused | ✅ `NetherMotion.load()` / `registerSection()` |
| Dawn mobile drawer not replaced | ✅ `header-drawer` + `HeaderDrawer` intact |
| No duplicated CSS | ✅ Premium rules scoped to `.nether-mobile-drawer` |
| No duplicated Liquid | ✅ Dawn fallback branch when drawer disabled |
| No duplicated JavaScript | ✅ Coordinator extends; Dawn `MenuDrawer` unchanged |
| No existing functionality broken | ✅ Disabled setting restores Dawn markup |
| Theme Check compatible | ✅ Passes (pre-existing warnings only) |
| Online Store 2.0 compatible | ✅ Section schema settings in header |
| Responsive (desktop / tablet / mobile) | ✅ Breakpoint settings per viewport |
| Theme Editor compatible | ✅ Section load hooks via NetherMotion registry |
