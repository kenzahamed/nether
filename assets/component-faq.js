/**
 * Nether Premium FAQ & Knowledge Framework — Motion integration (Phase 5.3.6)
 * Standalone Presentation Framework (accordion knowledge surface; does not extend NetherHero).
 *
 * Hero Motion is the architectural reference.
 * Banner + Content + Media + Testimonials Motion are the implementation references.
 *
 * All FAQ motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No FAQ-only presets unless library gaps exist.
 * Dawn details/summary accordion, search, expand/collapse, and keyboard behavior preserved.
 */

(function () {
  'use strict';

  if (customElements.get('nether-faq')) return;

  const HOST_ID = 'nether-faq';
  let hostRegistered = false;

  const FAQ_PRESETS = [
    'minimal-reveal',
    'fade-up',
    'fade-scale',
    'fade-left',
    'fade-right',
    'luxury-reveal',
    'editorial-reveal',
    'clip-reveal',
    'stagger-features',
    'stagger-cards',
    'stagger-grid',
    'stagger-list',
    'text-heading-reveal',
    'text-luxury-heading',
    'text-editorial',
    'text-cta-reveal',
    'media-image-reveal',
    'media-video-reveal',
    'scroll-parallax',
    'scroll-section-reveal',
    'scroll-viewport-batch',
    'hover-soft-lift',
    'hover-luxury-lift',
    'hover-lift',
    'hover-glass',
    'hover-icon-slide',
    'commerce-trust-reveal',
  ];

  function ensureFaqHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: FAQ_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether FAQ Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-testimonials',
      },
    });
    hostRegistered = true;
  }

  class NetherFaq extends HTMLElement {
    constructor() {
      super();
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
      this.handleSearchInput = this.handleSearchInput.bind(this);
      this.handleSearchClear = this.handleSearchClear.bind(this);
      this.handleExpandAll = this.handleExpandAll.bind(this);
      this.handleCollapseAll = this.handleCollapseAll.bind(this);
      this.handleDetailsToggle = this.handleDetailsToggle.bind(this);
      this.handleNavClick = this.handleNavClick.bind(this);
      this.handleRelatedClick = this.handleRelatedClick.bind(this);
      this.motionId = null;
      this.accordionTweenIds = new Map();
    }

    connectedCallback() {
      if (this.initialized) return;

      this.initialized = true;
      this.cacheDom();
      this.parseConfig();
      this.bindEvents();
      this.registerMotion();
      this.syncSummaryAria();
    }

    disconnectedCallback() {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.unbindEvents();
      this.killMotionTweens();
    }

    cacheDom() {
      this.list = this.querySelector('[data-nether-faq-list]');
      this.shell = this.querySelector('[data-nether-faq-shell]');
      this.header = this.querySelector('[data-nether-faq-header], .nether-faq__header');
      this.panel = this.querySelector(
        '[data-nether-faq-content-panel], .nether-faq__header-inner, .nether-faq__panel, .nether-hero__panel'
      );
      this.media = this.querySelector('[data-nether-hero-media]');
      this.mediaInner = this.querySelector('.nether-hero__media-inner, [data-nether-hero-media] .media');
      this.overlay = this.querySelector('.nether-hero__overlay, [data-nether-faq-overlay]');
      this.dividers = this.querySelectorAll(
        '[data-nether-faq-divider], .nether-faq__divider, .nether-faq__block-divider'
      );

      this.searchInput = this.querySelector('[data-nether-faq-search]');
      this.searchClear = this.querySelector('[data-nether-faq-search-clear]');
      this.searchStatus = this.querySelector('[data-nether-faq-search-status]');
      this.searchWrap = this.querySelector('[data-nether-faq-search-wrap]');
      this.controls = this.querySelector('[data-nether-faq-controls]');

      this.items = this.querySelectorAll('[data-nether-faq-item]');
      this.details = this.querySelectorAll('[data-nether-faq-details]');
      this.animateTargets = this.querySelectorAll('[data-nether-faq-animate]');
      this.headerTargets = this.querySelectorAll(
        '.nether-faq__header [data-nether-faq-animate], [data-nether-faq-header] [data-nether-faq-animate], [data-nether-faq-shell] > .nether-hero__panel > .nether-faq__blocks [data-nether-faq-animate], [data-nether-faq-shell] .nether-faq__blocks [data-nether-faq-animate]'
      );
      this.categories = this.querySelectorAll('[data-nether-faq-category]');
      this.groups = this.querySelectorAll('[data-nether-faq-group]');
      this.questions = this.querySelectorAll('[data-nether-faq-question]');
      this.icons = this.querySelectorAll('[data-nether-faq-icon]');
      this.carets = this.querySelectorAll('[data-nether-faq-caret]');
      this.answerPanels = this.querySelectorAll('[data-nether-faq-answer], [data-nether-faq-panel]');
      this.navLinks = this.querySelectorAll('[data-nether-faq-nav-link]');
      this.nav = this.querySelector('[data-nether-faq-nav]');
      this.sidebar = this.querySelector('[data-nether-faq-sidebar]');
      this.callouts = this.querySelectorAll('[data-nether-faq-callout]');
      this.expandAllBtn = this.querySelector('[data-nether-faq-expand-all]');
      this.collapseAllBtn = this.querySelector('[data-nether-faq-collapse-all]');
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-faq--layout-'));
      const cardStyleMatch = [...this.classList].find((c) => c.startsWith('nether-faq--card-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'stagger',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        expandAllDefault: dataset.expandAll === 'true',
        faqLayout:
          dataset.faqLayout ||
          dataset.netherFaqLayout ||
          (layoutMatch ? layoutMatch.replace('nether-faq--layout-', '') : 'classic_accordion'),
        cardStyle:
          dataset.netherFaqCardStyle ||
          (cardStyleMatch ? cardStyleMatch.replace('nether-faq--card-', '') : 'medium'),
        glassEnabled:
          this.classList.contains('nether-faq--glass-enabled') ||
          this.classList.contains('nether-hero--glass-enabled') ||
          dataset.glassEnabled === 'true',
        floatingEnabled:
          this.classList.contains('nether-faq--floating-enabled') || dataset.floatingEnabled === 'true',
        searchEndpoint: this.searchInput?.dataset.netherFaqSearchEndpoint || '',
      };
    }

    bindEvents() {
      this.searchInput?.addEventListener('input', this.handleSearchInput);
      this.searchClear?.addEventListener('click', this.handleSearchClear);
      this.expandAllBtn?.addEventListener('click', this.handleExpandAll);
      this.collapseAllBtn?.addEventListener('click', this.handleCollapseAll);

      this.details.forEach((detail) => {
        detail.addEventListener('toggle', this.handleDetailsToggle);
      });

      this.navLinks.forEach((link) => {
        link.addEventListener('click', this.handleNavClick);
      });

      this.querySelectorAll('[data-nether-faq-related-target]').forEach((link) => {
        link.addEventListener('click', this.handleRelatedClick);
      });

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    unbindEvents() {
      this.searchInput?.removeEventListener('input', this.handleSearchInput);
      this.searchClear?.removeEventListener('click', this.handleSearchClear);
      this.expandAllBtn?.removeEventListener('click', this.handleExpandAll);
      this.collapseAllBtn?.removeEventListener('click', this.handleCollapseAll);

      this.details.forEach((detail) => {
        detail.removeEventListener('toggle', this.handleDetailsToggle);
      });

      this.navLinks.forEach((link) => {
        link.removeEventListener('click', this.handleNavClick);
      });
    }

    prefersReducedMotion() {
      return (
        window.NetherMotion?.prefersReducedMotion?.() ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }

    getMotionSettings() {
      return window.NetherMotion?.getSettings?.() || {};
    }

    needsScrollPlugins() {
      return (
        this.config.enableParallax ||
        ['stagger', 'accordion_reveal', 'category_reveal', 'slide', 'scale', 'fade'].includes(
          this.config.animationStyle
        ) ||
        this.config.faqLayout === 'editorial_faq' ||
        this.config.faqLayout === 'magazine' ||
        this.config.faqLayout === 'categorized_faq' ||
        this.config.faqLayout === 'help_center' ||
        this.config.faqLayout === 'knowledge_base' ||
        this.config.faqLayout === 'support_center' ||
        (this.items && this.items.length > 3) ||
        (this.dividers && this.dividers.length > 0)
      );
    }

    /**
     * Map section animation style + global Motion Style + FAQ layout → library presets.
     * Merchant controls remain: section animation style/speed/parallax + global Motion.
     * Quick, refined, responsive — avoid excessive animation.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.faqLayout;
      const cardStyle = this.config.cardStyle;

      let content = 'fade-up';
      let heading = 'text-heading-reveal';
      let items = 'stagger-list';
      let groups = 'stagger-features';
      let categories = 'fade-left';
      let buttons = 'text-cta-reveal';
      let overlay = 'minimal-reveal';
      let media = 'media-image-reveal';
      let video = 'media-video-reveal';
      let nav = 'minimal-reveal';
      let question = 'fade-up';
      let answer = 'minimal-reveal';
      let icon = 'fade-scale';
      let hoverLift = 'hover-soft-lift';
      let hoverItem = 'hover-soft-lift';
      let hoverIcon = 'hover-icon-slide';
      let hoverPanel = null;
      let featured = null;

      switch (sectionStyle) {
        case 'fade':
          content = 'minimal-reveal';
          items = 'minimal-reveal';
          groups = 'minimal-reveal';
          categories = 'minimal-reveal';
          break;
        case 'slide':
          content = 'fade-up';
          items = 'fade-up';
          categories = 'fade-up';
          break;
        case 'scale':
          content = 'fade-scale';
          items = 'stagger-cards';
          icon = 'fade-scale';
          break;
        case 'accordion_reveal':
          content = 'fade-up';
          items = 'stagger-list';
          answer = 'fade-up';
          question = 'fade-up';
          break;
        case 'category_reveal':
          content = 'fade-up';
          categories = 'fade-left';
          items = 'stagger-list';
          groups = 'fade-left';
          break;
        case 'stagger':
        default:
          content = 'fade-up';
          items = 'stagger-list';
          groups = 'stagger-features';
          break;
      }

      switch (layout) {
        case 'editorial_faq':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          media = motionStyle === 'editorial' ? 'clip-reveal' : 'media-image-reveal';
          items = motionStyle === 'luxury' ? 'stagger-cards' : 'stagger-list';
          break;
        case 'minimal_faq':
        case 'product_faq':
          content = 'minimal-reveal';
          items = 'minimal-reveal';
          overlay = 'minimal-reveal';
          hoverItem = 'hover-soft-lift';
          break;
        case 'magazine':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          featured = 'fade-up';
          items = 'stagger-cards';
          break;
        case 'two_column_faq':
        case 'knowledge_base':
          items = 'stagger-grid';
          break;
        case 'categorized_faq':
        case 'help_center':
        case 'support_center':
          categories = sectionStyle === 'category_reveal' ? 'fade-left' : 'fade-up';
          groups = 'stagger-features';
          items = 'stagger-list';
          nav = 'fade-up';
          break;
        case 'classic_accordion':
        default:
          if (motionStyle === 'minimal') {
            content = content === 'fade-up' ? 'minimal-reveal' : content;
          }
          break;
      }

      if (cardStyle === 'glass' || this.config.glassEnabled) {
        hoverPanel = 'hover-glass';
        hoverItem = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-soft-lift';
      } else if (cardStyle === 'editorial') {
        content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
        heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
      } else if (motionStyle === 'luxury') {
        hoverItem = 'hover-luxury-lift';
        hoverLift = 'hover-luxury-lift';
      }

      if (motionStyle === 'editorial' && layout === 'editorial_faq') {
        media = 'clip-reveal';
      }

      return {
        motionStyle,
        sectionStyle,
        content,
        heading,
        items,
        groups,
        categories,
        buttons,
        overlay,
        media,
        video,
        nav,
        question,
        answer,
        icon,
        hoverLift,
        hoverItem,
        hoverIcon,
        hoverPanel,
        featured,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureFaqHost(NM);
      this.motionId = `${this.dataset.sectionId}-faq`;

      NM.registerSection(this.motionId, {
        type: 'faq',
        element: this,
        init: () => {
          this.parseConfig();
          this.cacheDom();
          this.initMotionEngine();
        },
        destroy: () => {
          this.destroyMotion();
        },
      });

      this.initMotionEngine();
    }

    destroyMotion() {
      this.killAccordionTweens();

      if (window.NetherMotion?.destroy) {
        window.NetherMotion.destroy(this);
      }

      this.dataset.netherMotionReady = 'false';
      this.removeAttribute('data-nether-motion-pending');
    }

    killMotionTweens() {
      this.destroyMotion();
    }

    killAccordionTweens() {
      const NM = window.NetherMotion;
      if (NM?.animations?.kill) {
        this.accordionTweenIds.forEach((id) => NM.animations.kill(id));
      }
      this.accordionTweenIds.clear();
    }

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureFaqHost(NM);

      if (this.prefersReducedMotion() || !NM?.whenReady || NM.isEnabled?.() === false) {
        this.setReducedMotionState();
        return;
      }

      this.dataset.netherMotionPending = 'true';

      const plugins = this.needsScrollPlugins() ? ['scrollTrigger'] : [];

      NM.whenReady((loaded) => {
        if (!loaded || typeof gsap === 'undefined') {
          this.setReducedMotionState();
          return;
        }

        NM.destroy(this);
        this.killAccordionTweens();

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.removeAttribute('data-nether-motion-pending');

        const presets = this.resolvePresets();
        this.prepareAccordionState(presets);
        this.syncOpenCarets();
        this.runEntranceSequence(presets);
        this.initScrollLayers(presets);
        this.initHoverInteractions(presets);
        this.initViewportBatch(presets);
        this.initLayerSequencing(presets);
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      this.removeAttribute('data-nether-motion-pending');
      this.dataset.netherMotionReady = 'false';
      this.motionReady = false;

      this.querySelectorAll(
        '[data-nether-faq-animate], [data-nether-faq-item], [data-nether-faq-category], .nether-hero__media-inner, .nether-hero__overlay, [data-nether-faq-caret]'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
        target.style.height = '';
      });

      this.items.forEach((item) => {
        item.classList.add('nether-faq__item--motion-reduced');
      });
    }

    animate(targets, preset, options = {}) {
      if (!targets || (targets.length !== undefined && !targets.length)) return null;
      if (!window.NetherMotion?.animate) return null;

      const { scroll, duration, stagger, delay, id, trigger, start, scrollTrigger, preset: presetOverrides, ...rest } =
        options;

      return window.NetherMotion.animate(targets, preset, {
        scope: this,
        duration: duration ?? this.config.animationDuration,
        stagger,
        delay,
        id,
        trigger,
        start,
        scrollTrigger,
        preset: presetOverrides,
        ...rest,
        scroll: scroll === true,
      });
    }

    /**
     * Accordion answer prep for accordion_reveal — soft hidden panels when closed.
     * Does not change details open state or merchant expand settings.
     */
    prepareAccordionState(presets) {
      if (presets.sectionStyle !== 'accordion_reveal' || typeof gsap === 'undefined') return;

      this.details.forEach((detail) => {
        const panel = detail.querySelector('[data-nether-faq-answer], [data-nether-faq-panel]');
        if (!panel || detail.open) return;
        gsap.set(panel, { opacity: 0, y: 8 });
      });
    }

    /** Align caret rotation with open state once Motion owns the caret transform. */
    syncOpenCarets() {
      if (typeof gsap === 'undefined') return;

      this.details.forEach((detail) => {
        const caret = detail.querySelector('[data-nether-faq-caret]');
        if (!caret) return;
        gsap.set(caret, { rotation: detail.open ? 180 : 0 });
      });
    }

    /**
     * Entrance: atmosphere + header + FAQ list composition.
     * Refined sequencing — quick and responsive, not excessive.
     */
    runEntranceSequence(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const duration = this.config.animationDuration;

      if (NM.timelines?.batch && (this.overlay || this.dividers?.length)) {
        NM.timelines.batch(
          [
            (master) => {
              if (!this.overlay) return master;
              const tween = this.animate(this.overlay, presets.overlay, {
                id: `${this.motionId}-overlay`,
                duration: duration * 0.85,
              });
              if (tween && master?.add) master.add(tween, 0);
              return master;
            },
            (master) => {
              if (!this.dividers?.length) return master;
              const tween = this.animate(this.dividers, 'minimal-reveal', {
                id: `${this.motionId}-dividers`,
                stagger: 0.06,
                duration: duration * 0.75,
              });
              if (tween && master?.add) master.add(tween, 0.04);
              return master;
            },
          ],
          {
            id: `${this.motionId}-entrance`,
            scope: this,
          }
        );
      }

      if (this.mediaInner || this.media) {
        const mediaTarget = this.mediaInner || this.media;
        const isVideo =
          this.media?.dataset?.mediaType === 'video' ||
          mediaTarget.querySelector('video, .deferred-media');

        this.animate(mediaTarget, isVideo ? presets.video : presets.media, {
          id: `${this.motionId}-media`,
          duration: duration * 1.05,
          scroll: true,
          trigger: this,
          start: 'top 88%',
        });
      }

      this.runHeaderAnimations(presets, duration);
      this.runSearchControlsAnimations(presets, duration);
      this.runListAnimations(presets, duration);
      this.runNavAnimations(presets, duration);
    }

    runHeaderAnimations(presets, duration) {
      const targets = [...this.headerTargets];
      if (!targets.length) return;

      if (presets.sectionStyle === 'stagger') {
        this.animate(targets, 'stagger-features', {
          id: `${this.motionId}-header-stagger`,
          stagger: 0.08,
          duration,
          delay: 0.06,
          scroll: true,
          trigger: this.header || this.shell || this,
          start: 'top 88%',
        });
        return;
      }

      let delay = 0.06;
      targets.forEach((el, index) => {
        const role = el.dataset.netherFaqRole || this.inferRole(el);
        this.animate(el, this.presetForRole(role, presets), {
          id: `${this.motionId}-header-${index}`,
          duration,
          delay,
          scroll: true,
          trigger: this.header || this.shell || this,
          start: 'top 88%',
        });
        delay += 0.06;
      });
    }

    runSearchControlsAnimations(presets, duration) {
      if (this.searchWrap) {
        this.animate(this.searchWrap, presets.content || 'minimal-reveal', {
          id: `${this.motionId}-search`,
          duration: duration * 0.85,
          delay: 0.1,
          scroll: true,
          trigger: this.searchWrap,
          start: 'top 90%',
        });
      }

      if (this.controls) {
        this.animate(this.controls, 'minimal-reveal', {
          id: `${this.motionId}-controls`,
          duration: duration * 0.75,
          delay: 0.12,
          scroll: true,
          trigger: this.controls,
          start: 'top 90%',
        });
      }
    }

    /**
     * FAQ items / categories / groups sequential reveal.
     */
    runListAnimations(presets, duration) {
      const layout = this.config.faqLayout;
      const sectionStyle = presets.sectionStyle;

      if (sectionStyle === 'category_reveal' && this.categories.length) {
        this.animate(this.categories, presets.categories || 'fade-left', {
          id: `${this.motionId}-categories`,
          stagger: 0.1,
          duration,
          scroll: true,
          trigger: this.list || this,
          start: 'top 88%',
        });
      }

      const items = [...this.items];
      if (!items.length) return;

      if (layout === 'magazine') {
        const featuredItems = items.filter((item) => item.classList.contains('nether-faq__item--featured'));
        const secondaryItems = items.filter((item) => !item.classList.contains('nether-faq__item--featured'));

        if (featuredItems.length) {
          this.animate(featuredItems, presets.featured || presets.items || 'fade-up', {
            id: `${this.motionId}-featured`,
            duration: duration * 1.05,
            scroll: true,
            trigger: featuredItems[0],
            start: 'top 88%',
          });
        }

        if (secondaryItems.length) {
          this.animate(secondaryItems, presets.items || 'stagger-list', {
            id: `${this.motionId}-magazine-secondary`,
            stagger: 0.08,
            duration,
            delay: 0.1,
            scroll: true,
            trigger: this.list || this,
            start: 'top 88%',
          });
        }
        return;
      }

      const useItemScroll =
        layout === 'editorial_faq' ||
        layout === 'categorized_faq' ||
        layout === 'help_center' ||
        layout === 'support_center' ||
        layout === 'knowledge_base' ||
        items.length > 8;

      if (useItemScroll) {
        items.forEach((item, index) => {
          this.animate(item, presets.items || 'stagger-list', {
            id: `${this.motionId}-item-${index}`,
            duration,
            delay: Math.min(index * 0.035, 0.24),
            scroll: true,
            trigger: item,
            start: 'top 92%',
          });
        });
        return;
      }

      this.animate(items, presets.items || 'stagger-list', {
        id: `${this.motionId}-list`,
        stagger:
          sectionStyle === 'stagger' || sectionStyle === 'accordion_reveal' ? 0.09 : 0.07,
        duration,
        scroll: true,
        trigger: this.list || this,
        start: 'top 85%',
      });
    }

    runNavAnimations(presets, duration) {
      if (!this.navLinks?.length) return;

      this.animate(this.navLinks, presets.nav || 'minimal-reveal', {
        id: `${this.motionId}-nav`,
        stagger: 0.05,
        duration: duration * 0.8,
        delay: 0.14,
        scroll: true,
        trigger: this.nav || this.list || this,
        start: 'top 88%',
      });
    }

    /**
     * Soft layer sequencing for questions / icons inside groups — skip when items
     * already carry the primary stagger to avoid competing nested bursts.
     */
    initLayerSequencing(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const layout = this.config.faqLayout;
      if (
        layout !== 'editorial_faq' &&
        layout !== 'minimal_faq' &&
        layout !== 'magazine' &&
        presets.sectionStyle !== 'accordion_reveal'
      ) {
        return;
      }

      // Shell / header-adjacent icons only — item interiors stay with item stagger
      const shellIcons = [...this.icons].filter(
        (el) => !el.closest('[data-nether-faq-item]') && el.hasAttribute('data-nether-faq-animate')
      );

      shellIcons.forEach((icon, index) => {
        this.animate(icon, presets.icon || 'fade-scale', {
          id: `${this.motionId}-icon-${index}`,
          duration: this.config.animationDuration * 0.8,
          delay: 0.08,
          scroll: true,
          trigger: icon,
          start: 'top 92%',
        });
      });

      if (this.callouts.length && (layout === 'editorial_faq' || layout === 'help_center')) {
        this.callouts.forEach((callout, index) => {
          if (callout.closest('[data-nether-faq-item]')) return;
          this.animate(callout, presets.content || 'fade-up', {
            id: `${this.motionId}-callout-${index}`,
            duration: this.config.animationDuration,
            delay: 0.1,
            scroll: true,
            trigger: callout,
            start: 'top 90%',
          });
        });
      }
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      if (this.config.enableParallax && this.media && NM.scroll.parallax) {
        const target = this.mediaInner || this.media;
        NM.scroll.parallax(target, {
          speed: presets.motionStyle === 'luxury' ? 0.32 : 0.2,
          trigger: this,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-parallax`,
        });
      }

      if (
        !this.config.enableParallax &&
        (this.header || this.shell) &&
        (this.config.faqLayout === 'editorial_faq' || this.config.faqLayout === 'magazine') &&
        (presets.motionStyle === 'luxury' || presets.motionStyle === 'editorial') &&
        NM.scroll.parallax
      ) {
        const softTarget = this.panel || this.header || this.shell;
        NM.scroll.parallax(softTarget, {
          speed: 0.12,
          trigger: this,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-header-parallax`,
        });
      }
    }

    /**
     * Subtle hover — FAQ rows, icons, controls. Reuses library hover presets only.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll(
        '.nether-faq__buttons .button, .nether-faq__button-block .button, .nether-faq__cta .button'
      );
      if (buttons.length) {
        NM.hover(buttons, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-buttons`,
        });
      }

      if (this.items.length) {
        NM.hover(this.items, presets.hoverItem || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-items`,
          focus: false,
        });
      }

      if (this.icons.length) {
        NM.hover(this.icons, presets.hoverIcon || 'hover-icon-slide', {
          scope: this,
          id: `${this.motionId}-hover-icons`,
          focus: false,
        });
      }

      if (this.navLinks.length) {
        NM.hover(this.navLinks, 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-nav`,
        });
      }

      if (presets.hoverPanel && this.panel) {
        NM.hover(this.panel, presets.hoverPanel, {
          scope: this,
          id: `${this.motionId}-hover-panel`,
          focus: false,
        });
      }

      if (this.controls) {
        const controlButtons = this.controls.querySelectorAll('button');
        if (controlButtons.length) {
          NM.hover(controlButtons, 'hover-soft-lift', {
            scope: this,
            id: `${this.motionId}-hover-controls`,
          });
        }
      }
    }

    /**
     * Viewport batch secondary FAQ chrome for tall sections.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const layout = this.config.faqLayout;
      const tall =
        this.items.length > 8 ||
        layout === 'categorized_faq' ||
        layout === 'help_center' ||
        layout === 'support_center' ||
        layout === 'knowledge_base';

      if (!tall) return;

      const secondary = this.querySelectorAll(
        '[data-nether-faq-callout], [data-nether-faq-sidebar] [data-nether-faq-animate], .nether-faq__sidebar [data-nether-faq-animate]'
      );
      if (secondary.length < 2) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => {
          NM.animate(batch, presets.content || 'fade-up', {
            scope: this,
            scroll: false,
            stagger: 0.06,
            duration: this.config.animationDuration * 0.85,
            id: `${this.motionId}-viewport-batch`,
          });
        },
      });
    }

    presetForRole(role, presets) {
      switch (role) {
        case 'eyebrow':
          return presets.motionStyle === 'minimal' ? 'minimal-reveal' : 'fade-up';
        case 'heading':
          return presets.heading;
        case 'buttons':
        case 'button':
          return presets.buttons;
        case 'category':
          return presets.categories;
        case 'divider':
          return 'minimal-reveal';
        case 'icon':
          return presets.icon;
        case 'question':
          return presets.question;
        case 'answer':
          return presets.answer;
        case 'subheading':
        case 'text':
        case 'intro':
          return presets.content;
        default:
          return presets.content;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-faq__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-faq__heading')) return 'heading';
      if (el.classList.contains('nether-faq__subheading')) return 'subheading';
      if (el.classList.contains('nether-faq__text')) return 'text';
      if (el.classList.contains('nether-faq__buttons') || el.classList.contains('nether-faq__button-block')) {
        return 'buttons';
      }
      if (el.hasAttribute('data-nether-faq-category') || el.classList.contains('nether-faq__category')) {
        return 'category';
      }
      if (el.classList.contains('nether-faq__block-divider') || el.classList.contains('nether-faq__divider')) {
        return 'divider';
      }
      if (el.hasAttribute('data-nether-faq-icon') || el.classList.contains('nether-faq__icon-block')) {
        return 'icon';
      }
      if (el.hasAttribute('data-nether-faq-question') || el.classList.contains('nether-faq__question')) {
        return 'question';
      }
      if (el.hasAttribute('data-nether-faq-answer') || el.classList.contains('nether-faq__answer')) {
        return 'answer';
      }
      if (el.classList.contains('nether-faq__app-block')) return 'app';
      return 'content';
    }

    /**
     * Smooth accordion expand / collapse / caret rotation via Engine AnimationRegistry.
     * Preserves native details logic and aria-expanded sync — no schema changes.
     */
    handleDetailsToggle(event) {
      const detail = event.target;
      if (!detail?.matches?.('[data-nether-faq-details]')) return;

      const summary = detail.querySelector('summary');
      const panel = detail.querySelector('[data-nether-faq-answer], [data-nether-faq-panel]');
      const caret = detail.querySelector('[data-nether-faq-caret]');

      if (summary) {
        summary.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
      }

      if (this.prefersReducedMotion() || !this.motionReady || typeof gsap === 'undefined') {
        return;
      }

      const NM = window.NetherMotion;
      const duration = this.config.animationDuration;
      const baseId = `${this.motionId}-accordion-${detail.id || detail.getAttribute('id') || Math.random().toString(36).slice(2, 8)}`;

      const existingId = this.accordionTweenIds.get(detail);
      if (existingId && NM?.animations?.kill) {
        NM.animations.kill(existingId);
        NM.animations.kill(`${existingId}-caret`);
      }

      if (caret) {
        const caretTween = gsap.to(caret, {
          rotation: detail.open ? 180 : 0,
          duration: duration * 0.55,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        if (NM?.animations?.add) {
          NM.animations.add(`${baseId}-caret`, caretTween, {
            type: 'accordion-icon',
            targets: [caret],
            scope: this,
          });
        }
      }

      if (!panel) return;

      let tween;

      if (detail.open) {
        tween = gsap.fromTo(
          panel,
          { opacity: 0, y: 8, height: 0 },
          {
            opacity: 1,
            y: 0,
            height: 'auto',
            duration: Math.min(duration, 0.55),
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'height',
          }
        );
      } else {
        tween = gsap.to(panel, {
          opacity: 0.9,
          y: 0,
          duration: Math.min(duration * 0.45, 0.28),
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }

      if (NM?.animations?.add) {
        NM.animations.add(baseId, tween, {
          type: 'accordion',
          targets: [panel],
          scope: this,
        });
      }

      this.accordionTweenIds.set(detail, baseId);
    }

    syncSummaryAria() {
      this.details.forEach((detail) => {
        const summary = detail.querySelector('summary');
        if (summary) {
          summary.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
        }
      });

      if (this.config.expandAllDefault) {
        this.setAllDetails(true);
      }
    }

    setAllDetails(open) {
      this.details.forEach((detail) => {
        if (open) {
          detail.setAttribute('open', '');
        } else {
          detail.removeAttribute('open');
        }

        const summary = detail.querySelector('summary');
        if (summary) {
          summary.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      });
    }

    handleExpandAll() {
      this.setAllDetails(true);
    }

    handleCollapseAll() {
      this.setAllDetails(false);
    }

    handleSearchInput(event) {
      const query = event.target.value.trim().toLowerCase();
      const hasQuery = query.length > 0;

      this.searchClear?.classList.toggle('hidden', !hasQuery);

      if (hasQuery && this.config.searchEndpoint) {
        this.dataset.searchMode = 'endpoint-ready';
      }

      let visibleCount = 0;

      this.items.forEach((item) => {
        const searchText = (item.dataset.searchText || '').toLowerCase();
        const matches = !hasQuery || searchText.includes(query);

        item.classList.toggle('is-hidden', !matches);
        item.classList.toggle('is-filter-match', hasQuery && matches);

        if (matches) visibleCount += 1;
      });

      this.updateSearchStatus(visibleCount, hasQuery);
    }

    handleSearchClear() {
      if (!this.searchInput) return;

      this.searchInput.value = '';
      this.searchClear?.classList.add('hidden');
      this.handleSearchInput({ target: this.searchInput });
      this.searchInput.focus();
    }

    updateSearchStatus(count, hasQuery) {
      if (!this.searchStatus) return;

      if (!hasQuery) {
        this.searchStatus.textContent = '';
        return;
      }

      const template =
        count === 1
          ? this.dataset.searchResultSingular || '1 result found'
          : (this.dataset.searchResultPlural || '{{ count }} results found').replace(
              '{{ count }}',
              String(count)
            );

      this.searchStatus.textContent = template;
    }

    handleNavClick(event) {
      this.navLinks.forEach((link) => link.classList.remove('is-active'));
      event.currentTarget.classList.add('is-active');
    }

    handleRelatedClick(event) {
      const targetId = event.currentTarget.dataset.netherFaqRelatedTarget;
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });

      const details =
        target.querySelector('[data-nether-faq-details]') || target.closest('[data-nether-faq-details]');
      if (details && !details.open) {
        details.setAttribute('open', '');
      }
    }

    handleSectionLoad(event) {
      if (!event.target.contains(this) && event.target !== this) return;

      this.unbindEvents();
      this.parseConfig();
      this.cacheDom();
      this.bindEvents();
      this.killMotionTweens();
      this.syncSummaryAria();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-faq', NetherFaq);
})();
