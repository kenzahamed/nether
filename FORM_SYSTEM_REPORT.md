# Nether Premium Form System — Report

## 1. Summary

The Nether Premium Form System extends Dawn's existing form architecture without replacing or duplicating it. All fourteen supported components, three sizes, and ten interaction states build on the established Dawn structure — `.field`, `.field__input`, `.field__label`, `.field__button`, `.select`, `.select__select`, `.text-area`, `.form__label`, and `.form__message` — so every existing form across contact pages, customer accounts, newsletter signup, search, facets, gift card recipient forms, and product variant pickers continues to work unchanged.

A modular set of reusable Liquid snippets provides a single, consistent API for rendering form controls across all future Nether sections. Styling lives in one dedicated stylesheet (`assets/component-form.css`) loaded globally after `component-badge.css`. Minimal JavaScript (`assets/component-form.js`) handles only features that cannot be achieved with pure CSS: password visibility toggle, clear button, character counter, and file upload filename display.

**Key design decisions:**

- **Extend, don't replace** — Dawn `.field` floating labels, pseudo-element borders, and `search-form.js` clear button behaviour remain untouched.
- **Namespaced modifiers** — Nether classes use `.field--small`, `.field--error`, `.form-choice`, `.form-toggle`, and `.form-file` prefixes to avoid collisions with Dawn patterns.
- **System integration** — Icons via `{% render 'icon' %}`, typography via `.type-caption` / `.type-body-sm`, button styles on file upload triggers via `.button--*` classes, validation messages reuse Dawn `.form__message`.
- **Minimal JavaScript** — Three lightweight custom elements (`form-field`, `form-textarea`, `form-file`) only activate when enhanced features are requested.
- **Hidden input compatibility** — `form-field` with `type: 'hidden'` outputs a plain hidden input with no wrapper overhead.

---

## 2. Files Created

| File | Purpose |
|---|---|
| `assets/component-form.css` | Premium form sizes, states, choice controls, toggle, file upload, and layout utilities |
| `assets/component-form.js` | Password toggle, clear button, character counter, and file name display |
| `snippets/form-field.liquid` | Text, email, password, number, tel, search, url, and hidden inputs |
| `snippets/form-textarea.liquid` | Textarea with optional character counter |
| `snippets/form-select.liquid` | Select dropdown with Dawn `.select` structure |
| `snippets/form-choice.liquid` | Checkbox and radio button |
| `snippets/form-toggle.liquid` | Toggle switch |
| `snippets/form-file.liquid` | Styled file upload (native behaviour preserved) |
| `snippets/form-message.liquid` | Helper, success, error, and warning messages |
| `snippets/form-fieldset.liquid` | Accessible fieldset wrapper for choice groups |
| `FORM_SYSTEM_REPORT.md` | This documentation |

---

## 3. Files Modified

| File | Change |
|---|---|
| `layout/theme.liquid` | Added `component-form.css` globally; added `component-form.js` with `defer` |
| `layout/password.liquid` | Added `component-form.css` and `component-form.js` for layout parity |

---

## 4. Supported Components

| Component | Snippet | Dawn Base | Notes |
|---|---|---|---|
| **Text Input** | `form-field` | `.field` / `.field__input` | Default floating label |
| **Email Input** | `form-field` | `.field` / `.field__input` | `type: 'email'` |
| **Password Input** | `form-field` | `.field` / `.field__input` | Auto password toggle; `form-field` custom element |
| **Number Input** | `form-field` | `.field` / `.field__input` | Supports `min`, `max`, `step` |
| **Telephone Input** | `form-field` | `.field` / `.field__input` | `type: 'tel'` |
| **Search Input** | `form-field` | `.search__input` / `.field__input` | Compatible with existing `search-form.js` |
| **URL Input** | `form-field` | `.field` / `.field__input` | `type: 'url'` |
| **Textarea** | `form-textarea` | `.text-area` / `.field__input` | Optional character counter |
| **Select Dropdown** | `form-select` | `.select` / `.select__select` | `value:Label` option pairs |
| **Checkbox** | `form-choice` | New `.form-choice` pattern | Does not replace variant picker or recipient checkbox |
| **Radio Button** | `form-choice` | New `.form-choice` pattern | Does not replace variant picker radios |
| **Toggle Switch** | `form-toggle` | New `.form-toggle` pattern | Uses `role="switch"` |
| **File Upload** | `form-file` | New `.form-file` pattern | Styling only; native input preserved |
| **Hidden Input** | `form-field` | Native `<input type="hidden">` | No wrapper markup |

