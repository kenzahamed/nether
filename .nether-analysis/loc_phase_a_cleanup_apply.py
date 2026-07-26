"""Phase A cleanup: remove orphaned nether.common.ui.* keys from all schema locales."""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
ORPHANS = [
    "nether.common.ui.labels.sticky_buy_box_nether",
]
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
    if not isinstance(node, dict):
        return False
    for key in list(node.keys()):
        child = node[key]
        if isinstance(child, dict) and prune_empty(child):
            del node[key]
    return len(node) == 0


def collect_refs():
    refs = set()
    for folder in ("sections", "snippets", "config", "layout", "blocks", "templates"):
        directory = ROOT / folder
        if not directory.is_dir():
            continue
        for path in directory.rglob("*"):
            if path.suffix not in (".liquid", ".json"):
                continue
            text = path.read_text(encoding="utf-8")
            for match in T.finditer(text):
                refs.add(match.group(1))
    return refs


def main():
    schema_files = sorted((ROOT / "locales").glob("*.schema.json"))
    removed = {key: [] for key in ORPHANS}

    for path in schema_files:
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for key in ORPHANS:
            if delete_path(data, key):
                removed[key].append(path.name)
                changed = True
        if changed:
            prune_empty(data)
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print("UPDATED", path.name)

    for key, files in removed.items():
        print(f"REMOVED {key} from {len(files)} files")

    # Post-verify
    en = json.loads((ROOT / "locales" / "en.default.schema.json").read_text(encoding="utf-8"))
    leaves = dict(walk(en))
    refs = collect_refs()
    ui_keys = sorted(k for k in leaves if k.startswith("nether.common.ui."))
    orphans = [k for k in ui_keys if k not in refs]
    print("EN_LEAF_COUNT", len(leaves))
    print("UI_TOTAL", len(ui_keys))
    print("UI_ORPHANS_REMAINING", len(orphans))
    for key in orphans:
        print("STILL_ORPHAN", key)
    for key in ORPHANS:
        print("ORPHAN_GONE", key, key not in leaves)


if __name__ == "__main__":
    main()
