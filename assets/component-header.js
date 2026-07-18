/**
 * Nether Premium Header Framework
 * Structural custom element — height tokens, announcement integration, scroll behaviors.
 */
class NetherHeader extends HTMLElement {
  constructor() {
    super();
    this.handleResize = this.handleResize.bind(this);
    this.handleAnnouncementChange = this.handleAnnouncementChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onScrollRaf = this.onScrollRaf.bind(this);
    this.handleBreakpointChange = this.handleBreakpointChange.bind(this);

    this.scrollState = {
      transparent: false,
      solid: false,
      sticky: false,
      shrunk: false,
      hidden: false,
      scrolled: false,
    };

    this.lastScrollY = 0;
    this.scrollTicking = false;
    this.preventHide = false;
    this.motionReady = false;
    this.hideTween = null;
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.sectionHeader = this.closest('.section-header');
    this.headerWrapper = this.querySelector('.header-wrapper');
    this.header = this.querySelector('.header');
    this.stickyHeader = this.querySelector('sticky-header');
    this.predictiveSearch = this.querySelector('predictive-search');
    this.searchDrawer = document.querySelector('nether-search-drawer');
    this.wishlistDrawer = document.querySelector('nether-wishlist-drawer');
    this.compareDrawer = document.querySelector('nether-compare-drawer');
    this.quickView = document.querySelector('nether-quick-view');
    this.mobileDrawer = document.querySelector('nether-mobile-drawer');

    this.parseBehaviorConfig();
    this.setHeaderMetrics();
    this.syncAnnouncementOffset();
    this.registerMotion();
    this.initBehaviorSystem();

    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('nether:announcement:change', this.handleAnnouncementChange);

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleResize);
      document.addEventListener('shopify:section:unload', this.handleResize);
    }
  }

  disconnectedCallback() {
    this.destroyBehaviorSystem();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('nether:announcement:change', this.handleAnnouncementChange);
    document.removeEventListener('shopify:section:load', this.handleResize);
    document.removeEventListener('shopify:section:unload', this.handleResize);
  }

  parseBehaviorConfig() {
    const dataset = this.dataset;

    this.behaviorConfig = {
      sticky: dataset.sticky === 'true',
      transparent: dataset.transparent === 'true',
      shrink: dataset.enableShrink === 'true',
      autoHide: dataset.enableAutoHide === 'true',
      threshold: Number.parseInt(dataset.scrollThreshold, 10) || 0,
      shrinkHeight: Number.parseInt(dataset.shrinkHeight, 10) || 56,
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.3,
      desktop: dataset.behaviorDesktop !== 'false',
      tablet: dataset.behaviorTablet !== 'false',
      mobile: dataset.behaviorMobile !== 'false',
    };
  }

  hasBehaviorFeatures() {
    const config = this.behaviorConfig;
    if (!config) return false;

    return config.sticky || config.transparent || config.shrink || config.autoHide;
  }

  isBehaviorBreakpointActive() {
    const config = this.behaviorConfig;
    if (!config) return false;

    const width = window.innerWidth;

    if (width >= 990) return config.desktop;
    if (width >= 750) return config.tablet;
    return config.mobile;
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  initBehaviorSystem() {
    if (!this.hasBehaviorFeatures()) return;

    this.behaviorMediaQuery = window.matchMedia('(min-width: 750px)');
    this.behaviorMediaQuery.addEventListener('change', this.handleBreakpointChange);

    this.stickyHeader?.addEventListener('preventHeaderReveal', () => {
      this.preventHide = true;
    });

    this.lazyInitBehavior();
  }

  lazyInitBehavior() {
    if (this.behaviorInitialized || !this.isBehaviorBreakpointActive()) return;

    this.behaviorInitialized = true;
    this.createHeaderBoundsObserver();
    this.initMotionEngine();
    this.lastScrollY = window.scrollY || document.documentElement.scrollTop;

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.onScrollRaf();
  }

  destroyBehaviorSystem() {
    if (this.behaviorMediaQuery) {
      this.behaviorMediaQuery.removeEventListener('change', this.handleBreakpointChange);
    }

    window.removeEventListener('scroll', this.handleScroll);
    this.boundsObserver?.disconnect();
    this.boundsObserver = null;

    this.killMotionTweens();
    this.behaviorInitialized = false;
  }

  handleBreakpointChange() {
    if (this.isBehaviorBreakpointActive()) {
      this.lazyInitBehavior();
      this.onScrollRaf();
      return;
    }

    this.destroyBehaviorSystem();
    this.resetBehaviorState();
  }

  createHeaderBoundsObserver() {
    if (!this.sectionHeader || typeof IntersectionObserver === 'undefined') return;

    this.boundsObserver = new IntersectionObserver((entries) => {
      if (entries[0]) {
        this.headerBounds = entries[0].intersectionRect;
      }
    });

    this.boundsObserver.observe(this.sectionHeader);
    this.headerBounds = this.sectionHeader.getBoundingClientRect();
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
    this.hideTween?.kill();
    this.hideTween = null;
  }

  handleResize() {
    this.setHeaderMetrics();
    this.syncAnnouncementOffset();
    this.headerBounds = this.sectionHeader?.getBoundingClientRect();
  }

  handleAnnouncementChange() {
    this.syncAnnouncementOffset();
    this.setHeaderMetrics();
  }

  handleScroll() {
    if (!this.behaviorInitialized || this.scrollTicking) return;

    this.scrollTicking = true;
    requestAnimationFrame(this.onScrollRaf);
  }

  onScrollRaf() {
    this.scrollTicking = false;

    if (!this.behaviorInitialized || !this.isBehaviorBreakpointActive()) return;
    if (this.predictiveSearch?.isOpen) return;
    if (this.searchDrawer?.isOpen) return;
    if (this.wishlistDrawer?.isOpen) return;
    if (this.compareDrawer?.isOpen) return;
    if (this.quickView?.isOpen) return;
    if (this.mobileDrawer?.isOpen) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const threshold = Math.max(0, this.behaviorConfig.threshold);
    const boundsBottom = this.headerBounds?.bottom ?? threshold;
    const isPastThreshold = scrollY > threshold;
    const isPastHeader = scrollY > boundsBottom;
    const scrollingDown = scrollY > this.lastScrollY;
    const scrollingUp = scrollY < this.lastScrollY;
    const atTop = scrollY <= threshold;

    const nextState = {
      transparent: false,
      solid: true,
      sticky: false,
      shrunk: false,
      hidden: false,
      scrolled: isPastThreshold,
    };

    if (this.behaviorConfig.transparent) {
      nextState.transparent = atTop;
      nextState.solid = !atTop;
    }

    if (this.behaviorConfig.sticky && isPastThreshold) {
      nextState.sticky = true;
    }

    if (this.behaviorConfig.shrink && isPastThreshold) {
      nextState.shrunk = true;
    }

    if (this.behaviorConfig.autoHide && isPastHeader) {
      if (scrollingDown && !this.preventHide) {
        nextState.hidden = true;
      } else if (scrollingUp) {
        nextState.hidden = false;
        this.preventHide = false;
      }
    } else if (atTop) {
      nextState.hidden = false;
      this.preventHide = false;
    }

    if (scrollingDown && this.preventHide) {
      window.clearTimeout(this.preventHideTimeout);
      this.preventHideTimeout = window.setTimeout(() => {
        this.preventHide = false;
      }, 66);
    }

    this.applyScrollStates(nextState, scrollY);
    this.syncDawnStickyClasses(nextState, isPastHeader, atTop);

    this.lastScrollY = scrollY;
  }

  syncDawnStickyClasses(state, isPastHeader, atTop) {
    if (!this.sectionHeader || !this.behaviorConfig.sticky) return;

    const stickyType = this.stickyHeader?.getAttribute('data-sticky-type');
    const alwaysSticky = stickyType === 'always' || stickyType === 'reduce-logo-size';

    if (alwaysSticky) return;

    if (isPastHeader) {
      this.sectionHeader.classList.add('scrolled-past-header');
    } else if (atTop) {
      this.sectionHeader.classList.remove('scrolled-past-header');
    }

    if (this.behaviorConfig.autoHide) {
      if (state.hidden) {
        this.sectionHeader.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
        this.sectionHeader.classList.remove('animate');
        this.closeHeaderOverlays();
      } else if (isPastHeader) {
        this.sectionHeader.classList.add('shopify-section-header-sticky', 'animate');
        this.sectionHeader.classList.remove('shopify-section-header-hidden');
      } else if (atTop) {
        this.sectionHeader.classList.remove(
          'shopify-section-header-hidden',
          'shopify-section-header-sticky',
          'animate'
        );
      }
    } else if (state.sticky && isPastHeader) {
      this.sectionHeader.classList.add('shopify-section-header-sticky');
    } else if (atTop) {
      this.sectionHeader.classList.remove('shopify-section-header-sticky', 'animate');
    }
  }

  closeHeaderOverlays() {
    this.sectionHeader?.querySelectorAll('header-menu').forEach((disclosure) => disclosure.close());
    this.sectionHeader?.querySelector('details-modal')?.close(false);
    this.searchDrawer?.close(false);
    this.wishlistDrawer?.close(false);
    this.compareDrawer?.close(false);
    this.mobileDrawer?.close(false);
  }

  applyScrollStates(nextState, scrollY) {
    const prevState = { ...this.scrollState };
    this.scrollState = nextState;
    this.applyStateClasses(nextState);

    if (prevState.hidden !== nextState.hidden) {
      this.animateHideReveal(nextState.hidden);
    }

    this.dispatchEvent(
      new CustomEvent('nether:header:state', {
        bubbles: true,
        detail: {
          sectionId: this.dataset.sectionId,
          scrollY,
          state: { ...nextState },
        },
      })
    );
  }

  resetBehaviorState() {
    const resetState = {
      transparent: this.behaviorConfig?.transparent ?? false,
      solid: !(this.behaviorConfig?.transparent ?? false),
      sticky: false,
      shrunk: false,
      hidden: false,
      scrolled: false,
    };

    this.applyStateClasses(resetState);
    this.killMotionTweens();

    if (this.headerWrapper) {
      this.headerWrapper.style.transform = '';
      this.headerWrapper.style.opacity = '';
    }

    delete this.dataset.netherMotionReady;

    if (this.sectionHeader) {
      this.sectionHeader.classList.remove(
        'scrolled-past-header',
        'shopify-section-header-hidden',
        'shopify-section-header-sticky',
        'animate'
      );
    }

    this.scrollState = resetState;
  }

  animateHideReveal(hidden) {
    if (!this.headerWrapper) return;

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
      this.headerWrapper.style.transform = hidden ? 'translateY(-100%)' : '';
      return;
    }

    this.hideTween?.kill();

    this.hideTween = gsap.to(this.headerWrapper, {
      y: hidden ? '-100%' : 0,
      duration: this.behaviorConfig.animationDuration,
      ease: hidden ? 'power2.in' : 'power2.out',
      overwrite: 'auto',
    });
  }

  setHeaderMetrics() {
    const heightSource = this.sectionHeader || this.header;

    if (!heightSource) return;

    const height = heightSource.offsetHeight;

    if (height > 0) {
      this.style.setProperty('--nether-header-height', `${height}px`);
      this.style.setProperty('--nether-header-active-height', `${height}px`);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }

  syncAnnouncementOffset() {
    if (this.dataset.announcementIntegration !== 'true') {
      this.style.setProperty('--nether-header-announcement-offset', '0px');
      return;
    }

    const announcementBar = document.querySelector('nether-announcement-bar:not([hidden]) .nether-announcement');

    if (!announcementBar) {
      this.style.setProperty('--nether-header-announcement-offset', '0px');
      return;
    }

    const offset = announcementBar.getBoundingClientRect().height;
    this.style.setProperty('--nether-header-announcement-offset', `${offset}px`);
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(this.dataset.sectionId, {
      type: 'header',
      element: this,
      init: () => {
        this.parseBehaviorConfig();
        this.destroyBehaviorSystem();
        this.initBehaviorSystem();
        this.setHeaderMetrics();
        this.onScrollRaf();
      },
      destroy: () => {
        this.destroyBehaviorSystem();
        this.resetBehaviorState();
      },
    });
  }

  /**
   * Apply reusable framework header state classes.
   * @param {Object|string} state
   */
  applyStateClasses(state) {
    const states =
      typeof state === 'string'
        ? { [state]: true }
        : {
            transparent: !!state.transparent,
            solid: !!state.solid,
            sticky: !!state.sticky,
            shrunk: !!state.shrunk,
            hidden: !!state.hidden,
            scrolled: !!state.scrolled,
          };

    this.classList.toggle('is-transparent', states.transparent);
    this.classList.toggle('is-solid', states.solid);
    this.classList.toggle('is-sticky', states.sticky);
    this.classList.toggle('is-shrunk', states.shrunk);
    this.classList.toggle('is-hidden', states.hidden);
    this.classList.toggle('is-scrolled', states.scrolled);

    this.classList.toggle('is-nether-header-transparent', states.transparent);
    this.classList.toggle('is-nether-header-solid', states.solid);
    this.classList.toggle('is-nether-header-shrunk', states.shrunk);
    this.classList.toggle('is-nether-header-hidden', states.hidden);

    this.dataset.netherScrollState = Object.entries(states)
      .filter(([, active]) => active)
      .map(([name]) => name)
      .join(' ');
  }

  /**
   * Reserved API for programmatic scroll-state control.
   * @param {'transparent'|'solid'|'sticky'|'shrunk'|'hidden'|'scrolled'|Object} state
   */
  setScrollState(state) {
    if (typeof state === 'string') {
      const mapped = {
        normal: { transparent: false, solid: true, sticky: false, shrunk: false, hidden: false, scrolled: false },
        transparent: { transparent: true, solid: false, sticky: false, shrunk: false, hidden: false, scrolled: false },
        solid: { transparent: false, solid: true, sticky: false, shrunk: false, hidden: false, scrolled: true },
        sticky: { transparent: false, solid: true, sticky: true, shrunk: false, hidden: false, scrolled: true },
        shrink: { transparent: false, solid: true, sticky: true, shrunk: true, hidden: false, scrolled: true },
        hidden: { transparent: false, solid: true, sticky: true, shrunk: false, hidden: true, scrolled: true },
      };

      this.applyScrollStates(mapped[state] || mapped.normal, window.scrollY || 0);
      return;
    }

    this.applyScrollStates(state, window.scrollY || 0);
  }
}

if (!customElements.get('nether-header')) {
  customElements.define('nether-header', NetherHeader);
}
