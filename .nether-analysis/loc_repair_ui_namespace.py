"""Repair nether.common domain collision: move Phase A vocab under nether.common.ui.*
and restore clobbered flat string keys (layout, content, …) from git HEAD.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOMAINS = [
    "layout",
    "sizing",
    "media",
    "motion",
    "typography",
    "actions",
    "states",
    "commerce",
    "content",
    "labels",
]
LABEL_T_REF = re.compile(r'("label"\s*:\s*")t:(nether\.common\.(?:' + "|".join(DOMAINS) + r')\.[a-z0-9_]+)(")')
ANY_NESTED = re.compile(r"t:(nether\.common\.(?:" + "|".join(DOMAINS) + r")\.[a-z0-9_]+)")
EXACT_FLAT = re.compile(r't:nether\.common\.(' + "|".join(DOMAINS) + r')"')


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def walk(n, p=None):
    p = p or []
    if isinstance(n, dict):
        for k, v in n.items():
            yield from walk(v, p + [k])
    elif isinstance(n, str):
        yield ".".join(p), n


def main():
    # Original flat common from git HEAD
    raw = subprocess.check_output(
        ["git", "show", "HEAD:locales/en.default.schema.json"], cwd=ROOT
    )
    head_en = json.loads(raw.decode("utf-8"))
    head_common = head_en["nether"]["common"]

    locale_files = [
        os.path.join(ROOT, "locales", fn)
        for fn in os.listdir(os.path.join(ROOT, "locales"))
        if fn.endswith(".schema.json")
    ]

    # For non-EN locales, pull original flat values from git when available
    head_locales = {}
    for path in locale_files:
        name = os.path.basename(path)
        if name == "en.default.schema.json":
            head_locales[name] = head_en
            continue
        try:
            raw = subprocess.check_output(
                ["git", "show", f"HEAD:locales/{name}"], cwd=ROOT, stderr=subprocess.DEVNULL
            )
            head_locales[name] = json.loads(raw.decode("utf-8"))
        except Exception:
            head_locales[name] = None

    for path in locale_files:
        name = os.path.basename(path)
        loc = load(path)
        common = loc.setdefault("nether", {}).setdefault("common", {})
        ui = common.setdefault("ui", {})

        # Move domain dicts under ui.*
        for d in DOMAINS:
            val = common.get(d)
            if isinstance(val, dict):
                # merge into ui.d
                target = ui.setdefault(d, {})
                for k, v in val.items():
                    if k not in target:
                        target[k] = v
                del common[d]

        # Restore flat string keys from HEAD if they were strings
        head = head_locales.get(name) or head_en
        head_c = head.get("nether", {}).get("common", {})
        for d in DOMAINS:
            hv = head_c.get(d)
            if isinstance(hv, str) and d not in common:
                # Prefer this locale's HEAD translation if present
                common[d] = hv

        save(path, loc)
        print(f"repaired {name}")

    # Rewrite liquid label refs: nether.common.DOMAIN.x -> nether.common.ui.DOMAIN.x
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
    rewrites = 0
    pattern = re.compile(
        r'("label"\s*:\s*")t:nether\.common\.(' + "|".join(DOMAINS) + r')\.([a-z0-9_]+)(")'
    )
    for path in targets:
        text = open(path, encoding="utf-8").read()
        original = text

        def repl(m):
            nonlocal rewrites
            rewrites += 1
            return f"{m.group(1)}t:nether.common.ui.{m.group(2)}.{m.group(3)}{m.group(4)}"

        text = pattern.sub(repl, text)
        if text != original:
            open(path, "w", encoding="utf-8", newline="\n").write(text)
            files_changed += 1

    print(f"liquid/json files updated: {files_changed}, nested refs moved under ui.*: {rewrites}")

    # Verify
    en = load(os.path.join(ROOT, "locales", "en.default.schema.json"))
    leaves = {d for d, _ in walk(en)}
    print("en leaves", len(leaves), "headroom", 3400 - len(leaves))
    for k in [
        "nether.common.layout",
        "nether.common.content",
        "nether.common.ui.layout.left",
        "nether.common.ui.typography.heading",
        "nether.common.ui.motion.animation_speed",
    ]:
        cur = en
        ok = True
        for p in k.split("."):
            if not isinstance(cur, dict) or p not in cur:
                ok = False
                break
            cur = cur[p]
        print(k, "=>", repr(cur) if ok and isinstance(cur, str) else ("OK-dict" if ok else "MISSING"))

    missing = set()
    flat_ok = 0
    for path in targets:
        text = open(path, encoding="utf-8").read()
        for m in re.finditer(r"t:([a-zA-Z0-9_.-]+)", text):
            key = m.group(1)
            if key.startswith(("sections.", "nether.", "settings_schema.")) and key not in leaves:
                missing.add(key)
        flat_ok += len(EXACT_FLAT.findall(text))
    print("exact flat domain refs (restored targets):", flat_ok)
    print("missing keys:", len(missing))
    for k in sorted(missing)[:30]:
        print(" ", k)


if __name__ == "__main__":
    main()
