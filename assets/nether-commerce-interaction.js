/**
 * Nether Commerce Interaction Base
 * Shared guest-list store, adapter, and list UI primitives for Wishlist + Compare.
 * Does not replace window.NetherWishlist / window.NetherCompare public APIs.
 */

(() => {
  function prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
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

  function createGuestAdapter(storageKey) {
    return {
      type: 'guest',
      async load() {
        try {
          const raw = window.localStorage?.getItem(storageKey);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      },
      async save(items) {
        try {
          window.localStorage?.setItem(storageKey, JSON.stringify(items));
        } catch (error) {
          /* Storage may be unavailable — keep in-memory only */
        }
      },
    };
  }

  function normalizeBaseItem(payload = {}) {
    const productId = String(payload.productId || payload.id || '');
    const variantId = String(payload.variantId || payload.variant_id || '');
    if (!productId || !variantId) return null;

    return {
      productId,
      variantId,
      handle: payload.handle || '',
      title: payload.title || '',
      url: payload.url || (payload.handle ? `/products/${payload.handle}` : '#'),
      vendor: payload.vendor || '',
      image: payload.image || '',
      price: Number(payload.price) || 0,
      priceFormatted: payload.priceFormatted || '',
      compareAtPrice: Number(payload.compareAtPrice) || 0,
      compareAtFormatted: payload.compareAtFormatted || '',
      available: payload.available !== false && payload.available !== 'false',
      addedAt: payload.addedAt || Date.now(),
    };
  }

  function itemFromButton(el, extras = {}) {
    if (!el) return null;
    return {
      productId: el.dataset.productId,
      variantId: el.dataset.variantId,
      handle: el.dataset.productHandle,
      title: el.dataset.productTitle,
      url: el.dataset.productUrl,
      vendor: el.dataset.productVendor,
      image: el.dataset.productImage,
      price: el.dataset.productPrice,
      priceFormatted: el.dataset.productPriceFormatted,
      compareAtPrice: el.dataset.productComparePrice,
      compareAtFormatted: el.dataset.productCompareFormatted,
      available: el.dataset.productAvailable,
      ...extras,
    };
  }

  /**
   * @param {object} options
   * @param {string} options.storageKey
   * @param {string} options.eventChange
   * @param {object} options.defaultI18n
   * @param {string} options.analyticsPrefix
   * @param {string} options.cartSource
   * @param {number|null} [options.maxItems]
   * @param {(payload: object, base: object) => object} [options.extendItem]
   * @param {boolean} [options.addReturnsResult] Compare-style {ok, reason} vs wishlist boolean
   * @param {string} [options.warnLabel]
   * @param {object} [options.extraExtensions]
   */
  function createGuestListStore(options = {}) {
    const {
      storageKey,
      eventChange,
      defaultI18n,
      analyticsPrefix,
      cartSource,
      maxItems = null,
      extendItem = null,
      addReturnsResult = false,
      warnLabel = '[NetherCommerceInteraction]',
      extraExtensions = {},
    } = options;

    const store = {
      items: [],
      ready: false,
      adapter: createGuestAdapter(storageKey),
      listeners: new Set(),
      i18n: { ...defaultI18n },
      extensions: {
        onAnalytics: null,
        onShare: null,
        onSync: null,
        onNotify: null,
        ...extraExtensions,
      },
      maxItems: maxItems != null ? maxItems : null,

      async init() {
        if (this.ready) return this;
        this.items = await this.adapter.load();
        this.ready = true;
        this.emit(eventChange, { items: this.getItems(), count: this.count(), source: 'init' });
        return this;
      },

      setMaxItems(max) {
        const value = Number.parseInt(max, 10);
        if (Number.isFinite(value) && value >= 2) {
          this.maxItems = value;
        }
        return this;
      },

      setAdapter(adapter) {
        if (!adapter || typeof adapter.load !== 'function' || typeof adapter.save !== 'function') {
          console.warn(`${warnLabel} Invalid adapter — must implement load() and save().`);
          return this;
        }
        this.adapter = adapter;
        return this;
      },

      extend(partial = {}) {
        Object.assign(this.extensions, partial);
        return this;
      },

      getItems() {
        return this.items.slice();
      },

      count() {
        return this.items.length;
      },

      isFull() {
        return this.maxItems != null && this.items.length >= this.maxItems;
      },

      has(productId, variantId) {
        const pid = String(productId);
        const vid = variantId != null ? String(variantId) : null;
        return this.items.some((item) => {
          if (String(item.productId) !== pid) return false;
          if (vid == null) return true;
          return String(item.variantId) === vid;
        });
      },

      findIndex(productId, variantId) {
        const pid = String(productId);
        const vid = variantId != null ? String(variantId) : null;
        return this.items.findIndex((item) => {
          if (String(item.productId) !== pid) return false;
          if (vid == null) return true;
          return String(item.variantId) === vid;
        });
      },

      normalizeItem(payload = {}) {
        const base = normalizeBaseItem(payload);
        if (!base) return null;
        return typeof extendItem === 'function' ? extendItem(payload, base) : base;
      },

      async add(payload, meta = {}) {
        await this.init();
        const item = this.normalizeItem(payload);
        if (!item) return addReturnsResult ? { ok: false, reason: 'invalid' } : false;
        if (this.has(item.productId, item.variantId)) {
          return addReturnsResult ? { ok: false, reason: 'duplicate', item } : false;
        }

        if (this.isFull()) {
          this.extensions.onAnalytics?.({ type: `${analyticsPrefix}_full`, item, maxItems: this.maxItems });
          return addReturnsResult ? { ok: false, reason: 'full', item } : false;
        }

        this.items.unshift(item);
        await this.adapter.save(this.items);
        this.emit(eventChange, { items: this.getItems(), count: this.count(), action: 'add', item, ...meta });
        this.extensions.onAnalytics?.({ type: `${analyticsPrefix}_add`, item });
        return addReturnsResult ? { ok: true, item } : true;
      },

      async remove(productId, variantId, meta = {}) {
        await this.init();
        const index = this.findIndex(productId, variantId);
        if (index < 0) return false;

        const [item] = this.items.splice(index, 1);
        await this.adapter.save(this.items);
        this.emit(eventChange, { items: this.getItems(), count: this.count(), action: 'remove', item, ...meta });
        this.extensions.onAnalytics?.({ type: `${analyticsPrefix}_remove`, item });
        return true;
      },

      async toggle(payload, meta = {}) {
        await this.init();
        const item = this.normalizeItem(payload);
        if (!item) {
          return addReturnsResult ? { active: false, reason: 'invalid' } : { active: false };
        }

        if (this.has(item.productId, item.variantId)) {
          await this.remove(item.productId, item.variantId, meta);
          return { active: false, item };
        }

        const result = await this.add(item, meta);
        if (addReturnsResult) {
          if (!result.ok) {
            return { active: false, item, reason: result.reason };
          }
          return { active: true, item };
        }
        return { active: true, item };
      },

      async clear(meta = {}) {
        await this.init();
        this.items = [];
        await this.adapter.save(this.items);
        this.emit(eventChange, { items: [], count: 0, action: 'clear', ...meta });
        this.extensions.onAnalytics?.({ type: `${analyticsPrefix}_clear` });
      },

      async moveToCart(item, quantity = 1) {
        await this.init();
        const variantId = item?.variantId;
        if (!variantId) throw new Error('Missing variant');

        const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        const config =
          typeof fetchConfig === 'function'
            ? fetchConfig('javascript')
            : {
                method: 'POST',
                headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
              };

        if (config.headers) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
          delete config.headers['Content-Type'];
        }

        const formData = new FormData();
        formData.append('id', String(variantId));
        formData.append('quantity', String(Number(quantity) || 1));

        if (cart?.getSectionsToRender) {
          formData.append(
            'sections',
            cart
              .getSectionsToRender()
              .map((section) => section.id)
              .join(',')
          );
          formData.append('sections_url', window.location.pathname);
          cart.setActiveElement?.(document.activeElement);
        }

        config.body = formData;

        const response = await fetch(`${window.routes?.cart_add_url || '/cart/add'}`, config);
        const result = await response.json();

        if (result.status) {
          throw new Error(result.description || result.message || 'Cart add failed');
        }

        if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: cartSource,
            productVariantId: variantId,
            cartData: result,
          });
        }

        await this.remove(item.productId, item.variantId, { source: 'move-to-cart' });
        this.extensions.onAnalytics?.({ type: `${analyticsPrefix}_move_to_cart`, item });

        if (!cart) {
          window.location = window.routes?.cart_url || '/cart';
          return result;
        }

        if (typeof cart.renderContents === 'function') {
          cart.renderContents(result);
        } else if (typeof cart.open === 'function') {
          cart.open();
        }

        return result;
      },

      on(callback) {
        if (typeof callback === 'function') this.listeners.add(callback);
        return () => this.listeners.delete(callback);
      },

      emit(type, detail = {}) {
        const eventDetail = { type, ...detail };
        this.listeners.forEach((listener) => listener(eventDetail));
        document.dispatchEvent(new CustomEvent(type, { detail: eventDetail, bubbles: true }));
      },

      formatCount(count, i18n = this.i18n) {
        const template =
          Number(count) === 1
            ? i18n.countOne || defaultI18n.countOne
            : i18n.countOther || defaultI18n.countOther;
        return String(template).replace(/\{\{\s*count\s*\}\}/g, String(count));
      },

      mergeI18n(partial) {
        if (partial) this.i18n = { ...this.i18n, ...partial };
        return this.i18n;
      },
    };

    return store;
  }

  function syncCountBubbles(namespace, count, i18n, formatCount) {
    document.querySelectorAll(`[data-nether-${namespace}-count]`).forEach((bubble) => {
      const value = bubble.querySelector(`[data-nether-${namespace}-count-value]`);
      const label = bubble.querySelector(`[data-nether-${namespace}-count-label]`);
      if (value) value.textContent = count > 99 ? '99+' : String(count);
      if (label) label.textContent = formatCount(count, i18n);
      if (count > 0) {
        bubble.hidden = false;
        bubble.removeAttribute('hidden');
      } else {
        bubble.hidden = true;
        bubble.setAttribute('hidden', '');
      }
    });
  }

  function syncToolbar(namespace, root, count, i18n, formatCount) {
    root?.querySelectorAll?.(`[data-nether-${namespace}-toolbar-count]`).forEach((node) => {
      node.textContent = formatCount(count, i18n);
    });
    root?.querySelectorAll?.(`[data-nether-${namespace}-clear]`).forEach((button) => {
      if (count > 0) {
        button.hidden = false;
        button.removeAttribute('hidden');
      } else {
        button.hidden = true;
        button.setAttribute('hidden', '');
      }
    });
  }

  function renderListCard(namespace, template, item, i18n) {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(`[data-nether-${namespace}-card]`);
    if (!card) return null;

    card.dataset.productId = item.productId;
    card.dataset.variantId = item.variantId;
    card.setAttribute('role', 'listitem');

    const mediaLink = card.querySelector(`[data-nether-${namespace}-card-link]`);
    const titleLink = card.querySelector(`[data-nether-${namespace}-card-title-link]`);
    const title = card.querySelector(`[data-nether-${namespace}-card-title]`);
    const image = card.querySelector(`[data-nether-${namespace}-card-image]`);
    const vendor = card.querySelector(`[data-nether-${namespace}-card-vendor]`);
    const price = card.querySelector(`[data-nether-${namespace}-card-price]`);
    const availability = card.querySelector(`[data-nether-${namespace}-card-availability]`);
    const moveButton = card.querySelector(`[data-nether-${namespace}-move-to-cart]`);
    const removeButton = card.querySelector(`[data-nether-${namespace}-remove]`);
    const quickViewButton = card.querySelector(
      `[data-nether-${namespace}-quick-view], [data-nether-quick-view-open]`
    );

    if (mediaLink) mediaLink.href = item.url || '#';
    if (titleLink) titleLink.href = item.url || '#';
    if (title) title.textContent = item.title || '';
    if (quickViewButton) {
      quickViewButton.dataset.productUrl = item.url || '';
      if (item.title) quickViewButton.dataset.productTitle = item.title;
      if (!document.querySelector('nether-quick-view')) quickViewButton.hidden = true;
    }

    if (image) {
      if (item.image) {
        image.src = item.image;
        image.alt = item.title || '';
        image.hidden = false;
      } else {
        image.hidden = true;
      }
    }

    if (vendor) {
      if (item.vendor) {
        vendor.textContent = item.vendor;
        vendor.hidden = false;
      } else {
        vendor.hidden = true;
      }
    }

    if (price) {
      price.innerHTML = '';
      if (item.compareAtFormatted) {
        const compare = document.createElement('s');
        compare.textContent = item.compareAtFormatted;
        price.appendChild(compare);
      }
      const current = document.createElement('span');
      current.textContent = item.priceFormatted || '';
      price.appendChild(current);
    }

    if (availability) {
      availability.hidden = false;
      availability.textContent = item.available ? i18n.available : i18n.unavailable;
      if (!item.available && moveButton) {
        moveButton.disabled = true;
      }
    }

    if (moveButton) moveButton.textContent = i18n.moveToCart;
    if (removeButton) {
      removeButton.textContent = i18n.remove;
      removeButton.setAttribute('aria-label', i18n.remove);
    }

    return card;
  }

  function animateCards(cards, style, duration) {
    if (prefersReducedMotion() || !cards?.length || style === 'none') return;

    window.NetherMotion?.whenReady?.(() => {
      if (typeof gsap === 'undefined') return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: style === 'rise' || style === 'stagger' ? 16 : 0 },
        {
          opacity: 1,
          y: 0,
          duration: duration || 0.4,
          stagger: style === 'stagger' ? 0.06 : 0,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    });
  }

  /**
   * Shared list UI base for drawer/page custom elements.
   * @param {object} config
   * @param {() => object} config.getStore
   * @param {string} config.namespace wishlist | compare
   * @param {string} config.i18nSelector
   * @param {() => void} [config.afterParseConfig]
   * @param {(detail: object, ctx: HTMLElement) => void} [config.onAfterChange]
   * @param {(event: Event, ctx: HTMLElement) => HTMLElement|null} [config.resolveRemoveCard]
   * @param {string} [config.drawerTag]
   * @param {string} [config.motionDrawerType]
   * @param {string} [config.motionPageType]
   */
  function createListUIBase(config) {
    const {
      getStore,
      namespace,
      i18nSelector,
      afterParseConfig,
      onAfterChange,
      resolveRemoveCard,
      drawerTag,
      motionDrawerType,
      motionPageType,
    } = config;

    return class NetherListUIBase extends HTMLElement {
      connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;

        const store = getStore();
        this.list = this.querySelector(`[data-nether-${namespace}-list]`);
        this.empty = this.querySelector(`[data-nether-${namespace}-empty]`);
        this.footer = this.querySelector(`[data-nether-${namespace}-footer]`);
        this.live = this.querySelector(`[data-nether-${namespace}-live]`);
        this.template = this.querySelector(`[data-nether-${namespace}-card-template]`);
        this.i18n = { ...store.i18n, ...(parseJsonScript(this, i18nSelector) || {}) };
        store.mergeI18n(this.i18n);

        this.parseConfig();
        this.bindSharedEvents();
        this.registerMotion();

        store.init().then(() => this.render());
      }

      disconnectedCallback() {
        this.unsubscribe?.();
        this.removeEventListener('click', this.handleDelegatedClick);
        window.NetherMotion?.unregisterSection?.(this.motionKey);
        this.killMotionTweens?.();
      }

      parseConfig() {
        const dataset = this.dataset;
        this.config = {
          animationStyle: dataset.animationStyle || 'fade',
          animationDuration: Number.parseFloat(dataset.animationDuration) || 0.4,
          showCount: dataset.showCount !== 'false',
        };
        this.motionKey = `${dataset.sectionId || namespace}-${this.tagName.toLowerCase()}`;
        afterParseConfig?.(this);
      }

      bindSharedEvents() {
        this.handleChange = this.handleChange.bind(this);
        this.handleDelegatedClick = this.handleDelegatedClick.bind(this);
        this.unsubscribe = getStore().on(this.handleChange);
        this.addEventListener('click', this.handleDelegatedClick);
      }

      registerMotion() {
        if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;
        const isDrawer = drawerTag ? this.tagName === drawerTag : this.tagName.includes('DRAWER');
        window.NetherMotion.registerSection(this.motionKey, {
          type: isDrawer ? motionDrawerType || `${namespace}-drawer` : motionPageType || `${namespace}-page`,
          element: this,
          init: () => this.parseConfig(),
          destroy: () => this.killMotionTweens?.(),
        });
      }

      handleChange(detail = {}) {
        this.render();
        if (detail.action === 'add' && this.live) this.live.textContent = this.i18n.liveAdd;
        if (detail.action === 'remove' && this.live) this.live.textContent = this.i18n.liveRemove;
        onAfterChange?.(detail, this);
      }

      async handleDelegatedClick(event) {
        const store = getStore();
        const clearButton = event.target.closest(`[data-nether-${namespace}-clear]`);
        if (clearButton) {
          event.preventDefault();
          await store.clear({ source: this.tagName.toLowerCase() });
          return;
        }

        const removeButton = event.target.closest(`[data-nether-${namespace}-remove]`);
        if (removeButton) {
          event.preventDefault();
          const card =
            resolveRemoveCard?.(event, this) ||
            removeButton.closest(`[data-nether-${namespace}-card]`);
          if (!card) return;
          await store.remove(card.dataset.productId, card.dataset.variantId, {
            source: this.tagName.toLowerCase(),
          });
          return;
        }

        const moveButton = event.target.closest(`[data-nether-${namespace}-move-to-cart]`);
        if (moveButton) {
          event.preventDefault();
          const card = moveButton.closest(`[data-nether-${namespace}-card]`);
          if (!card) return;
          const item = store.getItems().find(
            (entry) =>
              String(entry.productId) === String(card.dataset.productId) &&
              String(entry.variantId) === String(card.dataset.variantId)
          );
          if (!item) return;

          const original = moveButton.textContent;
          moveButton.disabled = true;
          moveButton.textContent = this.i18n.moving;
          try {
            await store.moveToCart(item);
            if (this.live) this.live.textContent = this.i18n.moved;
            if (this.tagName.includes('DRAWER') && typeof this.close === 'function') {
              this.close(false);
            }
          } catch (error) {
            if (this.live) this.live.textContent = this.i18n.error;
            moveButton.disabled = false;
            moveButton.textContent = original;
          }
        }
      }

      render() {
        const store = getStore();
        const items = store.getItems();
        const count = items.length;

        syncCountBubbles(namespace, count, this.i18n, (c, i) => store.formatCount(c, i));
        syncToolbar(namespace, this, count, this.i18n, (c, i) => store.formatCount(c, i));

        if (!this.list || !this.template) return;

        this.list.innerHTML = '';

        if (count === 0) {
          this.empty?.removeAttribute('hidden');
          this.list.setAttribute('hidden', '');
          this.footer?.setAttribute('hidden', '');
          return;
        }

        this.empty?.setAttribute('hidden', '');
        this.list.removeAttribute('hidden');
        this.footer?.removeAttribute('hidden');

        const cards = items
          .map((item) => renderListCard(namespace, this.template, item, this.i18n))
          .filter(Boolean);

        cards.forEach((card) => this.list.appendChild(card));
        animateCards(cards, this.config.animationStyle, this.config.animationDuration);
      }
    };
  }

  window.NetherCommerceInteraction = {
    prefersReducedMotion,
    parseJsonScript,
    createGuestAdapter,
    createGuestListStore,
    normalizeBaseItem,
    itemFromButton,
    syncCountBubbles,
    syncToolbar,
    renderListCard,
    animateCards,
    createListUIBase,
  };
})();
