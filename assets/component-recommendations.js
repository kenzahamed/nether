/**
 * Nether Premium Recommendations Commerce Framework
 * Extends Dawn <product-recommendations> — does not replace recommendation fetching.
 */

class NetherRecommendations extends HTMLElement {
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

    this.grid = this.querySelector('[data-nether-recommendations-grid]');
    this.animateTargets = this.querySelectorAll('[data-nether-recommendations-animate]');
    this.items = this.querySelectorAll('[data-nether-recommendations-item]');
    this.toolbar = this.querySelector('[data-nether-recommendations-toolbar]');

    this.parseConfig();
    this.registerMotion();
    this.initKeyboardNavigation();
    this.initExtensions();

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.handleSectionLoad);
    this.killMotionTweens();
    this.teardownHover();
  }

  parseConfig() {
    const { dataset } = this;
    this.config = {
      animationStyle: dataset.animationStyle || 'stagger',
      animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
      source: dataset.recommendationSource || 'related',
      layout: dataset.layout || 'grid',
    };
  }

  prefersReducedMotion() {
    return (
      window.NetherMotion?.prefersReducedMotion?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  registerMotion() {
    if (!window.NetherMotion?.registerSection || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(`${this.dataset.sectionId}-recommendations`, {
      type: 'recommendations',
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
    this.grid = this.querySelector('[data-nether-recommendations-grid]');
    this.animateTargets = this.querySelectorAll('[data-nether-recommendations-animate]');
    this.items = this.querySelectorAll('[data-nether-recommendations-item]');
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
    this.classList.add('nether-recommendations--motion-reduced');
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
    const targets = this.items.length ? this.items : this.animateTargets;

    if (!targets.length) return;

    if (this.config.animationStyle === 'stagger' || targets.length > 1) {
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
    } else {
      this.revealTween = gsap.from(targets, {
        ...fromProps,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this,
          start: 'top 85%',
          once: true,
        },
      });
    }

    if (this.toolbar && this.config.animationStyle !== 'none') {
      gsap.from(this.toolbar, {
        opacity: 0,
        y: 12,
        duration: duration * 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this.toolbar,
          start: 'top 90%',
          once: true,
        },
      });
    }
  }

  initHover() {
    this.teardownHover();
    if (this.prefersReducedMotion()) return;

    this.items.forEach((item) => {
      const onEnter = () => item.classList.add('nether-recommendations__item--hover');
      const onLeave = () => item.classList.remove('nether-recommendations__item--hover');
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

  initKeyboardNavigation() {
    const carousel = this.querySelector('[data-nether-recommendations-carousel]');
    if (!carousel) return;

    carousel.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const button =
        event.key === 'ArrowLeft'
          ? carousel.querySelector('.slider-button--prev')
          : carousel.querySelector('.slider-button--next');
      if (button && !button.disabled) {
        event.preventDefault();
        button.click();
      }
    });
  }

  initExtensions() {
    if (!window.NetherRecommendationsAPI) {
      window.NetherRecommendationsAPI = {
        extend(hooks = {}) {
          this._hooks = { ...(this._hooks || {}), ...hooks };
        },
        emit(name, detail) {
          const hook = this._hooks?.[name];
          if (typeof hook === 'function') hook(detail);
          document.dispatchEvent(
            new CustomEvent(`nether:recommendations:${name}`, { detail, bubbles: true })
          );
        },
      };
    }

    window.NetherRecommendationsAPI.emit('ready', {
      element: this,
      source: this.config.source,
      layout: this.config.layout,
    });
  }

  handleSectionLoad(event) {
    if (event?.detail?.sectionId && event.detail.sectionId !== this.dataset.sectionId) return;
    this.initialized = false;
    this.connectedCallback();
  }
}

customElements.define('nether-recommendations', NetherRecommendations);
