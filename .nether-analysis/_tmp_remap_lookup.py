import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
deleted = [
    "sections.image-banner.settings.image_overlay_opacity.label",
    "sections.image-banner.settings.image_height.label",
    "sections.image-banner.settings.image.label",
    "sections.image-banner.settings.image_2.label",
]
with open(ROOT / "LOCALIZATION_INVENTORY.csv", encoding="utf-8") as f:
    rows = {r["key_path"]: r for r in csv.DictReader(f)}
for k in deleted:
    r = rows.get(k)
    if not r:
        print(k, "NOT_IN_INVENTORY")
        continue
    print(
        k,
        "->",
        r.get("proposed_new_key") or "(none)",
        "remappable=",
        r.get("phase_a_remappable"),
        "class=",
        r.get("classification"),
    )
# count remappable image-banner labels
n = 0
for k, r in rows.items():
    if k.startswith("sections.image-banner.") and k.endswith(".label"):
        print(
            "LABEL",
            k,
            "remappable=",
            r["phase_a_remappable"],
            "->",
            r.get("proposed_new_key") or "",
        )
        if r["phase_a_remappable"] == "yes":
            n += 1
print("REMAPPABLE_IB_LABELS", n)
