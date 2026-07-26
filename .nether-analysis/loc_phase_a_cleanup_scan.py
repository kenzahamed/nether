"""Phase A cleanup: find orphaned nether.common.ui.* keys and unused legacy candidates."""
import collections
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
T = re.compile(r"t:([a-zA-Z0-9_.-]+)")


def walk(node, path=None):
    path = path or []
    if isinstance(node, dict):
        for key, value in node.items():
            yield from walk(value, path + [key])
    elif isinstance(node, str):
        yield ".".join(path), node


def delete_path(root, dotted):
    parts = dotted.split(".")
    cur = root
    for part in parts[:-1]:
        if not isinstance(cur, dict) or part not in cur:
            return False
        cur = cur[part]
    leaf = parts[-1]
    if isinstance(cur, dict) and leaf in cur and isinstance(cur[leaf], str):
        del cur[leaf]
        return True
    return False


def prune_empty(node):
    """Remove empty dicts bottom-up. Returns True if node itself is empty dict."""
    if not isinstance(node, dict):
        return False
    for key in list(node.keys()):
        child = node[key]
        if isinstance(child, dict):
            if prune_empty(child):
                del node[key]
    return len(node) == 0


def collect_refs():
    refs = collections.Counter()
    for folder in ("sections", "snippets", "config", "layout", "blocks", "templates"):
        directory = ROOT / folder
        if not directory.is_dir():
            continue
        for path in directory.rglob("*"):
            if path.suffix not in (".liquid", ".json"):
                continue
            text = path.read_text(encoding="utf-8")
            for match in T.finditer(text):
                refs[match.group(1)] += 1
    return refs


def main():
    en_path = ROOT / "locales" / "en.default.schema.json"
    en = json.loads(en_path.read_text(encoding="utf-8"))
    leaves = dict(walk(en))
    refs = collect_refs()

    ui_keys = sorted(k for k in leaves if k.startswith("nether.common.ui."))
    orphans = [k for k in ui_keys if refs.get(k, 0) == 0]
    referenced = [k for k in ui_keys if refs.get(k, 0) > 0]

    print("UI_TOTAL", len(ui_keys))
    print("UI_REFERENCED", len(referenced))
    print("UI_ORPHANS", len(orphans))
    for key in orphans:
        print("ORPHAN", key, "=>", leaves[key])

    # Legacy keys that Phase A may have duplicated into ui.* — candidates for removal
    # Only consider nether.common.* flat string keys (not nested dicts / info_* / etc.)
    # A legacy key is "safely removable" only if:
    #  1. zero references in theme files
    #  2. AND there is an equivalent ui.* key with same English value that IS referenced
    # Per cleanup brief: verify no legacy key can NOW be safely removed.
    # We report orphans among ALL nether.common leaves that are not ui.*, not settings, etc.

    common_leaves = {k: v for k, v in leaves.items() if k.startswith("nether.common.") and not k.startswith("nether.common.ui.")}
    legacy_orphans = [k for k in sorted(common_leaves) if refs.get(k, 0) == 0]
    legacy_referenced = [k for k in sorted(common_leaves) if refs.get(k, 0) > 0]
    print("LEGACY_COMMON_TOTAL", len(common_leaves))
    print("LEGACY_COMMON_REFERENCED", len(legacy_referenced))
    print("LEGACY_COMMON_ORPHANS", len(legacy_orphans))

    # For sticky_buy_box specifically and any ui orphan that has a legacy twin
    for orphan in orphans:
        val = leaves[orphan]
        twins = [k for k, v in common_leaves.items() if v == val]
        print("ORPHAN_TWINS", orphan, twins, [(t, refs.get(t, 0)) for t in twins])

    # Among legacy orphans, which have a referenced ui twin with same English?
    safely_removable_legacy = []
    for key in legacy_orphans:
        val = common_leaves[key]
        ui_twins = [k for k, v in leaves.items() if k.startswith("nether.common.ui.") and v == val and refs.get(k, 0) > 0]
        if ui_twins:
            safely_removable_legacy.append((key, val, ui_twins))
    print("SAFELY_REMOVABLE_LEGACY_COUNT", len(safely_removable_legacy))
    for row in safely_removable_legacy[:50]:
        print("SAFE_LEGACY", row[0], "=>", row[1], "twins", row[2])

    # Also list legacy orphans WITHOUT ui twin (inventory only — do not remove in Phase A cleanup)
    print("LEGACY_ORPHAN_SAMPLE")
    for key in legacy_orphans[:30]:
        print(" ", key, "=>", common_leaves[key][:60])


if __name__ == "__main__":
    main()
