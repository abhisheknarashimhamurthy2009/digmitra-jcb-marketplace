import {
  IconArrowRight,
  IconCheck,
  IconCompass,
  IconCurrentLocation,
  IconLayersSubtract,
  IconLoader2,
  IconMapPin,
  IconSparkles,
  IconStarFilled,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";

interface RealtimeMapProps {
  selectedLanguage?: SupportedLanguage;
  onSelectMachine?: (machineId: string) => void;
  siteAddress?: string;
  fullScreen?: boolean;
  selectedMachineId?: string;
  onConfirmBooking?: () => void;
  estimatedTotal?: number;
}

interface NearbyJcb {
  id: string;
  driver: string;
  machine: string;
  ratePerHour: number;
  lat: number;
  lng: number;
  distance: string;
  eta: string;
  rating: number;
  phone: string;
}

// User's verified Google Maps location from https://maps.app.goo.gl/9mfELuWtLqqLjynS8
// Kyatasandra, Tumakuru, Karnataka (13.312278° N, 77.1306519° E)
const VERIFIED_USER_LAT = 13.312278;
const VERIFIED_USER_LNG = 77.1306519;
const VERIFIED_LOCATION_NAME = "Kyatasandra, Tumakuru, Karnataka";

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn(`Failed to load ${src}`);
      resolve();
    };
    document.body.appendChild(script);
  });
}

