/**
 * Nether Premium Mega Menu Framework
 * Extends Dawn header-menu / mega-menu — does not replace them.
 */

class NetherMegaMenu extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.initialized = false;
    this.motionReady = false;
    this.motionLoaded = false;
    this.activeDetails = null;
    this.activeMenuItem = null;
    this.activeColumnCount = 0;
    this.openTween = null;
    this.closeTween = null;
    this.overlayTween = null;
    this.revealTweens = [];

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleDetailsToggle = this.handleDetailsToggle.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleHeaderState = this.handleHeaderState.bind(this);
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleSearchOpen = this.handleSearchOpen.bind(this);
    this.handleSummaryKeydown = this.handleSummaryKeydown.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.classList.add('is-enabled');

    this.overlay = this.querySelector('[data-nether-megamenu-overlay]');
    this.menuItems = this.querySelectorAll('.nether-mega-menu__item');
    this.summaries = this.querySelectorAll('.nether-mega-menu__item > summary');

    this.parseConfig();
    this.bindEvents();
    this.registerMotion();

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad.bind(this));
    }
  }

  disconnectedCallback() {
    this.unbindEvents();
    this.killMotionTweens();
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      overlay: dataset.enableOverlay !== 'false',
      desktop: dataset.desktop !== 'false',
      tablet: dataset.tablet !== 'false',
      layoutType: dataset.layoutType || 'auto',
      columnCount: Number.parseInt(dataset.columnCount, 10) || 4,
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.3,
    };

    this.style.setProperty('--nether-mega-duration', `${this.config.animationDuration}s`);
  }

  isBreakpointActive() {
    const width = window.innerWidth;
    if (width >= 990) return this.config.desktop;
    if (width >= 750) return this.config.tablet;
    return false;
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  bindEvents() {
    this.menuItems.forEach((details) => {
      details.addEventListener('toggle', this.handleDetailsToggle);
    });

    this.summaries.forEach((summary) => {
      summary.addEventListener('keydown', this.handleSummaryKeydown);
    });

    this.addEventListener('focusout', this.handleFocusOut);
    this.overlay?.addEventListener('click', this.handleOverlayClick);

    document.addEventListener('nether:header:state', this.handleHeaderState);
    document.addEventListener('nether:drawer:open', this.handleDrawerOpen);
    document.addEventListener('nether:search:open', this.handleSearchOpen);
  }

  unbindEvents() {
    this.menuItems.forEach((details) => {
      details.removeEventListener('toggle', this.handleDetailsToggle);
    });

    this.summaries.forEach((summary) => {
      summary.removeEventListener('keydown', this.handleSummaryKeydown);
    });

    this.removeEventListener('focusout', this.handleFocusOut);
    this.overlay?.removeEventListener('click', this.handleOverlayClick);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('nether:header:state', this.handleHeaderState);
    document.removeEventListener('nether:drawer:open', this.handleDrawerOpen);
    document.removeEventListener('nether:search:open', this.handleSearchOpen);
  }

  handleSectionLoad(event) {
    if (event.detail.sectionId === this.dataset.sectionId) {
      this.parseConfig();
      this.menuItems = this.querySelectorAll('.nether-mega-menu__item');
      this.summaries = this.querySelectorAll('.nether-mega-menu__item > summary');
    }
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-megamenu`, {
      init: () => {
        this.parseConfig();
        this.motionReady = false;
      },
      destroy: () => {
        this.killMotionTweens();
        this.motionReady = false;
      },
    });
  }

  ensureMotion() {
    if (this.motionLoaded || this.prefersReducedMotion()) {
      this.motionReady = true;
      this.dataset.netherMotionReady = 'true';
      return Promise.resolve();
    }

    if (!window.NetherMotion?.load) {
      this.motionReady = true;
      this.dataset.netherMotionReady = 'true';
      return Promise.resolve();
    }

    return window.NetherMotion.load([]).then(() => {
      this.motionLoaded = true;
      this.motionReady = true;
      this.dataset.netherMotionReady = 'true';
    });
  }

  handleDetailsToggle(event) {
    const details = event.target;
    if (!details.matches('.nether-mega-menu__item')) return;

    if (!this.isBreakpointActive()) {
      if (details.open) details.removeAttribute('open');
      return;
    }

    const summary = details.querySelector('summary');
    const isOpening = details.hasAttribute('open');

    if (isOpening) {
      this.menuItems.forEach((other) => {
        if (other !== details && other.open) {
          other.removeAttribute('open');
          other.querySelector('summary')?.setAttribute('aria-expanded', 'false');
        }
      });

      this.onOpen(details, summary);
    } else if (this.activeDetails === details) {
      this.onClose(details, summary);
    }
  }

  onOpen(details, summary) {
    this.isOpen = true;
    this.activeDetails = details;
    this.activeMenuItem = details.dataset.netherMegaItem || null;

    summary?.setAttribute('aria-expanded', 'true');
    this.classList.add('is-open');
    this.overlay?.removeAttribute('hidden');

    document.addEventListener('keydown', this.handleKeydown);

    const panel = details.querySelector('.nether-mega-menu__panel-inner');
    const columnCount =
      Number.parseInt(panel?.dataset.netherMegaColumns, 10) || this.config.columnCount;
    const previousColumns = this.activeColumnCount;
    this.activeColumnCount = columnCount;

    this.ensureMotion().then(() => {
      this.animateOpen(details);
      this.dispatchMegaMenuEvent('nether:megamenu:open', {
        menuItem: this.activeMenuItem,
        detailsId: details.id,
        columnCount,
      });

      if (previousColumns !== columnCount && previousColumns > 0) {
        this.dispatchMegaMenuEvent('nether:megamenu:column-change', {
          menuItem: this.activeMenuItem,
          columnCount,
          previousColumnCount: previousColumns,
        });
      }
    });
  }

  onClose(details, summary, silent = false) {
    this.isOpen = false;
    this.activeDetails = null;
    this.activeMenuItem = null;

    summary?.setAttribute('aria-expanded', 'false');
    this.classList.remove('is-open', 'is-animating');
    this.overlay?.setAttribute('hidden', '');

    document.removeEventListener('keydown', this.handleKeydown);
    this.killMotionTweens();

    if (!silent) {
      this.dispatchMegaMenuEvent('nether:megamenu:close', {
        menuItem: details?.dataset?.netherMegaItem || null,
        detailsId: details?.id || null,
      });
    }
  }

  close(silent = false) {
    if (!this.activeDetails) return;

    const details = this.activeDetails;
    const summary = details.querySelector('summary');

    details.removeAttribute('open');
    this.onClose(details, summary, silent);
  }

  animateOpen(details) {
    if (this.prefersReducedMotion() || typeof gsap === 'undefined') return;

    const content = details.querySelector('.mega-menu__content');
    const reveals = details.querySelectorAll('[data-nether-mega-reveal]');
    const images = details.querySelectorAll('[data-nether-mega-image-reveal] img');
    const promo = details.querySelector('[data-nether-mega-promo-reveal]');

    this.killMotionTweens();
    this.classList.add('is-animating');

    const duration = this.config.animationDuration;

    this.openTween = gsap.fromTo(
      content,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration, ease: 'power2.out' }
    );

    if (this.config.overlay && this.overlay) {
      this.overlayTween = gsap.fromTo(
        this.overlay,
        { opacity: 0 },
        { opacity: 1, duration: duration * 0.8, ease: 'power1.out' }
      );
    }

    if (reveals.length) {
      const revealTween = gsap.fromTo(
        reveals,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: duration * 0.9,
          stagger: 0.05,
          ease: 'power2.out',
          delay: duration * 0.15,
          onComplete: () => this.classList.remove('is-animating'),
        }
      );
      this.revealTweens.push(revealTween);
    } else {
      gsap.delayedCall(duration, () => this.classList.remove('is-animating'));
    }

    if (images.length) {
      const imageTween = gsap.fromTo(
        images,
        { scale: 1.06, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: duration * 1.1,
          stagger: 0.06,
          ease: 'power2.out',
          delay: duration * 0.2,
        }
      );
      this.revealTweens.push(imageTween);
    }

    if (promo) {
      const promoTween = gsap.fromTo(
        promo,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: duration, ease: 'power2.out', delay: duration * 0.25 }
      );
      this.revealTweens.push(promoTween);
    }
  }

  killMotionTweens() {
    [this.openTween, this.closeTween, this.overlayTween, ...this.revealTweens].forEach((tween) => {
      tween?.kill();
    });
    this.openTween = null;
    this.closeTween = null;
    this.overlayTween = null;
    this.revealTweens = [];
  }

  dispatchMegaMenuEvent(name, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        detail: {
          sectionId: this.dataset.sectionId,
          ...detail,
        },
      })
    );
  }

  handleKeydown(event) {
    if (!this.isOpen) return;

    const code = event.code.toUpperCase();

    if (code === 'ESCAPE') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      this.activeDetails?.querySelector('summary')?.focus();
      return;
    }

    if (code === 'ARROWLEFT' || code === 'ARROWRIGHT') {
      this.navigateTopLevel(event, code === 'ARROWRIGHT' ? 1 : -1);
    }
  }

  handleSummaryKeydown(event) {
    const code = event.code.toUpperCase();
  if (code !== 'ARROWDOWN' && code !== 'ENTER' && code !== 'SPACE') return;

    const details = event.currentTarget.closest('details');
    if (!details) return;

    if (code === 'ARROWDOWN' || code === 'ENTER' || code === 'SPACE') {
      if (!details.open) {
        event.preventDefault();
        details.setAttribute('open', '');
      } else if (code === 'ARROWDOWN') {
        event.preventDefault();
        const firstLink = details.querySelector('.mega-menu__content a, .mega-menu__content [tabindex="0"]');
        firstLink?.focus();
      }
    }
  }

  navigateTopLevel(event, direction) {
    const openItems = Array.from(this.menuItems);
    const currentIndex = openItems.indexOf(this.activeDetails);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = openItems.length - 1;
    if (nextIndex >= openItems.length) nextIndex = 0;

    event.preventDefault();
    const nextDetails = openItems[nextIndex];
    const nextSummary = nextDetails.querySelector('summary');

    this.close(true);
    nextDetails.setAttribute('open', '');
    nextSummary?.focus();
  }

  handleFocusOut(event) {
    if (!this.isOpen) return;

    requestAnimationFrame(() => {
      if (!this.contains(document.activeElement) && !this.activeDetails?.contains(document.activeElement)) {
        this.close();
      }
    });
  }

  handleOverlayClick() {
    if (this.config.overlay) this.close();
  }

  handleHeaderState(event) {
    if (event.detail?.state?.hidden && this.isOpen) {
      this.close(true);
    }
  }

  handleDrawerOpen() {
    if (this.isOpen) this.close(true);
  }

  handleSearchOpen() {
    if (this.isOpen) this.close(true);
  }
}

if (!customElements.get('nether-mega-menu')) {
  customElements.define('nether-mega-menu', NetherMegaMenu);
}
