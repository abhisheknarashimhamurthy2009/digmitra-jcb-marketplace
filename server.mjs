import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { createRequestHandler } from "react-router";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.resolve(__dirname, "build/client");

// Load the compiled React Router server bundle
const build = await import("./build/server/index.js");
const handleRequest = createRequestHandler(build, "production");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

let latestDeviceGps = null;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    // Default Permissions Policy for Hardware GPS & Camera
    res.setHeader(
      "Permissions-Policy",
      "camera=*, microphone=*, geolocation=*, screen-wake-lock=*"
    );

    // API Telemetry Endpoint: Location reporting from device
    if (pathname === "/api/report-location" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          latestDeviceGps = {
            ...parsed,
            serverReceivedAt: new Date().toISOString(),
            remoteAddress: req.socket?.remoteAddress,
          };
          console.log("📍 [DEVICE_LOCATION_PING]:", latestDeviceGps.source, latestDeviceGps.lat, latestDeviceGps.lng);
        } catch {}
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    if (pathname === "/api/latest-device-gps") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end(JSON.stringify(latestDeviceGps || { status: "waiting_for_device_ping" }));
      return;
    }

    // 1. Static asset serving from build/client
    const filePath = path.join(CLIENT_DIR, pathname);
    if (filePath.startsWith(CLIENT_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
      if (pathname.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 2. React Router SSR request handling
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = req;
      init.duplex = "half";
    }

    const webRequest = new Request(url.href, init);
    const webResponse = await handleRequest(webRequest);

    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;

    for (const [key, val] of webResponse.headers.entries()) {
      res.setHeader(key, val);
    }

    // Always enforce fresh SSR HTML delivery for live deployments
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (webResponse.body) {
      Readable.fromWeb(webResponse.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Server error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 DigMitra Production Server listening on http://0.0.0.0:${PORT}`);
});
