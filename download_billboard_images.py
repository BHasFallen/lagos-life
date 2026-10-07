import os
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\dc941\Documents\LLLife"
BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Now download all billboard images
with open(os.path.join(WORKSPACE, "api_data", "ads.json"), "r", encoding="utf-8") as f:
    ads_data = json.load(f)

slots = ads_data.get("slots", [])
image_map = {}
for slot in slots:
    ad = slot.get("ad")
    if ad and "image" in ad:
        image_map[ad["id"]] = ad["image"]
    for queued in slot.get("ads", []):
        if queued and "image" in queued:
            image_map[queued["id"]] = queued["image"]

print(f"Total unique billboard ad images to download: {len(image_map)}")

os.makedirs(os.path.join(WORKSPACE, "assets", "billboards"), exist_ok=True)

def fetch_image(item):
    ad_id, img_path = item
    url = BASE_URL + img_path
    rel_local = os.path.join("assets", "billboards", f"{ad_id}.jpg")
    
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(os.path.join(WORKSPACE, rel_local), "wb") as f:
                f.write(data)
            return True, ad_id, len(data)
    except Exception as e:
        return False, ad_id, str(e)

success_count = 0
fail_count = 0

with ThreadPoolExecutor(max_workers=10) as ex:
    futures = [ex.submit(fetch_image, item) for item in image_map.items()]
    for fut in as_completed(futures):
        ok, ad_id, info = fut.result()
        if ok:
            success_count += 1
        else:
            fail_count += 1

print(f"Done! Downloaded {success_count} billboard images. Failed: {fail_count}")
