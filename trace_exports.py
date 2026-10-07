import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
chunk_dir = os.path.join(WORKSPACE, "site", "_next", "static", "chunks")

def inspect_exports(filename, targets):
    path = os.path.join(chunk_dir, filename)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        code = f.read()
    
    # find e.s([...])
    export_block = re.findall(r'e\.s\(\[([^\]]+)\]', code)
    if not export_block:
        return
    
    # Parse pairs in export_block: ["NAME", 0, identifier, ...]
    items = export_block[0].split(',')
    pairs = {}
    i = 0
    while i < len(items) - 2:
        name = items[i].strip(' "\'')
        if items[i+1].strip() == '0':
            var_name = items[i+2].strip()
            pairs[name] = var_name
            i += 3
        else:
            i += 1
            
    print(f"\n--- In {filename} ---")
    for t in targets:
        if t in pairs:
            vname = pairs[t]
            # search for definition of vname
            # e.g. let vname = ... or var vname = ...
            patterns = [
                rf'\b(?:let|var|const)\s+{re.escape(vname)}\s*=\s*([\[\{{][\s\S]*?[\]\}}])(?=[,;])',
                rf'\b{re.escape(vname)}\s*=\s*([\[\{{][\s\S]*?[\]\}}])(?=[,;])'
            ]
            found = False
            for p in patterns:
                m = re.search(p, code)
                if m:
                    print(f"[{t}] (var {vname}):")
                    snippet = m.group(1)[:300].replace('\n', ' ')
                    print(" ", snippet)
                    found = True
                    break
            if not found:
                # print context around vname =
                m = re.search(rf'\b{re.escape(vname)}\s*=', code)
                if m:
                    snippet = code[m.start():m.start()+300].replace('\n', ' ')
                    print(f"[{t}] raw assignment:")
                    print(" ", snippet)

inspect_exports("0vks1-_0allxo.js", ["DEPTS", "HOSTEL", "DEGREE", "CAMPUS_ACTIONS", "ACCEPTANCE_FEE", "ALLOWANCE"])
inspect_exports("0mzw0ugrs0p8h.js", ["ORIGINS", "BIZ", "LAPO_LOAN", "NEPO_CASH", "GOV_ALLOWANCE"])
inspect_exports("2afas8qnowmhu.js", ["BUSINESSES", "LANDS", "BIZ_BY_ID", "BIZ_RESALE"])
inspect_exports("28rj3eza8j4he.js", ["FOOD_GIFTS", "PRODUCT_BY_ID", "RETAIL", "SHOP", "PRICE_PICKS"])
inspect_exports("3jv557p5iq4mk.js", ["CITIES", "CITY_IDS", "FLIGHT", "NIGHT_BUS", "AD_PRICE", "AD_DAYS"])
