/**
 * Nether Premium Interaction System
 * Shared accessibility helpers for interactive components.
 * - Blocks activation of aria-disabled anchors / role=link|button
 * - Does not replace Dawn focus-visible polyfill or product-form logic
 */
(() => {
  const DISABLED_SELECTOR =
    'a[aria-disabled="true"], [role="link"][aria-disabled="true"], [role="button"][aria-disabled="true"]';

  function isDisabledInteractive(target) {
    if (!(target instanceof Element)) return null;
    return target.closest(DISABLED_SELECTOR);
  }

  function blockDisabledActivation(event) {
    const disabledEl = isDisabledInteractive(event.target);
    if (!disabledEl) return;

    event.preventDefault();
    event.stopPropagation();
  }

  document.addEventListener('click', blockDisabledActivation, true);
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      blockDisabledActivation(event);
    },
    true
  );

  window.NetherInteraction = Object.freeze({
    version: '1.0.0',
    isDisabledInteractive,
  });
})();
