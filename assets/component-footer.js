/**
 * Nether Premium Footer Framework
 * Structural custom element — layout tokens, accordion support, motion registration.
 */
class NetherFooter extends HTMLElement {
  constructor() {
    super();
    this.handleResize = this.handleResize.bind(this);
    this.handleSectionLoad = this.handleSectionLoad.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.footer = this.querySelector('.footer');
    this.accordions = this.querySelectorAll('[data-nether-footer-accordion]');

    this.setFooterMetrics();
    this.initAccordions();
    this.registerMotion();

    window.addEventListener('resize', this.handleResize, { passive: true });

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
      document.addEventListener('shopify:section:unload', this.handleSectionLoad);
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);

    if (window.Shopify?.designMode) {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      document.removeEventListener('shopify:section:unload', this.handleSectionLoad);
    }
  }

  setFooterMetrics() {
    if (!this.footer) return;

    const paddingTop = getComputedStyle(this).getPropertyValue('--nether-footer-padding-top').trim();
    const paddingBottom = getComputedStyle(this).getPropertyValue('--nether-footer-padding-bottom').trim();

    if (paddingTop) {
      this.style.setProperty('--nether-footer-padding-top', paddingTop);
    }

    if (paddingBottom) {
      this.style.setProperty('--nether-footer-padding-bottom', paddingBottom);
    }
  }

  initAccordions() {
    if (!this.accordions.length) return;
    if (!this.classList.contains('nether-footer--mobile-accordion')) return;

    this.accordions.forEach((accordion) => {
      const trigger = accordion.querySelector('[data-nether-footer-accordion-trigger]');
      const panel = accordion.querySelector('[data-nether-footer-accordion-panel]');

      if (!trigger || !panel || trigger.dataset.bound === 'true') return;

      trigger.dataset.bound = 'true';
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isExpanded));
        panel.hidden = isExpanded;
      });
    });
  }

  registerMotion() {
    if (!window.NetherMotion || this.dataset.netherMotion !== 'footer') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.NetherMotion.registerSection(this.dataset.sectionId, {
      init: () => {},
    });
  }

  handleResize() {
    this.setFooterMetrics();
  }

  handleSectionLoad(event) {
    if (event.detail?.sectionId === this.dataset.sectionId) {
      this.setFooterMetrics();
      this.initAccordions();
    }
  }
}

if (!customElements.get('nether-footer')) {
  customElements.define('nether-footer', NetherFooter);
}
