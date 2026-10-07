import os
import re
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
WORKSPACE = r"c:\Users\dc941\Documents\LLLife"

def get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()

def save_file(rel_path, data):
    full_path = os.path.join(WORKSPACE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(data)
    return full_path

print("=== Starting Full Website & Asset Extraction for Lagos Life ===")

# --- 1. Basic Pages & Assets ---
print("\n--- 1. Fetching Basic Pages & Icons ---")
basics = [
    ("/", "site/index.html"),
    ("/manifest.webmanifest", "site/manifest.webmanifest"),
    ("/icon.svg?icon.1yrju-45dlf-0.svg", "site/icon.svg"),
    ("/apple-icon.png?apple-icon.3g-ksduuva788.png", "site/apple-icon.png"),
    ("/privacy", "site/privacy.html"),
    ("/robots.txt", "site/robots.txt"),
    ("https://lagoslife.app/opengraph-image?3c97f788344d8ddc", "site/opengraph-image.png"),
    ("https://lagoslife.app/twitter-image?3c97f788344d8ddc", "site/twitter-image.png")
]

for url_part, local_path in basics:
    url = url_part if url_part.startswith("http") else BASE_URL + url_part
    try:
        data = get(url)
        save_file(local_path, data)
        print(f"  [SAVED] {local_path} ({len(data):,} bytes)")
    except Exception as e:
        print(f"  [FAILED] {url}: {e}")

# --- 2. Live API Data ---
print("\n--- 2. Fetching Live API Responses ---")
api_endpoints = [
    ("/api/gov", "api_data/gov.json"),
    ("/api/homes?map=1", "api_data/homes.json"),
    ("/api/sea", "api_data/sea.json"),
    ("/api/ads", "api_data/ads.json"),
    ("/api/daily", "api_data/daily.json"),
    ("/api/radio", "api_data/radio.json"),
    ("/api/visit", "api_data/visit.json"),
    ("/api/version", "api_data/version.json"),
    ("/api/auth/mode", "api_data/auth_mode.json"),
    ("/api/auth/me", "api_data/auth_me.json"),
    ("/api/verified", "api_data/verified.json")
]

for ep, local_path in api_endpoints:
    url = BASE_URL + ep
    try:
        data = get(url)
        save_file(local_path, data)
        print(f"  [SAVED API] {ep} -> {local_path} ({len(data):,} bytes)")
    except Exception as e:
        print(f"  [FAILED API] {ep}: {e}")

# --- 3. Static Chunks & Media ---
print("\n--- 3. Fetching Static CSS, JS Chunks & Fonts ---")
chunks = [
    "/_next/static/chunks/1hbzhmilrsj2i.css",
    "/_next/static/chunks/3ni5tbb449gjx.css",
    "/_next/static/chunks/0p91zfawmvoj4.js",
    "/_next/static/chunks/2kstq4kblh5h-.js",
    "/_next/static/chunks/turbopack-32r47vn9gk1gs.js",
    "/_next/static/chunks/3ox82lyaxun21.js",
    "/_next/static/chunks/3dlqm4t3lwqe9.js",
    "/_next/static/chunks/137cyer49p1ei.js",
    "/_next/static/chunks/3aewumg6jlhf3.js",
    "/_next/static/chunks/3vdp8l41vgaco.js",
    "/_next/static/chunks/0u3h5phbnjv14.js",
    "/_next/static/chunks/0u-lpfsr-kyh3.js",
    "/_next/static/chunks/2ttj87p8vn0op.js",
    "/_next/static/chunks/0mzw0ugrs0p8h.js",
    "/_next/static/chunks/0a4az3h_zfpn4.js",
    "/_next/static/chunks/1j4-pmgn7-r9_.js",
    "/_next/static/chunks/3jv557p5iq4mk.js",
    "/_next/static/chunks/3qi9c-v7ubuum.js",
    "/_next/static/chunks/0vks1-_0allxo.js",
    "/_next/static/chunks/2afas8qnowmhu.js",
    "/_next/static/chunks/2lohtkr713v9v.js",
    "/_next/static/chunks/0v9ugcu8gsz7s.js",
    "/_next/static/chunks/28rj3eza8j4he.js",
    "/_next/static/chunks/2h5d-2cshddbh.js",
    "/_next/static/chunks/3k9est-ai4y52.js",
    "/_next/static/chunks/1wzoa_870ez4l.js",
    "/_next/static/chunks/3vct9ii-k-uvy.js",
    "/_next/static/chunks/0jdui2ubgldm6.js",
    "/_next/static/chunks/0cz1d0mv5g_q7.js",
    "/_next/static/chunks/0aebqb-r2y4mc.js",
    "/_next/static/chunks/2z_pbiejpxl6k.js",
    "/_next/static/chunks/2m1axo1s__xif.js",
    "/_next/static/chunks/2y9mt7hzmv74u.js",
    "/_next/static/chunks/0h-j4_yw35a--.js",
    "/_next/static/chunks/2ipskyn6xlm81.js",
    "/_next/static/chunks/0vgk6h7j_ua28.js",
    "/_next/static/chunks/3gg_tw9jrbd5h.js",
    "/_next/static/chunks/1todx7rctijxc.js",
    "/_next/static/chunks/3iluy0onkjs7j.js",
    "/_next/static/chunks/33hpcy7s2rwbe.js",
    "/_next/static/chunks/2c3zakk_tyr-i.js",
    "/_next/static/chunks/0wu-n3qohfqt_.js",
    "/_next/static/chunks/0ive9zeli_v2r.js",
    "/_next/static/media/5d52bd6c4cb3f315-s.p.0ez3bnoxb63ra.woff2",
    "/_next/static/media/fba5a26ea33df6a3-s.p.18rizl4rsrl42.woff2"
]

def fetch_chunk(rel):
    url = BASE_URL + rel
    local_path = "site" + rel
    try:
        data = get(url)
        save_file(local_path, data)
        return True, rel, len(data)
    except Exception as e:
        return False, rel, str(e)

with ThreadPoolExecutor(max_workers=8) as ex:
    futures = [ex.submit(fetch_chunk, c) for c in chunks]
    for fut in as_completed(futures):
        success, rel, info = fut.result()
        if success:
            print(f"  [SAVED CHUNK] {rel} ({info:,} bytes)")
        else:
            print(f"  [FAILED CHUNK] {rel}: {info}")

# --- 4. 3D GLB Models & Textures ---
print("\n--- 4. Fetching 3D Models & Textures ---")
model_names = [
    # characters
    "chars/f_casual.glb",
    "chars/f_party.glb",
    "chars/f_smart.glb",
    "chars/f_street.glb",
    "chars/f_work.glb",
    "chars/m_casual.glb",
    "chars/m_casual2.glb",
    "chars/m_party.glb",
    "chars/m_smart.glb",
    "chars/m_street.glb",
    "chars/m_work.glb",
    # cars
    "world/car/sedan.glb",
    "world/car/suv.glb",
    "world/car/taxi.glb",
    "world/car/truck.glb",
    "world/car/van.glb",
    # commercial buildings
    "world/commercial/building-a.glb",
    "world/commercial/building-b.glb",
    "world/commercial/building-c.glb",
    "world/commercial/building-d.glb",
    "world/commercial/building-e.glb",
    "world/commercial/building-g.glb",
    "world/commercial/building-h.glb",
    "world/commercial/building-k.glb",
    "world/commercial/building-skyscraper-a.glb",
    "world/commercial/building-skyscraper-b.glb",
    "world/commercial/building-skyscraper-c.glb",
    "world/commercial/building-skyscraper-e.glb",
    "world/commercial/detail-awning-wide.glb",
    "world/commercial/detail-overhang.glb",
    "world/commercial/detail-parasol-a.glb",
    "world/commercial/detail-parasol-b.glb",
    # suburban buildings
    "world/suburban/building-type-a.glb",
    "world/suburban/building-type-b.glb",
    "world/suburban/building-type-c.glb",
    "world/suburban/building-type-d.glb",
    "world/suburban/building-type-e.glb",
    "world/suburban/building-type-f.glb",
    "world/suburban/building-type-g.glb",
    "world/suburban/building-type-h.glb",
    "world/suburban/building-type-k.glb",
    "world/suburban/building-type-m.glb",
    "world/suburban/building-type-q.glb",
    "world/suburban/building-type-t.glb",
    "world/suburban/planter.glb",
    "world/suburban/tree-large.glb",
    "world/suburban/tree-small.glb",
    # nature
    "world/nature/flower_redA.glb",
    "world/nature/flower_yellowA.glb",
    "world/nature/plant_bush.glb",
    "world/nature/plant_bushLarge.glb",
    "world/nature/rock_largeA.glb",
    "world/nature/tree_default.glb",
    "world/nature/tree_palmBend.glb",
    "world/nature/tree_palmTall.glb",
    # pirate/harbor
    "world/pirate/boat-row-small.glb",
    "world/pirate/palm-bend.glb",
    "world/pirate/palm-straight.glb",
    "world/pirate/structure-platform-dock.glb",
    "world/pirate/structure-roof.glb",
    # furniture
    "furniture/bedSingle.glb",
    "furniture/bedDouble.glb",
    "furniture/kitchenStove.glb",
    "furniture/kitchenFridge.glb",
    "furniture/toilet.glb",
    "furniture/shower.glb",
    "furniture/chair.glb",
    "furniture/loungeSofa.glb",
    "furniture/loungeChair.glb",
    "furniture/tableCoffee.glb",
    "furniture/rugRectangle.glb",
    "furniture/cabinetTelevision.glb",
    "furniture/televisionModern.glb",
    "furniture/desk.glb",
    "furniture/laptop.glb",
    "furniture/chairDesk.glb",
    "furniture/bookcaseOpen.glb",
    "furniture/books.glb",
    "furniture/pottedPlant.glb",
    "furniture/rugRound.glb",
    "furniture/lampRoundFloor.glb",
    "furniture/sideTable.glb",
    "furniture/radio.glb",
    "furniture/bathroomMirror.glb",
    "furniture/kitchenCabinet.glb",
    "furniture/kitchenSink.glb",
    "furniture/washer.glb",
    "furniture/speaker.glb",
    "furniture/bathtub.glb"
]

def fetch_model(rel_model):
    url = f"{BASE_URL}/models/{rel_model}"
    target_asset = os.path.join("assets", "models", rel_model)
    target_site = os.path.join("site", "models", rel_model)
    try:
        data = get(url)
        save_file(target_asset, data)
        save_file(target_site, data)
        return True, rel_model, len(data)
    except Exception as e:
        return False, rel_model, str(e)

with ThreadPoolExecutor(max_workers=8) as ex:
    futures = [ex.submit(fetch_model, m) for m in model_names]
    for fut in as_completed(futures):
        success, name, info = fut.result()
        if success:
            print(f"  [SAVED MODEL] {name} ({info:,} bytes)")
        else:
            print(f"  [SKIP MODEL] {name} (not on server: {info})")

# Textures
texture_urls = [
    "/models/world/pirate/Textures/colormap.png",
    "/models/world/commercial/Textures/colormap.png",
    "/models/world/suburban/Textures/colormap.png",
    "/models/world/car/Textures/colormap.png"
]

for t in texture_urls:
    try:
        data = get(BASE_URL + t)
        save_file("assets" + t, data)
        save_file("site" + t, data)
        print(f"  [SAVED TEXTURE] {t} ({len(data):,} bytes)")
    except Exception as e:
        print(f"  [FAILED TEXTURE] {t}: {e}")

# --- 5. Billboard Ad Images ---
print("\n--- 5. Fetching Active Billboard Ad Images ---")
ads_file = os.path.join(WORKSPACE, "api_data", "ads.json")
ad_images_downloaded = 0
if os.path.exists(ads_file):
    with open(ads_file, "r", encoding="utf-8") as f:
        ads_data = json.load(f)
    
    slots = ads_data.get("slots", {})
    image_tasks = []
    for slot_id, slot_info in slots.items():
        if isinstance(slot_info, dict) and "id" in slot_info:
            ad_id = slot_info["id"]
            v = slot_info.get("v", 0)
            img_rel = f"/api/ads/{ad_id}/image?v={v}"
            local_name = f"{ad_id}_v{v}.jpg"
            image_tasks.append((img_rel, local_name, ad_id))

    print(f"Found {len(image_tasks)} billboard ads from API.")

    def fetch_ad_img(task):
        img_rel, local_name, ad_id = task
        url = BASE_URL + img_rel
        try:
            data = get(url)
            save_file(f"assets/billboards/{local_name}", data)
            return True, local_name, len(data)
        except Exception as e:
            return False, local_name, str(e)

    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(fetch_ad_img, t) for t in image_tasks]
        for fut in as_completed(futures):
            ok, name, info = fut.result()
            if ok:
                ad_images_downloaded += 1

    print(f"Successfully downloaded {ad_images_downloaded} billboard ad images.")

print("\n=== Download Complete! ===")
