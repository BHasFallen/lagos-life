import urllib.request
import json

endpoints = [
    '/api/visit',
    '/api/daily',
    '/api/auth/me',
    '/api/auth/mode',
    '/api/homes?map=1',
    '/api/sea',
    '/api/ads',
    '/api/gov',
    '/api/version',
    '/api/verified',
    '/api/locations',
    '/api/stats',
    '/api/online',
    '/api/news',
    '/api/radio',
    '/manifest.webmanifest',
    '/privacy',
    '/robots.txt',
    '/sitemap.xml'
]

base = 'https://lagoslife.eliysites.com'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for ep in endpoints:
    url = base + ep
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            ct = resp.headers.get('Content-Type', '')
            print(f"{ep} -> status {resp.status}, length {len(data)}, type {ct}")
            try:
                js = json.loads(data)
                if isinstance(js, dict):
                    print(f"   dict keys: {list(js.keys())[:8]}")
                elif isinstance(js, list):
                    print(f"   list length: {len(js)}, first item keys: {list(js[0].keys()) if len(js) > 0 and isinstance(js[0], dict) else type(js[0])}")
            except Exception:
                pass
    except Exception as e:
        print(f"{ep} -> ERROR: {e}")
