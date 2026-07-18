/**
 * Nether Premium Cart Commerce Framework
 * Extends Dawn cart-drawer / cart-items — does not replace native Shopify commerce.
 */

class NetherCartFrameworkBase extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;
    this.motionReady = false;
    this.drawerTween = null;
    this.itemTweens = [];
    this.summaryTween = null;
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.hostCart = this.querySelector('cart-drawer') || this.querySelector('cart-items');
    this.animateTargets = this.querySelectorAll('[data-nether-cart-animate]');
    this.lineItems = this.querySelectorAll('[data-nether-cart-line-item]');

    this.parseConfig();
    this.bindEvents();
    this.registerMotion();
    this.initMotionEngine();
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    this.unbindEvents();
    this.killMotionTweens();
    window.NetherMotion?.unregisterSection?.(this.motionKey);
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      animationStyle: dataset.animationStyle || 'fade',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
      enableSticky: dataset.enableSticky === 'true',
      layout: dataset.cartLayout || 'split',
      drawerStyle: dataset.drawerStyle || 'standard',
    };

    this.motionKey = `${dataset.sectionId || 'cart'}-${this.tagName === 'NETHER-CART-DRAWER' ? 'drawer' : 'page'}`;
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  bindEvents() {
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.handleCartUpdate);
    }

    if (this.tagName === 'NETHER-CART-DRAWER' && this.hostCart) {
      this.drawerObserver = new MutationObserver(() => {
        if (this.hostCart.classList.contains('active')) {
          this.handleDrawerOpen();
        } else if (this.isDrawerOpen) {
          this.handleDrawerClose();
        }
      });

      this.drawerObserver.observe(this.hostCart, { attributes: true, attributeFilter: ['class'] });
    }

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  unbindEvents() {
    this.cartUpdateUnsubscriber?.();
    this.drawerObserver?.disconnect();
  }

  handleSectionLoad(event) {
    if (event.detail?.sectionId !== this.dataset.sectionId) return;

    this.killMotionTweens();
    this.lineItems = this.querySelectorAll('[data-nether-cart-line-item]');
    this.animateTargets = this.querySelectorAll('[data-nether-cart-animate]');
    this.parseConfig();
    this.initMotionEngine();
  }

  handleCartUpdate() {
    if (this.prefersReducedMotion()) return;

    requestAnimationFrame(() => {
      this.lineItems = this.querySelectorAll('[data-nether-cart-line-item]');
      this.animateLineItems(true);
    });
  }

  handleDrawerOpen() {
    if (this.isDrawerOpen) return;
    this.isDrawerOpen = true;
    this.initDrawerMotion();
  }

  handleDrawerClose() {
    this.isDrawerOpen = false;
    this.killMotionTweens();
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(this.motionKey, {
      type: this.tagName === 'NETHER-CART-DRAWER' ? 'cart-drawer' : 'cart-page',
      element: this,
      init: () => {
        this.parseConfig();
        this.initMotionEngine();
      },
      destroy: () => {
        this.killMotionTweens();
      },
    });
  }

  initMotionEngine() {
    if (this.prefersReducedMotion()) {
      this.setReducedMotionState();
      return;
    }

    window.NetherMotion?.whenReady?.(() => {
      if (typeof gsap === 'undefined') {
        this.setReducedMotionState();
        return;
      }

      if (this.tagName === 'NETHER-CART-PAGE') {
        this.animatePageEntrance();
      }

      this.animateLineItems(false);
      this.initQuantityHover();
    }, this);
  }

  setReducedMotionState() {
    this.dataset.netherMotionReady = 'reduced';
    this.animateTargets.forEach((node) => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    });
  }

  animatePageEntrance() {
    const duration = this.config.animationDuration;
    const style = this.config.animationStyle;

    if (style === 'none') return;

    const header = this.querySelector('[data-nether-cart-module="header"]');
    const items = this.querySelector('[data-nether-cart-module="summary"]')?.previousElementSibling;
    const summary = this.querySelector('[data-nether-cart-module="summary"]');

    if (style === 'stagger') {
      this.summaryTween = gsap.from([header, this.lineItems, summary].filter(Boolean), {
        opacity: 0,
        y: 16,
        duration,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
      });
      return;
    }

    const fromVars = style === 'slide' ? { opacity: 0, x: 24 } : { opacity: 0, y: 20 };

    this.summaryTween = gsap.from(this.animateTargets, {
      ...fromVars,
      duration,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'transform',
    });
  }

  initDrawerMotion() {
    if (this.prefersReducedMotion() || typeof gsap === 'undefined') return;

    const panel = this.querySelector('.nether-cart-drawer__inner');
    const duration = this.config.animationDuration;

    this.drawerTween = gsap.fromTo(
      panel,
      { x: this.config.drawerStyle === 'minimal' ? 0 : 40, opacity: 0.96 },
      { x: 0, opacity: 1, duration, ease: 'power3.out' }
    );

    this.animateLineItems(true);
  }

  animateLineItems(isUpdate) {
    if (this.prefersReducedMotion() || typeof gsap === 'undefined') return;

    this.itemTweens.forEach((tween) => tween.kill());
    this.itemTweens = [];

    const targets = isUpdate ? this.lineItems : this.lineItems;
    if (!targets.length) return;

    this.itemTweens.push(
      gsap.from(targets, {
        opacity: 0,
        y: 12,
        duration: Math.min(this.config.animationDuration, 0.45),
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'transform',
      })
    );
  }

  initQuantityHover() {
    if (this.prefersReducedMotion()) return;

    this.querySelectorAll('[data-nether-cart-quantity]').forEach((quantity) => {
      quantity.addEventListener('mouseenter', () => {
        if (typeof gsap === 'undefined') return;
        gsap.to(quantity, { scale: 1.02, duration: 0.2, ease: 'power1.out' });
      });
      quantity.addEventListener('mouseleave', () => {
        if (typeof gsap === 'undefined') return;
        gsap.to(quantity, { scale: 1, duration: 0.2, ease: 'power1.out' });
      });
    });
  }

  killMotionTweens() {
    this.drawerTween?.kill();
    this.summaryTween?.kill();
    this.itemTweens.forEach((tween) => tween.kill());
    this.drawerTween = null;
    this.summaryTween = null;
    this.itemTweens = [];
  }
}

class NetherCartPage extends NetherCartFrameworkBase {}

class NetherCartDrawer extends NetherCartFrameworkBase {}

if (!customElements.get('nether-cart-page')) {
  customElements.define('nether-cart-page', NetherCartPage);
}

if (!customElements.get('nether-cart-drawer')) {
  customElements.define('nether-cart-drawer', NetherCartDrawer);
}

