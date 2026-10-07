import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

all_exports = {}

for f in files:
    fn = os.path.basename(f)
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        code = fp.read()
    
    # Turbopack export syntax: e.s(["exportName", type, val, ...], id)
    matches = re.findall(r'e\.s\(\[([^\]]+)\]', code)
    if matches:
        all_exports[fn] = []
        for m in matches:
            # find quoted export names
            names = re.findall(r'["\']([a-zA-Z0-9_\$]+)["\']', m)
            all_exports[fn].extend(names)

with open("turbopack_exports.json", "w", encoding="utf-8") as out:
    json.dump(all_exports, out, indent=2)

print("Export names summarized:")
for fn, names in sorted(all_exports.items()):
    clean_names = [n for n in names if len(n) > 2 and not n.startswith('$')]
    if clean_names:
        print(f"[{fn}] ({len(clean_names)} exports): {', '.join(clean_names[:10])}")
