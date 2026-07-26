"""Sprint 7 Positioning Engine — static verification."""
from pathlib import Path
import json
import re

root = Path(r"c:\Shopify\nether-main")
report = {"ok": True, "checks": [], "failures": []}

def check(name, cond, detail=""):
    report["checks"].append({"name": name, "pass": bool(cond), "detail": detail})
    if not cond:
        report["ok"] = False
        report["failures"].append({"name": name, "detail": detail})

pos_css = (root / "assets/component-position.css").read_text(encoding="utf-8")
hero_css = (root / "assets/component-hero.css").read_text(encoding="utf-8")
theme = (root / "layout/theme.liquid").read_text(encoding="utf-8")
password = (root / "layout/password.liquid").read_text(encoding="utf-8")
snippet = (root / "snippets/nether-position-value.liquid").read_text(encoding="utf-8")

slots = [
    "top-left", "top-center", "top-right",
    "middle-left", "middle-center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right",
]

check("position.css exists", (root / "assets/component-position.css").exists())
check("position-value snippet exists", (root / "snippets/nether-position-value.liquid").exists())
check("theme loads position.css", "component-position.css" in theme)
check("password loads position.css", "component-position.css" in password)
check("safe-area tokens", "--nether-safe-top" in pos_css and "env(safe-area-inset-top" in pos_css)
check("center alias", "nether-hero--position-center" in pos_css and "nether-pos--center" in pos_css)
check("snippet maps center", "center" in snippet and "middle-center" in snippet)

for slot in slots:
    check(f"token map {slot}", f"--position-{slot}" in pos_css or f"nether-pos--{slot}" in pos_css)

# Hero no longer duplicates full 9-point value assignments (bridge only)
legacy_block = ".nether-hero--position-top-left {\n  --nether-hero-content-align: flex-start;"
check("hero removed duplicated 9-point literals", legacy_block not in hero_css)
check("hero re-bridges pos tokens", "--nether-hero-content-align: var(--nether-pos-x)" in hero_css)
check("hero safe-area padding", "nether-safe-top" in hero_css)

# Framework CSS no longer has per-card 9-point blocks
for name in ["component-product-showcase.css", "component-collection-showcase.css", "component-media.css"]:
    text = (root / "assets" / name).read_text(encoding="utf-8")
    check(
        f"{name} deduped 9-point",
        f"--position-top-left ." not in text.replace("nether-product-card", "X").replace("nether-collection-card", "X").replace("nether-media-card", "X")
        or "9-point placement: component-position.css" in text,
        "comment or absence of duplicated rules",
    )
    check(f"{name} references engine", "component-position.css" in text)

# Floating overrides no longer force flex-end
for name in ["component-cta.css", "component-banner.css", "component-content.css"]:
    text = (root / "assets" / name).read_text(encoding="utf-8")
    # Find floating shell blocks
    if "floating" in text:
        check(
            f"{name} floating does not force align-items flex-end on shell",
            "align-items: flex-end;\n  padding-bottom" not in text,
        )

# Liquid normalize wired
for path in [
    "snippets/nether-product-card.liquid",
    "snippets/nether-collection-card.liquid",
    "snippets/nether-media-card.liquid",
    "snippets/nether-product-promotional-card.liquid",
    "sections/nether-hero.liquid",
    "sections/nether-banner.liquid",
    "sections/nether-content.liquid",
    "sections/nether-cta.liquid",
    "sections/nether-newsletter.liquid",
]:
    text = (root / path).read_text(encoding="utf-8")
    check(f"{path} uses nether-position-value", "nether-position-value" in text)

# Stack layout selectors use real layout names
check("collection card_layout stack rule", "nether-collection--layout-card_layout" in pos_css)
check("media minimal_gallery stack rule", "nether-media--layout-minimal_gallery" in pos_css)
check("no bogus media card_grid", "nether-media--layout-card_grid" not in pos_css)

out = root / ".nether-analysis/_sprint7_verify.json"
out.write_text(json.dumps(report, indent=2), encoding="utf-8")
print("OK" if report["ok"] else "FAIL")
print(f"checks={len(report['checks'])} failures={len(report['failures'])}")
for f in report["failures"]:
    print(" -", f["name"], f["detail"])
