/**
 * Sprint 8 Media Engine — static verification
 * Checks shared helpers exist, consumers render them, loading attrs are normalized,
 * and deferred-media poster pattern is used for product/collection video.
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

// Shared engine files
assert(exists('assets/component-media-engine.css'), 'component-media-engine.css exists');
assert(exists('snippets/nether-media-ratio.liquid'), 'nether-media-ratio.liquid exists');
assert(exists('snippets/nether-media-loading.liquid'), 'nether-media-loading.liquid exists');
assert(exists('snippets/nether-media-picture.liquid'), 'nether-media-picture.liquid exists');
assert(exists('snippets/nether-media-video.liquid'), 'nether-media-video.liquid exists');

// Global load
const theme = read('layout/theme.liquid');
const password = read('layout/password.liquid');
assert(theme.includes('component-media-engine.css'), 'theme.liquid loads media engine CSS');
assert(password.includes('component-media-engine.css'), 'password.liquid loads media engine CSS');

// Consumers use shared helpers
const consumers = {
  'snippets/nether-media-render.liquid': ['nether-media-ratio', 'nether-media-loading', 'nether-media-picture', 'nether-media-video'],
  'snippets/nether-product-media.liquid': ['nether-media-ratio', 'nether-media-loading', 'nether-media-picture', 'nether-media-video'],
  'snippets/nether-collection-media.liquid': ['nether-media-ratio', 'nether-media-loading', 'nether-media-picture', 'nether-media-video'],
  'snippets/nether-hero-media.liquid': ['nether-media-loading', 'nether-media-picture', 'nether-media-video'],
  'snippets/nether-content-image.liquid': ['nether-media-loading', 'nether-media-picture'],
  'snippets/nether-content-video.liquid': ['nether-media-video'],
};

for (const [file, helpers] of Object.entries(consumers)) {
  const src = read(file);
  for (const h of helpers) {
    assert(src.includes(`render '${h}'`), `${file} renders ${h}`);
  }
}

// No boolean loading: is_lazy directly on image_tag in recovered consumers
for (const file of Object.keys(consumers).concat(['snippets/nether-product-promotional-card.liquid'])) {
  const src = read(file);
  assert(!/loading:\s*is_lazy\b/.test(src), `${file} does not pass boolean is_lazy to image_tag`);
  assert(!/loading:\s*lazy\b(?!')/.test(src) || /loading:\s*loading_attr/.test(src) || /loading:\s*'lazy'/.test(src), `${file} uses string loading attrs`, 'warn');
}

// Product/collection use deferred poster+template pattern (not inline video_tag in deferred-media)
for (const file of ['snippets/nether-product-media.liquid', 'snippets/nether-collection-media.liquid']) {
  const src = read(file);
  assert(src.includes("render 'nether-media-video'"), `${file} uses shared video renderer`);
  assert(!/deferred-media[\s\S]{0,120}video_tag/.test(src), `${file} does not put video_tag directly in deferred-media`);
}

// Media engine tokens
const engineCss = read('assets/component-media-engine.css');
assert(engineCss.includes('--nether-media-fit'), 'engine defines --nether-media-fit');
assert(engineCss.includes('--nether-media-object-position'), 'engine defines --nether-media-object-position');
assert(engineCss.includes('--nether-media-ratio-portrait'), 'engine defines ratio portrait token');

// Framework soft-bind to tokens
for (const file of [
  'assets/component-hero.css',
  'assets/component-product-showcase.css',
  'assets/component-collection-showcase.css',
  'assets/component-media.css',
]) {
  const src = read(file);
  assert(src.includes('var(--nether-media-fit'), `${file} binds object-fit to media engine token`);
}

// Focal point support
for (const file of [
  'snippets/nether-media-render.liquid',
  'snippets/nether-hero-media.liquid',
  'snippets/nether-product-media.liquid',
  'snippets/nether-collection-media.liquid',
]) {
  assert(read(file).includes('focal_point'), `${file} supports focal_point`);
}

const out = {
  ok: results.ok.length,
  fail: results.fail.length,
  warn: results.warn.length,
  failures: results.fail,
  warnings: results.warn,
  passed: results.ok,
};
fs.writeFileSync(path.join(root, '.nether-analysis/_sprint8_verify.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(results.fail.length ? 1 : 0);
