import { useCallback, useEffect, useRef, useState } from "react";

export type Fix = {
  lat: number;
  lng: number;
  accuracy: number; // metres
  timestamp: number;
};

export type LocStatus =
  | "idle"
  | "locating" // still searching, may already have a rough fix
  | "good" // accuracy <= goodAccuracy
  | "coarse" // gave up waiting; best fix is still rough, ask user to adjust pin
  | "denied" // user blocked location for this site
  | "insecure" // page is not HTTPS
  | "unavailable"; // no GPS / no signal / unsupported

type Options = {
  goodAccuracy?: number; // stop early once we are this accurate (m)
  maxWaitMs?: number; // overall time we are willing to wait
};

/**
 * Gets the BEST location, not just the FIRST one.
 * - Uses one watchPosition and keeps only fixes that improve accuracy.
 * - Stops automatically when accurate enough, or after maxWaitMs.
 * - Never re-centres anything by itself after it stops.
 */
export function useBestLocation({
  goodAccuracy = 25,
  maxWaitMs = 8000,
}: Options = {}) {
  const [fix, setFix] = useState<Fix | null>(null);
  const [status, setStatus] = useState<LocStatus>("idle");

  const watchId = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const best = useRef<Fix | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!window.isSecureContext) return setStatus("insecure");
    if (!("geolocation" in navigator)) return setStatus("unavailable");

    stop(); // never run two watchers at once
    best.current = null;
    setStatus("locating");

    // 1. Instant check: grab available position immediately in < 1 second
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const f: Fix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        if (!best.current || f.accuracy < best.current.accuracy) {
          best.current = f;
          setFix(f);
        }
        if (f.accuracy <= goodAccuracy) {
          stop();
          setStatus("good");
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 4000 }
    );

    // 2. High-precision hardware watch stream to refine accuracy
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const f: Fix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };

        // Only accept a fix if it is more accurate than what we have.
        if (!best.current || f.accuracy < best.current.accuracy) {
          best.current = f;
          setFix(f);
        }

        if (f.accuracy <= goodAccuracy) {
          stop();
          setStatus("good");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          stop();
          setStatus("denied");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // 3. Fast settle timer: lock location in max 8s instead of waiting 60s
    timer.current = window.setTimeout(() => {
      stop();
      const b = best.current;
      setStatus(b ? (b.accuracy <= 40 ? "good" : "coarse") : "unavailable");
    }, maxWaitMs);
  }, [goodAccuracy, maxWaitMs, stop]);

  // Clean up when the component unmounts (also fixes React StrictMode double-mount).
  useEffect(() => stop, [stop]);

  return { fix, status, start, stop };
}

/** Check if the user already blocked location (code cannot re-prompt in that case). */
export async function getLocationPermission(): Promise<"granted" | "prompt" | "denied"> {
  try {
    const r = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return r.state;
  } catch {
    return "prompt"; // older browsers
  }
}

/**
 * Reverse geocode ONCE per confirmed position (after GPS settles or after a pin drag ends).
 * Do NOT call this on every GPS tick: Nominatim allows ~1 request/second and will block you.
 */
const geoCache = new Map<string, string>();
export async function reverseGeocode(lat: number, lng: number, kn = false): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)},${kn}`;
  const hit = geoCache.get(key);
  if (hit) return hit;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": kn ? "kn,en" : "en" } }
    );
    if (!res.ok) throw new Error(String(res.status));
    const a = (await res.json()).address ?? {};
    const parts = [
      a.road || a.building || a.amenity || a.hamlet,
      a.neighbourhood || a.suburb || a.village,
      a.city || a.town || a.state_district,
    ].filter(Boolean);
    const text = parts.join(", ") + (a.postcode ? ` - ${a.postcode}` : "");
    const out = text || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    geoCache.set(key, out);
    return out;
  } catch {
    // Address is only a label. Coordinates are the source of truth.
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
