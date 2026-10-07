import os
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
EXT_DIR = os.path.join(WORKSPACE, "extracted_data")
os.makedirs(EXT_DIR, exist_ok=True)

# 1. Game Locations
locations = [
    {"id": "afrika_shrine", "name": "Afrika Shrine", "emoji": "🎷", "category": "Nightlife & Culture", "area": "Ikeja", "description": "The legendary home of Afrobeat founded by Fela Kuti. Live brass bands, palm wine, and high energy."},
    {"id": "viewing_centre", "name": "Viewing Centre", "emoji": "⚽", "category": "Entertainment & Sports", "area": "Surulere", "description": "Watch Premier League matches, place instant bets, banter with fans, and drink cold drinks."},
    {"id": "amala_shitta", "name": "Amala Shitta", "emoji": "🍲", "category": "Food & Dining", "area": "Surulere", "description": "Lagos's most famous amala joint. Steaming amala, ewedu, gbegiri, goat meat, and round fish."},
    {"id": "cchub", "name": "CcHub", "emoji": "💡", "category": "Tech & Work", "area": "Yaba", "description": "Co-Creation Hub in the Silicon Lagoon. Startup pitches, tech meetups, coding sessions, and steady power."},
    {"id": "market", "name": "Tejuosho / Balogun Market", "emoji": "🧺", "category": "Commerce", "area": "Yaba / Island", "description": "Bustling open-air marketplace for fabrics, foodstuff, shoes, and street bargains."},
    {"id": "freedom_park", "name": "Freedom Park", "emoji": "🎭", "category": "Culture & Arts", "area": "Lagos Island", "description": "Colonial prison turned arts hub. Live jazz, drama plays, art exhibitions, and open-air greenery."},
    {"id": "ifitness", "name": "i-Fitness Gym", "emoji": "🏋️", "category": "Health & Fitness", "area": "Lekki", "description": "Modern fitness center. Build stamina, workout with friends, and boost health stats."},
    {"id": "office", "name": "Corporate Office", "emoji": "🏢", "category": "Work & Careers", "area": "Victoria Island", "description": "High-rise corporate headquarters. Clock in for shifts, earn salaries, and climb the ladder."},
    {"id": "quilox", "name": "Quilox Nightclub", "emoji": "🪩", "category": "Nightlife", "area": "Victoria Island", "description": "Ultra-luxury nightclub on Ozumba Mbadiwe. VIP tables, bottle service, and money spraying."},
    {"id": "canopy_walk", "name": "Lekki Conservation Centre", "emoji": "🌉", "category": "Nature & Tourism", "area": "Lekki", "description": "Africa's longest canopy walkway through wetlands, nature trails, and monkey habitats."},
    {"id": "the_palms", "name": "The Palms Mall", "emoji": "🛍️", "category": "Shopping", "area": "Lekki", "description": "Premier shopping mall. Cinema, designer fashion stores, electronics, and food court."},
    {"id": "library", "name": "The Main Library", "emoji": "📚", "category": "Education", "area": "Yaba", "description": "Quiet study desks, archives, research texts, and book clubs."},
    {"id": "beach", "name": "Elegushi / Landmark Beach", "emoji": "🏖️", "category": "Leisure", "area": "Victoria Island", "description": "Atlantic ocean breeze, beach soccer, jet skis, and seaside grills."},
    {"id": "hospital", "name": "General Hospital", "emoji": "🏥", "category": "Healthcare", "area": "Lagos Island", "description": "State medical center for treatments, health recovery, checkups, and emergencies."},
    {"id": "salon", "name": "Mama Bisi's Salon", "emoji": "💇🏾‍♀️", "category": "Personal Care", "area": "Surulere", "description": "Hair braiding, fades, gossip (gist), and fresh grooming."},
    {"id": "rooftop", "name": "Ivory Rooftop", "emoji": "🕯️", "category": "Dining & Romance", "area": "Victoria Island", "description": "Candlelit dining overlooking the Lagos skyline and lagoon."},
    {"id": "police", "name": "Police Station", "emoji": "🚓", "category": "Civic & Law", "area": "Mainland", "description": "Local station for reporting crimes, bail hearings, and settlement."},
    {"id": "church", "name": "Church", "emoji": "⛪", "category": "Faith & Community", "area": "Mainland", "description": "Sunday worship, choir practice, thanksgiving services, and community support."},
    {"id": "mosque", "name": "Central Mosque", "emoji": "🕌", "category": "Faith & Community", "area": "Lagos Island", "description": "Juma'at prayers, Ramadan lectures, and peaceful reflection."},
    {"id": "radio", "name": "Naija Radio Station", "emoji": "📻", "category": "Media", "area": "Ikoyi", "description": "Broadcast studio playing top Afrobeats hits and live on-air banter."},
    {"id": "polling", "name": "Polling Unit", "emoji": "🗳️", "category": "Politics", "area": "Civic Centre", "description": "Vote in the Governor and Senate elections, review candidate slogans and ballots."},
    {"id": "eko_hotels", "name": "Eko Hotels & Suites", "emoji": "🏨", "category": "Hospitality & Hub", "area": "Victoria Island", "description": "World-famous hotel hosting the biggest concerts, awards, and conferences in West Africa."},
    {"id": "polanco", "name": "Polanco Motors", "emoji": "🚘", "category": "Automotive", "area": "Victoria Island", "description": "Luxury car dealership selling Sedans, SUVs, Taxis, Vans, and Toyota Prados."},
    {"id": "boat_cruise", "name": "Lagos Boat Cruise", "emoji": "⛵", "category": "Transport & Leisure", "area": "Lagos Lagoon", "description": "Ferry and luxury boat trips across the lagoon between Island and Mainland."},
    {"id": "golf", "name": "Ikoyi Golf Club 1938", "emoji": "⛳", "category": "Exclusive Sports", "area": "Ikoyi", "description": "Historic golf course for high-net-worth networking and leisure tournaments."},
    {"id": "court", "name": "Lagos High Court", "emoji": "⚖️", "category": "Justice", "area": "Tafawa Balewa Square", "description": "Legal trials, dispute resolution, contract enforcement, and civil suits."},
    {"id": "unilag", "name": "University of Lagos (UNILAG)", "emoji": "🎓", "category": "Academics", "area": "Akoka, Yaba", "description": "University of First Choice. Lectures, Senate building, hostels, and lagoon front."},
    {"id": "casino", "name": "Eko Casino", "emoji": "🎰", "category": "Gaming", "area": "Victoria Island", "description": "Roulette, card tables, slots, and high-stakes gambling."},
    {"id": "mindspace", "name": "MindSpace Wellness", "emoji": "🫶🏾", "category": "Mental Wellness", "area": "Lekki", "description": "Therapy sessions, stress reduction, relaxation, and mental health recharge."},
    {"id": "stadium", "name": "Teslim Balogun Stadium", "emoji": "🏟️", "category": "Sports", "area": "Surulere", "description": "National league football matches, athletic tournaments, and youth festivals."},
    {"id": "airport", "name": "Murtala Muhammed International Airport (MMIA)", "emoji": "✈️", "category": "Travel", "area": "Ikeja", "description": "Domestic and international terminal. Air Peace flights to Abuja and Port Harcourt."},
    {"id": "refinery", "name": "Dangote Petroleum Refinery", "emoji": "🛢️", "category": "Industry", "area": "Lekki Free Zone", "description": "Massive petrochemical and industrial complex producing refined energy products."}
]

