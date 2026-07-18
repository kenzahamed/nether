/**
 * Nether Premium Hero Framework — Motion integration (Phase 5.1)
 * Extends Dawn banner patterns — does not replace image-banner or slideshow.
 *
 * All motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines outside NetherMotion APIs.
 */

(function () {
  'use strict';

  const HOST_ID = 'nether-hero';
  let hostRegistered = false;

  function ensureHeroHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: [
        'minimal-reveal',
        'fade-up',
        'fade-scale',
        'luxury-reveal',
        'editorial-reveal',
        'stagger-features',
        'stagger-stats',
        'stagger-logos',
        'stagger-cards',
        'stagger-list',
        'text-heading-reveal',
        'text-luxury-heading',
        'text-cta-reveal',
        'media-image-reveal',
        'media-video-reveal',
        'media-ken-burns',
        'commerce-trust-reveal',
        'commerce-badge-reveal',
        'scroll-parallax',
        'scroll-floating',
        'scroll-cue',
        'scroll-layered-parallax',
        'hover-soft-lift',
        'hover-luxury-lift',
        'hover-media',
        'hover-glass',
        'fade-left',
        'fade-right',
        'clip-reveal',
      ],
      meta: {
        framework: 'presentation',
        name: 'Nether Hero Motion',
        version: '1.0.0',
      },
    });
    hostRegistered = true;
  }

  class NetherHero extends HTMLElement {
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
      this.initBackgroundVideo();

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.killMotionTweens();
    }

    cacheDom() {
      this.media = this.querySelector('[data-nether-hero-media]');
      this.mediaInner = this.media?.querySelector('.nether-hero__media-inner') || null;
      this.content = this.querySelector('[data-nether-hero-content]');
      this.panel = this.querySelector('[data-nether-hero-panel]');
      this.overlay = this.querySelector('[data-nether-hero-overlay]');
      this.decor = this.querySelector('[data-nether-hero-decor]');
      this.shapes = this.querySelectorAll('.nether-hero__shape');
      this.animateTargets = this.querySelectorAll('[data-nether-hero-animate]');
      this.scrollIndicator = this.querySelector('[data-nether-hero-scroll]');
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-hero--layout-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'fade',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        enableScrollIndicator: dataset.enableScrollIndicator === 'true',
        layout: dataset.netherHeroLayout || (layoutMatch ? layoutMatch.replace('nether-hero--layout-', '') : 'classic'),
        mediaType: this.media?.dataset.netherHeroMediaType || dataset.mediaType || 'image',
        glassEnabled: this.classList.contains('nether-hero--glass-enabled'),
        splitMediaRight: this.classList.contains('nether-hero--split-media-right'),
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

    /**
     * Map section animation style + global Motion Style + layout → library presets.
     * Global Theme Editor settings remain the merchant control surface.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.layout;
      const isVideo =
        this.config.mediaType === 'video' || this.config.mediaType === 'background_video';

      let content = 'fade-up';
      let heading = 'text-heading-reveal';
      let media = isVideo ? 'media-video-reveal' : 'media-image-reveal';
      let buttons = 'text-cta-reveal';
      let trust = 'commerce-trust-reveal';
      let stats = 'stagger-stats';
      let features = 'stagger-features';
      let cards = 'stagger-cards';
      let badges = 'commerce-badge-reveal';
      let overlay = 'minimal-reveal';
      let decor = 'fade-scale';
      let hoverLift = 'hover-soft-lift';
      let hoverCard = 'hover-lift';
      let hoverMedia = 'hover-media';
      let hoverPanel = null;
      let splitContent = null;
      let splitMedia = null;

      switch (sectionStyle) {
        case 'fade':
          content = 'minimal-reveal';
          break;
        case 'slide':
          content = 'fade-up';
          break;
        case 'scale':
          content = 'fade-scale';
          break;
        case 'stagger':
          content = 'stagger-features';
          break;
        default:
          content = 'fade-up';
      }

      switch (motionStyle) {
        case 'luxury':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          heading = 'text-luxury-heading';
          media = isVideo ? 'media-video-reveal' : 'media-image-reveal';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
          buttons = 'text-cta-reveal';
          break;
        case 'editorial':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'editorial-reveal';
          heading = 'text-heading-reveal';
          if (!isVideo) media = 'clip-reveal';
          hoverLift = 'hover-soft-lift';
          break;
        case 'minimal':
          if (sectionStyle === 'fade') content = 'minimal-reveal';
          hoverLift = 'hover-soft-lift';
          break;
        default:
          break;
      }

      switch (layout) {
        case 'minimal':
          content = 'minimal-reveal';
          overlay = 'minimal-reveal';
          break;
        case 'editorial':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          break;
        case 'split':
          splitContent = this.config.splitMediaRight ? 'fade-right' : 'fade-left';
          splitMedia = this.config.splitMediaRight ? 'fade-left' : 'fade-right';
          break;
        case 'card':
          cards = 'stagger-cards';
          hoverCard = hoverLift;
          break;
        case 'overlay':
        case 'fullscreen':
        case 'classic':
        case 'centered':
        default:
          break;
      }

      if (this.config.glassEnabled && motionStyle === 'luxury') {
        content = 'luxury-reveal';
      }

      if (this.config.glassEnabled) {
        hoverPanel = hoverLift;
      }

      return {
        motionStyle,
        sectionStyle,
        content,
        heading,
        media,
        buttons,
        trust,
        stats,
        features,
        cards,
        badges,
        overlay,
        decor,
        hoverLift,
        hoverCard,
        hoverMedia,
        hoverPanel,
        splitContent,
        splitMedia,
        isVideo,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureHeroHost(NM);
      this.motionId = `${this.dataset.sectionId}-hero`;

      NM.registerSection(this.motionId, {
        type: 'hero',
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

    /**
     * Legacy cleanup API — kept for Presentation Framework subclasses
     * (CTA, Newsletter, etc.) that still call killMotionTweens / local tween refs.
     */
    killMotionTweens() {
      this.revealTween?.scrollTrigger?.kill?.();
      this.revealTween?.kill?.();
      this.staggerTween?.kill?.();
      this.scrollTween?.kill?.();
      this.parallaxTween?.scrollTrigger?.kill?.();
      this.parallaxTween?.kill?.();
      this.revealTween = null;
      this.staggerTween = null;
      this.scrollTween = null;
      this.parallaxTween = null;
      this.destroyMotion();
    }

    /**
     * Legacy from-props helper for subclasses that still run raw GSAP reveal.
     */
    getRevealFromProps() {
      switch (this.config.animationStyle) {
        case 'slide':
          return { opacity: 0, y: 40 };
        case 'scale':
          return { opacity: 0, scale: 0.96 };
        case 'stagger':
          return { opacity: 0, y: 24 };
        case 'fade':
        default:
          return { opacity: 0, y: 16 };
      }
    }

    /**
     * Legacy reveal entry — used when CTA/Newsletter fall back to super.runRevealAnimation().
     * Routes through NetherMotion presets rather than raw GSAP.
     */
    runRevealAnimation() {
      if (!this.motionReady) return;
      const presets = this.resolvePresets();
      this.runContentAnimations(presets, this.config.animationDuration);
    }

    /**
     * Legacy parallax entry — kept for subclass initMotionEngine overrides.
     */
    initParallax() {
      if (!this.motionReady || !this.config.enableParallax || !this.media) return;
      if (!window.NetherMotion?.scroll?.parallax) return;

      window.NetherMotion.scroll.parallax(this.media, {
        speed: 0.35,
        trigger: this,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        scope: this,
        id: `${this.motionId || this.dataset.sectionId || 'hero'}-parallax`,
      });
    }

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureHeroHost(NM);

      if (this.prefersReducedMotion() || !NM?.whenReady || NM.isEnabled?.() === false) {
        this.setReducedMotionState();
        return;
      }

      this.dataset.netherMotionPending = 'true';

      const plugins = this.config.enableParallax || this.shapes.length ? ['scrollTrigger'] : [];

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
        this.initScrollIndicatorAnimation();
        this.initHoverInteractions(presets);
        this.initViewportBatch(presets);
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      this.removeAttribute('data-nether-motion-pending');
      this.dataset.netherMotionReady = 'false';

      this.querySelectorAll(
        '[data-nether-hero-animate], [data-nether-hero-overlay], .nether-hero__shape, .nether-hero__media-inner'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
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

    runEntranceSequence(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const duration = this.config.animationDuration;

      // Timeline sequencing — layers composed via NetherMotion.timelines.batch
      if (NM.timelines?.batch) {
        NM.timelines.batch(
          [
            (master) => {
              const mediaTarget = this.mediaInner || this.media;
              if (!mediaTarget) return master;
              const mediaPreset =
                this.config.layout === 'split' && presets.splitMedia
                  ? presets.splitMedia
                  : presets.media;
              const tween = this.animate(mediaTarget, mediaPreset, {
                id: `${this.motionId}-media`,
                duration: duration * 1.15,
              });
              if (tween && master?.add) master.add(tween, 0);
              return master;
            },
            (master) => {
              if (!this.overlay) return master;
              const tween = this.animate(this.overlay, presets.overlay, {
                id: `${this.motionId}-overlay`,
                duration: duration * 0.9,
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
      } else {
        const mediaTarget = this.mediaInner || this.media;
        if (mediaTarget) {
          const mediaPreset =
            this.config.layout === 'split' && presets.splitMedia ? presets.splitMedia : presets.media;
          this.animate(mediaTarget, mediaPreset, {
            id: `${this.motionId}-media`,
            duration: duration * 1.15,
          });
        }
        if (this.overlay) {
          this.animate(this.overlay, presets.overlay, {
            id: `${this.motionId}-overlay`,
            duration: duration * 0.9,
            delay: 0.05,
          });
        }
      }

      // Decorative shapes — soft scale-in (preserve design opacity), then ambient float
      if (this.shapes?.length) {
        this.animate(this.shapes, 'fade-scale', {
          id: `${this.motionId}-decor`,
          stagger: 0.1,
          duration,
          delay: 0.08,
          preset: {
            from: { opacity: 0, scale: 0.9 },
            to: { opacity: 0.12, scale: 1 },
            cleanup: { clearProps: 'transform' },
          },
        });

        this.shapes.forEach((shape, index) => {
          NM.animate(shape, 'scroll-floating', {
            scope: this,
            scroll: false,
            duration: 3.5 + index * 0.6,
            delay: 0.4 + index * 0.2,
            id: `${this.motionId}-decor-float-${index}`,
            preset: {
              from: { y: -6 - index * 2 },
              to: { y: 6 + index * 2 },
            },
          });
        });
      }

      // Panel hover target is cached; content blocks drive entrance (avoids nested opacity)
      // Glass / card atmosphere is handled via layout CSS + hover presets.

      // Content blocks — typed sequencing
      this.runContentAnimations(presets, duration);

      // Luxury Ken Burns when parallax is off and media is still imagery
      const mediaTarget = this.mediaInner || this.media;
      if (
        presets.motionStyle === 'luxury' &&
        !this.config.enableParallax &&
        !presets.isVideo &&
        mediaTarget
      ) {
        NM.animate(mediaTarget, 'media-ken-burns', {
          scope: this,
          scroll: false,
          id: `${this.motionId}-kenburns`,
          delay: duration,
        });
      }
    }

    runContentAnimations(presets, duration) {
      const targets = [...this.animateTargets];
      if (!targets.length) return;

      const useStagger = presets.sectionStyle === 'stagger';
      const baseContent =
        this.config.layout === 'split' && presets.splitContent
          ? presets.splitContent
          : presets.content;

      if (useStagger) {
        this.animate(targets, 'stagger-features', {
          id: `${this.motionId}-content-stagger`,
          stagger: 0.12,
          duration,
          delay: 0.15,
        });
        return;
      }

      let delay = 0.12;

      targets.forEach((el, index) => {
        const role = el.dataset.netherHeroRole || this.inferRole(el);
        const childPreset = this.getChildGroup(el, role, presets);

        if (childPreset) {
          this.animate(childPreset.nodes, childPreset.preset, {
            id: `${this.motionId}-block-${index}`,
            stagger: childPreset.stagger,
            duration,
            delay,
          });
        } else {
          this.animate(el, this.presetForRole(role, presets, baseContent), {
            id: `${this.motionId}-block-${index}`,
            duration,
            delay,
          });
        }

        delay += 0.08;
      });
    }

    getChildGroup(el, role, presets) {
      if (role === 'trust') {
        const nodes = el.querySelectorAll('.nether-hero__trust-item');
        if (nodes.length) {
          return { nodes, preset: presets.trust, stagger: 0.06 };
        }
      }
      if (role === 'stats') {
        const nodes = el.querySelectorAll('.nether-hero__stat');
        if (nodes.length) {
          return { nodes, preset: presets.stats, stagger: 0.1 };
        }
      }
      if (role === 'features') {
        const nodes = el.querySelectorAll('.nether-hero__feature');
        if (nodes.length) {
          return { nodes, preset: presets.features, stagger: 0.1 };
        }
      }
      return null;
    }

    presetForRole(role, presets, baseContent) {
      switch (role) {
        case 'eyebrow':
          return presets.motionStyle === 'minimal' ? 'minimal-reveal' : 'fade-up';
        case 'heading':
          return presets.heading;
        case 'buttons':
          return presets.buttons;
        case 'card':
          return presets.cards;
        case 'trust':
          return presets.trust;
        case 'stats':
          return presets.stats;
        case 'features':
          return presets.features;
        default:
          return baseContent;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-hero__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-hero__heading')) return 'heading';
      if (el.classList.contains('nether-hero__subheading')) return 'subheading';
      if (el.classList.contains('nether-hero__text')) return 'text';
      if (el.classList.contains('nether-hero__buttons')) return 'buttons';
      if (el.classList.contains('nether-hero__trust')) return 'trust';
      if (el.classList.contains('nether-hero__stats')) return 'stats';
      if (el.classList.contains('nether-hero__features')) return 'features';
      if (el.classList.contains('nether-hero__card-slot')) return 'card';
      if (el.classList.contains('nether-hero__app-block')) return 'app';
      return 'content';
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      // Media parallax (merchant toggle)
      if (this.config.enableParallax && this.media) {
        NM.scroll.parallax(this.media, {
          speed: presets.motionStyle === 'luxury' ? 0.45 : 0.35,
          trigger: this,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-parallax`,
        });
      }

      // Layered decorative parallax (scroll-layered-parallax speeds)
      if (this.shapes?.length && NM.scroll.parallax) {
        const speeds = [0.2, 0.4, 0.65];
        this.shapes.forEach((shape, index) => {
          NM.scroll.parallax(shape, {
            speed: speeds[index] || 0.3,
            trigger: this,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scope: this,
            id: `${this.motionId}-shape-parallax-${index}`,
          });
        });
      }

      // Content soft parallax on editorial / luxury (subtle, GPU-friendly)
      if (
        this.content &&
        (presets.motionStyle === 'luxury' || this.config.layout === 'editorial') &&
        !this.config.enableParallax
      ) {
        NM.scroll.parallax(this.content, {
          speed: 0.12,
          trigger: this,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-content-parallax`,
        });
      }
    }

    initScrollIndicatorAnimation() {
      if (!this.motionReady || !this.scrollIndicator || !this.config.enableScrollIndicator) return;
      if (!window.NetherMotion?.animate) return;

      const icon = this.scrollIndicator.querySelector('[data-nether-hero-scroll-icon]');
      if (!icon) return;

      window.NetherMotion.animate(icon, 'scroll-cue', {
        scope: this,
        scroll: false,
        id: `${this.motionId}-scroll-cue`,
      });

      // Soft fade-in of the indicator after entrance
      window.NetherMotion.animate(this.scrollIndicator, 'minimal-reveal', {
        scope: this,
        scroll: false,
        duration: 0.6,
        delay: 0.6,
        id: `${this.motionId}-scroll-fade`,
      });
    }

    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll('.nether-hero__buttons .button, .nether-hero__buttons a.button');
      if (buttons.length) {
        NM.hover(buttons, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-buttons`,
        });
      }

      const cards = this.querySelectorAll('.nether-hero__card-slot .nether-card, .nether-hero__card-slot');
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

      // Subtle media hover on split / card layouts (avoid fighting parallax)
      if (
        this.mediaInner &&
        !this.config.enableParallax &&
        (this.config.layout === 'split' || this.config.layout === 'card')
      ) {
        NM.hover(this.mediaInner, presets.hoverMedia, {
          scope: this,
          id: `${this.motionId}-hover-media`,
          focus: false,
        });
      }
    }

    /**
     * Viewport batch secondary groups for tall heroes — ScrollTrigger.batch.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '.nether-hero__trust, .nether-hero__stats, .nether-hero__features, .nether-hero__card-slot'
      );
      if (secondary.length < 2) return;

      // Only batch when hero min-height suggests below-fold content risk
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

    initBackgroundVideo() {
      const wrapper = this.querySelector('[data-nether-hero-bg-video]');
      const video = wrapper?.querySelector('video') || this.querySelector('[data-nether-hero-bg-video]');
      if (!video || video.tagName !== 'VIDEO') return;

      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }

    handleSectionLoad(event) {
      if (event.detail?.sectionId !== this.dataset.sectionId) return;

      this.parseConfig();
      this.killMotionTweens();
      this.cacheDom();
      this.initBackgroundVideo();
      this.initMotionEngine();
    }
  }

  if (!customElements.get('nether-hero')) {
    customElements.define('nether-hero', NetherHero);
  }
})();
