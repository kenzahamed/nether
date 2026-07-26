#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
files = [
    "snippets/nether-section-padding.liquid",
    "snippets/nether-layout-container-class.liquid",
    "snippets/nether-layout-header-class.liquid",
    "snippets/nether-media-content.liquid",
    "snippets/nether-faq-content.liquid",
    "sections/nether-commerce.liquid",
    "sections/nether-media.liquid",
    "sections/nether-hero.liquid",
    "assets/component-layout.css",
    "layout/theme.liquid",
    "layout/password.liquid",
]
for rel in files:
    p = ROOT / rel
    print(f"{'OK' if p.exists() else 'MISSING':7} {rel}")

left = []
for p in (ROOT / "sections").glob("nether-*.liquid"):
    t = p.read_text(encoding="utf-8")
    if "times: 0.75" in t and "padding_top" in t:
        left.append(p.name)
print("leftover padding blocks:", left or "none")

pads = [
    p.name
    for p in (ROOT / "sections").glob("nether-*.liquid")
    if "nether-section-padding" in p.read_text(encoding="utf-8")
]
print("sections with padding snippet:", len(pads), pads)

cont = [
    p.name
    for p in (ROOT / "sections").glob("nether-*.liquid")
    if "nether-layout-container-class" in p.read_text(encoding="utf-8")
]
print("sections with container class:", len(cont), cont)

headers = [
    p.name
    for p in (ROOT / "snippets").glob("nether-*-content.liquid")
    if "nether-layout-header-class" in p.read_text(encoding="utf-8")
]
print("content snippets with header class:", headers)

theme = (ROOT / "layout/theme.liquid").read_text(encoding="utf-8")
print("theme loads layout css:", "component-layout.css" in theme)
print("password loads layout css:", "component-layout.css" in (ROOT / "layout/password.liquid").read_text(encoding="utf-8"))

# Theme check: any Sprint 6 filenames in offense list
tc = (ROOT / "theme-check-sprint6-layout.txt").read_text(encoding="utf-8", errors="ignore")
sprint6_markers = [
    "nether-section-padding",
    "nether-layout-container-class",
    "nether-layout-header-class",
    "component-layout.css",
]
for m in sprint6_markers:
    print(f"theme-check mentions {m}:", m in tc)
