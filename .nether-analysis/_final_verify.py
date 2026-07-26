"""Final framework binding verification report generator."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECTIONS = sorted((ROOT / "sections").glob("nether-*.liquid"))
SNIPPETS = {p.name: p.read_text(encoding="utf-8") for p in (ROOT / "snippets").glob("*.liquid")}
ASSETS_CSS = "\n".join(
    p.read_text(encoding="utf-8", errors="ignore")
    for p in (ROOT / "assets").glob("*.css")
)

RENDER_RE = re.compile(r"""\{%-?\s*render\s+['\"]([^'\"]+)['\"]""")


def extract_schema(text: str):
    if "{% schema %}" not in text:
        return None
    return json.loads(text.split("{% schema %}", 1)[1].split("{% endschema %}", 1)[0])


def liquid_body(text: str) -> str:
    return text.split("{% schema %}", 1)[0] if "{% schema %}" in text else text


def transitive(body: str, seen=None):
    seen = seen or set()
    for name in RENDER_RE.findall(body):
        fname = name if name.endswith(".liquid") else f"{name}.liquid"
        if fname in seen:
            continue
        seen.add(fname)
        if fname in SNIPPETS:
            transitive(SNIPPETS[fname], seen)
    return seen


def collect_settings(schema):
    out = []
    for s in schema.get("settings") or []:
        if s.get("type") in ("header", "paragraph") or "id" not in s:
            continue
        out.append({"scope": "section", **s})
    for b in schema.get("blocks") or []:
        for s in b.get("settings") or []:
            if s.get("type") in ("header", "paragraph") or "id" not in s:
                continue
            out.append({"scope": f"block:{b.get('type')}", **s})
    return out


def media_drift(sec_name, settings):
    issues = []
    media = [
        s
        for s in settings
        if s["id"] in ("media_type", "nether_media_type") or s["id"].endswith("_media_type")
    ]
    for mt in media:
        opts = {o.get("value") for o in (mt.get("options") or []) if isinstance(o, dict)}
        for other in settings:
            if mt["scope"] != other["scope"] and not (
                mt["scope"] == "section" and other["scope"] == "section"
            ):
                continue
            vif = other.get("visible_if") or ""
            if mt["id"] not in vif:
                continue
            for token in ("background_video", "video", "image"):
                if f"'{token}'" in vif and token not in opts:
                    issues.append(
                        f"{sec_name}:{mt['scope']}.{mt['id']} missing {token} for {other['id']}"
                    )
    return issues


total = 0
verified = 0
dead_literal = []
dynamic_ok = []
drift = []
position_gates = []

for sec in SECTIONS:
    text = sec.read_text(encoding="utf-8")
    schema = extract_schema(text)
    if not schema:
        continue
    settings = collect_settings(schema)
    total += len(settings)
    body = liquid_body(text)
    used = transitive(body)
    corpus = body + "\n" + "\n".join(SNIPPETS[s] for s in used if s in SNIPPETS)

    for s in settings:
        sid = s["id"]
        if re.search(rf"\b{re.escape(sid)}\b", corpus):
            verified += 1
            continue
        # dynamic key pattern highlight_N
        if re.fullmatch(r"highlight_\d+", sid) and "highlight_key" in corpus:
            verified += 1
            dynamic_ok.append(f"{sec.name}:{sid}")
            continue
        # share_label via share-button outside nether prefix sometimes
        if sid == "share_label" and "share_label" in SNIPPETS.get("share-button.liquid", ""):
            verified += 1
            continue
        dead_literal.append(f"{sec.name}|{s['scope']}|{sid}")

    drift.extend(media_drift(sec.name, settings))

    # position gates present
    for s in settings:
        if s["id"] in ("nether_content_position", "nether_banner_content_position") and s.get(
            "visible_if"
        ):
            position_gates.append(f"{sec.name}:{s['id']}")

print("sections", len([s for s in SECTIONS]))
print("total_settings", total)
print("verified_consumers", verified)
print("dead_literal", len(dead_literal))
for d in dead_literal:
    print(" ", d)
print("dynamic_ok", len(dynamic_ok))
print("media_drift", len(drift))
for d in drift:
    print(" ", d)
print("position_gates", len(position_gates))
for p in position_gates:
    print(" ", p)

# size css
print("media_size_css", "nether-media-card--size-small" in ASSETS_CSS)
print(
    "collection_size_css",
    "nether-collection-card--size-small" in ASSETS_CSS,
)
print("product_size_css", "nether-product-card--size-small" in ASSETS_CSS)

# recovery integrity
hero_media = (ROOT / "snippets" / "nether-hero-media.liquid").read_text(encoding="utf-8")
print(
    "layout_forces_media_type",
    "nether_layout == 'background_video'" in hero_media
    and "assign media_type = 'background_video'" in hero_media,
)

out = {
    "sections": len(SECTIONS),
    "total_settings": total,
    "verified": verified,
    "dead": dead_literal,
    "media_drift": drift,
    "position_gates": position_gates,
}
(ROOT / ".nether-analysis" / "_final_verify.json").write_text(
    json.dumps(out, indent=2), encoding="utf-8"
)
print("wrote _final_verify.json")
