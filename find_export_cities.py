import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

for f in files:
    fn = os.path.basename(f)
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        c = fp.read()
    
    if '"CITIES"' in c or "'CITIES'" in c:
        for m in re.finditer(r'["\']CITIES["\']', c):
            pos = m.start()
            print(f"[{fn}] {c[max(0, pos-100):min(len(c), pos+200)]}")
