/**
 * Nether Premium Search Drawer Framework
 * Extends Dawn search-form / predictive-search — does not replace them.
 */

class NetherSearchDrawer extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.initialized = false;
    this.motionReady = false;
    this.openTween = null;
    this.closeTween = null;
    this.overlayTween = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleHeaderState = this.handleHeaderState.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.panel = this.querySelector('[data-nether-search-panel]');
    this.overlay = this.querySelector('[data-nether-search-overlay]');
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearch = this.querySelector('nether-predictive-search');
    this.emptyState = this.querySelector('[data-nether-search-empty]');
    this.resultsShell = this.querySelector('[data-nether-search-results-shell]');

    this.parseConfig();
    this.bindTriggers();
    this.registerMotion();

    this.overlay?.addEventListener('click', this.handleOverlayClick);
    this.addEventListener('click', this.handleCloseClick);
    document.addEventListener('nether:header:state', this.handleHeaderState);

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad.bind(this));
    }
  }

  disconnectedCallback() {
    this.unbindTriggers();
    this.overlay?.removeEventListener('click', this.handleOverlayClick);
    this.removeEventListener('click', this.handleCloseClick);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('nether:header:state', this.handleHeaderState);
    this.killMotionTweens();
  }

  parseConfig() {
    const dataset = this.dataset;

    this.config = {
      overlay: dataset.enableOverlay !== 'false',
      desktop: dataset.desktop !== 'false',
      mobile: dataset.mobile !== 'false',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.3,
      drawerWidth: Number.parseInt(dataset.drawerWidth, 10) || 480,
    };

    this.style.setProperty('--nether-search-drawer-width', `${this.config.drawerWidth}px`);
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  isBreakpointActive() {
    const width = window.innerWidth;
    if (width >= 750) return this.config.desktop;
    return this.config.mobile;
  }

  bindTriggers() {
    this.triggers = document.querySelectorAll('[data-nether-search-open]');
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this.handleTriggerClick);
      trigger.addEventListener('keydown', this.handleTriggerKeydown.bind(this));
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

  handleOverlayClick() {
    if (this.config.overlay) this.close();
  }

  handleCloseClick(event) {
    if (event.target.closest('[data-nether-search-close]')) {
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

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-search-drawer`, {
      type: 'search-drawer',
      element: this,
      init: () => {
        this.parseConfig();
        this.initMotionEngine();
      },
      destroy: () => {
        this.killMotionTweens();
        if (this.isOpen) this.close(false);
      },
    });
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
      getComputedStyle(netherHeader || document.documentElement).getPropertyValue('--nether-header-announcement-offset');

    if (offset) {
      this.style.setProperty('--nether-search-announcement-offset', offset.trim() || '0px');
    }

    const headerHeight =
      netherHeader?.style.getPropertyValue('--nether-header-height') ||
      getComputedStyle(document.documentElement).getPropertyValue('--header-height');

    if (headerHeight) {
      this.style.setProperty('--nether-search-header-offset', headerHeight.trim() || '0px');
    }
  }

  setTriggerExpanded(expanded) {
    this.triggers?.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  updateEmptyState() {
    if (!this.emptyState || !this.resultsShell) return;

    const hasQuery = this.input?.value.trim().length > 0;
    const hasResults = this.predictiveSearch?.hasAttribute('results');
    const isLoading = this.predictiveSearch?.hasAttribute('loading');

    this.emptyState.hidden = hasQuery || hasResults || isLoading;
    this.resultsShell.classList.toggle('has-query', hasQuery);
    this.resultsShell.classList.toggle('has-results', hasResults);
    this.resultsShell.classList.toggle('is-loading', isLoading);
  }

  open(triggeredBy) {
    if (!this.isBreakpointActive() || this.isOpen) return;

    this.syncAnnouncementOffset();
    this.activeElement = triggeredBy || document.activeElement;
    this.isOpen = true;
    this.hidden = false;

    this.classList.add('is-open');
    this.setTriggerExpanded(true);
    document.body.classList.add('overflow-hidden');
    document.addEventListener('keydown', this.handleKeydown);

    this.updateEmptyState();

    this.dispatchEvent(
      new CustomEvent('nether:search:open', {
        bubbles: true,
        detail: { sectionId: this.dataset.sectionId },
      })
    );

    const focusTarget = this.input || this.panel;
    const trapContainer = this.panel;

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
      this.classList.add('is-visible');
      trapFocus(trapContainer, focusTarget);
      return;
    }

    this.killMotionTweens();

    gsap.set(this.panel, { x: '100%', opacity: 1 });
    if (this.overlay && this.config.overlay) {
      gsap.set(this.overlay, { opacity: 0 });
    }

    this.classList.add('is-visible');

    this.openTween = gsap.to(this.panel, {
      x: 0,
      duration: this.config.animationDuration,
      ease: 'power3.out',
      onComplete: () => trapFocus(trapContainer, focusTarget),
    });

    if (this.overlay && this.config.overlay) {
      this.overlayTween = gsap.to(this.overlay, {
        opacity: 1,
        duration: this.config.animationDuration,
        ease: 'power2.out',
      });
    } else {
      trapFocus(trapContainer, focusTarget);
    }
  }

  close(focusToggle = true) {
    if (!this.isOpen) return;

    const finishClose = () => {
      this.isOpen = false;
      this.hidden = true;
      this.classList.remove('is-open', 'is-visible');
      this.setTriggerExpanded(false);
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', this.handleKeydown);

      this.predictiveSearch?.close(true);

      removeTrapFocus(focusToggle ? this.activeElement : null);

      this.dispatchEvent(
        new CustomEvent('nether:search:close', {
          bubbles: true,
          detail: { sectionId: this.dataset.sectionId },
        })
      );
    };

    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
      finishClose();
      return;
    }

    this.killMotionTweens();

    this.closeTween = gsap.to(this.panel, {
      x: '100%',
      duration: this.config.animationDuration,
      ease: 'power3.in',
      onComplete: finishClose,
    });

    if (this.overlay && this.config.overlay) {
      this.overlayTween = gsap.to(this.overlay, {
        opacity: 0,
        duration: this.config.animationDuration,
        ease: 'power2.in',
      });
    }
  }

  animateResults() {
    if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') return;

    const results = this.querySelector('#predictive-search-results-groups-wrapper');
    if (!results) return;

    gsap.fromTo(
      results,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: Math.min(this.config.animationDuration, 0.35), ease: 'power2.out' }
    );
  }
}

class NetherSearchForm extends SearchForm {
  connectedCallback() {
    super.connectedCallback();
    this.drawer = this.closest('nether-search-drawer');
    this.input?.addEventListener('input', () => this.drawer?.updateEmptyState?.());
  }
}

if (!customElements.get('nether-search-drawer')) {
  customElements.define('nether-search-drawer', NetherSearchDrawer);
}

if (!customElements.get('nether-search-form')) {
  customElements.define('nether-search-form', NetherSearchForm);
}

function registerNetherPredictiveSearch() {
  if (typeof PredictiveSearch === 'undefined' || customElements.get('nether-predictive-search')) return;

  class NetherPredictiveSearch extends PredictiveSearch {
    constructor() {
      super();
      this.drawer = this.closest('nether-search-drawer');
      this.sectionId = this.dataset.sectionId || 'nether-predictive-search';
      this.maxResults = Number.parseInt(this.dataset.maxResults, 10) || 4;
      this.resourceTypes = this.buildResourceTypes();
      this.allPredictiveSearchInstances = document.querySelectorAll('nether-predictive-search');
    }

    buildResourceTypes() {
      const types = ['query', 'product'];

      if (this.dataset.enableCollections !== 'false') types.push('collection');
      if (this.dataset.enablePages !== 'false') types.push('page');
      if (this.dataset.enableArticles !== 'false') types.push('article');

      return types;
    }

    buildSearchUrl(searchTerm) {
      const params = new URLSearchParams();
      params.set('q', searchTerm);
      params.set('section_id', this.sectionId);
      params.set('resources[limit]', String(this.maxResults));

      this.resourceTypes.forEach((type) => {
        params.append('resources[type]', type);
      });

      return `${routes.predictive_search_url}?${params.toString()}`;
    }

    getSearchResults(searchTerm) {
      const queryKey = searchTerm.replace(' ', '-').toLowerCase();
      this.setLiveRegionLoadingState();
      this.drawer?.updateEmptyState?.();

      if (this.cachedResults[queryKey]) {
        this.renderSearchResults(this.cachedResults[queryKey]);
        const searchDeferred = this.dispatchSearchUpdateEvent(searchTerm);
        searchDeferred?.resolve({ totalCount: this.getTotalResultCount() });
        return;
      }

      const searchDeferred = this.dispatchSearchUpdateEvent(searchTerm);

      fetch(this.buildSearchUrl(searchTerm), {
        signal: this.abortController.signal,
      })
        .then((response) => {
          if (!response.ok) {
            const error = new Error(response.status);
            this.close();
            throw error;
          }

          return response.text();
        })
        .then((text) => {
          const sectionMarkup = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector(`#shopify-section-${this.sectionId}`);

          const resultsMarkup = sectionMarkup?.innerHTML || '';
          this.allPredictiveSearchInstances.forEach((instance) => {
            if (instance instanceof NetherPredictiveSearch) {
              instance.cachedResults[queryKey] = resultsMarkup;
            }
          });
          this.renderSearchResults(resultsMarkup);
          searchDeferred?.resolve({ totalCount: this.getTotalResultCount() });
        })
        .catch((error) => {
          if (error?.code === 20) {
            searchDeferred?.reject(error);
            return;
          }
          searchDeferred?.reject(error);
          this.close();
          throw error;
        });
    }

    getResultsMaxHeight() {
      const shell = this.drawer?.querySelector('[data-nether-search-results-shell]');
      return shell?.clientHeight || window.innerHeight;
    }

    open() {
      const shell = this.drawer?.querySelector('[data-nether-search-results-shell]');
      if (shell) {
        this.predictiveSearchResults.style.maxHeight = `${this.getResultsMaxHeight()}px`;
      }

      this.setAttribute('open', true);
      this.input.setAttribute('aria-expanded', true);
      this.isOpen = true;
      this.drawer?.updateEmptyState?.();
      this.drawer?.animateResults?.();
    }

    onFocusOut() {
      if (this.drawer?.isOpen && this.drawer.contains(document.activeElement)) return;
      super.onFocusOut();
    }

    close(clearSearchTerm = false) {
      super.close(clearSearchTerm);
      this.drawer?.updateEmptyState?.();
    }

    renderSearchResults(resultsMarkup) {
      super.renderSearchResults(resultsMarkup);
      this.drawer?.animateResults?.();
      this.drawer?.updateEmptyState?.();
    }

    onChange() {
      super.onChange();
      this.drawer?.updateEmptyState?.();
    }

    setLiveRegionLoadingState() {
      super.setLiveRegionLoadingState();
      this.drawer?.updateEmptyState?.();
    }
  }

  if (!customElements.get('nether-predictive-search')) {
    customElements.define('nether-predictive-search', NetherPredictiveSearch);
  }
}

registerNetherPredictiveSearch();
document.addEventListener('DOMContentLoaded', registerNetherPredictiveSearch);
