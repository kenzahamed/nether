/**
 * custom-animations.js
 * Reusable GSAP utility classes for the Nether Motion system.
 *
 * Usage: add any fx-* class to an element in your Liquid/HTML markup.
 * Requires nether-motion.js (loaded first in theme.liquid).
 *
 * Optional data attributes:
 *   data-fx-delay="0.2"       — delay in seconds before animation starts
 *   data-fx-duration="1.2"      — override default duration
 *   data-fx-stagger="0.12"      — stagger interval for .fx-stagger-list children
 *   data-fx-reveal="words"      — split mode for .fx-text-reveal ("words" | "chars")
 *   data-fx-speed="0.4"         — parallax intensity for .fx-parallax (default 0.35)
 *   data-fx-duration="20"         — loop duration for .fx-marquee (default 20 seconds)
 */
(function () {
  const FX_SELECTOR =
    '.fx-fade-in, .fx-fade-up, .fx-fade-down, .fx-slide-left, .fx-slide-right, .fx-stagger-list, .fx-zoom-in, .fx-text-reveal, .fx-parallax, .fx-marquee';

  const FX_SCROLL_SELECTOR =
    '.fx-fade-in, .fx-fade-up, .fx-fade-down, .fx-slide-left, .fx-slide-right, .fx-stagger-list, .fx-zoom-in, .fx-text-reveal, .fx-parallax';

  const SCROLL_START = 'top 85%';
  const TOGGLE_ACTIONS = 'play none none none';
  const DEFAULT_DURATION = 1;
  const DEFAULT_EASE = 'power3.out';

  function hasFxElements(root) {
    return Boolean(root && root.querySelector(FX_SELECTOR));
  }

  function getFxPlugins(root) {
    if (root && root.querySelector(FX_SCROLL_SELECTOR)) {
      return ['scrollTrigger'];
    }

    return [];
  }

  function isInitialized(el) {
    return el.dataset.fxInit === 'true';
  }

  function markInitialized(el) {
    el.dataset.fxInit = 'true';
  }

  function getElementConfig(el) {
    return {
      delay: parseFloat(el.dataset.fxDelay) || 0,
      duration: parseFloat(el.dataset.fxDuration) || DEFAULT_DURATION,
    };
  }

  function revealInstantly(root) {
    if (!root || typeof gsap === 'undefined') return;

    root.querySelectorAll(
      '.fx-fade-in, .fx-fade-up, .fx-fade-down, .fx-slide-left, .fx-slide-right, .fx-zoom-in, .fx-text-reveal, .fx-stagger-list > *'
    ).forEach(function (el) {
      gsap.set(el, { clearProps: 'all', opacity: 1, x: 0, y: 0, scale: 1 });
      markInitialized(el);
    });
  }

  function scrollReveal(el, fromVars, toVars) {
    const config = getElementConfig(el);

    gsap.fromTo(el, fromVars, {
      ...toVars,
      duration: config.duration,
      delay: config.delay,
      ease: toVars.ease || DEFAULT_EASE,
      scrollTrigger: {
        trigger: el,
        start: SCROLL_START,
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  }

  function initTextReveal(el) {
    const originalText = el.textContent.trim();
    if (!originalText) return;

    const mode = el.dataset.fxReveal || 'words';
    el.setAttribute('aria-label', originalText);
    el.textContent = '';

    const wrapper = document.createElement('span');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.display = 'inline';

    const units =
      mode === 'chars'
        ? originalText.split('')
        : originalText.split(/(\s+)/).filter(function (part) {
            return part.length > 0;
          });

    const spans = units.map(function (unit) {
      const mask = document.createElement('span');
      mask.style.display = 'inline-block';
      mask.style.overflow = 'hidden';
      mask.style.verticalAlign = 'top';
      if (unit.trim() === '') mask.style.width = '0.25em';

      const inner = document.createElement('span');
      inner.textContent = unit;
      inner.style.display = 'inline-block';
      mask.appendChild(inner);
      wrapper.appendChild(mask);
      return inner;
    });

    el.appendChild(wrapper);

    gsap.set(spans, { opacity: 0, y: '100%' });

    const config = getElementConfig(el);
    const stagger = parseFloat(el.dataset.fxStagger) || (mode === 'chars' ? 0.03 : 0.08);

    gsap.to(spans, {
      opacity: 1,
      y: '0%',
      duration: config.duration * 0.9,
      delay: config.delay,
      ease: 'power3.out',
      stagger: stagger,
      scrollTrigger: {
        trigger: el,
        start: SCROLL_START,
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  }

  function prefersReducedMotionLocal() {
    if (window.NetherMotion && typeof window.NetherMotion.prefersReducedMotion === 'function') {
      return window.NetherMotion.prefersReducedMotion();
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMotionEnabled() {
    if (window.NetherMotion && typeof window.NetherMotion.isEnabled === 'function') {
      return window.NetherMotion.isEnabled();
    }

    return true;
  }

  function initFxAnimations(root) {
    if (!root || typeof gsap === 'undefined') return;
    if (!hasFxElements(root)) return;

    const needsScrollTrigger = Boolean(root.querySelector(FX_SCROLL_SELECTOR));
    if (needsScrollTrigger && typeof ScrollTrigger === 'undefined') return;

    if (needsScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!isMotionEnabled() || prefersReducedMotionLocal()) {
      revealInstantly(root);
      return;
    }

    root.querySelectorAll('.fx-fade-in').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0 });
      scrollReveal(el, { opacity: 0 }, { opacity: 1, ease: 'power2.out' });
    });

    root.querySelectorAll('.fx-fade-up').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0, y: 50 });
      scrollReveal(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0 });
    });

    root.querySelectorAll('.fx-fade-down').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0, y: -50 });
      scrollReveal(el, { opacity: 0, y: -50 }, { opacity: 1, y: 0 });
    });

    root.querySelectorAll('.fx-slide-left').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0, x: -80 });
      scrollReveal(el, { opacity: 0, x: -80 }, { opacity: 1, x: 0, ease: 'power3.out' });
    });

    root.querySelectorAll('.fx-slide-right').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0, x: 80 });
      scrollReveal(el, { opacity: 0, x: 80 }, { opacity: 1, x: 0, ease: 'power3.out' });
    });

    root.querySelectorAll('.fx-stagger-list').forEach(function (container) {
      if (isInitialized(container)) return;
      markInitialized(container);

      const children = gsap.utils.toArray(container.children);
      if (!children.length) return;

      const stagger = parseFloat(container.dataset.fxStagger) || 0.12;
      const config = getElementConfig(container);

      gsap.set(children, { opacity: 0, y: 40 });
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: config.duration,
        delay: config.delay,
        ease: 'power2.out',
        stagger: stagger,
        scrollTrigger: {
          trigger: container,
          start: SCROLL_START,
          toggleActions: TOGGLE_ACTIONS,
        },
      });
    });

    root.querySelectorAll('.fx-zoom-in').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      gsap.set(el, { opacity: 0, scale: 0.8 });
      scrollReveal(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, ease: 'power2.out' });
    });

    root.querySelectorAll('.fx-text-reveal').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);
      initTextReveal(el);
    });

    root.querySelectorAll('.fx-parallax').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);

      const target = el.querySelector('img') || el;
      const speed = parseFloat(el.dataset.fxSpeed) || 0.35;
      const yPercent = speed * 100;

      gsap.fromTo(
        target,
        { yPercent: -yPercent / 2 },
        {
          yPercent: yPercent / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });

    root.querySelectorAll('.fx-marquee').forEach(function (el) {
      if (isInitialized(el)) return;
      markInitialized(el);

      const track = el.querySelector('.fx-marquee__track');
      if (!track) return;

      const items = gsap.utils.toArray(track.children);
      if (!items.length) return;

      items.forEach(function (item) {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      const duration = parseFloat(el.dataset.fxDuration) || 20;

      gsap.set(el, { overflow: 'hidden' });
      gsap.set(track, { display: 'flex', width: 'max-content', flexWrap: 'nowrap', xPercent: 0 });

      gsap.to(track, {
        xPercent: -50,
        duration: duration,
        ease: 'none',
        repeat: -1,
      });
    });
  }

  function cleanupFxAnimations(sectionEl) {
    if (!sectionEl || typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(function (st) {
        if (st.trigger && sectionEl.contains(st.trigger)) {
          st.kill();
        }
      });
    }

    sectionEl.querySelectorAll('.fx-marquee__track').forEach(function (track) {
      gsap.killTweensOf(track);
    });

    sectionEl.querySelectorAll('[data-fx-init]').forEach(function (el) {
      delete el.dataset.fxInit;
      gsap.set(el, { clearProps: 'all' });
    });
  }

  function boot(root) {
    const scope = root || document;
    if (!hasFxElements(scope)) return;
    if (!window.NetherMotion || typeof window.NetherMotion.load !== 'function') return;

    window.NetherMotion.load(getFxPlugins(scope)).then(function () {
      initFxAnimations(scope);
    });
  }

  function onReady() {
    if (!window.NetherMotion || typeof window.NetherMotion.whenReady !== 'function') return;

    window.NetherMotion.whenReady(function (ready) {
      if (!ready) return;
      initFxAnimations(document);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (event) {
      boot(event.target);
    });

    document.addEventListener('shopify:section:unload', function (event) {
      cleanupFxAnimations(event.target);
    });
  }

  window.NetherMotion = window.NetherMotion || {};
  window.NetherMotion.Fx = {
    init: initFxAnimations,
    cleanup: cleanupFxAnimations,
    hasElements: hasFxElements,
    boot: boot,
  };
})();
