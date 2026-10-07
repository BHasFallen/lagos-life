import http.server
import socketserver
import os
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

PORT = 8000
WORKSPACE = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.join(WORKSPACE, "site")
API_DIR = os.path.join(WORKSPACE, "api_data")
ASSETS_DIR = os.path.join(WORKSPACE, "assets")
LITE_DIR = os.path.join(WORKSPACE, "lite")
EXTRACTED_DIR = os.path.join(WORKSPACE, "extracted_data")

import http.cookiejar
import urllib.request
import time

LIVE_HOST = "https://lagoslife.eliysites.com"
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
last_auth_time = 0

def ensure_live_authenticated():
    global last_auth_time
    if time.time() - last_auth_time < 300 and any(c.name == 'll_session' for c in cj):
        return True
    try:
        login_url = f"{LIVE_HOST}/api/auth/login"
        payload = json.dumps({"username": "bobbyhasfallen", "password": "David2008."}).encode("utf-8")
        req = urllib.request.Request(login_url, data=payload, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
        with opener.open(req, timeout=8) as resp:
            if resp.status == 200:
                last_auth_time = time.time()
                print(">>> [LIVE BRIDGE] Authenticated with https://lagoslife.eliysites.com as bobbyhasfallen!")
                return True
    except Exception as e:
        print(f">>> [LIVE BRIDGE WARNING] Authentication with live server failed: {e}")
    return False

def fetch_live_save():
    if not ensure_live_authenticated():
        return None
    try:
        req = urllib.request.Request(f"{LIVE_HOST}/api/save", headers={"User-Agent": "Mozilla/5.0"})
        with opener.open(req, timeout=10) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return data
    except Exception as e:
        print(f">>> [LIVE BRIDGE WARNING] Fetch save error: {e}")
    return None

def push_live_save(game_state):
    if not ensure_live_authenticated():
        return None, "Not authenticated with live server"
    try:
        # 1. Fetch current live save to get valid base timestamp
        live_save = fetch_live_save()
        base_ts = live_save.get("updatedAt") if live_save else int(time.time() * 1000)
        
        # 2. Prepare payload
        payload = {
            "game": game_state,
            "base": base_ts,
            "replace": base_ts
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(f"{LIVE_HOST}/api/save", data=data_bytes, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
        req.get_method = lambda: "PUT"
        
        with opener.open(req, timeout=10) as resp:
            res_body = resp.read().decode("utf-8")
            print(f">>> [LIVE BRIDGE] PUT /api/save succeeded: status {resp.status}, body: {res_body}")
            return json.loads(res_body), None
    except Exception as e:
        print(f">>> [LIVE BRIDGE ERROR] Push save error: {e}")
        return None, str(e)

def send_live_transfer(to_id, amount):
    if not ensure_live_authenticated():
        return None, "Not authenticated with live server"
    try:
        url = f"{LIVE_HOST}/api/send"
        payload = json.dumps({"to": str(to_id), "amount": int(amount)}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
        with opener.open(req, timeout=12) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            print(f">>> [LIVE BRIDGE] POST /api/send succeeded: {data}")
            return data, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f">>> [LIVE BRIDGE WARNING] POST /api/send HTTP {e.code}: {err_body}")
        try:
            return json.loads(err_body), f"HTTP {e.code}"
        except:
            return {"error": err_body}, f"HTTP {e.code}"
    except Exception as e:
        print(f">>> [LIVE BRIDGE ERROR] POST /api/send failed: {e}")
        return None, str(e)

class LagosLifeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        # Live Transfer endpoint: /api/send
        if path == "/api/send":
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            try:
                body = json.loads(post_body.decode('utf-8'))
                to_id = body.get("to")
                amount = body.get("amount")
                res, err = send_live_transfer(to_id, amount)
                
                status_code = 200
                if err and "429" in str(err):
                    status_code = 429
                elif err and "40" in str(err):
                    status_code = 400
                elif not res or not res.get("ok"):
                    status_code = 400 if (res and "error" in res) else 500

                self.send_response(status_code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(res or {"error": str(err)}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        # Save API endpoint support
        if path == "/api/save":
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            save_path = os.path.join(WORKSPACE, "save_cloud_backup.json")
            try:
                data = json.loads(post_body.decode('utf-8'))
                with open(save_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                
                # Push to live production
                game = data.get("game", data)
                res, err = push_live_save(game)
                if res:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode("utf-8"))
                    return
            except Exception as e:
                pass

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true,"status":"saved_local"}')
            return

        # Telemetry / errors / visits
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == "/api/save":
            content_length = int(self.headers.get('Content-Length', 0))
            put_body = self.rfile.read(content_length)
            save_path = os.path.join(WORKSPACE, "save_cloud_backup.json")
            try:
                data = json.loads(put_body.decode('utf-8'))
                with open(save_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                
                # Push directly to live production game
                game = data.get("game", data)
                live_res, err = push_live_save(game)
                if live_res:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(live_res).encode("utf-8"))
                    return
            except Exception as e:
                print(f"Error parsing PUT body: {e}")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true,"updatedAt":1791381710000,"mode":"local"}')
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Lite Frontend routes
        if path == "/lite":
            self.send_response(301)
            self.send_header("Location", "/lite/")
            self.end_headers()
            return

        if path == "/lite/":
            index_path = os.path.join(LITE_DIR, "index.html")
            if os.path.exists(index_path):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(index_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        if path.startswith("/lite/"):
            rel = path[len("/lite/"):].split("?")[0]
            lite_file = os.path.join(LITE_DIR, rel)
            if os.path.isfile(lite_file):
                mime = "text/plain"
                if rel.endswith(".html"): mime = "text/html; charset=utf-8"
                elif rel.endswith(".css"): mime = "text/css"
                elif rel.endswith(".js"): mime = "application/javascript"
                elif rel.endswith(".json"): mime = "application/json"
                elif rel.endswith(".svg"): mime = "image/svg+xml"
                elif rel.endswith(".png"): mime = "image/png"
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(lite_file, "rb") as f:
                    self.wfile.write(f.read())
                return

        # 2. Extracted Data routes
        if path.startswith("/extracted_data/"):
            rel = path[len("/extracted_data/"):].split("?")[0]
            ex_file = os.path.join(EXTRACTED_DIR, rel)
            if os.path.isfile(ex_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(ex_file, "rb") as f:
                    self.wfile.write(f.read())
                return

        # 3. Live Server Status Check
        if path == "/api/live-status":
            is_live = ensure_live_authenticated()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "connected": is_live,
                "server": LIVE_HOST,
                "account": "bobbyhasfallen",
                "timestamp": int(time.time() * 1000)
            }).encode("utf-8"))
            return

        # 4. Special API Save route (Live Bridge & Local Fallback)
        if path == "/api/save":
            live_data = fetch_live_save()
            if live_data:
                save_path = os.path.join(WORKSPACE, "save_cloud_backup.json")
                with open(save_path, "w", encoding="utf-8") as f:
                    json.dump(live_data, f, indent=2)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(live_data).encode("utf-8"))
                return

            save_path = os.path.join(WORKSPACE, "save_cloud_backup.json")
            if not os.path.exists(save_path):
                save_path = os.path.join(EXTRACTED_DIR, "player_profile_bobbyhasfallen.json")
            if os.path.exists(save_path):
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(save_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        # 4. API routes
        if path.startswith("/api/"):
            # Check terrestrial billboard images: /api/ads/<id>/image
            if path.startswith("/api/ads/") and "/image" in path:
                parts = path.strip("/").split("/")
                if len(parts) >= 4:
                    ad_id = parts[2]
                    bb_file = os.path.join(ASSETS_DIR, "billboards", f"{ad_id}.jpg")
                    if os.path.exists(bb_file):
                        self.send_response(200)
                        self.send_header("Content-Type", "image/jpeg")
                        self.send_header("Cache-Control", "public, max-age=86400")
                        self.end_headers()
                        with open(bb_file, "rb") as f:
                            self.wfile.write(f.read())
                        return

            # Check sea billboard images: /api/sea/<id>/image
            if path.startswith("/api/sea/") and "/image" in path:
                parts = path.strip("/").split("/")
                if len(parts) >= 4:
                    sea_id = parts[2]
                    sea_file = os.path.join(ASSETS_DIR, "sea_billboards", f"{sea_id}.jpg")
                    if os.path.exists(sea_file):
                        self.send_response(200)
                        self.send_header("Content-Type", "image/jpeg")
                        self.send_header("Cache-Control", "public, max-age=86400")
                        self.end_headers()
                        with open(sea_file, "rb") as f:
                            self.wfile.write(f.read())
                        return

            # Check audio file: /api/music/file/...
            if path.startswith("/api/music/file/"):
                audio_file = os.path.join(ASSETS_DIR, "audio", "OVER_bigbanju.mp3")
                if os.path.exists(audio_file):
                    self.send_response(200)
                    self.send_header("Content-Type", "audio/mpeg")
                    self.end_headers()
                    with open(audio_file, "rb") as f:
                        self.wfile.write(f.read())
                    return

            # Map endpoints to api_data JSON files
            api_map = {
                "/api/gov": "gov.json",
                "/api/homes": "homes.json",
                "/api/sea": "sea.json",
                "/api/ads": "ads.json",
                "/api/daily": "daily.json",
                "/api/radio": "radio.json",
                "/api/visit": "visit.json",
                "/api/version": "version.json",
                "/api/auth/mode": "auth_mode.json",
                "/api/auth/me": "auth_me.json",
                "/api/verified": "verified.json",
                "/api/forbes": "forbes.json",
                "/api/sponsors": "sponsors.json",
                "/api/flights": "flights.json",
                "/api/music": "music.json",
                "/api/music/slots": "music_slots.json"
            }
            
            clean_path = path.rstrip("/")
            if clean_path in api_map:
                json_file = os.path.join(API_DIR, api_map[clean_path])
                if os.path.exists(json_file):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    with open(json_file, "rb") as f:
                        self.wfile.write(f.read())
                    return

        # 5. 3D Models & Assets routes
        if path.startswith("/models/"):
            rel = path[len("/models/"):].split("?")[0]
            model_file = os.path.join(ASSETS_DIR, "models", rel)
            if os.path.isfile(model_file):
                self.send_response(200)
                if rel.endswith(".glb"):
                    self.send_header("Content-Type", "model/gltf-binary")
                elif rel.endswith(".png"):
                    self.send_header("Content-Type", "image/png")
                else:
                    self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(model_file, "rb") as f:
                    self.wfile.write(f.read())
                return

        # 6. Static files
        return super().do_GET()

print(f"==================================================")
print(f"  Lagos Life Complete Offline Local Server")
print(f"  Serving at: http://localhost:{PORT}")
print(f"  Root dir  : {SITE_DIR}")
print(f"==================================================")

if __name__ == "__main__":
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), LagosLifeHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
