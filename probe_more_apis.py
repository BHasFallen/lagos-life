import os
import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://lagoslife.eliysites.com"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
WORKSPACE = r"c:\Users\dc941\Documents\LLLife"

candidates = [
    "/api/forbes",
    "/api/sponsors",
    "/api/players",
    "/api/jobs",
    "/api/politics/cabinet",
    "/api/politics/manager",
    "/api/campus",
    "/api/casino",
    "/api/bank",
    "/api/flights",
    "/api/shop",
    "/api/food-gift",
    "/api/gist",
    "/api/music",
    "/api/music/slots",
    "/api/party",
    "/api/venue",
    "/api/world",
    "/api/squads",
    "/api/ask",
    "/api/crime",
    "/api/court",
    "/api/my-ads",
    "/api/live",
    "/api/room"
]

results = {}

for ep in candidates:
    url = BASE_URL + ep
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            status = resp.status
            ct = resp.headers.get("Content-Type", "")
            print(f"[OK {status}] {ep} ({len(data):,} bytes, {ct})")
            results[ep] = {"status": status, "length": len(data), "type": ct}
            # Save if ok
            fn = ep.replace("/api/", "").replace("/", "_") + ".json"
            with open(os.path.join(WORKSPACE, "api_data", fn), "wb") as f:
                f.write(data)
    except urllib.error.HTTPError as e:
        print(f"[{e.code}] {ep}: {e.reason}")
        results[ep] = {"status": e.code, "error": str(e.reason)}
        # check if it returns body
        try:
            err_body = e.read()
            if err_body:
                fn = ep.replace("/api/", "").replace("/", "_") + f"_err{e.code}.json"
                with open(os.path.join(WORKSPACE, "api_data", fn), "wb") as f:
                    f.write(err_body)
        except Exception:
            pass
    except Exception as e:
        print(f"[ERROR] {ep}: {e}")
        results[ep] = {"error": str(e)}

with open(os.path.join(WORKSPACE, "api_data", "probed_endpoints_summary.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nDone probing additional API endpoints.")
