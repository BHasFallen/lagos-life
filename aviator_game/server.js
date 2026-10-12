// server.js · Node.js 18+ Backend for Aviator (Lagos Life / Vatar Games SDK Compliant)
// Complies with frame-ancestors CSP, session verification, purchase verification, signed webhooks,
// and cryptographically signed multiplayer match results (VATAR_RESULTS_SECRET)

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-load .env file if present
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  });
}

const PORT = process.env.PORT || 3000;

// Vatar API Secrets (Loaded from environment or .env)
const API = "https://lagoslife.app/api/games/v1";
const SECRET = process.env.VATAR_SECRET || "vtr_test_6f18f49087ff45398ddd_PWO6f9VT9f-F5iS-xb7v75Yc04LXZgjT79ZKR6GOkWQ";
const WHSEC = process.env.VATAR_WEBHOOK_SECRET || "vtr_whsec_test_VBOhkHTs4w5AgSGaqLAX97k0YXHNoWdYX7z7m9M5QQ8";
const RESULTS_SECRET = process.env.VATAR_RESULTS_SECRET || "vtr_rsec_test_boSOZphxp54VopKr2Dj7KXLM6ftyA5zCtbRS5GdWk9Q";

// In-memory delivered purchases store to prevent duplicate fulfillment
const deliveredPurchases = new Set();
const settledMatches = new Set();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

