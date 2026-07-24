/**
 * Nether Recovery Sprint 4 — Merchant Controls architecture patcher
 * Applies shared visible_if, info, and header localization across Nether schemas.
 * Run once: node _sprint4_merchant_controls_patch.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SECTIONS_DIR = path.join(ROOT, 'sections');
const LOCALE_EN = path.join(ROOT, 'locales', 'en.default.schema.json');
const SETTINGS_SCHEMA = path.join(ROOT, 'config', 'settings_schema.json');

const HEADER_MAP = {
  'Nether banner framework': 't:nether.common.framework_banner',
  'Nether CTA & conversion framework': 't:nether.common.framework_cta',
  'Nether FAQ & knowledge framework': 't:nether.common.framework_faq',
  'Nether Newsletter & lead generation framework': 't:nether.common.framework_newsletter',
  'Nether product framework': 't:nether.common.framework_product',
  'Nether testimonials framework': 't:nether.common.framework_testimonials',
  Media: 't:nether.common.header_media',
  'Section media': 't:nether.common.header_section_media',
  'Visual features': 't:nether.common.header_visual_features',
  Motion: 't:nether.common.header_motion',
  'Responsive layouts': 't:nether.common.header_responsive',
  'Color scheme': 't:nether.common.header_color_scheme',
  Padding: 't:sections.all.padding.section_padding_heading',
  Integrations: 't:nether.common.header_integrations',
  'Product features': 't:nether.common.header_product_features',
  'Call to action': 't:nether.common.header_call_to_action',
  Content: 't:nether.common.header_content',
  Statistics: 't:nether.common.statistics',
};

const INFO_BY_SUFFIX = [
  { test: /(^|_)layout$/, key: 't:nether.common.info_layout', exclude: /layout_(desktop|tablet|mobile)$/ },
  { test: /hero_layout$/, key: 't:nether.common.info_layout' },
  { test: /banner_layout$/, key: 't:nether.common.info_layout' },
  { test: /content_layout$/, key: 't:nether.common.info_layout' },
  { test: /content_position$/, key: 't:nether.common.info_content_position' },
  { test: /content_alignment$/, key: 't:nether.common.info_content_alignment' },
  { test: /split_media_position$/, key: 't:nether.common.info_split_media_position' },
  { test: /heading_level$/, key: 't:nether.common.info_heading_level' },
  { test: /aria_label$/, key: 't:nether.common.info_aria_label' },
  { test: /image_ratio$/, key: 't:nether.common.info_image_ratio' },
  { test: /card_style$/, key: 't:nether.common.info_card_style' },
  { test: /enable_glass$/, key: 't:nether.common.info_enable_glass' },
  { test: /glass_style$/, key: 't:nether.common.info_glass_style' },
  { test: /enable_gradient$/, key: 't:nether.common.info_enable_gradient' },
  { test: /gradient_style$/, key: 't:nether.common.info_gradient_style' },
  { test: /overlay_opacity$/, key: 't:nether.common.info_overlay_opacity' },
  { test: /enable_(image_)?overlay$/, key: 't:nether.common.info_enable_overlay' },
  { test: /animation_speed$/, key: 't:nether.common.info_animation_speed' },
  { test: /animation_style$/, key: 't:nether.common.info_animation_style' },
  { test: /enable_parallax$/, key: 't:nether.common.info_parallax' },
  { test: /floating_card/, key: 't:nether.common.info_floating_card' },
  { test: /layout_desktop$/, key: 't:nether.common.info_responsive_desktop' },
  { test: /layout_tablet$/, key: 't:nether.common.info_responsive_tablet' },
  { test: /layout_mobile$/, key: 't:nether.common.info_responsive_mobile' },
  { test: /media_type$/, key: 't:nether.common.info_media_type' },
  { test: /divider_style$/, key: 't:nether.common.info_divider_style' },
];

const COMMON_LOCALE_ADDITIONS = {
  header_media: 'Media',
  header_section_media: 'Section media',
  header_visual_features: 'Visual features',
  header_motion: 'Motion',
  header_responsive: 'Responsive layouts',
  header_color_scheme: 'Color scheme',
  header_integrations: 'Integrations',
  header_product_features: 'Product features',
  header_call_to_action: 'Call to action',
  header_content: 'Content',
  framework_banner: 'Nether banner framework',
  framework_cta: 'Nether CTA & conversion framework',
  framework_faq: 'Nether FAQ & knowledge framework',
  framework_newsletter: 'Nether Newsletter & lead generation framework',
  framework_product: 'Nether product framework',
  framework_testimonials: 'Nether testimonials framework',
  heading_h2: 'H2',
  heading_h3: 'H3',
  info_layout: 'Chooses the primary composition. Layout-specific controls appear when relevant.',
  info_content_position: 'Places content inside the section frame using a nine-point grid.',
  info_content_alignment: 'Aligns text and inline content left, center, or right.',
  info_split_media_position: 'Applies to split compositions. Moves media to the left or right side.',
  info_heading_level: 'Semantic heading tag for accessibility and SEO. Visual size is controlled separately.',
  info_aria_label: 'Optional accessible name announced by screen readers. Leave blank to use the heading.',
  info_image_ratio: 'Controls media crop ratio for cards and gallery items.',
  info_card_style: 'Visual treatment applied to cards in this section.',
  info_enable_glass: 'Applies a frosted glass surface to content panels.',
  info_glass_style: 'Available when glass is enabled. Controls blur strength and translucency.',
  info_enable_gradient: 'Adds a branded gradient overlay for depth and text contrast.',
  info_gradient_style: 'Available when gradient is enabled. Changes overlay character.',
  info_enable_overlay: 'Darkens media so text stays readable over imagery.',
  info_overlay_opacity: 'Available when overlay is enabled. Higher values increase contrast.',
  info_animation_style: 'Entrance animation for this section. Choose None to disable motion here.',
  info_animation_speed: 'Available when an animation style is active. Controls animation duration.',
  info_parallax: 'Subtle media parallax on scroll. Respects reduced-motion preferences.',
  info_floating_card: 'Lifts content onto an elevated floating panel.',
  info_responsive_desktop: 'Optional desktop override. Default inherits the primary layout.',
  info_responsive_tablet: 'Optional tablet override for mid-width viewports.',
  info_responsive_mobile: 'Optional mobile override for phones.',
  info_media_type: 'Choose image, video, or background video. Related media fields appear to match.',
  info_video_fields: 'Available when media type includes video.',
  info_image_fields: 'Available when media type uses an image (including video fallbacks).',
  info_divider_style: 'Available when a top or bottom section divider is enabled.',
  info_sticky_summary: 'Keeps the buy box / order summary sticky while scrolling on large screens.',
  info_sticky_info_column: 'Sticky product info column paired with the media gallery (Dawn column sticky). Distinct from Nether sticky summary.',
  info_collection_layout_only: 'Used for Collection layout — provides fallback image and link.',
};

function settingIds(list) {
  return new Set((list || []).filter((s) => s && s.id).map((s) => s.id));
}

function findId(ids, candidates) {
  for (const c of candidates) {
    if (ids.has(c)) return c;
  }
  return null;
}

function scopeExpr(scope, id, op, value) {
  if (typeof value === 'boolean') {
    return `{{ ${scope}.${id} == ${value} }}`;
  }
  return `{{ ${scope}.${id} ${op} '${value}' }}`;
}

function orExpr(parts) {
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0];
  // visible_if wraps one Liquid expression; combine with `or`
  const inner = parts
    .map((p) => p.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, ''))
    .join(' or ');
  return `{{ ${inner} }}`;
}

function applyInfo(setting) {
  if (!setting.id || setting.info) return false;
  for (const rule of INFO_BY_SUFFIX) {
    if (rule.exclude && rule.exclude.test(setting.id)) continue;
    if (rule.test.test(setting.id)) {
      setting.info = rule.key;
      return true;
    }
  }
  if (setting.id === 'nether_enable_sticky_summary') {
    setting.info = 't:nether.common.info_sticky_summary';
    return true;
  }
  if (setting.id === 'enable_sticky_info') {
    setting.info = 't:nether.common.info_sticky_info_column';
    return true;
  }
  return false;
}

function applyVisibleIf(setting, list, scope) {
  if (!setting.id || setting.visible_if) return false;
  // Resource pickers that do not support visible_if
  const unsupported = new Set([
    'product',
    'product_list',
    'collection',
    'collection_list',
    'article',
    'blog',
    'page',
    'metaobject',
    'metaobject_list',
    'color_scheme_group',
  ]);
  if (unsupported.has(setting.type)) return false;

  const ids = settingIds(list);
  const id = setting.id;

  if (/glass_style$/.test(id)) {
    const enableId = id.replace(/glass_style$/, 'enable_glass');
    if (ids.has(enableId)) {
      setting.visible_if = scopeExpr(scope, enableId, '==', true);
      return true;
    }
  }

  if (/gradient_style$/.test(id)) {
    const enableId = id.replace(/gradient_style$/, 'enable_gradient');
    if (ids.has(enableId)) {
      setting.visible_if = scopeExpr(scope, enableId, '==', true);
      return true;
    }
  }

  if (/overlay_opacity$/.test(id)) {
    const enableId = findId(ids, [
      id.replace(/overlay_opacity$/, 'enable_image_overlay'),
      id.replace(/overlay_opacity$/, 'enable_overlay'),
      id.replace(/_overlay_opacity$/, '_enable_image_overlay'),
      id.replace(/_overlay_opacity$/, '_enable_overlay'),
    ]);
    if (enableId) {
      setting.visible_if = scopeExpr(scope, enableId, '==', true);
      return true;
    }
  }

  if (/animation_speed$/.test(id) || id === 'animation_speed') {
    const styleId = findId(ids, [
      id.replace(/animation_speed$/, 'animation_style'),
      'nether_animation_style',
      'animation_style',
    ]);
    if (styleId) {
      const styleSetting = list.find((s) => s.id === styleId);
      const hasNone = (styleSetting.options || []).some((o) => o.value === 'none');
      if (hasNone) {
        setting.visible_if = scopeExpr(scope, styleId, '!=', 'none');
        return true;
      }
    }
  }

  if (/split_media_position$/.test(id)) {
    if (id.includes('banner')) {
      setting.visible_if =
        "{{ section.settings.nether_banner_layout == 'split' or section.settings.nether_banner_layout == 'collection' or section.settings.nether_banner_layout == 'brand_story' }}";
      return true;
    }
    if (ids.has('nether_hero_layout')) {
      setting.visible_if = scopeExpr(scope, 'nether_hero_layout', '==', 'split');
      return true;
    }
  }

  if (id === 'nether_scroll_label' && ids.has('nether_show_scroll_indicator')) {
    setting.visible_if = scopeExpr(scope, 'nether_show_scroll_indicator', '==', true);
    return true;
  }

  if (/divider_style$/.test(id)) {
    const top = findId(ids, [
      id.replace(/divider_style$/, 'show_divider_top'),
      id.replace(/divider_style$/, 'show_top_divider'),
      'nether_show_divider_top',
      'nether_show_top_divider',
      'nether_banner_show_divider_top',
      'nether_content_show_divider_top',
    ]);
    const bottom = findId(ids, [
      id.replace(/divider_style$/, 'show_divider_bottom'),
      id.replace(/divider_style$/, 'show_bottom_divider'),
      'nether_show_divider_bottom',
      'nether_show_bottom_divider',
      'nether_banner_show_divider_bottom',
      'nether_content_show_divider_bottom',
    ]);
    const parts = [];
    if (top) parts.push(scopeExpr(scope, top, '==', true));
    if (bottom) parts.push(scopeExpr(scope, bottom, '==', true));
    const expr = orExpr(parts);
    if (expr) {
      setting.visible_if = expr;
      return true;
    }
  }

  // Media-type dependents
  const mediaTypeId = [...ids].find((x) => /media_type$/.test(x));
  if (mediaTypeId) {
    const videoLike =
      /(^|_)(video|video_url|video_loop|video_description|poster_image|poster)(_|$)/.test(id) ||
      /_video$/.test(id) ||
      /_video_url$/.test(id) ||
      /_video_loop$/.test(id) ||
      /_video_description$/.test(id) ||
      /_poster_image$/.test(id) ||
      /_poster$/.test(id);
    const imageLike =
      /(image_desktop|image_mobile|desktop_image|mobile_image)$/.test(id) ||
      /_image$/.test(id) && !/poster/.test(id);

    // Avoid matching unrelated ids like nether_image_ratio
    const isImagePickerField =
      setting.type === 'image_picker' &&
      (/image/.test(id) || /poster/.test(id)) &&
      !/ratio/.test(id);

    if (videoLike && setting.type !== 'image_picker') {
      setting.visible_if = orExpr([
        scopeExpr(scope, mediaTypeId, '==', 'video'),
        scopeExpr(scope, mediaTypeId, '==', 'background_video'),
      ]);
      if (!setting.info) setting.info = 't:nether.common.info_video_fields';
      return true;
    }

    if (isImagePickerField && /poster/.test(id)) {
      setting.visible_if = orExpr([
        scopeExpr(scope, mediaTypeId, '==', 'video'),
        scopeExpr(scope, mediaTypeId, '==', 'background_video'),
      ]);
      if (!setting.info) setting.info = 't:nether.common.info_video_fields';
      return true;
    }

    if (isImagePickerField && !/poster/.test(id)) {
      // Image fields for image mode + background video fallback
      const mediaSetting = list.find((s) => s.id === mediaTypeId);
      const opts = (mediaSetting.options || []).map((o) => o.value);
      if (opts.includes('background_video')) {
        setting.visible_if = orExpr([
          scopeExpr(scope, mediaTypeId, '==', 'image'),
          scopeExpr(scope, mediaTypeId, '==', 'background_video'),
        ]);
      } else {
        setting.visible_if = scopeExpr(scope, mediaTypeId, '==', 'image');
      }
      if (!setting.info) setting.info = 't:nether.common.info_image_fields';
      return true;
    }
  }

  return false;
}

function localizeHeaders(list, stats) {
  for (const setting of list || []) {
    if (setting.type === 'header' && setting.content && !String(setting.content).startsWith('t:')) {
      const mapped = HEADER_MAP[setting.content];
      if (mapped) {
        setting.content = mapped;
        stats.headersLocalized += 1;
      }
    }
  }
}

function patchSettingsList(list, scope, stats) {
  if (!Array.isArray(list)) return;
  localizeHeaders(list, stats);
  for (const setting of list) {
    if (applyInfo(setting)) stats.infoAdded += 1;
    if (applyVisibleIf(setting, list, scope)) stats.visibleIfAdded += 1;
  }
}

function reorderDividerStyle(list, stats) {
  if (!Array.isArray(list)) return;
  const styleIdx = list.findIndex((s) => s.id && /divider_style$/.test(s.id));
  if (styleIdx < 0) return;
  const topIdx = list.findIndex((s) => s.id && /(show_divider_top|show_top_divider)$/.test(s.id));
  const bottomIdx = list.findIndex((s) => s.id && /(show_divider_bottom|show_bottom_divider)$/.test(s.id));
  if (topIdx < 0 || bottomIdx < 0) return;
  if (styleIdx > Math.max(topIdx, bottomIdx)) return; // already after toggles
  const [styleSetting] = list.splice(styleIdx, 1);
  // After removing style, recompute bottom index
  const newBottomIdx = list.findIndex((s) => s.id && /(show_divider_bottom|show_bottom_divider)$/.test(s.id));
  list.splice(newBottomIdx + 1, 0, styleSetting);
  stats.reordered += 1;
}

function extractSchema(src) {
  const match = src.match(/(\{%\s*schema\s*%\})([\s\S]*?)(\{%\s*endschema\s*%\})/);
  if (!match) return null;
  return { open: match[1], json: match[2], close: match[3], full: match[0] };
}

function patchSectionFile(filePath, stats) {
  const src = fs.readFileSync(filePath, 'utf8');
  const extracted = extractSchema(src);
  if (!extracted) return;
  let schema;
  try {
    schema = JSON.parse(extracted.json);
  } catch (e) {
    stats.errors.push(`${path.basename(filePath)}: ${e.message}`);
    return;
  }

  patchSettingsList(schema.settings, 'section.settings', stats);
  reorderDividerStyle(schema.settings, stats);

  for (const block of schema.blocks || []) {
    patchSettingsList(block.settings, 'block.settings', stats);
    reorderDividerStyle(block.settings, stats);
  }

  // Banner-specific: H2/H3 hardcoded labels
  if (path.basename(filePath) === 'nether-banner.liquid') {
    const hl = (schema.settings || []).find((s) => s.id === 'nether_banner_heading_level');
    if (hl && hl.options) {
      for (const opt of hl.options) {
        if (opt.value === 'h2' && opt.label === 'H2') opt.label = 't:nether.common.heading_h2';
        if (opt.value === 'h3' && opt.label === 'H3') opt.label = 't:nether.common.heading_h3';
      }
    }
  }

  const newJson = '\n' + JSON.stringify(schema, null, 2) + '\n';
  const next = src.replace(extracted.full, extracted.open + newJson + extracted.close);
  fs.writeFileSync(filePath, next);
  stats.files += 1;
}

function patchThemeSettings(stats) {
  const schema = JSON.parse(fs.readFileSync(SETTINGS_SCHEMA, 'utf8'));
  const motion = schema.find((g) => g.name === 't:settings_schema.nether_motion.name');
  if (!motion) {
    stats.errors.push('nether_motion group not found');
    return;
  }

  const dependentIds = new Set([
    'nether_motion_style',
    'nether_motion_intensity',
    'nether_motion_speed',
    'nether_motion_respect_reduced',
    'nether_motion_force_reduced',
    'nether_motion_mobile',
    'nether_motion_desktop',
  ]);

  for (const setting of motion.settings) {
    if (setting.type === 'header') {
      if (!setting.visible_if) {
        setting.visible_if = '{{ settings.nether_motion_enabled == true }}';
        stats.visibleIfAdded += 1;
      }
      continue;
    }
    if (setting.id && dependentIds.has(setting.id) && !setting.visible_if) {
      setting.visible_if = '{{ settings.nether_motion_enabled == true }}';
      stats.visibleIfAdded += 1;
    }
  }

  // Improve outdated paragraph
  const paragraph = motion.settings.find((s) => s.type === 'paragraph');
  if (paragraph && String(paragraph.content).includes('nether_motion.settings.paragraph')) {
    // locale updated separately
  }

  fs.writeFileSync(SETTINGS_SCHEMA, JSON.stringify(schema, null, 2) + '\n');
  stats.files += 1;
}

function patchLocales(stats) {
  const locale = JSON.parse(fs.readFileSync(LOCALE_EN, 'utf8'));
  if (!locale.nether) locale.nether = {};
  if (!locale.nether.common) locale.nether.common = {};
  for (const [k, v] of Object.entries(COMMON_LOCALE_ADDITIONS)) {
    if (locale.nether.common[k] == null) {
      locale.nether.common[k] = v;
      stats.localeKeys += 1;
    }
  }

  // Production-ready motion paragraph
  if (locale.settings_schema?.nether_motion?.settings?.paragraph) {
    locale.settings_schema.nether_motion.settings.paragraph =
      'Global motion defaults for the Nether Motion Engine. Section-level animation controls can still override entrance style and speed.';
    stats.localeKeys += 1;
  }

  // Clarify sticky labels if present under product page
  const pp = locale.sections?.nether_product_page?.settings;
  if (pp?.nether_enable_sticky_summary && !pp.nether_enable_sticky_summary.info) {
    // info lives on setting via nether.common; ensure label stays clear
  }

  fs.writeFileSync(LOCALE_EN, JSON.stringify(locale, null, 2) + '\n');
  stats.files += 1;
}

function main() {
  const stats = {
    files: 0,
    visibleIfAdded: 0,
    infoAdded: 0,
    headersLocalized: 0,
    localeKeys: 0,
    reordered: 0,
    errors: [],
  };

  patchLocales(stats);
  patchThemeSettings(stats);

  for (const file of fs.readdirSync(SECTIONS_DIR)) {
    if (!file.startsWith('nether-') || !file.endsWith('.liquid')) continue;
    patchSectionFile(path.join(SECTIONS_DIR, file), stats);
  }

  console.log(JSON.stringify(stats, null, 2));
}

main();
