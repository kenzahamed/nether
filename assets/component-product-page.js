/**
 * Nether Premium Product Page Commerce Framework
 * Extends Dawn main-product / product-info — does not replace native Shopify commerce.
 */

class NetherProductPage extends HTMLElement {
  constructor() {
    super();
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
    this.handleVariantChange = this.handleVariantChange.bind(this);
    this.handleStickySubmit = this.handleStickySubmit.bind(this);
    this.revealTween = null;
    this.galleryTween = null;
    this.stickyObserver = null;
    this.variantTween = null;
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.gallery = this.querySelector('[data-nether-product-page-module="gallery"]');
    this.buyBox = this.querySelector('[data-nether-product-page-buy-box]');
    this.purchaseAnchor = this.querySelector('[data-nether-product-page-purchase-anchor]');
    this.stickySummary = this.querySelector('[data-nether-product-page-sticky]');
    this.stickySubmit = this.querySelector('[data-nether-product-page-sticky-submit]');
    this.animateTargets = this.querySelectorAll('[data-nether-product-page-animate]');

    this.parseConfig();
    this.bindEvents();
    this.registerMotion();
    this.initStickySummary();
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    this.unbindEvents();
    this.killMotionTweens();
    this.teardownStickySummary();
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      animationStyle: dataset.animationStyle || 'fade',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
      enableSticky: dataset.enableSticky === 'true',
      layout: dataset.productPageLayout || 'classic',
    };
  }

  bindEvents() {
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, this.handleVariantChange);
    }

    this.stickySubmit?.addEventListener('click', this.handleStickySubmit);

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  unbindEvents() {
    this.variantChangeUnsubscriber?.();
    this.stickySubmit?.removeEventListener('click', this.handleStickySubmit);
  }

  handleSectionLoad(event) {
    if (event.detail?.sectionId === this.dataset.sectionId) {
      this.killMotionTweens();
      this.teardownStickySummary();
      this.parseConfig();
      this.initMotionEngine();
      this.initStickySummary();
    }
  }

  handleVariantChange(event) {
    if (String(event?.data?.sectionId) !== String(this.dataset.sectionId)) return;
    this.runVariantTransition();
    this.syncStickySubmitState();
    this.syncStickyPrice();
  }

  syncStickyPrice() {
    const priceRoot = document.getElementById(`price-${this.dataset.sectionId}`);
    const stickyPrice = this.querySelector('[data-nether-product-page-sticky-price]');
    if (!priceRoot || !stickyPrice) return;
    stickyPrice.innerHTML = priceRoot.innerHTML;
  }

  handleStickySubmit(event) {
    const nativeButton = document.getElementById(`ProductSubmitButton-${this.dataset.sectionId}`);
    if (nativeButton && !nativeButton.disabled) {
      event.preventDefault();
      nativeButton.click();
    }
  }

  syncStickySubmitState() {
    if (!this.stickySubmit) return;
    const nativeButton = document.getElementById(`ProductSubmitButton-${this.dataset.sectionId}`);
    if (!nativeButton) return;
    this.stickySubmit.disabled = nativeButton.disabled;
    this.stickySubmit.textContent = nativeButton.textContent;
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-product-page`, {
      type: 'product-page',
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

    const needsScrollTrigger = ['fade', 'slide', 'stagger', 'scale', 'gallery_reveal'].includes(
      this.config.animationStyle
    );
    const plugins = needsScrollTrigger ? ['scrollTrigger'] : [];

    window.NetherMotion.whenReady(
      (loaded) => {
        if (!loaded || typeof gsap === 'undefined') return;

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.runContentReveal();
        this.runGalleryReveal();
      },
      this
    );

    if (plugins.length && window.NetherMotion.load) {
      window.NetherMotion.load(plugins);
    }
  }

  runContentReveal() {
    if (!this.animateTargets.length) return;

    const targets = Array.from(this.animateTargets).filter(
      (node) => !node.closest('[data-nether-product-page-sticky]')
    );

    if (!targets.length) return;

    const style = this.config.animationStyle;
    const duration = this.config.animationDuration;

    if (style === 'stagger') {
      this.revealTween = gsap.from(targets, {
        opacity: 0,
        y: 24,
        duration,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this.buyBox || this,
          start: 'top 85%',
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
        trigger: this.buyBox || this,
        start: 'top 85%',
        once: true,
      },
    });
  }

  runGalleryReveal() {
    if (!this.gallery || this.config.animationStyle === 'none') return;

    this.galleryTween = gsap.from(this.gallery, {
      opacity: 0,
      x: this.config.layout === 'split' ? -24 : 0,
      y: this.config.layout === 'split' ? 0 : 24,
      duration: this.config.animationDuration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: this.gallery,
        start: 'top 85%',
        once: true,
      },
    });
  }

  runVariantTransition() {
    if (this.prefersReducedMotion() || typeof gsap === 'undefined') return;

    const priceNode = document.getElementById(`price-${this.dataset.sectionId}`);
    if (!priceNode) return;

    this.variantTween?.kill();
    this.variantTween = gsap.fromTo(
      priceNode,
      { opacity: 0.35, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }
    );
  }

  initStickySummary() {
    if (!this.config.enableSticky || !this.stickySummary || !this.purchaseAnchor) return;

    if (!('IntersectionObserver' in window)) {
      this.stickySummary.hidden = false;
      return;
    }

    this.stickyObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const showSticky = !entry.isIntersecting;
        this.stickySummary.hidden = !showSticky;
        this.stickySummary.classList.toggle('is-visible', showSticky);
        this.dataset.stickyVisible = showSticky ? 'true' : 'false';
      },
      { root: null, threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );

    this.stickyObserver.observe(this.purchaseAnchor);
    this.syncStickySubmitState();
  }

  teardownStickySummary() {
    this.stickyObserver?.disconnect();
    this.stickyObserver = null;
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
    this.galleryTween?.kill();
    this.variantTween?.kill();
    this.revealTween = null;
    this.galleryTween = null;
    this.variantTween = null;
  }
}

if (!customElements.get('nether-product-page')) {
  customElements.define('nether-product-page', NetherProductPage);
}
