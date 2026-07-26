/**
 * nether-motion.js
 * Nether Motion Engine 2.0 — reusable motion architecture for the Nether Framework.
 *
 * Single source of truth for GSAP loading, registries, presets, timelines,
 * ScrollTrigger orchestration, accessibility, and lifecycle management.
 *
 * Backward-compatible with Nether Motion 1.x:
 *   load, needsMotion, getRequiredPlugins, prefersReducedMotion, whenReady,
 *   registerSection, unregisterSection, VERSION (GSAP version string)
 *
 * Motion Engine 2.0 API:
 *   register, animate, timeline, hover, createPreset, destroy, refresh, observe
 *
 * Future Motion Library features should register via NetherMotion.register()
 * / NetherMotion.registerSection() and load plugins through NetherMotion.load().
 *
 * Preset Library (nether-motion-presets.js) registers via NetherMotion.packs
 * as pack "preset-library" — metadata only; no section auto-binding.
 */
(function () {
  'use strict';

  /* -------------------------------------------------------------------------- */
  /* Constants                                                                  */
  /* -------------------------------------------------------------------------- */

  const ENGINE_VERSION = '2.0.0';
  const GSAP_VERSION = '3.12.7';
  const CDN_BASE = 'https://cdn.jsdelivr.net/npm/gsap@' + GSAP_VERSION + '/dist';

  const PLUGIN_URLS = {
    scrollTrigger: CDN_BASE + '/ScrollTrigger.min.js',
    flip: CDN_BASE + '/Flip.min.js',
    observer: CDN_BASE + '/Observer.min.js',
  };

  const PLUGIN_GLOBALS = {
    scrollTrigger: 'ScrollTrigger',
    flip: 'Flip',
    observer: 'Observer',
  };

  const CORE_MARKER = 'data-nether-gsap-core';

  const FX_SCROLL_SELECTORS =
    '.fx-fade-in, .fx-fade-up, .fx-fade-down, .fx-slide-left, .fx-slide-right, .fx-stagger-list, .fx-zoom-in, .fx-text-reveal, .fx-parallax';

  const FX_ALL_SELECTORS = FX_SCROLL_SELECTORS + ', .fx-marquee';

  const SECTION_SELECTORS =
    'nether-hero, nether-banner, nether-collection, nether-product, nether-product-page, nether-collection-page, nether-cart-page, nether-cart-drawer, nether-wishlist-page, nether-wishlist-drawer, nether-compare-page, nether-compare-drawer, nether-quick-view, nether-recommendations, nether-bundles, nether-commerce, nether-content, nether-media, nether-testimonials, nether-faq, nether-newsletter, nether-cta, .section-canvas-scroll-scrub, .section-gsap-caterpillar-slider, .section-animated-continuous, .section-marquee-banner, [data-nether-motion]';

  const DEFAULT_SETTINGS = {
    enabled: true,
    style: 'minimal',
    intensity: 50,
    speed: 100,
    respectReducedMotion: true,
    forceReducedMotion: false,
    mobile: true,
    desktop: true,
  };

  const INTENSITY_SCALE = {
    // Maps intensity 0–100 → visual distance multiplier
    distance: function (intensity) {
      return Math.max(0, Math.min(intensity, 100)) / 50;
    },
  };

  const SPEED_SCALE = {
    // Maps speed 50–150 → duration multiplier (higher = faster → shorter)
    duration: function (speed) {
      const value = Math.max(50, Math.min(speed, 150));
      return 100 / value;
    },
  };

  /**
   * Canonical Nether viewport contract (CSS + Motion parity).
   * CSS media queries use the same boundaries:
   *   Mobile  …… max-width: 749px
   *   Tablet  …… min-width: 750px and max-width: 989px
   *   Desktop …… min-width: 990px
   */
  const BREAKPOINTS = {
    mobileMax: 749,
    tabletMin: 750,
    tabletMax: 989,
    desktopMin: 990,
    queries: {
      mobile: '(max-width: 749px)',
      tablet: '(min-width: 750px) and (max-width: 989px)',
      desktop: '(min-width: 990px)',
      tabletUp: '(min-width: 750px)',
      mobileAndTablet: '(max-width: 989px)',
    },
  };

  const EVENT_NAMES = {
    ready: 'nether:motion:ready',
    refresh: 'nether:motion:refresh',
    destroy: 'nether:motion:destroy',
    reduced: 'nether:motion:reduced',
    pack: 'nether:motion:pack',
    register: 'nether:motion:register',
  };

  const loadPromises = {};

  /* -------------------------------------------------------------------------- */
  /* Utils                                                                      */
  /* -------------------------------------------------------------------------- */

  const Utils = {
    isFunction: function (value) {
      return typeof value === 'function';
    },

    isString: function (value) {
      return typeof value === 'string';
    },

    toArray: function (value) {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof NodeList !== 'undefined' && value instanceof NodeList) {
        return Array.prototype.slice.call(value);
      }
      if (typeof value === 'string') {
        return Array.prototype.slice.call(document.querySelectorAll(value));
      }
      return [value];
    },

    deepMerge: function (target, source) {
      const output = Object.assign({}, target);
      if (!source) return output;

      Object.keys(source).forEach(function (key) {
        const value = source[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          output[key] = Utils.deepMerge(output[key] || {}, value);
        } else {
          output[key] = value;
        }
      });

      return output;
    },

    uid: function (prefix) {
      return (prefix || 'nm') + '-' + Math.random().toString(36).slice(2, 10);
    },

    /**
     * GPU-friendly transform helpers — prefer x/y/scale/rotate/opacity.
     */
    sanitizeVars: function (vars) {
      if (!vars || typeof vars !== 'object') return vars;
      const cleaned = Object.assign({}, vars);
      // Discourage layout-thrashing props without blocking intentional use
      return cleaned;
    },

    resolveTargets: function (targets) {
      if (typeof targets === 'string') {
        return document.querySelectorAll(targets);
      }
      return targets;
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Motion Events                                                              */
  /* -------------------------------------------------------------------------- */

  const Events = {
    emit: function (name, detail) {
      document.dispatchEvent(
        new CustomEvent(name, {
          detail: detail || {},
          bubbles: true,
        })
      );
    },

    on: function (name, handler, options) {
      document.addEventListener(name, handler, options || false);
      return function () {
        document.removeEventListener(name, handler, options || false);
      };
    },

    once: function (name, handler) {
      return Events.on(name, handler, { once: true });
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Settings / Theme Editor bridge                                             */
  /* -------------------------------------------------------------------------- */

  const Settings = {
    cache: null,

    readConfig: function () {
      if (Settings.cache) return Settings.cache;

      var config = Object.assign({}, DEFAULT_SETTINGS);
      var node = document.getElementById('nether-motion-config');

      if (node) {
        try {
          var parsed = JSON.parse(node.textContent || '{}');
          config = Utils.deepMerge(config, parsed);
        } catch (error) {
          // Invalid JSON — keep defaults
        }
      }

      if (window.NetherMotionConfig && typeof window.NetherMotionConfig === 'object') {
        config = Utils.deepMerge(config, window.NetherMotionConfig);
      }

      Settings.cache = config;
      return config;
    },

    get: function (key) {
      var config = Settings.readConfig();
      if (typeof key === 'undefined') return Object.assign({}, config);
      return config[key];
    },

    invalidate: function () {
      Settings.cache = null;
    },

    intensityMultiplier: function () {
      return INTENSITY_SCALE.distance(Settings.get('intensity'));
    },

    speedMultiplier: function () {
      return SPEED_SCALE.duration(Settings.get('speed'));
    },

    scaleDuration: function (duration) {
      var base = typeof duration === 'number' ? duration : 1;
      return base * Settings.speedMultiplier();
    },

    scaleDistance: function (value) {
      var base = typeof value === 'number' ? value : 0;
      return base * Settings.intensityMultiplier();
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Breakpoint-aware Motion                                                    */
  /* -------------------------------------------------------------------------- */

  const Breakpoints = {
    getWidth: function () {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    },

    isMobile: function () {
      return Breakpoints.getWidth() <= BREAKPOINTS.mobileMax;
    },

    isTablet: function () {
      var width = Breakpoints.getWidth();
      return width > BREAKPOINTS.mobileMax && width <= BREAKPOINTS.tabletMax;
    },

    isDesktop: function () {
      /* Tablet + desktop — used by motion mobile/desktop merchant flags. */
      return Breakpoints.getWidth() > BREAKPOINTS.mobileMax;
    },

    isDesktopOnly: function () {
      return Breakpoints.getWidth() >= BREAKPOINTS.desktopMin;
    },

    query: function (name) {
      return (BREAKPOINTS.queries && BREAKPOINTS.queries[name]) || name;
    },

    /**
     * Whether motion is allowed for the current viewport based on merchant settings.
     */
    allowsMotion: function () {
      var settings = Settings.readConfig();
      if (Breakpoints.isMobile()) {
        return settings.mobile !== false;
      }
      return settings.desktop !== false;
    },

    match: function (query) {
      return window.matchMedia(query).matches;
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Reduced Motion Manager                                                     */
  /* -------------------------------------------------------------------------- */

  const ReducedMotion = {
    mediaQuery: null,
    listeners: [],

    init: function () {
      if (ReducedMotion.mediaQuery) return;
      ReducedMotion.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      var onChange = function () {
        Events.emit(EVENT_NAMES.reduced, {
          reduced: ReducedMotion.prefers(),
        });
      };

      if (Utils.isFunction(ReducedMotion.mediaQuery.addEventListener)) {
        ReducedMotion.mediaQuery.addEventListener('change', onChange);
      } else if (Utils.isFunction(ReducedMotion.mediaQuery.addListener)) {
        ReducedMotion.mediaQuery.addListener(onChange);
      }
    },

    systemPrefers: function () {
      ReducedMotion.init();
      return ReducedMotion.mediaQuery.matches;
    },

    /**
     * True when motion should be reduced or disabled for accessibility / merchant control.
     */
    prefers: function () {
      var settings = Settings.readConfig();

      if (settings.forceReducedMotion) return true;
      if (settings.respectReducedMotion !== false && ReducedMotion.systemPrefers()) return true;
      if (!Breakpoints.allowsMotion()) return true;

      return false;
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Plugin Registration & Motion Loader                                        */
  /* -------------------------------------------------------------------------- */

  const Plugins = {
    registered: new Set(),
    customUrls: {},

    /**
     * Register a custom / future GSAP plugin URL for on-demand loading.
     * NetherMotion.plugins.register('customEase', 'https://…/CustomEase.min.js', 'CustomEase');
     */
    register: function (key, url, globalName) {
      if (!key || !url) return false;
      Plugins.customUrls[key] = { url: url, globalName: globalName || key };
      PLUGIN_URLS[key] = url;
      if (globalName) PLUGIN_GLOBALS[key] = globalName;
      return true;
    },

    isLoaded: function (key) {
      if (key === 'core') return typeof gsap !== 'undefined';
      var globalName = PLUGIN_GLOBALS[key];
      return Boolean(globalName && window[globalName]);
    },

    ensureRegistered: function (pluginKey) {
      if (typeof gsap === 'undefined') return;

      var globalName = PLUGIN_GLOBALS[pluginKey];
      var plugin = globalName ? window[globalName] : null;

      if (plugin) {
        gsap.registerPlugin(plugin);
        Plugins.registered.add(pluginKey);
      }
    },
  };

  function loadScript(src, marker) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[' + marker + ']');

      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }

        existing.addEventListener('load', function () {
          resolve();
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.setAttribute(marker, 'true');
      script.onload = function () {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadCore() {
    if (!loadPromises.core) {
      loadPromises.core = loadScript(CDN_BASE + '/gsap.min.js', CORE_MARKER);
    }
    return loadPromises.core;
  }

  function normalizePlugins(plugins) {
    if (!plugins || !plugins.length) return [];

    return plugins
      .map(function (name) {
        return String(name).trim();
      })
      .filter(function (name) {
        return name && PLUGIN_URLS[name];
      });
  }

  function load(plugins) {
    var normalized = normalizePlugins(plugins);

    return loadCore().then(function () {
      if (!normalized.length) return true;

      return Promise.all(
        normalized.map(function (pluginKey) {
          if (!loadPromises[pluginKey]) {
            var marker = 'data-nether-gsap-' + pluginKey;
            loadPromises[pluginKey] = loadScript(PLUGIN_URLS[pluginKey], marker).then(function () {
              Plugins.ensureRegistered(pluginKey);
            });
          }
          return loadPromises[pluginKey];
        })
      ).then(function () {
        return true;
      });
    });
  }

  function parsePluginsAttribute(element) {
    if (!element || !element.dataset.netherMotionPlugins) return [];

    return element.dataset.netherMotionPlugins.split(',').map(function (value) {
      return value.trim();
    });
  }

  function getRequiredPlugins(root) {
    var scope = root || document;
    var plugins = new Set();

    if (scope.querySelector(FX_SCROLL_SELECTORS)) {
      plugins.add('scrollTrigger');
    }

    if (
      scope.querySelector('.section-canvas-scroll-scrub') ||
      scope.querySelector('[data-nether-motion-plugins*="scrollTrigger"]')
    ) {
      plugins.add('scrollTrigger');
    }

    if (
      scope.querySelector('.section-gsap-caterpillar-slider') ||
      scope.querySelector('[data-nether-motion-plugins*="flip"]')
    ) {
      plugins.add('flip');
    }

    if (
      scope.querySelector('.section-animated-continuous') ||
      scope.querySelector('[data-nether-motion-plugins*="observer"]')
    ) {
      plugins.add('observer');
    }

    scope.querySelectorAll('[data-nether-motion-plugins]').forEach(function (element) {
      parsePluginsAttribute(element).forEach(function (plugin) {
        if (PLUGIN_URLS[plugin]) {
          plugins.add(plugin);
        }
      });
    });

    return Array.from(plugins);
  }

  function needsMotion(root) {
    var scope = root || document;
    return scope.querySelector(FX_ALL_SELECTORS) !== null || scope.querySelector(SECTION_SELECTORS) !== null;
  }

  function prefersReducedMotion() {
    return ReducedMotion.prefers();
  }

  function isEnabled() {
    return Settings.get('enabled') !== false;
  }

  /**
   * Motion is active when merchant-enabled and not reduced for a11y/viewport.
   */
  function isActive() {
    return isEnabled() && !prefersReducedMotion();
  }

  /* -------------------------------------------------------------------------- */
  /* Animation Registry                                                         */
  /* -------------------------------------------------------------------------- */

  const AnimationRegistry = {
    entries: new Map(),

    add: function (id, instance, meta) {
      var key = String(id || Utils.uid('anim'));
      AnimationRegistry.entries.set(key, {
        id: key,
        instance: instance,
        meta: meta || {},
        createdAt: Date.now(),
      });
      return key;
    },

    get: function (id) {
      return AnimationRegistry.entries.get(String(id)) || null;
    },

    has: function (id) {
      return AnimationRegistry.entries.has(String(id));
    },

    remove: function (id) {
      return AnimationRegistry.entries.delete(String(id));
    },

    all: function () {
      return Array.from(AnimationRegistry.entries.values());
    },

    kill: function (id) {
      var entry = AnimationRegistry.get(id);
      if (!entry) return false;

      if (entry.instance && Utils.isFunction(entry.instance.kill)) {
        entry.instance.kill();
      }

      AnimationRegistry.remove(id);
      return true;
    },

    killAll: function (filterFn) {
      AnimationRegistry.all().forEach(function (entry) {
        if (filterFn && !filterFn(entry)) return;
        AnimationRegistry.kill(entry.id);
      });
    },

    killWithin: function (root) {
      if (!root) return;

      AnimationRegistry.all().forEach(function (entry) {
        var targets = entry.meta && entry.meta.targets;
        var scoped = false;

        if (entry.meta && entry.meta.scope && root.contains(entry.meta.scope)) {
          scoped = true;
        }

        if (!scoped && targets) {
          Utils.toArray(targets).forEach(function (target) {
            if (target && root.contains(target)) scoped = true;
          });
        }

        if (scoped) AnimationRegistry.kill(entry.id);
      });
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Timeline Manager                                                           */
  /* -------------------------------------------------------------------------- */

  const TimelineManager = {
    entries: new Map(),

    create: function (options) {
      options = options || {};

      if (typeof gsap === 'undefined') {
        return null;
      }

      var defaults = {
        paused: options.paused === true,
        defaults: options.defaults || {},
      };

      var tl = gsap.timeline(Utils.deepMerge(defaults, options.gsap || {}));
      var id = options.id || Utils.uid('tl');

      TimelineManager.entries.set(String(id), {
        id: String(id),
        timeline: tl,
        meta: options.meta || {},
        createdAt: Date.now(),
      });

      AnimationRegistry.add(id, tl, {
        type: 'timeline',
        scope: options.scope || null,
        targets: options.targets || null,
      });

      return tl;
    },

    get: function (id) {
      var entry = TimelineManager.entries.get(String(id));
      return entry ? entry.timeline : null;
    },

    kill: function (id) {
      var entry = TimelineManager.entries.get(String(id));
      if (!entry) return false;

      if (entry.timeline && Utils.isFunction(entry.timeline.kill)) {
        entry.timeline.kill();
      }

      TimelineManager.entries.delete(String(id));
      AnimationRegistry.remove(id);
      return true;
    },

    killWithin: function (root) {
      if (!root) return;

      TimelineManager.entries.forEach(function (entry, id) {
        if (entry.meta && entry.meta.scope && root.contains(entry.meta.scope)) {
          TimelineManager.kill(id);
        }
      });
    },

    batch: function (factories, options) {
      options = options || {};
      var master = TimelineManager.create({
        id: options.id,
        paused: options.paused,
        scope: options.scope,
        meta: { batch: true },
      });

      if (!master || !Array.isArray(factories)) return master;

      factories.forEach(function (factory) {
        if (!Utils.isFunction(factory)) return;
        var child = factory(master);
        if (child && child !== master && Utils.isFunction(child.kill)) {
          // Child timelines created via factory are left to the caller / master ownership
        }
      });

      return master;
    },
  };

  /* -------------------------------------------------------------------------- */
  /* ScrollTrigger Manager                                                      */
  /* -------------------------------------------------------------------------- */

  const ScrollManager = {
    triggers: new Map(),

    ensurePlugin: function () {
      return load(['scrollTrigger']).then(function () {
        if (typeof ScrollTrigger !== 'undefined') {
          Plugins.ensureRegistered('scrollTrigger');
        }
        return typeof ScrollTrigger !== 'undefined';
      });
    },

    create: function (vars) {
      if (typeof ScrollTrigger === 'undefined') return null;

      var config = vars || {};
      var id = config.id || Utils.uid('st');
      var trigger = ScrollTrigger.create(config);

      ScrollManager.triggers.set(String(id), {
        id: String(id),
        trigger: trigger,
        vars: config,
      });

      AnimationRegistry.add(id, trigger, {
        type: 'scrollTrigger',
        scope: config.trigger || null,
        targets: config.trigger || null,
      });

      return trigger;
    },

    batch: function (targets, vars) {
      if (typeof ScrollTrigger === 'undefined') return null;
      return ScrollTrigger.batch(targets, vars || {});
    },

    refresh: function (safe) {
      if (typeof ScrollTrigger === 'undefined') return;
      ScrollTrigger.refresh(safe === true);
      Events.emit(EVENT_NAMES.refresh, { source: 'scrollTrigger' });
    },

    kill: function (id) {
      var entry = ScrollManager.triggers.get(String(id));
      if (!entry) return false;

      if (entry.trigger && Utils.isFunction(entry.trigger.kill)) {
        entry.trigger.kill();
      }

      ScrollManager.triggers.delete(String(id));
      AnimationRegistry.remove(id);
      return true;
    },

    killWithin: function (root) {
      if (!root || typeof ScrollTrigger === 'undefined') return;

      ScrollTrigger.getAll().forEach(function (st) {
        if (st.trigger && root.contains(st.trigger)) {
          st.kill();
        }
      });

      ScrollManager.triggers.forEach(function (entry, id) {
        var triggerEl = entry.vars && entry.vars.trigger;
        if (triggerEl && root.contains(triggerEl)) {
          ScrollManager.triggers.delete(id);
          AnimationRegistry.remove(id);
        }
      });
    },

    /**
     * Architecture helpers — do not auto-bind to existing sections.
     * Consumers opt in: NetherMotion.scroll.reveal(el, opts)
     */
    reveal: function (targets, options) {
      options = options || {};
      if (!isActive() || typeof gsap === 'undefined') return null;

      var elements = Utils.resolveTargets(targets);
      var from = options.from || { opacity: 0, y: Settings.scaleDistance(40) };
      var to = Utils.deepMerge(
        {
          opacity: 1,
          y: 0,
          duration: Settings.scaleDuration(options.duration || 1),
          ease: options.ease || 'power3.out',
          stagger: options.stagger,
          scrollTrigger: {
            trigger: options.trigger || (elements && elements[0]),
            start: options.start || 'top 85%',
            toggleActions: options.toggleActions || 'play none none none',
          },
        },
        options.to || {}
      );

      var tween = gsap.fromTo(elements, Utils.sanitizeVars(from), Utils.sanitizeVars(to));
      var id = options.id || Utils.uid('reveal');
      AnimationRegistry.add(id, tween, {
        type: 'reveal',
        targets: elements,
        scope: options.scope || null,
      });
      return tween;
    },

    parallax: function (targets, options) {
      options = options || {};
      if (!isActive() || typeof gsap === 'undefined') return null;

      var elements = Utils.resolveTargets(targets);
      var speed = typeof options.speed === 'number' ? options.speed : 0.35;
      var distance = Settings.scaleDistance(speed * 100);

      var tween = gsap.fromTo(
        elements,
        { yPercent: -distance / 2 },
        {
          yPercent: distance / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: options.trigger || (elements && elements[0]),
            start: options.start || 'top bottom',
            end: options.end || 'bottom top',
            scrub: options.scrub !== undefined ? options.scrub : true,
          },
        }
      );

      var id = options.id || Utils.uid('parallax');
      AnimationRegistry.add(id, tween, {
        type: 'parallax',
        targets: elements,
        scope: options.scope || null,
      });
      return tween;
    },

    sticky: function (targets, options) {
      options = options || {};
      return ScrollManager.ensurePlugin().then(function (ready) {
        if (!ready || !isActive()) return null;

        return ScrollManager.create(
          Utils.deepMerge(
            {
              trigger: Utils.resolveTargets(targets)[0],
              start: options.start || 'top top',
              end: options.end || 'bottom top',
              pin: options.pin !== false,
              scrub: options.scrub,
              anticipatePin: options.anticipatePin || 1,
            },
            options.vars || {}
          )
        );
      });
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Intersection Observer Manager                                              */
  /* -------------------------------------------------------------------------- */

  const IOManager = {
    observers: new Map(),

    observe: function (targets, options) {
      options = options || {};
      var elements = Utils.toArray(Utils.resolveTargets(targets));
      if (!elements.length || typeof IntersectionObserver === 'undefined') {
        return { id: null, disconnect: function () {} };
      }

      var id = options.id || Utils.uid('io');
      var once = options.once !== false;

      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              if (Utils.isFunction(options.onExit)) options.onExit(entry, obs);
              return;
            }

            if (Utils.isFunction(options.onEnter)) options.onEnter(entry, obs);
            if (Utils.isFunction(options.callback)) options.callback(entry, obs);

            if (once) {
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: options.root || null,
          rootMargin: options.rootMargin || '0px 0px -10% 0px',
          threshold: options.threshold !== undefined ? options.threshold : 0.15,
        }
      );

      elements.forEach(function (el) {
        observer.observe(el);
      });

      IOManager.observers.set(String(id), {
        id: String(id),
        observer: observer,
        elements: elements,
      });

      return {
        id: id,
        observer: observer,
        disconnect: function () {
          IOManager.disconnect(id);
        },
      };
    },

    disconnect: function (id) {
      var entry = IOManager.observers.get(String(id));
      if (!entry) return false;
      entry.observer.disconnect();
      IOManager.observers.delete(String(id));
      return true;
    },

    disconnectAll: function () {
      IOManager.observers.forEach(function (entry) {
        entry.observer.disconnect();
      });
      IOManager.observers.clear();
    },

    disconnectWithin: function (root) {
      if (!root) return;

      IOManager.observers.forEach(function (entry, id) {
        var overlaps = entry.elements.some(function (el) {
          return root.contains(el);
        });
        if (overlaps) IOManager.disconnect(id);
      });
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Hover Manager (preset-driven pointer / focus interactions)                 */
  /* -------------------------------------------------------------------------- */

  const HoverManager = {
    entries: new Map(),

    /**
     * Bind hover presets to targets. Definitions are interaction metadata —
     * this wires pointerenter/leave (+ optional focus) without section-local GSAP.
     */
    bind: function (targets, presetOrVars, options) {
      options = options || {};

      if (!isEnabled()) {
        return { id: null, destroy: function () {} };
      }

      if (prefersReducedMotion() && options.respectReducedMotion !== false) {
        return { id: null, destroy: function () {} };
      }

      if (typeof gsap === 'undefined') {
        return { id: null, destroy: function () {} };
      }

      var elements = Utils.toArray(Utils.resolveTargets(targets)).filter(Boolean);
      if (!elements.length) {
        return { id: null, destroy: function () {} };
      }

      var isPreset =
        Utils.isString(presetOrVars) ||
        (presetOrVars && presetOrVars.name && (presetOrVars.from || presetOrVars.to));

      var resolved = isPreset
        ? PresetRegistry.resolve(presetOrVars, options.preset || {})
        : Utils.deepMerge(
            {
              from: options.from || {},
              to: presetOrVars || {},
              defaults: { duration: 0.4, ease: 'power2.out' },
              meta: { reverse: options.reverse || options.from || {} },
            },
            {}
          );

      if (!resolved) {
        return { id: null, destroy: function () {} };
      }

      if (resolved.reducedMotion && resolved.reducedMotion.mode === 'skip' && prefersReducedMotion()) {
        return { id: null, destroy: function () {} };
      }

      var enterVars = Utils.sanitizeVars(
        Utils.deepMerge(resolved.defaults || {}, resolved.to || {})
      );
      delete enterVars.stagger;
      delete enterVars.scrollTrigger;
      delete enterVars.repeat;
      delete enterVars.yoyo;

      var reverseBase =
        (resolved.meta && resolved.meta.reverse) || resolved.from || {};
      var leaveVars = Utils.sanitizeVars(
        Utils.deepMerge(resolved.defaults || {}, reverseBase)
      );
      if (resolved.meta && typeof resolved.meta.duration === 'number') {
        leaveVars.duration = Settings.scaleDuration(resolved.meta.duration);
      }
      delete leaveVars.stagger;
      delete leaveVars.scrollTrigger;

      if (resolved.meta && resolved.meta.transformOrigin) {
        enterVars.transformOrigin = resolved.meta.transformOrigin;
        leaveVars.transformOrigin = resolved.meta.transformOrigin;
      }

      var id = options.id || Utils.uid('hover');
      var cleanups = [];

      elements.forEach(function (el) {
        var activeTween = null;

        var onEnter = function () {
          if (activeTween && Utils.isFunction(activeTween.kill)) activeTween.kill();
          activeTween = gsap.to(el, enterVars);
        };

        var onLeave = function () {
          if (activeTween && Utils.isFunction(activeTween.kill)) activeTween.kill();
          activeTween = gsap.to(el, leaveVars);
        };

        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointerleave', onLeave);

        if (options.focus !== false) {
          el.addEventListener('focusin', onEnter);
          el.addEventListener('focusout', onLeave);
        }

        cleanups.push(function () {
          el.removeEventListener('pointerenter', onEnter);
          el.removeEventListener('pointerleave', onLeave);
          if (options.focus !== false) {
            el.removeEventListener('focusin', onEnter);
            el.removeEventListener('focusout', onLeave);
          }
          if (activeTween && Utils.isFunction(activeTween.kill)) activeTween.kill();
        });
      });

      HoverManager.entries.set(String(id), {
        id: String(id),
        elements: elements,
        scope: options.scope || null,
        destroy: function () {
          cleanups.forEach(function (fn) {
            fn();
          });
          HoverManager.entries.delete(String(id));
        },
      });

      return {
        id: id,
        destroy: function () {
          var entry = HoverManager.entries.get(String(id));
          if (entry && Utils.isFunction(entry.destroy)) entry.destroy();
        },
      };
    },

    destroy: function (id) {
      var entry = HoverManager.entries.get(String(id));
      if (!entry) return false;
      entry.destroy();
      return true;
    },

    destroyWithin: function (root) {
      if (!root) return;

      HoverManager.entries.forEach(function (entry, id) {
        var scoped = entry.scope && (entry.scope === root || root.contains(entry.scope));
        var overlaps =
          !scoped &&
          entry.elements.some(function (el) {
            return el === root || root.contains(el);
          });

        if (scoped || overlaps) {
          entry.destroy();
          HoverManager.entries.delete(id);
        }
      });
    },

    destroyAll: function () {
      HoverManager.entries.forEach(function (entry) {
        entry.destroy();
      });
      HoverManager.entries.clear();
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Preset Registry                                                            */
  /* -------------------------------------------------------------------------- */

  const PresetRegistry = {
    presets: new Map(),
    styles: new Map(),
    categories: new Map(),

    /**
     * Register or replace a reusable preset definition.
     * Presets are data-only until applied via animate() / createPreset wrappers.
     *
     * Supported metadata (library contract):
     *   duration/delay/ease → defaults
     *   from/to → opacity, scale, rotation, x/y (distance), transforms
     *   direction, distance, stagger, cleanup, scroll, plugins
     *   responsive → { mobile|tablet|desktop: partial preset }
     *   reducedMotion → 'skip' | 'instant' | { from, to, defaults, mode }
     */
    create: function (name, definition) {
      if (!name) return null;

      var preset = Utils.deepMerge(
        {
          name: name,
          category: 'custom',
          plugins: [],
          from: {},
          to: {},
          defaults: {
            duration: 1,
            delay: 0,
            ease: 'power3.out',
          },
          scroll: false,
          stagger: null,
          direction: null,
          distance: null,
          interaction: null,
          cleanup: {
            clearProps: 'opacity,transform,filter,clipPath,webkitClipPath',
          },
          responsive: null,
          reducedMotion: {
            mode: 'instant',
            from: { opacity: 0 },
            to: { opacity: 1 },
            defaults: { duration: 0.01, ease: 'none' },
          },
        },
        definition || {}
      );

      // Allow legacy string reducedMotion values from early seed presets
      if (typeof preset.reducedMotion === 'string') {
        preset.reducedMotion = {
          mode: preset.reducedMotion,
          from: { opacity: 0 },
          to: { opacity: 1 },
          defaults: { duration: 0.01, ease: 'none' },
        };
      }

      PresetRegistry.presets.set(String(name), preset);

      var category = preset.category || 'custom';
      if (!PresetRegistry.categories.has(category)) {
        PresetRegistry.categories.set(category, []);
      }
      var names = PresetRegistry.categories.get(category);
      if (names.indexOf(String(name)) === -1) {
        names.push(String(name));
      }

      return preset;
    },

    get: function (name) {
      return PresetRegistry.presets.get(String(name)) || null;
    },

    has: function (name) {
      return PresetRegistry.presets.has(String(name));
    },

    list: function (category) {
      var all = Array.from(PresetRegistry.presets.values());
      if (!category) return all;
      return all.filter(function (preset) {
        return preset.category === category;
      });
    },

    listCategories: function () {
      return Array.from(PresetRegistry.categories.keys());
    },

    listByCategory: function () {
      var result = {};
      PresetRegistry.categories.forEach(function (names, category) {
        result[category] = names.slice();
      });
      return result;
    },

    remove: function (name) {
      var preset = PresetRegistry.get(name);
      if (preset) {
        var names = PresetRegistry.categories.get(preset.category);
        if (names) {
          PresetRegistry.categories.set(
            preset.category,
            names.filter(function (n) {
              return n !== String(name);
            })
          );
        }
      }
      return PresetRegistry.presets.delete(String(name));
    },

    /**
     * Style packs group presets (minimal, editorial, luxury) without changing architecture.
     */
    registerStyle: function (styleName, presetNames) {
      PresetRegistry.styles.set(String(styleName), presetNames || []);
    },

    getStylePresets: function (styleName) {
      return PresetRegistry.styles.get(String(styleName)) || [];
    },

    applyIntensity: function (vars) {
      if (!vars || typeof vars !== 'object') return vars;
      var scaled = Object.assign({}, vars);
      ['x', 'y', 'xPercent', 'yPercent'].forEach(function (key) {
        if (typeof scaled[key] === 'number') {
          scaled[key] = Settings.scaleDistance(scaled[key]);
        }
      });
      return scaled;
    },

    /**
     * Pick responsive override key for the current viewport.
     */
    resolveBreakpointOverride: function (responsive) {
      if (!responsive || typeof responsive !== 'object') return null;
      if (Breakpoints.isMobile() && responsive.mobile) return responsive.mobile;
      if (Breakpoints.isTablet() && responsive.tablet) return responsive.tablet;
      if (Breakpoints.isDesktop() && responsive.desktop) return responsive.desktop;
      return null;
    },

    /**
     * Resolve a preset name or definition with optional overrides,
     * intensity/speed scaling, and responsive merges.
     */
    resolve: function (nameOrDefinition, overrides) {
      var preset =
        typeof nameOrDefinition === 'string'
          ? PresetRegistry.get(nameOrDefinition)
          : nameOrDefinition;

      if (!preset) return null;

      var merged = Utils.deepMerge(preset, {});
      var bpOverride = PresetRegistry.resolveBreakpointOverride(merged.responsive);
      if (bpOverride) {
        merged = Utils.deepMerge(merged, bpOverride);
      }

      merged = Utils.deepMerge(merged, overrides || {});
      merged.from = PresetRegistry.applyIntensity(merged.from || {});
      merged.to = Utils.deepMerge(merged.to || {}, {});
      merged.defaults = Utils.deepMerge(merged.defaults || {}, {});
      if (merged.defaults.duration != null) {
        merged.defaults.duration = Settings.scaleDuration(merged.defaults.duration);
      }
      return merged;
    },

    /**
     * Resolve the safe reduced-motion fallback for a preset.
     */
    resolveReduced: function (nameOrDefinition, overrides) {
      var preset =
        typeof nameOrDefinition === 'string'
          ? PresetRegistry.get(nameOrDefinition)
          : nameOrDefinition;

      if (!preset) return null;

      var rm = preset.reducedMotion;
      if (!rm || rm === 'skip' || (rm && rm.mode === 'skip')) {
        return { mode: 'skip' };
      }

      var fallback = {
        name: preset.name,
        category: preset.category,
        mode: (rm && rm.mode) || 'instant',
        from: (rm && rm.from) || { opacity: 0 },
        to: (rm && rm.to) || { opacity: 1 },
        defaults: Utils.deepMerge(
          { duration: 0.01, ease: 'none', delay: 0 },
          (rm && rm.defaults) || {}
        ),
        stagger: null,
        scroll: false,
        cleanup: preset.cleanup || null,
      };

      return Utils.deepMerge(fallback, overrides || {});
    },
  };

  function seedCorePresets() {
    // Framework scaffolds only — no section auto-binding.
    PresetRegistry.create('fade', {
      category: 'base',
      from: { opacity: 0 },
      to: { opacity: 1 },
      defaults: { duration: 0.9, ease: 'power2.out' },
      scroll: true,
    });

    PresetRegistry.create('slide', {
      category: 'base',
      from: { opacity: 0, y: 48 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1, ease: 'power3.out' },
      scroll: true,
    });

    PresetRegistry.create('scale', {
      category: 'base',
      from: { opacity: 0, scale: 0.92 },
      to: { opacity: 1, scale: 1 },
      defaults: { duration: 0.95, ease: 'power2.out' },
      scroll: true,
    });

    PresetRegistry.create('stagger', {
      category: 'base',
      from: { opacity: 0, y: 36 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 0.85, ease: 'power2.out' },
      stagger: 0.1,
      scroll: true,
    });

    PresetRegistry.create('reveal', {
      category: 'base',
      from: { opacity: 0, y: '100%' },
      to: { opacity: 1, y: '0%' },
      defaults: { duration: 0.9, ease: 'power3.out' },
      scroll: true,
    });

    PresetRegistry.create('parallax', {
      category: 'scroll',
      from: { yPercent: -15 },
      to: { yPercent: 15 },
      defaults: { ease: 'none' },
      scroll: true,
      plugins: ['scrollTrigger'],
    });

    PresetRegistry.create('editorial', {
      category: 'style',
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0 },
      defaults: { duration: 1.15, ease: 'power2.inOut' },
      stagger: 0.14,
      scroll: true,
    });

    PresetRegistry.create('luxury', {
      category: 'style',
      from: { opacity: 0, y: 24, scale: 0.98 },
      to: { opacity: 1, y: 0, scale: 1 },
      defaults: { duration: 1.35, ease: 'power1.out' },
      stagger: 0.16,
      scroll: true,
    });

    PresetRegistry.create('minimal', {
      category: 'style',
      from: { opacity: 0 },
      to: { opacity: 1 },
      defaults: { duration: 0.7, ease: 'power1.out' },
      scroll: true,
    });

    PresetRegistry.create('custom', {
      category: 'custom',
      from: {},
      to: {},
      defaults: { duration: 1, ease: 'power3.out' },
    });

    PresetRegistry.registerStyle('minimal', ['minimal', 'fade']);
    PresetRegistry.registerStyle('editorial', ['editorial', 'reveal', 'stagger']);
    PresetRegistry.registerStyle('luxury', ['luxury', 'scale', 'parallax']);
    PresetRegistry.registerStyle('custom', ['custom']);
  }

  /* -------------------------------------------------------------------------- */
  /* Motion Pack Registry (extensibility)                                       */
  /* -------------------------------------------------------------------------- */

  const PackRegistry = {
    packs: new Map(),

    register: function (name, pack) {
      if (!name) return false;

      var definition = Utils.deepMerge(
        {
          name: name,
          version: '1.0.0',
          presets: [],
          plugins: [],
          init: null,
          destroy: null,
        },
        pack || {}
      );

      PackRegistry.packs.set(String(name), definition);

      if (Array.isArray(definition.presets)) {
        definition.presets.forEach(function (preset) {
          if (preset && preset.name) {
            PresetRegistry.create(preset.name, preset);
          }
        });
      }

      if (Utils.isFunction(definition.init)) {
        definition.init(api);
      }

      Events.emit(EVENT_NAMES.pack, { name: name, pack: definition });
      return true;
    },

    get: function (name) {
      return PackRegistry.packs.get(String(name)) || null;
    },

    list: function () {
      return Array.from(PackRegistry.packs.keys());
    },

    unregister: function (name) {
      var pack = PackRegistry.get(name);
      if (!pack) return false;
      if (Utils.isFunction(pack.destroy)) pack.destroy(api);
      return PackRegistry.packs.delete(String(name));
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Motion Registry (component / section hosts)                                */
  /* -------------------------------------------------------------------------- */

  const MotionRegistry = {
    entries: new Map(),
    sections: new Map(),

    /**
     * Generic motion host registration.
     * NetherMotion.register('product-card', { init, destroy, presets })
     */
    register: function (id, definition) {
      if (!id) return null;

      var key = String(id);
      var handlers = definition || {};

      MotionRegistry.entries.set(key, {
        id: key,
        init: handlers.init || null,
        destroy: handlers.destroy || null,
        refresh: handlers.refresh || null,
        presets: handlers.presets || [],
        plugins: handlers.plugins || [],
        meta: handlers.meta || {},
        instances: new Set(),
      });

      Events.emit(EVENT_NAMES.register, { id: key });
      return MotionRegistry.entries.get(key);
    },

    unregister: function (id) {
      var key = String(id);
      var entry = MotionRegistry.entries.get(key);
      if (!entry) return false;

      entry.instances.forEach(function (instanceId) {
        AnimationRegistry.kill(instanceId);
      });

      MotionRegistry.entries.delete(key);
      return true;
    },

    get: function (id) {
      return MotionRegistry.entries.get(String(id)) || null;
    },

    registerSection: function (sectionId, handlers) {
      if (!sectionId) return;
      MotionRegistry.sections.set(String(sectionId), handlers || {});
    },

    unregisterSection: function (sectionId) {
      MotionRegistry.sections.delete(String(sectionId));
    },

    getSection: function (sectionId) {
      return MotionRegistry.sections.get(String(sectionId)) || null;
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Lifecycle & Cleanup                                                        */
  /* -------------------------------------------------------------------------- */

  const Lifecycle = {
    destroyScope: function (root) {
      if (!root) return;

      AnimationRegistry.killWithin(root);
      TimelineManager.killWithin(root);
      ScrollManager.killWithin(root);
      IOManager.disconnectWithin(root);
      HoverManager.destroyWithin(root);

      if (window.NetherMotion && window.NetherMotion.Fx && Utils.isFunction(window.NetherMotion.Fx.cleanup)) {
        window.NetherMotion.Fx.cleanup(root);
      }

      Events.emit(EVENT_NAMES.destroy, { scope: root });
    },

    destroy: function (idOrRoot) {
      if (!idOrRoot) {
        AnimationRegistry.killAll();
        TimelineManager.entries.forEach(function (_entry, id) {
          TimelineManager.kill(id);
        });
        ScrollManager.triggers.forEach(function (_entry, id) {
          ScrollManager.kill(id);
        });
        IOManager.disconnectAll();
        HoverManager.destroyAll();
        Events.emit(EVENT_NAMES.destroy, { scope: null });
        return true;
      }

      if (typeof idOrRoot === 'string') {
        var host = MotionRegistry.get(idOrRoot);
        if (host && Utils.isFunction(host.destroy)) {
          host.destroy();
        }
        MotionRegistry.unregister(idOrRoot);
        AnimationRegistry.kill(idOrRoot);
        TimelineManager.kill(idOrRoot);
        ScrollManager.kill(idOrRoot);
        IOManager.disconnect(idOrRoot);
        return true;
      }

      if (idOrRoot.nodeType === 1) {
        Lifecycle.destroyScope(idOrRoot);
        return true;
      }

      return false;
    },

    refresh: function (root) {
      ScrollManager.refresh(true);
      Events.emit(EVENT_NAMES.refresh, { scope: root || document });
    },
  };

  /* -------------------------------------------------------------------------- */
  /* Public animation helpers                                                   */
  /* -------------------------------------------------------------------------- */

  function whenReady(callback, root) {
    var scope = root || document;

    if (!needsMotion(scope)) {
      if (Utils.isFunction(callback)) callback(false);
      return Promise.resolve(false);
    }

    return load(getRequiredPlugins(scope)).then(function () {
      if (Utils.isFunction(callback)) callback(true);
      return true;
    });
  }

  /**
   * Animate targets with a preset name or raw GSAP vars.
   * Does not auto-scan the DOM — callers opt in.
   * Honors preset.reducedMotion metadata when motion is reduced.
   */
  function animate(targets, presetOrVars, options) {
    options = options || {};

    if (!isEnabled()) return null;

    var isPreset =
      Utils.isString(presetOrVars) || (presetOrVars && presetOrVars.name && (presetOrVars.from || presetOrVars.to));

    if (prefersReducedMotion() && options.respectReducedMotion !== false) {
      if (isPreset) {
        var reduced = PresetRegistry.resolveReduced(presetOrVars, options.preset || {});
        if (!reduced || reduced.mode === 'skip') {
          if (typeof gsap !== 'undefined' && options.setOnReduce !== false) {
            var clearSkip =
              (reduced && reduced.cleanup && reduced.cleanup.clearProps) ||
              options.clearProps ||
              'opacity,transform';
            gsap.set(Utils.resolveTargets(targets), { clearProps: clearSkip });
          }
          return null;
        }

        if (typeof gsap !== 'undefined' && reduced.mode === 'instant') {
          var safeTargets = Utils.resolveTargets(targets);
          var safeTo = Utils.deepMerge(reduced.defaults || {}, reduced.to || {});
          delete safeTo.stagger;
          delete safeTo.scrollTrigger;
          if (reduced.from && Object.keys(reduced.from).length) {
            gsap.set(safeTargets, Utils.sanitizeVars(Utils.deepMerge(reduced.from, safeTo)));
          } else {
            gsap.set(safeTargets, Utils.sanitizeVars(safeTo));
          }
          return null;
        }
      }

      if (typeof gsap !== 'undefined' && options.setOnReduce !== false) {
        gsap.set(Utils.resolveTargets(targets), { clearProps: options.clearProps || 'opacity,transform' });
      }
      return null;
    }

    if (typeof gsap === 'undefined') return null;

    var elements = Utils.resolveTargets(targets);
    var resolved;
    var from;
    var to;
    var defaults;

    if (isPreset) {
      resolved = PresetRegistry.resolve(presetOrVars, options.preset || {});
      if (!resolved) return null;
      from = resolved.from;
      defaults = resolved.defaults || {};
      to = Utils.deepMerge(defaults, resolved.to || {});
      if (resolved.stagger != null && options.stagger == null) {
        to.stagger = resolved.stagger;
      }
      if (resolved.scroll && options.scroll !== false) {
        to.scrollTrigger = Utils.deepMerge(
          {
            trigger: options.trigger || (elements && elements[0]),
            start: options.start || 'top 85%',
            toggleActions: options.toggleActions || 'play none none none',
          },
          options.scrollTrigger || {}
        );
      }
      if (resolved.plugins && resolved.plugins.length) {
        load(resolved.plugins);
      }
    } else {
      from = options.from || null;
      to = Utils.deepMerge({ duration: Settings.scaleDuration(1), ease: 'power3.out' }, presetOrVars || {});
    }

    if (options.stagger != null) to.stagger = options.stagger;
    if (options.duration != null) to.duration = Settings.scaleDuration(options.duration);
    if (options.delay != null) to.delay = options.delay;
    if (options.ease) to.ease = options.ease;

    var tween;
    if (from) {
      tween = gsap.fromTo(elements, Utils.sanitizeVars(from), Utils.sanitizeVars(to));
    } else {
      tween = gsap.to(elements, Utils.sanitizeVars(to));
    }

    var id = options.id || Utils.uid('anim');
    AnimationRegistry.add(id, tween, {
      type: 'animate',
      targets: elements,
      scope: options.scope || null,
      preset: Utils.isString(presetOrVars) ? presetOrVars : null,
      cleanup: resolved && resolved.cleanup ? resolved.cleanup : null,
    });

    return tween;
  }

  function timeline(options) {
    return TimelineManager.create(options || {});
  }

  function createPreset(name, definition) {
    return PresetRegistry.create(name, definition);
  }

  function register(id, definition) {
    return MotionRegistry.register(id, definition);
  }

  function destroy(idOrRoot) {
    return Lifecycle.destroy(idOrRoot);
  }

  function refresh(root) {
    return Lifecycle.refresh(root);
  }

  function observe(targets, options) {
    return IOManager.observe(targets, options);
  }

  /**
   * Apply a hover preset (or raw vars) to targets via pointer + focus events.
   * Reusable across Presentation Frameworks — no section-local GSAP required.
   */
  function hover(targets, presetOrVars, options) {
    return HoverManager.bind(targets, presetOrVars, options || {});
  }

  /* -------------------------------------------------------------------------- */
  /* Theme Editor / Design Mode                                                 */
  /* -------------------------------------------------------------------------- */

  function setupDesignMode() {
    if (!window.Shopify || !Shopify.designMode) return;

    document.addEventListener('shopify:section:load', function (event) {
      var section = event.target;
      var sectionId = event.detail.sectionId;
      var handlers = MotionRegistry.getSection(String(sectionId));

      Settings.invalidate();

      whenReady(function () {
        if (handlers && Utils.isFunction(handlers.init)) {
          handlers.init(section);
        }

        Events.emit(EVENT_NAMES.ready, {
          section: section,
          sectionId: sectionId,
        });

        ScrollManager.refresh();
      }, section);
    });

    document.addEventListener('shopify:section:unload', function (event) {
      var sectionId = String(event.detail.sectionId);
      var handlers = MotionRegistry.getSection(sectionId);

      if (handlers && Utils.isFunction(handlers.destroy)) {
        handlers.destroy(event.target);
      }

      Lifecycle.destroyScope(event.target);
      MotionRegistry.unregisterSection(sectionId);
    });

    document.addEventListener('shopify:section:reorder', function () {
      ScrollManager.refresh();
    });
  }

  function boot() {
    ReducedMotion.init();
    if (!needsMotion()) return;
    load(getRequiredPlugins());
  }

  /* -------------------------------------------------------------------------- */
  /* Public API assembly                                                        */
  /* -------------------------------------------------------------------------- */

  var api = window.NetherMotion || {};

  // Preserve any early Fx attachment if script order ever changes
  var existingFx = api.Fx;

  Object.assign(api, {
    // Versions
    ENGINE_VERSION: ENGINE_VERSION,
    GSAP_VERSION: GSAP_VERSION,
    VERSION: GSAP_VERSION, // 1.x compatibility — GSAP version string

    // Loader (1.x)
    load: load,
    needsMotion: needsMotion,
    getRequiredPlugins: getRequiredPlugins,
    prefersReducedMotion: prefersReducedMotion,
    whenReady: whenReady,

    // Section lifecycle (1.x)
    registerSection: function (sectionId, handlers) {
      return MotionRegistry.registerSection(sectionId, handlers);
    },
    unregisterSection: function (sectionId) {
      return MotionRegistry.unregisterSection(sectionId);
    },

    // Motion Engine 2.0 core API
    register: register,
    unregister: function (id) {
      return MotionRegistry.unregister(id);
    },
    animate: animate,
    timeline: timeline,
    hover: hover,
    createPreset: createPreset,
    destroy: destroy,
    refresh: refresh,
    observe: observe,

    // Settings / capability
    getSettings: function () {
      return Settings.get();
    },
    isEnabled: isEnabled,
    isActive: isActive,

    // Modular namespaces (advanced / future packs)
    utils: Utils,
    events: Events,
    settings: Settings,
    breakpoints: Breakpoints,
    reducedMotion: ReducedMotion,
    plugins: Plugins,
    registry: MotionRegistry,
    animations: AnimationRegistry,
    timelines: TimelineManager,
    scroll: ScrollManager,
    hoverInteractions: HoverManager,
    io: IOManager,
    presets: PresetRegistry,
    packs: PackRegistry,
    lifecycle: Lifecycle,

    EVENT: EVENT_NAMES,
  });

  if (existingFx) {
    api.Fx = existingFx;
  }

  window.NetherMotion = api;

  seedCorePresets();
  PackRegistry.register('core', {
    version: ENGINE_VERSION,
    presets: [],
    meta: { description: 'Nether Motion Engine core pack' },
  });

  setupDesignMode();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
