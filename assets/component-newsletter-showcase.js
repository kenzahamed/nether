/**
 * Nether Premium Newsletter & Lead Generation Framework — Motion integration (Phase 5.3.7)
 * Extends NetherHero (Hero Motion is the Presentation Framework standard).
 * Load component-hero.js before this file.
 *
 * Hero Motion is the architectural reference.
 * Banner Motion is the primary implementation reference (Hero subclass).
 * Content / Media / Testimonials / FAQ Motion inform scroll layering + form confidence tone.
 *
 * All Newsletter motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No Newsletter-only presets unless library gaps exist.
 * Shopify customer form submission, focus/keyboard, and merchant settings preserved.
 */

(function () {
  'use strict';

  if (customElements.get('nether-newsletter')) return;

  /**
   * Newsletter extends NetherHero. Boot only after nether-hero is defined so
   * Theme Editor / deferred load order never silently skips registration.
   */
  function bootNetherNewsletter(NetherHeroClass) {
    if (!NetherHeroClass || customElements.get('nether-newsletter')) return;

  const HOST_ID = 'nether-newsletter';
  let hostRegistered = false;

  const NEWSLETTER_PRESETS = [
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
    'commerce-add-to-cart',
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

  function ensureNewsletterHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: NEWSLETTER_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Newsletter Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-banner',
      },
    });
    hostRegistered = true;
  }

  class NetherNewsletter extends NetherHeroClass {
    constructor() {
      super();
      this.handleFormFocusIn = this.handleFormFocusIn.bind(this);
      this.handleFormFocusOut = this.handleFormFocusOut.bind(this);
      this.handleSubmitPress = this.handleSubmitPress.bind(this);
      this.formFocusCleanups = [];
      this.submitPressCleanups = [];
    }

    cacheDom() {
      super.cacheDom();

      // Newsletter blocks use framework-specific attrs; merge with Hero attrs.
      this.animateTargets = this.querySelectorAll(
        '[data-nether-hero-animate], [data-nether-newsletter-animate]'
      );

      this.overlay =
        this.querySelector('[data-nether-hero-overlay], .nether-hero__overlay, [data-nether-newsletter-overlay]') ||
        this.overlay;

      this.panel =
        this.querySelector('[data-nether-hero-panel], .nether-newsletter__panel--floating, .nether-hero__panel') ||
        this.panel;

      this.content =
        this.querySelector(
          '[data-nether-hero-content], [data-nether-newsletter-content], .nether-newsletter__body'
        ) || this.content;

      this.formWraps = this.querySelectorAll('[data-nether-newsletter-form-wrap]');
      this.formFields = this.querySelectorAll('[data-nether-newsletter-input-animate]');
      this.formActions = this.querySelectorAll('[data-nether-newsletter-button-animate]');
      this.formFieldGroups = this.querySelectorAll('[data-nether-newsletter-form-fields]');
      this.successStates = this.querySelectorAll('[data-nether-newsletter-success]');
      this.privacyNotes = this.querySelectorAll('[data-nether-newsletter-privacy]');
      this.dividers = this.querySelectorAll(
        '[data-nether-newsletter-divider], .nether-newsletter__divider, .nether-newsletter__block-divider'
      );
      this.countdown = this.querySelector('[data-nether-newsletter-countdown]');
      this.submitButtons = this.querySelectorAll(
        '[data-nether-newsletter-button-animate] button[type="submit"], [data-nether-newsletter-form] button[type="submit"]'
      );
      this.formInputs = this.querySelectorAll(
        '[data-nether-newsletter-form] input:not([type="hidden"]), [data-nether-newsletter-form] textarea'
      );
    }

    parseConfig() {
      super.parseConfig();

      const dataset = this.dataset;
      const newsletterLayoutMatch = [...this.classList].find((c) =>
        c.startsWith('nether-newsletter--layout-')
      );

      this.config.newsletterLayout =
        dataset.newsletterLayout ||
        dataset.netherNewsletterLayout ||
        (newsletterLayoutMatch
          ? newsletterLayoutMatch.replace('nether-newsletter--layout-', '')
          : 'centered_signup');
      this.config.formReveal = dataset.formReveal !== 'false';
      this.config.hoverReveal = dataset.hoverReveal === 'true';
      this.config.floatingEnabled =
        this.classList.contains('nether-newsletter--floating-enabled') ||
        dataset.floatingEnabled === 'true';
    }

    /**
     * Newsletter layout mapping on top of Hero Motion resolvePresets().
     * Merchant controls remain: section animation style/speed/parallax/form reveal/hover + global Motion.
     * Tone: confidence and clarity — subtle, never distracting.
     */
    resolvePresets() {
      const presets = super.resolvePresets();
      const layout = this.config.newsletterLayout;
      const motionStyle = presets.motionStyle;

      presets.form = 'fade-up';
      presets.formFields = 'fade-up';
      presets.formButton = 'text-cta-reveal';
      presets.success = 'fade-scale';
      presets.privacy = 'minimal-reveal';
      presets.submitPress = 'commerce-add-to-cart';
      presets.inputFocus = 'hover-soft-lift';

      switch (layout) {
        case 'editorial_newsletter':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          if (!presets.isVideo && motionStyle !== 'luxury') {
            presets.media = 'clip-reveal';
          }
          presets.form = 'editorial-reveal';
          break;

        case 'centered_signup':
          presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : presets.content;
          presets.form = motionStyle === 'minimal' ? 'minimal-reveal' : 'fade-up';
          break;

        case 'split_layout':
        case 'image_with_signup':
          // Hero split directional presets already applied via config.layout === 'split'.
          presets.form = 'fade-up';
          break;

        case 'background_image':
        case 'background_video':
          presets.overlay = 'minimal-reveal';
          presets.form = motionStyle === 'luxury' ? 'luxury-reveal' : 'fade-scale';
          presets.formButton = 'text-cta-reveal';
          break;

        case 'minimal_layout':
          presets.content = 'minimal-reveal';
          presets.overlay = 'minimal-reveal';
          presets.form = 'minimal-reveal';
          presets.formFields = 'minimal-reveal';
          presets.hoverLift = 'hover-soft-lift';
          break;

        case 'magazine_layout':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          presets.form = 'fade-up';
          break;

        case 'vip_membership':
          if (motionStyle === 'luxury') {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
            presets.heading = 'text-luxury-heading';
            presets.hoverPanel = 'hover-luxury-lift';
            presets.hoverLift = 'hover-luxury-lift';
            presets.inputFocus = 'hover-luxury-lift';
          } else {
            presets.hoverPanel = 'hover-glass';
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'fade-scale';
          }
          presets.form = 'fade-scale';
          presets.formButton = 'text-cta-reveal';
          break;

        case 'early_access_waitlist':
          presets.form = 'fade-up';
          presets.formButton = 'text-cta-reveal';
          presets.success = 'commerce-badge-reveal';
          break;

        default:
          break;
      }

      if (this.config.floatingEnabled && !presets.hoverPanel) {
        presets.hoverPanel = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-soft-lift';
      }

      return presets;
    }

    needsScrollPlugins() {
      return (
        this.config.enableParallax ||
        this.config.formReveal ||
        (this.shapes && this.shapes.length > 0) ||
        (this.dividers && this.dividers.length > 0) ||
        this.config.newsletterLayout === 'editorial_newsletter' ||
        this.config.newsletterLayout === 'magazine_layout' ||
        this.config.newsletterLayout === 'split_layout' ||
        this.config.newsletterLayout === 'image_with_signup' ||
        this.config.newsletterLayout === 'background_image' ||
        this.config.newsletterLayout === 'background_video' ||
        this.config.newsletterLayout === 'vip_membership' ||
        this.config.newsletterLayout === 'early_access_waitlist' ||
        ['stagger', 'slide', 'scale', 'fade'].includes(this.config.animationStyle)
      );
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureNewsletterHost(NM);
      this.motionId = `${this.dataset.sectionId}-newsletter`;

      NM.registerSection(this.motionId, {
        type: 'newsletter',
        element: this,
        init: () => {
          this.parseConfig();
          this.cacheDom();
          this.initMotionEngine();
        },
        destroy: () => {
          this.destroyFormInteractions();
          this.destroyMotion();
        },
      });

      this.initMotionEngine();
    }

    initMotionEngine() {
      const NM = window.NetherMotion;
      ensureNewsletterHost(NM);

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

        this.destroyFormInteractions();
        NM.destroy(this);

        this.motionReady = true;
        this.dataset.netherMotionReady = 'true';
        this.removeAttribute('data-nether-motion-pending');

        const presets = this.resolvePresets();
        this.runEntranceSequence(presets);
        this.initScrollLayers(presets);
        this.initHoverInteractions(presets);
        this.initFormInteractions(presets);
        this.initViewportBatch(presets);
      }, this);

      if (plugins.length && NM.load) {
        NM.load(plugins);
      }
    }

    setReducedMotionState() {
      super.setReducedMotionState();

      this.querySelectorAll(
        '[data-nether-newsletter-animate], [data-nether-newsletter-form-animate], [data-nether-newsletter-input-animate], [data-nether-newsletter-button-animate], [data-nether-newsletter-success], [data-nether-newsletter-privacy], [data-nether-newsletter-divider]'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });
    }

    /**
     * Section reveal + content roles + form layer sequencing.
     * Mid-page signup sections use scroll reveals for confidence without distraction.
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
      this.runFormEntrance(presets, duration);
      this.runSuccessFeedback(presets, duration);

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
      const formWrapSet = new Set(this.formWraps || []);
      const targets = [...this.animateTargets].filter((el) => {
        // When form reveal is on, form wrap is sequenced in runFormEntrance (avoid nested opacity).
        if (this.config.formReveal && formWrapSet.has(el)) return false;
        if (el.hasAttribute('data-nether-newsletter-input-animate')) return false;
        if (el.hasAttribute('data-nether-newsletter-button-animate')) return false;
        if (el.hasAttribute('data-nether-newsletter-success')) return false;
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
        const role =
          el.dataset.netherNewsletterRole || el.dataset.netherHeroRole || this.inferRole(el);
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
     * Form reveal: wrap → fields → submit — confidence and clarity.
     * Honors merchant `Enable form reveal` toggle.
     */
    runFormEntrance(presets, duration) {
      if (!this.config.formReveal) {
        // Form wrap still enters with content sequence when toggle is off.
        if (this.formWraps?.length) {
          this.animate(this.formWraps, presets.form || 'fade-up', {
            id: `${this.motionId}-form-wrap`,
            duration,
            delay: 0.18,
            scroll: true,
            trigger: this.formWraps[0] || this,
            start: 'top 88%',
          });
        }
        return;
      }

      const trigger = this.formWraps?.[0] || this.formFieldGroups?.[0] || this;
      const start = 'top 88%';
      let delay = 0.18;

      if (this.formWraps?.length) {
        this.animate(this.formWraps, presets.form || 'fade-up', {
          id: `${this.motionId}-form-wrap`,
          duration: duration * 0.95,
          delay,
          scroll: true,
          trigger,
          start,
        });
        delay += duration * 0.12;
      }

      if (this.formFields?.length) {
        this.animate(this.formFields, presets.formFields || 'fade-up', {
          id: `${this.motionId}-form-fields`,
          stagger: 0.08,
          duration: duration * 0.85,
          delay,
          scroll: true,
          trigger: this.formFieldGroups?.[0] || trigger,
          start,
          preset: {
            from: { opacity: 0, y: 16 },
            to: { opacity: 1, y: 0 },
          },
        });
        delay += duration * 0.15;
      }

      if (this.formActions?.length) {
        this.animate(this.formActions, presets.formButton || 'text-cta-reveal', {
          id: `${this.motionId}-form-actions`,
          duration: duration * 0.8,
          delay,
          scroll: true,
          trigger: this.formActions[0] || trigger,
          start,
        });
        delay += duration * 0.1;
      }

      if (this.privacyNotes?.length) {
        this.animate(this.privacyNotes, presets.privacy || 'minimal-reveal', {
          id: `${this.motionId}-privacy`,
          duration: duration * 0.7,
          delay,
          scroll: true,
          trigger: this.privacyNotes[0] || trigger,
          start,
        });
      }
    }

    /**
     * Success state feedback when Shopify posts the form successfully.
     * Soft scale-in — does not alter form markup or submission.
     */
    runSuccessFeedback(presets, duration) {
      if (!this.successStates?.length) return;

      this.animate(this.successStates, presets.success || 'fade-scale', {
        id: `${this.motionId}-success`,
        duration: duration * 0.9,
        delay: 0.1,
        scroll: false,
      });
    }

    presetForRole(role, presets, baseContent) {
      if (role === 'form' || role === 'newsletter-form') return presets.form || 'fade-up';
      if (role === 'countdown') return presets.badges || 'commerce-badge-reveal';
      if (role === 'privacy') return presets.privacy || 'minimal-reveal';
      if (role === 'success') return presets.success || 'fade-scale';
      if (role === 'divider') return 'minimal-reveal';
      return super.presetForRole(role, presets, baseContent);
    }

    inferRole(el) {
      if (
        el.hasAttribute('data-nether-newsletter-form-wrap') ||
        el.classList.contains('nether-newsletter__form-wrap')
      ) {
        return 'form';
      }
      if (
        el.hasAttribute('data-nether-newsletter-countdown') ||
        el.classList.contains('nether-newsletter__countdown')
      ) {
        return 'countdown';
      }
      if (el.hasAttribute('data-nether-newsletter-privacy')) return 'privacy';
      if (el.hasAttribute('data-nether-newsletter-success')) return 'success';
      if (
        el.hasAttribute('data-nether-newsletter-divider') ||
        el.classList.contains('nether-newsletter__block-divider') ||
        el.classList.contains('nether-newsletter__divider')
      ) {
        return 'divider';
      }
      if (el.classList.contains('nether-newsletter__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-newsletter__heading')) return 'heading';
      if (el.classList.contains('nether-newsletter__subheading')) return 'subheading';
      if (el.classList.contains('nether-newsletter__text')) return 'text';
      if (
        el.classList.contains('nether-newsletter__buttons') ||
        el.classList.contains('nether-newsletter__button-block')
      ) {
        return 'buttons';
      }
      return super.inferRole(el);
    }

    /**
     * Hover: reuse library presets — submit, trust, panel, optional media.
     * Does not fight input typing focus (inputs handled separately).
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      super.initHoverInteractions(presets);

      if (this.submitButtons?.length) {
        NM.hover(this.submitButtons, presets.hoverLift || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-submit`,
        });
      }

      const outerButtons = this.querySelectorAll(
        '.nether-newsletter__button-block .button, .nether-newsletter__buttons .button'
      );
      if (outerButtons.length) {
        NM.hover(outerButtons, presets.hoverLift || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-outer-buttons`,
        });
      }

      // Merchant toggle — subtle trust badge lift (replaces prior raw GSAP hover).
      if (this.config.hoverReveal) {
        const trustItems = this.querySelectorAll('.nether-hero__trust-item');
        if (trustItems.length) {
          NM.hover(trustItems, presets.hoverLift || 'hover-soft-lift', {
            scope: this,
            id: `${this.motionId}-hover-trust`,
            focus: false,
          });
        }
      }
    }

    /**
     * Subtle form interaction: input focus clarity + submit press.
     * Never preventsDefault — Shopify form submission stays native.
     */
    initFormInteractions(presets) {
      this.destroyFormInteractions();
      if (!this.motionReady || this.prefersReducedMotion()) return;

      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      this.formInputs.forEach((input, index) => {
        const onFocus = () => this.handleFormFocusIn(input, presets, index);
        const onBlur = () => this.handleFormFocusOut(input, presets, index);
        input.addEventListener('focusin', onFocus);
        input.addEventListener('focusout', onBlur);
        this.formFocusCleanups.push(() => {
          input.removeEventListener('focusin', onFocus);
          input.removeEventListener('focusout', onBlur);
        });
      });

      this.submitButtons.forEach((button, index) => {
        const onPress = (event) => this.handleSubmitPress(button, presets, index, event);
        button.addEventListener('pointerdown', onPress);
        this.submitPressCleanups.push(() => {
          button.removeEventListener('pointerdown', onPress);
        });
      });
    }

    handleFormFocusIn(input, presets, index) {
      const NM = window.NetherMotion;
      if (!NM?.animate || !input) return;

      const field = input.closest('[data-nether-newsletter-input-animate]') || input;

      NM.animate(field, presets.inputFocus || 'hover-soft-lift', {
        scope: this,
        scroll: false,
        duration: 0.28,
        id: `${this.motionId}-input-focus-${index}`,
        preset: {
          from: { y: 0, scale: 1 },
          to: { y: -2, scale: 1.01 },
          defaults: { ease: 'power2.out' },
          cleanup: { clearProps: '' },
        },
      });
    }

    handleFormFocusOut(input, presets, index) {
      const NM = window.NetherMotion;
      if (!NM?.animate || !input) return;

      const field = input.closest('[data-nether-newsletter-input-animate]') || input;

      NM.animate(field, 'minimal-reveal', {
        scope: this,
        scroll: false,
        duration: 0.25,
        id: `${this.motionId}-input-blur-${index}`,
        preset: {
          from: {},
          to: { y: 0, scale: 1, opacity: 1, clearProps: 'transform' },
          defaults: { ease: 'power2.out' },
        },
      });
    }

    handleSubmitPress(button, presets, index) {
      const NM = window.NetherMotion;
      if (!NM?.animate || !button) return;

      // Soft press feedback — does not cancel submit or change form action.
      NM.animate(button, presets.submitPress || 'commerce-add-to-cart', {
        scope: this,
        scroll: false,
        id: `${this.motionId}-submit-press-${index}`,
      });
    }

    destroyFormInteractions() {
      this.formFocusCleanups.forEach((fn) => fn());
      this.submitPressCleanups.forEach((fn) => fn());
      this.formFocusCleanups = [];
      this.submitPressCleanups = [];
    }

    /**
     * Soft content parallax for editorial / magazine when Hero would not already attach it.
     */
    initScrollLayers(presets) {
      super.initScrollLayers(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.parallax || !this.content) return;
      if (this.config.enableParallax) return;

      if (presets.motionStyle === 'luxury' || this.config.layout === 'editorial') return;

      const layout = this.config.newsletterLayout;
      if (layout !== 'editorial_newsletter' && layout !== 'magazine_layout') return;

      NM.scroll.parallax(this.content, {
        speed: 0.1,
        trigger: this,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        scope: this,
        id: `${this.motionId}-newsletter-content-parallax`,
      });
    }

    initViewportBatch(presets) {
      super.initViewportBatch(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '.nether-hero__trust, .nether-hero__stat, [data-nether-newsletter-countdown], [data-nether-newsletter-privacy]'
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
            id: `${this.motionId}-newsletter-viewport-batch`,
          });
        },
      });
    }

    killMotionTweens() {
      this.destroyFormInteractions();
      super.killMotionTweens();
    }

    handleSectionLoad(event) {
      if (event.detail?.sectionId) {
        if (event.detail.sectionId !== this.dataset.sectionId) return;
      } else if (!(event.target?.contains?.(this) || event.target === this)) {
        return;
      }

      this.destroyFormInteractions();
      this.parseConfig();
      this.killMotionTweens();
      this.cacheDom();
      this.initBackgroundVideo();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-newsletter', NetherNewsletter);
  }

  const existingHero = customElements.get('nether-hero');
  if (existingHero) {
    bootNetherNewsletter(existingHero.constructor);
  } else {
    customElements.whenDefined('nether-hero').then(function () {
      bootNetherNewsletter(customElements.get('nether-hero')?.constructor);
    });
  }
})();
