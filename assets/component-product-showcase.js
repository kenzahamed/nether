/**
 * Nether Premium Product Showcase Framework — Motion integration (Phase 5.3.10)
 * Standalone Presentation Framework (multi-item product surface; does not extend NetherHero).
 *
 * Hero Motion is the architectural reference.
 * Collection Showcase Motion (5.3.9) is the primary implementation reference.
 * Testimonials + Media Motion patterns also applied.
 *
 * All Product Showcase motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. Zero new presets.
 * Product cards, variant logic, quick actions, ATC, wishlist, compare, Quick View,
 * and product links are preserved — presentation motion only.
 * Dawn slider carousel / keyboard / card-product behavior preserved outside motion.
 */

(function () {
  'use strict';

  if (customElements.get('nether-product')) return;

  const HOST_ID = 'nether-product';
  let hostRegistered = false;

  const PRODUCT_PRESETS = [
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
    'commerce-price-change',
    'commerce-trust-reveal',
  ];

  function ensureProductHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: PRODUCT_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Product Showcase Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-collection',
      },
    });
    hostRegistered = true;
  }

  class NetherProduct extends HTMLElement {
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
      this.grid = this.querySelector('[data-nether-product-grid]');
      this.header = this.querySelector('[data-nether-product-header], .nether-product__header');
      this.headerInner = this.querySelector(
        '[data-nether-product-panel], .nether-product__header-inner'
      );
      this.highlights = this.querySelectorAll(
        '[data-nether-product-role="highlight"], .nether-product-highlight'
      );
      this.carousel = this.querySelector('[data-nether-product-carousel]');
      this.dividers = this.querySelectorAll(
        '[data-nether-product-divider], .nether-product__divider'
      );

      this.animateTargets = this.querySelectorAll('[data-nether-product-animate]');
      this.headerTargets = this.querySelectorAll(
        '.nether-product__header [data-nether-product-animate], [data-nether-product-header] [data-nether-product-animate]'
      );

      this.gridItems = this.querySelectorAll(
        '.nether-product__item[data-nether-product-item], [data-nether-product-item]'
      );
      this.cards = this.querySelectorAll('[data-nether-product-card]');
      this.featuredCards = this.querySelectorAll(
        '.nether-product__item--featured [data-nether-product-card], .nether-product-card--featured'
      );
      this.cardMedia = this.querySelectorAll('[data-nether-product-media]');
      this.parallaxMedia = this.querySelectorAll('[data-nether-product-parallax]');
      this.cardOverlays = this.querySelectorAll(
        '[data-nether-product-overlay], .nether-product-card__overlay'
      );
      this.cardTitles = this.querySelectorAll(
        '[data-nether-product-title], .nether-product-card__heading'
      );
      this.cardPrices = this.querySelectorAll(
        '[data-nether-product-price], .nether-product-card__price'
      );
      this.cardBadges = this.querySelectorAll(
        '[data-nether-product-badge], .nether-product-card__badge'
      );
      this.cardRatings = this.querySelectorAll(
        '[data-nether-product-rating], .nether-product-card__rating, .nether-product-card__rating-placeholder'
      );
      this.cardCtas = this.querySelectorAll(
        '[data-nether-product-cta], .nether-product-card__cta'
      );
      this.cardActions = this.querySelectorAll(
        '[data-nether-product-actions], .nether-product-card__actions'
      );
      this.cardTrust = this.querySelectorAll(
        '[data-nether-product-trust], .nether-product-card__stock, .nether-product-card__savings'
      );
      this.cardStats = this.querySelectorAll(
        '.nether-product-card__stats, [data-nether-product-stat]'
      );
      this.decorativePanels = this.querySelectorAll(
        '[data-nether-product-decorative], .nether-product-card__glass-panel'
      );
      this.navControls = this.querySelectorAll(
        '[data-nether-product-nav-control], [data-nether-product-carousel] .slider-button, .nether-product__slider .slider-button'
      );
      this.viewAll = this.querySelector('.nether-product__view-all');
      this.decorativeNotes = this.querySelectorAll(
        '.nether-product__recommendations-note, .nether-product__bundles-note'
      );
      this.dawnCards = this.querySelectorAll('.nether-product__dawn-card .card-wrapper, .nether-product__dawn-card .card');
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-product--layout-'));
      const cardStyleMatch = [...this.classList].find((c) => c.startsWith('nether-product--card-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'stagger',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        hoverEffect: dataset.hoverReveal || 'zoom',
        hoverReveal: dataset.hoverReveal === 'reveal',
        productLayout:
          dataset.productLayout ||
          dataset.netherProductLayout ||
          (layoutMatch ? layoutMatch.replace('nether-product--layout-', '') : 'luxury_grid'),
        cardStyle:
          dataset.netherProductCardStyle ||
          (cardStyleMatch ? cardStyleMatch.replace('nether-product--card-', '') : 'medium'),
        glassEnabled:
          this.classList.contains('nether-product--glass-enabled') || dataset.glassEnabled === 'true',
        floatingEnabled:
          this.classList.contains('nether-product--floating-enabled') ||
          dataset.floatingEnabled === 'true',
        carouselReady: dataset.carouselReady === 'true',
        usesDawnCards: this.classList.contains('nether-product--dawn-cards'),
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
        [
          'editorial_grid',
          'magazine',
          'split_product',
          'masonry_grid',
          'carousel',
          'horizontal_scroll',
        ].includes(this.config.productLayout) ||
        (this.gridItems && this.gridItems.length > 3) ||
        (this.dividers && this.dividers.length > 0)
      );
    }

    /**
     * Map section animation style + global Motion Style + Product layout → library presets.
     * Merchant controls remain: section animation style/speed/parallax/hover + global Motion.
     * Calm, premium merchandising motion — clear product hierarchy, not flashy.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.productLayout;
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
      let price = 'commerce-price-change';
      let rating = 'fade-up';
      let trust = 'commerce-trust-reveal';
      let actions = 'fade-up';
      let cta = 'text-cta-reveal';
      let stats = 'stagger-stats';
      let nav = 'minimal-reveal';
      let hoverLift = 'hover-soft-lift';
      let hoverCard = 'hover-lift';
      let hoverMedia = 'hover-image-zoom';
      let hoverNav = 'hover-soft-lift';
      let hoverActions = 'hover-soft-lift';
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

        case 'split_product':
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          cards = 'stagger-cards';
          featured = 'fade-up';
          media = 'media-image-reveal';
          break;

        case 'card_grid':
          cards = 'stagger-cards';
          overlay = 'minimal-reveal';
          break;

        case 'minimal_layout':
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
        price,
        rating,
        trust,
        actions,
        cta,
        stats,
        nav,
        hoverLift,
        hoverCard,
        hoverMedia,
        hoverNav,
        hoverActions,
        hoverPanel,
        featured,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureProductHost(NM);
      this.motionId = `${this.dataset.sectionId}-product`;

      NM.registerSection(this.motionId, {
        type: 'product',
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
      ensureProductHost(NM);

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
        '[data-nether-product-animate], [data-nether-product-item], [data-nether-product-card], [data-nether-product-media], .nether-product-card__media-inner, .nether-product-card__overlay, .nether-product-card__content, .nether-product-card__actions, .nether-product__dawn-card .card'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });

      this.cards.forEach((card) => {
        card.classList.add('nether-product-card--motion-reduced');
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
     * Entrance: dividers + header + product-card composition.
     * Merchandising-forward sequencing — clear product hierarchy, not flashy.
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
        const role = el.dataset.netherProductRole || this.inferRole(el);
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
     * Soft stagger only — calm merchandising timing. Preserves Dawn card markup.
     */
    runGridAnimations(presets, duration) {
      const layout = this.config.productLayout;
      const items = [...this.gridItems];

      if (!items.length) {
        const fallback = this.cards.length
          ? this.cards
          : this.dawnCards.length
            ? this.dawnCards
            : null;
        if (fallback) {
          this.animate(fallback, presets.cards || 'stagger-cards', {
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

      // Magazine / split — featured product first, then secondary stagger
      if (layout === 'magazine' || layout === 'split_product') {
        const featuredItems = items.filter((item) =>
          item.classList.contains('nether-product__item--featured')
        );
        const secondaryItems = items.filter(
          (item) => !item.classList.contains('nether-product__item--featured')
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
        layout === 'editorial_grid' || layout === 'masonry_grid' || items.length > 6;

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
        this.animate(this.decorativeNotes, presets.trust || 'commerce-trust-reveal', {
          id: `${this.motionId}-notes`,
          stagger: 0.08,
          duration: duration * 0.85,
          delay: 0.1,
          scroll: true,
          trigger: this.decorativeNotes[0],
          start: 'top 92%',
        });
      }

      if (this.highlights?.length) {
        // Highlights already ride header stagger when inside header; avoid double-animating
        const headerHighlightSet = new Set(this.headerTargets);
        const orphanHighlights = [...this.highlights].filter((el) => !headerHighlightSet.has(el));
        if (orphanHighlights.length) {
          this.animate(orphanHighlights, presets.cards || 'stagger-cards', {
            id: `${this.motionId}-highlights`,
            stagger: 0.1,
            duration,
            scroll: true,
            trigger: orphanHighlights[0],
            start: 'top 90%',
          });
        }
      }
    }

    /**
     * Layer sequencing for featured / magazine / split / editorial interiors.
     * Media + overlay + badge + price on featured layouts; titles / CTAs / ratings /
     * actions ride primary card stagger or viewport batch on tall grids.
     */
    initLayerSequencing(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const layout = this.config.productLayout;
      const sequenceLayouts = ['magazine', 'split_product', 'editorial_grid', 'luxury_grid'];
      if (!sequenceLayouts.includes(layout)) return;

      let cards;
      if (layout === 'magazine' || layout === 'split_product') {
        cards = this.querySelectorAll(
          '.nether-product__item--featured [data-nether-product-card], .nether-product-card--featured'
        );
      } else {
        cards = this.querySelectorAll('[data-nether-product-card]');
      }

      const sequenceTargets = [...cards].slice(0, layout === 'editorial_grid' || layout === 'luxury_grid' ? 4 : 6);

      sequenceTargets.forEach((card, cardIndex) => {
        const media = card.querySelector(
          '.nether-product-card__media-inner, [data-nether-product-media]'
        );
        const overlay = card.querySelector(
          '[data-nether-product-overlay], .nether-product-card__overlay'
        );
        const badge = card.querySelector(
          '[data-nether-product-badge], .nether-product-card__badge'
        );
        const price = card.querySelector(
          '[data-nether-product-price], .nether-product-card__price'
        );
        const decorative = card.querySelector(
          '[data-nether-product-decorative], .nether-product-card__glass-panel'
        );
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

        if (decorative) {
          this.animate(decorative, 'minimal-reveal', {
            id: `${this.motionId}-layer-decorative-${cardIndex}`,
            duration: duration * 0.75,
            delay: baseDelay + 0.06,
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

        if (price && (layout === 'magazine' || layout === 'split_product')) {
          this.animate(price, presets.price || 'commerce-price-change', {
            id: `${this.motionId}-layer-price-${cardIndex}`,
            duration: duration * 0.75,
            delay: baseDelay + 0.14,
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
        case 'price':
          return presets.price;
        case 'rating':
          return presets.rating;
        case 'trust':
          return presets.trust;
        case 'actions':
          return presets.actions;
        case 'subheading':
        case 'text':
        case 'intro':
          return presets.content;
        default:
          return presets.content;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-product__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-product__heading')) return 'heading';
      if (el.classList.contains('nether-product__subheading')) return 'subheading';
      if (el.classList.contains('nether-product__text')) return 'text';
      if (el.classList.contains('nether-product__buttons')) return 'buttons';
      if (el.classList.contains('nether-product__app-block')) return 'app';
      if (el.classList.contains('nether-product__divider')) return 'divider';
      if (el.classList.contains('nether-product-highlight')) return 'highlight';
      if (el.classList.contains('nether-product__view-all')) return 'buttons';
      if (el.classList.contains('nether-product-card__price')) return 'price';
      if (el.classList.contains('nether-product-card__rating')) return 'rating';
      if (el.classList.contains('nether-product-card__actions')) return 'actions';
      if (
        el.classList.contains('nether-product-card__stock') ||
        el.classList.contains('nether-product-card__savings')
      ) {
        return 'trust';
      }
      return 'content';
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      // Per-card media parallax (merchant toggle) — Engine scroll.parallax only
      if (this.config.enableParallax && this.parallaxMedia.length && NM.scroll.parallax) {
        this.parallaxMedia.forEach((media, index) => {
          const inner = media.querySelector('.nether-product-card__media-inner');
          const target = inner || media;
          const trigger = media.closest('[data-nether-product-card]') || media;

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
        (this.config.productLayout === 'editorial_grid' || this.config.productLayout === 'magazine') &&
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

      // Ambient float for floating product cards (decorative, calm)
      if (this.config.floatingEnabled && this.cards.length && NM.animate) {
        const floatingCards = this.querySelectorAll('.nether-product-card--floating');
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
     * Subtle premium hover — cards, media, buttons, navigation, quick actions.
     * Reuses library hover presets only. Respects merchant hover_effect.
     * Does not alter wishlist / compare / Quick View / ATC behavior.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll(
        '.nether-product__buttons .button, .nether-product__buttons a.button, .nether-product__view-all .button, .nether-product__view-all a.button'
      );
      if (buttons.length) {
        NM.hover(buttons, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-buttons`,
        });
      }

      const hoverTargets = this.cards.length
        ? this.cards
        : this.config.usesDawnCards
          ? this.querySelectorAll('.nether-product__dawn-card .card-wrapper, .nether-product__dawn-card .card')
          : [];

      if (hoverTargets.length) {
        NM.hover(hoverTargets, presets.hoverCard, {
          scope: this,
          id: `${this.motionId}-hover-cards`,
          focus: false,
        });
      }

      // Media hover zoom when merchant chooses zoom (library hover-image-zoom)
      if (this.config.hoverEffect === 'zoom' && this.cardMedia.length) {
        const mediaInners = this.querySelectorAll('.nether-product-card__media-inner');
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

      // Quick actions — soft lift only; functionality unchanged
      const actionButtons = this.querySelectorAll(
        '.nether-product-card__actions .button, .nether-product-card__actions .nether-product-card__action, .nether-product-card__actions [data-nether-wishlist], .nether-product-card__actions [data-nether-compare], .nether-product-card__actions [data-nether-quick-view]'
      );
      if (actionButtons.length) {
        NM.hover(actionButtons, presets.hoverActions || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-actions`,
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
          '.nether-product-card--hover-reveal .nether-product-card__content'
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
     * Viewport batch secondary Product chrome for tall sections
     * (titles, prices, ratings, CTAs, badges, trust, actions, stats) after primary card stagger.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '[data-nether-product-badge], [data-nether-product-title], [data-nether-product-price], [data-nether-product-rating], [data-nether-product-cta], [data-nether-product-actions], [data-nether-product-trust], [data-nether-product-stat], .nether-product-highlight'
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
            el.matches?.('[data-nether-product-badge], .nether-product-card__badge')
          );
          const titleBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-product-title], .nether-product-card__heading')
          );
          const priceBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-product-price], .nether-product-card__price')
          );
          const ctaBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-product-cta], .nether-product-card__cta')
          );
          const actionsBatch = nodes.filter((el) =>
            el.matches?.('[data-nether-product-actions], .nether-product-card__actions')
          );
          const trustBatch = nodes.filter((el) =>
            el.matches?.(
              '[data-nether-product-trust], .nether-product-card__stock, .nether-product-card__savings'
            )
          );
          const rest = nodes.filter(
            (el) =>
              !badgeBatch.includes(el) &&
              !titleBatch.includes(el) &&
              !priceBatch.includes(el) &&
              !ctaBatch.includes(el) &&
              !actionsBatch.includes(el) &&
              !trustBatch.includes(el)
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

          if (priceBatch.length) {
            NM.animate(priceBatch, presets.price || 'commerce-price-change', {
              scope: this,
              scroll: false,
              stagger: 0.04,
              duration: this.config.animationDuration * 0.7,
              id: `${this.motionId}-viewport-batch-prices`,
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

          if (actionsBatch.length) {
            NM.animate(actionsBatch, presets.actions || 'fade-up', {
              scope: this,
              scroll: false,
              stagger: 0.05,
              duration: this.config.animationDuration * 0.75,
              id: `${this.motionId}-viewport-batch-actions`,
            });
          }

          if (trustBatch.length) {
            NM.animate(trustBatch, presets.trust || 'commerce-trust-reveal', {
              scope: this,
              scroll: false,
              stagger: 0.05,
              duration: this.config.animationDuration * 0.8,
              id: `${this.motionId}-viewport-batch-trust`,
            });
          }

          if (rest.length) {
            NM.animate(rest, presets.rating || 'fade-up', {
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

      const focusableLinks = this.querySelectorAll(
        '.nether-product-card__link, .nether-product__dawn-card .card__heading a'
      );

      focusableLinks.forEach((link) => {
        link.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

          const items = Array.from(focusableLinks);
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

  customElements.define('nether-product', NetherProduct);
})();
