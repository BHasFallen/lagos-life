import os
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

with open(os.path.join(WORKSPACE, "api_data", "sea.json"), "r", encoding="utf-8") as f:
    sea_data = json.load(f)

ads = sea_data.get("ads", [])
print(f"Total sea ads in database: {len(ads)}")

image_map = {}
for a in ads:
    if a and "id" in a and "image" in a:
        image_map[a["id"]] = a["image"]

print(f"Unique sea ad images to download: {len(image_map)}")

os.makedirs(os.path.join(WORKSPACE, "assets", "sea_billboards"), exist_ok=True)

def fetch_sea_img(item):
    ad_id, img_rel = item
    url = BASE_URL + img_rel
    local_asset = os.path.join(WORKSPACE, "assets", "sea_billboards", f"{ad_id}.jpg")
    
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(local_asset, "wb") as f:
                f.write(data)
            return True, ad_id, len(data)
    except Exception as e:
        return False, ad_id, str(e)

print("Starting parallel download of all sea billboards...")
success = 0
failed = 0

with ThreadPoolExecutor(max_workers=12) as ex:
    futures = [ex.submit(fetch_sea_img, item) for item in image_map.items()]
    for fut in as_completed(futures):
        ok, ad_id, info = fut.result()
        if ok:
            success += 1
        else:
            failed += 1

print(f"Sea billboard download finished! Success: {success}, Failed: {failed}")
