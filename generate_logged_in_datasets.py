import json
import os

def load_step_output(step_file):
    with open(step_file, 'r', encoding='utf-8') as f:
        text = f.read()
    if text.startswith('### Result'):
        text = text[len('### Result'):].strip()
    idx = text.find('### Ran Playwright code')
    if idx != -1:
        text = text[:idx].strip()
    try:
        return json.loads(text)
    except Exception:
        last_brace = text.rfind('}')
        if last_brace != -1:
            return json.loads(text[:last_brace+1])
        raise

# 1. Load Step 288 (localStorage save)
step288 = load_step_output(r'C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\288\output.txt')
save_data = json.loads(step288['localStorage']['lagos-life-save'])
game = save_data['state']['game']

# 2. Load Step 292 (authenticated endpoints batch 1)
step292 = load_step_output(r'C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\292\output.txt')

# 3. Load Step 355 (authenticated endpoints batch 2)
step355 = load_step_output(r'C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\355\output.txt')

# Merge all authenticated API responses
all_api_responses = {}
for ep, info in step292.items():
    all_api_responses[ep] = info
for ep, info in step355.items():
    all_api_responses[ep] = info

out_dir = r'c:\Users\dc941\Documents\LLLife\extracted_data'
os.makedirs(out_dir, exist_ok=True)

# Save 1: authenticated_api_responses.json
with open(os.path.join(out_dir, 'authenticated_api_responses.json'), 'w', encoding='utf-8') as f:
    json.dump(all_api_responses, f, indent=2)
print("Saved authenticated_api_responses.json")

# Save 2: player_profile_bobbyhasfallen.json
profile_data = {
    "account": {
        "id": "d42fb0d8c15d4b878ed7",
        "username": "bobbyhasfallen",
        "name": "Bobby HasFallen",
        "admin": False,
        "terms": True,
        "hasEmail": True
    },
    "sim": game.get("sim"),
    "origin": game.get("origin"),
    "netWorthEstimate": 449586211113116,
    "liquidCash": game.get("money"),
    "forbesStatus": all_api_responses.get("/api/forbes", {}).get("json", {}).get("mine"),
    "efccWatch": game.get("efccWatch"),
    "needs": game.get("needs"),
    "skills": game.get("skills"),
    "moodlets": game.get("moodlets"),
    "health": {
        "sick": game.get("sick"),
        "healthHour": game.get("healthHour"),
        "neglect": game.get("neglect")
    },
    "taxObligations": game.get("tax"),
    "bankAccount": all_api_responses.get("/api/bank", {}).get("json"),
    "casinoStatus": all_api_responses.get("/api/casino", {}).get("json"),
    "vehicles": {
        "activeCar": game.get("carId"),
        "ownedCars": game.get("cars")
    },
    "domesticStaff": game.get("staff"),
    "pantry": game.get("pantry"),
    "wishes": game.get("wishes"),
    "gameTime": {
        "time": game.get("time"),
        "day": game.get("stats", {}).get("dayStarted"),
        "weather": game.get("weather"),
        "power": game.get("power")
    },
    "actionsDoneLifetime": game.get("stats", {}).get("actionsDone", {})
}

with open(os.path.join(out_dir, 'player_profile_bobbyhasfallen.json'), 'w', encoding='utf-8') as f:
    json.dump(profile_data, f, indent=2)
print("Saved player_profile_bobbyhasfallen.json")

# Save 3: player_real_estate_portfolio.json
land_plots = game.get("land", [])
land_summary = {}
for p in land_plots:
    loc = p.get("id", "unknown")
    if loc not in land_summary:
        land_summary[loc] = {"count": 0, "totalPaid": 0}
    land_summary[loc]["count"] += 1
    land_summary[loc]["totalPaid"] += p.get("paid", 0)

