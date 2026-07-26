"""Nether localization inventory + migration-plan generator (tightened Phase A gates).

Phase A auto-remap eligibility:
  - English value is shared across >=2 section namespaces
  - len(value) <= 40, not a numeric/unit literal
  - leaf is structural UI vocabulary: path ends with .label
  - NOT .default / .info / .placeholder
  - NOT under .presets.
  - NOT settings_schema.* / sections.all.*

Excluded shared-English leaves are classified Shared (excluded) and are NOT
in the Phase A migration map.
"""
import json, collections, re, os, csv

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "locales", "en.default.schema.json")
with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

leaves = []
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

val_locations = collections.defaultdict(set)
for dotted, v, top, section in leaves:
    val_locations[v.strip()].add((top, section))
val_total = collections.Counter(v.strip() for _, v, _, _ in leaves)

def is_literal_unit(v):
    return bool(re.fullmatch(r"[\d.,\s%\u00b0x\u00d7+/-]+", v))

GENERIC_MAXLEN = 40
shared_values = set()
for v, locs in val_locations.items():
    sections_only = {s for (t, s) in locs if s}
    if len(sections_only) >= 2 and len(v) <= GENERIC_MAXLEN and not is_literal_unit(v):
        shared_values.add(v)

def is_excluded_leaf(dotted):
    parts = dotted.split(".")
    leaf = parts[-1]
    if leaf in {"default", "info", "placeholder"}:
        return True
    if "presets" in parts:
        return True
    if parts[0] == "settings_schema":
        return True
    if len(parts) > 1 and parts[0] == "sections" and parts[1] == "all":
        return True
    return False

def is_structural_label(dotted):
    """Phase A eligible leaf type: setting/option labels only."""
    return dotted.endswith(".label") and not is_excluded_leaf(dotted)

BUCKETS = [
    ("layout", {"left","right","center","centered","top left","top right","top center",
        "bottom left","bottom right","bottom center","middle left","middle right","middle center",
        "layout","desktop layout","tablet layout","mobile layout","content position","content alignment",
        "text alignment","full width","stacked","split","grid","row","inline","columns","desktop columns",
        "tablet columns","mobile columns","content width","narrow","wide","media position","media","alignment"}),
    ("sizing", {"small","medium","large","extra large","extra extra large","default size","compact","spacious"}),
    ("media", {"image","video","image ratio","portrait","square","adapt to image","adapt","landscape",
        "loop video","overlay opacity","poster image","desktop image","mobile image","background image",
        "background video","image shape","media type","enable image overlay"}),
    ("motion", {"motion","animation style","animation speed","fade","slide","scale","stagger","slow","fast",
        "enable parallax","parallax","reveal","hover effect","hover effects","hover reveal","zoom","lift","glow"}),
    ("typography", {"heading","subheading","subtitle","body","body large","text","eyebrow","caption",
        "text style","heading size","subheading size","uppercase","title","paragraph","rich text"}),
    ("actions", {"button label","primary button label","secondary button label","button link","button style",
        "link","link label","cta label","cta link","cta style","buttons","button","outline","solid","ghost",
        "arrow","primary button","secondary button","button size"}),
    ("states", {"none","default","standard","minimal","editorial","primary","secondary","featured","custom",
        "soft","glass","gradient","elevated","classic","visual"}),
    ("commerce", {"collection","product","page","badge","badge style","badge label","badge type","sale","new",
        "price","rating","show rating","quick add","vendor","sku","tags","discount"}),
    ("content", {"content","label","name","description","value","subtitle","caption","icon","accessibility label"}),
]

def bucket_for(v):
    lv = v.strip().lower()
    for name, terms in BUCKETS:
        if lv in terms:
            return name
    return "labels"

def slug(v):
    s = re.sub(r"[^a-z0-9]+", "_", v.lower()).strip("_")
    return s or "value"

shared_key = {}
seen = {}
for v in sorted(shared_values):
    b = bucket_for(v)
    key = f"nether.common.ui.{b}.{slug(v)}"
    k, i = key, 2
    while k in seen and seen[k] != v:
        k = f"{key}_{i}"; i += 1
    seen[k] = v
    shared_key[v] = k

inventory = []
for dotted, v, top, section in leaves:
    vv = v.strip()
    dupc = val_total[vv]
    if is_literal_unit(vv):
        cls = "Section-specific (literal)"
        phase_a = False
    elif vv in shared_values:
        if is_structural_label(dotted):
            cls = "Shared (Phase A remappable)"
            phase_a = True
        else:
            cls = "Shared (excluded — merchant/content/info/preset)"
            phase_a = False
    elif dupc >= 2:
        cls = "Merge Candidate"
        phase_a = False
    else:
        cls = "Section-specific"
        phase_a = False
    newk = shared_key[vv] if phase_a else ""
    inventory.append((dotted, v, top, section, dupc, cls, phase_a, newk))

cls_counts = collections.Counter(r[5] for r in inventory)
phase_a_rows = [r for r in inventory if r[6]]
phase_a_values = {r[1].strip() for r in phase_a_rows}
# Estimate: remove remapped section/nether.common flat label duplicates, keep 1 shared key per value
# Keys deleted ≈ phase_a_rows that are NOT already the canonical nested key
already_canonical = sum(1 for r in phase_a_rows if r[0] == r[7])
removable = len(phase_a_rows) - already_canonical
# But we ADD nested keys that don't exist yet
existing_nested = {r[0] for r in inventory}
new_nested = sum(1 for v in phase_a_values if shared_key[v] not in existing_nested)
est_after = len(inventory) - removable + new_nested