with open(os.path.join(EXT_DIR, "game_locations.json"), "w", encoding="utf-8") as f:
    json.dump(locations, f, indent=2)
print("Saved game_locations.json")

# 2. Economy & Cultural Systems
economy = {
    "currency": "Nigerian Naira (₦)",
    "net_worth_components": ["Liquid cash", "Bank savings", "Furniture value", "Vehicles", "Real estate (homes/lands)", "Company shares", "Trailers"],
    "starting_origins": [
        {"id": "ajegunle", "name": "Ajegunle Hustler", "cash": 5000, "perk": "High street smarts and resilience, lower initial cash"},
        {"id": "surulere", "name": "Surulere Middle Class", "cash": 25000, "perk": "Balanced start with decent family safety net"},
        {"id": "yaba_tech", "name": "Yaba Tech Bro", "cash": 50000, "perk": "Laptop and CcHub access, remote earning capacity"},
        {"id": "nepo_baby", "name": "Ikoyi Nepo Baby", "cash": 500000, "perk": "Inherited cash, Prado access, high societal status"}
    ],
    "banking": {
        "institution": "Lagos Life Bank",
        "loans": {
            "lapo": {"name": "LAPO Microfinance Loan", "limit": 100000, "interest_weekly": 0.05, "desc": "Quick collateral-free emergency cash with weekly repayment"}
        }
    },
    "power_grid_system": {
        "grid_name": "NEPA / EKEDC / IBEDC",
        "blackout_mechanic": "Regular power outages affect unpowered homes. Food in unpowered fridges spoils; TVs and computers shut down.",
        "backup_solutions": [
            {"item": "Tiger Generator ('I pass my neighbor')", "fuel": "Petrol", "noise": "High", "cost": "Budget"},
            {"item": "Lister / Big Gen", "fuel": "Diesel", "noise": "Medium", "cost": "Mid-tier"},
            {"item": "Solar Inverter System", "fuel": "Solar clean", "noise": "Silent", "cost": "High-end"}
        ]
    },
    "social_culture": {
        "money_spraying": "At parties (Quilox, weddings, clubs), players can spray Naira bills on others. Spectators can pick sprayed notes from the floor.",
        "police_and_bail": "Police stops, checks, and citations. Bails can be settled at police stations or argued in High Court.",
        "sports_betting": "Instant bets on live match odds at Viewing Centres across the mainland."
    }
}

