/**
 * Nether Premium Collection Page Commerce Framework
 * Extends Dawn main-collection-* — does not replace native Shopify collection commerce.
 */

class NetherCollectionPage extends HTMLElement {
  constructor() {
    super();
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
    this.handleGridMutation = this.handleGridMutation.bind(this);
    this.revealTween = null;
    this.gridTween = null;
    this.filterTween = null;
    this.gridObserver = null;
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.gridContainer = document.getElementById('ProductGridContainer');
    this.grid = this.querySelector('[data-nether-collection-page-grid]');
    this.gridItems = this.querySelectorAll('[data-nether-collection-page-item]');
    this.filters = this.querySelector('[data-nether-collection-page-filters]');
    this.toolbar = this.querySelector('[data-nether-collection-page-toolbar]');
    this.animateTargets = this.querySelectorAll('[data-nether-collection-page-animate]');

    this.parseConfig();
    this.bindEvents();
    this.registerMotion();
    this.initGridObserver();
    this.initViewToggle();
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    this.gridObserver?.disconnect();
    this.killMotionTweens();
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      animationStyle: dataset.animationStyle || 'stagger',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
      enableStickyToolbar: dataset.enableStickyToolbar === 'true',
      defaultView: dataset.defaultView || 'grid',
      motionType: dataset.netherMotion || 'collection-page',
    };
  }

  bindEvents() {
    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  handleSectionLoad(event) {
    if (event.detail?.sectionId !== this.dataset.sectionId) return;

    this.killMotionTweens();
    this.gridItems = this.querySelectorAll('[data-nether-collection-page-item]');
    this.animateTargets = this.querySelectorAll('[data-nether-collection-page-animate]');
    this.parseConfig();
    this.initMotionEngine();
  }

  initGridObserver() {
    if (!this.gridContainer || !('MutationObserver' in window)) return;

    this.gridObserver = new MutationObserver(this.handleGridMutation);
    this.gridObserver.observe(this.gridContainer, { childList: true, subtree: true });
  }

  handleGridMutation() {
    if (this.gridMutationTimer) window.clearTimeout(this.gridMutationTimer);

    this.gridMutationTimer = window.setTimeout(() => {
      this.grid = this.querySelector('[data-nether-collection-page-grid]');
      this.gridItems = this.querySelectorAll('[data-nether-collection-page-item]');
      this.runGridReveal(true);
    }, 60);
  }

  initViewToggle() {
    const toggleRoot = this.querySelector('[data-nether-view-toggle]');
    if (!toggleRoot) {
      this.dataset.viewMode = this.config.defaultView || 'grid';
      return;
    }

    const applyView = (view) => {
      this.dataset.viewMode = view;
      toggleRoot.dataset.viewMode = view;
      toggleRoot.querySelectorAll('[data-view]').forEach((node) => {
        const isActive = node.dataset.view === view;
        node.classList.toggle('is-active', isActive);
        node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    applyView(this.config.defaultView || 'grid');

    toggleRoot.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.disabled) return;
        applyView(button.dataset.view);
      });
    });
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    const motionKey = this.config.motionType === 'collection-page-banner' ? 'banner' : 'grid';

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-collection-page-${motionKey}`, {
      type: 'collection-page',
      element: this,
      init: () => {
        this.parseConfig();
        this.initMotionEngine();
      },
      destroy: () => {
        this.killMotionTweens();
      },
    });

    this.initMotionEngine();
  }

  initMotionEngine() {
    if (this.prefersReducedMotion() || !window.NetherMotion?.whenReady) {
      this.setReducedMotionState();
      return;
    }

    const needsScrollTrigger = ['fade', 'slide', 'stagger', 'scale'].includes(this.config.animationStyle);
    const plugins = needsScrollTrigger ? ['scrollTrigger'] : [];

    window.NetherMotion.whenReady(
      (loaded) => {
        if (!loaded || typeof gsap === 'undefined') return;

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.runContentReveal();
        this.runFilterReveal();
        this.runGridReveal(false);
        this.initCardHover();
      },
      this
    );

    if (plugins.length && window.NetherMotion.load) {
      window.NetherMotion.load(plugins);
    }
  }

  runContentReveal() {
    const targets = Array.from(this.animateTargets).filter(
      (node) => !node.closest('[data-nether-collection-page-grid]')
    );

    if (!targets.length || this.config.animationStyle === 'none') return;

    const duration = this.config.animationDuration;
    const style = this.config.animationStyle;

    if (style === 'stagger') {
      this.revealTween = gsap.from(targets, {
        opacity: 0,
        y: 24,
        duration,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this,
          start: 'top 90%',
          once: true,
        },
      });
      return;
    }

    this.revealTween = gsap.from(targets, {
      opacity: 0,
      y: style === 'slide' ? 32 : 16,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: this,
        start: 'top 90%',
        once: true,
      },
    });
  }

  runFilterReveal() {
    if (!this.filters || this.config.animationStyle === 'none') return;

    this.filterTween = gsap.from(this.filters, {
      opacity: 0,
      x: this.classList.contains('nether-collection-page--filter-vertical') ? -16 : 0,
      y: this.classList.contains('nether-collection-page--filter-vertical') ? 0 : 12,
      duration: this.config.animationDuration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: this.filters,
        start: 'top 92%',
        once: true,
      },
    });
  }

  runGridReveal(isRefresh) {
    if (!this.gridItems?.length || this.config.animationStyle === 'none') return;
    if (this.config.motionType === 'collection-page-banner') return;

    if (isRefresh) {
      this.gridTween?.kill();
    }

    const duration = this.config.animationDuration;
    const style = this.config.animationStyle;
    const fromProps =
      style === 'scale'
        ? { opacity: 0, scale: 0.96 }
        : style === 'slide'
          ? { opacity: 0, y: 40 }
          : { opacity: 0, y: 24 };

    const tweenConfig = {
      ...fromProps,
      duration,
      stagger: style === 'stagger' || isRefresh ? 0.05 : 0,
      ease: 'power2.out',
    };

    if (!isRefresh) {
      tweenConfig.scrollTrigger = {
        trigger: this.grid || this.gridContainer,
        start: 'top 88%',
        once: true,
      };
    }

    this.gridTween = gsap.from(this.gridItems, tweenConfig);
  }

  initCardHover() {
    if (this.prefersReducedMotion()) return;

    this.querySelectorAll('[data-nether-product-card]').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -4, duration: 0.25, ease: 'power1.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.25, ease: 'power1.out' });
      });
    });
  }

  setReducedMotionState() {
    this.dataset.netherMotionReady = 'reduced';
    this.animateTargets.forEach((node) => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    });
  }

  killMotionTweens() {
    this.revealTween?.kill();
    this.gridTween?.kill();
    this.filterTween?.kill();
    this.revealTween = null;
    this.gridTween = null;
    this.filterTween = null;
  }
}

if (!customElements.get('nether-collection-page')) {
  customElements.define('nether-collection-page', NetherCollectionPage);
}
