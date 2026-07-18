class NetherAnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.handleClose = this.handleClose.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.stopDawnPauseHandling = this.stopDawnPauseHandling.bind(this);
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.closeButton = this.querySelector('[data-nether-announcement-close]');
    this.slideshow = this.querySelector('slideshow-component');
    this.storageKey = this.dataset.closeStorageKey;

    if (this.closeButton && this.wasClosed()) {
      this.hide(false);
      return;
    }

    this.closeButton?.addEventListener('click', this.handleClose);
    this.addEventListener('keydown', this.handleKeydown);

    if (this.dataset.pauseOnHover === 'false') {
      this.disablePauseOnHover();
    }

    this.registerMotion();
    this.dispatchAnnouncementChange();
  }

  disconnectedCallback() {
    this.closeButton?.removeEventListener('click', this.handleClose);
    this.removeEventListener('keydown', this.handleKeydown);
    this.pauseEvents?.forEach((eventName) => {
      this.slideshow?.removeEventListener(eventName, this.stopDawnPauseHandling, true);
    });
  }

  wasClosed() {
    if (!this.storageKey) return false;

    try {
      return window.sessionStorage.getItem(this.storageKey) === 'closed';
    } catch (error) {
      return false;
    }
  }

  persistClosedState() {
    if (!this.storageKey) return;

    try {
      window.sessionStorage.setItem(this.storageKey, 'closed');
    } catch (error) {
      return;
    }
  }

  handleClose() {
    this.persistClosedState();
    this.hide(true);
  }

  hide(announce) {
    this.setAttribute('hidden', '');

    this.dispatchAnnouncementChange();

    if (announce) {
      this.dispatchEvent(
        new CustomEvent('nether:announcement:closed', {
          bubbles: true,
          detail: {
            sectionId: this.dataset.sectionId,
          },
        })
      );
    }
  }

  handleKeydown(event) {
    if (!this.slideshow) return;
    if (this.dataset.showNavigation === 'false') return;

    const previousButton = this.slideshow.querySelector('button[name="previous"]');
    const nextButton = this.slideshow.querySelector('button[name="next"]');

    if (event.key === 'ArrowLeft' && previousButton) {
      event.preventDefault();
      previousButton.click();
    }

    if (event.key === 'ArrowRight' && nextButton) {
      event.preventDefault();
      nextButton.click();
    }

    if (event.key === 'Escape' && this.closeButton) {
      event.preventDefault();
      this.closeButton.focus();
    }
  }

  disablePauseOnHover() {
    if (!this.slideshow) return;

    this.pauseEvents = ['mouseover', 'mouseleave', 'focusin', 'focusout'];
    this.pauseEvents.forEach((eventName) => {
      this.slideshow.addEventListener(eventName, this.stopDawnPauseHandling, true);
    });
  }

  stopDawnPauseHandling(event) {
    event.stopImmediatePropagation();
  }

  registerMotion() {
    if (!window.NetherMotion || !this.dataset.sectionId) return;

    window.NetherMotion.registerSection(this.dataset.sectionId, {
      init: () => {},
      destroy: () => {},
    });
  }

  dispatchAnnouncementChange() {
    document.dispatchEvent(
      new CustomEvent('nether:announcement:change', {
        bubbles: true,
        detail: {
          sectionId: this.dataset.sectionId,
          hidden: this.hasAttribute('hidden'),
        },
      })
    );
  }
}

if (!customElements.get('nether-announcement-bar')) {
  customElements.define('nether-announcement-bar', NetherAnnouncementBar);
}
