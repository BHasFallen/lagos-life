import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
EXTRACTED_DIR = os.path.join(WORKSPACE, "extracted_data")
os.makedirs(EXTRACTED_DIR, exist_ok=True)

print("=== Parsing Live API Data ===")

# 1. Parse Government Data
gov_path = os.path.join(WORKSPACE, "api_data", "gov.json")
if os.path.exists(gov_path):
    with open(gov_path, "r", encoding="utf-8") as f:
        gov = json.load(f)
    governor = gov.get("governor", {})
    election = gov.get("election", {})
    candidates = election.get("candidates", [])
    candidates_sorted = sorted(candidates, key=lambda x: x.get("votes", 0), reverse=True)
    
    gov_summary = {
        "term": gov.get("term"),
        "current_governor": {
            "username": governor.get("username"),
            "slogan": governor.get("slogan"),
            "policy": governor.get("policy"),
            "votes": governor.get("votes"),
            "announcement": governor.get("announcement")
        },
        "election": {
            "closes": election.get("closes"),
            "candidates_count": len(candidates),
            "top_candidates": candidates_sorted[:15]
        }
    }
    with open(os.path.join(EXTRACTED_DIR, "government_and_elections.json"), "w", encoding="utf-8") as out:
        json.dump(gov_summary, out, indent=2)
    print(f"Government extracted: Gov @{governor.get('username')}, {len(candidates)} candidates")

# 2. Parse Homes Data
homes_path = os.path.join(WORKSPACE, "api_data", "homes.json")
if os.path.exists(homes_path):
    with open(homes_path, "r", encoding="utf-8") as f:
        homes_data = json.load(f)
    homes = homes_data.get("homes", [])
    occupied = [h for h in homes if h.get("user") or h.get("username")]
    vacant = [h for h in homes if not (h.get("user") or h.get("username"))]
    homes_summary = {
        "total_homes": len(homes),
        "occupied_count": len(occupied),
        "vacant_count": len(vacant),
        "sample_occupied": occupied[:20],
        "sample_vacant": vacant[:10]
    }
    with open(os.path.join(EXTRACTED_DIR, "player_homes_summary.json"), "w", encoding="utf-8") as out:
        json.dump(homes_summary, out, indent=2)
    print(f"Homes extracted: {len(homes)} total, {len(occupied)} occupied, {len(vacant)} vacant")

# 3. Parse Sea Plots Data
sea_path = os.path.join(WORKSPACE, "api_data", "sea.json")
if os.path.exists(sea_path):
    with open(sea_path, "r", encoding="utf-8") as f:
        sea_data = json.load(f)
    sea_summary = {
        "price": sea_data.get("price"),
        "days": sea_data.get("days"),
        "holds_count": len(sea_data.get("holds", {})),
        "ads_count": len(sea_data.get("ads", [])),
        "ads": sea_data.get("ads", [])[:20]
    }
    with open(os.path.join(EXTRACTED_DIR, "sea_plots_summary.json"), "w", encoding="utf-8") as out:
        json.dump(sea_summary, out, indent=2)
    print(f"Sea plots extracted: Price {sea_data.get('price')}, {len(sea_data.get('ads', []))} active ads")

# 4. Parse Forbes Leaderboard
forbes_path = os.path.join(WORKSPACE, "api_data", "forbes.json")
if os.path.exists(forbes_path):
    with open(forbes_path, "r", encoding="utf-8") as f:
        forbes_data = json.load(f)
    with open(os.path.join(EXTRACTED_DIR, "forbes_richest_players.json"), "w", encoding="utf-8") as out:
        json.dump(forbes_data, out, indent=2)
    print(f"Forbes extracted: {len(forbes_data) if isinstance(forbes_data, list) else list(forbes_data.keys())}")

# 5. Parse Billboard Ads Directory
ads_path = os.path.join(WORKSPACE, "api_data", "ads.json")
if os.path.exists(ads_path):
    with open(ads_path, "r", encoding="utf-8") as f:
        ads_raw = json.load(f)
    slots = ads_raw.get("slots", [])
    active_ads = []
    queued_ads = []
    for s in slots:
        if s.get("ad"):
            active_ads.append({"slot": s.get("slot"), **s["ad"]})
        for q in s.get("ads", []):
            queued_ads.append({"slot": s.get("slot"), **q})
    ads_directory = {
        "slots_count": len(slots),
        "active_billboards_count": len(active_ads),
        "total_queued_ads_count": len(queued_ads),
        "active_billboards": active_ads,
        "queued_campaigns": queued_ads
    }
    with open(os.path.join(EXTRACTED_DIR, "billboards_directory.json"), "w", encoding="utf-8") as out:
        json.dump(ads_directory, out, indent=2)
    print(f"Billboards extracted: {len(active_ads)} active, {len(queued_ads)} queued")

