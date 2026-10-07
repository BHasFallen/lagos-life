import os
import re
import json

chunk_dir = "raw_chunks"
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]

# Search for furniture names, cars, world objects, items, locations
all_content = ""
for f in files:
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        all_content += fp.read() + "\n"

# Search for furniture array or objects
print("Searching for furniture...")
furniture_matches = set(re.findall(r'/models/furniture/([a-zA-Z0-9_\-]+)\.glb', all_content))
print(f"Furniture models found: {len(furniture_matches)} -> {furniture_matches}")

# Let's search for world models
world_matches = set(re.findall(r'/models/world/([a-zA-Z0-9_\-\/]+)\.glb', all_content))
print(f"World models found: {len(world_matches)} -> {world_matches}")

# Let's search for car models
car_matches = set(re.findall(r'/models/world/car/([a-zA-Z0-9_\-]+)\.glb', all_content))
print(f"Car models found: {len(car_matches)} -> {car_matches}")

# Let's search for audio files or sound names
sound_matches = set(re.findall(r'[\'"`]([^\'"`]*?\.(?:mp3|wav|ogg|m4a))[\'"`]', all_content))
print(f"Sound matches: {sound_matches}")

# Let's search for strings containing .glb
all_glb = set(re.findall(r'[\'"`]([^\'"`]*?\.glb)[\'"`]', all_content))
print(f"All GLB strings: {all_glb}")

# Search for arrays of furniture or item constants
furn_lists = re.findall(r'(\b(?:FURNITURE|furniture|ITEMS|items|CARS|cars|VEHICLES|vehicles|BUILDINGS|LOCATIONS|locations)\s*[:=]\s*(\[[^\]]{10,2000}\]|\{[^\}]{10,2000}\}))', all_content)
print(f"Found {len(furn_lists)} constant collections")
for name, val in furn_lists[:10]:
    print(f"--- Constant match ({name[:40]}...): ---")
    print(val[:200])
    print()