with open(os.path.join(EXT_DIR, "economy_and_culture.json"), "w", encoding="utf-8") as f:
    json.dump(economy, f, indent=2)
print("Saved economy_and_culture.json")

# 3. Intercity Travel & Vehicles
transit = {
    "cities": {
        "lagos": {"name": "Lagos", "state": "Lagos State", "type": "Metropolis & Port", "hub": "Eko Hotels & MMIA"},
        "abuja": {"name": "Abuja", "state": "Federal Capital Territory", "type": "Federal Capital", "hub": "Nnamdi Azikiwe Airport"},
        "ph": {"name": "Port Harcourt", "state": "Rivers State", "type": "Garden City / Oil Hub", "hub": "Port Harcourt International Airport"}
    },
    "transit_modes": [
        {"mode": "Danfo", "cost": 500, "speed": "Medium", "vibe": "Conductor calling stops, yellow bus hustle"},
        {"mode": "BRT Bus", "cost": 800, "speed": "Fast (dedicated lane)", "vibe": "Organized transit, card tap"},
        {"mode": "Private Car (Sedan / SUV / Prado)", "cost": "Fuel", "speed": "Variable with Lagos traffic", "status": "Personal comfort"},
        {"mode": "Water Ferry / Boat Cruise", "cost": 2500, "speed": "Very fast", "route": "Lagoon bypass around Third Mainland Bridge traffic"},
        {"mode": "GIG Night Bus", "fare": 25000, "duration_hours": 3, "destinations": ["Lagos <-> Abuja", "Lagos <-> Port Harcourt"]},
        {"mode": "Air Peace Flight", "fare": 90000, "duration_hours": 1, "staff_discount": 0.5, "destinations": ["Lagos <-> Abuja", "Lagos <-> Port Harcourt"]}
    ]
}

with open(os.path.join(EXT_DIR, "intercity_transit.json"), "w", encoding="utf-8") as f:
    json.dump(transit, f, indent=2)
print("Saved intercity_transit.json")

# 4. UNILAG System
unilag = {
    "university": "University of Lagos (UNILAG)",
    "location": "Akoka, Yaba, Lagos",
    "faculties": ["Faculty of Law", "Faculty of Engineering", "College of Medicine", "Faculty of Business Administration", "Faculty of Arts", "Faculty of Science", "Faculty of Social Sciences"],
    "grading_tiers": {
        "first_class": {"label": "First Class Honours", "bonus_pay": 0.20, "emoji": "🥇"},
        "second_upper": {"label": "Second Class Upper (2:1)", "bonus_pay": 0.12, "emoji": "🥈"},
        "second_lower": {"label": "Second Class Lower (2:2)", "bonus_pay": 0.06, "emoji": "🥉"},
        "third_class": {"label": "Third Class", "bonus_pay": 0.03, "emoji": "🎓"}
    },
    "asuu_strike_mechanic": "Periodic Academic Staff Union of Universities (ASUU) strikes halt classes, examinations, and graduations until negotiations conclude.",
    "hostel_living": {
        "name": "UNILAG Hall of Residence",
        "weekly_rent": 1200,
        "culture": "Bunk space, reading desks, kerosene stove cooking, hall gossips, water bucket lines"
    }
}

with open(os.path.join(EXT_DIR, "unilag_education.json"), "w", encoding="utf-8") as f:
    json.dump(unilag, f, indent=2)
print("Saved unilag_education.json")

print("Generated structured datasets successfully.")
