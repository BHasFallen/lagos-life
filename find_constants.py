import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

data = {
    "cities": [],
    "venues": [],
    "jobs": [],
    "cars": [],
    "furniture": [],
    "radio": [],
    "crime": [],
    "transit": [],
    "constants": []
}

for f in files:
    fn = os.path.basename(f)
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        code = fp.read()
    
    # Check for CITIES constant
    cities = re.findall(r'CITIES\s*[:=]\s*(\[[^\]]+\]|\{[^\}]+\})', code)
    if cities:
        data["cities"].append({"file": fn, "data": cities[0][:500]})
        
    # Check for VENUES / LOCATIONS
    venues = re.findall(r'(?:VENUES|LOCATIONS|VENUES_MAP)\s*[:=]\s*(\[[^\]]+\]|\{[^\}]+\})', code)
    if venues:
        data["venues"].append({"file": fn, "data": venues[0][:500]})
        
    # Check for JOBS / CAREERS
    jobs = re.findall(r'(?:JOBS|CAREERS)\s*[:=]\s*(\[[^\]]+\]|\{[^\}]+\})', code)
    if jobs:
        data["jobs"].append({"file": fn, "data": jobs[0][:500]})
        
    # Check for CARS / VEHICLES
    cars = re.findall(r'(?:CARS|VEHICLES)\s*[:=]\s*(\[[^\]]+\]|\{[^\}]+\})', code)
    if cars:
        data["cars"].append({"file": fn, "data": cars[0][:500]})

with open("game_constants_found.json", "w", encoding="utf-8") as out:
    json.dump(data, out, indent=2)

print("Saved game_constants_found.json")
for k, v in data.items():
    if v:
        print(f"{k}: {len(v)} matches")
