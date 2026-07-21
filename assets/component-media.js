/**
 * Nether Premium Media Framework — Motion integration (Phase 5.3.4)
 * Standalone Presentation Framework (gallery architecture; does not extend NetherHero).
 *
 * Hero Motion is the architectural reference.
 * Banner + Content Motion are the implementation references.
 *
 * All Media motion routes through NetherMotion (Engine 2.0 + Preset Library).
 * No standalone GSAP timelines. No Media-only presets unless library gaps exist.
 * Before/After slider + carousel keyboard behavior preserved outside motion.
 */

(function () {
  'use strict';

  if (customElements.get('nether-media')) return;

  const HOST_ID = 'nether-media';
  let hostRegistered = false;

  const MEDIA_PRESETS = [
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
    'stagger-gallery',
    'stagger-list',
    'text-heading-reveal',
    'text-luxury-heading',
    'text-cta-reveal',
    'media-image-reveal',
    'media-gallery-reveal',
    'media-video-reveal',
    'media-ken-burns',
    'media-before-after',
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
    'hover-image-zoom',
    'hover-glow',
    'commerce-badge-reveal',
  ];

  function ensureMediaHost(NM) {
    if (hostRegistered || !NM?.register) return;
    NM.register(HOST_ID, {
      plugins: ['scrollTrigger'],
      presets: MEDIA_PRESETS,
      meta: {
        framework: 'presentation',
        name: 'Nether Media Motion',
        version: '1.0.0',
        reference: 'nether-hero',
        implementation: 'nether-banner',
      },
    });
    hostRegistered = true;
  }

  class NetherMedia extends HTMLElement {
    constructor() {
      super();
      this.handleSectionLoad = this.handleSectionLoad.bind(this);
      this.motionId = null;
      this.beforeAfterHandlers = [];
    }

    connectedCallback() {
      if (this.initialized) return;

      this.initialized = true;
      this.cacheDom();
      this.parseConfig();
      this.registerMotion();
      this.initBackgroundVideos();
      this.initKeyboardNavigation();
      this.initBeforeAfter();

      if (window.Shopify?.designMode) {
        document.addEventListener('shopify:section:load', this.handleSectionLoad);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      this.killMotionTweens();
      this.teardownBeforeAfter();
    }

    cacheDom() {
      this.grid = this.querySelector('[data-nether-media-grid]');
      this.header = this.querySelector('[data-nether-media-header], .nether-media__header');
      this.headerInner = this.querySelector('[data-nether-media-panel], .nether-media__header-inner');
      this.panel = this.headerInner;
      this.overlay = this.querySelector('[data-nether-media-section-overlay]');
      this.decor = this.querySelector('[data-nether-media-decor]');
      this.shapes = this.querySelectorAll('[data-nether-media-decor] .nether-media__shape, .nether-media__shape');
      this.dividers = this.querySelectorAll('[data-nether-media-divider], .nether-media__divider');

      this.animateTargets = this.querySelectorAll('[data-nether-media-animate]');
      this.headerTargets = this.querySelectorAll(
        '.nether-media__header [data-nether-media-animate], [data-nether-media-header] [data-nether-media-animate]'
      );

      this.gridItems = this.querySelectorAll('.nether-media__item[data-nether-media-item], li[data-nether-media-item]');
      this.cards = this.querySelectorAll('[data-nether-media-card]');
      this.featuredCards = this.querySelectorAll('[data-nether-media-card].nether-media-card--featured, [data-nether-media-role="hero"]');
      this.beforeAfterBlocks = this.querySelectorAll('[data-nether-media-before-after]');
      this.parallaxMedia = this.querySelectorAll('[data-nether-media-parallax]');
      this.mediaInners = this.querySelectorAll('.nether-media-card__media-inner');
      this.captions = this.querySelectorAll(
        '.nether-media-card__caption, [data-nether-media-caption], .nether-media-before-after__description'
      );
      this.floatingLabels = this.querySelectorAll('.nether-media-card__floating-label, [data-nether-media-float-label]');
      this.playControls = this.querySelectorAll(
        '.nether-media-card__video-poster, .deferred-media__poster-button, [data-nether-media-play]'
      );
      this.overlayContents = this.querySelectorAll(
        '.nether-media-card__content, [data-nether-media-overlay-content]'
      );
      this.baHandles = this.querySelectorAll('[data-nether-media-before-after-handle]');
    }

    parseConfig() {
      const dataset = this.dataset;
      const layoutMatch = [...this.classList].find((c) => c.startsWith('nether-media--layout-'));
      const styleMatch = [...this.classList].find((c) => c.startsWith('nether-media--style-'));

      this.config = {
        animationStyle: dataset.animationStyle || 'stagger',
        animationDuration: Number.parseFloat(dataset.animationDuration) || 0.5,
        enableParallax: dataset.enableParallax === 'true',
        hoverEffect: dataset.hoverReveal || 'zoom',
        mediaLayout:
          dataset.netherMediaLayout ||
          (layoutMatch ? layoutMatch.replace('nether-media--layout-', '') : 'grid_gallery'),
        mediaStyle:
          dataset.netherMediaStyle ||
          (styleMatch ? styleMatch.replace('nether-media--style-', '') : 'medium'),
        glassEnabled:
          this.classList.contains('nether-media--glass-enabled') || dataset.glassEnabled === 'true',
        floatingEnabled:
          this.classList.contains('nether-media--floating-enabled') || dataset.floatingEnabled === 'true',
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
        this.config.mediaLayout === 'before_after' ||
        this.config.mediaLayout === 'editorial_gallery' ||
        this.config.mediaLayout === 'magazine_layout' ||
        this.config.mediaLayout === 'lookbook' ||
        this.config.floatingEnabled ||
        (this.shapes && this.shapes.length > 0) ||
        (this.gridItems && this.gridItems.length > 4)
      );
    }

    /**
     * Map section animation style + global Motion Style + Media layout → library presets.
     * Merchant controls remain: section animation style/speed/parallax/hover + global Motion.
     */
    resolvePresets() {
      const settings = this.getMotionSettings();
      const motionStyle = settings.style || 'minimal';
      const sectionStyle = this.config.animationStyle;
      const layout = this.config.mediaLayout;
      const mediaStyle = this.config.mediaStyle;

      let content = 'fade-up';
      let heading = 'text-heading-reveal';
      let gallery = 'media-gallery-reveal';
      let media = 'media-image-reveal';
      let video = 'media-video-reveal';
      let buttons = 'text-cta-reveal';
      let overlay = 'minimal-reveal';
      let caption = 'fade-up';
      let badges = 'commerce-badge-reveal';
      let beforeAfter = 'media-before-after';
      let hoverLift = 'hover-soft-lift';
      let hoverCard = 'hover-lift';
      let hoverMedia = 'hover-media';
      let hoverPanel = null;
      let hoverPlay = 'hover-soft-lift';
      let splitFeatured = null;
      let splitSecondary = null;

      switch (sectionStyle) {
        case 'fade':
          content = 'minimal-reveal';
          gallery = 'minimal-reveal';
          break;
        case 'slide':
          content = 'fade-up';
          gallery = 'media-gallery-reveal';
          break;
        case 'scale':
          content = 'fade-scale';
          gallery = 'fade-scale';
          break;
        case 'stagger':
        default:
          content = 'stagger-features';
          gallery = 'stagger-gallery';
          break;
      }

      switch (motionStyle) {
        case 'luxury':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          heading = 'text-luxury-heading';
          gallery = sectionStyle === 'stagger' ? 'stagger-gallery' : 'luxury-reveal';
          media = 'media-image-reveal';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
          break;
        case 'editorial':
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'editorial-reveal';
          heading = 'text-heading-reveal';
          gallery = sectionStyle === 'stagger' ? 'stagger-gallery' : 'editorial-reveal';
          media = 'clip-reveal';
          hoverLift = 'hover-soft-lift';
          break;
        case 'minimal':
          if (sectionStyle === 'fade') {
            content = 'minimal-reveal';
            gallery = 'minimal-reveal';
          }
          hoverLift = 'hover-soft-lift';
          break;
        default:
          break;
      }

      switch (layout) {
        case 'editorial_gallery':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          gallery = sectionStyle === 'stagger' ? 'stagger-gallery' : 'editorial-reveal';
          media = motionStyle === 'luxury' ? 'media-image-reveal' : 'clip-reveal';
          break;

        case 'masonry_gallery':
          gallery = 'stagger-gallery';
          break;

        case 'grid_gallery':
          gallery = sectionStyle === 'stagger' ? 'stagger-grid' : 'media-gallery-reveal';
          break;

        case 'horizontal_gallery':
          gallery = 'stagger-cards';
          content = motionStyle === 'minimal' ? 'minimal-reveal' : content;
          break;

        case 'split_media':
          splitFeatured = 'fade-left';
          splitSecondary = 'fade-right';
          gallery = 'stagger-cards';
          media = 'media-image-reveal';
          break;

        case 'video_showcase':
          media = 'media-video-reveal';
          video = 'media-video-reveal';
          gallery = sectionStyle === 'stagger' ? 'stagger-gallery' : 'media-video-reveal';
          break;

        case 'lookbook':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          gallery = 'stagger-gallery';
          caption = 'fade-up';
          break;

        case 'magazine_layout':
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
          gallery = 'stagger-gallery';
          media = motionStyle === 'editorial' ? 'clip-reveal' : 'media-image-reveal';
          splitFeatured = 'fade-up';
          splitSecondary = 'stagger-gallery';
          break;

        case 'before_after':
          gallery = 'media-before-after';
          beforeAfter = 'media-before-after';
          content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
          break;

        case 'minimal_gallery':
          content = 'minimal-reveal';
          gallery = 'minimal-reveal';
          overlay = 'minimal-reveal';
          hoverLift = 'hover-soft-lift';
          break;

        default:
          break;
      }

      // Media style modifiers (merchant media_style — glass/editorial/gradient/minimal)
      if (mediaStyle === 'minimal') {
        content = 'minimal-reveal';
        hoverLift = 'hover-soft-lift';
      }

      if (mediaStyle === 'editorial') {
        content = motionStyle === 'luxury' ? 'luxury-reveal' : 'editorial-reveal';
        heading = motionStyle === 'luxury' ? 'text-luxury-heading' : 'text-heading-reveal';
        if (motionStyle !== 'luxury') media = 'clip-reveal';
      }

      if (mediaStyle === 'glass' || this.config.glassEnabled) {
        if (motionStyle === 'luxury') {
          content = sectionStyle === 'stagger' ? 'stagger-features' : 'luxury-reveal';
          hoverPanel = 'hover-luxury-lift';
          hoverLift = 'hover-luxury-lift';
          hoverCard = 'hover-luxury-lift';
        } else {
          hoverPanel = 'hover-glass';
          hoverLift = 'hover-soft-lift';
        }
      }

      if (mediaStyle === 'gradient') {
        overlay = 'minimal-reveal';
      }

      // Map merchant hover_effect → hover presets (CSS classes remain; GSAP hover is additive)
      switch (this.config.hoverEffect) {
        case 'lift':
          hoverCard = hoverLift;
          break;
        case 'scale':
          hoverMedia = 'hover-media';
          break;
        case 'zoom':
          hoverMedia = 'hover-image-zoom';
          break;
        case 'glow':
          hoverCard = 'hover-glow';
          break;
        case 'shadow':
          hoverCard = 'hover-soft-lift';
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
        gallery,
        media,
        video,
        buttons,
        overlay,
        caption,
        badges,
        beforeAfter,
        hoverLift,
        hoverCard,
        hoverMedia,
        hoverPanel,
        hoverPlay,
        splitFeatured,
        splitSecondary,
      };
    }

    registerMotion() {
      const NM = window.NetherMotion;
      if (!NM?.registerSection || !this.dataset.sectionId) return;

      ensureMediaHost(NM);
      this.motionId = `${this.dataset.sectionId}-media`;

      NM.registerSection(this.motionId, {
        type: 'media',
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
      ensureMediaHost(NM);

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
        '[data-nether-media-animate], [data-nether-media-item], [data-nether-media-card], .nether-media-card__media-inner, .nether-media-card__content, .nether-media-card__overlay, [data-nether-media-after]'
      ).forEach((target) => {
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.clipPath = '';
      });

      this.cards.forEach((card) => {
        card.classList.add('nether-media-card--motion-reduced');
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
     * Entrance: section container atmosphere + header + gallery layer composition.
     * Cinematic media reveals use library media presets (no standalone timelines).
     */
    runEntranceSequence(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const duration = this.config.animationDuration;

      // Layer sequencing — overlays / decorative layers via timelines.batch when available
      if (NM.timelines?.batch && (this.overlay || this.shapes?.length)) {
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
              if (!this.shapes?.length) return master;
              const tween = this.animate(this.shapes, 'fade-scale', {
                id: `${this.motionId}-decor`,
                stagger: 0.1,
                duration,
                preset: {
                  from: { opacity: 0, scale: 0.9 },
                  to: { opacity: 0.12, scale: 1 },
                  cleanup: { clearProps: 'transform' },
                },
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

      this.runHeaderAnimations(presets, duration);
      this.runGalleryAnimations(presets, duration);
      this.runBeforeAfterAnimations(presets, duration);
      this.runCaptionAndOverlayAnimations(presets, duration);
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
        const role = el.dataset.netherMediaRole || this.inferRole(el);
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
     * Gallery / grid / split / magazine / carousel item reveals.
     * Editorial timing + cinematic media presets; GPU transforms only.
     */
    runGalleryAnimations(presets, duration) {
      const layout = this.config.mediaLayout;
      if (layout === 'before_after') return;

      const items = [...this.gridItems];
      if (!items.length) return;

      // Split / magazine: featured hero media + secondary stagger
      if ((layout === 'split_media' || layout === 'magazine_layout') && this.featuredCards.length) {
        const featuredItems = items.filter((item) => item.querySelector('.nether-media-card--featured'));
        const secondaryItems = items.filter((item) => !item.querySelector('.nether-media-card--featured'));

        featuredItems.forEach((item, index) => {
          const mediaInner = item.querySelector('.nether-media-card__media-inner');
          const target = mediaInner || item;
          const isVideo = this.isVideoItem(item);
          const preset =
            presets.splitFeatured || (isVideo ? presets.video : presets.media);

          this.animate(target, preset, {
            id: `${this.motionId}-hero-media-${index}`,
            duration: duration * 1.15,
            scroll: true,
            trigger: item,
            start: 'top 85%',
          });
        });

        if (secondaryItems.length) {
          this.animate(secondaryItems, presets.splitSecondary || presets.gallery, {
            id: `${this.motionId}-secondary-gallery`,
            stagger: 0.1,
            duration,
            delay: 0.12,
            scroll: true,
            trigger: this.grid || this,
            start: 'top 85%',
          });
        }
        return;
      }

      // Video showcase — emphasize video reveal on featured / all video items
      if (layout === 'video_showcase') {
        items.forEach((item, index) => {
          const mediaInner = item.querySelector('.nether-media-card__media-inner');
          const target = mediaInner || item;
          this.animate(target, presets.video, {
            id: `${this.motionId}-video-${index}`,
            duration: duration * 1.1,
            delay: index * 0.08,
            scroll: true,
            trigger: item,
            start: 'top 85%',
          });
        });
        return;
      }

      // Horizontal carousel — cards stagger into the strip
      if (layout === 'horizontal_gallery') {
        this.animate(items, presets.gallery || 'stagger-cards', {
          id: `${this.motionId}-carousel`,
          stagger: 0.09,
          duration,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 88%',
        });
        return;
      }

      // Default galleries (grid / masonry / editorial / lookbook / minimal)
      const galleryPreset = presets.gallery || 'media-gallery-reveal';
      const useItemScroll =
        layout === 'editorial_gallery' ||
        layout === 'lookbook' ||
        layout === 'masonry_gallery' ||
        items.length > 6;

      if (useItemScroll) {
        items.forEach((item, index) => {
          const mediaInner = item.querySelector('.nether-media-card__media-inner');
          const isVideo = this.isVideoItem(item);
          const target = mediaInner || item;
          const itemPreset = isVideo
            ? presets.video
            : layout === 'editorial_gallery' || layout === 'lookbook'
              ? presets.media
              : galleryPreset;

          this.animate(target, itemPreset, {
            id: `${this.motionId}-item-${index}`,
            duration: duration * (isVideo ? 1.1 : 1),
            delay: Math.min(index * 0.04, 0.36),
            scroll: true,
            trigger: item,
            start: 'top 88%',
          });
        });
      } else {
        this.animate(items, galleryPreset, {
          id: `${this.motionId}-gallery`,
          stagger: presets.sectionStyle === 'stagger' ? 0.1 : 0.06,
          duration,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 85%',
        });
      }

      // Luxury Ken Burns on first visible image media when parallax is off
      if (presets.motionStyle === 'luxury' && !this.config.enableParallax) {
        const firstImageInner = [...this.mediaInners].find((inner) => {
          const render = inner.closest('[data-nether-media-render]');
          const type = render?.dataset.netherMediaMediaType || 'image';
          return type === 'image';
        });

        if (firstImageInner) {
          window.NetherMotion.animate(firstImageInner, 'media-ken-burns', {
            scope: this,
            scroll: false,
            id: `${this.motionId}-kenburns`,
            delay: duration,
          });
        }
      }
    }

    isVideoItem(item) {
      const render = item.querySelector('[data-nether-media-render]');
      const type =
        render?.dataset.netherMediaMediaType ||
        item.querySelector('[data-nether-media-card]')?.dataset.netherMediaMediaType;
      return type === 'video' || type === 'background_video';
    }

    runBeforeAfterAnimations(presets, duration) {
      if (!this.beforeAfterBlocks.length) return;

      this.beforeAfterBlocks.forEach((block, index) => {
        const handle = block.querySelector('[data-nether-media-before-after-handle]');
        const title = block.querySelector('.nether-media-before-after__title');

        // Block reveal only — do not animate clip-path on [data-nether-media-after]
        // (merchant slider owns clip-path at runtime).
        this.animate(block, presets.content || 'editorial-reveal', {
          id: `${this.motionId}-ba-block-${index}`,
          duration,
          scroll: true,
          trigger: block,
          start: 'top 85%',
        });

        if (title) {
          this.animate(title, presets.heading || 'text-heading-reveal', {
            id: `${this.motionId}-ba-title-${index}`,
            duration: duration * 0.9,
            delay: 0.08,
            scroll: true,
            trigger: block,
            start: 'top 85%',
          });
        }

        if (handle) {
          this.animate(handle, 'fade-scale', {
            id: `${this.motionId}-ba-handle-${index}`,
            duration: duration * 0.8,
            delay: 0.18,
            scroll: true,
            trigger: block,
            start: 'top 80%',
          });
        }
      });
    }

    runCaptionAndOverlayAnimations(presets, duration) {
      if (this.floatingLabels.length) {
        this.animate(this.floatingLabels, 'fade-up', {
          id: `${this.motionId}-float-labels`,
          stagger: 0.08,
          duration: duration * 0.9,
          delay: 0.2,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 80%',
        });

        // Ambient float for floating media labels / decorative layers
        if (this.config.floatingEnabled || this.config.mediaLayout === 'lookbook') {
          this.floatingLabels.forEach((label, index) => {
            window.NetherMotion.animate(label, 'scroll-floating', {
              scope: this,
              scroll: false,
              duration: 3.5 + index * 0.4,
              delay: 0.5 + index * 0.15,
              id: `${this.motionId}-float-ambient-${index}`,
              preset: {
                from: { y: -4 },
                to: { y: 4 },
              },
            });
          });
        }
      }

      if (this.captions.length && this.config.mediaLayout !== 'minimal_gallery') {
        this.animate(this.captions, presets.caption || 'fade-up', {
          id: `${this.motionId}-captions`,
          stagger: 0.06,
          duration: duration * 0.85,
          delay: 0.18,
          scroll: true,
          trigger: this.grid || this,
          start: 'top 82%',
        });
      }
    }

    /**
     * Editorial layer sequencing for overlays / badges after gallery entrance.
     */
    initLayerSequencing(presets) {
      const NM = window.NetherMotion;
      if (!NM?.animate) return;

      const badges = this.querySelectorAll('.nether-media-card__badge');
      if (!badges.length) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 0.9) return;

      badges.forEach((badge, index) => {
        this.animate(badge, presets.badges || 'commerce-badge-reveal', {
          id: `${this.motionId}-badge-${index}`,
          duration: this.config.animationDuration * 0.8,
          delay: 0.1,
          scroll: true,
          trigger: badge.closest('[data-nether-media-card]') || badge,
          start: 'top 90%',
        });
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
        case 'subheading':
        case 'text':
          return presets.content;
        case 'divider':
          return 'minimal-reveal';
        case 'caption':
          return presets.caption;
        default:
          return presets.content;
      }
    }

    inferRole(el) {
      if (el.classList.contains('nether-media__eyebrow')) return 'eyebrow';
      if (el.classList.contains('nether-media__heading')) return 'heading';
      if (el.classList.contains('nether-media__subheading')) return 'subheading';
      if (el.classList.contains('nether-media__text')) return 'text';
      if (el.classList.contains('nether-media__buttons')) return 'buttons';
      if (el.classList.contains('nether-media__app-block')) return 'app';
      if (el.classList.contains('nether-media__divider')) return 'divider';
      if (el.classList.contains('nether-media-card__caption')) return 'caption';
      return 'content';
    }

    initScrollLayers(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll) return;

      // Background / media parallax (merchant toggle)
      if (this.config.enableParallax && this.parallaxMedia.length && NM.scroll.parallax) {
        this.parallaxMedia.forEach((media, index) => {
          const inner = media.querySelector('.nether-media-card__media-inner');
          const target = inner || media;
          const trigger = media.closest('[data-nether-media-card]') || media;

          NM.scroll.parallax(target, {
            speed: presets.motionStyle === 'luxury' ? 0.4 : 0.28,
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scope: this,
            id: `${this.motionId}-parallax-${index}`,
          });
        });
      }

      // Soft editorial content parallax for magazine / lookbook when media parallax is off
      if (
        !this.config.enableParallax &&
        this.header &&
        (this.config.mediaLayout === 'magazine_layout' ||
          this.config.mediaLayout === 'lookbook' ||
          this.config.mediaLayout === 'editorial_gallery') &&
        (presets.motionStyle === 'luxury' || presets.motionStyle === 'editorial')
      ) {
        NM.scroll.parallax(this.header, {
          speed: 0.1,
          trigger: this,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          scope: this,
          id: `${this.motionId}-header-parallax`,
        });
      }

      // Decorative layer parallax
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
    }

    /**
     * Subtle premium hover — cards, media, play controls, before/after handles.
     * Reuses library hover presets only. Respects merchant hover_effect + parallax.
     */
    initHoverInteractions(presets) {
      const NM = window.NetherMotion;
      if (!NM?.hover) return;

      const buttons = this.querySelectorAll('.nether-media__buttons .button, .nether-media__buttons a.button');
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

      if (presets.hoverPanel && this.panel) {
        NM.hover(this.panel, presets.hoverPanel, {
          scope: this,
          id: `${this.motionId}-hover-panel`,
          focus: false,
        });
      }

      // Media / thumbnail hover — skip when parallax owns transform
      if (this.mediaInners.length && !this.config.enableParallax) {
        NM.hover(this.mediaInners, presets.hoverMedia, {
          scope: this,
          id: `${this.motionId}-hover-media`,
          focus: false,
        });
      }

      if (this.playControls.length) {
        NM.hover(this.playControls, presets.hoverPlay || 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-play`,
        });
      }

      if (this.baHandles.length) {
        NM.hover(this.baHandles, 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-ba-handles`,
          focus: false,
        });
      }

      // Merchant reveal hover — soft content lift via Engine hover (no raw GSAP)
      if (this.config.hoverEffect === 'reveal' && this.overlayContents.length) {
        NM.hover(this.overlayContents, 'hover-soft-lift', {
          scope: this,
          id: `${this.motionId}-hover-reveal-content`,
          focus: true,
          preset: {
            from: { y: 12, opacity: 0.92 },
            to: { y: 0, opacity: 1 },
            defaults: { duration: 0.35, ease: 'power2.out' },
          },
        });
      }
    }

    /**
     * Viewport batch secondary Media groups for tall galleries.
     */
    initViewportBatch(presets) {
      const NM = window.NetherMotion;
      if (!NM?.scroll?.batch || typeof ScrollTrigger === 'undefined') return;

      const secondary = this.querySelectorAll(
        '.nether-media-card__floating-label, .nether-media-card__badge, .nether-media-card__caption, .nether-media-before-after__description'
      );
      if (secondary.length < 3) return;

      const rect = this.getBoundingClientRect();
      if (rect.height < window.innerHeight * 1.15) return;

      NM.scroll.batch(secondary, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          NM.animate(batch, presets.caption || 'fade-up', {
            scope: this,
            scroll: false,
            stagger: 0.08,
            duration: this.config.animationDuration * 0.85,
            id: `${this.motionId}-viewport-batch`,
          });
        },
      });
    }

    initBackgroundVideos() {
      this.querySelectorAll('[data-nether-media-bg-video] video, [data-nether-media-bg-video]').forEach((node) => {
        const video = node.tagName === 'VIDEO' ? node : node.querySelector('video');
        if (!video) return;
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      });
    }

    initBeforeAfter() {
      this.teardownBeforeAfter();

      this.beforeAfterBlocks.forEach((block) => {
        const slider = block.querySelector('[data-nether-media-before-after-slider]');
        const afterImage = block.querySelector('[data-nether-media-after]');
        const handle = block.querySelector('[data-nether-media-before-after-handle]');

        if (!slider || !afterImage) return;

        const updatePosition = () => {
          const value = slider.value;
          afterImage.style.clipPath = `inset(0 0 0 ${value}%)`;
          if (handle) {
            handle.style.left = `${value}%`;
          }
        };

        slider.addEventListener('input', updatePosition);
        slider.addEventListener('change', updatePosition);
        updatePosition();

        this.beforeAfterHandlers.push({ slider, updatePosition });
      });
    }

    teardownBeforeAfter() {
      this.beforeAfterHandlers.forEach(({ slider, updatePosition }) => {
        slider.removeEventListener('input', updatePosition);
        slider.removeEventListener('change', updatePosition);
      });
      this.beforeAfterHandlers = [];
    }

    initKeyboardNavigation() {
      if (this.dataset.carouselReady !== 'true') return;

      this.cards.forEach((card) => {
        const link = card.querySelector('.nether-media-card__link[href]');
        if (!link) return;

        link.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

          const items = Array.from(this.querySelectorAll('.nether-media-card__link[href]'));
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
      this.teardownBeforeAfter();
      this.cacheDom();
      this.initBackgroundVideos();
      this.initBeforeAfter();
      this.initKeyboardNavigation();
      this.initMotionEngine();
    }
  }

  customElements.define('nether-media', NetherMedia);
})();
