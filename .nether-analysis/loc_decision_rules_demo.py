"""Demonstrate Shared vs held-back decisions with real Nether paths."""
import csv, collections, os, sys
sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
rows = list(csv.DictReader(open(os.path.join(ROOT, "LOCALIZATION_INVENTORY.csv"), encoding="utf-8")))

by_val = collections.defaultdict(list)
for r in rows:
    by_val[r["value"]].append(r)

def show_value(v, limit=12):
    items = by_val.get(v, [])
    if not items:
        print(f"\nVALUE missing: {v!r}")
        return
    cls = items[0]["classification"]
    newk = items[0].get("proposed_new_key") or "(none)"
    secs = sorted({i["section"] for i in items})
    print(f"\nVALUE: {v!r}")
    print(f"  classification={cls}  proposed={newk}")
    print(f"  occurrences={len(items)}  sections={secs}")
    for i in items[:limit]:
        print(f"    {i['key_path']}")

print("============================================================")
print("A. SAFE SHARED — generic UI concepts, identical meaning")
print("============================================================")
for v in ["Heading", "Left", "Animation speed", "Image ratio", "Fade"]:
    show_value(v, 6)

print("\n============================================================")
print("B. HELD BACK — same English, NOT promoted to Shared")
print("   (why: single-section only OR length > 40)")
print("============================================================")
for v in [
    "Enable on desktop",
    "Drawer width",
    "Collapsible content",
    "Subtle media parallax on scroll. Respects reduced motion preferences.",
    "[Manage languages](/admin/settings/languages)",
]:
    show_value(v, 8)

print("\n============================================================")
print("C. SECTION-SPECIFIC — unique wording, never a merge candidate")
print("============================================================")
ss = [r for r in rows if r["classification"] == "Section-specific" and len(r["value"]) > 50]
# diversify by section
seen = set()
picked = []
for r in sorted(ss, key=lambda x: -len(x["value"])):
    if r["section"] in seen:
        continue
    seen.add(r["section"])
    picked.append(r)
    if len(picked) >= 8:
        break
for r in picked:
    print(f"\n  section={r['section']}")
    print(f"  key={r['key_path']}")
    print(f"  value={r['value'][:140]}")

print("\n============================================================")
print("D. RISK REVIEW — Shared by wording match; meaning needs human check")
print("   Same English option reused under different setting parents")
print("============================================================")
for v in ["Default", "Primary", "Scale", "Slide", "Content", "Style", "Standard", "Card"]:
    items = by_val[v]
    parents = sorted({".".join(i["key_path"].split(".")[:-1]) for i in items})
    leafs = sorted({i["key_path"].split(".")[-2] if len(i["key_path"].split("."))>1 else i["key_path"] for i in items})
    print(f"\nVALUE: {v!r}  class={items[0]['classification']}  occ={len(items)}")
    print(f"  sample parents:")
    for p in parents[:8]:
        print(f"    {p}")

print("\n============================================================")
print("E. CLASSIFIER GATES (what actually ran)")
print("============================================================")
print("Shared IFF:")
print("  1) English value appears in >= 2 distinct section namespaces")
print("  2) len(value) <= 40")
print("  3) value is not a numeric/unit literal")
print("Else if duplicate_count >= 2 -> Merge Candidate (NOT migrated in Phase A)")
print("Else -> Section-specific")
print()
print("IMPORTANT: Phase A did NOT run deep semantic/context analysis.")
print("Identical English across sections is necessary but not sufficient")
print("for a permanent share. Merge Candidates + Risk Review list are")
print("explicitly reserved for human/architect review before Phase B.")
