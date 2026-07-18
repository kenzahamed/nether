/**
 * Nether Premium Collection Showcase Framework — Motion integration (Phase 5.3.9)
 * Standalone Presentation Framework (multi-item collection surface; does not extend NetherHero).
 *
 * Hero Motion is the architectural reference.
 * Testimonials + Media Motion are the primary implementation references.
 *
 * All Collection Showcase motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. Zero new presets.
 * Dawn slider carousel / keyboard behavior preserved outside motion.
 */

(function () {
  'use strict';

  if (customElements.get('nether-collection')) return;

  const HOST_ID = 'nether-collection';
  let hostRegistered = false;

  const COLLECTION_PRESETS = [
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
    'stagger-stats',
    'text-heading-reveal',
    'text-luxury-heading',
    'text-cta-reveal',
    'media-image-reveal',
    'media-video-reveal',
    'scroll-parallax',
    'scroll-floating',
    'scroll-section-reveal',
    'scroll-viewport-batch',
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

  function ensureCollectionHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: COLLECTION_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Collection Showcase Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-testimonials',
      },
    });
    hostRegistered = true;
  }

  class NetherCollection extends HTMLElement {
    constructor() {
      super();
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
      this.motionId = null;
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
      this.grid = this.querySelector('[data-nether-collection-grid]');
      this.header = this.querySelector('[data-nether-collection-header], .nether-collection__header');
      this.headerInner = this.querySelector(
        '[data-nether-collection-panel], .nether-collection__header-inner'
      );
      this.highlights = this.querySelector('[data-nether-collection-highlights], .nether-collection__highlights');
      this.carousel = this.querySelector('[data-nether-collection-carousel]');
      this.dividers = this.querySelectorAll(
        '[data-nether-collection-divider], .nether-collection__divider'
      );

      this.animateTargets = this.querySelectorAll('[data-nether-collection-animate]');
      this.headerTargets = this.querySelectorAll(
        '.nether-collection__header [data-nether-collection-animate], [data-nether-collection-header] [data-nether-collection-animate]'
      );

      this.gridItems = this.querySelectorAll(
        '.nether-collection__item[data-nether-collection-item], [data-nether-collection-item]'
      );
      this.cards = this.querySelectorAll('[data-nether-collection-card]');
      this.cardMedia = this.querySelectorAll('[data-nether-collection-media]');
      this.parallaxMedia = this.querySelectorAll('[data-nether-collection-parallax]');
      this.cardOverlays = this.querySelectorAll(
        '[data-nether-collection-overlay], .nether-collection-card__overlay'
      );
      this.cardTitles = this.querySelectorAll(
        '[data-nether-collection-title], .nether-collection-card__heading'
      );
      this.cardDescriptions = this.querySelectorAll(
        '[data-nether-collection-description], .nether-collection-card__description'
      );
      this.cardBadges = this.querySelectorAll(
        '[data-nether-collection-badge], .nether-collection-card__badge'
      );
      this.cardCtas = this.querySelectorAll(
        '[data-nether-collection-cta], .nether-collection-card__cta'
      );
      this.cardStats = this.querySelectorAll('.nether-collection-card__stats, [data-nether-collection-stat]');
      this.navControls = this.querySelectorAll(
        '[data-nether-collection-nav-control], [data-nether-collection-carousel] .slider-button, .nether-collection__slider .slider-button'
      );
      this.viewAll = this.querySelector('.nether-collection__view-all');
      this.decorativeNotes = this.querySelectorAll(
        '.nether-collection__recommendations-note, .nether-collection__bundles-note, .nether-collection-highlight'
      );
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-collection--layout-'));
      const cardStyleMatch = [...this.classList].find((c) => c.startsWith('nether-collection--card-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'stagger',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        hoverEffect: dataset.hoverReveal || 'zoom',
        hoverReveal: dataset.hoverReveal === 'reveal',
        collectionLayout:
          dataset.collectionLayout ||
          dataset.netherCollectionLayout ||
          (layoutMatch ? layoutMatch.replace('nether-collection--layout-', '') : 'luxury_grid'),
        cardStyle:
          dataset.netherCollectionCardStyle ||
          (cardStyleMatch ? cardStyleMatch.replace('nether-collection--card-', '') : 'medium'),
        glassEnabled:
          this.classList.contains('nether-collection--glass-enabled') || dataset.glassEnabled === 'true',
        floatingEnabled:
          this.classList.contains('nether-collection--floating-enabled') ||
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
        ['stagger', 'slide', 'scale'].includes(this.config.animationStyle) ||
        ['editorial_grid', 'magazine', 'split_collection', 'masonry_grid', 'carousel', 'horizontal_scroll'].includes(
          this.config.collectionLayout
        ) ||
        (this.gridItems && this.gridItems.length > 3) ||
        (this.dividers && this.dividers.length > 0)
      );
    }

    /**
     * Map section animation style + global Motion Style + Collection layout → library presets.
     * Merchant controls remain: section animation style/speed/parallax/hover + global Motion.
     * Calm, premium merchandising motion — prefer soft reveals over energetic motion.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.collectionLayout;
      const cardStyle = this.config.cardStyle;

      let content = 'fade-up';
      let heading = 'text-heading-reveal';
      let cards = 'stagger-cards';
      let media = 'media-image-reveal';
      let video = 'media-video-reveal';
      let buttons = 'text-cta-reveal';
      let badge = 'commerce-badge-reveal';
      let overlay = 'minimal-reveal';
      let title = 'fade-up';
      let description = 'fade-up';
      let cta = 'text-cta-reveal';
      let stats = 'stagger-stats';
      let nav = 'minimal-reveal';
      let hoverLift = 'hover-soft-lift';
      let hoverCard = 'hover-lift';
      let hoverMedia = 'hover-image-zoom';
      let hoverNav = 'hover-soft-lift';
      let hoverPanel = null;
      let featured = null;

      switch (sectionStyle) {
        case 'fade':
          content = 'minimal-reveal';
          cards = 'minimal-reveal';
          break;
        case 'slide':
          content = 'fade-up';
          cards = 'fade-up';
          break;
        case 'scale':
          content = 'fade-scale';
          cards = 'stagger-cards';
          break;
        case 'stagger':
        default:
          content = 'stagger-features';
          cards = 'stagger-grid';
          break;
      }

      switch (motionStyle) {
        case 'luxury':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          heading = 'text-luxury-heading';
          cards = sectionStyle === 'stagger' ? 'stagger-cards' : 'luxury-reveal';
          title = 'fade-up';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
          break;
        case 'editorial':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'editorial-reveal';
          heading = 'text-heading-reveal';
          cards = sectionStyle === 'stagger' || sectionStyle === 'scale' ? 'stagger-grid' : 'editorial-reveal';
          media = 'clip-reveal';
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
        case 'editorial_grid':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          cards = 'stagger-grid';
          media = motionStyle === 'editorial' ? 'clip-reveal' : 'media-image-reveal';
          break;

        case 'luxury_grid':
          cards = sectionStyle === 'stagger' ? 'stagger-cards' : cards;
          if (motionStyle === 'luxury') {
            cards = 'stagger-cards';
            hoverCard = 'hover-luxury-lift';
          }
          break;

        case 'masonry_grid':
          cards = 'stagger-grid';
          break;

        case 'magazine':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          cards = 'stagger-cards';
          featured = 'fade-up';
          media = motionStyle === 'editorial' ? 'clip-reveal' : 'media-image-reveal';
          break;

        case 'split_collection':
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          cards = 'stagger-cards';
          featured = 'fade-up';
          media = 'media-image-reveal';
          break;

        case 'card_layout':
          cards = 'stagger-cards';
          overlay = 'minimal-reveal';
          break;

        case 'minimal_grid':
          content = 'minimal-reveal';
          cards = 'minimal-reveal';
          overlay = 'minimal-reveal';
          hoverLift = 'hover-soft-lift';
          break;

        case 'horizontal_scroll':
          cards = 'stagger-cards';
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          break;

        case 'carousel':
          cards = 'stagger-cards';
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          nav = 'fade-up';
          break;

        default:
          break;
      }

      if (cardStyle === 'minimal') {
        content = 'minimal-reveal';
        hoverLift = 'hover-soft-lift';
      }

      if (cardStyle === 'editorial') {
        content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
        heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
        media = motionStyle === 'editorial' ? 'clip-reveal' : media;
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
        case 'zoom':
          hoverMedia = 'hover-image-zoom';
          hoverCard = hoverLift;
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
        media,
        video,
        buttons,
        badge,
        overlay,
        title,
        description,
        cta,
        stats,
        nav,
        hoverLift,
        hoverCard,
        hoverMedia,
        hoverNav,
        hoverPanel,
        featured,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureCollectionHost(NM);
      this.motionId = `${this.dataset.sectionId}-collection`;

      NM.registerSection(this.motionId, {
        type: 'collection',
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
      if (window.NetherMotion?.destroy) {
        window.NetherMotion.destroy(this);
      }

      this.dataset.netherMotionReady = 'false';
      this.removeAttribute('data-nether-motion-pending');
    }

    killMotionTweens() {
      this.destroyMotion();
    }

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureCollectionHost(NM);

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

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.removeAttribute('data-nether-motion-pending');

        const presets = this.resolvePresets();
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

      this.querySelectorAll(
        '[data-nether-collection-animate], [data-nether-collection-item], [data-nether-collection-card], [data-nether-collection-media], .nether-collection-card__media-inner, .nether-collection-card__overlay, .nether-collection-card__content'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });

      this.cards.forEach((card) => {
        card.classList.add('nether-collection-card--motion-reduced');
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
     * Entrance: dividers + header + collection-card composition.
     * Merchandising-forward sequencing — clear category hierarchy, not flashy.
     */
    runEntranceSequence(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const duration = this.config.animationDuration;

      if (NM.timelines?.batch && this.dividers?.length) {
        NM.timelines.batch(
          [
            (master) => {
              const tween = this.animate(this.dividers, 'minimal-reveal', {
                id: `${this.motionId}-dividers`,
                stagger: 0.08,
                duration: duration * 0.8,
              });
              if (tween && master?.add) master.add(tween, 0);
              return master;
            },
          ],
          {
            id: `${this.motionId}-entrance`,
            scope: this,
          }
        );
      }

      this.runHeaderAnimations(presets, duration);
      this.runGridAnimations(presets, duration);
      this.runNavigationAnimations(presets, duration);
      this.runFooterAnimations(presets, duration);
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
          trigger: this.header || this,
          start: 'top 88%',
        });
        return;
      }

      let delay = 0.08;
      targets.forEach((el, index) => {
        const role = el.dataset.netherCollectionRole || this.inferRole(el);
        this.animate(el, this.presetForRole(role, presets), {
          id: `${this.motionId}-header-${index}`,
          duration,
          delay,
          scroll: true,
          trigger: this.header || this,
          start: 'top 88%',
        });
        delay += 0.07;
      });
    }

    /**
     * Grid / carousel / magazine / split / masonry / horizontal item reveals.
     * Soft stagger only — calm merchandising timing.
     */
    runGridAnimations(presets, duration) {
      const layout = this.config.collectionLayout;
      const items = [...this.gridItems];

      if (!items.length) {
        if (this.cards.length) {
          this.animate(this.cards, presets.cards || 'stagger-cards', {
            id: `${this.motionId}-shell-cards`,
            stagger: 0.1,
            duration,
            scroll: true,
            trigger: this.grid || this,
            start: 'top 88%',
          });
        }
        return;
      }

      // Magazine / split — featured first, then secondary stagger
      if (layout === 'magazine' || layout === 'split_collection') {
        const featuredItems = items.filter((item) =>
          item.classList.contains('nether-collection__item--featured')
        );
        const secondaryItems = items.filter(
          (item) => !item.classList.contains('nether-collection__item--featured')
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
          this.animate(secondaryItems, presets.cards || 'stagger-cards', {
            id: `${this.motionId}-secondary`,
            stagger: 0.1,
            duration,
            delay: 0.12,
            scroll: true,
            trigger: this.grid || this,
            start: 'top 88%',
          });
        }
        return;
      }

      // Carousel — soft card stagger into the strip (does not touch slider logic)
      if (layout === 'carousel') {
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

      // Tall grids / editorial / masonry — per-item scroll reveals to avoid one heavy entrance burst
      const useItemScroll =
        layout === 'editorial_grid' ||
        layout === 'masonry_grid' ||
        items.length > 6;

      if (useItemScroll) {
        items.forEach((item, index) => {
          this.animate(item, presets.cards || 'stagger-cards', {
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

      this.animate(items, presets.cards || 'stagger-cards', {
        id: `${this.motionId}-grid`,
        stagger: presets.sectionStyle === 'stagger' || presets.sectionStyle === 'scale' ? 0.1 : 0.08,
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

    runFooterAnimations(presets, duration) {
      if (this.viewAll) {
        this.animate(this.viewAll, presets.buttons || 'text-cta-reveal', {
          id: `${this.motionId}-view-all`,
          duration: duration * 0.9,
          delay: 0.16,
          scroll: true,
          trigger: this.viewAll,
          start: 'top 92%',
        });
      }

      if (this.decorativeNotes?.length) {
        this.animate(this.decorativeNotes, presets.content || 'fade-up', {
          id: `${this.motionId}-notes`,
          stagger: 0.08,
          duration: duration * 0.85,
          delay: 0.1,
          scroll: true,
          trigger: this.decorativeNotes[0],
          start: 'top 92%',
        });
      }

      if (this.highlights) {
        const highlightItems = this.highlights.querySelectorAll(
          '[data-nether-collection-animate], .nether-collection-highlight'
        );
        if (highlightItems.length) {
          this.animate(highlightItems, presets.cards || 'stagger-cards', {
            id: `${this.motionId}-highlights`,
            stagger: 0.1,
            duration,
            scroll: true,
            trigger: this.highlights,
            start: 'top 90%',
          });
        }
      }
    }

    /**
     * Layer sequencing for featured / magazine / split / editorial interiors.
     * Media + overlay + badge only — titles / descriptions / CTAs ride with the
     * primary card stagger (or viewport batch on tall grids) to avoid nested opacity fights.
     */
    initLayerSequencing(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const layout = this.config.collectionLayout;
      const sequenceLayouts = ['magazine', 'split_collection', 'editorial_grid', 'card_layout'];
      if (!sequenceLayouts.includes(layout)) return;

      let cards;
      if (layout === 'magazine' || layout === 'split_collection') {
        cards = this.querySelectorAll(
          '.nether-collection__item--featured [data-nether-collection-card], .nether-collection-card--featured'
        );
      } else {
        cards = this.querySelectorAll('[data-nether-collection-card]');
      }

      // Cap nested sequencing to avoid thrashing on large grids
      const sequenceTargets = [...cards].slice(0, layout === 'editorial_grid' ? 4 : 6);

      sequenceTargets.forEach((card, cardIndex) => {
        const media = card.querySelector(
          '.nether-collection-card__media-inner, [data-nether-collection-media]'
        );
        const overlay = card.querySelector('[data-nether-collection-overlay], .nether-collection-card__overlay');
        const badge = card.querySelector('[data-nether-collection-badge], .nether-collection-card__badge');
        const trigger = card;
        const baseDelay = 0.1 + cardIndex * 0.03;
        const duration = this.config.animationDuration;

        if (media) {
          const isVideo = Boolean(media.querySelector('video, .deferred-media, iframe'));
          this.animate(media, isVideo ? presets.video : presets.media, {
            id: `${this.motionId}-layer-media-${cardIndex}`,
            duration: duration * 1.05,
            delay: baseDelay,
            scroll: true,
            trigger,
            start: 'top 90%',
          });
        }

        if (overlay) {
          this.animate(overlay, presets.overlay || 'minimal-reveal', {
            id: `${this.motionId}-layer-overlay-${cardIndex}`,
            duration: duration * 0.85,
            delay: baseDelay + 0.05,
            scroll: true,
            trigger,
            start: 'top 90%',
          });
        }

        if (badge) {
          this.animate(badge, presets.badge || 'commerce-badge-reveal', {
            id: `${this.motionId}-layer-badge-${cardIndex}`,
            duration: duration * 0.8,
            delay: baseDelay + 0.1,
            scroll: true,
            trigger,
            start: 'top 90%',
          });
        }
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
        case 'badge':
          return presets.badge;
        case 'divider':
          return 'minimal-reveal';
        case 'highlight':
          return presets.cards;
        case 'subheading':
        case 'text':
        case 'intro':
          return presets.content;
        default:
          return presets.content;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-collection__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-collection__heading')) return 'heading';
      if (el.classList.contains('nether-collection__subheading')) return 'subheading';
      if (el.classList.contains('nether-collection__text')) return 'text';
      if (el.classList.contains('nether-collection__buttons')) return 'buttons';
      if (el.classList.contains('nether-collection__app-block')) return 'app';
      if (el.classList.contains('nether-collection__divider')) return 'divider';
      if (el.classList.contains('nether-collection-highlight')) return 'highlight';
      if (el.classList.contains('nether-collection__view-all')) return 'buttons';
      return 'content';
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      // Per-card media parallax (merchant toggle) — already supported via Engine scroll.parallax
      if (this.config.enableParallax && this.parallaxMedia.length && NM.scroll.parallax) {
        this.parallaxMedia.forEach((media, index) => {
          const inner = media.querySelector('.nether-collection-card__media-inner');
          const target = inner || media;
          const trigger = media.closest('[data-nether-collection-card]') || media;

          NM.scroll.parallax(target, {
            speed: presets.motionStyle === 'luxury' ? 0.35 : 0.22,
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scope: this,
            id: `${this.motionId}-parallax-${index}`,
          });
        });
      }

      // Soft editorial header parallax when media parallax is off
      if (
        !this.config.enableParallax &&
        this.header &&
        (this.config.collectionLayout === 'editorial_grid' || this.config.collectionLayout === 'magazine') &&
        (presets.motionStyle === 'luxury' || presets.motionStyle === 'editorial')
      ) {
        NM.scroll.parallax(this.header, {
          speed: 0.08,
          trigger: this,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-header-parallax`,
        });
      }

      // Ambient float for floating collection cards (decorative, calm)
      if (this.config.floatingEnabled && this.cards.length && NM.animate) {
        const floatingCards = this.querySelectorAll('.nether-collection-card--floating');
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
     * Subtle premium hover — cards, media, buttons, navigation.
     * Reuses library hover presets only. Respects merchant hover_effect.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll(
        '.nether-collection__buttons .button, .nether-collection__buttons a.button, .nether-collection__view-all .button, .nether-collection__view-all a.button'
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

      // Media hover zoom when merchant chooses zoom (library hover-image-zoom)
      if (this.config.hoverEffect === 'zoom' && this.cardMedia.length) {
        const mediaInners = this.querySelectorAll('.nether-collection-card__media-inner');
        if (mediaInners.length) {
          NM.hover(mediaInners, presets.hoverMedia || 'hover-image-zoom', {
            scope: this,
            id: `${this.motionId}-hover-media`,
            focus: false,
          });
        }
      }

      if (this.navControls.length) {
        NM.hover(this.navControls, presets.hoverNav || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-nav`,
        });
      }

      if (presets.hoverPanel && this.headerInner) {
        NM.hover(this.headerInner, presets.hoverPanel, {
          scope: this,
          id: `${this.motionId}-hover-panel`,
          focus: false,
        });
      }

      // Merchant reveal hover — soft content lift via Engine hover (no raw GSAP)
      if (this.config.hoverReveal) {
        const revealContents = this.querySelectorAll(
          '.nether-collection-card--hover-reveal .nether-collection-card__content'
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
     * Viewport batch secondary Collection chrome for tall sections
     * (titles, descriptions, CTAs, badges, stats) after primary card stagger.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '[data-nether-collection-badge], [data-nether-collection-title], [data-nether-collection-description], [data-nether-collection-cta], [data-nether-collection-stat], .nether-collection-highlight'
      );
      if (secondary.length < 6) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          const nodes = Array.from(batch || []);
          const badgeBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-collection-badge], .nether-collection-card__badge')
          );
          const titleBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-collection-title], .nether-collection-card__heading')
          );
          const ctaBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-collection-cta], .nether-collection-card__cta')
          );
          const rest = nodes.filter(
            (el) => !badgeBatch.includes(el) && !titleBatch.includes(el) && !ctaBatch.includes(el)
          );

          if (badgeBatch.length) {
            NM.animate(badgeBatch, presets.badge || 'commerce-badge-reveal', {
              scope: this,
              scroll: false,
              stagger: 0.05,
              duration: this.config.animationDuration * 0.8,
              id: `${this.motionId}-viewport-batch-badges`,
            });
          }

          if (titleBatch.length) {
            NM.animate(titleBatch, presets.title || 'fade-up', {
              scope: this,
              scroll: false,
              stagger: 0.05,
              duration: this.config.animationDuration * 0.85,
              id: `${this.motionId}-viewport-batch-titles`,
            });
          }

          if (ctaBatch.length) {
            NM.animate(ctaBatch, presets.cta || 'text-cta-reveal', {
              scope: this,
              scroll: false,
              stagger: 0.05,
              duration: this.config.animationDuration * 0.85,
              id: `${this.motionId}-viewport-batch-ctas`,
            });
          }

          if (rest.length) {
            NM.animate(rest, presets.description || 'fade-up', {
              scope: this,
              scroll: false,
              stagger: 0.06,
              duration: this.config.animationDuration * 0.85,
              id: `${this.motionId}-viewport-batch`,
            });
          }
        },
      });
    }

    initKeyboardNavigation() {
      if (this.dataset.carouselReady !== 'true') return;

      this.cards.forEach((card) => {
        const link = card.querySelector('.nether-collection-card__link');
        if (!link) return;

        link.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

          const items = Array.from(this.querySelectorAll('.nether-collection-card__link'));
          const currentIndex = items.indexOf(link);
          if (currentIndex === -1) return;

          event.preventDefault();
          const offset = event.key === 'ArrowRight' ? 1 : -1;
          const nextIndex = (currentIndex + offset + items.length) % items.length;
          items[nextIndex]?.focus();
        });
      });
    }

    handleSectionLoad(event) {
      if (event.detail?.sectionId !== this.dataset.sectionId) {
        if (!(event.target?.contains?.(this) || event.target === this)) return;
      }

      this.parseConfig();
      this.killMotionTweens();
      this.cacheDom();
      this.initKeyboardNavigation();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-collection', NetherCollection);
})();
