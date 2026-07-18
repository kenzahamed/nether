/**
 * Nether Premium CTA & Conversion Framework — Motion integration (Phase 5.3.8)
 * Extends NetherHero (Hero Motion is the Presentation Framework standard).
 * Load component-hero.js before this file.
 *
 * Hero Motion is the architectural reference.
 * Banner Motion is the primary implementation reference (Hero subclass).
 * Newsletter / Content / Media Motion inform mid-page scroll reveals + CTA emphasis.
 *
 * All CTA motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No CTA-only presets unless library gaps exist.
 * Conversion CTA behavior, analytics, and merchant settings preserved.
 */

(function () {
  'use strict';

  if (customElements.get('nether-cta')) return;

  const NetherHeroClass = customElements.get('nether-hero')?.constructor;
  if (!NetherHeroClass) return;

  const HOST_ID = 'nether-cta';
  let hostRegistered = false;

  const CTA_PRESETS = [
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
    'scroll-section-reveal',
    'scroll-viewport-batch',
    'hover-soft-lift',
    'hover-luxury-lift',
    'hover-lift',
    'hover-media',
    'hover-glass',
  ];

  function ensureCtaHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: CTA_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether CTA Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-banner',
      },
    });
    hostRegistered = true;
  }

  class NetherCta extends NetherHeroClass {
    connectedCallback() {
      super.connectedCallback();
      this.initAnalyticsHooks();
    }

    cacheDom() {
      super.cacheDom();

      // CTA blocks use framework-specific attrs; merge with Hero attrs.
      this.animateTargets = this.querySelectorAll(
        '[data-nether-hero-animate], [data-nether-cta-animate]'
      );

      this.overlay =
        this.querySelector('[data-nether-hero-overlay], .nether-hero__overlay, [data-nether-cta-overlay]') ||
        this.overlay;

      this.panel =
        this.querySelector('[data-nether-hero-panel], .nether-cta__panel--floating, .nether-hero__panel') ||
        this.panel;

      this.content =
        this.querySelector('[data-nether-hero-content], [data-nether-cta-content], .nether-cta__body') ||
        this.content;

      this.buttonTargets = this.querySelectorAll('[data-nether-cta-button-animate]');
      this.cardTargets = this.querySelectorAll(
        '[data-nether-cta-card], .nether-cta__promotion-card, .nether-cta__aside'
      );
      this.dividers = this.querySelectorAll(
        '[data-nether-cta-divider], .nether-cta__divider, .nether-cta__block-divider'
      );
      this.countdown = this.querySelector('[data-nether-cta-countdown]');
      this.ctaButtons = this.querySelectorAll(
        '.nether-cta__button-block .button, .nether-cta__buttons .button, .nether-cta__button, [data-nether-cta-button-animate] .button'
      );
    }

    parseConfig() {
      super.parseConfig();

      const dataset = this.dataset;
      const ctaLayoutMatch = [...this.classList].find((c) => c.startsWith('nether-cta--layout-'));

      this.config.ctaLayout =
        dataset.ctaLayout ||
        dataset.netherCtaLayout ||
        (ctaLayoutMatch ? ctaLayoutMatch.replace('nether-cta--layout-', '') : 'centered_cta');
      this.config.buttonReveal = dataset.buttonReveal !== 'false';
      this.config.cardReveal = dataset.cardReveal !== 'false';
      this.config.hoverReveal = dataset.hoverReveal === 'true';
      this.config.analyticsEnabled = dataset.netherCtaAnalytics === 'true';
      this.config.floatingEnabled =
        this.classList.contains('nether-cta--floating-enabled') || dataset.floatingEnabled === 'true';
    }

    /**
     * CTA layout mapping on top of Hero Motion resolvePresets().
     * Merchant controls remain: section animation style/speed/parallax/button/card/hover + global Motion.
     * Tone: clear conversion emphasis — confident, never flashy.
     */
    resolvePresets() {
      const presets = super.resolvePresets();
      const layout = this.config.ctaLayout;
      const motionStyle = presets.motionStyle;

      // CTA buttons always emphasize conversion reveal.
      presets.buttons = 'text-cta-reveal';
      presets.cards = 'stagger-cards';
      presets.hoverLift = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-soft-lift';
      presets.hoverCard = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-lift';

      switch (layout) {
        case 'editorial_cta':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          if (!presets.isVideo && motionStyle !== 'luxury') {
            presets.media = 'clip-reveal';
          }
          break;

        case 'centered_cta':
          presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : presets.content;
          break;

        case 'split_cta':
        case 'image_cta':
          // Hero split directional presets already applied via config.layout === 'split'.
          break;

        case 'background_image_cta':
        case 'background_video_cta':
          presets.overlay = 'minimal-reveal';
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'fade-scale';
          presets.buttons = 'text-cta-reveal';
          break;

        case 'product_promotion_cta':
        case 'collection_promotion_cta':
          presets.cards = 'stagger-cards';
          presets.hoverCard = presets.hoverLift;
          break;

        case 'minimal_cta':
          presets.content = 'minimal-reveal';
          presets.overlay = 'minimal-reveal';
          presets.hoverLift = 'hover-soft-lift';
          break;

        case 'luxury_cta':
          if (motionStyle === 'luxury' || motionStyle === 'minimal') {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
            presets.heading = 'text-luxury-heading';
            presets.hoverPanel = 'hover-luxury-lift';
            presets.hoverLift = 'hover-luxury-lift';
            presets.hoverCard = 'hover-luxury-lift';
          } else {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'fade-scale';
            presets.hoverPanel = 'hover-glass';
          }
          presets.buttons = 'text-cta-reveal';
          break;

        default:
          break;
      }

      if (this.config.floatingEnabled && !presets.hoverPanel) {
        presets.hoverPanel = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-soft-lift';
      }

      if (this.config.glassEnabled && !presets.hoverPanel) {
        presets.hoverPanel = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-glass';
      }

      return presets;
    }

    needsScrollPlugins() {
      return (
        this.config.enableParallax ||
        this.config.buttonReveal ||
        this.config.cardReveal ||
        (this.shapes && this.shapes.length > 0) ||
        (this.dividers && this.dividers.length > 0) ||
        this.config.ctaLayout === 'editorial_cta' ||
        this.config.ctaLayout === 'split_cta' ||
        this.config.ctaLayout === 'image_cta' ||
        this.config.ctaLayout === 'background_image_cta' ||
        this.config.ctaLayout === 'background_video_cta' ||
        this.config.ctaLayout === 'product_promotion_cta' ||
        this.config.ctaLayout === 'collection_promotion_cta' ||
        this.config.ctaLayout === 'luxury_cta' ||
        ['stagger', 'slide', 'scale', 'fade'].includes(this.config.animationStyle)
      );
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureCtaHost(NM);
      this.motionId = `${this.dataset.sectionId}-cta`;

      NM.registerSection(this.motionId, {
        type: 'cta',
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
      ensureCtaHost(NM);

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
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      super.setReducedMotionState();

      this.querySelectorAll(
        '[data-nether-cta-animate], [data-nether-cta-button-animate], [data-nether-cta-card], [data-nether-cta-divider], .nether-cta__promotion-card, .nether-cta__aside'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });
    }

    /**
     * Section reveal + content roles + button / card layer sequencing.
     * Mid-page CTAs use scroll reveals for conversion clarity without distraction.
     */
    runEntranceSequence(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const duration = this.config.animationDuration;
      const trigger = this;
      const start = 'top 85%';

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
                scroll: true,
                trigger,
                start,
              });
              if (tween && master?.add) master.add(tween, 0);
              return master;
            },
            (master) => {
              if (!this.overlay) return master;
              const tween = this.animate(this.overlay, presets.overlay, {
                id: `${this.motionId}-overlay`,
                duration: duration * 0.9,
                scroll: true,
                trigger,
                start,
              });
              if (tween && master?.add) master.add(tween, 0.05);
              return master;
            },
            (master) => {
              if (!this.dividers?.length) return master;
              const tween = this.animate(this.dividers, 'minimal-reveal', {
                id: `${this.motionId}-dividers`,
                stagger: 0.06,
                duration: duration * 0.75,
                scroll: true,
                trigger,
                start,
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
      } else {
        const mediaTarget = this.mediaInner || this.media;
        if (mediaTarget) {
          const mediaPreset =
            this.config.layout === 'split' && presets.splitMedia ? presets.splitMedia : presets.media;
          this.animate(mediaTarget, mediaPreset, {
            id: `${this.motionId}-media`,
            duration: duration * 1.15,
            scroll: true,
            trigger,
            start,
          });
        }
        if (this.overlay) {
          this.animate(this.overlay, presets.overlay, {
            id: `${this.motionId}-overlay`,
            duration: duration * 0.9,
            delay: 0.05,
            scroll: true,
            trigger,
            start,
          });
        }
        if (this.dividers?.length) {
          this.animate(this.dividers, 'minimal-reveal', {
            id: `${this.motionId}-dividers`,
            stagger: 0.06,
            duration: duration * 0.75,
            scroll: true,
            trigger,
            start,
          });
        }
      }

      if (this.shapes?.length) {
        this.animate(this.shapes, 'fade-scale', {
          id: `${this.motionId}-decor`,
          stagger: 0.1,
          duration,
          delay: 0.08,
          scroll: true,
          trigger,
          start,
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

      this.runContentAnimations(presets, duration);
      this.runButtonReveal(presets, duration);
      this.runCardReveal(presets, duration);

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
      const buttonSet = new Set(this.buttonTargets || []);
      const cardSet = new Set(this.cardTargets || []);

      const targets = [...this.animateTargets].filter((el) => {
        // When button reveal is on, CTA buttons are sequenced separately.
        if (this.config.buttonReveal && buttonSet.has(el)) return false;
        // When card reveal is on, cards / asides are sequenced separately.
        if (this.config.cardReveal && cardSet.has(el)) return false;
        if (el.hasAttribute('data-nether-cta-divider') && this.dividers?.length) return false;
        return true;
      });

      if (!targets.length) return;

      const useStagger = presets.sectionStyle === 'stagger';
      const baseContent =
        this.config.layout === 'split' && presets.splitContent
          ? presets.splitContent
          : presets.content;
      const trigger = this.content || this;
      const start = 'top 88%';

      if (useStagger) {
        this.animate(targets, 'stagger-features', {
          id: `${this.motionId}-content-stagger`,
          stagger: 0.1,
          duration,
          delay: 0.12,
          scroll: true,
          trigger,
          start,
        });
        return;
      }

      let delay = 0.12;

      targets.forEach((el, index) => {
        const role = el.dataset.netherCtaRole || el.dataset.netherHeroRole || this.inferRole(el);
        const childPreset = this.getChildGroup(el, role, presets);

        if (childPreset) {
          this.animate(childPreset.nodes, childPreset.preset, {
            id: `${this.motionId}-block-${index}`,
            stagger: childPreset.stagger,
            duration,
            delay,
            scroll: true,
            trigger,
            start,
          });
        } else {
          this.animate(el, this.presetForRole(role, presets, baseContent), {
            id: `${this.motionId}-block-${index}`,
            duration,
            delay,
            scroll: true,
            trigger,
            start,
          });
        }

        delay += 0.08;
      });
    }

    /**
     * Button group / CTA button reveal — merchant `Enable button reveal` toggle.
     * Uses library `text-cta-reveal` for conversion emphasis.
     */
    runButtonReveal(presets, duration) {
      if (!this.config.buttonReveal || !this.buttonTargets?.length) return;

      this.animate(this.buttonTargets, presets.buttons || 'text-cta-reveal', {
        id: `${this.motionId}-buttons`,
        stagger: 0.08,
        duration: duration * 0.9,
        delay: duration * 0.12,
        scroll: true,
        trigger: this.buttonTargets[0] || this.content || this,
        start: 'top 82%',
      });
    }

    /**
     * Promotion / product / collection card reveal — merchant `Enable card reveal` toggle.
     */
    runCardReveal(presets, duration) {
      if (!this.config.cardReveal || !this.cardTargets?.length) return;

      this.animate(this.cardTargets, presets.cards || 'stagger-cards', {
        id: `${this.motionId}-cards`,
        stagger: 0.1,
        duration: duration * 1.1,
        delay: duration * 0.08,
        scroll: true,
        trigger: this.cardTargets[0] || this,
        start: 'top 80%',
      });
    }

    presetForRole(role, presets, baseContent) {
      if (role === 'buttons' || role === 'cta-button') return presets.buttons || 'text-cta-reveal';
      if (role === 'card' || role === 'aside') return presets.cards || 'stagger-cards';
      if (role === 'countdown') return presets.badges || 'commerce-badge-reveal';
      if (role === 'divider') return 'minimal-reveal';
      if (role === 'badge' || role === 'icon') return presets.badges || 'commerce-badge-reveal';
      return super.presetForRole(role, presets, baseContent);
    }

    inferRole(el) {
      if (
        el.hasAttribute('data-nether-cta-button-animate') ||
        el.classList.contains('nether-cta__buttons') ||
        el.classList.contains('nether-cta__button-block')
      ) {
        return 'buttons';
      }
      if (
        el.hasAttribute('data-nether-cta-card') ||
        el.classList.contains('nether-cta__promotion-card') ||
        el.classList.contains('nether-cta__aside') ||
        el.classList.contains('nether-cta__product-promotion') ||
        el.classList.contains('nether-cta__collection-promotion')
      ) {
        return 'card';
      }
      if (
        el.hasAttribute('data-nether-cta-countdown') ||
        el.classList.contains('nether-cta__countdown')
      ) {
        return 'countdown';
      }
      if (
        el.hasAttribute('data-nether-cta-divider') ||
        el.classList.contains('nether-cta__block-divider') ||
        el.classList.contains('nether-cta__divider')
      ) {
        return 'divider';
      }
      if (el.classList.contains('nether-cta__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-cta__heading')) return 'heading';
      if (el.classList.contains('nether-cta__subheading')) return 'subheading';
      if (el.classList.contains('nether-cta__text')) return 'text';
      if (el.classList.contains('nether-cta__app-block')) return 'app';
      return super.inferRole(el);
    }

    /**
     * Hover: reuse library presets — CTA buttons, cards, trust, panel, optional media.
     * Established CTA button hover = hover-soft-lift / hover-luxury-lift (no flashy fills).
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      // Hero baseline (hero button/card selectors may be empty on CTA layouts).
      super.initHoverInteractions(presets);

      if (this.ctaButtons?.length) {
        NM.hover(this.ctaButtons, presets.hoverLift || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-cta-buttons`,
        });
      }

      // Merchant toggle — subtle trust / card lift (replaces prior raw GSAP hover).
      if (this.config.hoverReveal) {
        const trustItems = this.querySelectorAll('.nether-hero__trust-item');
        if (trustItems.length) {
          NM.hover(trustItems, presets.hoverLift || 'hover-soft-lift', {
            scope: this,
            id: `${this.motionId}-hover-trust`,
            focus: false,
          });
        }

        const cards = this.querySelectorAll(
          '[data-nether-cta-card] .card, .nether-cta__promotion-card .card, .nether-cta__aside .card'
        );
        if (cards.length) {
          NM.hover(cards, presets.hoverCard || 'hover-lift', {
            scope: this,
            id: `${this.motionId}-hover-cards`,
          });
        }
      }
    }

    /**
     * Soft content parallax for editorial / luxury when Hero would not already attach it.
     */
    initScrollLayers(presets) {
      super.initScrollLayers(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.parallax || !this.content) return;
      if (this.config.enableParallax) return;

      if (presets.motionStyle === 'luxury' || this.config.layout === 'editorial') return;

      const layout = this.config.ctaLayout;
      if (layout !== 'editorial_cta' && layout !== 'luxury_cta') return;

      NM.scroll.parallax(this.content, {
        speed: 0.1,
        trigger: this,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        scope: this,
        id: `${this.motionId}-cta-content-parallax`,
      });
    }

    initViewportBatch(presets) {
      super.initViewportBatch(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '.nether-hero__trust, .nether-hero__stat, [data-nether-cta-countdown], [data-nether-cta-card], .nether-cta__aside, .nether-cta__promotion-card'
      );
      if (secondary.length < 2) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          NM.animate(batch, presets.content || 'fade-up', {
            scope: this,
            scroll: false,
            stagger: 0.1,
            duration: this.config.animationDuration * 0.85,
            id: `${this.motionId}-cta-viewport-batch`,
          });
        },
      });
    }

    initAnalyticsHooks() {
      if (!this.config?.analyticsEnabled && this.dataset.netherCtaAnalytics !== 'true') return;

      this.querySelectorAll('[data-nether-cta-event]').forEach((element) => {
        if (element.dataset.netherCtaAnalyticsBound === 'true') return;
        element.dataset.netherCtaAnalyticsBound = 'true';

        element.addEventListener('click', () => {
          document.dispatchEvent(
            new CustomEvent('nether:cta:click', {
              detail: {
                event: element.dataset.netherCtaEvent,
                sectionId: this.dataset.sectionId,
                href: element.getAttribute('href') || null,
              },
            })
          );
        });
      });
    }

    killMotionTweens() {
      super.killMotionTweens();
    }

    handleSectionLoad(event) {
      if (event.detail?.sectionId !== this.dataset.sectionId) return;

      this.parseConfig();
      this.killMotionTweens();
      this.cacheDom();
      this.initBackgroundVideo();
      this.initMotionEngine();
      this.initAnalyticsHooks();
    }
  }

  customElements.define('nether-cta', NetherCta);
})();
