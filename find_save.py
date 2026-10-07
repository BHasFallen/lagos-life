import glob
import re

for p in glob.glob(r'c:\Users\dc941\Documents\LLLife\site\_next\static\chunks\*.js'):
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    if '/api/save' in text:
        print(f"Found /api/save in {p}")
        for m in re.finditer(r'/api/save[^\"]*', text):
            clean = m.group(0).encode('ascii', 'ignore').decode('ascii')
            print("  ", clean[:80])
