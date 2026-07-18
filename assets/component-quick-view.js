/**
 * Nether Premium Quick View Commerce Framework
 * Extends Dawn quick-add fetch pattern — does not replace Product Form, Variants, Cart, or Product Page.
 *
 * Architecture:
 * - NetherQuickView (events + extension hooks)
 * - <nether-quick-view> singleton modal (lazy product-info)
 * - <nether-quick-view-trigger> open control
 * - Reuses product-info / product-form / media-gallery / Nether Product Page inside modal
 */

(() => {
  const EVENT_OPEN = 'nether:quick-view:open';
  const EVENT_CLOSE = 'nether:quick-view:close';
  const EVENT_LOAD = 'nether:quick-view:load';
  const EVENT_ERROR = 'nether:quick-view:error';

  const defaultI18n = {
    title: 'Quick view',
    open: 'Quick view',
    close: 'Close',
    loading: 'Loading product…',
    error: 'Unable to load this product. Please try again.',
    viewFull: 'View full details',
    share: 'Share',
    shareCopied: 'Link copied',
  };

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function parseJsonScript(root, selector) {
    const node = root?.querySelector?.(selector);
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  }

  function parseBool(value, fallback = false) {
    if (value === null || value === undefined || value === '') return fallback;
    return value === true || value === 'true';
  }

  const NetherQuickView = {
    ready: false,
    listeners: new Set(),
    i18n: { ...defaultI18n },
    currentUrl: null,
    extensions: {
      onAnalytics: null,
      onShare: null,
      onRecentlyViewed: null,
      onPersonalization: null,
      onBundles: null,
      onUpsells: null,
      onRecommendations: null,
    },

    init() {
      if (this.ready) return this;
      this.ready = true;
      return this;
    },

    extend(partial = {}) {
      Object.assign(this.extensions, partial);
      return this;
    },

    mergeI18n(partial = {}) {
      Object.assign(this.i18n, partial);
      return this;
    },

    on(callback) {
      if (typeof callback !== 'function') return () => {};
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    },

    emit(type, detail = {}) {
      const payload = { type, ...detail };
      this.listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.warn('[NetherQuickView] listener error', error);
        }
      });
      document.dispatchEvent(new CustomEvent(type, { detail: payload }));
      if (type === EVENT_OPEN || type === EVENT_LOAD || type === EVENT_CLOSE || type === EVENT_ERROR) {
        try {
          this.extensions.onAnalytics?.(payload);
        } catch (error) {
          /* extension optional */
        }
      }
    },

    open(triggerOrUrl) {
      const modal = document.querySelector('nether-quick-view');
      if (!modal?.open) return;
      if (typeof triggerOrUrl === 'string') {
        modal.open({ dataset: { productUrl: triggerOrUrl } });
        return;
      }
      modal.open(triggerOrUrl);
    },

    close() {
      document.querySelector('nether-quick-view')?.close?.(true);
    },
  };

  window.NetherQuickView = NetherQuickView;

  class NetherQuickViewTrigger extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.control = this.querySelector('[data-nether-quick-view-open]');
      this.control?.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
      event.preventDefault();
      event.stopPropagation();
      const modal = document.querySelector('nether-quick-view');
      if (!modal) {
        const url = this.control?.dataset?.productUrl || this.dataset.productUrl;
        if (url) window.location.href = url;
        return;
      }
      modal.open(this.control || this);
    }
  }

  class NetherQuickViewModal extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      NetherQuickView.init();

      const i18n = parseJsonScript(this, '[data-nether-quick-view-i18n]');
      if (i18n) NetherQuickView.mergeI18n(i18n);

      this.isOpen = false;
      this.loadToken = 0;
      this.activeTrigger = null;
      this.openedBy = null;
      this.motionReady = false;
      this.openTween = null;
      this.closeTween = null;
      this.overlayTween = null;
      this.contentTween = null;

      this.panel = this.querySelector('[data-nether-quick-view-panel]');
      this.overlay = this.querySelector('[data-nether-quick-view-overlay]');
      this.content = this.querySelector('[data-nether-quick-view-content]');
      this.loading = this.querySelector('[data-nether-quick-view-loading]');
      this.error = this.querySelector('[data-nether-quick-view-error]');
      this.titleEl = this.querySelector('[data-nether-quick-view-title]');
      this.fullDetails = this.querySelector('[data-nether-quick-view-full-details]');
      this.shareButton = this.querySelector('[data-nether-quick-view-share]');

      this.config = {
        overlay: parseBool(this.dataset.enableOverlay, true),
        desktop: parseBool(this.dataset.desktop, true),
        tablet: parseBool(this.dataset.tablet, true),
        mobile: parseBool(this.dataset.mobile, true),
        animationStyle: this.dataset.animationStyle || 'fade',
        animationDuration: Number(this.dataset.animationDuration) || 0.35,
        modalWidth: Number(this.dataset.modalWidth) || 960,
        galleryLayout: this.dataset.galleryLayout || 'stacked',
        infoLayout: this.dataset.infoLayout || 'standard',
        showTrust: parseBool(this.dataset.showTrust, true),
        showQuickActions: parseBool(this.dataset.showQuickActions, true),
      };

      this.style.setProperty('--nether-quick-view-width', `${this.config.modalWidth}px`);

      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleOverlayClick = this.handleOverlayClick.bind(this);
      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleShare = this.handleShare.bind(this);
      this.handleDelegatedOpen = this.handleDelegatedOpen.bind(this);
      this.handleHeaderState = this.handleHeaderState.bind(this);
      this.onProductInfoLoaded = this.onProductInfoLoaded.bind(this);

      this.querySelectorAll('[data-nether-quick-view-close]').forEach((btn) => {
        btn.addEventListener('click', this.handleCloseClick);
      });
      this.overlay?.addEventListener('click', this.handleOverlayClick);
      this.shareButton?.addEventListener('click', this.handleShare);
      document.addEventListener('click', this.handleDelegatedOpen);
      document.addEventListener('nether:header:state', this.handleHeaderState);

      this.registerMotion();

      if (this.parentElement !== document.body) {
        document.body.appendChild(this);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('click', this.handleDelegatedOpen);
      document.removeEventListener('nether:header:state', this.handleHeaderState);
      document.removeEventListener('keydown', this.handleKeydown);
      this.killMotionTweens();
    }

    registerMotion() {
      const sectionId = this.dataset.sectionId || 'quick-view';
      window.NetherMotion?.registerSection?.(`${sectionId}-quick-view`, {
        type: 'quick-view',
        element: this,
        init: () => {
          this.motionReady = true;
          this.dataset.netherMotionReady = 'true';
        },
        destroy: () => {
          this.motionReady = false;
          this.killMotionTweens();
        },
      });
      window.NetherMotion?.whenReady?.(() => {
        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
      });
    }

    killMotionTweens() {
      this.openTween?.kill?.();
      this.closeTween?.kill?.();
      this.overlayTween?.kill?.();
      this.contentTween?.kill?.();
      this.openTween = null;
      this.closeTween = null;
      this.overlayTween = null;
      this.contentTween = null;
    }

    isBreakpointActive() {
      const width = window.innerWidth;
      if (width < 750) return this.config.mobile;
      if (width < 990) return this.config.tablet;
      return this.config.desktop;
    }

    handleDelegatedOpen(event) {
      const trigger = event.target.closest?.('[data-nether-quick-view-open]');
      if (!trigger) return;
      if (trigger.closest('nether-quick-view-trigger')) return;
      event.preventDefault();
      event.stopPropagation();
      this.open(trigger);
    }

    handleCloseClick(event) {
      event.preventDefault();
      this.close(true);
    }

    handleOverlayClick(event) {
      if (!this.config.overlay) return;
      if (event.target === this.overlay) this.close(true);
    }

    handleKeydown(event) {
      if (event.code?.toUpperCase() === 'ESCAPE') {
        event.preventDefault();
        this.close(true);
      }
    }

    handleHeaderState(event) {
      if (event.detail?.state?.hidden && this.isOpen) {
        this.close(false);
      }
    }

    setTriggerLoading(trigger, loading) {
      if (!trigger) return;
      trigger.setAttribute('aria-disabled', loading ? 'true' : 'false');
      trigger.classList.toggle('loading', loading);
      const spinner = trigger.querySelector('.loading__spinner');
      if (spinner) spinner.classList.toggle('hidden', !loading);
    }

    async open(opener) {
      if (this.isOpen && !opener) return;
      if (!this.isBreakpointActive()) {
        const url = opener?.dataset?.productUrl || opener?.getAttribute?.('data-product-url');
        if (url) window.location.href = url;
        return;
      }

      const productUrl = opener?.dataset?.productUrl || opener?.getAttribute?.('data-product-url');
      if (!productUrl) return;

      this.activeTrigger = opener;
      this.openedBy = opener;
      this.isOpen = true;
      this.hidden = false;
      this.removeAttribute('hidden');
      this.classList.add('is-open');
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', this.handleKeydown);

      this.showLoading(true);
      this.hideError();
      this.setTriggerLoading(opener, true);

      const focusTarget = this.querySelector('[data-nether-quick-view-close]') || this.panel;
      const trapContainer = this.panel || this;

      const afterVisible = () => {
        if (typeof trapFocus === 'function') trapFocus(trapContainer, focusTarget);
      };

      if (prefersReducedMotion() || this.config.animationStyle === 'none' || !this.motionReady || typeof gsap === 'undefined') {
        this.classList.add('is-visible');
        afterVisible();
      } else {
        this.killMotionTweens();
        this.classList.add('is-visible');
        if (this.config.animationStyle === 'slide') {
          gsap.set(this.panel, { y: 40, opacity: 0, scale: 1 });
          this.openTween = gsap.to(this.panel, {
            y: 0,
            opacity: 1,
            duration: this.config.animationDuration,
            ease: 'power3.out',
            onComplete: afterVisible,
          });
        } else {
          gsap.set(this.panel, { opacity: 0, scale: 0.97 });
          this.openTween = gsap.to(this.panel, {
            opacity: 1,
            scale: 1,
            duration: this.config.animationDuration,
            ease: 'power2.out',
            onComplete: afterVisible,
          });
        }
        if (this.overlay && this.config.overlay) {
          this.overlayTween = gsap.fromTo(
            this.overlay,
            { opacity: 0 },
            { opacity: 1, duration: this.config.animationDuration * 0.75, ease: 'power1.out' }
          );
        }
      }

      NetherQuickView.currentUrl = productUrl;
      NetherQuickView.emit(EVENT_OPEN, { url: productUrl, source: 'modal' });

      try {
        await this.loadProduct(productUrl);
      } finally {
        this.setTriggerLoading(opener, false);
      }
    }

    showLoading(show) {
      if (!this.loading) return;
      this.loading.hidden = !show;
    }

    hideError() {
      if (this.error) this.error.hidden = true;
    }

    showError() {
      if (this.error) this.error.hidden = false;
      this.showLoading(false);
    }

    async loadProduct(productUrl) {
      const token = ++this.loadToken;
      try {
        const productElement = await this.fetchProductInfo(productUrl);
        if (token !== this.loadToken) return;
        if (!productElement) throw new Error('product-info not found');

        this.preprocessHTML(productElement);

        if (typeof HTMLUpdateUtility?.setInnerHTML === 'function') {
          HTMLUpdateUtility.setInnerHTML(this.content, productElement.outerHTML);
        } else {
          this.content.innerHTML = productElement.outerHTML;
        }

        this.afterInject(productUrl);
        this.showLoading(false);

        if (!prefersReducedMotion() && this.motionReady && typeof gsap !== 'undefined') {
          const reveal = this.content.querySelector('product-info') || this.content;
          this.contentTween = gsap.fromTo(
            reveal,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: this.config.animationDuration * 0.85, ease: 'power2.out' }
          );
        }

        NetherQuickView.emit(EVENT_LOAD, { url: productUrl, source: 'modal' });
        try {
          NetherQuickView.extensions.onRecentlyViewed?.({ url: productUrl });
        } catch (error) {
          /* extension optional */
        }
      } catch (error) {
        console.warn('[NetherQuickView] load failed', error);
        this.showError();
        NetherQuickView.emit(EVENT_ERROR, { url: productUrl, error });
      }
    }

    /**
     * Prefer Section Rendering API (?section_id=) for a lighter payload.
     * Falls back to full product HTML when section render cannot supply product-info (Dawn-compatible).
     */
    async fetchProductInfo(productUrl) {
      const sectionId = this.dataset.productSectionId || 'main';
      let absoluteUrl;

      try {
        absoluteUrl = new URL(productUrl, window.location.origin);
      } catch (error) {
        absoluteUrl = null;
      }

      if (absoluteUrl && sectionId) {
        const sectionUrl = new URL(absoluteUrl.href);
        sectionUrl.searchParams.set('section_id', sectionId);
        try {
          const sectionResponse = await fetch(sectionUrl.toString());
          if (sectionResponse.ok) {
            const sectionText = await sectionResponse.text();
            const sectionHTML = new DOMParser().parseFromString(sectionText, 'text/html');
            const sectionProduct = sectionHTML.querySelector('product-info');
            if (sectionProduct) return sectionProduct;
          }
        } catch (error) {
          /* Fall through to full-page fetch */
        }
      }

      const response = await fetch(productUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const responseText = await response.text();
      const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
      return responseHTML.querySelector('product-info');
    }

    preprocessHTML(productElement) {
      productElement.classList.forEach((classApplied) => {
        if (classApplied.startsWith('color-') || classApplied === 'gradient') {
          this.content.classList.add(classApplied);
        }
      });

      this.preventDuplicatedIDs(productElement);
      this.removeDOMElements(productElement);
      this.removeGalleryListSemantic(productElement);
      this.updateImageSizes(productElement);
      this.preventVariantURLSwitching(productElement);
      this.applyQuickViewChrome(productElement);
    }

    preventVariantURLSwitching(productElement) {
      productElement.setAttribute('data-update-url', 'false');
    }

    removeDOMElements(productElement) {
      productElement.querySelector('pickup-availability')?.remove();
      productElement.querySelector('product-modal')?.remove();
      productElement.querySelectorAll('modal-dialog').forEach((modal) => modal.remove());
      productElement.querySelectorAll('[data-nether-product-page-sticky], .nether-product-page__sticky').forEach((el) =>
        el.remove()
      );
      productElement.querySelectorAll('product-recommendations').forEach((el) => el.remove());
    }

    preventDuplicatedIDs(productElement) {
      const sectionId = productElement.dataset.section;
      if (!sectionId) return;

      const oldId = sectionId;
      const newId = `quickview-${sectionId}`;
      productElement.innerHTML = productElement.innerHTML.replaceAll(oldId, newId);
      Array.from(productElement.attributes).forEach((attribute) => {
        if (attribute.value.includes(oldId)) {
          productElement.setAttribute(attribute.name, attribute.value.replace(oldId, newId));
        }
      });
      productElement.dataset.originalSection = sectionId;
    }

    removeGalleryListSemantic(productElement) {
      const galleryList = productElement.querySelector('[id^="Slider-Gallery"]');
      if (!galleryList) return;
      galleryList.setAttribute('role', 'presentation');
      galleryList.querySelectorAll('[id^="Slide-"]').forEach((li) => li.setAttribute('role', 'presentation'));
    }

    updateImageSizes(productElement) {
      const product = productElement.querySelector('.product');
      const desktopColumns = product?.classList.contains('product--columns');
      if (!desktopColumns) return;

      const mediaImages = product.querySelectorAll('.product__media img');
      if (!mediaImages.length) return;

      let mediaImageSizes =
        '(min-width: 1000px) 480px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';
      if (product.classList.contains('product--medium')) {
        mediaImageSizes = mediaImageSizes.replace('480px', '420px');
      } else if (product.classList.contains('product--small')) {
        mediaImageSizes = mediaImageSizes.replace('480px', '360px');
      }
      mediaImages.forEach((img) => img.setAttribute('sizes', mediaImageSizes));
    }

    applyQuickViewChrome(productElement) {
      productElement.classList.add('nether-quick-view__product');
      const page = productElement.querySelector('nether-product-page');
      if (page) {
        page.classList.add('nether-quick-view__product-page');
        page.dataset.quickView = 'true';
      }
      productElement.querySelector('.product__view-details')?.classList.add('nether-quick-view__native-view-details');
    }

    afterInject(productUrl) {
      if (window.Shopify?.PaymentButton) {
        Shopify.PaymentButton.init();
      }
      if (window.ProductModel) window.ProductModel.loadShopifyXR();

      this.content.querySelector('product-component')?.dispatchViewEvent?.();

      const productInfo = this.content.querySelector('product-info');
      productInfo?.addEventListener('product-info:loaded', this.onProductInfoLoaded);

      const title =
        this.activeTrigger?.dataset?.productTitle ||
        productInfo?.querySelector('.product__title')?.textContent?.trim() ||
        NetherQuickView.i18n.title;
      if (this.titleEl) this.titleEl.textContent = title;

      if (this.fullDetails) {
        this.fullDetails.hidden = false;
        this.fullDetails.href = productUrl;
      }

      if (this.shareButton) {
        this.shareButton.hidden = false;
        this.shareButton.dataset.shareUrl = productUrl;
      }

      this.bindWishlistCompare(productInfo);
    }

    onProductInfoLoaded() {
      /* product-info ready — variants / form wired by Dawn */
    }

    bindWishlistCompare(productInfo) {
      const wishlistSlot = this.querySelector('[data-nether-quick-view-wishlist-slot]');
      const compareSlot = this.querySelector('[data-nether-quick-view-compare-slot]');
      const productId = productInfo?.dataset?.productId;
      if (!productId) return;

      const sourceWishlist = document.querySelector(
        `nether-wishlist-button[data-product-id="${productId}"]`
      );
      if (wishlistSlot && sourceWishlist && window.customElements.get('nether-wishlist-button')) {
        wishlistSlot.hidden = false;
        wishlistSlot.innerHTML = '';
        const clone = sourceWishlist.cloneNode(true);
        clone.classList.add('nether-quick-view__wishlist-button');
        wishlistSlot.appendChild(clone);
      }

      const sourceCompare = document.querySelector(
        `nether-compare-button[data-product-id="${productId}"]`
      );
      if (compareSlot && sourceCompare && window.customElements.get('nether-compare-button')) {
        compareSlot.hidden = false;
        compareSlot.innerHTML = '';
        const clone = sourceCompare.cloneNode(true);
        clone.classList.add('nether-quick-view__compare-button');
        compareSlot.appendChild(clone);
      }
    }

    async handleShare() {
      const url = this.shareButton?.dataset?.shareUrl || NetherQuickView.currentUrl;
      if (!url) return;

      const shareData = {
        title: this.titleEl?.textContent || document.title,
        url: new URL(url, window.location.origin).href,
      };

      try {
        if (typeof NetherQuickView.extensions.onShare === 'function') {
          await NetherQuickView.extensions.onShare(shareData);
          return;
        }
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
        await navigator.clipboard?.writeText?.(shareData.url);
        const label = this.shareButton.querySelector('.nether-quick-view__share-label');
        if (label) {
          const previous = label.textContent;
          label.textContent = NetherQuickView.i18n.shareCopied;
          setTimeout(() => {
            label.textContent = previous;
          }, 1600);
        }
      } catch (error) {
        /* user cancel or clipboard blocked */
      }
    }

    close(restoreFocus = true) {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.loadToken += 1;
      document.removeEventListener('keydown', this.handleKeydown);

      const finish = () => {
        this.classList.remove('is-open', 'is-visible');
        this.hidden = true;
        this.setAttribute('hidden', '');
        document.body.classList.remove('overflow-hidden');
        if (this.content) {
          this.content.innerHTML = '';
          this.content.className = 'nether-quick-view__content';
        }
        this.showLoading(false);
        this.hideError();
        if (this.fullDetails) this.fullDetails.hidden = true;
        if (this.shareButton) this.shareButton.hidden = true;
        if (this.titleEl) this.titleEl.textContent = NetherQuickView.i18n.title;

        if (typeof removeTrapFocus === 'function') removeTrapFocus(this.openedBy);
        else if (restoreFocus) this.openedBy?.focus?.();

        NetherQuickView.currentUrl = null;
        NetherQuickView.emit(EVENT_CLOSE, { source: 'modal' });

        const cartNotification =
          document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        if (cartNotification?.setActiveElement && this.openedBy) {
          cartNotification.setActiveElement(this.openedBy);
        }
      };

      if (prefersReducedMotion() || this.config.animationStyle === 'none' || !this.motionReady || typeof gsap === 'undefined') {
        finish();
        return;
      }

      this.killMotionTweens();
      this.closeTween = gsap.to(this.panel, {
        opacity: 0,
        y: this.config.animationStyle === 'slide' ? 24 : 0,
        scale: this.config.animationStyle === 'fade' ? 0.98 : 1,
        duration: this.config.animationDuration * 0.85,
        ease: 'power2.in',
        onComplete: finish,
      });
      if (this.overlay && this.config.overlay) {
        this.overlayTween = gsap.to(this.overlay, {
          opacity: 0,
          duration: this.config.animationDuration * 0.65,
          ease: 'power1.in',
        });
      }
    }
  }

  customElements.get('nether-quick-view-trigger') ||
    customElements.define('nether-quick-view-trigger', NetherQuickViewTrigger);
  customElements.get('nether-quick-view') ||
    customElements.define('nether-quick-view', NetherQuickViewModal);

  NetherQuickView.init();
})();