### Input Sizes

| Size | CSS Class | Height |
|---|---|---|
| **Small** | `.field--small` | 3.8rem |
| **Medium** | `.field--medium` | 4.5rem (Dawn default) |
| **Large** | `.field--large` | 5.5rem |

Select sizes: `.select--small`, `.select--large`

### Features

| Feature | Implementation |
|---|---|
| Floating labels | Dawn default; disable with `floating_label: false` → `.field--static-label` |
| Placeholder | Passed to input; required for Dawn floating label animation |
| Prefix / suffix icons | `icon_prefix` / `icon_suffix` via Icon System |
| Clear button | `clear_button: true` → `form-field` custom element |
| Helper text | `helper_text` → `.form-field__helper.type-caption` |
| Validation messages | `error_message` / `success_message` / `warning_message` via `form-message` |
| Character counter | `show_counter: true` + `maxlength` → `form-textarea` custom element |
| Password toggle | `password_toggle: true` (default for password type) |
| Required indicator | `required: true` → `*` via `.form-field__required` |
| Responsive layout | `.form-row`, `.form-row--2`, `.form-row--3` utilities |

---

## 5. States

| State | CSS Class | Implementation |
|---|---|---|
| **Default** | — | Inherits Dawn `.field` pseudo-element border |
| **Hover** | — | Inherits Dawn `.field:hover.field:after` |
| **Focus** | — | Inherits Dawn `.field__input:focus-visible` ring |
| **Active** | — | Native input active state |
| **Disabled** | `.field--disabled` | `disabled` attribute + reduced opacity |
| **Readonly** | `.field--readonly` | `readonly` attribute + reduced opacity |
| **Required** | — | `required` + `aria-required` + visual `*` |
| **Success** | `.field--success` / `.form-choice--success` | `--form-status-success` token (button colour) |
| **Error** | `.field--error` / `.field--with-error` | `--form-status-error` token (foreground) |
| **Warning** | `.field--warning` | `--form-status-warning` token (link colour) |

---

## 6. Accessibility Improvements

- **Proper labels** — Every input has an associated `<label>` with matching `for` / `id`; hidden inputs excluded.
- **ARIA attributes** — `aria-required`, `aria-invalid`, `aria-describedby` wired to helper and validation message ids.
- **Toggle switch** — `role="switch"` on checkbox input with visible label text.
- **Choice controls** — Native input visually hidden but focusable; custom control shows `:focus-visible` ring.
- **Password toggle** — `aria-pressed` and dynamic `aria-label` updated on toggle.
- **Clear button** — `aria-label` with configurable label; `type="button"` prevents form submission.
- **Validation messages** — `role="alert"` for errors/warnings; `role="status"` for success via `form-message`.
- **Character counter** — `aria-live="polite"` when limit reached.
- **Keyboard navigation** — All controls are native form elements; no div-based inputs.
- **Focus visibility** — Inherits Dawn focus rings; additional rings on choice and toggle controls.
- **Forced colours** — High-contrast borders under `forced-colors: active`.
- **Reduced motion** — Transitions disabled under `prefers-reduced-motion: reduce`.

---

## 7. Performance Improvements

- **Single CSS file** (~6 KB unminified) loaded once globally — no per-section stylesheets.
- **Minimal JavaScript** (~2 KB) — Three custom elements; no-op when features not used.
- **No duplicate Dawn JS** — Search clear behaviour still handled by existing `search-form.js`; Nether clear button is separate opt-in.
- **Design token reuse** — All colours, radii, borders, and shadows reference existing CSS custom properties (`--inputs-radius`, `--color-button`, `--color-foreground`, `--color-link`).
- **No duplicate styles** — `component-form.css` contains only delta rules; base form layout remains in `base.css`.
- **SVG icons** — Uses Dawn `inline_asset_content` and Nether Icon System (no additional HTTP requests).
- **Theme Check** — Passes with no new errors. Expected `OrphanedSnippet` warnings until sections adopt the snippets.
- **Backward compatible** — All existing Dawn form usages across 20+ snippets and sections are unaffected.

