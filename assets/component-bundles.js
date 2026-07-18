/**
 * Nether Premium Bundles & Product Packs Commerce Framework
 * Extends Shopify Cart AJAX — does not replace product-form or Dawn cart roots.
 */

class NetherBundles extends HTMLElement {
  constructor() {
    super();
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
    this.handleItemChange = this.handleItemChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.revealTween = null;
    this.staggerTween = null;
    this.hoverHandlers = [];
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    this.cacheElements();
    this.parseConfig();
    this.bindEvents();
    this.updateTotals();
    this.updateSummaryList();
    this.registerMotion();
    this.initExtensions();

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    this.unbindEvents();
    this.killMotionTweens();
    this.teardownHover();
  }

  cacheElements() {
    this.grid = this.querySelector('[data-nether-bundles-grid]');
    this.summary = this.querySelector('[data-nether-bundles-summary]');
    this.summaryList = this.querySelector('[data-nether-bundles-summary-list]');
    this.countEl = this.querySelector('[data-nether-bundles-count]');
    this.totalEl = this.querySelector('[data-nether-bundles-total]');
    this.compareEl = this.querySelector('[data-nether-bundles-compare]');
    this.savingsEl = this.querySelector('[data-nether-bundles-savings]');
    this.pricingLive = this.querySelector('[data-nether-bundles-pricing-live]');
    this.addButton = this.querySelector('[data-nether-bundles-add]');
    this.spinner = this.querySelector('[data-nether-bundles-spinner]');
    this.statusEl = this.querySelector('[data-nether-bundles-status]');
    this.errorEl = this.querySelector('[data-nether-bundles-error]');
    this.notesEl = this.querySelector('[data-nether-bundles-notes]');
    this.drawer = this.querySelector('[data-nether-bundles-drawer]');
    this.drawerBody = this.querySelector('[data-nether-bundles-drawer-body]');
    this.drawerOpenBtn = this.querySelector('[data-nether-bundles-drawer-open]');
    this.animateTargets = this.querySelectorAll('[data-nether-bundles-animate]');
    this.items = this.querySelectorAll('[data-nether-bundles-item]');
  }

  parseConfig() {
    const { dataset } = this;
    this.config = {
      animationStyle: dataset.animationStyle || 'stagger',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
      strategy: dataset.bundleStrategy || 'curated',
      layout: dataset.layout || 'split',
      moneyFormat: dataset.moneyFormat || '{{amount}}',
      currencyCode: dataset.currencyCode || '',
      discountPercent: Number.parseFloat(dataset.displayDiscountPercent) || 0,
      includeProperties: dataset.includeProperties === 'true',
    };
  }

  bindEvents() {
    this.addEventListener('change', this.handleItemChange);
    this.addEventListener('input', this.handleItemChange);
    this.addButton?.addEventListener('click', this.handleAdd);
    this.drawerOpenBtn?.addEventListener('click', this.handleDrawerOpen);
    this.drawer?.querySelector('[data-nether-bundles-drawer-close]')?.addEventListener('click', this.handleDrawerClose);
    this.drawer?.querySelector('[data-nether-bundles-drawer-overlay]')?.addEventListener('click', this.handleDrawerClose);
    document.addEventListener('keydown', this.handleKeydown);
  }

