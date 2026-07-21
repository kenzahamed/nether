/**
 * Nether Premium Content Framework — Motion integration (Phase 5.3.3)
 * Extends NetherHero (Hero Motion is the Presentation Framework standard).
 * Load component-hero.js before this file.
 *
 * Banner Motion is the implementation reference.
 * All Content motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No Content-only presets unless library gaps exist.
 */

(function () {
  'use strict';

  if (customElements.get('nether-content')) return;

  const NetherHeroClass = customElements.get('nether-hero')?.constructor;
  if (!NetherHeroClass) return;

  const HOST_ID = 'nether-content';
  let hostRegistered = false;

  const CONTENT_PRESETS = [
    'minimal-reveal',
    'fade-up',
    'fade-scale',
    'fade-left',
    'fade-right',
    'luxury-reveal',
    'editorial-reveal',
    'clip-reveal',
    'stagger-features',
    'stagger-stats',
    'stagger-list',
    'stagger-cards',
    'stagger-grid',
    'text-heading-reveal',
    'text-luxury-heading',
    'text-editorial',
    'text-cta-reveal',
    'media-image-reveal',
    'media-video-reveal',
    'media-ken-burns',
    'scroll-parallax',
    'scroll-floating',
    'scroll-section-reveal',
    'scroll-viewport-batch',
    'scroll-timeline-sequence',
    'hover-soft-lift',
    'hover-luxury-lift',
    'hover-lift',
    'hover-media',
    'hover-glass',
    'hover-icon-slide',
  ];

  function ensureContentHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: CONTENT_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Content Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-banner',
      },
    });
    hostRegistered = true;
  }

  class NetherContent extends NetherHeroClass {
    cacheDom() {
      super.cacheDom();

      this.contentShell = this.querySelector('[data-nether-content-shell]');
      this.grid = this.querySelector('[data-nether-content-grid]');
      this.rowItems = this.querySelectorAll('[data-nether-content-row]');

      if (!this.content) {
        this.content = this.contentShell || this.grid || null;
      }

      if (!this.panel) {
        this.panel = this.querySelector('.nether-content__panel, .nether-content__row-card--glass');
      }

      // Include Content + Hero animate hooks so inherited sequencing works.
      this.animateTargets = this.querySelectorAll(
        '[data-nether-hero-animate], [data-nether-content-animate]'
      );
    }

    parseConfig() {
      super.parseConfig();

      const dataset = this.dataset;
      const contentLayoutMatch = [...this.classList].find((c) => c.startsWith('nether-content--layout-'));

      this.config.contentLayout =
        dataset.contentLayout ||
        dataset.netherContentLayout ||
        (contentLayoutMatch ? contentLayoutMatch.replace('nether-content--layout-', '') : 'editorial_story');

      this.config.glassEnabled =
        this.config.glassEnabled ||
        this.classList.contains('nether-content--glass-enabled') ||
        this.classList.contains('nether-hero--glass-enabled');
    }

    isRowLayout() {
      const layout = this.config.contentLayout;
      return (
        layout === 'alternating_story' ||
        layout === 'timeline' ||
        layout === 'multi_column' ||
        layout === 'feature_grid'
      );
    }

    needsScrollPlugins() {
      return (
        this.config.enableParallax ||
        this.config.animationStyle === 'timeline_reveal' ||
        this.isRowLayout() ||
        (this.shapes && this.shapes.length > 0)
      );
    }

    /**
     * Content layout + story/timeline animation styles on top of Hero Motion resolvePresets().
     * Merchant controls remain: section animation style/speed/parallax + global Motion Engine.
     */
    resolvePresets() {
      const presets = super.resolvePresets();
      const contentLayout = this.config.contentLayout;
      const motionStyle = presets.motionStyle;
      const sectionStyle = this.config.animationStyle;

      // Content-only animation styles (preserve existing merchant options)
      if (sectionStyle === 'story_reveal') {
        presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
        presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
        presets.sectionStyle = 'story_reveal';
      }

      if (sectionStyle === 'timeline_reveal') {
        presets.content = 'fade-left';
        presets.sectionStyle = 'timeline_reveal';
      }

      switch (contentLayout) {
        case 'editorial_story':
          presets.content =
            sectionStyle === 'stagger' || sectionStyle === 'story_reveal'
              ? 'stagger-features'
              : motionStyle === 'luxury'
                ? 'luxury-reveal'
                : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          if (!presets.isVideo && motionStyle === 'editorial') {
            presets.media = 'clip-reveal';
          }
          break;

        case 'magazine':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          presets.quote = 'text-editorial';
          break;

        case 'brand_story':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          if (motionStyle === 'editorial' && !presets.isVideo) {
            presets.media = 'clip-reveal';
          }
          break;

        case 'minimal':
          presets.content = 'minimal-reveal';
          presets.overlay = 'minimal-reveal';
          presets.hoverLift = 'hover-soft-lift';
          break;

        case 'image_with_text':
        case 'split_content':
          // Directional split already applied by Hero when hero layout === split.
          break;

        case 'alternating_story':
          presets.content = sectionStyle === 'timeline_reveal' ? 'fade-left' : 'stagger-cards';
          presets.rows = 'stagger-cards';
          break;

        case 'timeline':
          presets.content = 'fade-left';
          presets.rows = 'fade-left';
          break;

        case 'multi_column':
          presets.content = 'stagger-grid';
          presets.rows = 'stagger-grid';
          break;

        case 'feature_grid':
          presets.content = 'stagger-grid';
          presets.rows = 'stagger-grid';
          presets.icons = 'stagger-features';
          break;

        default:
          break;
      }

      // Glass layouts (merchant glass toggle — no redesign)
      if (this.config.glassEnabled) {
        if (motionStyle === 'luxury') {
          presets.content =
            sectionStyle === 'stagger' || sectionStyle === 'story_reveal'
              ? 'stagger-features'
              : 'luxury-reveal';
          presets.hoverPanel = 'hover-luxury-lift';
          presets.hoverLift = 'hover-luxury-lift';
        } else {
          presets.hoverPanel = 'hover-glass';
          presets.hoverLift = 'hover-soft-lift';
        }
      }

      presets.quote = presets.quote || (motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal');
      presets.icons = presets.icons || 'stagger-list';
      presets.rows = presets.rows || presets.content;
      presets.image = presets.image || (presets.isVideo ? 'media-video-reveal' : 'media-image-reveal');
      presets.video = presets.video || 'media-video-reveal';

      return presets;
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureContentHost(NM);
      this.motionId = `${this.dataset.sectionId}-content`;

      NM.registerSection(this.motionId, {
        type: 'content',
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

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureContentHost(NM);

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
        this.initTimelineReveal(presets);
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      this.removeAttribute('data-nether-motion-pending');
      this.dataset.netherMotionReady = 'false';

      this.querySelectorAll(
        '[data-nether-hero-animate], [data-nether-content-animate], [data-nether-hero-overlay], .nether-hero__shape, .nether-hero__media-inner, [data-nether-content-row]'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });
    }

    /**
     * Story reveal: layered editorial stagger with extended timing.
     * Timeline reveal is handled separately via scroll batching.
     */
    runContentAnimations(presets, duration) {
      const deferRowsToScroll =
        presets.sectionStyle === 'timeline_reveal' || this.config.contentLayout === 'timeline';

      if (deferRowsToScroll && this.rowItems?.length) {
        // Per-row scroll sequencing handled in initTimelineReveal to avoid double-animating
        const headerTargets = [...this.animateTargets].filter(
          (el) => !el.hasAttribute('data-nether-content-row')
        );
        if (!headerTargets.length) return;

        let delay = 0.1;
        headerTargets.forEach((el, index) => {
          const role = el.dataset.netherHeroRole || this.inferRole(el);
          this.animate(el, this.presetForRole(role, presets, presets.content), {
            id: `${this.motionId}-header-${index}`,
            duration,
            delay,
          });
          delay += 0.08;
        });
        return;
      }

      if (presets.sectionStyle === 'story_reveal') {
        const targets = [...this.animateTargets];
        if (!targets.length) return;

        this.animate(targets, presets.content || 'editorial-reveal', {
          id: `${this.motionId}-story-reveal`,
          stagger: 0.16,
          duration: duration * 1.2,
          delay: 0.12,
        });
        return;
      }

      // Row layouts with stagger / grid presets — batch rows as a group when style is stagger
      if (
        this.isRowLayout() &&
        this.rowItems?.length &&
        (presets.sectionStyle === 'stagger' ||
          this.config.contentLayout === 'multi_column' ||
          this.config.contentLayout === 'feature_grid')
      ) {
        const headerTargets = [...this.animateTargets].filter(
          (el) => !el.hasAttribute('data-nether-content-row')
        );

        if (headerTargets.length) {
          let delay = 0.1;
          headerTargets.forEach((el, index) => {
            const role = el.dataset.netherHeroRole || this.inferRole(el);
            this.animate(el, this.presetForRole(role, presets, presets.content), {
              id: `${this.motionId}-header-${index}`,
              duration,
              delay,
            });
            delay += 0.08;
          });
        }

        this.animate(this.rowItems, presets.rows || 'stagger-grid', {
          id: `${this.motionId}-rows`,
          stagger: 0.12,
          duration,
          delay: 0.2,
        });
        return;
      }

      super.runContentAnimations(presets, duration);
    }

    /**
     * Editorial / timeline scroll sequencing for row-based Content layouts.
     * Reuses library presets via NetherMotion.animate(..., { scroll: true }).
     */
    initTimelineReveal(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate || !this.rowItems?.length) return;

      const useTimeline =
        presets.sectionStyle === 'timeline_reveal' || this.config.contentLayout === 'timeline';

      if (!useTimeline) return;
      if (typeof ScrollTrigger === 'undefined' && NM.load) {
        NM.load(['scrollTrigger']);
      }

      this.rowItems.forEach((row, index) => {
        const directionPreset =
          this.config.contentLayout === 'alternating_story' && index % 2 === 1
            ? 'fade-right'
            : presets.rows || 'fade-left';

        this.animate(row, directionPreset, {
          id: `${this.motionId}-timeline-row-${index}`,
          duration: this.config.animationDuration,
          scroll: true,
          trigger: row,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        });
      });
    }

    presetForRole(role, presets, baseContent) {
      if (role === 'quote') return presets.quote || 'editorial-reveal';
      if (role === 'icons') return presets.icons || 'stagger-list';
      if (role === 'row') return presets.rows || baseContent;
      if (role === 'image') return presets.image || 'media-image-reveal';
      if (role === 'video') return presets.video || 'media-video-reveal';
      if (role === 'divider') return 'minimal-reveal';
      return super.presetForRole(role, presets, baseContent);
    }

    inferRole(el) {
      if (el.hasAttribute('data-nether-content-row') || el.classList.contains('nether-content__row')) {
        return 'row';
      }
      if (el.classList.contains('nether-content__quote')) return 'quote';
      if (el.classList.contains('nether-content__icon-list')) return 'icons';
      if (el.classList.contains('nether-content__image-block')) return 'image';
      if (el.classList.contains('nether-content__video-block')) return 'video';
      if (el.classList.contains('nether-content__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-content__heading')) return 'heading';
      if (el.classList.contains('nether-content__subheading')) return 'subheading';
      if (el.classList.contains('nether-content__text')) return 'text';
      if (el.classList.contains('nether-content__buttons')) return 'buttons';
      if (el.classList.contains('nether-content__card-slot')) return 'card';
      if (el.classList.contains('nether-content__app-block')) return 'app';
      if (el.classList.contains('nether-content__block-divider')) return 'divider';
      if (el.classList.contains('nether-content__custom-html')) return 'content';
      return super.inferRole(el);
    }

    getChildGroup(el, role, presets) {
      if (role === 'icons') {
        const nodes = el.querySelectorAll('.nether-content__icon-list-item');
        if (nodes.length) {
          return { nodes, preset: presets.icons || 'stagger-list', stagger: 0.07 };
        }
      }

      if (role === 'stats') {
        const nodes = el.querySelectorAll('.nether-hero__stat, .nether-content__stat');
        if (nodes.length) {
          return { nodes, preset: presets.stats, stagger: 0.1 };
        }
      }

      if (role === 'features') {
        const nodes = el.querySelectorAll('.nether-hero__feature, .nether-content__feature');
        if (nodes.length) {
          return { nodes, preset: presets.features, stagger: 0.1 };
        }
      }

      return super.getChildGroup(el, role, presets);
    }

    /**
     * Soft editorial parallax for magazine / brand story when media parallax is off.
     */
    initScrollLayers(presets) {
      super.initScrollLayers(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.parallax || !this.content) return;
      if (this.config.enableParallax) return;

      // Hero already parallaxes content for luxury style or editorial hero layout
      if (presets.motionStyle === 'luxury' || this.config.layout === 'editorial') return;

      const layout = this.config.contentLayout;
      if (layout !== 'brand_story' && layout !== 'magazine') return;

      NM.scroll.parallax(this.content, {
        speed: 0.1,
        trigger: this,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        scope: this,
        id: `${this.motionId}-content-parallax`,
      });
    }

    /**
     * Subtle premium hover — Content buttons, cards, glass panel, icons, media.
     * Reuses library hover presets only.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll(
        '.nether-content__buttons .button, .nether-content__buttons a.button, .nether-hero__buttons .button, .nether-hero__buttons a.button'
      );
      if (buttons.length) {
        NM.hover(buttons, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-buttons`,
        });
      }

      const cards = this.querySelectorAll(
        '.nether-content__card-slot .nether-card, .nether-content__card-slot, .nether-hero__card-slot .nether-card, .nether-hero__card-slot'
      );
      if (cards.length) {
        NM.hover(cards, presets.hoverCard, {
          scope: this,
          id: `${this.motionId}-hover-cards`,
        });
      }

      if (presets.hoverPanel && this.panel) {
        NM.hover(this.panel, presets.hoverPanel, {
          scope: this,
          id: `${this.motionId}-hover-panel`,
          focus: false,
        });
      }

      const iconItems = this.querySelectorAll('.nether-content__icon-list-item');
      if (iconItems.length) {
        NM.hover(iconItems, 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-icons`,
        });
      }

      const rowCards = this.querySelectorAll('.nether-content__row-card');
      if (rowCards.length) {
        NM.hover(rowCards, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-rows`,
          focus: false,
        });
      }

      // Subtle media hover on split layouts — skip when parallax owns transform
      if (
        this.mediaInner &&
        !this.config.enableParallax &&
        (this.config.layout === 'split' ||
          this.config.contentLayout === 'image_with_text' ||
          this.config.contentLayout === 'split_content')
      ) {
        NM.hover(this.mediaInner, presets.hoverMedia, {
          scope: this,
          id: `${this.motionId}-hover-media`,
          focus: false,
        });
      }
    }

    /**
     * Viewport batch secondary Content groups for tall sections.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      // Skip when timeline_reveal already scroll-sequences each row
      if (presets.sectionStyle === 'timeline_reveal' || this.config.contentLayout === 'timeline') {
        return;
      }

      const secondary = this.querySelectorAll(
        '.nether-content__quote, .nether-content__icon-list, .nether-content__card-slot, .nether-hero__stats, .nether-hero__features, [data-nether-content-row]'
      );
      if (secondary.length < 2) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          NM.animate(batch, presets.content, {
            scope: this,
            scroll: false,
            stagger: 0.12,
            duration: this.config.animationDuration,
            id: `${this.motionId}-viewport-batch`,
          });
        },
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
      this.initBackgroundVideo();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-content', NetherContent);
})();