---

## 8. Example Usage

### Contact Form Fields

```liquid
<div class="form-row form-row--2">
  {% render 'form-field',
    type: 'text',
    name: 'contact[name]',
    id: 'ContactForm-name',
    label: 'Name',
    autocomplete: 'name',
    required: true
  %}

  {% render 'form-field',
    type: 'email',
    name: 'contact[email]',
    id: 'ContactForm-email',
    label: 'Email',
    autocomplete: 'email',
    required: true,
    state: 'error',
    error_message: 'Please enter a valid email address.'
  %}
</div>

{% render 'form-field',
  type: 'tel',
  name: 'contact[phone]',
  id: 'ContactForm-phone',
  label: 'Phone',
  autocomplete: 'tel',
  icon_prefix: 'chat_bubble'
%}

{% render 'form-textarea',
  name: 'contact[body]',
  id: 'ContactForm-body',
  label: 'Comment',
  rows: 8,
  required: true
%}
```

### Password Field with Toggle

```liquid
{% render 'form-field',
  type: 'password',
  name: 'customer[password]',
  id: 'CustomerPassword',
  label: 'Password',
  required: true,
  helper_text: 'Must be at least 8 characters.'
%}
```

### Search with Clear Button

```liquid
{% render 'form-field',
  type: 'search',
  name: 'q',
  id: 'SearchInput',
  label: 'Search',
  icon_prefix: 'search',
  clear_button: true
%}
```

### Select Dropdown

```liquid
{% render 'form-select',
  name: 'contact[subject]',
  id: 'ContactForm-subject',
  label: 'Subject',
  options: 'general:General inquiry,order:Order question,wholesale:Wholesale',
  placeholder_option: 'Select a subject',
  required: true
%}
```

### Checkbox and Radio Group

```liquid
{% capture preference_choices %}
  {% render 'form-choice', type: 'radio', id: 'pref-email', name: 'preference', value: 'email', label: 'Email', inline: true %}
  {% render 'form-choice', type: 'radio', id: 'pref-sms', name: 'preference', value: 'sms', label: 'SMS', inline: true %}
{% endcapture %}

{% render 'form-fieldset', legend: 'Contact preference', content: preference_choices, inline: true %}

{% render 'form-choice',
  type: 'checkbox',
  id: 'terms-agree',
  name: 'terms',
  label: 'I agree to the terms and conditions',
  required: true
%}
```

### Toggle Switch

```liquid
{% render 'form-toggle',
  id: 'marketing-opt-in',
  name: 'contact[accepts_marketing]',
  label: 'Subscribe to marketing emails',
  helper_text: 'You can unsubscribe at any time.'
%}
```

### Textarea with Character Counter

```liquid
{% render 'form-textarea',
  name: 'properties[Recipient message]',
  id: 'Recipient-message',
  label: 'Message',
  maxlength: 200,
  show_counter: true,
  helper_text: 'Maximum 200 characters.'
%}
```

### File Upload

```liquid
{% render 'form-file',
  name: 'contact[attachment]',
  id: 'ContactForm-file',
  label: 'Choose file',
  accept: '.pdf,.doc,.docx',
  helper_text: 'PDF or Word document, max 5 MB.'
%}
```

### Validation Message

```liquid
{% render 'form-message', message: 'Your message was sent successfully.', type: 'success' %}
```

### Hidden Input

```liquid
{% render 'form-field', type: 'hidden', name: 'form_type', value: 'contact' %}
```

### Existing Dawn Forms (unchanged)

```liquid
{%- form 'contact', id: 'ContactForm' -%}
  <div class="field">
    <input class="field__input" type="email" name="contact[email]" placeholder="Email">
    <label class="field__label" for="ContactForm-email">Email</label>
  </div>
{%- endform -%}
```

---

*Generated for the Nether Shopify Framework — Premium Form System v1.0*
