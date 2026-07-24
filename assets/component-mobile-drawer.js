/**
 * Nether Premium Mobile Navigation Drawer Framework
 * Extends Dawn HeaderDrawer / MenuDrawer — does not replace them.
 */

class NetherMobileDrawer extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.initialized = false;
    this.motionReady = false;
    this.currentLevel = 0;
    this.openTween = null;
    this.closeTween = null;
    this.overlayTween = null;
    this.submenuTween = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleHeaderState = this.handleHeaderState.bind(this);
    this.handleSearchOpen = this.handleSearchOpen.bind(this);
    this.handleDetailsToggle = this.handleDetailsToggle.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleSubmenuToggle = this.handleSubmenuToggle.bind(this);
    this.handleDrawerSearch = this.handleDrawerSearch.bind(this);
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.classList.add('is-enabled');

    this.hostDrawer = this.querySelector('header-drawer');
    this.mainDetails = this.hostDrawer?.querySelector('details');
    this.summary = this.mainDetails?.querySelector('summary');
    this.panel = this.querySelector('.nether-mobile-drawer__panel');
    this.overlay = this.querySelector('[data-nether-drawer-overlay]');
    this.searchDrawer = document.querySelector('nether-search-drawer');

    this.parseConfig();
    this.bindHostEvents();
    this.bindSubmenuEvents();
    this.registerMotion();

    this.overlay?.addEventListener('click', this.handleOverlayClick);
    document.addEventListener('nether:header:state', this.handleHeaderState);
    document.addEventListener('nether:search:open', this.handleSearchOpen);
    this.addEventListener('click', this.handleDrawerSearch);

    if (this.panel) {
      this.panel.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      this.panel.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.panel.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  disconnectedCallback() {
    this.unbindHostEvents();
    this.overlay?.removeEventListener('click', this.handleOverlayClick);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('nether:header:state', this.handleHeaderState);
    document.removeEventListener('nether:search:open', this.handleSearchOpen);
    this.removeEventListener('click', this.handleDrawerSearch);
    this.panel?.removeEventListener('touchstart', this.handleTouchStart);
    this.panel?.removeEventListener('touchmove', this.handleTouchMove);
    this.panel?.removeEventListener('touchend', this.handleTouchEnd);
    if (window.Shopify?.designMode) {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    }
    this.killMotionTweens();
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      overlay: dataset.enableOverlay !== 'false',
      desktop: dataset.desktop !== 'false',
      tablet: dataset.tablet !== 'false',
      mobile: dataset.mobile !== 'false',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.3,
      drawerWidth: Number.parseInt(dataset.drawerWidth, 10) || 360,
      position: dataset.drawerPosition || 'left',
    };

    this.style.setProperty('--nether-drawer-width', `${this.config.drawerWidth}px`);
    this.style.setProperty('--nether-drawer-duration', `${this.config.animationDuration}s`);
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  isBreakpointActive() {
    const width = window.innerWidth;
    if (width >= 990) return this.config.desktop;
    if (width >= 750) return this.config.tablet;
    return this.config.mobile;
  }

  bindHostEvents() {
    this.mainDetails?.addEventListener('toggle', this.handleDetailsToggle);

    this.menuOpeningObserver = new MutationObserver(() => {
      if (this.mainDetails?.classList.contains('menu-opening') && this.mainDetails.hasAttribute('open')) {
        this.onDrawerOpen();
      }
    });

    if (this.mainDetails) {
      this.menuOpeningObserver.observe(this.mainDetails, {
        attributes: true,
        attributeFilter: ['class', 'open'],
      });
    }
  }

  unbindHostEvents() {
    this.mainDetails?.removeEventListener('toggle', this.handleDetailsToggle);
    this.menuOpeningObserver?.disconnect();
  }

  bindSubmenuEvents() {
    this.querySelectorAll('[data-nether-drawer-submenu]').forEach((details) => {
      details.addEventListener('toggle', this.handleSubmenuToggle);
    });
  }

  handleSectionLoad(event) {
    if (event.detail.sectionId === this.dataset.sectionId) {
      this.parseConfig();
      this.bindSubmenuEvents();
      this.syncOffsets();
    }
  }

  handleDetailsToggle(event) {
    if (event.target !== this.mainDetails) return;

    if (!this.mainDetails.hasAttribute('open')) {
      this.onDrawerClose();
    }
  }

  handleSubmenuToggle(event) {
    const details = event.target;
    if (!details.matches('[data-nether-drawer-submenu]')) return;

    const depth = Number.parseInt(details.closest('[data-nether-drawer-depth]')?.dataset.netherDrawerDepth, 10) || 0;
    const level = details.hasAttribute('open') ? depth + 1 : depth;
    this.setNavigationLevel(level, details);

    if (details.hasAttribute('open')) {
      this.animateSubmenuOpen(details);
    } else {
      this.animateSubmenuClose(details);
    }
  }

  setNavigationLevel(level, details) {
    const prevLevel = this.currentLevel;
    this.currentLevel = level;

    this.dispatchEvent(
      new CustomEvent('nether:drawer:level-change', {
        bubbles: true,
        detail: {
          sectionId: this.dataset.sectionId,
          level,
          previousLevel: prevLevel,
          detailsId: details?.id || null,
        },
      })
    );
  }

  handleKeydown(event) {
    if (!this.isOpen || event.code.toUpperCase() !== 'ESCAPE') return;

    const openSubmenu = this.panel?.querySelector('[data-nether-drawer-submenu][open]');
    if (openSubmenu && openSubmenu !== this.mainDetails) {
      event.stopPropagation();
      const closeButton = openSubmenu.querySelector('[data-nether-drawer-back]');
      closeButton?.click();
      return;
    }

    event.stopPropagation();
    this.close();
  }

  handleOverlayClick() {
    if (this.config.overlay) this.close();
  }

  handleHeaderState(event) {
    if (event.detail?.state?.hidden && this.isOpen) {
      this.close(false);
    }
  }

  handleSearchOpen() {
    if (this.isOpen) this.close(false);
  }

  handleDrawerSearch(event) {
    const trigger = event.target.closest('[data-nether-drawer-search]');
    if (!trigger || !this.isOpen) return;

    event.preventDefault();
    this.close(false);
    this.searchDrawer?.open(trigger);
  }

  handleTouchStart(event) {
    if (!this.isOpen || event.touches.length !== 1) return;

    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchTracking = true;
  }

  handleTouchMove(event) {
    if (!this.touchTracking || !this.isOpen) return;

    const deltaX = event.touches[0].clientX - this.touchStartX;
    const deltaY = event.touches[0].clientY - this.touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      this.touchTracking = false;
      return;
    }

    const isLeftDrawer = this.config.position !== 'right';
    const swipeClose = isLeftDrawer ? deltaX < -40 : deltaX > 40;

    if (swipeClose) {
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    if (!this.touchTracking || !this.isOpen) return;

    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    const isLeftDrawer = this.config.position !== 'right';
    const threshold = 80;

    this.touchTracking = false;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if ((isLeftDrawer && deltaX < -threshold) || (!isLeftDrawer && deltaX > threshold)) {
      this.close();
    }
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-mobile-drawer`, {
      type: 'mobile-drawer',
      element: this,
      init: () => {
        this.parseConfig();
        this.initMotionEngine();
        this.syncOffsets();
      },
      destroy: () => {
        this.killMotionTweens();
        if (this.isOpen) this.close(false);
      },
    });
  }

  initMotionEngine() {
    if (this.prefersReducedMotion() || !window.NetherMotion?.load) return;

    window.NetherMotion.load([]).then(() => {
      this.motionReady = typeof gsap !== 'undefined';
      if (this.motionReady) {
        this.dataset.netherMotionReady = 'true';
      }
    });
  }

  killMotionTweens() {
    this.openTween?.kill();
    this.closeTween?.kill();
    this.overlayTween?.kill();
    this.submenuTween?.kill();
    this.openTween = null;
    this.closeTween = null;
    this.overlayTween = null;
    this.submenuTween = null;
  }

  syncOffsets() {
    const netherHeader = document.querySelector('nether-header');
    const announcementOffset =
      netherHeader?.style.getPropertyValue('--nether-header-announcement-offset') ||
      getComputedStyle(netherHeader || document.documentElement).getPropertyValue('--nether-header-announcement-offset');

    if (announcementOffset) {
      this.style.setProperty('--nether-drawer-header-offset', announcementOffset.trim() || '0px');
    }
  }

  getSlideOrigin() {
    return this.config.position === 'right' ? '100%' : '-100%';
  }

  onDrawerOpen() {
    if (!this.isBreakpointActive() || this.isOpen) return;

    this.syncOffsets();
    this.searchDrawer?.close(false);
    this.isOpen = true;
    this.currentLevel = 0;
    this.classList.add('is-open');
    this.summary?.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', this.handleKeydown);

    this.dispatchEvent(
      new CustomEvent('nether:drawer:open', {
        bubbles: true,
        detail: { sectionId: this.dataset.sectionId },
      })
    );

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
      this.classList.add('is-visible');
      return;
    }

    this.killMotionTweens();
    gsap.set(this.panel, { x: this.getSlideOrigin(), opacity: 1 });

    if (this.overlay && this.config.overlay) {
      gsap.set(this.overlay, { opacity: 0, visibility: 'visible' });
    }

    this.classList.add('is-visible');

    this.openTween = gsap.to(this.panel, {
      x: 0,
      duration: this.config.animationDuration,
      ease: 'power3.out',
    });

    if (this.overlay && this.config.overlay) {
      this.overlayTween = gsap.to(this.overlay, {
        opacity: 1,
        duration: this.config.animationDuration,
        ease: 'power2.out',
      });
    }
  }

  onDrawerClose() {
    if (!this.isOpen) return;

    const finishClose = () => {
      this.isOpen = false;
      this.currentLevel = 0;
      this.classList.remove('is-open', 'is-visible');
      this.summary?.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', this.handleKeydown);

      if (this.overlay) {
        gsap.set(this.overlay, { clearProps: 'opacity,visibility' });
      }

      this.dispatchEvent(
        new CustomEvent('nether:drawer:close', {
          bubbles: true,
          detail: { sectionId: this.dataset.sectionId },
        })
      );
    };

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
      finishClose();
      return;
    }

    this.killMotionTweens();

    this.closeTween = gsap.to(this.panel, {
      x: this.getSlideOrigin(),
      duration: this.config.animationDuration,
      ease: 'power3.in',
      onComplete: finishClose,
    });

    if (this.overlay && this.config.overlay) {
      this.overlayTween = gsap.to(this.overlay, {
        opacity: 0,
        duration: this.config.animationDuration,
        ease: 'power2.in',
      });
    } else {
      finishClose();
    }
  }

  close(focusToggle = true) {
    if (!this.isOpen || !this.summary) return;

    this.mainDetails.classList.remove('menu-opening');
    this.mainDetails.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetails.querySelectorAll('.submenu-open').forEach((submenu) => {
      submenu.classList.remove('submenu-open');
    });

    const breakpoint = this.hostDrawer?.dataset.breakpoint || 'tablet';
    document.body.classList.remove(`overflow-hidden-${breakpoint}`);

    if (focusToggle) {
      removeTrapFocus(this.summary);
    }

    this.mainDetails.removeAttribute('open');
    this.onDrawerClose();

    if (this.hostDrawer?.header) {
      this.hostDrawer.header.classList.remove('menu-open');
    }
  }

  animateSubmenuOpen(details) {
    const submenu = details.querySelector('[data-nether-drawer-panel]');
    if (!submenu) return;

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') return;

    this.submenuTween?.kill();
    gsap.set(submenu, { x: '100%', opacity: 1 });
    this.submenuTween = gsap.to(submenu, {
      x: 0,
      duration: Math.min(this.config.animationDuration, 0.35),
      ease: 'power2.out',
    });
  }

  animateSubmenuClose(details) {
    const submenu = details.querySelector('[data-nether-drawer-panel]');
    if (!submenu) return;

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') return;

    this.submenuTween?.kill();
    this.submenuTween = gsap.to(submenu, {
      x: '100%',
      duration: Math.min(this.config.animationDuration, 0.3),
      ease: 'power2.in',
    });
  }

  open() {
    if (!this.isBreakpointActive() || this.isOpen || !this.summary) return;
    this.summary.click();
  }
}

if (!customElements.get('nether-mobile-drawer')) {
  customElements.define('nether-mobile-drawer', NetherMobileDrawer);
}

document.addEventListener('nether:drawer:open', () => {
  document.querySelector('nether-search-drawer')?.close(false);
});

document.addEventListener('nether:search:open', () => {
  document.querySelector('nether-mobile-drawer')?.close(false);
});