# 6. Parse Radio Stations
radio_path = os.path.join(WORKSPACE, "api_data", "radio.json")
if os.path.exists(radio_path):
    with open(radio_path, "r", encoding="utf-8") as f:
        radio_raw = json.load(f)
    stations = radio_raw.get("stations", [])
    with open(os.path.join(EXTRACTED_DIR, "radio_stations_directory.json"), "w", encoding="utf-8") as out:
        json.dump(stations, out, indent=2)
    print(f"Radio stations extracted: {len(stations)} stations")

print("\n=== Extracting Core Game Mechanics from Code Bundles ===")

# Let's inspect the code chunks for detailed game tables
chunk_dir = os.path.join(WORKSPACE, "site", "_next", "static", "chunks")
files = [os.path.join(chunk_dir, f) for f in os.listdir(chunk_dir) if f.endswith(".js")]
chunks_code = {}
for f in files:
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        chunks_code[os.path.basename(f)] = fp.read()

# Cities and transit
city_chunk = chunks_code.get("3jv557p5iq4mk.js", "")
cities_match = re.search(r'let [a-zA-Z0-9_]+\s*=\s*(\{lagos\s*:\s*\{name\s*:\s*"Lagos"[^;]+);', city_chunk)
if cities_match:
    with open(os.path.join(EXTRACTED_DIR, "cities_and_transit_code.js"), "w", encoding="utf-8") as out:
        out.write(cities_match.group(1))
    print("Extracted cities and transit code")

# UNILAG Campus life
campus_chunk = chunks_code.get("0vks1-_0allxo.js", "")
unilag_matches = re.findall(r'(DEPTS|CAMPUS_ACTIONS|CAMPUS_MOODLETS|HOSTEL|DEGREE|FRESHER_PERKS)\s*=\s*(\[[^\]]+\]|\{[^\}]+\})', campus_chunk)
unilag_data = {k: v for k, v in unilag_matches}
with open(os.path.join(EXTRACTED_DIR, "unilag_academics.json"), "w", encoding="utf-8") as out:
    json.dump(unilag_data, out, indent=2)
print(f"Extracted UNILAG systems: {list(unilag_data.keys())}")

# Retail and Shop
shop_chunk = chunks_code.get("28rj3eza8j4he.js", "")
shop_matches = re.findall(r'(FOOD_GIFTS|FOOD_GIFT_BY_ID|RETAIL|SHOP|PRICE_PICKS)\s*=\s*(\[[^\]]+\]|\{[^\}]+\})', shop_chunk)
shop_data = {k: v for k, v in shop_matches}
with open(os.path.join(EXTRACTED_DIR, "shop_and_retail.json"), "w", encoding="utf-8") as out:
    json.dump(shop_data, out, indent=2)
print(f"Extracted Shop and Retail: {list(shop_data.keys())}")

# Businesses and Lands
biz_chunk = chunks_code.get("2afas8qnowmhu.js", "")
biz_matches = re.findall(r'(BUSINESSES|BIZ_RESALE|LANDS)\s*=\s*(\[[^\]]+\]|\{[^\}]+\})', biz_chunk)
biz_data = {k: v for k, v in biz_matches}
with open(os.path.join(EXTRACTED_DIR, "businesses_and_real_estate.json"), "w", encoding="utf-8") as out:
    json.dump(biz_data, out, indent=2)
print(f"Extracted Businesses and Real Estate: {list(biz_data.keys())}")

# Origins, Nepo Cash, Loans
origins_chunk = chunks_code.get("0mzw0ugrs0p8h.js", "")
origin_matches = re.findall(r'(ORIGINS|BIZ|BIZ_COLORS|LAPO_LOAN|NEPO_CASH|GOV_ALLOWANCE)\s*=\s*(\[[^\]]+\]|\{[^\}]+\})', origins_chunk)
origin_data = {k: v for k, v in origin_matches}
with open(os.path.join(EXTRACTED_DIR, "origins_and_loans.json"), "w", encoding="utf-8") as out:
    json.dump(origin_data, out, indent=2)
print(f"Extracted Origins and Finance: {list(origin_data.keys())}")

print("\n=== All Data Parsing Complete! ===")
