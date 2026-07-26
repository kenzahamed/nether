/**
 * Sprint 10 Interactive Components — static verification
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const results = { ok: [], fail: [], warn: [] };

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function assert(cond, msg, bucket = 'fail') {
  (cond ? results.ok : results[bucket]).push(msg);
}

assert(exists('assets/component-interaction.css'), 'component-interaction.css exists');
assert(exists('assets/component-interaction.js'), 'component-interaction.js exists');

const theme = read('layout/theme.liquid');
const password = read('layout/password.liquid');
assert(theme.includes('component-interaction.css'), 'theme.liquid loads interaction CSS');
assert(theme.includes('component-interaction.js'), 'theme.liquid loads interaction JS');
assert(password.includes('component-interaction.css'), 'password.liquid loads interaction CSS');
assert(password.includes('component-interaction.js'), 'password.liquid loads interaction JS');

const css = read('assets/component-interaction.css');
for (const token of [
  '--nether-hit-target',
  '--nether-interact-duration',
  '--nether-interact-focus-outline',
  '--nether-interact-hover-bg',
  '--nether-interact-disabled-opacity',
]) {
  assert(css.includes(token), `interaction CSS defines ${token}`);
}

assert(css.includes('a[aria-disabled'), 'interaction CSS disables aria-disabled anchors');
assert(css.includes(':focus-visible'), 'interaction CSS provides focus-visible rules');
assert(css.includes('card-hover-lift:focus-within'), 'card hover has keyboard focus-within parity');
assert(css.includes('.pagination__item'), 'pagination soft-bound');
assert(css.includes('.nether-faq__nav-link'), 'FAQ soft-bound');
assert(css.includes('.mega-menu__link:focus-visible'), 'mega-menu soft-bound');
assert(css.includes('.nether-wishlist-button__control:focus-visible'), 'wishlist soft-bound');
assert(css.includes('.nether-compare-button__control:focus-visible'), 'compare soft-bound');
assert(css.includes('.nether-quick-view__close'), 'quick-view soft-bound');

const js = read('assets/component-interaction.js');
assert(js.includes('aria-disabled'), 'interaction JS guards aria-disabled activation');
assert(js.includes('NetherInteraction'), 'interaction JS exposes NetherInteraction');
assert(!js.includes('jQuery'), 'interaction JS has no jQuery');

const buttonLiquid = read('snippets/button.liquid');
assert(buttonLiquid.includes('aria-disabled="true"'), 'button snippet supports aria-disabled');
assert(buttonLiquid.includes('role="link"'), 'disabled link buttons omit href and use role=link');
assert(!/is_disabled[\s\S]{0,40}href="\{\{ link \}\}"/.test(buttonLiquid) || buttonLiquid.includes('{% if is_disabled %}'), 'disabled links do not keep active href when disabled');

const buttonCss = read('assets/component-button.css');
assert(buttonCss.includes('a.button[aria-disabled'), 'button CSS blocks disabled link pointer events');
assert(buttonCss.includes('--nether-interact-duration') || buttonCss.includes('nether-interact'), 'button CSS binds to interaction tokens');

// Framework soft-binds
const frameworks = {
  'assets/component-header.css': ['--nether-interact-focus-outline'],
  'assets/component-faq.css': ['--nether-interact-hover-bg', ':focus-visible'],
  'assets/component-pagination.css': [':focus-visible'],
  'assets/component-quick-view.css': ['--nether-hit-target', ':focus-visible'],
  'assets/component-wishlist.css': ['--nether-interact-focus-outline'],
  'assets/component-compare.css': ['--nether-interact-focus-outline'],
  'assets/component-mega-menu.css': [':focus-visible'],
  'assets/component-menu-drawer.css': ['--nether-interact-hover-bg', ':focus-visible'],
  'assets/component-mobile-drawer.css': ['--nether-interact-hover-bg', ':focus-visible'],
  'assets/component-card-premium.css': [':focus-within'],
};

for (const [file, needles] of Object.entries(frameworks)) {
  const src = read(file);
  for (const needle of needles) {
    assert(src.includes(needle), `${file} soft-binds ${needle}`);
  }
}

// Regression: prior engines still loaded
for (const engine of [
  'component-layout.css',
  'component-position.css',
  'component-media-engine.css',
  'component-typography.css',
  'component-button.css',
]) {
  assert(theme.includes(engine), `Sprint regression: theme still loads ${engine}`);
}

const out = {
  ok: results.ok.length,
  fail: results.fail.length,
  warn: results.warn.length,
  failures: results.fail,
  warnings: results.warn,
};

fs.writeFileSync(path.join(__dirname, '_sprint10_verify.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (results.fail.length) process.exit(1);
