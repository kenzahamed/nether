"""Temporary investigation scan — do not ship. Delete after report."""
import json
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
EN_PATH = ROOT / "locales" / "en.default.schema.json"
T = re.compile(r"t:([a-zA-Z0-9_.\-]+)")

# Dawn-origin section filenames (hyphenated / classic Dawn)
DAWNISH = {
    "announcement-bar",
    "image-banner",
    "image-with-text",
    "rich-text",
    "slideshow",
    "multicolumn",
    "multirow",
    "collage",
    "collapsible-content",
    "collection-list",
    "featured-blog",
    "featured-collection",
    "featured-product",
    "contact-form",
    "email-signup-banner",
    "newsletter",
    "video",
    "page",
    "main-article",
    "main-blog",
    "main-collection-banner",
    "main-collection-product-grid",
    "main-list-collections",
    "main-product",
    "main-search",
    "related-products",
    "cart-drawer",
    "cart-notification",
    "cart-icon-bubble",
    "cart-live-region-link",
    "footer",
    "header",
    "pickup-availability",
    "predictive-search",
    "quick-order-list",
    "bulk-quick-order-list",
}


def walk(node, path=None):
    path = path or []
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk(value, path + [key])
    elif isinstance(node, str):
        yield ".".join(path), node


def schema_text(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if "{% schema %}" not in text:
        return ""
    return text.split("{% schema %}", 1)[1].split("{% endschema %}", 1)[0]


def is_schema_key(key: str) -> bool:
    return key.startswith(
        ("sections.", "nether.", "settings_schema.", "general.", "options.", "templates.")
    )


def main():
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    leaves = dict(walk(en))

    print("EN_LEAVES", len(leaves))

    # Image banner deep dive
    print("\n=== IMAGE-BANNER LOCALE ===")
    for k, v in sorted(leaves.items()):
        if k.startswith("sections.image-banner"):
            print(f"  {k} = {v!r}")

    ib = ROOT / "sections" / "image-banner.liquid"
    schema = schema_text(ib)
    refs = sorted(set(T.findall(schema)))
    print("\n=== IMAGE-BANNER SCHEMA REFS ===")
    missing_ib = []
    for key in refs:
        ok = key in leaves
        status = "OK" if ok else "MISS"
        print(f"  {status} t:{key}")
        if not ok:
            missing_ib.append(key)
    print("IMAGE_BANNER_MISSING", len(missing_ib))

    # Historical Dawn key the merchant reported
    old = "sections.image-banner.settings.image_overlay_opacity.label"
    print("\nOLD_OVERLAY_KEY_PRESENT", old in leaves)
    print("UI_OVERLAY", leaves.get("nether.common.ui.media.overlay_opacity"))

    # Full theme scan
    print("\n=== FULL SCHEMA REF SCAN ===")
    missing = defaultdict(list)
    section_missing = defaultdict(list)
    for folder in ("sections", "snippets", "config", "layout", "blocks", "templates"):
        directory = ROOT / folder
        if not directory.is_dir():
            continue
        for path in directory.rglob("*"):
            if path.suffix not in (".liquid", ".json"):
                continue
            text = path.read_text(encoding="utf-8")
            # For liquid sections, prefer schema-only to avoid storefront t: noise
            if path.suffix == ".liquid" and "{% schema %}" in text:
                text = schema_text(path)
            rel = str(path.relative_to(ROOT)).replace("\\", "/")
            for match in T.finditer(text):
                key = match.group(1)
                if not is_schema_key(key):
                    continue
                if key not in leaves:
                    missing[key].append(rel)
                    if path.parent.name == "sections":
                        section_missing[path.stem].append(key)

    print("MISSING_UNIQUE", len(missing))
    for key in sorted(missing):
        files = sorted(set(missing[key]))
        print(f"  MISS {key}")
        for f in files[:5]:
            print(f"       in {f}")

    print("\n=== SECTIONS WITH MISSING KEYS ===")
    dawn_affected = []
    nether_affected = []
    for stem, keys in sorted(section_missing.items()):
        uniq = sorted(set(keys))
        kind = "DAWNISH" if stem in DAWNISH or "-" in stem else "OTHER"
        print(f"  {kind} {stem}: {len(uniq)} missing")
        for k in uniq[:12]:
            print(f"    - {k}")
        if len(uniq) > 12:
            print(f"    ... +{len(uniq)-12} more")
        if kind == "DAWNISH":
            dawn_affected.append((stem, uniq))
        else:
            nether_affected.append((stem, uniq))

    print("\nDAWNISH_SECTIONS_AFFECTED", len(dawn_affected))
    print("OTHER_SECTIONS_AFFECTED", len(nether_affected))

    # Compare: keys liquid expects under sections.<stem> that are absent
    print("\n=== SECTION-LOCAL KEY COVERAGE (Dawn-ish) ===")
    for stem in sorted(DAWNISH):
        path = ROOT / "sections" / f"{stem}.liquid"
        if not path.exists():
            continue
        schema = schema_text(path)
        if not schema:
            continue
        local_refs = sorted(
            {
                k
                for k in T.findall(schema)
                if k.startswith(f"sections.{stem}.") or k.startswith(f"sections.{stem.replace('-', '_')}.")
            }
        )
        miss = [k for k in local_refs if k not in leaves]
        present = [k for k in local_refs if k in leaves]
        ui_refs = sorted({k for k in T.findall(schema) if k.startswith("nether.common.ui.")})
        ui_miss = [k for k in ui_refs if k not in leaves]
        print(
            f"  {stem}: local_refs={len(local_refs)} local_ok={len(present)} "
            f"local_miss={len(miss)} ui_refs={len(ui_refs)} ui_miss={len(ui_miss)}"
        )
        for k in miss:
            print(f"    LOCAL_MISS {k}")
        for k in ui_miss:
            print(f"    UI_MISS {k}")

    # Check whether remapped Dawn label keys were deleted from locale while still needed
    # Look for image_overlay style: section-local label paths that liquid no longer uses
    print("\n=== SAMPLE: keys present in inventory CSV but missing in locale? ===")
    # Skip if no csv parse needed

    # Hyphenated section namespaces in locale
    print("\n=== HYPHENATED SECTION KEYS IN LOCALE ===")
    hyphen_sections = sorted(
        {
            k.split(".")[1]
            for k in leaves
            if k.startswith("sections.") and "-" in k.split(".")[1]
        }
    )
    print("count", len(hyphen_sections))
    for s in hyphen_sections:
        print(" ", s)


if __name__ == "__main__":
    main()
