import re

with open("raw_chunks/2ipskyn6xlm81.js", "r", encoding="utf-8", errors="ignore") as f:
    code = f.read()

# Find strings matching models
models = set(re.findall(r'["\'](/models/[^"\']+)["\']', code))
print("Models directly named in 2ipskyn6xlm81.js:")
for m in sorted(models):
    print(" ", m)

# Let's search for lists of building names or asset keys
# E.g. arrays of strings: ["building-a", ...]
str_arrays = re.findall(r'\[(?:"[a-zA-Z0-9_\-]+"\,?\s*){3,}\]', code)
print(f"\nString arrays in 2ipskyn6xlm81.js: {len(str_arrays)}")
for sa in str_arrays:
    print(" ", sa[:150])
