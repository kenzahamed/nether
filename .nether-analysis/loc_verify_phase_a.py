"""Post-Phase-A verification."""
import json, re, os, sys
sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
en = json.load(open(os.path.join(ROOT, "locales", "en.default.schema.json"), encoding="utf-8"))

def walk(n, p=None):
    p = p or []
    if isinstance(n, dict):
        for k, v in n.items():
            yield from walk(v, p + [k])
    elif isinstance(n, str):
        yield ".".join(p), n

leaves = {d for d, _ in walk(en)}
print("en leaves", len(leaves))
for k in [
    "nether.common.ui.typography.heading",
    "nether.common.ui.layout.left",
    "nether.common.ui.motion.animation_speed",
    "nether.common.ui.media.image_ratio",
]:
    print(k, "=>", "OK" if k in leaves else "MISSING")

T = re.compile(r"t:([a-zA-Z0-9_.-]+)")
LABEL = re.compile(r'"label"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
INFO = re.compile(r'"info"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
DEFAULT = re.compile(r'"default"\s*:\s*"t:([a-zA-Z0-9_.-]+)"')
DOMAINS = (".ui.typography.", ".ui.layout.", ".ui.motion.", ".ui.media.", ".ui.actions.", ".ui.states.", ".ui.sizing.", ".ui.commerce.", ".ui.content.", ".ui.labels.")

missing = set()
info_on_phase_a = 0
default_on_phase_a = 0
label_on_phase_a = 0
files = 0
for folder in ("sections", "snippets", "config", "layout"):
    d = os.path.join(ROOT, folder)
    if not os.path.isdir(d):
        continue
    for root, _, fns in os.walk(d):
        for fn in fns:
            if not fn.endswith((".liquid", ".json")):
                continue
            files += 1
            text = open(os.path.join(root, fn), encoding="utf-8").read()
            for m in T.finditer(text):
                key = m.group(1)
                if key.startswith(("sections.", "nether.", "settings_schema.")) and key not in leaves:
                    missing.add(key)
            for m in LABEL.finditer(text):
                if m.group(1).startswith("nether.common.") and any(x in m.group(1) for x in DOMAINS):
                    label_on_phase_a += 1
            for m in INFO.finditer(text):
                if m.group(1).startswith("nether.common.") and any(x in m.group(1) for x in DOMAINS):
                    info_on_phase_a += 1
            for m in DEFAULT.finditer(text):
                if m.group(1).startswith("nether.common.") and any(x in m.group(1) for x in DOMAINS):
                    default_on_phase_a += 1

print("files scanned", files)
print("missing schema keys referenced:", len(missing))
for k in sorted(missing)[:40]:
    print("  MISSING", k)
print("label refs on Phase A nested domains:", label_on_phase_a)
print("info refs on Phase A nested domains (should be 0):", info_on_phase_a)
print("default refs on Phase A nested domains (should be 0):", default_on_phase_a)

hero = open(os.path.join(ROOT, "sections", "nether-hero.liquid"), encoding="utf-8").read()
print("hero defaults sample:", DEFAULT.findall(hero)[:6])
print("hero infos sample:", INFO.findall(hero)[:6])
