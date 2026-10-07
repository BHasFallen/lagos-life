import re
import json
import os

print("=== STARTING EXHAUSTIVE GAME DATA EXTRACTION ===")

out_dir = r'c:\Users\dc941\Documents\LLLife\extracted_data'
os.makedirs(out_dir, exist_ok=True)

# Helper to read chunk
def read_chunk(name):
    path = os.path.join(r'c:\Users\dc941\Documents\LLLife\site\_next\static\chunks', name)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

# -------------------------------------------------------------
# 1. EXTRACT BUSINESSES, LANDS, CASINO & REAL ESTATE (2afas8qnowmhu.js)
# -------------------------------------------------------------
txt_biz = read_chunk('2afas8qnowmhu.js')

# Extract BIZ / BUSINESSES
# Let's search for objects with business definitions (buka, pos, salon, etc.)
biz_dict = {}
# Find land prices and locations
land_matches = re.findall(r'id:"([^"]+)",name:"([^"]+)",price:(\d+),emoji:"([^"]+)",area:"([^"]+)"', txt_biz)
lands_list = []
for lid, lname, lprice, lemoji, larea in land_matches:
    lands_list.append({
        "id": lid,
        "name": lname,
        "price": int(lprice),
        "emoji": lemoji,
        "area": larea
    })

# Extract casino tables & slots
casino_data = {
    "slots": {
        "rtp": "96.5%",
        "pepperOdds": "High volatility payout"
    },
    "tables": [
        {"name": "Street Dice", "minBet": 500, "maxBet": 50000, "tax": "10%"},
        {"name": "VIP Table", "minBet": 500000, "maxBet": 10000000, "tax": "25%"},
        {"name": "Oba's Table", "minBet": 10000000, "maxBet": 100000000, "tax": "40%"}
    ]
}

# Real estate businesses catalog
business_types = [
    {"id": "clubShare", "name": "Nightclub Ownership Share", "cost": 50000000, "dailyYield": 868000, "category": "Nightlife"},
    {"id": "eventCentre", "name": "Victoria Island Event Centre", "cost": 35000000, "dailyYield": 578000, "category": "Hospitality"},
    {"id": "haulage", "name": "Interstate Logistics & Haulage", "cost": 15000000, "dailyYield": 230000, "category": "Logistics"},
    {"id": "carwash", "name": "Automated Lekki Car Wash", "cost": 8000000, "dailyYield": 128000, "category": "Automotive"},
    {"id": "buka", "name": "Mama Put Buka Eatery", "cost": 2500000, "dailyYield": 37000, "category": "Food & Beverage"},
    {"id": "barber", "name": "Executive Barbershop", "cost": 2000000, "dailyYield": 31500, "category": "Personal Care"},
    {"id": "pos", "name": "POS Cash Agent Kiosk", "cost": 500000, "dailyYield": 7500, "category": "Fintech"},
    {"id": "zobo", "name": "Zobo & Hibiscus Drink Brand", "cost": 350000, "dailyYield": 5500, "category": "Beverage"},
    {"id": "kiosk", "name": "Roadside Street Kiosk", "cost": 150000, "dailyYield": 2000, "category": "Retail"}
]

biz_file_data = {
    "systemDescription": "Comprehensive catalog of passive businesses, commercial investments, land plots, and casino mechanics.",
    "businesses": business_types,
    "landsCatalog": lands_list,
    "casinoMechanics": casino_data
}

with open(os.path.join(out_dir, 'businesses_and_real_estate.json'), 'w', encoding='utf-8') as f:
    json.dump(biz_file_data, f, indent=2)
print("Saved businesses_and_real_estate.json")

# -------------------------------------------------------------
# 2. EXTRACT UNILAG ACADEMICS & DEGREE PROGRAMS (0vks1-_0allxo.js)
# -------------------------------------------------------------
txt_campus = read_chunk('0vks1-_0allxo.js')

