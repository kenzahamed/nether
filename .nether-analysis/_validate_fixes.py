"""Post-fix validation."""
import json
import re
from pathlib import Path

ROOT = Path(r"c:\Shopify\nether-main")

for name in ["nether-collection", "nether-product", "nether-content", "nether-media"]:
    text = (ROOT / "sections" / f"{name}.liquid").read_text(encoding="utf-8")
    raw = text.split("{% schema %}", 1)[1].split("{% endschema %}", 1)[0]
    schema = json.loads(raw)
    print(name, "schema OK")

# content_row drift
text = (ROOT / "sections" / "nether-content.liquid").read_text(encoding="utf-8")
# isolate content_row block
m = re.search(r'"type":\s*"content_row"[\s\S]*?(?=\n    \{\n      "type":|\n  \],\n  "presets")', text)
chunk = m.group(0) if m else ""
print("content_row option bg_video:", '"value": "background_video"' in chunk)
print("content_row vif bg_video:", "background_video" in chunk)

# collection/product no bg in media_type options but check remaining vif
for name in ["nether-collection", "nether-product"]:
    text = (ROOT / "sections" / f"{name}.liquid").read_text(encoding="utf-8")
    # find media_type options for blocks
    drifts = len(re.findall(
        r"media_type == 'background_video'",
        text,
    ))
    print(f"{name} remaining background_video refs:", drifts)

# position visible_if
for name in ["nether-collection", "nether-product", "nether-media"]:
    text = (ROOT / "sections" / f"{name}.liquid").read_text(encoding="utf-8")
    m = re.search(
        r'"id":\s*"nether_content_position"[\s\S]{0,1500}?"visible_if":\s*"([^"]+)"',
        text,
    )
    print(f"{name} position vif:", m.group(1) if m else "MISSING")

css = (ROOT / "assets" / "component-media.css").read_text(encoding="utf-8")
print(
    "media size css:",
    "nether-media-card--size-small" in css,
    "nether-media-card--size-large" in css,
    "nether-media-card--size-editorial" in css,
)

# Re-run media drift analyzer quickly
from importlib.util import spec_from_loader, module_from_spec
# inline simplified
RENDER_RE = re.compile(r"""\{%-?\s*render\s+['\"]([^'\"]+)['\"]""")

def extract_schema(text):
    raw = text.split("{% schema %}", 1)[1].split("{% endschema %}", 1)[0]
    return json.loads(raw)

issues = []
for sec in sorted((ROOT / "sections").glob("nether-*.liquid")):
    text = sec.read_text(encoding="utf-8")
    if "{% schema %}" not in text:
        continue
    schema = extract_schema(text)
    settings = []
    for s in schema.get("settings") or []:
        if "id" in s:
            settings.append({"scope": "section", **s})
    for b in schema.get("blocks") or []:
        for s in b.get("settings") or []:
            if "id" in s:
                settings.append({"scope": f"block:{b.get('type')}", **s})
    media = [s for s in settings if s.get("id") in ("media_type", "nether_media_type") or str(s.get("id","")).endswith("_media_type")]
    for mt in media:
        opts = {o.get("value") for o in (mt.get("options") or []) if isinstance(o, dict)}
        for other in settings:
            if mt["scope"] != other["scope"] and not (mt["scope"] == "section" and other["scope"] == "section"):
                continue
            vif = other.get("visible_if") or ""
            if mt["id"] not in vif:
                continue
            for token in ("background_video", "video", "image"):
                if f"'{token}'" in vif and token not in opts:
                    issues.append(f"{sec.name} {mt['scope']}.{mt['id']} missing {token} for {other['id']}")

print("media drift remaining:", len(issues))
for i in issues:
    print(" ", i)
