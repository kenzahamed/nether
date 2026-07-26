"""Read-only: demonstrate Shared vs Merge-Candidate decision boundaries."""
import csv, collections, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
rows = list(csv.DictReader(open(os.path.join(ROOT, "LOCALIZATION_INVENTORY.csv"), encoding="utf-8")))

mc = [r for r in rows if r["classification"] == "Merge Candidate"]
by_val = collections.defaultdict(list)
for r in mc:
    by_val[r["value"]].append(r)

print("=== MERGE CANDIDATES (same English, NOT auto-shared) ===")
print(f"distinct merge values: {len(by_val)} | total occurrences: {len(mc)}")
for v, items in sorted(by_val.items(), key=lambda x: -len(x[1]))[:30]:
    secs = sorted({i["section"] for i in items})
    print(f"\nVALUE: {v!r}  ({len(items)} occ, sections={secs})")
    for i in items[:10]:
        print(f"  {i['key_path']}")

print("\n\n=== SHARED examples (safe generic) ===")
shared = [r for r in rows if r["classification"] == "Shared"]
by_s = collections.defaultdict(list)
for r in shared:
    by_s[r["value"]].append(r)
for v in ["Heading", "Left", "Animation speed", "Image ratio", "Fade", "Button label"]:
    items = by_s.get(v, [])
    if not items:
        continue
    print(f"\nVALUE: {v!r} -> {items[0]['proposed_new_key']}  ({len(items)} occ)")
    for i in items[:5]:
        print(f"  {i['key_path']}")

print("\n\n=== SECTION-SPECIFIC unique examples ===")
ss = [r for r in rows if r["classification"] == "Section-specific"]
# pick longer unique strings that look contextual
longish = sorted([r for r in ss if len(r["value"]) > 40], key=lambda r: -len(r["value"]))[:12]
for r in longish:
    print(f"  [{r['section']}] {r['key_path']}")
    print(f"     {r['value'][:120]}")

print("\n\n=== EDGE: same English word that COULD be risky if forced shared ===")
# Find Shared values that appear under very different leaf names (potential semantic risk)
risk = []
for v, items in by_s.items():
    leaf_names = {i["key_path"].split(".")[-1] for i in items}
    parents = {".".join(i["key_path"].split(".")[-3:-1]) for i in items}
    if len(parents) >= 6 and len(v) <= 12:
        risk.append((len(items), v, sorted(parents)[:8]))
risk.sort(reverse=True)
print("Short Shared values spanning many parent contexts (review needed in Phase B):")
for n, v, parents in risk[:15]:
    print(f"  {n:3d}  {v!r}  parents={parents}")
