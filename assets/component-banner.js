/**
 * Nether Premium Banner Framework — Motion integration (Phase 5.3.2)
 * Extends NetherHero (Hero Motion is the Presentation Framework standard).
 * Load component-hero.js before this file.
 *
 * All Banner motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No Banner-only presets unless library gaps exist.
 */

(function () {
  'use strict';

  if (customElements.get('nether-banner')) return;

  const NetherHeroClass = customElements.get('nether-hero')?.constructor;
  if (!NetherHeroClass) return;

  const HOST_ID = 'nether-banner';
  let hostRegistered = false;

  const BANNER_PRESETS = [
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
    'hover-soft-lift',
    'hover-luxury-lift',
    'hover-lift',
    'hover-media',
    'hover-glass',
  ];

  function ensureBannerHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: BANNER_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Banner Motion',
        version: '1.0.0',
        reference: 'nether-hero',
      },
    });
    hostRegistered = true;
  }

  class NetherBanner extends NetherHeroClass {
    cacheDom() {
      super.cacheDom();
      this.collectionBar = this.querySelector('[data-nether-banner-collection-bar]');
      this.countdown = this.querySelector('[data-nether-banner-countdown]');
    }

    parseConfig() {
      super.parseConfig();

      const dataset = this.dataset;
      const bannerLayoutMatch = [...this.classList].find((c) => c.startsWith('nether-banner--layout-'));

      this.config.bannerLayout =
        dataset.netherBannerLayout ||
        (bannerLayoutMatch ? bannerLayoutMatch.replace('nether-banner--layout-', '') : 'promotional');
      this.config.enableHover = dataset.bannerHover === 'true';
    }

    /**
     * Banner layout mapping on top of Hero Motion resolvePresets().
     * Merchant controls remain: section animation style/speed/parallax/hover + global Motion.
     */
    resolvePresets() {
      const presets = super.resolvePresets();
      const bannerLayout = this.config.bannerLayout;
      const motionStyle = presets.motionStyle;

      switch (bannerLayout) {
        case 'promotional':
          presets.buttons = 'text-cta-reveal';
          if (motionStyle === 'luxury') {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
            presets.heading = 'text-luxury-heading';
          }
          break;

        case 'collection':
          // Hero layout is split — keep directional presets; collection bar uses CTA reveal.
          presets.buttons = 'text-cta-reveal';
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

        case 'editorial':
          presets.content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          presets.heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          if (!presets.isVideo && motionStyle !== 'luxury') {
            presets.media = 'clip-reveal';
          }
          break;

        case 'split':
          // Directional fade already applied by Hero when hero layout === split.
          break;

        case 'glass':
          if (motionStyle === 'luxury') {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
            presets.hoverPanel = 'hover-luxury-lift';
          } else {
            presets.hoverPanel = 'hover-glass';
          }
          presets.hoverLift = motionStyle === 'luxury' ? 'hover-luxury-lift' : 'hover-soft-lift';
          break;

        case 'gradient':
          presets.overlay = 'minimal-reveal';
          if (motionStyle === 'luxury') {
            presets.content = presets.sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          }
          break;

        default:
          break;
      }

      return presets;
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureBannerHost(NM);
      this.motionId = `${this.dataset.sectionId}-banner`;

      NM.registerSection(this.motionId, {
        type: 'banner',
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
      ensureBannerHost(NM);
      super.initMotionEngine();
    }

    presetForRole(role, presets, baseContent) {
      if (role === 'collection') return presets.buttons || 'text-cta-reveal';
      if (role === 'countdown') return presets.badges || 'commerce-badge-reveal';
      return super.presetForRole(role, presets, baseContent);
    }

    inferRole(el) {
      if (el.hasAttribute('data-nether-banner-collection-bar') || el.classList.contains('nether-banner__collection-bar')) {
        return 'collection';
      }
      if (el.hasAttribute('data-nether-banner-countdown') || el.classList.contains('nether-banner__countdown')) {
        return 'countdown';
      }
      return super.inferRole(el);
    }

    /**
     * Banner hover: buttons / cards / glass panel always subtle;
     * media hover respects existing merchant `Enable media hover` toggle.
     * Reuses library hover presets only — no standalone GSAP.
     */
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

      const collectionLink = this.collectionBar?.querySelector('.nether-banner__collection-link');
      if (collectionLink) {
        NM.hover(collectionLink, presets.hoverLift, {
          scope: this,
          id: `${this.motionId}-hover-collection`,
        });
      }

      // Merchant toggle — subtle media scale via hover-media; skip when parallax owns transform
      if (this.config.enableHover && this.mediaInner && !this.config.enableParallax) {
        NM.hover(this.mediaInner, presets.hoverMedia, {
          scope: this,
          id: `${this.motionId}-hover-media`,
          focus: false,
        });
      }
    }

    /**
     * Soft content parallax for brand story when Hero would not already attach it.
     */
    initScrollLayers(presets) {
      super.initScrollLayers(presets);

      const NM = window.NetherMotion;
      if (!NM?.scroll?.parallax || !this.content) return;
      if (this.config.enableParallax) return;

      // Hero already parallaxes content for luxury style or editorial hero layout
      if (presets.motionStyle === 'luxury' || this.config.layout === 'editorial') return;

      if (this.config.bannerLayout !== 'brand_story') return;

      NM.scroll.parallax(this.content, {
        speed: 0.1,
        trigger: this,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        scope: this,
        id: `${this.motionId}-banner-content-parallax`,
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

  customElements.define('nether-banner', NetherBanner);
})();
