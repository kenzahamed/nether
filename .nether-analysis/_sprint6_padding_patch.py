#!/usr/bin/env python3
"""Sprint 6: replace duplicated section padding CSS with shared snippet."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ROOT / "sections"

pattern = re.compile(
    r"[ \t]*\.section-\{\{ section\.id \}\}-padding \{\s*"
    r"padding-top: \{\{ section\.settings\.padding_top \| times: 0\.75 \| round: 0 \}\}px;\s*"
    r"padding-bottom: \{\{ section\.settings\.padding_bottom \| times: 0\.75 \| round: 0 \}\}px;\s*"
    r"\}\s*"
    r"@media screen and \(min-width: 750px\) \{\s*"
    r"\.section-\{\{ section\.id \}\}-padding \{\s*"
    r"padding-top: \{\{ section\.settings\.padding_top \}\}px;\s*"
    r"padding-bottom: \{\{ section\.settings\.padding_bottom \}\}px;\s*"
    r"\}\s*"
    r"\}",
    re.MULTILINE,
)

replacement = "  {% render 'nether-section-padding', section: section %}"

updated = []
skipped = []

for path in sorted(SECTIONS.glob("nether-*.liquid")):
    text = path.read_text(encoding="utf-8")
    new, n = pattern.subn(replacement, text)
    if n:
        path.write_text(new, encoding="utf-8", newline="\n")
        updated.append((path.name, n))
    else:
        skipped.append(path.name)

print("UPDATED", len(updated))
for name, n in updated:
    print(f"  {name}: {n}")
print("SKIPPED", len(skipped))
for name in skipped:
    print(f"  {name}")
