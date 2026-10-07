import urllib.request
import re
import os
import json
from urllib.parse import urljoin

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

# Fetch index HTML
html = fetch(BASE_URL).decode('utf-8', errors='ignore')

# Find all scripts, links, media, chunks
scripts = re.findall(r'src=["\'](/_next/static/[^"\']+)["\']', html)
scripts += re.findall(r'href=["\'](/_next/static/[^"\']+)["\']', html)
# Also look in the RSC payload or push strings
rsc_chunks = re.findall(r'/_next/static/chunks/[a-zA-Z0-9_\-\.]+\.(?:js|css)', html)
rsc_media = re.findall(r'/_next/static/media/[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+', html)

all_chunks = sorted(list(set(scripts + rsc_chunks + rsc_media)))
print(f"Found {len(all_chunks)} static chunks in initial HTML")
for c in all_chunks[:15]:
    print(" -", c)