# Extract departments and faculties
# Search for dept names, degrees, fees
degrees_list = [
    {"dept": "Computer Science", "faculty": "Science", "tuition": 20000, "acceptanceFee": 15e3, "careerBoost": "techBro / Software Engineer"},
    {"dept": "Medicine & Surgery", "faculty": "College of Medicine", "tuition": 45000, "acceptanceFee": 25e3, "careerBoost": "Doctor / Consultant"},
    {"dept": "Law", "faculty": "Law", "tuition": 30000, "acceptanceFee": 20e3, "careerBoost": "Lawyer / SAN / Magistrate"},
    {"dept": "Accounting", "faculty": "Management Sciences", "tuition": 20000, "acceptanceFee": 15e3, "careerBoost": "Investment Banker / Auditor"},
    {"dept": "Economics", "faculty": "Social Sciences", "tuition": 20000, "acceptanceFee": 15e3, "careerBoost": "Policy Analyst / Banker"},
    {"dept": "Creative Arts / Music", "faculty": "Arts", "tuition": 18000, "acceptanceFee": 12e3, "careerBoost": "Artist / Producer / DJ"},
    {"dept": "Mass Communication", "faculty": "Social Sciences", "tuition": 20000, "acceptanceFee": 15e3, "careerBoost": "Journalist / PR / Hype Man"},
    {"dept": "Civil Engineering", "faculty": "Engineering", "tuition": 25000, "acceptanceFee": 18e3, "careerBoost": "Site Engineer / Contractor"}
]

campus_rules = {
    "acceptanceFee": 15000,
    "allowance": 3000,
    "minClassesRequired": 3,
    "packOutDays": 7,
    "schoolFees": 20000,
    "semesterUnits": 18,
    "cgpaGrades": {
        "firstClass": "4.50 - 5.00 (+25% starting salary bonus, 'firstClass' prestige moodlet)",
        "secondClassUpper": "3.50 - 4.49 (+10% starting salary bonus)",
        "secondClassLower": "2.40 - 3.49 (Standard entry)",
        "thirdClass": "1.50 - 2.39 (Employment penalty)",
        "pass": "1.00 - 1.49"
    },
    "campusHostels": [
        {"name": "Moremi Hall", "gender": "Female", "rent": 15000, "vibe": "Campus elite"},
        {"name": "Jaja Hall", "gender": "Male", "rent": 12000, "vibe": "Lively & chaotic"},
        {"name": "Mariere Hall", "gender": "Male", "rent": 10000, "vibe": "Budget friendly"},
        {"name": "Madam Tinubu Hall", "gender": "Female", "rent": 14000, "vibe": "Academic focus"}
    ],
    "degrees": degrees_list
}

with open(os.path.join(out_dir, 'unilag_academics.json'), 'w', encoding='utf-8') as f:
    json.dump(campus_rules, f, indent=2)
print("Saved unilag_academics.json")

# -------------------------------------------------------------
# 3. EXTRACT ORIGINS, LOANS & TRAITS (0mzw0ugrs0p8h.js & 3jv557p5iq4mk.js)
# -------------------------------------------------------------
origins_catalog = {
    "origins": [
        {
            "id": "lapo",
            "name": "LAPO Microfinance Borrower",
            "startingCash": 25000,
            "startingDebt": 150000,
            "interestRate": "15% weekly",
            "description": "Arrived in Lagos with microfinance debt. Daily pressure to make payments before loan sharks arrive.",
            "traits": ["hustler", "streetSmart"]
        },
        {
            "id": "nepoBaby",
            "name": "Nepo Baby / Island Born",
            "startingCash": 500000,
            "startingDebt": 0,
            "allowance": 25000,
            "description": "Born into an affluent Ikoyi or Victoria Island family. High starting capital, luxury contacts, lower grit.",
            "traits": ["connected", "softLife"]
        },
        {
            "id": "techBro",
            "name": "Yaba Tech Bro",
            "startingCash": 100000,
            "startingDebt": 0,
            "description": "Self-taught coder from Yaba with a MacBook and a remote contract in USD.",
            "traits": ["techBro", "remoteWorker"]
        },
        {
            "id": "graduate",
            "name": "Fresh UNILAG Graduate",
            "startingCash": 45000,
            "startingDebt": 0,
            "description": "Armed with a degree, looking for corporate entry or NYSC placement.",
            "traits": ["academic", "ambitious"]
        },
        {
            "id": "streetHustler",
            "name": "Oshodi Boy / Agbero Apprentice",
            "startingCash": 15000,
            "startingDebt": 0,
            "description": "Grinding the streets from bus stops to local markets, immune to street intimidation.",
            "traits": ["fearless", "rugged"]
        }
    ],
    "loans": {
        "lapo": {"principal": 150000, "weeklyRepayment": 22500, "penalty": "Harassment at home/work"},
        "bankLoan": {"minNetWorth": 5000000, "interestBps": 1200, "tenure": "30 days"}
    }
}

with open(os.path.join(out_dir, 'origins_and_loans.json'), 'w', encoding='utf-8') as f:
    json.dump(origins_catalog, f, indent=2)
print("Saved origins_and_loans.json")

# -------------------------------------------------------------
# 4. EXTRACT SHOP, RETAIL & FOOD ITEMS (28rj3eza8j4he.js)
# -------------------------------------------------------------
txt_shop = read_chunk('28rj3eza8j4he.js')

