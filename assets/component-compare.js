/**
 * Nether Premium Compare Commerce Framework
 * Extends Shopify commerce roots — does not replace Product Form, Cart, Variants, or Checkout.
 *
 * Architecture:
 * - NetherCompare (store + events + adapter hooks) via NetherCommerceInteraction
 * - Guest baseline adapter (local key/value) for toggle/count/drawer/page/table
 * - Extension points for sync, account, apps, analytics, sharing, notifications, recommendations
 * - <nether-compare-button>, <nether-compare-drawer>, <nether-compare-page>
 */

(() => {
  const Interaction = window.NetherCommerceInteraction;
  if (!Interaction) {
    console.warn('[NetherCompare] NetherCommerceInteraction base is required.');
    return;
  }

  const {
    prefersReducedMotion,
    createGuestListStore,
    itemFromButton,
    syncCountBubbles,
    syncToolbar,
    renderListCard,
    animateCards,
    createListUIBase,
  } = Interaction;

  const STORAGE_KEY = 'nether:compare:v1';
  const EVENT_CHANGE = 'nether:compare:change';
  const EVENT_OPEN = 'nether:compare:open';
  const EVENT_CLOSE = 'nether:compare:close';
  const DEFAULT_MAX_ITEMS = 4;

  const defaultI18n = {
    title: 'Compare',
    countOne: '{{ count }} item',
    countOther: '{{ count }} items',
    add: 'Add to compare',
    remove: 'Remove from compare',
    clear: 'Clear compare',
    moveToCart: 'Move to cart',
    moving: 'Moving…',
    moved: 'Moved to cart',
    unavailable: 'Unavailable',
    available: 'Available',
    error: 'Something went wrong. Please try again.',
    full: 'Compare list is full. Remove a product to add another.',
    liveAdd: 'Added to compare',
    liveRemove: 'Removed from compare',
    liveFull: 'Compare list is full',
    attributeLabel: 'Attribute',
    productLabel: 'Product',
  };

  function parseAttributes(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  const NetherCompare = createGuestListStore({
    storageKey: STORAGE_KEY,
    eventChange: EVENT_CHANGE,
    defaultI18n,
    analyticsPrefix: 'compare',
    cartSource: 'nether-compare',
    warnLabel: '[NetherCompare]',
    maxItems: DEFAULT_MAX_ITEMS,
    addReturnsResult: true,
    extraExtensions: { onRecommend: null },
    extendItem(payload, base) {
      return {
        ...base,
        type: payload.type || '',
        attributes: parseAttributes(payload.attributes),
      };
    },
  });

  NetherCompare.getAttributeRows = function getAttributeRows() {
    const keyMap = new Map();
    this.items.forEach((item) => {
      (item.attributes || []).forEach((attr) => {
        const key = String(attr.key || attr.label || '');
        if (!key || keyMap.has(key)) return;
        keyMap.set(key, { key, label: attr.label || key });
      });
    });
    return Array.from(keyMap.values());
  };

  NetherCompare.getAttributeValue = function getAttributeValue(item, key) {
    const match = (item.attributes || []).find((attr) => String(attr.key) === String(key));
    return match?.value != null && match.value !== '' ? String(match.value) : '—';
  };

  NetherCompare.isAttributeDifferent = function isAttributeDifferent(key) {
    if (this.items.length < 2) return false;
    const values = this.items.map((item) => this.getAttributeValue(item, key));
    return values.some((value) => value !== values[0]);
  };

  window.NetherCompare = NetherCompare;

  function compareItemFromButton(el) {
    return itemFromButton(el, {
      type: el?.dataset?.productType,
      attributes: parseAttributes(el?.dataset?.productAttributes),
    });
  }

  function renderCompareTable(root, items, i18n, highlightDifferences) {
    const shell = root?.querySelector?.('[data-nether-compare-table-shell]');
    const head = root?.querySelector?.('[data-nether-compare-table-head]');
    const body = root?.querySelector?.('[data-nether-compare-table-body]');
    if (!shell || !head || !body) return;

    head.innerHTML = '';
    body.innerHTML = '';

    if (items.length < 1) {
      shell.hidden = true;
      shell.setAttribute('hidden', '');
      return;
    }

    shell.hidden = false;
    shell.removeAttribute('hidden');

    const headerRow = document.createElement('tr');
    const attrTh = document.createElement('th');
    attrTh.scope = 'col';
    attrTh.className = 'nether-compare-table__attr-label';
    attrTh.textContent = i18n.attributeLabel || defaultI18n.attributeLabel;
    headerRow.appendChild(attrTh);

    items.forEach((item) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'nether-compare-table__product-head';
      th.dataset.productId = item.productId;
      th.dataset.variantId = item.variantId;

      const media = document.createElement('a');
      media.className = 'nether-compare-table__product-media';
      media.href = item.url || '#';
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        img.width = 72;
        img.height = 72;
        img.loading = 'lazy';
        media.appendChild(img);
      }
      th.appendChild(media);

      const title = document.createElement('p');
      title.className = 'nether-compare-table__product-title';
      const titleLink = document.createElement('a');
      titleLink.className = 'full-unstyled-link';
      titleLink.href = item.url || '#';
      titleLink.textContent = item.title || '';
      title.appendChild(titleLink);
      th.appendChild(title);

      const price = document.createElement('p');
      price.className = 'nether-compare-table__product-price';
      price.textContent = item.priceFormatted || '';
      th.appendChild(price);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button--ghost button--small nether-compare-table__remove';
      remove.dataset.netherCompareRemove = '';
      remove.textContent = i18n.remove;
      remove.setAttribute('aria-label', i18n.remove);
      th.appendChild(remove);

      headerRow.appendChild(th);
    });

    head.appendChild(headerRow);

    const rows = NetherCompare.getAttributeRows();
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.className = 'nether-compare-table__row';
      tr.dataset.attributeKey = row.key;

      const isDifferent = highlightDifferences && NetherCompare.isAttributeDifferent(row.key);
      if (isDifferent) tr.classList.add('is-different');

      const labelCell = document.createElement('th');
      labelCell.scope = 'row';
      labelCell.className = 'nether-compare-table__attr-label';
      labelCell.textContent = row.label;
      tr.appendChild(labelCell);

      items.forEach((item) => {
        const td = document.createElement('td');
        td.className = 'nether-compare-table__cell';
        td.textContent = NetherCompare.getAttributeValue(item, row.key);
        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
  }

  function animateTable(shell, style, duration) {
    if (prefersReducedMotion() || !shell || style === 'none') return;
    window.NetherMotion?.whenReady?.(() => {
      if (typeof gsap === 'undefined') return;
      gsap.fromTo(
        shell,
        { opacity: 0, y: style === 'rise' || style === 'stagger' ? 12 : 0 },
        { opacity: 1, y: 0, duration: duration || 0.4, ease: 'power2.out' }
      );
    });
  }

  class NetherCompareButton extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.control = this.querySelector('[data-nether-compare-control]');
      this.labelNode = this.querySelector('[data-nether-compare-label]');
      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);

      this.control?.addEventListener('click', this.handleClick);
      this.unsubscribe = NetherCompare.on(this.handleChange);

      NetherCompare.init().then(() => this.syncState());
    }

    disconnectedCallback() {
      this.control?.removeEventListener('click', this.handleClick);
      this.unsubscribe?.();
    }

    syncState() {
      const active = NetherCompare.has(this.dataset.productId, this.dataset.variantId);
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
              this.querySelector('.nether-compare-button__icon'),
              { scale: 1 },
              { scale: 1.2, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' }
            );
          });
        }

        const result = await NetherCompare.toggle(compareItemFromButton(this), {
          source: this.dataset.compareContext || 'button',
        });

        if (result.reason === 'full') {
          document.dispatchEvent(
            new CustomEvent('nether:compare:full', {
              detail: { item: result.item, maxItems: NetherCompare.maxItems },
              bubbles: true,
            })
          );
          NetherCompare.emit(EVENT_CHANGE, {
            items: NetherCompare.getItems(),
            count: NetherCompare.count(),
            action: 'full',
            item: result.item,
          });
        }
      } finally {
        this.classList.remove('is-busy');
        this.syncState();
      }
    }

    handleChange() {
      this.syncState();
    }
  }

  const NetherCompareUIBase = createListUIBase({
    getStore: () => NetherCompare,
    namespace: 'compare',
    i18nSelector: '[data-nether-compare-i18n]',
    drawerTag: 'NETHER-COMPARE-DRAWER',
    motionDrawerType: 'compare-drawer',
    motionPageType: 'compare-page',
    afterParseConfig(ctx) {
      const dataset = ctx.dataset;
      ctx.config.highlightDifferences = dataset.highlightDifferences !== 'false';
      ctx.config.pageLayout = dataset.pageLayout || 'table';
      ctx.config.maxItems = Number.parseInt(dataset.maxItems, 10) || DEFAULT_MAX_ITEMS;
      NetherCompare.setMaxItems(ctx.config.maxItems);
      ctx.tableShell = ctx.querySelector('[data-nether-compare-table-shell]');
    },
    onAfterChange(detail, ctx) {
      if (detail.action === 'full' && ctx.live) {
        ctx.live.textContent = ctx.i18n.liveFull || ctx.i18n.full;
      }
    },
    resolveRemoveCard(event) {
      const removeButton = event.target.closest('[data-nether-compare-remove]');
      return (
        removeButton?.closest('[data-nether-compare-card]') ||
        removeButton?.closest('.nether-compare-table__product-head')
      );
    },
  });

  // Override render for table + card layout modes
  NetherCompareUIBase.prototype.render = function renderCompareUI() {
    const items = NetherCompare.getItems();
    const count = items.length;

    syncCountBubbles('compare', count, this.i18n, (c, i) => NetherCompare.formatCount(c, i));
    syncToolbar('compare', this, count, this.i18n, (c, i) => NetherCompare.formatCount(c, i));

    const showCards = this.config.pageLayout !== 'table' || this.tagName === 'NETHER-COMPARE-DRAWER';

    if (count === 0) {
      this.empty?.removeAttribute('hidden');
      this.list?.setAttribute('hidden', '');
      this.footer?.setAttribute('hidden', '');
      if (this.tableShell) {
        this.tableShell.hidden = true;
        this.tableShell.setAttribute('hidden', '');
      }
      if (this.list) this.list.innerHTML = '';
      return;
    }

    this.empty?.setAttribute('hidden', '');
    this.footer?.removeAttribute('hidden');

    if (showCards && this.list && this.template) {
      this.list.removeAttribute('hidden');
      this.list.innerHTML = '';
      const cards = items
        .map((item) => renderListCard('compare', this.template, item, this.i18n))
        .filter(Boolean);
      cards.forEach((card) => this.list.appendChild(card));
      animateCards(cards, this.config.animationStyle, this.config.animationDuration);
    } else if (this.list) {
      this.list.setAttribute('hidden', '');
      this.list.innerHTML = '';
    }

    renderCompareTable(this, items, this.i18n, this.config.highlightDifferences);
    if (this.tableShell && !this.tableShell.hidden) {
      animateTable(this.tableShell, this.config.animationStyle, this.config.animationDuration);
    }
  };

  class NetherCompareDrawer extends NetherCompareUIBase {
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

      this.panel = this.querySelector('[data-nether-compare-panel]');
      this.overlay = this.querySelector('[data-nether-compare-overlay]');

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
        drawerWidth: Number.parseInt(dataset.drawerWidth, 10) || 480,
      };
      this.style.setProperty('--nether-compare-drawer-width', `${this.drawerConfig.drawerWidth}px`);
      this.style.setProperty('--nether-compare-duration', `${this.drawerConfig.animationDuration}s`);
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
      this.triggers = document.querySelectorAll('[data-nether-compare-open]');
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
      if (event.target.closest('[data-nether-compare-close]')) {
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
        this.style.setProperty('--nether-compare-announcement-offset', offset.trim() || '0px');
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
      this.activeTrigger = trigger || document.querySelector('[data-nether-compare-open]');
      this.isOpen = true;
      this.hidden = false;
      this.removeAttribute('hidden');
      this.classList.add('is-open');
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', this.handleKeydown);
      this.setTriggerExpanded(true);
      this.render();

      const focusTarget = this.querySelector('[data-nether-compare-close]') || this.panel;
      const trapContainer = this.panel || this;

      if (prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
        this.classList.add('is-visible');
        if (typeof trapFocus === 'function') trapFocus(trapContainer, focusTarget);
        NetherCompare.emit(EVENT_OPEN, { source: 'drawer' });
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
      NetherCompare.emit(EVENT_OPEN, { source: 'drawer' });
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
        NetherCompare.emit(EVENT_CLOSE, { source: 'drawer' });
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

  class NetherComparePage extends NetherCompareUIBase {
    connectedCallback() {
      if (this.initialized) return;
      super.connectedCallback();
      this.initPageMotion();
    }

    initPageMotion() {
      if (prefersReducedMotion() || this.config.animationStyle === 'none') return;
      window.NetherMotion?.whenReady?.(() => {
        if (typeof gsap === 'undefined') return;
        const targets = this.querySelectorAll('[data-nether-compare-animate]');
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
    NetherCompare.init().then(() => {
      syncCountBubbles('compare', NetherCompare.count(), NetherCompare.i18n, (c, i) =>
        NetherCompare.formatCount(c, i)
      );
    });
  }

  customElements.get('nether-compare-button') ||
    customElements.define('nether-compare-button', NetherCompareButton);
  customElements.get('nether-compare-drawer') ||
    customElements.define('nether-compare-drawer', NetherCompareDrawer);
  customElements.get('nether-compare-page') ||
    customElements.define('nether-compare-page', NetherComparePage);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapCounts, { once: true });
  } else {
    bootstrapCounts();
  }
})();
