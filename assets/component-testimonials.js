/**
 * Nether Premium Testimonials & Social Proof Framework — Motion integration (Phase 5.3.5)
 * Standalone Presentation Framework (multi-item social proof; does not extend NetherHero).
 *
 * Hero Motion is the architectural reference.
 * Banner + Content + Media Motion are the implementation references.
 *
 * All Testimonials motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No Testimonials-only presets unless library gaps exist.
 * Dawn slider carousel / autoplay / keyboard behavior preserved outside motion.
 */

(function () {
  'use strict';

  if (customElements.get('nether-testimonials')) return;

  const HOST_ID = 'nether-testimonials';
  let hostRegistered = false;

  const TESTIMONIALS_PRESETS = [
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
    'stagger-testimonials',
    'stagger-logos',
    'stagger-stats',
    'stagger-list',
    'text-heading-reveal',
    'text-luxury-heading',
    'text-editorial',
    'text-cta-reveal',
    'media-image-reveal',
    'media-video-reveal',
    'scroll-parallax',
    'scroll-floating',
    'scroll-section-reveal',
    'scroll-viewport-batch',
    'scroll-layered-parallax',
    'hover-soft-lift',
    'hover-luxury-lift',
    'hover-lift',
    'hover-media',
    'hover-glass',
    'hover-glow',
    'hover-image-zoom',
    'commerce-badge-reveal',
    'commerce-trust-reveal',
  ];

  function ensureTestimonialsHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: TESTIMONIALS_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Testimonials Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-media',
      },
    });
    hostRegistered = true;
  }

  class NetherTestimonials extends HTMLElement {
    constructor() {
      super();
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
      this.motionId = null;
      this.counterTweenIds = [];
    }

    connectedCallback() {
      if (this.initialized) return;

      this.initialized = true;
      this.cacheDom();
      this.parseConfig();
      this.registerMotion();
      this.initKeyboardNavigation();

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.killMotionTweens();
    }

    cacheDom() {
      this.grid = this.querySelector('[data-nether-testimonials-grid]');
      this.shell = this.querySelector('[data-nether-testimonials-shell]');
      this.header = this.querySelector('[data-nether-testimonials-header], .nether-testimonials__header');
      this.panel = this.querySelector(
        '[data-nether-testimonials-panel], .nether-testimonials__header-inner, .nether-testimonials__panel, .nether-hero__panel'
      );
      this.media = this.querySelector('[data-nether-hero-media]');
      this.mediaInner = this.querySelector('.nether-hero__media-inner, [data-nether-hero-media] .media');
      this.overlay = this.querySelector('.nether-hero__overlay, [data-nether-testimonials-overlay]');
      this.dividers = this.querySelectorAll(
        '[data-nether-testimonials-divider], .nether-testimonials__divider, .nether-testimonials__block-divider'
      );

      this.animateTargets = this.querySelectorAll('[data-nether-testimonials-animate]');
      this.headerTargets = this.querySelectorAll(
        '.nether-testimonials__header [data-nether-testimonials-animate], [data-nether-testimonials-header] [data-nether-testimonials-animate], [data-nether-testimonials-shell] [data-nether-testimonials-animate]'
      );

      this.gridItems = this.querySelectorAll(
        '.nether-testimonials__item[data-nether-testimonials-item], [data-nether-testimonials-item]'
      );
      this.cards = this.querySelectorAll('[data-nether-testimonials-card]');
      this.logos = this.querySelectorAll('[data-nether-testimonials-logo]');
      this.counters = this.querySelectorAll('[data-nether-testimonials-counter]');
      this.stats = this.querySelectorAll('[data-nether-testimonials-stat], .nether-testimonials__stat');
      this.avatars = this.querySelectorAll(
        '.nether-testimonials-card__avatar, .nether-testimonials__author-avatar, [data-nether-testimonials-avatar]'
      );
      this.ratings = this.querySelectorAll(
        '.nether-testimonials__rating, .nether-testimonials-card .rating, [data-nether-testimonials-rating]'
      );
      this.quotes = this.querySelectorAll(
        '.nether-testimonials-card__quote, .nether-content__quote, [data-nether-testimonials-quote]'
      );
      this.navControls = this.querySelectorAll(
        '[data-nether-testimonials-nav-control], [data-nether-testimonials-carousel] .slider-button, .nether-testimonials__slider .slider-button'
      );
      this.carousel = this.querySelector('[data-nether-testimonials-carousel]');
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-testimonials--layout-'));
      const cardStyleMatch = [...this.classList].find((c) => c.startsWith('nether-testimonials--card-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'stagger',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        hoverEffect: dataset.hoverReveal || 'lift',
        hoverReveal: dataset.hoverReveal === 'reveal',
        testimonialsLayout:
          dataset.testimonialsLayout ||
          dataset.netherTestimonialsLayout ||
          (layoutMatch ? layoutMatch.replace('nether-testimonials--layout-', '') : 'grid_testimonials'),
        cardStyle:
          dataset.netherTestimonialsCardStyle ||
          (cardStyleMatch ? cardStyleMatch.replace('nether-testimonials--card-', '') : 'medium'),
        glassEnabled:
          this.classList.contains('nether-testimonials--glass-enabled') ||
          this.classList.contains('nether-hero--glass-enabled') ||
          dataset.glassEnabled === 'true',
        floatingEnabled:
          this.classList.contains('nether-testimonials--floating-enabled') ||
          dataset.floatingEnabled === 'true',
        carouselReady: dataset.carouselReady === 'true',
      };
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
        ['stagger', 'card_reveal', 'logo_reveal', 'counter_reveal'].includes(this.config.animationStyle) ||
        this.config.testimonialsLayout === 'editorial_testimonials' ||
        this.config.testimonialsLayout === 'magazine' ||
        this.config.testimonialsLayout === 'brand_logos' ||
        this.config.testimonialsLayout === 'statistics' ||
        (this.gridItems && this.gridItems.length > 3) ||
        (this.dividers && this.dividers.length > 0)
      );
    }

    /**
     * Map section animation style + global Motion Style + Testimonials layout → library presets.
     * Merchant controls remain: section animation style/speed/parallax/hover + global Motion.
     * Calm, premium, trustworthy motion — prefer soft reveals over energetic motion.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.testimonialsLayout;
      const cardStyle = this.config.cardStyle;

      let content = 'fade-up';
      let heading = 'text-heading-reveal';
      let cards = 'stagger-testimonials';
      let logos = 'stagger-logos';
      let stats = 'stagger-stats';
      let quote = 'editorial-reveal';
      let avatar = 'fade-scale';
      let rating = 'fade-up';
      let buttons = 'text-cta-reveal';
      let overlay = 'minimal-reveal';
      let media = 'media-image-reveal';
      let video = 'media-video-reveal';
      let nav = 'minimal-reveal';
      let trust = 'commerce-trust-reveal';
      let hoverLift = 'hover-soft-lift';
      let hoverCard = 'hover-lift';
      let hoverLogo = 'hover-soft-lift';
      let hoverNav = 'hover-soft-lift';
      let hoverPanel = null;
      let featured = null;

      switch (sectionStyle) {
        case 'fade':
          content = 'minimal-reveal';
          cards = 'minimal-reveal';
          logos = 'minimal-reveal';
          stats = 'minimal-reveal';
          break;
        case 'slide':
          content = 'fade-up';
          cards = 'fade-up';
          break;
        case 'scale':
        case 'card_reveal':
          content = 'fade-scale';
          cards = 'stagger-cards';
          break;
        case 'logo_reveal':
          content = 'fade-up';
          cards = 'stagger-logos';
          logos = 'stagger-logos';
          break;
        case 'counter_reveal':
          content = 'fade-up';
          cards = 'stagger-stats';
          stats = 'stagger-stats';
          break;
        case 'stagger':
        default:
          content = 'stagger-features';
          cards = 'stagger-testimonials';
          break;
      }

      switch (motionStyle) {
        case 'luxury':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          heading = 'text-luxury-heading';
          cards = sectionStyle === 'logo_reveal' ? 'stagger-logos' : 'stagger-testimonials';
          quote = 'luxury-reveal';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
          break;
        case 'editorial':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'editorial-reveal';
          heading = 'text-heading-reveal';
          cards = sectionStyle === 'stagger' || sectionStyle === 'card_reveal' ? 'stagger-testimonials' : 'editorial-reveal';
          quote = 'text-editorial';
          hoverLift = 'hover-soft-lift';
          break;
        case 'minimal':
          if (sectionStyle === 'fade') {
            content = 'minimal-reveal';
            cards = 'minimal-reveal';
          }
          hoverLift = 'hover-soft-lift';
          break;
        default:
          break;
      }

      switch (layout) {
        case 'editorial_testimonials':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          quote = motionStyle === 'luxury' ? 'luxury-reveal' : 'text-editorial';
          cards = 'stagger-testimonials';
          media = motionStyle === 'editorial' ? 'clip-reveal' : 'media-image-reveal';
          break;

        case 'grid_testimonials':
          cards = sectionStyle === 'stagger' || sectionStyle === 'card_reveal' ? 'stagger-testimonials' : cards;
          if (sectionStyle === 'stagger') cards = 'stagger-grid';
          break;

        case 'carousel_testimonials':
          cards = 'stagger-cards';
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          nav = 'fade-up';
          break;

        case 'video_testimonials':
          media = 'media-video-reveal';
          video = 'media-video-reveal';
          cards = sectionStyle === 'stagger' ? 'stagger-testimonials' : 'fade-scale';
          break;

        case 'magazine':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          cards = 'stagger-testimonials';
          featured = 'fade-up';
          quote = motionStyle === 'luxury' ? 'luxury-reveal' : 'text-editorial';
          break;

        case 'minimal':
          content = 'minimal-reveal';
          cards = 'minimal-reveal';
          overlay = 'minimal-reveal';
          hoverLift = 'hover-soft-lift';
          break;

        case 'brand_logos':
          cards = 'stagger-logos';
          logos = 'stagger-logos';
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          break;

        case 'statistics':
          cards = 'stagger-stats';
          stats = 'stagger-stats';
          break;

        case 'awards':
          cards = 'stagger-cards';
          trust = 'commerce-badge-reveal';
          break;

        case 'press_mentions':
          cards = motionStyle === 'luxury' ? 'stagger-testimonials' : 'stagger-cards';
          quote = 'text-editorial';
          logos = 'stagger-logos';
          break;

        default:
          break;
      }

      // Card style modifiers (merchant card_style — no redesign)
      if (cardStyle === 'minimal') {
        content = 'minimal-reveal';
        hoverLift = 'hover-soft-lift';
      }

      if (cardStyle === 'editorial') {
        content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
        heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
        quote = motionStyle === 'luxury' ? 'luxury-reveal' : 'text-editorial';
      }

      if (cardStyle === 'glass' || this.config.glassEnabled) {
        if (motionStyle === 'luxury') {
          hoverPanel = 'hover-luxury-lift';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
        } else {
          hoverPanel = 'hover-glass';
          hoverLift = 'hover-soft-lift';
        }
      }

      if (cardStyle === 'gradient') {
        overlay = 'minimal-reveal';
      }

      // Map merchant hover_effect → hover presets (CSS classes remain; GSAP hover is additive)
      switch (this.config.hoverEffect) {
        case 'lift':
          hoverCard = hoverLift;
          break;
        case 'scale':
          hoverCard = 'hover-soft-lift';
          break;
        case 'shadow':
          hoverCard = 'hover-soft-lift';
          break;
        case 'glow':
          hoverCard = 'hover-glow';
          break;
        case 'reveal':
          hoverCard = hoverLift;
          break;
        default:
          break;
      }

      return {
        motionStyle,
        sectionStyle,
        content,
        heading,
        cards,
        logos,
        stats,
        quote,
        avatar,
        rating,
        buttons,
        overlay,
        media,
        video,
        nav,
        trust,
        hoverLift,
        hoverCard,
        hoverLogo,
        hoverNav,
        hoverPanel,
        featured,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureTestimonialsHost(NM);
      this.motionId = `${this.dataset.sectionId}-testimonials`;

      NM.registerSection(this.motionId, {
        type: 'testimonials',
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
      this.killCounterTweens();

      if (window.NetherMotion?.destroy) {
        window.NetherMotion.destroy(this);
      }

      this.dataset.netherMotionReady = 'false';
      this.removeAttribute('data-nether-motion-pending');
    }

    killMotionTweens() {
      this.destroyMotion();
    }

    killCounterTweens() {
      const NM = window.NetherMotion;
      if (NM?.animations?.kill) {
        this.counterTweenIds.forEach((id) => NM.animations.kill(id));
      }
      this.counterTweenIds = [];
    }

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureTestimonialsHost(NM);

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
        this.killCounterTweens();

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.removeAttribute('data-nether-motion-pending');

        const presets = this.resolvePresets();
        this.runEntranceSequence(presets);
        this.initScrollLayers(presets);
        this.initHoverInteractions(presets);
        this.initViewportBatch(presets);
        this.initLayerSequencing(presets);
        this.initCounterReveal(presets);
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      this.removeAttribute('data-nether-motion-pending');
      this.dataset.netherMotionReady = 'false';

      this.querySelectorAll(
        '[data-nether-testimonials-animate], [data-nether-testimonials-item], [data-nether-testimonials-card], [data-nether-testimonials-logo], .nether-hero__media-inner, .nether-hero__overlay'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });

      this.cards.forEach((card) => {
        card.classList.add('nether-testimonials-card--motion-reduced');
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
     * Entrance: section atmosphere + header + social-proof layer composition.
     * Calm sequencing — trust-forward, not energetic.
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
                duration: duration * 0.9,
              });
              if (tween && master?.add) master.add(tween, 0);
              return master;
            },
            (master) => {
              if (!this.dividers?.length) return master;
              const tween = this.animate(this.dividers, 'minimal-reveal', {
                id: `${this.motionId}-dividers`,
                stagger: 0.08,
                duration: duration * 0.8,
              });
              if (tween && master?.add) master.add(tween, 0.05);
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
          duration: duration * 1.1,
          scroll: true,
          trigger: this,
          start: 'top 88%',
        });
      }

      this.runHeaderAnimations(presets, duration);
      this.runGridAnimations(presets, duration);
      this.runNavigationAnimations(presets, duration);
    }

    runHeaderAnimations(presets, duration) {
      const targets = [...this.headerTargets];
      if (!targets.length) return;

      if (presets.sectionStyle === 'stagger') {
        this.animate(targets, 'stagger-features', {
          id: `${this.motionId}-header-stagger`,
          stagger: 0.1,
          duration,
          delay: 0.08,
          scroll: true,
          trigger: this.header || this.shell || this,
          start: 'top 88%',
        });
        return;
      }

      let delay = 0.08;
      targets.forEach((el, index) => {
        const role = el.dataset.netherTestimonialsRole || this.inferRole(el);
        this.animate(el, this.presetForRole(role, presets), {
          id: `${this.motionId}-header-${index}`,
          duration,
          delay,
          scroll: true,
          trigger: this.header || this.shell || this,
          start: 'top 88%',
        });
        delay += 0.07;
      });
    }

    /**
     * Grid / carousel / magazine / logos / stats / awards / press item reveals.
     * Soft stagger only — calm social-proof timing.
     */
    runGridAnimations(presets, duration) {
      const layout = this.config.testimonialsLayout;
      const items = [...this.gridItems];

      // Logo wall — prioritize logo nodes when logo_reveal or brand_logos
      if (
        (presets.sectionStyle === 'logo_reveal' || layout === 'brand_logos') &&
        this.logos.length
      ) {
        this.animate(this.logos, presets.logos || 'stagger-logos', {
          id: `${this.motionId}-logos`,
          stagger: 0.06,
          duration: duration * 0.9,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 88%',
        });
        return;
      }

      // Statistics layout
      if (layout === 'statistics' && (this.stats.length || items.length)) {
        const targets = this.stats.length ? this.stats : items;
        this.animate(targets, presets.stats || 'stagger-stats', {
          id: `${this.motionId}-stats`,
          stagger: 0.1,
          duration,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 88%',
        });
        return;
      }

      if (!items.length) {
        // Shell-only editorial / minimal — already handled via header targets
        if (this.cards.length && (layout === 'editorial_testimonials' || layout === 'minimal')) {
          this.animate(this.cards, presets.cards || 'stagger-testimonials', {
            id: `${this.motionId}-shell-cards`,
            stagger: 0.12,
            duration,
            scroll: true,
            trigger: this.shell || this,
            start: 'top 88%',
          });
        }
        return;
      }

      // Magazine — featured first, then secondary stagger
      if (layout === 'magazine') {
        const featuredItems = items.filter((item) =>
          item.classList.contains('nether-testimonials__item--featured')
        );
        const secondaryItems = items.filter(
          (item) => !item.classList.contains('nether-testimonials__item--featured')
        );

        if (featuredItems.length) {
          this.animate(featuredItems, presets.featured || presets.cards || 'fade-up', {
            id: `${this.motionId}-featured`,
            duration: duration * 1.1,
            scroll: true,
            trigger: featuredItems[0],
            start: 'top 88%',
          });
        }

        if (secondaryItems.length) {
          this.animate(secondaryItems, presets.cards || 'stagger-testimonials', {
            id: `${this.motionId}-magazine-secondary`,
            stagger: 0.12,
            duration,
            delay: 0.14,
            scroll: true,
            trigger: this.grid || this,
            start: 'top 88%',
          });
        }
        return;
      }

      // Carousel — soft card stagger into the strip (does not touch slider logic)
      if (layout === 'carousel_testimonials') {
        this.animate(items, presets.cards || 'stagger-cards', {
          id: `${this.motionId}-carousel`,
          stagger: 0.09,
          duration,
          scroll: true,
          trigger: this.carousel || this.grid || this,
          start: 'top 88%',
        });
        return;
      }

      // Tall grids — per-item scroll reveals to avoid one heavy entrance burst
      const useItemScroll =
        layout === 'editorial_testimonials' ||
        layout === 'press_mentions' ||
        items.length > 6;

      if (useItemScroll) {
        items.forEach((item, index) => {
          this.animate(item, presets.cards || 'stagger-testimonials', {
            id: `${this.motionId}-item-${index}`,
            duration,
            delay: Math.min(index * 0.04, 0.28),
            scroll: true,
            trigger: item,
            start: 'top 90%',
          });
        });
        return;
      }

      this.animate(items, presets.cards || 'stagger-testimonials', {
        id: `${this.motionId}-grid`,
        stagger: presets.sectionStyle === 'stagger' || presets.sectionStyle === 'card_reveal' ? 0.12 : 0.08,
        duration,
        scroll: true,
        trigger: this.grid || this,
        start: 'top 85%',
      });
    }

    runNavigationAnimations(presets, duration) {
      if (!this.navControls?.length) return;

      this.animate(this.navControls, presets.nav || 'minimal-reveal', {
        id: `${this.motionId}-nav`,
        stagger: 0.06,
        duration: duration * 0.8,
        delay: 0.2,
        scroll: true,
        trigger: this.carousel || this.grid || this,
        start: 'top 80%',
      });
    }

    /**
     * Layer sequencing for shell / editorial avatars, ratings, and quotes.
     * Grid card interiors skip nested reveals — cards/items carry the primary stagger
     * so motion stays calm and trustworthy (no competing nested bursts).
     */
    initLayerSequencing(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const layout = this.config.testimonialsLayout;
      if (layout !== 'editorial_testimonials' && layout !== 'minimal' && layout !== 'magazine') {
        return;
      }

      const inGridItem = (el) => Boolean(el.closest('[data-nether-testimonials-item]'));

      const avatars = [...this.avatars].filter((el) => !inGridItem(el));
      const ratings = [...this.ratings].filter((el) => !inGridItem(el));
      const quotes = [...this.quotes].filter((el) => {
        if (inGridItem(el)) return false;
        if (
          el.hasAttribute('data-nether-testimonials-animate') &&
          el.closest('[data-nether-testimonials-shell], [data-nether-testimonials-header]')
        ) {
          return false;
        }
        return true;
      });

      avatars.forEach((avatar, index) => {
        this.animate(avatar, presets.avatar || 'fade-scale', {
          id: `${this.motionId}-avatar-${index}`,
          duration: this.config.animationDuration * 0.85,
          delay: 0.12,
          scroll: true,
          trigger: avatar.closest('[data-nether-testimonials-card], [data-nether-testimonials-shell]') || avatar,
          start: 'top 92%',
        });
      });

      ratings.forEach((rating, index) => {
        this.animate(rating, presets.rating || 'fade-up', {
          id: `${this.motionId}-rating-${index}`,
          duration: this.config.animationDuration * 0.8,
          delay: 0.08,
          scroll: true,
          trigger: rating.closest('[data-nether-testimonials-card], [data-nether-testimonials-shell]') || rating,
          start: 'top 92%',
        });
      });

      quotes.forEach((quote, index) => {
        this.animate(quote, presets.quote || 'editorial-reveal', {
          id: `${this.motionId}-quote-${index}`,
          duration: this.config.animationDuration,
          delay: 0.1,
          scroll: true,
          trigger: quote.closest('[data-nether-testimonials-card], [data-nether-testimonials-shell]') || quote,
          start: 'top 90%',
        });
      });
    }

    /**
     * Counter reveal — numeric tween registered with Engine AnimationRegistry.
     * Preserves existing merchant counter_reveal behavior; no layout/schema changes.
     */
    initCounterReveal(presets) {
      if (this.config.animationStyle !== 'counter_reveal' && this.config.testimonialsLayout !== 'statistics') {
        return;
      }
      if (!this.counters.length || typeof gsap === 'undefined') return;

      const NM = window.NetherMotion;

      this.counters.forEach((counter, index) => {
        const rawValue = Number.parseFloat(counter.dataset.counterValue);
        if (Number.isNaN(rawValue)) return;

        const prefix = counter.dataset.counterPrefix || '';
        const suffix = counter.dataset.counterSuffix || '';
        const numberEl = counter.querySelector('.nether-testimonials__stat-number');
        if (!numberEl) return;

        const state = { value: 0 };
        const id = `${this.motionId}-counter-${index}`;

        const tween = gsap.to(state, {
          value: rawValue,
          duration: (this.config.animationDuration || 0.5) * 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: counter.closest('[data-nether-testimonials-stat]') || counter,
            start: 'top 90%',
            once: true,
          },
          onUpdate: () => {
            numberEl.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
          },
        });

        if (NM?.animations?.add) {
          NM.animations.add(id, tween, {
            type: 'counter',
            targets: [counter],
            scope: this,
          });
        }

        this.counterTweenIds.push(id);
      });
    }

    presetForRole(role, presets) {
      switch (role) {
        case 'eyebrow':
          return presets.motionStyle === 'minimal' ? 'minimal-reveal' : 'fade-up';
        case 'heading':
          return presets.heading;
        case 'buttons':
          return presets.buttons;
        case 'quote':
          return presets.quote;
        case 'author':
        case 'avatar':
          return presets.avatar;
        case 'rating':
          return presets.rating;
        case 'logo':
          return presets.logos;
        case 'stat':
          return presets.stats;
        case 'trust':
        case 'award':
        case 'press':
          return presets.trust;
        case 'divider':
          return 'minimal-reveal';
        case 'subheading':
        case 'text':
        case 'intro':
          return presets.content;
        default:
          return presets.content;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-testimonials__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-testimonials__heading')) return 'heading';
      if (el.classList.contains('nether-testimonials__subheading')) return 'subheading';
      if (el.classList.contains('nether-testimonials__text')) return 'text';
      if (el.classList.contains('nether-testimonials__buttons')) return 'buttons';
      if (el.classList.contains('nether-testimonials__author')) return 'author';
      if (el.classList.contains('nether-testimonials__rating') || el.classList.contains('rating')) return 'rating';
      if (el.hasAttribute('data-nether-testimonials-logo') || el.classList.contains('nether-testimonials__logo-item')) {
        return 'logo';
      }
      if (el.hasAttribute('data-nether-testimonials-stat') || el.classList.contains('nether-testimonials__stat')) {
        return 'stat';
      }
      if (el.classList.contains('nether-testimonials__award')) return 'award';
      if (el.classList.contains('nether-testimonials__press')) return 'press';
      if (el.classList.contains('nether-testimonials__trust-item')) return 'trust';
      if (el.classList.contains('nether-content__quote') || el.classList.contains('nether-testimonials-card__quote')) {
        return 'quote';
      }
      if (el.classList.contains('nether-testimonials__app-block')) return 'app';
      if (
        el.classList.contains('nether-testimonials__block-divider') ||
        el.classList.contains('nether-testimonials__divider')
      ) {
        return 'divider';
      }
      return 'content';
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      // Background / section media parallax (merchant toggle)
      if (this.config.enableParallax && this.media && NM.scroll.parallax) {
        const target = this.mediaInner || this.media;
        NM.scroll.parallax(target, {
          speed: presets.motionStyle === 'luxury' ? 0.35 : 0.22,
          trigger: this,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-parallax`,
        });
      }

      // Soft editorial content parallax when media parallax is off
      if (
        !this.config.enableParallax &&
        (this.header || this.shell) &&
        (this.config.testimonialsLayout === 'editorial_testimonials' ||
          this.config.testimonialsLayout === 'magazine') &&
        (presets.motionStyle === 'luxury' || presets.motionStyle === 'editorial')
      ) {
        NM.scroll.parallax(this.header || this.shell, {
          speed: 0.08,
          trigger: this,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-header-parallax`,
        });
      }

      // Ambient float for floating testimonial cards (decorative, calm)
      if (this.config.floatingEnabled && this.cards.length && NM.animate) {
        const floatingCards = this.querySelectorAll('.nether-testimonials-card--floating');
        floatingCards.forEach((card, index) => {
          if (index > 2) return;
          NM.animate(card, 'scroll-floating', {
            scope: this,
            scroll: false,
            duration: 4 + index * 0.5,
            delay: 0.6 + index * 0.2,
            id: `${this.motionId}-float-ambient-${index}`,
            preset: {
              from: { y: -3 },
              to: { y: 3 },
            },
          });
        });
      }
    }

    /**
     * Subtle premium hover — cards, logos, navigation controls.
     * Reuses library hover presets only. Respects merchant hover_effect.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll(
        '.nether-testimonials__buttons .button, .nether-testimonials__buttons a.button'
      );
      if (buttons.length) {
        NM.hover(buttons, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-buttons`,
        });
      }

      if (this.cards.length) {
        NM.hover(this.cards, presets.hoverCard, {
          scope: this,
          id: `${this.motionId}-hover-cards`,
          focus: false,
        });
      }

      if (this.logos.length) {
        NM.hover(this.logos, presets.hoverLogo || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-logos`,
          focus: false,
        });
      }

      if (this.navControls.length) {
        NM.hover(this.navControls, presets.hoverNav || 'hover-soft-lift', {
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

      // Merchant reveal hover — soft content lift via Engine hover (no raw GSAP)
      if (this.config.hoverReveal) {
        const revealContents = this.querySelectorAll(
          '.nether-testimonials-card--hover-reveal .nether-testimonials-card__content'
        );
        if (revealContents.length) {
          NM.hover(revealContents, 'hover-soft-lift', {
            scope: this,
            id: `${this.motionId}-hover-reveal-content`,
            focus: true,
            preset: {
              from: { y: 10, opacity: 0.94 },
              to: { y: 0, opacity: 1 },
              defaults: { duration: 0.35, ease: 'power2.out' },
            },
          });
        }
      }
    }

    /**
     * Viewport batch secondary Testimonials groups for tall sections.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '.nether-testimonials-card__avatar, .nether-testimonials__rating, .nether-testimonials-card__quote, .nether-testimonials__trust-item, .nether-testimonials__award, .nether-testimonials__press'
      );
      if (secondary.length < 4) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          NM.animate(batch, presets.content || 'fade-up', {
            scope: this,
            scroll: false,
            stagger: 0.08,
            duration: this.config.animationDuration * 0.85,
            id: `${this.motionId}-viewport-batch`,
          });
        },
      });
    }

    initKeyboardNavigation() {
      if (this.dataset.carouselReady !== 'true') return;

      const focusables = this.querySelectorAll(
        '.nether-testimonials-card, .nether-testimonials__logo-link, [data-nether-testimonials-card]'
      );

      focusables.forEach((item) => {
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

          const items = Array.from(focusables);
          const currentIndex = items.indexOf(item);
          if (currentIndex === -1) return;

          event.preventDefault();
          const offset = event.key === 'ArrowRight' ? 1 : -1;
          const nextIndex = (currentIndex + offset + items.length) % items.length;
          items[nextIndex]?.focus();
        });
      });
    }

    handleSectionLoad(event) {
      if (event.detail?.sectionId) {
        if (event.detail.sectionId !== this.dataset.sectionId) return;
      } else if (!(event.target?.contains?.(this) || event.target === this)) {
        return;
      }

      this.parseConfig();
      this.killMotionTweens();
      this.cacheDom();
      this.initKeyboardNavigation();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-testimonials', NetherTestimonials);
})();
