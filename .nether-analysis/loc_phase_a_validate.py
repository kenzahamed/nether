"""Phase A localization validation — integrity + regression gates."""
import collections
import json
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
EN_PATH = ROOT / "locales" / "en.default.schema.json"
T = re.compile(r"t:([a-zA-Z0-9_.-]+)")
LABEL = re.compile(r'"label"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
INFO = re.compile(r'"info"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
DEFAULT = re.compile(r'"default"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
PLACEHOLDER = re.compile(r'"placeholder"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
HEADER_CONTENT = re.compile(
    r'"(?:header|content)"\s*:\s*"t:([a-zA-Z0-9_.-]+)"'
)


def walk(node, path=None):
    path = path or []
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk(value, path + [key])
    elif isinstance(node, str):
        yield ".".join(path), node


def is_schema_key(key: str) -> bool:
    return key.startswith(
        ("sections.", "nether.", "settings_schema.", "general.", "options.", "templates.")
    )


def is_ui_key(key: str) -> bool:
    return key.startswith("nether.common.ui.")


def main():
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    leaves = dict(walk(en))
    ui_keys = {k: v for k, v in leaves.items() if is_ui_key(k)}

    print("=== TRANSLATION COUNTS ===")
    print("EN_LEAF_COUNT", len(leaves))
    print("LIMIT", 3400)
    print("HEADROOM", 3400 - len(leaves))
    print("UI_SHARED_KEYS", len(ui_keys))

    by_val = collections.defaultdict(list)
    for key, value in ui_keys.items():
        by_val[value].append(key)
    dup_vals = {v: ks for v, ks in by_val.items() if len(ks) > 1}
    print("UI_DUPLICATE_VALUE_GROUPS", len(dup_vals))
    for value, keys in sorted(dup_vals.items(), key=lambda x: (-len(x[1]), x[0]))[:20]:
        print(f"  DUP_VAL {value!r} -> {keys}")

    # Legacy flat keys that must still exist (namespace collision fix)
    for key in ("nether.common.layout", "nether.common.content", "nether.common.motion"):
        print(f"LEGACY_FLAT {key} =>", leaves.get(key, "MISSING"))

    print("\n=== SCHEMA LOCALE PARITY ===")
    schema_files = sorted((ROOT / "locales").glob("*.schema.json"))
    en_keys = set(leaves)
    parity_ok = True
    for path in schema_files:
        data = json.loads(path.read_text(encoding="utf-8"))
        keys = set(dict(walk(data)))
        print(f"{path.name}: {len(keys)}")
        if path.name == "en.default.schema.json":
            continue
        missing_in = en_keys - keys
        extra_in = keys - en_keys
        if missing_in or extra_in:
            parity_ok = False
            print(f"  MISSING={len(missing_in)} EXTRA={len(extra_in)}")
            for key in sorted(missing_in)[:8]:
                print("   miss", key)
            for key in sorted(extra_in)[:8]:
                print("   extra", key)
    print("PARITY_OK", parity_ok)

    print("\n=== REFERENCE INTEGRITY ===")
    all_refs = collections.Counter()
    missing = collections.defaultdict(list)
    orphaned = set(ui_keys)
    info_on_ui = []
    default_on_ui = []
    placeholder_on_ui = []
    label_on_ui = 0
    header_on_ui = 0
    files_scanned = 0
    raw_t_in_non_schema = []  # not applicable for liquid schemas

    for folder in ("sections", "snippets", "config", "layout", "blocks", "templates"):
        directory = ROOT / folder
        if not directory.is_dir():
            continue
        for path in directory.rglob("*"):
            if path.suffix not in (".liquid", ".json"):
                continue
            text = path.read_text(encoding="utf-8")
            files_scanned += 1
            rel = str(path.relative_to(ROOT)).replace("\\", "/")
            for match in T.finditer(text):
                key = match.group(1)
                if not is_schema_key(key):
                    continue
                all_refs[key] += 1
                if key not in leaves:
                    missing[key].append(rel)
                if key in orphaned:
                    orphaned.discard(key)
            for match in LABEL.finditer(text):
                if is_ui_key(match.group(1)):
                    label_on_ui += 1
            for match in INFO.finditer(text):
                if is_ui_key(match.group(1)):
                    info_on_ui.append((match.group(1), rel))
            for match in DEFAULT.finditer(text):
                if is_ui_key(match.group(1)):
                    default_on_ui.append((match.group(1), rel))
            for match in PLACEHOLDER.finditer(text):
                if is_ui_key(match.group(1)):
                    placeholder_on_ui.append((match.group(1), rel))
            for match in HEADER_CONTENT.finditer(text):
                if is_ui_key(match.group(1)):
                    header_on_ui += 1

    print("FILES_SCANNED", files_scanned)
    print("UNIQUE_SCHEMA_REFS", len(all_refs))
    print("MISSING_UNIQUE_KEYS", len(missing))
    for key in sorted(missing):
        print(f"  MISSING {key} in {missing[key][0]}" + (f" (+{len(missing[key]) - 1})" if len(missing[key]) > 1 else ""))

    print("ORPHANED_UI_KEYS", len(orphaned))
    for key in sorted(orphaned):
        print(f"  ORPHAN {key} => {ui_keys[key]}")

    print("LABEL_ON_UI", label_on_ui)
    print("HEADER_CONTENT_ON_UI", header_on_ui)
    print("INFO_ON_UI", len(info_on_ui))
    for item in info_on_ui[:20]:
        print("  INFO_UI", item)
    print("DEFAULT_ON_UI", len(default_on_ui))
    for item in default_on_ui[:20]:
        print("  DEFAULT_UI", item)
    print("PLACEHOLDER_ON_UI", len(placeholder_on_ui))
    for item in placeholder_on_ui[:20]:
        print("  PLACEHOLDER_UI", item)

    print("\n=== PRESET / MERCHANT CONTENT REGRESSION ===")
    preset_on_ui = []
    default_samples = []
    info_samples = []
    placeholder_samples = []
    for path in (ROOT / "sections").glob("*.liquid"):
        text = path.read_text(encoding="utf-8")
        preset_match = re.search(r'"presets"\s*:\s*\[(.*?)\]\s*(?:,|\s*\})', text, re.S)
        if preset_match:
            for name_match in re.finditer(r'"name"\s*:\s*"t:([^"]+)"', preset_match.group(1)):
                key = name_match.group(1)
                if is_ui_key(key):
                    preset_on_ui.append((key, path.name))
        for match in DEFAULT.finditer(text):
            key = match.group(1)
            if not is_ui_key(key):
                default_samples.append((path.name, key, leaves.get(key, "MISSING")))
        for match in INFO.finditer(text):
            key = match.group(1)
            if not is_ui_key(key):
                info_samples.append((path.name, key, leaves.get(key, "MISSING")))
        for match in PLACEHOLDER.finditer(text):
            key = match.group(1)
            if not is_ui_key(key):
                placeholder_samples.append((path.name, key, leaves.get(key, "MISSING")))

    print("PRESET_ON_UI", len(preset_on_ui))
    for item in preset_on_ui:
        print("  PRESET_UI", item)

    # Sample representative sections for defaults/info remaining local
    reps = [
        "header.liquid",
        "footer.liquid",
        "nether-hero.liquid",
        "nether-product-page.liquid",
        "nether-collection.liquid",
        "nether-cart-page.liquid",
        "main-search.liquid",
        "nether-media.liquid",  # lookbook-ish
        "featured-collection.liquid",
        "nether-bundles.liquid",
        "nether-testimonials.liquid",
        "nether-commerce.liquid",
        "nether-cta.liquid",
        "nether-content.liquid",
    ]
    print("\n=== REPRESENTATIVE SECTION LABEL/DEFAULT SAMPLES ===")
    for name in reps:
        path = ROOT / "sections" / name
        if not path.exists():
            print(f"MISSING_FILE {name}")
            continue
        text = path.read_text(encoding="utf-8")
        labels = LABEL.findall(text)
        defaults = DEFAULT.findall(text)
        infos = INFO.findall(text)
        ui_labels = [k for k in labels if is_ui_key(k)]
        local_labels = [k for k in labels if not is_ui_key(k)]
        missing_labels = [k for k in labels if k not in leaves]
        missing_defaults = [k for k in defaults if k not in leaves]
        missing_infos = [k for k in infos if k not in leaves]
        print(
            f"{name}: labels={len(labels)} ui_labels={len(ui_labels)} "
            f"local_labels={len(local_labels)} defaults={len(defaults)} infos={len(infos)} "
            f"missing_labels={len(missing_labels)} missing_defaults={len(missing_defaults)} "
            f"missing_infos={len(missing_infos)}"
        )
        if missing_labels:
            print("  miss_label", missing_labels[:5])
        if missing_defaults:
            print("  miss_default", missing_defaults[:5])
        if missing_infos:
            print("  miss_info", missing_infos[:5])
        # show a few resolved UI labels
        for key in ui_labels[:3]:
            print(f"  ui_label {key} => {leaves.get(key)}")
        for key in defaults[:2]:
            print(f"  default {key} => {leaves.get(key, 'MISSING')}")
        for key in infos[:2]:
            print(f"  info {key} => {leaves.get(key, 'MISSING')}")

    # Namespace conflict: domain object vs flat string
    print("\n=== NAMESPACE CONFLICT CHECK ===")
    common = en.get("nether", {}).get("common", {})
    conflicts = []
    for key, value in common.items():
        if key == "ui":
            continue
        if isinstance(value, dict):
            # nested domain at top of common that isn't ui
            conflicts.append(("nested_non_ui", key, "dict"))
        # if ui has same name as flat string key, that's intentional nesting under ui
    ui = common.get("ui", {})
    for domain, node in ui.items():
        flat = common.get(domain)
        if isinstance(flat, str) and isinstance(node, dict):
            print(f"OK_COEXIST flat nether.common.{domain}={flat!r} + ui.{domain} dict")
        elif flat is not None and not isinstance(flat, str):
            conflicts.append(("bad_coexist", domain, type(flat).__name__))
    print("CONFLICTS", conflicts)

    print("\n=== SUMMARY FLAGS ===")
    # Filter missing: known pre-existing settings_schema.social-media
    phase_a_missing = {
        k: v
        for k, v in missing.items()
        if not k.startswith("settings_schema.social-media")
    }
    print("PREEXISTING_SOCIAL_MEDIA_MISSING", sum(1 for k in missing if k.startswith("settings_schema.social-media")))
    print("PHASE_A_RELATED_MISSING", len(phase_a_missing))
    for key in sorted(phase_a_missing)[:50]:
        print("  PHASE_A_MISS", key)
    print("ORPHANS", len(orphaned))
    print("MERCHANT_CONTENT_LEAK_TO_UI", len(info_on_ui) + len(default_on_ui) + len(placeholder_on_ui) + len(preset_on_ui))
    print("UNDER_LIMIT", len(leaves) < 3400)


if __name__ == "__main__":
    main()
