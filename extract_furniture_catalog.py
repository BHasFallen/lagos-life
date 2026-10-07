import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("raw_chunks/3iluy0onkjs7j.js", "r", encoding="utf-8", errors="ignore") as f:
    code = f.read()

pos = code.find('let d=e=>`/models/furniture/${e}.glb`')
if pos != -1:
    print(code[pos:pos+2500])
else:
    print("Not found")