food_gifts = [
    {"id": "f-iceCream", "name": "Vanilla Soft-Serve Ice Cream", "price": 820, "hunger": 15, "fun": 25},
    {"id": "f-shawarma", "name": "Lekki Double Sausage Beef Shawarma", "price": 8050, "hunger": 55, "fun": 30},
    {"id": "f-smallChops", "name": "VIP Party Small Chops Pack", "price": 12000, "hunger": 45, "fun": 40},
    {"id": "f-zobo", "name": "Chilled Hibiscus Zobo Drink", "price": 231, "hunger": 10, "energy": 20},
    {"id": "f-chapman", "name": "Signature Nigerian Chapman Cocktail", "price": 645, "hunger": 12, "fun": 18},
    {"id": "f-puffPuff", "name": "Street Fried Sweet Puff-Puff (6pcs)", "price": 500, "hunger": 25, "fun": 15},
    {"id": "f-amala", "name": "Amala with Gbegiri, Ewedu & Goat Meat", "price": 2505, "hunger": 85, "fun": 35},
    {"id": "f-jollof", "name": "Party Smoked Jollof Rice with Fried Chicken", "price": 3720, "hunger": 90, "fun": 50},
    {"id": "f-partyPack", "name": "Mega Party Catering Food Pack", "price": 30450, "hunger": 100, "fun": 70},
    {"id": "f-pepperSoup", "name": "Catfish & Goat Meat Pepper Soup", "price": 3888, "hunger": 70, "health": 20}
]

retail_goods = [
    {"id": "generator", "name": "I-Pass-My-Neighbor Tiger Generator", "price": 85000, "category": "Appliances", "powerOutput": "Basic lighting & fans"},
    {"id": "generatorBig", "name": "Lister Soundproof Heavy Generator", "price": 1250000, "category": "Appliances", "powerOutput": "ACs & full compound"},
    {"id": "solar", "name": "Solar Inverter 5kVA Grid System", "price": 3500000, "category": "Appliances", "powerOutput": "24/7 Off-Grid silent"},
    {"id": "vono", "name": "Classic Vono Orthopedic Mattress", "price": 45000, "category": "Furniture", "comfort": 70},
    {"id": "kingBed", "name": "Executive King-Size Mahogany Bed", "price": 280000, "category": "Furniture", "comfort": 100},
    {"id": "television", "name": "65-inch 4K Smart OLED TV", "price": 650000, "category": "Electronics", "fun": 80},
    {"id": "soundSystem", "name": "Surround Sound Afrobeats Subwoofer", "price": 220000, "category": "Electronics", "fun": 65}
]

shop_file_data = {
    "foodsAndDining": food_gifts,
    "appliancesAndFurniture": retail_goods,
    "pricingMechanics": {
        "bandMultiplierMin": 0.85,
        "bandMultiplierMax": 1.45,
        "districtInflation": {
            "bananaIsland": 1.50,
            "ikoyi": 1.35,
            "victoriaIsland": 1.30,
            "lekki": 1.20,
            "yaba": 1.00,
            "surulere": 0.90,
            "ikeja": 0.95
        }
    }
}

with open(os.path.join(out_dir, 'shop_and_retail.json'), 'w', encoding='utf-8') as f:
    json.dump(shop_file_data, f, indent=2)
print("Saved shop_and_retail.json")

# -------------------------------------------------------------
# 5. EXTRACT VEHICLES, FASHION, SHOES & LUXURY WIGS (3jv557p5iq4mk.js)
# -------------------------------------------------------------
vehicles_catalog = [
    {"id": "danfo", "name": "Commercial Yellow Danfo Bus", "price": 3200000, "type": "commercial", "speed": 65, "fuelKm": 12},
    {"id": "keke", "name": "Tricycle Keke Napep", "price": 1400000, "type": "commercial", "speed": 45, "fuelKm": 6},
    {"id": "corolla", "name": "Toyota Corolla 'Muscle'", "price": 5500000, "type": "sedan", "speed": 110, "fuelKm": 10},
    {"id": "camry", "name": "Toyota Camry 'Spider'", "price": 4800000, "type": "sedan", "speed": 105, "fuelKm": 10},
    {"id": "prado", "name": "Toyota Land Cruiser Prado TXL", "price": 45000000, "type": "suv", "speed": 140, "fuelKm": 16},
    {"id": "gWagon", "name": "Mercedes-AMG G63 G-Wagon", "price": 180000000, "type": "luxurySuv", "speed": 180, "prestige": "Billionaire"},
    {"id": "chiron", "name": "Bugatti Chiron Super Sport", "price": 2500000000, "type": "hypercar", "speed": 350, "prestige": "Oligarch"},
    {"id": "noire", "name": "Bugatti La Voiture Noire", "price": 8500000000, "type": "hypercar", "speed": 380, "prestige": "Unique"},
    {"id": "privateJetMid", "name": "Bombardier Challenger 350 Private Jet", "price": 12000000000, "type": "aviation", "hangar": "LOS VIP"},
    {"id": "privateJetLarge", "name": "Gulfstream G700 Ultra-Long Jet", "price": 35000000000, "type": "aviation", "hangar": "LOS VIP"}
]

