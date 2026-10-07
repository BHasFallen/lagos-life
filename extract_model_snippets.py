import os
import re
import json

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

matches = {}

for f in files:
    fn = os.path.basename(f)
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        content = fp.read()
    
    # Find snippets around /models/
    for m in re.finditer(r'/models/[^"\'`\s]+', content):
        start = max(0, m.start() - 200)
        end = min(len(content), m.end() + 200)
        snippet = content[start:end]
        matches.setdefault(fn, []).append(snippet)

with open("model_snippets.json", "w", encoding="utf-8") as out:
    json.dump(matches, out, indent=2)

print(f"Saved snippets from {len(matches)} files to model_snippets.json")