  unbindEvents() {
    this.removeEventListener('change', this.handleItemChange);
    this.removeEventListener('input', this.handleItemChange);
    this.addButton?.removeEventListener('click', this.handleAdd);
    this.drawerOpenBtn?.removeEventListener('click', this.handleDrawerOpen);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-bundles`, {
      type: 'bundles',
      element: this,
      init: () => {
        this.parseConfig();
        this.refreshTargets();
        this.initMotionEngine();
      },
      destroy: () => {
        this.killMotionTweens();
        this.teardownHover();
      },
    });

    this.initMotionEngine();
  }

  refreshTargets() {
    this.cacheElements();
  }

  initMotionEngine() {
    if (this.config.animationStyle === 'none' || this.prefersReducedMotion() || !window.NetherMotion?.whenReady) {
      this.setReducedMotionState();
      return;
    }

    window.NetherMotion.whenReady((loaded) => {
      if (!loaded || typeof gsap === 'undefined') return;
      this.motionReady = true;
      this.dataset.netherMotionReady = 'true';
      this.runReveal();
      this.initHover();
    }, this);

    if (window.NetherMotion.load) {
      window.NetherMotion.load(['scrollTrigger']);
    }
  }

  setReducedMotionState() {
    this.animateTargets.forEach((target) => {
      target.style.opacity = '1';
      target.style.transform = 'none';
    });
    this.classList.add('nether-bundles--motion-reduced');
  }

  getRevealFromProps() {
    switch (this.config.animationStyle) {
      case 'slide':
        return { opacity: 0, y: 48 };
      case 'fade':
        return { opacity: 0, y: 16 };
      case 'stagger':
      default:
        return { opacity: 0, y: 28 };
    }
  }

  runReveal() {
    if (!this.motionReady) return;

    this.killMotionTweens();
    this.refreshTargets();

    const duration = this.config.animationDuration;
    const fromProps = this.getRevealFromProps();
    const cardWraps = this.querySelectorAll('[data-nether-bundles-item-wrap]');
    const targets = cardWraps.length ? cardWraps : this.animateTargets;

    if (!targets.length) return;

    this.staggerTween = gsap.from(targets, {
      ...fromProps,
      duration,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: this.grid || this,
        start: 'top 85%',
        once: true,
      },
    });

    if (this.summary && this.config.animationStyle !== 'none') {
      this.revealTween = gsap.from(this.summary, {
        opacity: 0,
        y: 24,
        duration: duration * 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this.summary,
          start: 'top 90%',
          once: true,
        },
      });
    }
  }

  initHover() {
    this.teardownHover();
    if (this.prefersReducedMotion()) return;

    this.querySelectorAll('[data-nether-bundles-item-wrap]').forEach((item) => {
      const onEnter = () => item.classList.add('nether-bundles__item--hover');
      const onLeave = () => item.classList.remove('nether-bundles__item--hover');
      item.addEventListener('mouseenter', onEnter);
      item.addEventListener('mouseleave', onLeave);
      item.addEventListener('focusin', onEnter);
      item.addEventListener('focusout', onLeave);
      this.hoverHandlers.push({ item, onEnter, onLeave });
    });
  }

  teardownHover() {
    this.hoverHandlers.forEach(({ item, onEnter, onLeave }) => {
      item.removeEventListener('mouseenter', onEnter);
      item.removeEventListener('mouseleave', onLeave);
      item.removeEventListener('focusin', onEnter);
      item.removeEventListener('focusout', onLeave);
    });
    this.hoverHandlers = [];
  }

  killMotionTweens() {
    this.revealTween?.kill?.();
    this.staggerTween?.kill?.();
    this.revealTween = null;
    this.staggerTween = null;
  }

  handleItemChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const card = target.closest('[data-nether-bundles-item]');
    if (!card) return;

    if (target.matches('[data-nether-bundles-variant]')) {
      const option = target.selectedOptions?.[0];
      if (option) {
        card.dataset.variantId = option.value;
        card.dataset.price = option.dataset.price || '0';
        card.dataset.compareAt = option.dataset.compareAt || '0';
        card.dataset.available = option.dataset.available || 'false';
      }
    }

    if (target.matches('[data-nether-bundles-qty]')) {
      const qty = Math.max(1, Number.parseInt(target.value, 10) || 1);
      target.value = String(qty);
      card.dataset.quantity = String(qty);
    }

    if (target.matches('[data-nether-bundles-toggle]')) {
      card.classList.toggle('is-deselected', !target.checked);
    }

    this.updateTotals();
    this.updateSummaryList();
    window.NetherBundlesAPI?.emit('selection:change', { element: this, items: this.getSelectedItems() });
  }

  getSelectedItems() {
    return Array.from(this.querySelectorAll('[data-nether-bundles-item]'))
      .map((card) => {
        const toggle = card.querySelector('[data-nether-bundles-toggle]');
        const selected = toggle ? toggle.checked : true;
        const available = card.dataset.available !== 'false';
        const quantity = Math.max(1, Number.parseInt(card.dataset.quantity, 10) || 1);
        const price = Number.parseInt(card.dataset.price, 10) || 0;
        const compareAt = Number.parseInt(card.dataset.compareAt, 10) || 0;
        return {
          card,
          selected,
          available,
          required: card.dataset.required === 'true',
          variantId: Number.parseInt(card.dataset.variantId, 10),
          productId: card.dataset.productId,
          title: card.dataset.productTitle || '',
          quantity,
          price,
          compareAt,
          linePrice: price * quantity,
          lineCompare: (compareAt > price ? compareAt : price) * quantity,
        };
      })
      .filter((item) => item.selected && item.available && item.variantId);
  }

  formatMoney(cents) {
    const amount = (Number(cents) || 0) / 100;
    if (typeof window.Shopify?.formatMoney === 'function') {
      try {
        return window.Shopify.formatMoney(cents, this.config.moneyFormat);
      } catch (_error) {
        /* fall through */
      }
    }
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: this.config.currencyCode || undefined,
      }).format(amount);
    } catch (_error) {
      return amount.toFixed(2);
    }
  }

  updateTotals() {
    const items = this.getSelectedItems();
    let total = items.reduce((sum, item) => sum + item.linePrice, 0);
    let compare = items.reduce((sum, item) => sum + item.lineCompare, 0);

    if (this.config.discountPercent > 0) {
      const savingsFromPercent = Math.round((total * this.config.discountPercent) / 100);
      compare = Math.max(compare, total);
      total = Math.max(0, total - savingsFromPercent);
    }

    const savings = Math.max(0, compare - total);

    if (this.totalEl) this.totalEl.textContent = this.formatMoney(total);
    if (this.compareEl) this.compareEl.textContent = this.formatMoney(compare);
    if (this.savingsEl) this.savingsEl.textContent = this.formatMoney(savings);
    if (this.countEl) {
      const template = this.dataset.countLabel || '{{ count }} selected';
      this.countEl.textContent = template.replace('{{ count }}', String(items.length));
    }
    if (this.pricingLive) {
      this.pricingLive.textContent = `${items.length} · ${this.formatMoney(total)}`;
    }
    if (this.addButton) {
      this.addButton.disabled = items.length === 0;
      this.addButton.setAttribute('aria-disabled', items.length === 0 ? 'true' : 'false');
    }
  }

  updateSummaryList() {
    if (!this.summaryList) return;
    const items = this.getSelectedItems();
    this.summaryList.innerHTML = items
      .map(
        (item) =>
          `<li class="nether-bundles__summary-item"><span>${this.escapeHtml(item.title)}${
            item.quantity > 1 ? ` × ${item.quantity}` : ''
          }</span><span>${this.formatMoney(item.linePrice)}</span></li>`
      )
      .join('');
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async handleAdd(event) {
    event.preventDefault();
    if (!this.addButton || this.addButton.getAttribute('aria-disabled') === 'true') return;

    const items = this.getSelectedItems();
    if (!items.length) {
      this.showError(this.dataset.errorEmpty || 'Select at least one product');
      return;
    }

    this.setLoading(true);
    this.clearError();

    const payloadItems = items.map((item) => {
      const entry = { id: item.variantId, quantity: item.quantity };
      if (this.config.includeProperties || this.notesEl?.value) {
        entry.properties = {
          _nether_bundle: this.config.strategy,
          ...(this.notesEl?.value ? { 'Bundle note': this.notesEl.value } : {}),
        };
      }
      return entry;
    });

    try {
      const result = await this.addBundleToCart(payloadItems);
      this.setStatus(this.dataset.successMessage || 'Bundle added to cart');
      window.NetherBundlesAPI?.emit('bundle:added', { element: this, items: payloadItems, result });

      const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (!cart) {
        window.location = window.routes?.cart_url || '/cart';
        return;
      }

      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: 'nether-bundles',
          productVariantId: payloadItems[0]?.id,
          cartData: result,
        });
      }

      if (typeof cart.renderContents === 'function') {
        cart.renderContents(result);
      } else if (typeof cart.open === 'function') {
        cart.open();
      }
    } catch (error) {
      this.showError(error?.message || this.dataset.errorGeneric || 'Unable to add bundle');
      window.NetherBundlesAPI?.emit('bundle:error', { element: this, error });
    } finally {
      this.setLoading(false);
    }
  }

  async addBundleToCart(items) {
    const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    const body = { items };

    if (cart?.getSectionsToRender) {
      body.sections = cart
        .getSectionsToRender()
        .map((section) => section.id)
        .join(',');
      body.sections_url = window.location.pathname;
      cart.setActiveElement?.(document.activeElement);
    }

    const response = await fetch(`${window.routes?.cart_add_url || '/cart/add.js'}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (result.status) {
      throw new Error(result.description || result.message || 'Cart add failed');
    }
    return result;
  }

