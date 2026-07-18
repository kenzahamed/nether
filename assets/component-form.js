/**
 * Nether Premium Form System
 * Minimal enhancements for password toggle, clear button, character counter,
 * and file upload filename display. Reuses global.js debounce where applicable.
 */

class FormField extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('.field__input');
    this.clearButton = this.querySelector('[data-form-clear]');
    this.passwordButton = this.querySelector('[data-form-password-toggle]');
  }

  connectedCallback() {
    if (!this.input) return;

    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.onClear.bind(this));
      this.input.addEventListener('input', this.toggleClearButton.bind(this));
      this.toggleClearButton();
    }

    if (this.passwordButton) {
      this.passwordButton.addEventListener('click', this.onPasswordToggle.bind(this));
    }
  }

  onClear(event) {
    event.preventDefault();
    this.input.value = '';
    this.input.focus();
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.toggleClearButton();
  }

  toggleClearButton() {
    if (!this.clearButton) return;
    this.clearButton.classList.toggle('hidden', this.input.value.length === 0);
  }

  onPasswordToggle(event) {
    event.preventDefault();
    const isPassword = this.input.type === 'password';
    this.input.type = isPassword ? 'text' : 'password';
    this.passwordButton.setAttribute('aria-pressed', String(isPassword));
    this.passwordButton.setAttribute(
      'aria-label',
      isPassword ? this.passwordButton.dataset.labelHide : this.passwordButton.dataset.labelShow
    );
  }
}

class FormTextarea extends HTMLElement {
  constructor() {
    super();
    this.textarea = this.querySelector('.text-area, .field__input');
    this.counter = this.querySelector('[data-form-counter]');
    this.maxLength = parseInt(this.dataset.maxLength, 10);
  }

  connectedCallback() {
    if (!this.textarea || !this.counter || !this.maxLength) return;

    this.textarea.addEventListener('input', this.updateCounter.bind(this));
    this.updateCounter();
  }

  updateCounter() {
    const length = this.textarea.value.length;
    this.counter.textContent = `${length}/${this.maxLength}`;
    this.counter.classList.toggle('is-limit', length >= this.maxLength);
    this.counter.setAttribute('aria-live', length >= this.maxLength ? 'polite' : 'off');
  }
}

class FormFile extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('.form-file__input');
    this.nameDisplay = this.querySelector('[data-form-file-name]');
  }

  connectedCallback() {
    if (!this.input || !this.nameDisplay) return;
    this.input.addEventListener('change', this.onChange.bind(this));
  }

  onChange() {
    const fileName = this.input.files && this.input.files.length > 0 ? this.input.files[0].name : '';
    this.nameDisplay.textContent = fileName;
    this.nameDisplay.classList.toggle('is-empty', fileName === '');
  }
}

if (!customElements.get('form-field')) {
  customElements.define('form-field', FormField);
}

if (!customElements.get('form-textarea')) {
  customElements.define('form-textarea', FormTextarea);
}

if (!customElements.get('form-file')) {
  customElements.define('form-file', FormFile);
}
