"""Fixup: complete Phase A remaps for hyphenated section keys.

The first apply pass used a t: regex without '-', so refs like
t:sections.announcement-bar.* were not rewritten while locale keys were deleted.
This pass rewrites remaining old label refs using the inventory remap map.
"""
from __future__ import annotations

import csv
import json
import os
import re
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# Include hyphens used in Dawn-style section namespaces
LABEL_T_REF = re.compile(r'("label"\s*:\s*")t:([a-zA-Z0-9_.-]+)(")')
T_REF = re.compile(r"t:([a-zA-Z0-9_.-]+)")


def walk(n, p=None):
    p = p or []
    if isinstance(n, dict):
        for k, v in n.items():
            yield from walk(v, p + [k])
    elif isinstance(n, str):
        yield ".".join(p), n


def get_path(data, dotted):
    cur = data
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def set_path(data, dotted, value):
    parts = dotted.split(".")
    cur = data
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def main():
    remap = {}
    shared_english = {}
    with open(os.path.join(ROOT, "LOCALIZATION_INVENTORY.csv"), encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["phase_a_remappable"] != "yes":
                continue
            old, new = row["key_path"], row["proposed_new_key"]
            if not new or old == new:
                continue
            if not old.endswith(".label"):
                continue
            remap[old] = new
            shared_english[new] = row["value"]

    print(f"remap size: {len(remap)}")

    targets = []
    for folder in ("sections", "snippets", "layout", "config", "blocks", "templates"):
        d = os.path.join(ROOT, folder)
        if not os.path.isdir(d):
            continue
        for root, _, files in os.walk(d):
            for fn in files:
                if fn.endswith((".liquid", ".json")):
                    targets.append(os.path.join(root, fn))

    files_changed = 0
    refs_rewritten = 0
    for path in targets:
        text = open(path, encoding="utf-8").read()
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
            open(path, "w", encoding="utf-8", newline="\n").write(text)
            files_changed += 1

    print(f"files updated: {files_changed}")
    print(f"label refs rewritten: {refs_rewritten}")

    # Ensure shared keys exist in all locales (idempotent)
    en = json.load(open(os.path.join(ROOT, "locales", "en.default.schema.json"), encoding="utf-8"))
    en_by_val = defaultdict(list)
    for d, v in walk(en):
        en_by_val[v.strip()].append(d)

    for loc_name in os.listdir(os.path.join(ROOT, "locales")):
        if not loc_name.endswith(".schema.json"):
            continue
        path = os.path.join(ROOT, "locales", loc_name)
        loc = json.load(open(path, encoding="utf-8"))
        changed = False
        for newk, eng in shared_english.items():
            if get_path(loc, newk) is not None:
                continue
            # donor: any en path with that english that still exists in this locale, else eng
            donors = en_by_val.get(eng.strip(), [])
            translated = None
            for donor in donors:
                translated = get_path(loc, donor)
                if translated is not None:
                    break
            if translated is None:
                translated = eng
            set_path(loc, newk, translated)
            changed = True
        if changed:
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                json.dump(loc, f, ensure_ascii=False, indent=2)
                f.write("\n")

    # Verify no remapped-old keys still referenced; no missing keys among schema refs
    en = json.load(open(os.path.join(ROOT, "locales", "en.default.schema.json"), encoding="utf-8"))
    leaves = {d for d, _ in walk(en)}
    remaining_old = set()
    missing = set()
    for path in targets:
        text = open(path, encoding="utf-8").read()
        for m in T_REF.finditer(text):
            key = m.group(1)
            if key in remap:
                remaining_old.add(key)
            if key.startswith(("sections.", "nether.", "settings_schema.")) and key not in leaves:
                missing.add(key)

    print(f"remaining old remapped refs: {len(remaining_old)}")
    for k in sorted(remaining_old)[:20]:
        print("  OLD", k)
    print(f"missing schema keys: {len(missing)}")
    for k in sorted(missing)[:40]:
        print("  MISSING", k)
    print("en leaves:", len(leaves), "headroom:", 3400 - len(leaves))


if __name__ == "__main__":
    main()
