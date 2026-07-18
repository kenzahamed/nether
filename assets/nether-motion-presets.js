/**
 * nether-motion-presets.js
 * Nether Motion Preset Library — reusable animation metadata for Motion Engine 2.0.
 *
 * Single source of truth for preset definitions consumed by:
 *   NetherMotion.animate()
 *   NetherMotion.timeline()
 *   NetherMotion.createPreset()
 *   NetherMotion.register()
 *   NetherMotion.packs
 *
 * Definitions only — does NOT auto-bind to Hero, Product, Collection, Commerce,
 * or any section. Consumers opt in explicitly.
 *
 * Requires: assets/nether-motion.js (loaded first)
 */
(function () {
  'use strict';

  var LIBRARY_VERSION = '1.0.0';
  var PACK_NAME = 'preset-library';

  var INSTANT = {
    mode: 'instant',
    from: {},
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'none', clearProps: 'filter' },
    defaults: { duration: 0.01, ease: 'none', delay: 0 },
  };

  var CLEAN_TRANSFORM = {
    clearProps: 'opacity,transform,filter,clipPath,webkitClipPath',
  };

  var RESPONSIVE_REVEAL = {
    mobile: {
      from: { y: 24, x: 0 },
      defaults: { duration: 0.7 },
    },
  };

  function define(name, definition) {
    return Object.assign({ name: name }, definition || {});
  }

  /* -------------------------------------------------------------------------- */
  /* Reveal Presets                                                             */
  /* -------------------------------------------------------------------------- */

  var REVEAL_PRESETS = [
    define('fade-up', {
      category: 'reveal',
      direction: 'up',
      distance: 40,
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.9, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: RESPONSIVE_REVEAL,
      reducedMotion: INSTANT,
    }),
    define('fade-down', {
      category: 'reveal',
      direction: 'down',
      distance: 40,
      from: { opacity: 0, y: -40 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.9, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { y: -24 }, defaults: { duration: 0.7 } },
      },
      reducedMotion: INSTANT,
    }),
    define('fade-left', {
      category: 'reveal',
      direction: 'left',
      distance: 48,
      from: { opacity: 0, x: 48 },
      to: { opacity: 1, x: 0 },
      defaults: { duration: 0.95, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { x: 24 }, defaults: { duration: 0.7 } },
      },
      reducedMotion: INSTANT,
    }),
    define('fade-right', {
      category: 'reveal',
      direction: 'right',
      distance: 48,
      from: { opacity: 0, x: -48 },
      to: { opacity: 1, x: 0 },
      defaults: { duration: 0.95, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { x: -24 }, defaults: { duration: 0.7 } },
      },
      reducedMotion: INSTANT,
    }),
    define('fade-scale', {
      category: 'reveal',
      from: { opacity: 0, scale: 0.94 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.95, delay: 0, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { scale: 0.97 }, defaults: { duration: 0.75 } },
      },
      reducedMotion: INSTANT,
    }),
    define('scale-in', {
      category: 'reveal',
      from: { opacity: 0, scale: 0.88 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 1, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('scale-out', {
      category: 'reveal',
      from: { opacity: 0, scale: 1.08 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 1, delay: 0, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('blur-reveal', {
      category: 'reveal',
      from: { opacity: 0, filter: 'blur(12px)', y: 16 },
      to: { opacity: 1, filter: 'blur(0px)', y: 0 },
      defaults: { duration: 1.05, delay: 0, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: {
          from: { filter: 'blur(6px)', y: 12 },
          defaults: { duration: 0.8 },
        },
      },
      reducedMotion: {
        mode: 'instant',
        from: {},
        to: { opacity: 1, filter: 'none', y: 0 },
        defaults: { duration: 0.01, ease: 'none' },
      },
    }),
    define('mask-reveal', {
      category: 'reveal',
      from: { opacity: 0, yPercent: 100 },
      to: { opacity: 1, yPercent: 0 },
      defaults: { duration: 1, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { note: 'Prefer overflow:hidden parent when applying' },
    }),
    define('clip-reveal', {
      category: 'reveal',
      from: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', webkitClipPath: 'inset(100% 0% 0% 0%)' },
      to: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', webkitClipPath: 'inset(0% 0% 0% 0%)' },
      defaults: { duration: 1.1, delay: 0, ease: 'power3.inOut' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: {
        mode: 'instant',
        from: {},
        to: { opacity: 1, clipPath: 'none', webkitClipPath: 'none' },
        defaults: { duration: 0.01, ease: 'none' },
      },
    }),
    define('editorial-reveal', {
      category: 'reveal',
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1.15, delay: 0, ease: 'power2.inOut' },
      scroll: true,
      stagger: 0.12,
      cleanup: CLEAN_TRANSFORM,
      responsive: RESPONSIVE_REVEAL,
      reducedMotion: INSTANT,
    }),
    define('luxury-reveal', {
      category: 'reveal',
      from: { opacity: 0, y: 24, scale: 0.98 },
      to: { opacity: 1, y: 0, scale: 1 },
      defaults: { duration: 1.35, delay: 0, ease: 'power1.out' },
      scroll: true,
      stagger: 0.14,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { y: 16, scale: 0.99 }, defaults: { duration: 1 } },
      },
      reducedMotion: INSTANT,
    }),
    define('minimal-reveal', {
      category: 'reveal',
      from: { opacity: 0 },
      to: { opacity: 1 },
      defaults: { duration: 0.7, delay: 0, ease: 'power1.out' },
      scroll: true,
      cleanup: { clearProps: 'opacity' },
      reducedMotion: INSTANT,
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Stagger Presets                                                            */
  /* -------------------------------------------------------------------------- */

  var STAGGER_PRESETS = [
    define('stagger-cards', {
      category: 'stagger',
      from: { opacity: 0, y: 36 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.85, delay: 0, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { stagger: 0.06, defaults: { duration: 0.7 } },
      },
      reducedMotion: INSTANT,
    }),
    define('stagger-grid', {
      category: 'stagger',
      from: { opacity: 0, y: 32, scale: 0.98 },
      to: { opacity: 1, y: 0, scale: 1 },
      defaults: { duration: 0.8, delay: 0, ease: 'power2.out' },
      stagger: { each: 0.08, from: 'start', grid: 'auto' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-gallery', {
      category: 'stagger',
      from: { opacity: 0, scale: 0.96 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.9, delay: 0, ease: 'power2.out' },
      stagger: 0.09,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-list', {
      category: 'stagger',
      from: { opacity: 0, x: -16 },
      to: { opacity: 1, x: 0 },
      defaults: { duration: 0.7, delay: 0, ease: 'power2.out' },
      stagger: 0.07,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { x: 0, y: 12 }, to: { x: 0, y: 0 } },
      },
      reducedMotion: INSTANT,
    }),
    define('stagger-text', {
      category: 'stagger',
      from: { opacity: 0, y: 18 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.65, delay: 0, ease: 'power2.out' },
      stagger: 0.045,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-features', {
      category: 'stagger',
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.85, delay: 0, ease: 'power3.out' },
      stagger: 0.12,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-testimonials', {
      category: 'stagger',
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1, delay: 0, ease: 'power2.out' },
      stagger: 0.14,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-logos', {
      category: 'stagger',
      from: { opacity: 0, scale: 0.92 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.6, delay: 0, ease: 'power1.out' },
      stagger: 0.05,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('stagger-stats', {
      category: 'stagger',
      from: { opacity: 0, y: 24 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.8, delay: 0, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Hover Presets (interaction metadata — no auto-binding)                     */
  /* -------------------------------------------------------------------------- */

  var HOVER_PRESETS = [
    define('hover-lift', {
      category: 'hover',
      interaction: 'hover',
      from: { y: 0 },
      to: { y: -8 },
      defaults: { duration: 0.35, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { y: 0 }, duration: 0.3 },
    }),
    define('hover-soft-lift', {
      category: 'hover',
      interaction: 'hover',
      from: { y: 0 },
      to: { y: -4 },
      defaults: { duration: 0.4, delay: 0, ease: 'power1.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { y: 0 } },
    }),
    define('hover-luxury-lift', {
      category: 'hover',
      interaction: 'hover',
      from: { y: 0, scale: 1 },
      to: { y: -6, scale: 1.01 },
      defaults: { duration: 0.55, delay: 0, ease: 'power1.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { y: 0, scale: 1 } },
    }),
    define('hover-glow', {
      category: 'hover',
      interaction: 'hover',
      from: { filter: 'brightness(1)' },
      to: { filter: 'brightness(1.08)' },
      defaults: { duration: 0.4, delay: 0, ease: 'power1.out' },
      scroll: false,
      cleanup: { clearProps: 'filter' },
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { filter: 'brightness(1)' } },
    }),
    define('hover-image-zoom', {
      category: 'hover',
      interaction: 'hover',
      from: { scale: 1 },
      to: { scale: 1.06 },
      defaults: { duration: 0.7, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { scale: 1 }, targetHint: 'img | picture | .media' },
    }),
    define('hover-image-pan', {
      category: 'hover',
      interaction: 'hover',
      from: { scale: 1.08, xPercent: 0 },
      to: { scale: 1.08, xPercent: -3 },
      defaults: { duration: 0.9, delay: 0, ease: 'power1.inOut' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { xPercent: 0 } },
    }),
    define('hover-border-draw', {
      category: 'hover',
      interaction: 'hover',
      from: { scaleX: 0 },
      to: { scaleX: 1 },
      defaults: { duration: 0.45, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: {
        reverse: { scaleX: 0 },
        transformOrigin: 'left center',
        targetHint: 'decorative border element',
      },
    }),
    define('hover-underline', {
      category: 'hover',
      interaction: 'hover',
      from: { scaleX: 0 },
      to: { scaleX: 1 },
      defaults: { duration: 0.35, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { scaleX: 0 }, transformOrigin: 'left center' },
    }),
    define('hover-button-fill', {
      category: 'hover',
      interaction: 'hover',
      from: { scaleX: 0 },
      to: { scaleX: 1 },
      defaults: { duration: 0.4, delay: 0, ease: 'power2.inOut' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: {
        reverse: { scaleX: 0 },
        transformOrigin: 'left center',
        targetHint: 'fill layer inside button',
      },
    }),
    define('hover-button-sweep', {
      category: 'hover',
      interaction: 'hover',
      from: { xPercent: -101 },
      to: { xPercent: 0 },
      defaults: { duration: 0.45, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { xPercent: -101 }, targetHint: 'sweep layer inside button' },
    }),
    define('hover-icon-slide', {
      category: 'hover',
      interaction: 'hover',
      from: { x: 0 },
      to: { x: 4 },
      defaults: { duration: 0.3, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { x: 0 } },
    }),
    define('hover-arrow', {
      category: 'hover',
      interaction: 'hover',
      from: { x: 0 },
      to: { x: 6 },
      defaults: { duration: 0.35, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { x: 0 } },
    }),
    define('hover-media', {
      category: 'hover',
      interaction: 'hover',
      from: { scale: 1, opacity: 1 },
      to: { scale: 1.04, opacity: 0.96 },
      defaults: { duration: 0.55, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { scale: 1, opacity: 1 } },
    }),
    define('hover-glass', {
      category: 'hover',
      interaction: 'hover',
      from: { backdropFilter: 'blur(0px)', opacity: 0.9 },
      to: { backdropFilter: 'blur(8px)', opacity: 1 },
      defaults: { duration: 0.4, delay: 0, ease: 'power1.out' },
      scroll: false,
      cleanup: { clearProps: 'opacity,backdropFilter' },
      reducedMotion: { mode: 'skip' },
      meta: { reverse: { backdropFilter: 'blur(0px)', opacity: 0.9 } },
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Scroll Presets                                                             */
  /* -------------------------------------------------------------------------- */

  var SCROLL_PRESETS = [
    define('scroll-parallax', {
      category: 'scroll',
      from: { yPercent: -12 },
      to: { yPercent: 12 },
      defaults: { ease: 'none', delay: 0 },
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { yPercent: -6 }, to: { yPercent: 6 } },
      },
      reducedMotion: { mode: 'skip' },
      meta: { scrub: true, start: 'top bottom', end: 'bottom top' },
    }),
    define('scroll-layered-parallax', {
      category: 'scroll',
      from: { yPercent: -8 },
      to: { yPercent: 16 },
      defaults: { ease: 'none', delay: 0 },
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: {
        scrub: true,
        layers: [
          { speed: 0.2 },
          { speed: 0.4 },
          { speed: 0.65 },
        ],
      },
    }),
    define('scroll-floating', {
      category: 'scroll',
      from: { y: -12 },
      to: { y: 12 },
      defaults: { duration: 4, delay: 0, ease: 'sine.inOut', repeat: -1, yoyo: true },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
    }),
    define('scroll-cue', {
      category: 'scroll',
      from: { y: 0 },
      to: { y: 8 },
      defaults: { duration: 1.2, delay: 0, ease: 'sine.inOut', repeat: -1, yoyo: true },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: {
        note: 'Gentle bounce for scroll indicators across Presentation Frameworks',
      },
    }),
    define('scroll-sticky-reveal', {
      category: 'scroll',
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1, delay: 0, ease: 'power2.out' },
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { pin: true, scrub: true, start: 'top top', end: '+=80%' },
    }),
    define('scroll-progress', {
      category: 'scroll',
      from: { scaleX: 0 },
      to: { scaleX: 1 },
      defaults: { ease: 'none', delay: 0 },
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: {
        scrub: true,
        transformOrigin: 'left center',
        start: 'top top',
        end: 'bottom bottom',
      },
    }),
    define('scroll-section-reveal', {
      category: 'scroll',
      from: { opacity: 0, y: 48 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1, delay: 0, ease: 'power3.out' },
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      responsive: RESPONSIVE_REVEAL,
      reducedMotion: INSTANT,
      meta: { start: 'top 80%', toggleActions: 'play none none none' },
    }),
    define('scroll-viewport-batch', {
      category: 'scroll',
      from: { opacity: 0, y: 32 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.8, delay: 0, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: {
        batch: true,
        start: 'top 85%',
        interval: 0.12,
        note: 'Prefer NetherMotion.scroll.batch() with this preset',
      },
    }),
    define('scroll-timeline-sequence', {
      category: 'scroll',
      from: { opacity: 0, y: 24 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.9, delay: 0, ease: 'power2.out' },
      stagger: 0.15,
      scroll: true,
      plugins: ['scrollTrigger'],
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: {
        timeline: true,
        note: 'Compose with NetherMotion.timeline() + scrubbed ScrollTrigger',
      },
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Text Presets                                                               */
  /* -------------------------------------------------------------------------- */

  var TEXT_PRESETS = [
    define('text-word-reveal', {
      category: 'text',
      from: { opacity: 0, y: '0.4em' },
      to: { opacity: 1, y: '0em' },
      defaults: { duration: 0.7, delay: 0, ease: 'power3.out' },
      stagger: 0.05,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { split: 'words', note: 'Requires split targets before animate()' },
    }),
    define('text-character-reveal', {
      category: 'text',
      from: { opacity: 0, y: '0.55em' },
      to: { opacity: 1, y: '0em' },
      defaults: { duration: 0.55, delay: 0, ease: 'power3.out' },
      stagger: 0.02,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { split: 'chars' },
    }),
    define('text-line-reveal', {
      category: 'text',
      from: { opacity: 0, y: '100%' },
      to: { opacity: 1, y: '0%' },
      defaults: { duration: 0.85, delay: 0, ease: 'power3.out' },
      stagger: 0.1,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { split: 'lines', overflowHidden: true },
    }),
    define('text-heading-reveal', {
      category: 'text',
      from: { opacity: 0, y: 32 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1, delay: 0, ease: 'power3.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('text-editorial', {
      category: 'text',
      from: { opacity: 0, y: 22 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1.15, delay: 0, ease: 'power2.inOut' },
      stagger: 0.08,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { split: 'lines' },
    }),
    define('text-luxury-heading', {
      category: 'text',
      from: { opacity: 0, y: 20, scale: 0.985 },
      to: { opacity: 1, y: 0, scale: 1 },
      defaults: { duration: 1.4, delay: 0, ease: 'power1.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('text-cta-reveal', {
      category: 'text',
      from: { opacity: 0, y: 16 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.75, delay: 0.1, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Media Presets                                                              */
  /* -------------------------------------------------------------------------- */

  var MEDIA_PRESETS = [
    define('media-image-reveal', {
      category: 'media',
      from: { opacity: 0, scale: 1.08 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 1.15, delay: 0, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
      meta: { overflowHidden: true },
    }),
    define('media-gallery-reveal', {
      category: 'media',
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.9, delay: 0, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('media-video-reveal', {
      category: 'media',
      from: { opacity: 0, scale: 1.04 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 1.1, delay: 0, ease: 'power2.out' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('media-ken-burns', {
      category: 'media',
      from: { scale: 1, xPercent: 0, yPercent: 0 },
      to: { scale: 1.12, xPercent: -2, yPercent: -1 },
      defaults: { duration: 12, delay: 0, ease: 'none' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { loopHint: 'optional yoyo or soft reset' },
    }),
    define('media-zoom', {
      category: 'media',
      from: { scale: 1 },
      to: { scale: 1.08 },
      defaults: { duration: 0.8, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
    }),
    define('media-pan', {
      category: 'media',
      from: { xPercent: 0 },
      to: { xPercent: -6 },
      defaults: { duration: 1.2, delay: 0, ease: 'power1.inOut' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
    }),
    define('media-before-after', {
      category: 'media',
      from: { clipPath: 'inset(0% 50% 0% 0%)', webkitClipPath: 'inset(0% 50% 0% 0%)' },
      to: { clipPath: 'inset(0% 0% 0% 0%)', webkitClipPath: 'inset(0% 0% 0% 0%)' },
      defaults: { duration: 1.2, delay: 0, ease: 'power2.inOut' },
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: {
        mode: 'instant',
        from: {},
        to: { clipPath: 'none', webkitClipPath: 'none' },
        defaults: { duration: 0.01, ease: 'none' },
      },
      meta: { note: 'Scrub-friendly comparison reveal' },
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Commerce Presets (metadata only — not auto-applied)                        */
  /* -------------------------------------------------------------------------- */

  var COMMERCE_PRESETS = [
    define('commerce-add-to-cart', {
      category: 'commerce',
      from: { scale: 1 },
      to: { scale: 0.96 },
      defaults: { duration: 0.12, delay: 0, ease: 'power2.out', yoyo: true, repeat: 1 },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
      meta: { interaction: 'click', feedback: 'press' },
    }),
    define('commerce-cart-drawer', {
      category: 'commerce',
      from: { xPercent: 100, opacity: 0.96 },
      to: { xPercent: 0, opacity: 1 },
      defaults: { duration: 0.45, delay: 0, ease: 'power3.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      responsive: {
        mobile: { from: { yPercent: 100, xPercent: 0 }, to: { yPercent: 0, xPercent: 0 } },
      },
      reducedMotion: INSTANT,
      meta: { reverse: { xPercent: 100, opacity: 0.96 } },
    }),
    define('commerce-wishlist', {
      category: 'commerce',
      from: { scale: 1 },
      to: { scale: 1.18 },
      defaults: { duration: 0.28, delay: 0, ease: 'back.out(2)', yoyo: true, repeat: 1 },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: { mode: 'skip' },
    }),
    define('commerce-compare', {
      category: 'commerce',
      from: { opacity: 0, y: 12 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.35, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-quick-view', {
      category: 'commerce',
      from: { opacity: 0, scale: 0.96 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.4, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-bundle', {
      category: 'commerce',
      from: { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.7, delay: 0, ease: 'power2.out' },
      stagger: 0.08,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-recommendation-cards', {
      category: 'commerce',
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.8, delay: 0, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-price-change', {
      category: 'commerce',
      from: { opacity: 0, y: 8 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.3, delay: 0, ease: 'power2.out' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-inventory-update', {
      category: 'commerce',
      from: { opacity: 0 },
      to: { opacity: 1 },
      defaults: { duration: 0.25, delay: 0, ease: 'power1.out' },
      scroll: false,
      cleanup: { clearProps: 'opacity' },
      reducedMotion: INSTANT,
    }),
    define('commerce-badge-reveal', {
      category: 'commerce',
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.4, delay: 0, ease: 'back.out(1.4)' },
      scroll: false,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
    define('commerce-trust-reveal', {
      category: 'commerce',
      from: { opacity: 0, y: 12 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.55, delay: 0, ease: 'power2.out' },
      stagger: 0.06,
      scroll: true,
      cleanup: CLEAN_TRANSFORM,
      reducedMotion: INSTANT,
    }),
  ];

  /* -------------------------------------------------------------------------- */
  /* Aggregate + register                                                        */
  /* -------------------------------------------------------------------------- */

  var ALL_PRESETS = []
    .concat(REVEAL_PRESETS)
    .concat(STAGGER_PRESETS)
    .concat(HOVER_PRESETS)
    .concat(SCROLL_PRESETS)
    .concat(TEXT_PRESETS)
    .concat(MEDIA_PRESETS)
    .concat(COMMERCE_PRESETS);

  var STYLE_MAP = {
    minimal: ['minimal-reveal', 'fade-up', 'stagger-logos', 'scroll-cue'],
    editorial: ['editorial-reveal', 'text-editorial', 'stagger-features', 'clip-reveal', 'scroll-cue'],
    luxury: [
      'luxury-reveal',
      'text-luxury-heading',
      'media-image-reveal',
      'hover-luxury-lift',
      'scroll-cue',
      'media-ken-burns',
    ],
    custom: ['scroll-cue'],
  };

  function registerLibrary(NM) {
    if (!NM || !NM.packs || typeof NM.packs.register !== 'function') {
      return false;
    }

    if (NM.packs.get && NM.packs.get(PACK_NAME)) {
      return true;
    }

    NM.packs.register(PACK_NAME, {
      name: PACK_NAME,
      version: LIBRARY_VERSION,
      presets: ALL_PRESETS,
      plugins: [],
      meta: {
        description: 'Nether Motion Preset Library — reusable metadata for all future animations',
        categories: ['reveal', 'stagger', 'hover', 'scroll', 'text', 'media', 'commerce'],
        count: ALL_PRESETS.length,
      },
      init: function (api) {
        if (api && api.presets && typeof api.presets.registerStyle === 'function') {
          Object.keys(STYLE_MAP).forEach(function (styleName) {
            var existing = api.presets.getStylePresets(styleName) || [];
            var merged = existing.slice();
            STYLE_MAP[styleName].forEach(function (presetName) {
              if (merged.indexOf(presetName) === -1) {
                merged.push(presetName);
              }
            });
            api.presets.registerStyle(styleName, merged);
          });
        }

        if (api && api.events && api.EVENT && typeof api.events.emit === 'function') {
          api.events.emit(api.EVENT.pack, {
            name: PACK_NAME,
            version: LIBRARY_VERSION,
            count: ALL_PRESETS.length,
          });
        }
      },
      destroy: null,
    });

    return true;
  }

  function boot() {
    var NM = window.NetherMotion;
    if (!NM) {
      // Engine not ready yet — retry once on next microtask / DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          registerLibrary(window.NetherMotion);
        });
      } else {
        setTimeout(function () {
          registerLibrary(window.NetherMotion);
        }, 0);
      }
      return;
    }
    registerLibrary(NM);
  }

  // Expose catalog for debugging / Theme Check tooling (read-only helpers)
  window.NetherMotionPresets = {
    VERSION: LIBRARY_VERSION,
    PACK: PACK_NAME,
    list: function () {
      return ALL_PRESETS.map(function (p) {
        return p.name;
      });
    },
    byCategory: function () {
      var map = {};
      ALL_PRESETS.forEach(function (p) {
        if (!map[p.category]) map[p.category] = [];
        map[p.category].push(p.name);
      });
      return map;
    },
    count: ALL_PRESETS.length,
  };

  boot();
})();
