/**
 * Nether Premium Commerce Enhancements Framework
 * Shared presentation utilities — does not replace Shopify commerce logic.
 */

(function () {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  class NetherCommerceMeter extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.fill = this.querySelector('[data-nether-commerce-meter-fill]');
      this.syncProgress();
    }

    syncProgress() {
      const progress = Number.parseFloat(this.dataset.progress || '0');
      const clamped = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
      if (this.fill) {
        this.fill.style.setProperty('--nether-commerce-meter-progress', `${clamped}%`);
      }
      if (!this.hasAttribute('aria-valuenow') && this.getAttribute('aria-valuemax') === '100') {
        this.setAttribute('aria-valuenow', String(Math.round(clamped)));
      }
    }

    setProgress(value) {
      this.dataset.progress = String(value);
      this.syncProgress();
    }
  }

  class NetherCommerce extends HTMLElement {
    constructor() {
      super();
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
      this.revealTween = null;
      this.staggerTween = null;
      this.hoverHandlers = [];
    }

    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.parseConfig();
      this.registerMotion();
      this.bindHover();
      this.initExtensions();

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.teardownHover();
      this.killMotion();
    }

    parseConfig() {
      const { dataset } = this;
      this.config = {
        animationStyle: dataset.animationStyle || 'fade',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.45,
        sectionId: dataset.sectionId || this.id || 'nether-commerce',
      };
    }

    handleSectionLoad(event) {
      const section = event.target;
      if (!section || !section.contains(this)) return;
      this.killMotion();
      this.registerMotion();
    }

    registerMotion() {
      if (!window.NetherMotion?.registerSection) return;

      const style = this.config.animationStyle;
      if (style === 'none' || REDUCED_MOTION.matches) return;

      const targets = this.querySelectorAll('[data-nether-commerce-animate]');
      if (!targets.length) return;

      window.NetherMotion.registerSection(`${this.config.sectionId}-commerce`, {
        type: 'commerce',
        element: this,
        init: () => this.playReveal(targets, style),
        destroy: () => this.killMotion(),
      });
    }

    playReveal(targets, style) {
      const gsap = window.NetherMotion?.gsap || window.gsap;
      if (!gsap) return;

      const duration = this.config.animationDuration;
      const nodes = Array.from(targets);

      nodes.forEach((el) => {
        el.style.opacity = '0';
        if (style === 'slide' || style === 'stagger') {
          el.style.transform = 'translateY(0.8rem)';
        }
      });

      if (style === 'stagger') {
        this.staggerTween = gsap.to(nodes, {
          opacity: 1,
          y: 0,
          duration,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
        });
      } else if (style === 'slide') {
        this.revealTween = gsap.to(nodes, {
          opacity: 1,
          y: 0,
          duration,
          ease: 'power2.out',
          clearProps: 'transform',
        });
      } else {
        this.revealTween = gsap.to(nodes, {
          opacity: 1,
          duration,
          ease: 'power1.out',
        });
      }
    }

    killMotion() {
      this.revealTween?.kill?.();
      this.staggerTween?.kill?.();
      this.revealTween = null;
      this.staggerTween = null;
      if (window.NetherMotion?.unregisterSection && this.config?.sectionId) {
        window.NetherMotion.unregisterSection?.(`${this.config.sectionId}-commerce`);
      }
    }

    bindHover() {
      if (REDUCED_MOTION.matches) return;
      this.querySelectorAll('.nether-commerce__trust-item, .nether-commerce__notice, .nether-commerce__info').forEach((el) => {
        const enter = () => el.classList.add('is-hover');
        const leave = () => el.classList.remove('is-hover');
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        this.hoverHandlers.push({ el, enter, leave });
      });
    }

    teardownHover() {
      this.hoverHandlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
      this.hoverHandlers = [];
    }

    initExtensions() {
      window.NetherCommerceAPI = window.NetherCommerceAPI || {
        version: '1.0.0',
        hooks: {
          onDeliveryEstimate: null,
          onShippingCountdown: null,
          onAiMessaging: null,
          onLocalization: null,
        },
        setProgress(element, value) {
          if (element?.setProgress) element.setProgress(value);
        },
      };
    }
  }

  function bootstrapStandalone() {
    document.querySelectorAll('[data-nether-commerce-root]:not(nether-commerce)').forEach((root) => {
      if (root.dataset.netherCommerceBootstrapped) return;
      root.dataset.netherCommerceBootstrapped = 'true';

      if (!window.NetherMotion?.registerSection || REDUCED_MOTION.matches) return;
      const style = root.dataset.animationStyle || 'fade';
      if (style === 'none') return;

      const targets = root.querySelectorAll('[data-nether-commerce-animate]');
      if (!targets.length) return;

      const id = root.id || root.dataset.sectionId || `commerce-${Math.random().toString(36).slice(2, 8)}`;
      window.NetherMotion.registerSection(`${id}-commerce-standalone`, {
        type: 'commerce',
        element: root,
        init: () => {
          const gsap = window.NetherMotion?.gsap || window.gsap;
          if (!gsap) return;
          const duration = Number.parseFloat(root.dataset.animationDuration) || 0.45;
          gsap.fromTo(
            targets,
            { opacity: 0, y: style === 'fade' ? 0 : 8 },
            { opacity: 1, y: 0, duration, stagger: style === 'stagger' ? 0.08 : 0, ease: 'power2.out', clearProps: 'transform' }
          );
        },
        destroy: () => {},
      });
    });
  }

  if (!customElements.get('nether-commerce-meter')) {
    customElements.define('nether-commerce-meter', NetherCommerceMeter);
  }
  if (!customElements.get('nether-commerce')) {
    customElements.define('nether-commerce', NetherCommerce);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapStandalone, { once: true });
  } else {
    bootstrapStandalone();
  }
})();
