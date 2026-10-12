# ✈️ Laviator - Lagos Aviator · High-Altitude Crash & 1v1 Multiplayer Duels
Built for the **Vatar Games SDK** / **Lagos Life** platform.

A sleek, authentic dark-mode crash game inspired by Aviator, optimized for mobile portrait viewports (`375×812`) and fully compliant with the Vatar Developer Review Checklist. Includes real-time 1v1 Arena Duels with high-stakes room matchmaking and instant cryptographic outcome verification.

---

## 🚀 Quick Start

### 1. Run the Game Locally
```bash
cd aviator_game
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

* When opened directly in the browser, the built-in **Sandbox Emulator** initializes with mock player credits (₦50,000) and full functionality.
* When loaded inside the **Lagos Life / Vatar Games app** iframe, it automatically binds to `window.Vatar`.

---

## 🎮 Key Features
* **Exponential Flight Canvas**: Ultra-smooth 60 FPS Canvas rendering with vector monoplane, exhaust trail, and dynamic particle effects.
* **Dual Bet Slips**: Place Bet 1 and Bet 2 simultaneously (with independent auto-cashout multipliers and quick-chip presets).
* **Live Social Feed**: Simulated live player bets cashing out or crashing in real time.
* **Web Audio Synthesizer**: Engine rev pitch-shifting, cashout chord chimes, and crash explosion sounds (using the Web Audio API without external audio file dependencies).
* **Multiplier History Ribbon**: Top horizontal ribbon tracking past flight outcomes with color coding (Blue `<2x`, Purple `2x-10x`, Gold `>10x`).

---

## 🛡️ Vatar Platform Compliance

1. **Security & Iframe CSP**:
   `server.js` sets the mandatory header:
   ```http
   Content-Security-Policy: frame-ancestors https://lagoslife.app https://www.lagoslife.app https://naijalife.app https://www.naijalife.app https://lagoslife.eliysites.com
   ```
2. **Session & Purchase Verification**:
   * Claims are sent to `POST /claim` which verifies tokens with `POST /session/verify` and `GET /purchases/{id}` before fulfilling items.
   * Calls `POST /purchases/{id}/deliver` to mark purchases delivered.
3. **Signed Webhooks**:
   * Webhook endpoint at `POST /vatar-webhook` verifies HMAC-SHA256 signatures in constant time.
4. **Lifecycle Suspensions**:
   * Listens to `Vatar.onPause()` and `Vatar.onResume()` to suspend/resume Web Audio and rendering loops cleanly.
5. **Score Submissions**:
   * Submits high cashout multipliers to `Vatar.submitScore()`.

---

## 🔑 Environment Variables

When deploying to production or connecting to your Vatar Sandbox:
```bash
PORT=3000
VATAR_SECRET=vtr_test_...         # or vtr_live_... once approved
VATAR_WEBHOOK_SECRET=vtr_whsec_...
VATAR_RESULTS_SECRET=vtr_res_...  # For multiplayer match results
```
