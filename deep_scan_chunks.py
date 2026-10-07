import urllib.request
import re
import os
import json
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

os.makedirs("raw_chunks", exist_ok=True)

# List of known JS & CSS chunks from DOM
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
    "/_next/static/chunks/0ive9zeli_v2r.js"
]

def download_chunk(path):
    fn = os.path.basename(path)
    local_path = os.path.join("raw_chunks", fn)
    if os.path.exists(local_path):
        with open(local_path, "r", encoding="utf-8", errors="ignore") as f:
            return fn, f.read()
    url = BASE_URL + path
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as r:
            content = r.read().decode('utf-8', errors='ignore')
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(content)
            return fn, content
    except Exception as e:
        print(f"Failed {path}: {e}")
        return fn, ""

print("Downloading chunks...")
with ThreadPoolExecutor(max_workers=10) as ex:
    results = list(ex.map(download_chunk, chunks))

print(f"Downloaded {len(results)} chunks.")

# Now scan contents
glb_matches = set()
audio_matches = set()
api_matches = set()
asset_matches = set()
chunk_refs = set()

for fn, content in results:
    # Find glb
    for m in re.findall(r'[\'"`]([^\'"`]*?\.glb)[\'"`]', content):
        glb_matches.add(m)
    # Find audio
    for m in re.findall(r'[\'"`]([^\'"`]*?\.(?:mp3|wav|ogg|m4a|aac))[\'"`]', content):
        audio_matches.add(m)
    # Find api
    for m in re.findall(r'[\'"`](/api/[^\'"`\s\?#]+)[\'"`]', content):
        api_matches.add(m)
    # Find models path
    for m in re.findall(r'[\'"`](/models/[^\'"`]+)[\'"`]', content):
        asset_matches.add(m)
    # Find other chunk references
    for m in re.findall(r'[\'"`]([a-zA-Z0-9_\-]+\.js)[\'"`]', content):
        chunk_refs.add(m)

print(f"\nUnique GLB models referenced in code: {len(glb_matches)}")
for g in sorted(glb_matches):
    print("  ", g)

print(f"\nUnique Audio files referenced in code: {len(audio_matches)}")
for a in sorted(audio_matches):
    print("  ", a)

print(f"\nUnique API endpoints referenced in code: {len(api_matches)}")
for api in sorted(api_matches):
    print("  ", api)

print(f"\nOther /models/ assets: {len(asset_matches)}")
for ast in sorted(asset_matches)[:15]:
    print("  ", ast)
