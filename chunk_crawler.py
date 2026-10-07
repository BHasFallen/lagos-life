import urllib.request
import re
import os
import json
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

# Load all network requests captured by playwright
with open(r"C:\Users\dc941\.gemini\antigravity-ide\brain\05b5b24b-ee33-4ea5-9801-d42cd3284699\.system_generated\steps\23\output.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Extract all URLs
urls = re.findall(r'https://lagoslife\.eliysites\.com[^\s=>]+', text)
unique_urls = sorted(list(set(urls)))
print(f"Total unique URLs from browser network capture: {len(unique_urls)}")

# Filter categories
models = [u for u in unique_urls if '.glb' in u or '.gltf' in u]
textures = [u for u in unique_urls if 'Textures' in u or 'colormap' in u]
api_endpoints = [u for u in unique_urls if '/api/' in u]
ad_images = [u for u in unique_urls if '/api/ads/' in u and '/image' in u]
api_routes = [u for u in api_endpoints if u not in ad_images]
js_chunks = [u for u in unique_urls if '/_next/static/chunks/' in u and u.endswith('.js')]
css_chunks = [u for u in unique_urls if '/_next/static/chunks/' in u and u.endswith('.css')]

print(f"3D Models (.glb): {len(models)}")
print(f"Textures: {len(textures)}")
print(f"API endpoints: {len(api_routes)}")
print(f"Billboard Ad Images: {len(ad_images)}")
print(f"JS chunks loaded by browser: {len(js_chunks)}")
print(f"CSS chunks: {len(css_chunks)}")

# Let's inspect models
print("\nSample 3D Models:")
for m in models[:10]:
    print(" ", m.replace(BASE_URL, ''))

print("\nAPI Routes:")
for r in api_routes:
    print(" ", r.replace(BASE_URL, ''))