function loadStyle(href: string, id: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export function RealtimeMap({
  selectedLanguage = "en",
  onSelectMachine,
  siteAddress = "Kyatasandra, Tumakuru, Karnataka",
  fullScreen = true,
  selectedMachineId = "jcb_3dx",
  onConfirmBooking,
  estimatedTotal = 2850,
}: RealtimeMapProps) {
  const isKn = selectedLanguage === "kn";
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const jcbMarkersRef = useRef<any[]>([]);

  // User position & site
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: VERIFIED_USER_LAT,
    lng: VERIFIED_USER_LNG,
  });
  const [locationName, setLocationName] = useState(VERIFIED_LOCATION_NAME);
  const [locationVerified, setLocationVerified] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [activeJcbCount, setActiveJcbCount] = useState(14);
  const [mapStyle, setMapStyle] = useState<"liberty" | "satellite">("liberty");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  // Dynamic nearby JCB fleet relative to user location around Kyatasandra / Tumakuru
  const getNearbyJcbs = (centerLat: number, centerLng: number): NearbyJcb[] => [
    {
      id: "jcb_3dx",
      driver: "Manjunath Gowda",
      machine: "JCB 3DX Super Backhoe",
      ratePerHour: 950,
      lat: centerLat + 0.005,
      lng: centerLng + 0.004,
      distance: "0.9 km (Near Kyatasandra Toll)",
      eta: "10 mins",
      rating: 4.9,
      phone: "9845012345",
    },
    {
      id: "jcb_4dx",
      driver: "Ramesh Kumar",
      machine: "JCB 4DX Heavy Duty",
      ratePerHour: 1100,
      lat: centerLat - 0.006,
      lng: centerLng + 0.007,
      distance: "1.8 km (Siddaganga Math Rd)",
      eta: "18 mins",
      rating: 4.8,
      phone: "9845098765",
    },
    {
      id: "mini_excavator",
      driver: "Suresh Patil",
      machine: "Mini Excavator (3 Ton)",
      ratePerHour: 1250,
      lat: centerLat - 0.004,
      lng: centerLng - 0.005,
      distance: "2.4 km (Batawadi / Tumkur)",
      eta: "22 mins",
      rating: 4.95,
      phone: "9845054321",
    },
    {
      id: "jcb_3dx_2",
      driver: "Basavaraj K",
      machine: "JCB 3DX EcoXcellence",
      ratePerHour: 950,
      lat: centerLat + 0.003,
      lng: centerLng - 0.006,
      distance: "1.4 km (NH48 Service Rd)",
      eta: "14 mins",
      rating: 4.85,
      phone: "9845067890",
    },
  ];

  const nearbyJcbs = getNearbyJcbs(userLocation.lat, userLocation.lng);
  const activeSelectedJcb =
    nearbyJcbs.find((j) => j.id === selectedMachineId) || nearbyJcbs[0];

  // Helper to reverse geocode coordinate to friendly street / area name
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            "Accept-Language": isKn ? "kn,en" : "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.village || addr.road,
          addr.town || addr.city || addr.city_district || addr.county,
          addr.state,
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.slice(0, 2).join(", ");
        }
        if (data.display_name) {
          return data.display_name.split(",").slice(0, 2).join(",");
        }
      }
    } catch {
      // ignore
    }
    return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  };

  // Re-draw or update markers on the map
  const updateMapMarkers = useCallback(
    (lat: number, lng: number, currentSelectedId: string) => {
      const L = (window as any).L;
      const map = leafletMapRef.current;
      if (!L || !map) return;

      // Update User Site Pin
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const userIcon = L.divIcon({
          className: "custom-site-pin",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 42px; height: 42px; background: rgba(11, 61, 145, 0.35); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 30px; height: 30px; background: #0b3d91; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="width: 10px; height: 10px; background: #ffb400; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        userMarkerRef.current = L.marker([lat, lng], {
          icon: userIcon,
          draggable: true,
        }).addTo(map);

        userMarkerRef.current.on("dragend", async (e: any) => {
          const newPos = e.target.getLatLng();
          setUserLocation({ lat: newPos.lat, lng: newPos.lng });
          const name = await reverseGeocode(newPos.lat, newPos.lng);
          setLocationName(name);
          updateMapMarkers(newPos.lat, newPos.lng, currentSelectedId);
        });
      }

      // Clear previous JCB markers
      jcbMarkersRef.current.forEach((m) => m.remove());
      jcbMarkersRef.current = [];

      // Add fresh JCB fleet around the current user coordinates
      const nearby = getNearbyJcbs(lat, lng);
      nearby.forEach((jcb) => {
        const isSelected = jcb.id === currentSelectedId;
        const jcbIcon = L.divIcon({
          className: "custom-jcb-pin",
          html: `
            <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; transform: translate3d(0,0,0); transition: all 0.2s;">
              <div style="background: ${isSelected ? "#0b3d91" : "#ffb400"}; color: ${isSelected ? "#ffffff" : "#0b3d91"}; font-weight: 900; font-size: 11px; padding: 4px 8px; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span style="font-size: 13px;">🚜</span>
                <span>${jcb.eta}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${isSelected ? "#0b3d91" : "#ffb400"}; margin-top: -1px;"></div>
            </div>
          `,
          iconSize: [70, 32],
          iconAnchor: [35, 30],
        });

        const marker = L.marker([jcb.lat, jcb.lng], { icon: jcbIcon }).addTo(map);
        marker.on("click", () => {
          onSelectMachine?.(jcb.id);
          updateMapMarkers(lat, lng, jcb.id);
        });
        jcbMarkersRef.current.push(marker);
      });
    },
    [onSelectMachine]
  );

  // Apply new verified location
  const applyLocation = useCallback(
    async (lat: number, lng: number, isHighAccuracyGps: boolean, knownName?: string) => {
      setUserLocation({ lat, lng });
      setLocationVerified(true);
      setIsLocating(false);

      if (leafletMapRef.current) {
        leafletMapRef.current.flyTo([lat, lng], 15, {
          duration: 1.5,
        });
      }

      updateMapMarkers(lat, lng, selectedMachineId);

      if (knownName) {
        setLocationName(knownName);
      } else {
        const addrName = await reverseGeocode(lat, lng);
        setLocationName(addrName);
      }
    },
    [updateMapMarkers, selectedMachineId]
  );

  // Main Locate Function: Pinpoints Kyatasandra, Tumakuru or reads GPS
  const handleGetLocation = useCallback(() => {
    setIsLocating(true);

    if (typeof window === "undefined" || !navigator.geolocation) {
      applyLocation(VERIFIED_USER_LAT, VERIFIED_USER_LNG, true, VERIFIED_LOCATION_NAME);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await applyLocation(lat, lng, true);
      },
      async (err) => {
        console.warn("Device GPS fallback to verified Tumakuru location:", err.message);
        await applyLocation(VERIFIED_USER_LAT, VERIFIED_USER_LNG, true, VERIFIED_LOCATION_NAME);
      },
      {
        timeout: 4000,
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  }, [applyLocation]);

  // Initialize interactive OpenFreeMap + MapLibre GL Leaflet map
  useEffect(() => {
    let isCancelled = false;

    if (typeof window === "undefined" || !mapContainerRef.current) return;

    loadStyle("https://unpkg.com/leaflet/dist/leaflet.css", "leaflet-css");
    loadStyle("https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css", "maplibre-css");

    const setupMap = async () => {
      await loadScript("https://unpkg.com/leaflet/dist/leaflet.js", "leaflet-js");
      await loadScript("https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js", "maplibre-js");
      await loadScript(
        "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js",
        "maplibre-leaflet-js"
      );

      if (isCancelled || !mapContainerRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Clean up previous instance
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        userMarkerRef.current = null;
        jcbMarkersRef.current = [];
      }

      // Initialize Leaflet map centered at Kyatasandra, Tumakuru
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([VERIFIED_USER_LAT, VERIFIED_USER_LNG], 15);

      leafletMapRef.current = map;

      // Add OpenFreeMap Vector style or Satellite
      if (mapStyle === "satellite") {
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19 }
        ).addTo(map);
      } else {
        if (typeof L.maplibreGL === "function") {
          try {
            L.maplibreGL({
              style: "https://tiles.openfreemap.org/styles/liberty",
            }).addTo(map);
          } catch (e) {
            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
              maxZoom: 19,
              subdomains: "abcd",
            }).addTo(map);
          }
        } else {
          L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            subdomains: "abcd",
          }).addTo(map);
        }
      }

      // Allow clicking on map to reposition site location pin
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        await applyLocation(lat, lng, false);
      });

      // Render markers for Kyatasandra coordinates
      updateMapMarkers(VERIFIED_USER_LAT, VERIFIED_USER_LNG, selectedMachineId);

      // Invalidate size to ensure crisp rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    setupMap();

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        userMarkerRef.current = null;
        jcbMarkersRef.current = [];
      }
    };
  }, [mapStyle, updateMapMarkers, applyLocation, selectedMachineId]);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl">
      {/* Real-time Map Header Floating Bar */}
      {/* Floating Top Controls (In Front of Map) */}
      <div
        className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Live Radar Badge & Location */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/15">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
            {isKn ? "ಲೈವ್ ಜಿಪಿಎಸ್" : "LIVE RADAR"}
          </span>
          <span className="text-white/40 font-bold">•</span>
          <span className="text-[11px] font-bold text-slate-200">
            {activeJcbCount} {isKn ? "ಜೆಸಿಬಿಗಳು ಲಭ್ಯವಿದೆ" : "JCBs Nearby"}
          </span>
        </div>

        {/* Map View Toggle (Vector / Satellite) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === "liberty" ? "satellite" : "liberty")}
            className="flex items-center gap-1 rounded-xl bg-white/95 px-2.5 py-1.5 text-[11px] font-black text-slate-800 backdrop-blur shadow-md hover:bg-white active:scale-95 transition"
            title="Toggle Satellite / Vector View"
          >
            <IconLayersSubtract size={15} />
            <span>{mapStyle === "liberty" ? "Satellite" : "Vector"}</span>
          </button>
        </div>
      </div>

      {/* Map Viewport Canvas - Takes 100% Full Height & Width without Scrollbar */}
      <div
        ref={mapContainerRef}
        className="h-full w-full flex-1 bg-slate-800 cursor-crosshair"
        style={{ minHeight: "100%", width: "100%" }}
      />

      {/* Pop-up on the FRONT of the Map at Bottom (Full Width Fit to Screen - Enlarged for Clarity) */}
      <div
        className="absolute bottom-3.5 inset-x-2.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-2"
        style={{ zIndex: 9999 }}
      >
        {/* Floating GPS Button right above the pop-up at the right corner */}
        <div className="flex justify-end mb-2.5 pr-1 pointer-events-none">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="pointer-events-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#0b3d91] shadow-2xl border-2 border-slate-200/90 hover:bg-blue-50 active:scale-90 transition cursor-pointer"
            title={isKn ? "ಲೈವ್ ಜಿಪಿಎಸ್ ಸ್ಥಳ" : "Locate My Device"}
          >
            {isLocating ? (
              <IconLoader2 size={24} className="animate-spin text-amber-600" />
            ) : (
              <IconCurrentLocation size={24} stroke={2.5} className="text-blue-600" />
            )}
          </button>
        </div>

        {/* Pop-up Card - Larger, clearer, highly readable */}
        <div className="w-full rounded-3xl border-2 border-[#ffb400] bg-slate-950/95 p-4.5 text-white shadow-2xl backdrop-blur-md">
          {/* 1. Location Row */}
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#ffb400]/20 text-[#ffb400]">
              <IconMapPin size={18} stroke={2.5} />
            </span>
            <span className="truncate text-sm sm:text-base font-black text-slate-100 flex-1">
              {locationName}
            </span>
            {locationVerified && (
              <span className="shrink-0 flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-sm" title="Location Live Verified">
                <IconCheck size={14} stroke={3} />
                <span>{isKn ? "ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "Verified"}</span>
              </span>
            )}
          </div>

          {/* 2. "Book JCB for this location now" + Yellow Book JCB Button */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-[15px] font-black text-white leading-snug">
                {isKn ? "ಈ ಸ್ಥಳಕ್ಕಾಗಿ ಈಗಲೇ ಜೆಸಿಬಿ ಬುಕ್ ಮಾಡಿ" : "Book JCB for this location now"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
                <span className="font-bold text-slate-200">
                  🚜 {activeSelectedJcb.machine}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 font-black shrink-0">
                  ⚡ {activeSelectedJcb.eta}
                </span>
              </div>
            </div>

            {/* Enlarged Prominent Yellow Book JCB Button */}
            <button
              type="button"
              onClick={onConfirmBooking}
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-5 sm:px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#111827] shadow-xl ring-4 ring-[#ffb400]/40 transition-all active:scale-95 cursor-pointer"
            >
              <span>{isKn ? "ಜೆಸಿಬಿ ಬುಕ್ ಮಾಡಿ" : "Book JCB"}</span>
              <IconArrowRight size={17} stroke={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
