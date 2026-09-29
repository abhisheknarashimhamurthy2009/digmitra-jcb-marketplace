import { useCallback, useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const STADIA_KEY =
  import.meta.env.VITE_STADIA_KEY || "abd1cf7c-c8ca-4b47-a786-de5a7d41aaa6";
const STYLE_URL = `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_KEY}`;

export interface MapViewProps {
  initialLongitude?: number;
  initialLatitude?: number;
  initialZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface LiveLocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  source: string;
  address: string;
  isTracking: boolean;
  lastUpdated: number;
}

export default function MapView({
  initialLongitude = 77.130975,
  initialLatitude = 13.311755,
  initialZoom = 14,
  style = { width: "100%", height: "100dvh" },
  children,
}: MapViewProps) {
  const [MapModule, setMapModule] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const [liveLocation, setLiveLocation] = useState<LiveLocationState>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    accuracy: 209,
    speed: null,
    heading: null,
    altitude: null,
    source: "System Location Sensor",
    address: "Kyatasandra, Tumakuru, Karnataka",
    isTracking: true,
    lastUpdated: Date.now(),
  });

  const [trackingStatus, setTrackingStatus] = useState<"connecting" | "active" | "denied">(
    "connecting"
  );
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Load MapLibre React wrapper on client
  useEffect(() => {
    import("react-map-gl/maplibre").then((mod) => {
      setMapModule(mod);
    });
  }, []);

  // Fetch initial Hardware Location from system backend
  useEffect(() => {
    fetch("/api/location")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setLiveLocation((prev) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy || 200,
            address: data.address || prev.address,
            source: data.source || "Windows Hardware GPS",
            lastUpdated: Date.now(),
          }));
        }
      })
      .catch((err) => console.warn("System location API check:", err));
  }, []);

  // Setup Live Hardware GPS Watcher via Browser Geolocation API
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setTrackingStatus("active");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading, altitude } =
          position.coords;

        setLiveLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          speed: speed ? Math.round(speed * 3.6) : null, // Convert m/s to km/h
          heading: heading ? Math.round(heading) : null,
          altitude: altitude ? Math.round(altitude) : null,
          source: "Device GPS / Hardware Location Sensor",
          address: "Live Hardware Coordinates",
          isTracking: true,
          lastUpdated: Date.now(),
        });
        setTrackingStatus("active");

        // Center map smoothly if initialized
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true,
            duration: 1200,
          });
        }
      },
      (error) => {
        console.warn("Hardware Geolocation watch warning:", error.message);
        // If user denied or device unavailable, keep active using Windows hardware fallback
        if (error.code === error.PERMISSION_DENIED) {
          setTrackingStatus("denied");
        } else {
          setTrackingStatus("active");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Function to re-center map onto live tracked coordinates
  const handleCenterLiveLocation = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [liveLocation.longitude, liveLocation.latitude],
        zoom: 16,
        essential: true,
        duration: 1200,
      });
    }
  }, [liveLocation.latitude, liveLocation.longitude]);

  if (!MapModule) {
    return (
      <div
        style={style}
        className="flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 animate-pulse">
          <div className="size-6 animate-spin rounded-full border-3 border-blue-400 border-t-transparent" />
        </div>
        <h3 className="text-base font-black tracking-wide text-slate-100">
          Activating Live GPS &amp; Stadia Map...
        </h3>
        <p className="text-xs text-slate-400 mt-1">Connecting to hardware location sensor</p>
      </div>
    );
  }

  const { default: Map, Marker, NavigationControl, GeolocateControl } = MapModule;

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-slate-950">
      {/* 1. MapLibre GL Stadia Map Canvas */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: liveLocation.longitude,
          latitude: liveLocation.latitude,
          zoom: initialZoom,
        }}
        style={style}
        mapStyle={STYLE_URL}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserLocation={true}
          auto
        />

        {/* 2. Live Animated User Location Marker with Radar Beacon */}
        <Marker
          longitude={liveLocation.longitude}
          latitude={liveLocation.latitude}
          anchor="center"
        >
          <div className="relative flex items-center justify-center cursor-pointer group">
            {/* Outer radar ping waves */}
            <div className="absolute size-14 rounded-full bg-blue-500/25 animate-ping" />
            <div className="absolute size-9 rounded-full bg-blue-500/40 animate-pulse" />

            {/* Inner Core Hardware Pin */}
            <div className="relative size-6 rounded-full bg-[#0b3d91] border-2 border-white shadow-xl flex items-center justify-center text-white ring-2 ring-blue-400/50">
              <div className="size-2 rounded-full bg-[#ffb400]" />
            </div>

            {/* Hover/Tap Tooltip */}
            <div className="absolute -top-9 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-slate-700 pointer-events-none">
              📍 YOUR LIVE LOCATION
            </div>
          </div>
        </Marker>

        {children}
      </Map>

      {/* 3. Floating Live GPS HUD Card (Top Center) */}
      <div
        className="absolute top-3 left-3 right-14 sm:right-auto sm:left-4 sm:max-w-sm pointer-events-auto"
        style={{ zIndex: 1000 }}
      >
        <div className="rounded-2xl bg-slate-950/95 border border-slate-800 p-3 shadow-2xl backdrop-blur-md text-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                LIVE HARDWARE GPS
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              ±{liveLocation.accuracy}m
            </span>
          </div>

          {/* Coordinates Details */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">LAT:</span>
              <span className="font-bold text-amber-300">
                {liveLocation.latitude.toFixed(6)}° N
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">LNG:</span>
              <span className="font-bold text-amber-300">
                {liveLocation.longitude.toFixed(6)}° E
              </span>
            </div>
            {liveLocation.speed !== null && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">SPEED:</span>
                <span className="font-bold text-emerald-300">{liveLocation.speed} km/h</span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 truncate">
              {liveLocation.source}
            </span>
            <button
              type="button"
              onClick={handleCenterLiveLocation}
              className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow"
            >
              Re-center
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Right Floating Center-to-GPS Action Button */}
      <div
        className="absolute bottom-6 right-4 pointer-events-auto"
        style={{ zIndex: 1000 }}
      >
        <button
          type="button"
          onClick={handleCenterLiveLocation}
          className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#0b3d91] shadow-2xl border-2 border-slate-200 hover:bg-blue-50 active:scale-90 transition cursor-pointer"
          title="Center My Live Location"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 animate-pulse"
          >
            <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M12 2l0 2" />
            <path d="M12 20l0 2" />
            <path d="M20 12l2 0" />
            <path d="M2 12l2 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { MapView };
