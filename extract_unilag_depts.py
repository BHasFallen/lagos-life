import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
with open(os.path.join(WORKSPACE, "site", "_next", "static", "chunks", "0vks1-_0allxo.js"), "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('uniLecture')
if pos != -1:
    snippet = c[max(0, pos-2000):pos]
    with open(os.path.join(WORKSPACE, "extracted_data", "unilag_depts_and_faculties.js"), "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved unilag_depts_and_faculties.js")
