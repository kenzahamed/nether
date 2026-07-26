/**
 * Sprint 9 Typography System — static verification
 * Confirms shared type tokens, missing Liquid aliases, text_style normalization,
 * and framework soft-binds remain wired to the Typography Engine.
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

// Shared engine
assert(exists('assets/component-typography.css'), 'component-typography.css exists');
assert(exists('snippets/nether-type-text-class.liquid'), 'nether-type-text-class.liquid exists');
assert(exists('snippets/nether-type-heading-class.liquid'), 'nether-type-heading-class.liquid exists');

const theme = read('layout/theme.liquid');
const password = read('layout/password.liquid');
assert(theme.includes('component-typography.css'), 'theme.liquid loads typography CSS');
assert(password.includes('component-typography.css'), 'password.liquid loads typography CSS');

const typeCss = read('assets/component-typography.css');

// Token scale
const tokens = [
  '--type-size-display-xl-min',
  '--type-size-display-sm',
  '--type-size-h1',
  '--type-size-heading-md',
  '--type-size-body',
  '--type-size-caption',
  '--type-size-subtitle',
  '--type-size-price',
  '--type-size-quote',
  '--type-size-card-sm',
  '--type-size-emphasis-hero',
  '--type-leading-snug',
  '--type-measure',
];
for (const t of tokens) {
  assert(typeCss.includes(t), `defines token ${t}`);
}

// Missing aliases that Liquid already used
const aliases = [
  '.type-display-sm',
  '.type-heading-lg',
  '.type-heading-md',
  '.type-heading-sm',
  '.type-heading-xs',
  '.type-subtitle',
  '.type-quote',
  '.type-price',
  '.type-nav',
  '.type-section-title',
];
for (const a of aliases) {
  assert(typeCss.includes(a), `defines alias ${a}`);
}

// Caption a11y floor
assert(typeCss.includes('--type-size-caption: 1.2rem'), 'caption floor is 1.2rem');

// Shared header uses normalizers
const header = read('snippets/nether-shared-header-block.liquid');
assert(header.includes("render 'nether-type-heading-class'"), 'shared header uses heading class helper');
assert(header.includes("render 'nether-type-text-class'"), 'shared header uses text class helper');

const textHelper = read('snippets/nether-type-text-class.liquid');
assert(textHelper.includes("when 'body'"), 'text helper maps body → type-body');
assert(textHelper.includes('type-body'), 'text helper outputs type-body');

// Liquid consumers of previously-missing aliases still reference them
const liquidConsumers = [
  ['snippets/nether-stat.liquid', 'type-display-sm'],
  ['snippets/nether-wishlist-header.liquid', 'type-display-sm'],
  ['snippets/nether-compare-header.liquid', 'type-display-sm'],
  ['snippets/nether-cart-header.liquid', 'type-heading-md'],
  ['snippets/nether-product-card.liquid', 'type-heading-md'],
  ['snippets/nether-wishlist-card.liquid', 'type-heading-xs'],
];
for (const [file, cls] of liquidConsumers) {
  assert(read(file).includes(cls), `${file} still uses ${cls}`);
  assert(typeCss.includes(`.${cls}`), `CSS defines .${cls} for ${file}`);
}

// Framework soft-binds
const binds = [
  ['assets/component-hero.css', '--type-size-emphasis-hero'],
  ['assets/component-content.css', '--type-size-emphasis-magazine'],
  ['assets/component-product-page.css', '--type-size-emphasis-product-title'],
  ['assets/component-testimonials.css', '--type-size-quote'],
  ['assets/component-faq.css', '--type-size-faq-editorial'],
  ['assets/component-product-showcase.css', '--type-size-card-sm'],
  ['assets/component-collection-showcase.css', '--type-size-card-lg'],
  ['assets/component-media.css', '--type-size-card-editorial'],
  ['assets/component-price.css', '--type-size-price'],
  ['assets/component-form.css', '--type-size-body-desktop'],
  ['assets/section-footer.css', '--type-size-footer-heading'],
];
for (const [file, token] of binds) {
  assert(read(file).includes(token), `${file} soft-binds ${token}`);
}

// Sprint 1–8 regression: prior engines still loaded
assert(theme.includes('component-responsive.css'), 'Sprint 5 responsive CSS still loaded');
assert(theme.includes('component-layout.css'), 'Sprint 6 layout CSS still loaded');
assert(theme.includes('component-position.css'), 'Sprint 7 position CSS still loaded');
assert(theme.includes('component-media-engine.css'), 'Sprint 8 media CSS still loaded');

// Output
const out = {
  summary: {
    ok: results.ok.length,
    fail: results.fail.length,
    warn: results.warn.length,
    passed: results.fail.length === 0,
  },
  results,
};
fs.writeFileSync(path.join(root, '.nether-analysis/_sprint9_verify.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.summary, null, 2));
if (results.fail.length) {
  console.error('FAILURES:\n' + results.fail.map((f) => ' - ' + f).join('\n'));
  process.exit(1);
}
console.log('Sprint 9 typography verification passed.');
