import os
import re

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

terms = ["building-", "commercial", "suburban", "pirate", "tree_palm", "colormap", "furniture"]

for term in terms:
    print(f"\n=== Searching for '{term}' ===")
    found = {}
    for f in files:
        fn = os.path.basename(f)
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            c = fp.read()
        matches = [m.start() for m in re.finditer(re.escape(term), c)]
        if matches:
            found[fn] = len(matches)
            for pos in matches[:3]:
                snippet = c[max(0, pos-80):min(len(c), pos+80)]
                snippet = re.sub(r'\s+', ' ', snippet)
                print(f"  [{fn}] ...{snippet}...")
    if not found:
        print("  None found")
