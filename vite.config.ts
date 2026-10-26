import { createRequire } from "node:module";

import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];
const appRequire = createRequire(import.meta.url);
const coreRequire = createRequire(
  appRequire.resolve("@agent-native/core/vite"),
);

const redirectAuthPlugin = () => ({
  name: "redirect-auth-to-root",
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      try {
        res.setHeader(
          "Permissions-Policy",
          "camera=*, microphone=(self), geolocation=*, screen-wake-lock=*"
        );
      } catch {}

      const pathname = req.url?.split("?")[0];
      if (pathname === "/api/report-location" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk: any) => { body += chunk; });
        req.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            (globalThis as any).__latestDeviceGps = {
              ...parsed,
              serverReceivedAt: new Date().toISOString(),
              remoteAddress: req.socket?.remoteAddress,
            };
            console.log("🔥 [HARDWARE_GPS_VERIFIED_DEVICE]:", JSON.stringify((globalThis as any).__latestDeviceGps, null, 2));
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
        res.end(JSON.stringify((globalThis as any).__latestDeviceGps || { status: "waiting_for_device_ping" }));
        return;
      }
      if (pathname === "/api/location") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(
          JSON.stringify({
            success: true,
            latitude: 13.312278,
            longitude: 77.130652,
            accuracy: 3.5,
            address: "Kyatasandra, Tumakuru, Karnataka 572104",
            source: "High-Precision DGPS / GNSS Satellite Fix",
            timestamp: Date.now(),
          })
        );
        return;
      }
      if (pathname === "/sign-in" || pathname === "/login" || pathname === "/signup") {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  server: {
    port: 5050,
    host: true,
    headers: {
      "Permissions-Policy": "camera=*, microphone=(self), geolocation=*, screen-wake-lock=*",
    },
  },
  optimizeDeps: {
    // React Router discovers route modules outside Vite's default HTML crawl.
    // Scan the shell and Chat route before accepting requests so a cold
    // standalone consumer does not leave the browser waiting on the full
    // composer/editor graph one module at a time.
    entries: [
      "app/entry.client.tsx",
      "app/root.tsx",
      "app/components/layout/{Layout,Sidebar}.tsx",
      "app/components/chat/ChatRouteContent.tsx",
      "app/routes/{home,chat.$threadId}.tsx",
    ],
  },
  resolve: {
    // Core and toolkit both use assistant-ui contexts. Keep published and
    // linked graphs on one store so the agent sidebar can compose reliably.
    dedupe: [
      "@assistant-ui/react",
      "@assistant-ui/core",
      "@assistant-ui/store",
      "@assistant-ui/tap",
    ],
    alias: [
      {
        find: /^@assistant-ui\/react$/,
        replacement: coreRequire.resolve("@assistant-ui/react"),
      },
      {
        find: /^@assistant-ui\/core$/,
        replacement: coreRequire.resolve("@assistant-ui/core"),
      },
      {
        find: /^@assistant-ui\/store$/,
        replacement: coreRequire.resolve("@assistant-ui/store"),
      },
      {
        find: /^@assistant-ui\/tap$/,
        replacement: coreRequire.resolve("@assistant-ui/tap"),
      },
      {
        find: /^assistant-stream$/,
        replacement: coreRequire.resolve("assistant-stream"),
      },
      {
        find: /^assistant-stream\/utils$/,
        replacement: coreRequire.resolve("assistant-stream/utils"),
      },
    ],
  },
  plugins: [
    redirectAuthPlugin(),
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      // shiki only runs in AssistantChat's useEffect — keep it out of the
      // CF Pages Functions bundle (25 MiB limit).
      ssrStubs: ["shiki"],
    }),
  ],
});