  setLoading(isLoading) {
    if (!this.addButton) return;
    this.addButton.classList.toggle('loading', isLoading);
    this.addButton.setAttribute('aria-disabled', isLoading ? 'true' : 'false');
    this.spinner?.classList.toggle('hidden', !isLoading);
  }

  setStatus(message) {
    if (this.statusEl) this.statusEl.textContent = message;
  }

  showError(message) {
    if (!this.errorEl) return;
    this.errorEl.hidden = false;
    this.errorEl.textContent = message;
  }

  clearError() {
    if (!this.errorEl) return;
    this.errorEl.hidden = true;
    this.errorEl.textContent = '';
  }

  handleDrawerOpen() {
    if (!this.drawer || !this.summary) return;
    if (this.drawerBody) {
      this.drawerBody.innerHTML = '';
      this.drawerBody.appendChild(this.summary.cloneNode(true));
      const cloneAdd = this.drawerBody.querySelector('[data-nether-bundles-add]');
      cloneAdd?.addEventListener('click', this.handleAdd);
    }
    this.drawer.hidden = false;
    this.drawer.removeAttribute('hidden');
    document.body.classList.add('overflow-hidden');

    const panel = this.drawer.querySelector('[data-nether-bundles-drawer-panel]');
    const focusTarget =
      this.drawer.querySelector('[data-nether-bundles-drawer-close]') || panel;
    if (typeof trapFocus === 'function') {
      trapFocus(panel || this.drawer, focusTarget);
    } else {
      panel?.focus();
    }
    window.NetherBundlesAPI?.emit('drawer:open', { element: this });
  }

