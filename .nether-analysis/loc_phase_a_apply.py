"""Phase A localization migration (tightened gates).

- Remaps structural .label translation keys only
- Excludes .default / .info / .placeholder / .presets / settings_schema / sections.all
- Adds nether.common.<domain>.* nested shared keys across all locale schema files
- Repoints t: references on "label" fields only in liquid/JSON schemas
- Deletes orphaned remapped label keys when unreferenced
- Does NOT change English/translated wording
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
EN_PATH = os.path.join(ROOT, "locales", "en.default.schema.json")
# Include '-' for Dawn-style section namespaces (announcement-bar, image-with-text, …)
T_REF = re.compile(r"t:([a-zA-Z0-9_.-]+)")
# Only rewrite t: refs on LABEL fields — never default/info/preset/placeholder
LABEL_T_REF = re.compile(r'("label"\s*:\s*")t:([a-zA-Z0-9_.-]+)(")')


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def walk_leaves(node, prefix=None):
    prefix = prefix or []
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk_leaves(v, prefix + [k])
    elif isinstance(node, str):
        yield ".".join(prefix), node


def get_path(data, dotted):
    cur = data
    for p in dotted.split("."):
        if not isinstance(cur, dict) or p not in cur:
            return None
        cur = cur[p]
    return cur


def set_path(data, dotted, value):
    parts = dotted.split(".")
    cur = data
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def del_path(data, dotted):
    parts = dotted.split(".")
    stack = []
    cur = data
    for i, p in enumerate(parts[:-1]):
        if not isinstance(cur, dict) or p not in cur:
            return False
        stack.append((cur, p))
        cur = cur[p]
    if not isinstance(cur, dict) or parts[-1] not in cur:
        return False
    del cur[parts[-1]]
    for parent, key in reversed(stack):
        child = parent.get(key)
        if isinstance(child, dict) and len(child) == 0:
            del parent[key]
        else:
            break
    return True


def count_leaves(node):
    return sum(1 for _ in walk_leaves(node))


def is_excluded_key(dotted):
    parts = dotted.split(".")
    leaf = parts[-1]
    if leaf in {"default", "info", "placeholder"}:
        return True
    if "presets" in parts:
        return True
    if parts[0] == "settings_schema":
        return True
    if len(parts) > 1 and parts[0] == "sections" and parts[1] == "all":
        return True
    return False


def collect_targets():
    targets = []
    for folder in ("sections", "snippets", "layout", "config", "blocks", "templates"):
        d = os.path.join(ROOT, folder)
        if not os.path.isdir(d):
            continue
        for root, _, files in os.walk(d):
            for fn in files:
                if fn.endswith((".liquid", ".json")):
                    targets.append(os.path.join(root, fn))
    return targets


def main():
    inv_path = os.path.join(ROOT, "LOCALIZATION_INVENTORY.csv")
    remap = {}
    shared_english = {}
    with open(inv_path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["phase_a_remappable"] != "yes":
                continue
            old = row["key_path"]
            new = row["proposed_new_key"]
            if not new:
                continue
            shared_english[new] = row["value"]
            if old != new:
                remap[old] = new

    print(f"Phase A remap entries: {len(remap)}")
    print(f"Canonical shared keys: {len(shared_english)}")

    remap = {
        o: n
        for o, n in remap.items()
        if not is_excluded_key(o) and o.endswith(".label")
    }
    print(f"After safety filter: {len(remap)}")

    targets = collect_targets()
    files_changed = 0
    refs_rewritten = 0

    for path in targets:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        original = text

        def repl(m):
            nonlocal refs_rewritten
            key = m.group(2)
            if key in remap:
                refs_rewritten += 1
                return f"{m.group(1)}t:{remap[key]}{m.group(3)}"
            return m.group(0)

        text = LABEL_T_REF.sub(repl, text)
        if text != original:
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
            files_changed += 1

    remaining_refs = defaultdict(int)
    for path in targets:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        for m in T_REF.finditer(text):
            remaining_refs[m.group(1)] += 1

    still_pointing_at_old = sum(1 for k in remap if remaining_refs.get(k, 0) > 0)
    print(f"Schema files updated: {files_changed}")
    print(f"label t: refs rewritten: {refs_rewritten}")
    print(f"Old keys still referenced after rewrite: {still_pointing_at_old}")

    locale_files = [
        os.path.join(ROOT, "locales", fn)
        for fn in os.listdir(os.path.join(ROOT, "locales"))
        if fn.endswith(".schema.json")
    ]

    en = load_json(EN_PATH)
    en_leaves = list(walk_leaves(en))
    value_to_paths = defaultdict(list)
    for dotted, val in en_leaves:
        value_to_paths[val.strip()].append(dotted)

    donor_for_shared = {}
    for newk, eng in shared_english.items():
        donors = value_to_paths.get(eng.strip(), [])
        preferred = (
            [d for d in donors if d in remap]
            or [d for d in donors if d.startswith("nether.common.") and d.count(".") == 2]
            or donors
        )
        if not preferred:
            print(f"WARNING: no donor for {newk} ({eng!r})")
            continue
        donor_for_shared[newk] = preferred[0]

    locale_stats = []
    for loc_path in sorted(locale_files):
        loc = load_json(loc_path)
        before = count_leaves(loc)

        for newk, donor in donor_for_shared.items():
            translated = get_path(loc, donor)
            if translated is None:
                translated = shared_english[newk]
            if get_path(loc, newk) is None:
                set_path(loc, newk, translated)

        deleted = 0
        for old in remap:
            if remaining_refs.get(old, 0) > 0:
                continue
            if del_path(loc, old):
                deleted += 1

        after = count_leaves(loc)
        save_json(loc_path, loc)
        locale_stats.append((os.path.basename(loc_path), before, after, deleted))
        print(f"  {os.path.basename(loc_path)}: {before} -> {after} (deleted {deleted} orphan labels)")

    en_after = count_leaves(load_json(EN_PATH))
    print("\n=== PHASE A COMPLETE ===")
    print(f"en.default.schema.json leaf count: {en_after}")
    print(f"Shopify limit: 3400 | headroom: {3400 - en_after}")
    if en_after > 3400:
        print("ERROR: still over limit", file=sys.stderr)
        sys.exit(1)

    report_path = os.path.join(ROOT, "LOCALIZATION_PHASE_A_REPORT.md")
    lines = [
        "# Nether Localization Phase A — Implementation Report\n\n",
        "## Gate\n\n",
        "Tightened §8.1: remapped structural `.label` leaves only. ",
        "Excluded `.default`, `.info`, `.placeholder`, `.presets`, `settings_schema.*`, `sections.all.*`.\n",
        "Liquid/JSON rewrites applied only to `\"label\": \"t:…\"` fields.\n\n",
        "## Results\n\n",
        f"- Schema files with rewritten label `t:` refs: **{files_changed}**\n",
        f"- Label `t:` references rewritten: **{refs_rewritten}**\n",
        f"- Canonical shared keys ensured: **{len(donor_for_shared)}**\n",
        f"- Old keys still referenced (preserved): **{still_pointing_at_old}**\n",
        f"- `en.default.schema.json` values: **{en_after}**\n",
        f"- Headroom below 3,400: **{3400 - en_after}**\n\n",
        "## Locale file counts\n\n",
        "| File | Before | After | Orphan labels deleted |\n|---|---:|---:|---:|\n",
    ]
    for name, before, after, deleted in locale_stats:
        lines.append(f"| `{name}` | {before} | {after} | {deleted} |\n")
    lines.append(
        "\n## Notes\n\n"
        "- No section/snippet/JS/CSS files were deleted or renamed.\n"
        "- Merchant content keys were not remapped.\n"
        "- Wording was not changed; translations were copied from donor keys per locale.\n"
    )
    with open(report_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"Wrote {report_path}")


if __name__ == "__main__":
    main()
