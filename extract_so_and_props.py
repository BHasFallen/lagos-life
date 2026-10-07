import re
import json

with open("raw_chunks/2ipskyn6xlm81.js", "r", encoding="utf-8", errors="ignore") as f:
    code_2ip = f.read()

with open("raw_chunks/2h5d-2cshddbh.js", "r", encoding="utf-8", errors="ignore") as f:
    code_2h5 = f.read()

# Find definition of so
so_def = re.findall(r'function so\([^)]*\)\{[^}]+\}', code_2ip)
print("so definition:", so_def)
# Or let so = ...
if not so_def:
    so_def = re.findall(r'(\bso\s*=\s*[^;,]+)', code_2ip)
    print("so assignment:", so_def[:5])

# Find all so(...) calls
so_calls = set(re.findall(r'so\(["\']([^"\']+)["\']\)', code_2ip))
print(f"Total so(...) calls in 2ipskyn6xlm81.js: {len(so_calls)}")
for s in sorted(so_calls):
    print(" ", s)

# Find all "m:..." props in 2h5d-2cshddbh.js
m_props = set(re.findall(r'["\']m:([^"\']+)["\']', code_2h5))
print(f"\nTotal m:... props in 2h5d-2cshddbh.js: {len(m_props)}")
for m in sorted(m_props):
    print(" ", m)

# Let's also check for f:... (furniture props!)
f_props = set(re.findall(r'["\']f:([^"\']+)["\']', code_2h5))
print(f"\nTotal f:... (furniture) props in 2h5d-2cshddbh.js: {len(f_props)}")
for fp in sorted(f_props):
    print(" ", fp)