  handleDrawerClose() {
    if (!this.drawer) return;
    this.drawer.hidden = true;
    document.body.classList.remove('overflow-hidden');
    if (typeof removeTrapFocus === 'function') {
      removeTrapFocus(this.drawerOpenBtn);
    } else {
      this.drawerOpenBtn?.focus();
    }
    window.NetherBundlesAPI?.emit('drawer:close', { element: this });
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.drawer && !this.drawer.hidden) {
      this.handleDrawerClose();
    }
  }

  initExtensions() {
    if (!window.NetherBundlesAPI) {
      window.NetherBundlesAPI = {
        extend(hooks = {}) {
          this._hooks = { ...(this._hooks || {}), ...hooks };
        },
        emit(name, detail) {
          const hook = this._hooks?.[name];
          if (typeof hook === 'function') hook(detail);
          document.dispatchEvent(new CustomEvent(`nether:bundles:${name}`, { detail, bubbles: true }));
        },
      };
    }

    window.NetherBundlesAPI.emit('ready', {
      element: this,
      strategy: this.config.strategy,
      layout: this.config.layout,
    });
  }

  handleSectionLoad(event) {
    if (event?.detail?.sectionId && event.detail.sectionId !== this.dataset.sectionId) return;
    this.initialized = false;
    this.connectedCallback();
  }
}

class NetherBundlesDrawer extends HTMLElement {}

if (!customElements.get('nether-bundles')) {
  customElements.define('nether-bundles', NetherBundles);
}

if (!customElements.get('nether-bundles-drawer')) {
  customElements.define('nether-bundles-drawer', NetherBundlesDrawer);
}