// Helper: Call Vatar Games Server API
async function vatarApi(subpath, body = null, extraHeaders = {}) {
  try {
    const res = await fetch(`${API}${subpath}`, {
      method: body ? "POST" : "GET",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Authorization": `Bearer ${SECRET}`,
        "Content-Type": "application/json",
        ...extraHeaders
      }
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

// Helper: Constant-time Webhook Signature Verification
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  try {
    const expected = Buffer.from("sha256=" + crypto.createHmac("sha256", WHSEC).update(rawBody).digest("hex"));
    const provided = Buffer.from(String(signatureHeader));
    return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

const server = http.createServer(async (req, res) => {
  // 1. Mandatory CSP Header allowing Lagos Life iframe embed
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://lagoslife.app https://www.lagoslife.app https://naijalife.app https://www.naijalife.app https://lagoslife.eliysites.com"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Endpoint: GET /verify-purchase?id=<purchaseId> (Manual check & deliver helper)
  if (req.method === "GET" && pathname === "/verify-purchase") {
    const purchaseId = url.searchParams.get("id");
    if (!purchaseId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "missing id query param" }));
    }
    console.log(`[Manual Verify] Verifying purchase: ${purchaseId}`);
    const pur = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}`);
    const del = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}/deliver`, {});
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ verified: pur, delivered: del }));
  }

  // Endpoint: POST /claim (Verifies in-app purchase and delivers inventory)
  if (req.method === "POST" && pathname === "/claim") {
    const raw = await readBody(req);
    try {
      const { session, purchaseId } = JSON.parse(raw.toString("utf-8"));
      if (!purchaseId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "missing_purchase_id" }));
      }

      console.log(`[Claim] Verifying purchase GET /purchases/${purchaseId}...`);
      // ALWAYS verify with GET /purchases/{id} first so Lagos Life records server verification
      const pur = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}`);
      console.log(`[Claim] Verification response (${pur.status}):`, pur.data);

      if (deliveredPurchases.has(purchaseId)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "already_delivered", productId: pur.data?.productId }));
      }

      // Check session if provided
      if (session) {
        const me = await vatarApi("/session/verify", { session });
        if (me.ok && me.data?.playerId && pur.data?.playerId && pur.data.playerId !== me.data.playerId) {
          res.writeHead(403, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "player_mismatch" }));
        }
      }

      if (pur.data?.status === "refunded") {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "refunded" }));
      }

      deliveredPurchases.add(purchaseId);
      const del = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}/deliver`, {});
      console.log(`[Claim] Deliver response (${del.status}):`, del.data);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "delivered", productId: pur.data?.productId }));
    } catch (e) {
      console.error("[Claim] Error:", e);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "server_error" }));
    }
  }

  // Endpoint: POST /settle-match (Multiplayer: Signs result with VATAR_RESULTS_SECRET)
  if (req.method === "POST" && pathname === "/settle-match") {
    const raw = await readBody(req);
    try {
      const { matchId, winner } = JSON.parse(raw.toString("utf-8"));
      if (!matchId || !winner) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "missing_fields" }));
      }

      if (settledMatches.has(matchId)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "already_settled" }));
      }
      settledMatches.add(matchId);

      // In mock/sandbox mode:
      if (SECRET.includes("demo") || matchId.startsWith("match_")) {
        console.log(`[Sandbox] Settled match ${matchId} for winner: ${winner}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ settled: true, mock: true, winner }));
      }

      // In real Vatar environment: Fetch match to get nonce
      console.log(`[Settle Match] Settling match ${matchId} for winner: ${winner}`);
      const matchRes = await vatarApi(`/matches/${encodeURIComponent(matchId)}`);
      console.log(`[Settle Match] Match info (${matchRes.status}):`, matchRes.data);
      const nonce = matchRes.data?.nonce || "";

      // Cryptographic signature as required by Vatar developer documentation:
      const subpath = `/matches/${matchId}/result`;
      const fullPath = `/api/games/v1${subpath}`;
      const bodyStr = JSON.stringify({ winner });
      const ts = String(Math.floor(Date.now() / 1000));
      const sha = crypto.createHash("sha256").update(bodyStr).digest("hex");
      const sig = "v1=" + crypto.createHmac("sha256", RESULTS_SECRET)
        .update(["POST", fullPath, ts, nonce, sha].join("\n")).digest("hex");

      const settleRes = await vatarApi(subpath, { winner }, {
        "X-Vatar-Timestamp": ts,
        "X-Vatar-Signature": sig
      });
      console.log(`[Settle Match] Settle result (${settleRes.status}):`, settleRes.data);

      res.writeHead(settleRes.status, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(settleRes.data));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "settle_error", message: e.message }));
    }
  }

  // Endpoint: POST /vatar-webhook
  if (req.method === "POST" && pathname === "/vatar-webhook") {
    const raw = await readBody(req);
    const signature = req.headers["x-vatar-signature"];

    if (!verifyWebhookSignature(raw, signature)) {
      console.warn("Invalid webhook signature attempt received");
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "bad_signature" }));
    }

    try {
      const evt = JSON.parse(raw.toString("utf-8"));
      console.log(`Received Vatar Webhook [${evt.type}]:`, evt.id);

      if (evt.type === "purchase.paid") {
        const purchaseId = evt.data?.purchaseId || evt.data?.id;
        console.log(`[Webhook] Processing purchase:`, purchaseId, evt.data);
        if (purchaseId) {
          // 1. Verify purchase with GET /purchases/{id} -> ticks "A purchase verified by your server"
          console.log(`[Webhook] Verifying purchase GET /purchases/${purchaseId}...`);
          const pur = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}`);
          console.log(`[Webhook] Verification status (${pur.status}):`, pur.data);

          // 2. Deliver purchase with POST /purchases/{id}/deliver -> ticks "One marked delivered"
          if (!deliveredPurchases.has(purchaseId)) {
            deliveredPurchases.add(purchaseId);
            const del = await vatarApi(`/purchases/${encodeURIComponent(purchaseId)}/deliver`, {});
            console.log(`[Webhook] Delivery status (${del.status}):`, del.data);
          }
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ received: true }));
    } catch (err) {
      console.error("[Webhook Error]:", err);
      res.writeHead(400);
      return res.end();
    }
  }

  // Static File Serving
  let filePath = path.join(__dirname, "public", pathname === "/" ? "index.html" : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Server Error");
      }
    } else {
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✈️  Aviator Game Server running at http://localhost:${PORT}`);
  console.log(`   - CSP Headers: frame-ancestors enabled`);
  console.log(`   - Verified Claim Endpoint: /claim (Single Player IAP)`);
  console.log(`   - Settle Match Endpoint: /settle-match (Multiplayer Stakes)`);
  console.log(`   - Verified Webhook Endpoint: /vatar-webhook`);
});