real_estate_data = {
    "currentResidence": {
        "homeId": game.get("home"),
        "location": "Banana Island, Ikoyi, Lagos",
        "rentOwed": game.get("rentOwed"),
        "rentPaidUntil": game.get("rentPaidUntil"),
        "furnitureItemsCount": len(game.get("objects", [])),
        "furnitureInventory": game.get("objects", [])
    },
    "landPortfolio": {
        "totalPlotsOwned": len(land_plots),
        "summaryByLocation": land_summary,
        "plots": land_plots
    },
    "commercialPropertySystem": all_api_responses.get("/api/property", {}).get("json"),
    "marketListingsLagos": all_api_responses.get("/api/property?city=lagos", {}).get("json"),
    "marketListingsAbuja": all_api_responses.get("/api/property?city=abuja", {}).get("json")
}

with open(os.path.join(out_dir, 'player_real_estate_portfolio.json'), 'w', encoding='utf-8') as f:
    json.dump(real_estate_data, f, indent=2)
print("Saved player_real_estate_portfolio.json")

# Save 4: player_corporate_empire.json
corporate_data = {
    "registeredCompany": game.get("biz", {}).get("companies", []),
    "companyMarketInfo": all_api_responses.get("/api/company", {}).get("json"),
    "topCompaniesLeaderboard": all_api_responses.get("/api/company?top=1", {}).get("json"),
    "passiveBusinesses": {
        "activeTypes": game.get("businesses", []),
        "dailyRevenueLog": game.get("invest", {}).get("days", []),
        "cumulativeRevenue": game.get("invest", {}).get("total", {}),
        "tillBalance": game.get("biz", {}).get("till", 0)
    },
    "jobBoardListingsPosted": all_api_responses.get("/api/jobs", {}).get("json", {}).get("mine", [])
}

with open(os.path.join(out_dir, 'player_corporate_empire.json'), 'w', encoding='utf-8') as f:
    json.dump(corporate_data, f, indent=2)
print("Saved player_corporate_empire.json")

# Save 5: player_nightlife_and_social.json
nightlife_social = {
    "quiloxNightlife": {
        "lifetimeClubShutdowns": game.get("stats", {}).get("actionsDone", {}).get("clubShutdown", 0),
        "lifetimeClubTakeovers": game.get("stats", {}).get("actionsDone", {}).get("clubTakeover", 0),
        "moneySprayActions": game.get("stats", {}).get("actionsDone", {}).get("sprayMoney", 0),
        "champagneParades": game.get("stats", {}).get("actionsDone", {}).get("champagneParade", 0),
        "hypeManSessions": game.get("stats", {}).get("actionsDone", {}).get("hypeMan", 0),
        "activeNightlifeMoodlets": [m for m in game.get("moodlets", []) if m.get("id") in ["ownTheNight", "shutItDown"]]
    },
    "messaging": {
        "totalThreads": len(all_api_responses.get("/api/messages", {}).get("json", {}).get("threads", [])),
        "threads": all_api_responses.get("/api/messages", {}).get("json", {}).get("threads", [])
    },
    "friendsInJail": all_api_responses.get("/api/bail?friends=1", {}).get("json", {}).get("friends", []),
    "crimeRecord": all_api_responses.get("/api/crime", {}).get("json"),
    "familyAndKin": all_api_responses.get("/api/family", {}).get("json"),
    "socialMediaGistFeed": all_api_responses.get("/api/gist?feed=1", {}).get("json", {}).get("posts", []),
    "onlinePlayersNearby": all_api_responses.get("/api/players", {}).get("json", {}).get("players", []),
    "sportsBettingSlips": game.get("bets", [])
}

with open(os.path.join(out_dir, 'player_nightlife_and_social.json'), 'w', encoding='utf-8') as f:
    json.dump(nightlife_social, f, indent=2)
print("Saved player_nightlife_and_social.json")

print("\n--- SUMMARY OF EXTRACTED FILES ---")
for f in os.listdir(out_dir):
    p = os.path.join(out_dir, f)
    print(f"  {f} ({os.path.getsize(p):,} bytes)")
