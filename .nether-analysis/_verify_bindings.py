"""Framework-wide settings binding verification for Nether sections (v2)."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECTIONS_DIR = ROOT / "sections"
SNIPPETS_DIR = ROOT / "snippets"
ASSETS_DIR = ROOT / "assets"

# Handle {%- render and {% render
RENDER_RE = re.compile(r"""\{%-?\s*render\s+['\"]([^'\"]+)['\"]""")
CSS_VAR_RE = re.compile(r"""--nether-[a-z0-9-]+""")
MODIFIER_WRITE_RE = re.compile(
    r"""(?:append:\s*['\"]|\|\s*append:\s*['\"]|['\"])\s*(nether-[a-z0-9_-]+--[a-z0-9_-]+)"""
)
CLASS_LITERAL_RE = re.compile(r"""nether-[a-z0-9_-]+--[a-z0-9_-]+""")


def extract_schema(text: str):
    if "{% schema %}" not in text:
        return None
    raw = text.split("{% schema %}", 1)[1].split("{% endschema %}", 1)[0]
    return json.loads(raw)


def liquid_body(text: str) -> str:
    return text.split("{% schema %}", 1)[0] if "{% schema %}" in text else text


def collect_settings(schema: dict):
    out = []
    for s in schema.get("settings") or []:
        if s.get("type") in ("header", "paragraph"):
            continue
        if "id" in s:
            out.append(
                {
                    "scope": "section",
                    "id": s["id"],
                    "type": s.get("type"),
                    "visible_if": s.get("visible_if"),
                    "options": [
                        o.get("value")
                        for o in (s.get("options") or [])
                        if isinstance(o, dict)
                    ],
                }
            )
    for b in schema.get("blocks") or []:
        btype = b.get("type", "?")
        for s in b.get("settings") or []:
            if s.get("type") in ("header", "paragraph"):
                continue
            if "id" in s:
                out.append(
                    {
                        "scope": f"block:{btype}",
                        "id": s["id"],
                        "type": s.get("type"),
                        "visible_if": s.get("visible_if"),
                        "options": [
                            o.get("value")
                            for o in (s.get("options") or [])
                            if isinstance(o, dict)
                        ],
                    }
                )
    return out


def load_map(directory: Path, pattern: str) -> dict[str, str]:
    result = {}
    for p in directory.glob(pattern):
        try:
            result[p.name] = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            pass
    return result


def transitive_snippets(body: str, snippets: dict[str, str], seen: set[str] | None = None):
    seen = seen or set()
    for name in RENDER_RE.findall(body):
        fname = name if name.endswith(".liquid") else f"{name}.liquid"
        if fname in seen:
            continue
        seen.add(fname)
        if fname in snippets:
            transitive_snippets(snippets[fname], snippets, seen)
    return seen


def setting_referenced(sid: str, corpus: str) -> bool:
    return bool(re.search(rf"\b{re.escape(sid)}\b", corpus))


def media_type_settings(settings):
    return [s for s in settings if s["id"] == "media_type" or s["id"].endswith("_media_type") or s["id"] == "nether_media_type"]


def analyze_media_drift(sec_name: str, settings: list[dict]):
    """Only flag when a setting's visible_if references THIS setting's id with a missing option."""
    issues = []
    by_id_scope = defaultdict(list)
    for s in settings:
        by_id_scope[s["id"]].append(s)

    for mt in media_type_settings(settings):
        opts = set(mt.get("options") or [])
        for other in settings:
            # Same scope family: section media vs section dependents; block media vs same block
            if mt["scope"] != other["scope"]:
                # Allow section media_type to gate section settings only
                if not (mt["scope"] == "section" and other["scope"] == "section"):
                    continue
            vif = other.get("visible_if") or ""
            if mt["id"] not in vif:
                continue
            for token in ("background_video", "video", "image"):
                # Match quoted option in visible_if
                if re.search(rf"['\"]{token}['\"]", vif) and token not in opts:
                    issues.append(
                        {
                            "section": sec_name,
                            "media_setting": f"{mt['scope']}.{mt['id']}",
                            "missing_option": token,
                            "dependent": f"{other['scope']}.{other['id']}",
                            "visible_if": vif,
                        }
                    )
    return issues


CRITICAL_FAMILIES = [
    "height",
    "width",
    "position",
    "alignment",
    "media_type",
    "overlay",
    "image",
    "video",
    "button",
    "spacing",
    "padding",
    "columns",
    "glass",
    "gradient",
    "divider",
    "layout",
]


def is_critical(sid: str) -> bool:
    s = sid.lower()
    return any(k in s for k in CRITICAL_FAMILIES)


def check_modifier_css_consumers(corpus: str, css: str):
    """Find BEM modifiers written in liquid that have no CSS rule."""
    written = set()
    # Dynamic: append: ' nether-foo--bar-' | append: var  -> stem nether-foo--bar-
    dynamic_stems = set(
        re.findall(
            r"""append:\s*['\"][^'\"]*?(nether-[a-z0-9_-]+--)['\"]""",
            corpus,
        )
    )
    # Also capture full literal modifiers in class lists
    literals = set(CLASS_LITERAL_RE.findall(corpus))
    written |= literals

    missing = []
    for mod in sorted(literals):
        # Skip highly dynamic ones that are incomplete stems
        if mod.endswith("-"):
            continue
        if mod not in css and f".{mod}" not in css:
            # Allow partial: if any rule mentions the stem prefix with attribute or pattern
            stem = re.sub(r"-[a-z0-9]+$", "-", mod)
            # Check if CSS has the modifier class at all
            if mod not in css:
                missing.append(mod)
    return sorted(set(missing)), sorted(dynamic_stems)


def main():
    snippets = load_map(SNIPPETS_DIR, "*.liquid")
    assets = {}
    for p in ASSETS_DIR.glob("*"):
        if p.suffix in (".css", ".js"):
            assets[p.name] = p.read_text(encoding="utf-8", errors="ignore")
    all_css = "\n".join(v for k, v in assets.items() if k.endswith(".css"))
    all_assets = "\n".join(assets.values())
    all_snippets = "\n".join(snippets.values())

    sections = sorted(SECTIONS_DIR.glob("nether-*.liquid"))
    report = []
    dead_all = []
    weak_all = []
    media_issues = []
    critical_dead = []
    orphan_heuristics = []
    modifier_orphans = defaultdict(list)

    total_settings = 0

    for sec in sections:
        text = sec.read_text(encoding="utf-8")
        schema = extract_schema(text)
        body = liquid_body(text)
        if not schema:
            report.append(
                {
                    "section": sec.name,
                    "settings": 0,
                    "dead": [],
                    "weak": [],
                    "note": "no schema",
                }
            )
            continue

        settings = collect_settings(schema)
        total_settings += len(settings)
        used = transitive_snippets(body, snippets)
        corpus = body
        for sn in used:
            if sn in snippets:
                corpus += "\n" + snippets[sn]

        dead = []
        weak = []
        for s in settings:
            sid = s["id"]
            if setting_referenced(sid, corpus):
                continue
            in_any_snip = bool(re.search(rf"\b{re.escape(sid)}\b", all_snippets))
            in_assets = sid in all_assets
            entry = {**s}
            if in_any_snip or in_assets:
                entry["reason"] = "outside render tree"
                weak.append(entry)
            else:
                dead.append(entry)
                if is_critical(sid):
                    critical_dead.append((sec.name, entry))

        media_issues.extend(analyze_media_drift(sec.name, settings))

        # Orphan adapt spacer
        if "nether-hero__media::before" in body and "padding-bottom" in body:
            if "height-adapt" not in body:
                orphan_heuristics.append(
                    {"section": sec.name, "issue": "orphan adapt spacer"}
                )

        # Ungated width/position
        lines = body.splitlines()
        for i, line in enumerate(lines):
            if "append" in line and "nether-hero--width-" in line:
                window = "\n".join(lines[max(0, i - 20) : i + 1])
                if "uses_hero_shell" not in window and "centered_" not in window:
                    orphan_heuristics.append(
                        {"section": sec.name, "issue": "ungated width class"}
                    )
                    break
        for i, line in enumerate(lines):
            if "append" in line and "nether-hero--position-" in line:
                window = "\n".join(lines[max(0, i - 20) : i + 1])
                if "uses_hero_shell" not in window:
                    orphan_heuristics.append(
                        {"section": sec.name, "issue": "ungated position class"}
                    )
                    break

        missing_mods, stems = check_modifier_css_consumers(corpus, all_css)
        # Filter noise: keep layout-critical modifiers
        keep_keys = (
            "height-",
            "width-",
            "position-",
            "align-",
            "layout-",
            "overlay-",
            "media-",
            "glass-",
            "columns-",
            "gap-",
            "spacing-",
        )
        for mod in missing_mods:
            if any(k in mod for k in keep_keys):
                modifier_orphans[sec.name].append(mod)

        report.append(
            {
                "section": sec.name,
                "settings": len(settings),
                "dead": dead,
                "weak": weak,
                "snippets_count": len(used),
                "critical_modifier_orphans": modifier_orphans[sec.name][:30],
            }
        )
        dead_all.extend((sec.name, d) for d in dead)
        weak_all.extend((sec.name, w) for w in weak)

    # CSS vars: written in liquid (sections+snippets) vs read in CSS
    liquid_all = "\n".join(liquid_body(s.read_text(encoding="utf-8")) for s in sections)
    liquid_all += "\n" + all_snippets
    written_vars = set(CSS_VAR_RE.findall(liquid_all))
    read_vars = set(CSS_VAR_RE.findall(all_css))
    # Vars only written, never read in CSS (excluding those only used as style="" inline which still need CSS sometimes)
    unused_vars = sorted(v for v in written_vars if v not in read_vars)

    print("=" * 72)
    print("NETHER SETTINGS BINDING VERIFICATION v2")
    print("=" * 72)
    print(f"Sections audited: {len(sections)}")
    print(f"Total settings:   {total_settings}")
    print(f"Dead settings:    {len(dead_all)}")
    print(f"Weak (outside tree): {len(weak_all)}")
    print(f"Media schema drift: {len(media_issues)}")
    print(f"Orphan heuristics: {len(orphan_heuristics)}")
    print(f"Critical dead: {len(critical_dead)}")
    print()

    print("--- PER SECTION ---")
    for r in report:
        flag = "!" if r["dead"] or r["weak"] or r.get("critical_modifier_orphans") else " "
        note = f" note={r['note']}" if r.get("note") else ""
        print(
            f"{flag} {r['section']}: settings={r['settings']} dead={len(r['dead'])} "
            f"weak={len(r['weak'])} snips={r.get('snippets_count',0)} "
            f"mod_orphans={len(r.get('critical_modifier_orphans') or [])}{note}"
        )

    print("\n--- DEAD SETTINGS ---")
    if not dead_all:
        print("  (none)")
    for sec, d in dead_all:
        print(f"  {sec} | {d['scope']} | {d['id']} ({d['type']})")

    print("\n--- WEAK SETTINGS (outside render tree) ---")
    if not weak_all:
        print("  (none)")
    for sec, w in weak_all:
        print(f"  {sec} | {w['scope']} | {w['id']}")

    print("\n--- MEDIA TYPE / VISIBLE_IF DRIFT ---")
    if not media_issues:
        print("  (none)")
    for m in media_issues:
        print(
            f"  {m['section']}: {m['media_setting']} missing '{m['missing_option']}' "
            f"for {m['dependent']}"
        )

    print("\n--- ORPHAN HEURISTICS ---")
    if not orphan_heuristics:
        print("  (none)")
    for c in orphan_heuristics:
        print(f"  {c['section']}: {c['issue']}")

    print("\n--- CRITICAL MODIFIER ORPHANS (written, no CSS match) ---")
    if not any(modifier_orphans.values()):
        print("  (none)")
    for sec, mods in sorted(modifier_orphans.items()):
        if not mods:
            continue
        print(f"  {sec}:")
        for m in mods[:40]:
            print(f"    .{m}")

    print("\n--- CSS VARS IN LIQUID NOT IN CSS (sample) ---")
    # Filter to likely layout tokens
    layoutish = [
        v
        for v in unused_vars
        if any(
            k in v
            for k in (
                "height",
                "width",
                "position",
                "align",
                "overlay",
                "padding",
                "gap",
                "column",
                "duration",
                "min-height",
            )
        )
    ]
    for v in layoutish[:60]:
        print(f"  {v}")
    print(f"  (layoutish unused: {len(layoutish)} / total unused: {len(unused_vars)})")

    out = {
        "sections": len(sections),
        "total_settings": total_settings,
        "dead": [{"section": s, **d} for s, d in dead_all],
        "weak": [{"section": s, **w} for s, w in weak_all],
        "media_issues": media_issues,
        "orphan_heuristics": orphan_heuristics,
        "modifier_orphans": {k: v for k, v in modifier_orphans.items() if v},
        "unused_layout_css_vars": layoutish,
    }
    out_path = ROOT / ".nether-analysis" / "_verify_bindings_out.json"
    out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