with open(os.path.join(ROOT, "LOCALIZATION_INVENTORY.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["key_path", "value", "namespace", "section", "duplicate_count", "classification", "phase_a_remappable", "proposed_new_key"])
    for dotted, v, top, section, dupc, cls, phase_a, newk in sorted(inventory, key=lambda r: (r[2], r[3], r[0])):
        w.writerow([dotted, v, top, section, dupc, cls, "yes" if phase_a else "no", newk])

with open(os.path.join(ROOT, "LOCALIZATION_SHARED_VOCAB.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["new_shared_key", "english_value", "phase_a_label_refs", "total_occurrences"])
    for v in sorted(phase_a_values, key=lambda x: (-sum(1 for r in phase_a_rows if r[1].strip()==x), x)):
        w.writerow([shared_key[v], v, sum(1 for r in phase_a_rows if r[1].strip()==v), val_total[v]])

sec_leaf = collections.Counter()
sec_phase_a = collections.Counter()
for dotted, v, top, section, dupc, cls, phase_a, newk in inventory:
    if top == "sections" and section:
        sec_leaf[section] += 1
        if phase_a:
            sec_phase_a[section] += 1

inv = []
inv.append("# Nether Localization Inventory (Phase 2)\n")
inv.append("> Tightened Phase A gates (§8.1): only structural `.label` leaves auto-remap.\n")
inv.append("> `.default` / `.info` / presets / placeholders / `settings_schema` / `sections.all` are excluded.\n")
inv.append("> Regenerate with `py .nether-analysis/loc_generate.py`.\n")
inv.append("\n## 1. Totals\n")
inv.append(f"- **Total schema translation values:** {len(inventory)}\n")
inv.append(f"- **Distinct English values:** {len(val_total)}\n")
inv.append(f"- **Shopify platform limit:** 3,400\n")
inv.append(f"- **Current overage:** {len(inventory) - 3400} values above the limit\n")
inv.append("\n## 2. Classification summary\n")
inv.append("| Classification | Values | Notes |\n|---|---:|---|\n")
for c, n in cls_counts.most_common():
    inv.append(f"| {c} | {n} | |\n")
inv.append(f"| **Phase A remappable (subset)** | **{len(phase_a_rows)}** | Collapse toward **{len(phase_a_values)}** canonical keys |\n")
inv.append("\n## 3. Phase A estimate\n")
inv.append(f"- Removable duplicate label leaves: ~{removable}\n")
inv.append(f"- New nested shared keys to add: ~{new_nested}\n")
inv.append(f"- **Estimated total after Phase A: ~{est_after}**\n")
inv.append(f"- **Headroom below 3,400: ~{3400 - est_after}**\n")
inv.append("\n## 4. Per-section Phase A footprint (top 30)\n")
inv.append("| Section namespace | Total keys | Phase A remappable labels |\n|---|---:|---:|\n")
for section, tot in sec_leaf.most_common(30):
    inv.append(f"| `sections.{section}` | {tot} | {sec_phase_a[section]} |\n")
inv.append("\n## 5. Deprecated keys\n\nNone.\n")
inv.append("\n## 6. Full classification data\n")
inv.append("See **`LOCALIZATION_INVENTORY.csv`** (`phase_a_remappable` column).\n")
with open(os.path.join(ROOT, "LOCALIZATION_INVENTORY.md"), "w", encoding="utf-8") as f:
    f.write("".join(inv))

by_new = collections.defaultdict(list)
for dotted, v, top, section, dupc, cls, phase_a, newk in phase_a_rows:
    if dotted != newk:
        by_new[newk].append((dotted, v))

mp = []
mp.append("# Nether Localization Migration Plan (Phase 3 — tightened Phase A)\n")
mp.append("> Only structural `.label` leaves. Merchant content (`.default`, `.info`, presets, placeholders) is excluded.\n")
mp.append("\n## 1. Outcome estimate\n")
mp.append(f"- **Before:** {len(inventory)} values\n")
mp.append(f"- **Phase A remappable label refs:** {len(phase_a_rows)}\n")
mp.append(f"- **Canonical shared keys required:** {len(phase_a_values)}\n")
mp.append(f"- **After Phase A (estimate):** ~{est_after} values\n")
mp.append(f"- **Headroom below 3,400:** ~{3400 - est_after} values\n")
mp.append("\n## 2. Migration mechanic\n")
mp.append("For each mapping below, liquid/schema `t:` references on **label** fields are repointed to the canonical shared key. ")
mp.append("The old section-local label key is removed only if nothing else references it. ")
mp.append("`.default` / `.info` / presets / placeholders keep their local keys even when English matches.\n")
mp.append("\n## 3. Shared vocabulary catalog (Phase A)\n")
mp.append("| New shared key | English value | # label refs |\n|---|---|---:|\n")
for v in sorted(phase_a_values, key=lambda x: (-sum(1 for r in phase_a_rows if r[1].strip()==x), x)):
    mp.append(f"| `{shared_key[v]}` | {v} | {sum(1 for r in phase_a_rows if r[1].strip()==v)} |\n")
mp.append("\n## 4. Complete Old Key → New Key mapping (Phase A labels only)\n")
for newk in sorted(by_new):
    mp.append(f"\n### `{newk}`  —  \"{seen[newk]}\"\n")
    for dotted, v in sorted(by_new[newk]):
        mp.append(f"- `{dotted}` → `{newk}`\n")
with open(os.path.join(ROOT, "LOCALIZATION_MIGRATION_PLAN.md"), "w", encoding="utf-8") as f:
    f.write("".join(mp))

print("Generated tightened deliverables:")
print(f"  total={len(inventory)} phase_a_labels={len(phase_a_rows)} shared_keys={len(phase_a_values)}")
print(f"  est_after~{est_after} headroom~{3400-est_after}")
for c, n in cls_counts.most_common():
    print(f"  {n:5d}  {c}")
