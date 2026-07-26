"""Read-only localization analysis for Nether. Prints report to stdout only.
Does NOT modify or write any files. Safe to delete after review."""
import json, collections, re, os

path = os.path.join(os.path.dirname(__file__), "..", "locales", "en.default.schema.json")
with open(path, encoding="utf-8") as f:
    data = json.load(f)

leaves = []  # (dotted, value, top, section)
def walk(node, prefix):
    if isinstance(node, dict):
        for k, v in node.items():
            walk(v, prefix + [k])
    elif isinstance(node, str):
        dotted = ".".join(prefix)
        top = prefix[0] if prefix else ""
        section = prefix[1] if len(prefix) > 1 else ""
        leaves.append((dotted, node, top, section))
walk(data, [])

section_names = list(data.get("sections", {}).keys())
val_locations = collections.defaultdict(set)
val_leaftype = collections.defaultdict(set)
for dotted, v, top, section in leaves:
    val_locations[v.strip()].add((top, section))
    val_leaftype[v.strip()].add(dotted.split(".")[-1].rstrip("0123456789_"))

GENERIC_MAXLEN = 40
shared_values = {}
for v, locs in val_locations.items():
    sections_only = {s for (t, s) in locs if s}
    if len(sections_only) >= 2 and len(v) <= GENERIC_MAXLEN:
        shared_values[v] = len(locs)

def is_literal_unit(v):
    return bool(re.fullmatch(r"[\d.,\s%\u00b0x\u00d7+/-]+", v))

val_total = collections.Counter(v.strip() for _,v,_,_ in leaves)
inventory = []
for dotted, v, top, section in leaves:
    vv = v.strip()
    dupc = val_total[vv]
    if is_literal_unit(vv):
        cls = "Section-specific (literal)"
    elif vv in shared_values:
        cls = "Shared"
    elif dupc >= 2:
        cls = "Merge Candidate"
    else:
        cls = "Section-specific"
    inventory.append((dotted, v, top, section, dupc, cls))

existing_sections = set()
sec_dir = os.path.join(os.path.dirname(__file__), "..", "sections")
for fn in os.listdir(sec_dir):
    if fn.endswith(".liquid"):
        existing_sections.add(fn[:-7])
def norm(s): return s.replace("_","-")
orphan_sections = [s for s in section_names if norm(s) not in existing_sections and s not in existing_sections]

cls_counts = collections.Counter(c for *_, c in inventory)
print("=== TOTALS ===")
print("total leaves:", len(inventory), "| unique values:", len(val_total))
print()
print("=== CLASSIFICATION SUMMARY ===")
for c, n in cls_counts.most_common():
    print(f"  {n:5d}  {c}")
print()

shared_after = len(shared_values)
merge_vals = {v.strip() for d,v,t,s,dc,c in inventory if c=='Merge Candidate'}
section_specific = sum(1 for *_,c in inventory if c.startswith('Section-specific'))
est_after = section_specific + shared_after + len(merge_vals)
print("=== POST-MIGRATION ESTIMATE (conservative: dedupe Shared only) ===")
print(f"Section-specific kept: {section_specific}")
print(f"Shared distinct keys: {shared_after}")
print(f"Merge-candidate distinct (if also deduped): {len(merge_vals)}")
print(f"Estimate if ONLY Shared deduped: {section_specific + shared_after + sum(1 for *_,c in inventory if c=='Merge Candidate')}")
print(f"Estimate if Shared + Merge deduped: {est_after}")
print(f"Absolute floor (all unique): {len(val_total)}")
print()

print("=== ORPHAN schema namespaces (no matching section file) ===")
for s in orphan_sections:
    n = sum(1 for d,_,t,sec in leaves if t=='sections' and sec==s)
    print(f"  {n:4d}  sections.{s}")
print()

# Shared vocab grouped
def sub_ns(v):
    lts = val_leaftype[v]
    if any(x.startswith("option") for x in lts):
        return "options"
    if "content" in lts or "name" in lts:
        return "groups"
    return "labels"
buckets = collections.defaultdict(list)
for v in shared_values:
    buckets[sub_ns(v)].append(v)
print("=== SHARED VOCAB BUCKETS ===")
for b in sorted(buckets):
    print(f"  {b}: {len(buckets[b])} distinct")
print()
print("=== TOP SHARED VALUES (value | #occurrences | #sections) ===")
for v in sorted(shared_values, key=lambda x:-shared_values[x])[:80]:
    secs = len({s for (t,s) in val_locations[v] if s})
    print(f"  {shared_values[v]:3d} occ / {secs:2d} sec  {v!r}")
