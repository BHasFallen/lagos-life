import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
EXTRACTED_DIR = os.path.join(WORKSPACE, "extracted_data")

# 1. Extract all FOOD_GIFTS
with open(os.path.join(WORKSPACE, "site", "_next", "static", "chunks", "28rj3eza8j4he.js"), "r", encoding="utf-8") as f:
    c = f.read()

# search for food gifts array
m = re.search(r'\[\{id:"jollof",label:"jollof"[^;]+\]', c)
if m:
    with open(os.path.join(EXTRACTED_DIR, "food_and_catering.js"), "w", encoding="utf-8") as out:
        out.write(m.group(0))
    print("Saved food_and_catering.js")

# 2. Extract ORIGINS from 0mzw0ugrs0p8h.js
with open(os.path.join(WORKSPACE, "site", "_next", "static", "chunks", "0mzw0ugrs0p8h.js"), "r", encoding="utf-8") as f:
    c_orig = f.read()

m_orig = re.search(r'let [a-zA-Z0-9_]+\s*=\s*\[\{id:"[a-zA-Z0-9_]+",name:"[^"]+",blurb:"[^"]+"[^;]+\]', c_orig)
if not m_orig:
    m_orig = re.search(r'\[\{id:"[^"]+",name:"[^"]+"[^;]+cash:[0-9]+[^;]+\]', c_orig)
if m_orig:
    with open(os.path.join(EXTRACTED_DIR, "player_origins.js"), "w", encoding="utf-8") as out:
        out.write(m_orig.group(0))
    print("Saved player_origins.js")

# 3. Extract CITIES from 3jv557p5iq4mk.js
with open(os.path.join(WORKSPACE, "site", "_next", "static", "chunks", "3jv557p5iq4mk.js"), "r", encoding="utf-8") as f:
    c_city = f.read()

pos = c_city.find('name:"Lagos"')
if pos != -1:
    snippet = c_city[max(0, pos-100):min(len(c_city), pos+1500)]
    with open(os.path.join(EXTRACTED_DIR, "nigerian_cities_snippet.js"), "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved nigerian_cities_snippet.js")

# 4. Extract UNILAG system from 0vks1-_0allxo.js
with open(os.path.join(WORKSPACE, "site", "_next", "static", "chunks", "0vks1-_0allxo.js"), "r", encoding="utf-8") as f:
    c_camp = f.read()

pos_camp = c_camp.find('uniLecture')
if pos_camp != -1:
    snippet = c_camp[max(0, pos_camp-50):min(len(c_camp), pos_camp+1500)]
    with open(os.path.join(EXTRACTED_DIR, "campus_actions_snippet.js"), "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved campus_actions_snippet.js")

print("Finished raw data slice extraction.")
