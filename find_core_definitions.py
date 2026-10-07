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
    
    # Check where CITIES is defined
    m = re.search(r'CITIES\s*=\s*\{([^}]+)\}', c)
    if m:
        print(f"[{fn}] CITIES = {{{m.group(1)[:500]}}}")
        
    m2 = re.search(r'HOMES\s*=\s*\[([^\]]+)\]', c)
    if m2:
        print(f"[{fn}] HOMES = [{m2.group(1)[:500]}]")
        
    m3 = re.search(r'LOCATIONS\s*=\s*\[([^\]]+)\]', c)
    if m3:
        print(f"[{fn}] LOCATIONS = [{m3.group(1)[:500]}]")
