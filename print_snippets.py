import json
import re

with open("model_snippets.json", "r", encoding="utf-8") as f:
    snippets = json.load(f)

for fn, snips in snippets.items():
    print(f"File: {fn} ({len(snips)} snippets)")
    for i, s in enumerate(snips[:10]):
        # clean whitespace
        s_clean = re.sub(r'\s+', ' ', s)
        print(f"  [{i}] {s_clean[:180]}")