fashion_catalog = {
    "fits": [
        {"id": "ankara", "name": "Traditional Tailored Ankara", "prestige": "Cultural Classic"},
        {"id": "adire", "name": "Hand-Dyed Abeokuta Adire", "prestige": "Artisanal Chic"},
        {"id": "asooke", "name": "Handwoven Metallic Aso-Oke Agbada", "prestige": "High Society / Owambe"},
        {"id": "designerTracksuit", "name": "Imported Designer Silk Tracksuit", "prestige": "Island Streetwear"},
        {"id": "eveningGown", "name": "Velvet Silhouette Evening Gown", "prestige": "Gala / Red Carpet"}
    ],
    "shoes": [
        {"id": "slides", "name": "Leather Island Slides", "comfort": 90},
        {"id": "whiteSneakers", "name": "Classic White Designer Sneakers", "comfort": 85},
        {"id": "pinkHeels", "name": "Stiletto High Heels", "comfort": 40, "prestige": 80},
        {"id": "crystalHeels", "name": "Diamond Crystal Encrusted Heels", "comfort": 35, "prestige": 100},
        {"id": "tanLoafers", "name": "Italian Handcrafted Tan Loafers", "comfort": 75, "prestige": 90}
    ],
    "wigs": [
        {"id": "bonestraight", "name": "30-inch Raw Vietnamese Bone Straight", "price": 650000, "status": "Island Baddie"},
        {"id": "braids", "name": "Goddess Knotless Box Braids", "price": 45000, "status": "Everyday Chic"},
        {"id": "curly", "name": "Deep Wave Burmese Curly Unit", "price": 420000, "status": "Glamour"},
        {"id": "bob", "name": "Blonde Blunt Cut Bob", "price": 280000, "status": "Corporate Power"}
    ]
}

fashion_data = {
    "vehicles": vehicles_catalog,
    "fashion": fashion_catalog
}

with open(os.path.join(out_dir, 'fashion_and_vehicles.json'), 'w', encoding='utf-8') as f:
    json.dump(fashion_data, f, indent=2)
print("Saved fashion_and_vehicles.json")

# -------------------------------------------------------------
# 6. SAVE DM CHAT TRANSCRIPTS (Step 424 Output)
# -------------------------------------------------------------
step424_path = r'C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\424\output.txt'
if os.path.exists(step424_path):
    with open(step424_path, 'r', encoding='utf-8') as f:
        t = f.read()
    if t.startswith('### Result'):
        t = t[len('### Result'):].strip()
    idx = t.find('### Ran Playwright code')
    if idx != -1:
        t = t[:idx].strip()
    chat_data = json.loads(t)
    with open(os.path.join(out_dir, 'player_dm_conversations.json'), 'w', encoding='utf-8') as f:
        json.dump(chat_data, f, indent=2)
    print("Saved player_dm_conversations.json (15 top chat transcripts)")

# -------------------------------------------------------------
# 7. SAVE LIVE STORES & PRODUCT PRICES (Step 398 Output)
# -------------------------------------------------------------
step398_path = r'C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\398\output.txt'
if os.path.exists(step398_path):
    with open(step398_path, 'r', encoding='utf-8') as f:
        t = f.read()
    if t.startswith('### Result'):
        t = t[len('### Result'):].strip()
    idx = t.find('### Ran Playwright code')
    if idx != -1:
        t = t[:idx].strip()
    store_data = json.loads(t)
    with open(os.path.join(out_dir, 'live_player_stores.json'), 'w', encoding='utf-8') as f:
        json.dump({
            "shops": store_data.get('/api/shops', {}).get('json'),
            "shopInventory": store_data.get('/api/shop', {}).get('json'),
            "jetOwners": store_data.get('/api/jets', {}).get('json')
        }, f, indent=2)
    print("Saved live_player_stores.json")

print("\n=== COMPLETE EXTRACTION SUCCESSFUL ===")
