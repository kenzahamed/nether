/**
 * Nether Premium Wishlist Commerce Framework
 * Extends Shopify commerce roots — does not replace Product Form, Cart, Variants, or Checkout.
 *
 * Architecture:
 * - NetherWishlist (store + events + adapter hooks) via NetherCommerceInteraction
 * - Guest baseline adapter (local key/value) for toggle/count/drawer/page
 * - Extension points for sync, account, apps, analytics, sharing, notifications
 * - <nether-wishlist-button>, <nether-wishlist-drawer>, <nether-wishlist-page>
 */

(() => {
  const Interaction = window.NetherCommerceInteraction;
  if (!Interaction) {
    console.warn('[NetherWishlist] NetherCommerceInteraction base is required.');
    return;
  }

  const {
    prefersReducedMotion,
    createGuestListStore,
    itemFromButton,
    syncCountBubbles,
    createListUIBase,
  } = Interaction;

  const STORAGE_KEY = 'nether:wishlist:v1';
  const EVENT_CHANGE = 'nether:wishlist:change';
  const EVENT_OPEN = 'nether:wishlist:open';
  const EVENT_CLOSE = 'nether:wishlist:close';

  const defaultI18n = {
    title: 'Wishlist',
    countOne: '{{ count }} item',
    countOther: '{{ count }} items',
    add: 'Add to wishlist',
    remove: 'Remove from wishlist',
    clear: 'Clear wishlist',
    moveToCart: 'Move to cart',
    moving: 'Moving…',
    moved: 'Moved to cart',
    unavailable: 'Unavailable',
    available: 'Available',
    error: 'Something went wrong. Please try again.',
    liveAdd: 'Added to wishlist',
    liveRemove: 'Removed from wishlist',
  };

  const NetherWishlist = createGuestListStore({
    storageKey: STORAGE_KEY,
    eventChange: EVENT_CHANGE,
    defaultI18n,
    analyticsPrefix: 'wishlist',
    cartSource: 'nether-wishlist',
    warnLabel: '[NetherWishlist]',
    addReturnsResult: false,
  });

  window.NetherWishlist = NetherWishlist;

  class NetherWishlistButton extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.control = this.querySelector('[data-nether-wishlist-control]');
      this.labelNode = this.querySelector('[data-nether-wishlist-label]');
      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);

      this.control?.addEventListener('click', this.handleClick);
      this.unsubscribe = NetherWishlist.on(this.handleChange);

      NetherWishlist.init().then(() => this.syncState());
    }

    disconnectedCallback() {
      this.control?.removeEventListener('click', this.handleClick);
      this.unsubscribe?.();
    }

    syncState() {
      const active = NetherWishlist.has(this.dataset.productId, this.dataset.variantId);
      const label = active ? this.dataset.labelRemove : this.dataset.labelAdd;
      this.classList.toggle('is-active', active);
      this.control?.setAttribute('aria-pressed', active ? 'true' : 'false');
      this.control?.setAttribute('aria-label', label || '');
      if (this.labelNode) this.labelNode.textContent = label || '';
    }

    async handleClick(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.classList.contains('is-busy')) return;

      this.classList.add('is-busy');
      try {
        if (!prefersReducedMotion()) {
          this.control?.classList.add('is-animating');
          window.NetherMotion?.whenReady?.(() => {
            if (typeof gsap === 'undefined') return;
            gsap.fromTo(
              this.querySelector('.nether-wishlist-button__icon'),
              { scale: 1 },
              { scale: 1.2, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' }
            );
          });
        }

        await NetherWishlist.toggle(itemFromButton(this), {
          source: this.dataset.wishlistContext || 'button',
        });
      } finally {
        this.classList.remove('is-busy');
        this.syncState();
      }
    }

    handleChange() {
      this.syncState();
    }
  }

  const NetherWishlistUIBase = createListUIBase({
    getStore: () => NetherWishlist,
    namespace: 'wishlist',
    i18nSelector: '[data-nether-wishlist-i18n]',
    drawerTag: 'NETHER-WISHLIST-DRAWER',
    motionDrawerType: 'wishlist-drawer',
    motionPageType: 'wishlist-page',
  });

  class NetherWishlistDrawer extends NetherWishlistUIBase {
    constructor() {
      super();
      this.isOpen = false;
      this.motionReady = false;
      this.openTween = null;
      this.closeTween = null;
      this.overlayTween = null;

      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleOverlayClick = this.handleOverlayClick.bind(this);
      this.handleTriggerClick = this.handleTriggerClick.bind(this);
      this.handleHeaderState = this.handleHeaderState.bind(this);
      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleExternalOpen = this.handleExternalOpen.bind(this);
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
    }

    connectedCallback() {
      if (this.initialized) return;
      super.connectedCallback();

      this.panel = this.querySelector('[data-nether-wishlist-panel]');
      this.overlay = this.querySelector('[data-nether-wishlist-overlay]');

      this.parseDrawerConfig();
      this.bindTriggers();
      this.overlay?.addEventListener('click', this.handleOverlayClick);
      this.addEventListener('click', this.handleCloseClick);
      document.addEventListener('nether:header:state', this.handleHeaderState);
      document.addEventListener(EVENT_OPEN, this.handleExternalOpen);
      this.initMotionEngine();

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.unbindTriggers();
      this.overlay?.removeEventListener('click', this.handleOverlayClick);
      this.removeEventListener('click', this.handleCloseClick);
      document.removeEventListener('keydown', this.handleKeydown);
      document.removeEventListener('nether:header:state', this.handleHeaderState);
      document.removeEventListener(EVENT_OPEN, this.handleExternalOpen);
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.killMotionTweens();
    }

    parseDrawerConfig() {
      const dataset = this.dataset;
      this.drawerConfig = {
        overlay: dataset.enableOverlay !== 'false',
        desktop: dataset.desktop !== 'false',
        tablet: dataset.tablet !== 'false',
        mobile: dataset.mobile !== 'false',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.3,
        drawerWidth: Number.parseInt(dataset.drawerWidth, 10) || 420,
      };
      this.style.setProperty('--nether-wishlist-drawer-width', `${this.drawerConfig.drawerWidth}px`);
      this.style.setProperty('--nether-wishlist-duration', `${this.drawerConfig.animationDuration}s`);
    }

    parseConfig() {
      super.parseConfig();
      this.parseDrawerConfig();
    }

    isBreakpointActive() {
      const width = window.innerWidth;
      if (width >= 990) return this.drawerConfig.desktop;
      if (width >= 750) return this.drawerConfig.tablet;
      return this.drawerConfig.mobile;
    }

    bindTriggers() {
      this.triggers = document.querySelectorAll('[data-nether-wishlist-open]');
      this.triggers.forEach((trigger) => {
        trigger.addEventListener('click', this.handleTriggerClick);
        trigger.addEventListener('keydown', this.handleTriggerKeydownBound(this));
      });
    }

    unbindTriggers() {
      this.triggers?.forEach((trigger) => {
        trigger.removeEventListener('click', this.handleTriggerClick);
      });
    }

    handleTriggerKeydown(event) {
      if (event.code.toUpperCase() === 'SPACE' || event.code.toUpperCase() === 'ENTER') {
        event.preventDefault();
        this.open(event.currentTarget);
      }
    }

    handleTriggerClick(event) {
      event.preventDefault();
      this.open(event.currentTarget);
    }

    handleExternalOpen() {
      this.open();
    }

    handleOverlayClick() {
      if (this.drawerConfig.overlay) this.close();
    }

    handleCloseClick(event) {
      if (event.target.closest('[data-nether-wishlist-close]')) {
        event.preventDefault();
        this.close();
      }
    }

    handleKeydown(event) {
      if (event.code.toUpperCase() === 'ESCAPE') this.close();
    }

    handleHeaderState(event) {
      if (event.detail?.state?.hidden && this.isOpen) {
        this.close(false);
      }
    }

    handleSectionLoad(event) {
      if (event.detail.sectionId === this.dataset.sectionId) {
        this.parseConfig();
        this.unbindTriggers();
        this.bindTriggers();
      }
    }

    initMotionEngine() {
      if (prefersReducedMotion() || !window.NetherMotion?.load) return;
      window.NetherMotion.load([]).then(() => {
        this.motionReady = typeof gsap !== 'undefined';
        if (this.motionReady) this.dataset.netherMotionReady = 'true';
      });
    }

    killMotionTweens() {
      this.openTween?.kill();
      this.closeTween?.kill();
      this.overlayTween?.kill();
      this.openTween = null;
      this.closeTween = null;
      this.overlayTween = null;
    }

    syncAnnouncementOffset() {
      const netherHeader = document.querySelector('nether-header');
      const offset =
        netherHeader?.style.getPropertyValue('--nether-header-announcement-offset') ||
        getComputedStyle(netherHeader || document.documentElement).getPropertyValue(
          '--nether-header-announcement-offset'
        );
      if (offset) {
        this.style.setProperty('--nether-wishlist-announcement-offset', offset.trim() || '0px');
      }
    }

    setTriggerExpanded(expanded) {
      this.triggers?.forEach((trigger) => {
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    }

    open(trigger) {
      if (this.isOpen || !this.isBreakpointActive()) return;

      this.syncAnnouncementOffset();
      this.activeTrigger = trigger || document.querySelector('[data-nether-wishlist-open]');
      this.isOpen = true;
      this.hidden = false;
      this.removeAttribute('hidden');
      this.classList.add('is-open');
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', this.handleKeydown);
      this.setTriggerExpanded(true);
      this.render();

      const focusTarget = this.querySelector('[data-nether-wishlist-close]') || this.panel;
      const trapContainer = this.panel || this;

      if (prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
        this.classList.add('is-visible');
        if (typeof trapFocus === 'function') trapFocus(trapContainer, focusTarget);
        NetherWishlist.emit(EVENT_OPEN, { source: 'drawer' });
        return;
      }

      this.killMotionTweens();
      gsap.set(this.panel, { xPercent: 100 });
      this.classList.add('is-visible');
      this.openTween = gsap.to(this.panel, {
        xPercent: 0,
        duration: this.drawerConfig.animationDuration,
        ease: 'power3.out',
        onComplete: () => {
          if (typeof trapFocus === 'function') trapFocus(trapContainer, focusTarget);
        },
      });
      if (this.overlay && this.drawerConfig.overlay) {
        this.overlayTween = gsap.fromTo(
          this.overlay,
          { opacity: 0 },
          { opacity: 1, duration: this.drawerConfig.animationDuration * 0.8, ease: 'power1.out' }
        );
      }
      NetherWishlist.emit(EVENT_OPEN, { source: 'drawer' });
    }

    close(restoreFocus = true) {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.setTriggerExpanded(false);
      document.removeEventListener('keydown', this.handleKeydown);

      const finish = () => {
        this.classList.remove('is-open', 'is-visible');
        this.hidden = true;
        this.setAttribute('hidden', '');
        document.body.classList.remove('overflow-hidden');
        if (typeof removeTrapFocus === 'function') removeTrapFocus(this.activeTrigger);
        else if (restoreFocus) this.activeTrigger?.focus?.();
        NetherWishlist.emit(EVENT_CLOSE, { source: 'drawer' });
      };

      if (prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
        finish();
        return;
      }

      this.killMotionTweens();
      this.closeTween = gsap.to(this.panel, {
        xPercent: 100,
        duration: this.drawerConfig.animationDuration,
        ease: 'power3.in',
        onComplete: finish,
      });
      if (this.overlay && this.drawerConfig.overlay) {
        this.overlayTween = gsap.to(this.overlay, {
          opacity: 0,
          duration: this.drawerConfig.animationDuration * 0.7,
          ease: 'power1.in',
        });
      }
    }
  }

  class NetherWishlistPage extends NetherWishlistUIBase {
    connectedCallback() {
      if (this.initialized) return;
      super.connectedCallback();
      this.initPageMotion();
    }

    initPageMotion() {
      if (prefersReducedMotion() || this.config.animationStyle === 'none') return;
      window.NetherMotion?.whenReady?.(() => {
        if (typeof gsap === 'undefined') return;
        const targets = this.querySelectorAll('[data-nether-wishlist-animate]');
        if (!targets.length) return;
        gsap.fromTo(
          targets,
          { opacity: 0, y: this.config.animationStyle === 'rise' ? 20 : 0 },
          {
            opacity: 1,
            y: 0,
            duration: this.config.animationDuration,
            stagger: this.config.animationStyle === 'stagger' ? 0.08 : 0.04,
            ease: 'power2.out',
          }
        );
      });
    }
  }

  function bootstrapCounts() {
    NetherWishlist.init().then(() => {
      syncCountBubbles('wishlist', NetherWishlist.count(), NetherWishlist.i18n, (c, i) =>
        NetherWishlist.formatCount(c, i)
      );
    });
  }

  customElements.get('nether-wishlist-button') ||
    customElements.define('nether-wishlist-button', NetherWishlistButton);
  customElements.get('nether-wishlist-drawer') ||
    customElements.define('nether-wishlist-drawer', NetherWishlistDrawer);
  customElements.get('nether-wishlist-page') ||
    customElements.define('nether-wishlist-page', NetherWishlistPage);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapCounts, { once: true });
  } else {
    bootstrapCounts();
  }
})();
