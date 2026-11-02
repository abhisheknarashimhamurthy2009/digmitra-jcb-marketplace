import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconCurrentLocation,
  IconLayersSubtract,
  IconLoader2,
  IconLock,
  IconMapPin,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchVehiclesFromOnlineDb } from "@/lib/supabase";
import type { SupportedLanguage } from "@/lib/translations";
import { reverseGeocode, useBestLocation } from "./useBestLocation";

interface RealtimeMapProps {
  selectedLanguage?: SupportedLanguage;
  onSelectMachine?: (machineId: string) => void;
  onLocationChange?: (
    address: string,
    lat: number,
    lng: number,
    accuracy?: number | null,
    pinConfirmed?: boolean
  ) => void;
  siteAddress?: string;
  fullScreen?: boolean;
  selectedMachineId?: string;
  onConfirmBooking?: (confirmedLocation?: {
    lat: number;
    lng: number;
    accuracy?: number | null;
    address?: string;
    pinConfirmedByUser?: boolean;
  }) => void;
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

// Live baseline default coordinates (Tumakuru / Kyatasandra)
const DEFAULT_HARDWARE_LAT = 13.3150995;
const DEFAULT_HARDWARE_LNG = 77.133846;

const STADIA_KEY =
  import.meta.env.VITE_MAPS_API_KEY ||
  import.meta.env.VITE_STADIA_KEY ||
  "AIzaSyC5JJM7bF0mew4Q0Nofyou61GRKxmSOUmY";
const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "esri-imagery-layer",
      type: "raster",
      source: "esri-imagery",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const [lng, lat] = center;
  const km = Math.max(radiusInMeters, 5) / 1000;
  const coords: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  coords.push(coords[0]);
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [coords],
    },
  };
}

export function RealtimeMap({
  selectedLanguage = "en",
  onSelectMachine,
  onLocationChange,
  siteAddress,
  fullScreen = true,
  selectedMachineId = "jcb_3dx",
  onConfirmBooking,
  estimatedTotal = 2850,
}: RealtimeMapProps) {
  const isKn = selectedLanguage === "kn";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const jcbMarkersRef = useRef<maplibregl.Marker[]>([]);

  // User position & tracking state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_HARDWARE_LAT,
    lng: DEFAULT_HARDWARE_LNG,
  });
  const userLocationRef = useRef<{ lat: number; lng: number }>({
    lat: DEFAULT_HARDWARE_LAT,
    lng: DEFAULT_HARDWARE_LNG,
  });

  const [accuracy, setAccuracy] = useState<number | null>(null);
  const accuracyRef = useRef<number | null>(null);
  accuracyRef.current = accuracy;

  const [locationName, setLocationName] = useState<string>(
    siteAddress || (isKn ? "ಲೈವ್ ಸಾಧನದ ಸ್ಥಳವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Detecting live device location...")
  );
  const [locationVerified, setLocationVerified] = useState(false);
  const [mapStyle, setMapStyle] = useState<"liberty" | "satellite">("satellite");
  const [isPinConfirmed, setIsPinConfirmed] = useState(false);

  // Track if user manually dragged pin or clicked map
  const userHasInteracted = useRef(false);

  // Requirement 1: useBestLocation({ goodAccuracy: 20, maxWaitMs: 60000 })
  const { fix, status, start, stop } = useBestLocation({
    goodAccuracy: 20,
    maxWaitMs: 60000,
  });

  // Search and popular hubs
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; displayName: string; lat: number; lng: number }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  const POPULAR_HUBS = [
    {
      name: isKn ? "ತುಮಕೂರು ಸಿಟಿ" : "Tumakuru City",
      lat: 13.340077,
      lng: 77.100621,
    },
    {
      name: isKn ? "ಎಸ್.ಐ.ಟಿ ಕ್ಯಾಂಪಸ್" : "SIT Campus",
      lat: 13.3275,
      lng: 77.1261,
    },
    {
      name: isKn ? "ಬಟವಾಡಿ" : "Batawadi",
      lat: 13.3255,
      lng: 77.1189,
    },
    {
      name: isKn ? "ಎಸ್.ಎಸ್ ಪುರಂ" : "S.S. Puram",
      lat: 13.3468,
      lng: 77.1092,
    },
    {
      name: isKn ? "ಕ್ಯಾತಸಂದ್ರ" : "Kyatasandra",
      lat: 13.315099,
      lng: 77.133846,
    },
    {
      name: isKn ? "ಬೆಂಗಳೂರು" : "Bengaluru",
      lat: 12.9716,
      lng: 77.5946,
    },
  ];

  // Online vehicles from Supabase database
  const [onlineVehicles, setOnlineVehicles] = useState<any[]>([]);
  const onlineVehiclesRef = useRef<any[]>([]);
  onlineVehiclesRef.current = onlineVehicles;

  useEffect(() => {
    fetchVehiclesFromOnlineDb().then((vehicles) => {
      setOnlineVehicles(vehicles || []);
    });
  }, []);

  const nearbyJcbs: NearbyJcb[] = onlineVehicles.map((v) => ({
    id: v.id || v.plate_number,
    driver: v.operator_name || "Operator",
    machine: v.vehicle_type || "JCB 3DX",
    ratePerHour: v.rate_per_hour || 950,
    lat: v.current_lat || userLocation.lat,
    lng: v.current_lng || userLocation.lng,
    distance: "Nearby",
    eta: "Ready",
    rating: 5.0,
    phone: v.operator_phone || "",
  }));

  const activeSelectedJcb =
    nearbyJcbs.find((j) => j.id === selectedMachineId) || nearbyJcbs[0] || null;

  // Update GeoJSON accuracy halo circle
  const updateAccuracyHalo = useCallback((lng: number, lat: number, accMeters: number) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("accuracy-source") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(createGeoJSONCircle([lng, lat], accMeters));
    }
  }, []);

  // Setup Halo layers on MapLibre style load
  const setupAccuracyHaloLayer = useCallback((lng: number, lat: number, accMeters: number) => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.getSource("accuracy-source")) {
      map.addSource("accuracy-source", {
        type: "geojson",
        data: createGeoJSONCircle([lng, lat], accMeters),
      });

      map.addLayer({
        id: "accuracy-halo-fill",
        type: "fill",
        source: "accuracy-source",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.18,
        },
      });

      map.addLayer({
        id: "accuracy-halo-stroke",
        type: "line",
        source: "accuracy-source",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 1.5,
          "line-opacity": 0.6,
        },
      });
    }
  }, []);

  // Update JCB Markers on MapLibre map
  const updateJcbMarkers = useCallback((currentSelectedId: string) => {
    const map = mapRef.current;
    if (!map) return;

    jcbMarkersRef.current.forEach((m) => m.remove());
    jcbMarkersRef.current = [];

    onlineVehiclesRef.current.forEach((v) => {
      const vId = v.id || v.plate_number;
      const isSelected = vId === currentSelectedId;
      const vLat = v.current_lat || userLocationRef.current.lat;
      const vLng = v.current_lng || userLocationRef.current.lng;

      const el = document.createElement("div");
      el.className = "custom-jcb-pin";
      el.innerHTML = `
        <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: all 0.2s;">
          <div style="background: ${isSelected ? "#0b3d91" : "#ffb400"}; color: ${isSelected ? "#ffffff" : "#0b3d91"}; font-weight: 900; font-size: 11px; padding: 4px 8px; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="font-size: 13px;">🚜</span>
            <span>${v.operator_name || "JCB"}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${isSelected ? "#0b3d91" : "#ffb400"}; margin-top: -1px;"></div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vLng, vLat])
        .addTo(map);

      el.addEventListener("click", () => {
        onSelectMachine?.(vId);
      });

      jcbMarkersRef.current.push(marker);
    });
  }, [onSelectMachine]);

  // Requirement 1: Start useBestLocation automatically on first load
  useEffect(() => {
    start();
  }, [start]);

  // User taps "Use my current location" / Keep trying
  const handleLocateMe = useCallback(() => {
    userHasInteracted.current = false;
    setIsPinConfirmed(false);
    setLocationVerified(false);
    start();
  }, [start]);

  // Requirement 4: User taps "Confirm location" button
  const handleConfirmLocation = useCallback(() => {
    userHasInteracted.current = true;
    stop(); // Never move the pin again after confirmation
    setIsPinConfirmed(true);
    setLocationVerified(true);
    const currentAcc = accuracyRef.current ?? accuracy ?? null;
    onLocationChange?.(locationName, userLocation.lat, userLocation.lng, currentAcc, true);
    onConfirmBooking?.({
      lat: userLocation.lat,
      lng: userLocation.lng,
      accuracy: currentAcc,
      address: locationName,
      pinConfirmedByUser: true,
    });
  }, [accuracy, locationName, onConfirmBooking, onLocationChange, stop, userLocation.lat, userLocation.lng]);

  // Requirement 2: Pin follows hook's fix ONLY while status is "locating"
  // Once status is "good" or "coarse", or user drags/taps, stop auto-updating the pin.
  // GPS must NEVER move the pin after a manual drag.
  useEffect(() => {
    if (!fix) return;
    if (userHasInteracted.current) return;
    if (status !== "locating") return;

    userLocationRef.current = { lat: fix.lat, lng: fix.lng };
    setUserLocation({ lat: fix.lat, lng: fix.lng });
    setAccuracy(fix.accuracy);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([fix.lng, fix.lat]);
    }
    updateAccuracyHalo(fix.lng, fix.lat, fix.accuracy);

    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [fix.lng, fix.lat],
        zoom: 18,
        duration: 500,
      });
    }
  }, [fix, status, updateAccuracyHalo]);

  // Requirement 5: Call reverseGeocode() ONLY ONCE when position is confirmed (status becomes good or coarse)
  useEffect(() => {
    if (userHasInteracted.current) return;
    if (status === "good" || status === "coarse") {
      const targetLat = fix?.lat ?? userLocationRef.current.lat;
      const targetLng = fix?.lng ?? userLocationRef.current.lng;
      const targetAcc = fix?.accuracy ?? accuracyRef.current ?? 30;

      setLocationVerified(status === "good");
      reverseGeocode(targetLat, targetLng, isKn).then((addr) => {
        setLocationName(addr);
        onLocationChange?.(addr, targetLat, targetLng, targetAcc, isPinConfirmed);
      });
    }
  }, [status, isKn, fix, isPinConfirmed, onLocationChange]);

  // Search logic
  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=in&limit=6&addressdetails=1`,
        {
          headers: {
            "Accept-Language": isKn ? "kn,en" : "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            name: item.name || item.display_name.split(",")[0],
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
          setSearchResults(formatted);
          setShowSearchDropdown(true);
          setIsSearching(false);
          return;
        }
      }
    } catch {}

    try {
      const pRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6`
      );
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.features && pData.features.length > 0) {
          const pFormatted = pData.features.map((f: any) => {
            const props = f.properties;
            const name = props.name || props.street || query;
            const context = [props.district, props.city, props.state]
              .filter(Boolean)
              .join(", ");
            return {
              name,
              displayName: context ? `${name}, ${context}` : name,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            };
          });
          setSearchResults(pFormatted);
          setShowSearchDropdown(true);
          setIsSearching(false);
          return;
        }
      }
    } catch {}

    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(val);
      }, 400);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSelectLocation = async (lat: number, lng: number, customLabel?: string) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    userHasInteracted.current = true;
    stop();

    userLocationRef.current = { lat, lng };
    setUserLocation({ lat, lng });
    setAccuracy(10);
    setLocationVerified(true);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lng, lat]);
    }
    updateAccuracyHalo(lng, lat, 10);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 18,
        essential: true,
        duration: 1000,
      });
    }

    const label = customLabel || (await reverseGeocode(lat, lng, isKn));
    setLocationName(label);
    onLocationChange?.(label, lat, lng, 10, isPinConfirmed);
  };

  // Requirement 6: Pure MapLibre initialization (Default Satellite View, Zoom 18)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLng = userLocationRef.current.lng;
    const initialLat = userLocationRef.current.lat;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle === "satellite" ? SATELLITE_STYLE : VECTOR_STYLE,
      center: [initialLng, initialLat], // [lng, lat] format
      zoom: 18,
      attributionControl: false,
    });

    mapRef.current = map;

    // Create User Site Pin Element
    const pinEl = document.createElement("div");
    pinEl.className = "custom-site-pin";
    pinEl.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.38); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 32px; height: 32px; background: #0b3d91; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 10px; height: 10px; background: #ffb400; border-radius: 50%;"></div>
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: pinEl, draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    userMarkerRef.current = marker;

    // Requirement 2: Manual drag stops auto-updating pin. GPS must NEVER move the pin after manual drag.
    marker.on("dragstart", () => {
      userHasInteracted.current = true;
      stop();
    });

    // Requirement 5: Call reverseGeocode() ONLY ONCE when a pin drag ENDS
    marker.on("dragend", async () => {
      userHasInteracted.current = true;
      stop();
      setIsPinConfirmed(false);
      const pos = marker.getLngLat();
      const newLat = pos.lat;
      const newLng = pos.lng;
      userLocationRef.current = { lat: newLat, lng: newLng };
      setUserLocation({ lat: newLat, lng: newLng });
      const currentAcc = accuracyRef.current || 10;
      updateAccuracyHalo(newLng, newLat, currentAcc);

      const addr = await reverseGeocode(newLat, newLng, isKn);
      setLocationName(addr);
      setLocationVerified(true);
      onLocationChange?.(addr, newLat, newLng, currentAcc, false);
    });

    // Map tap/click to reposition pin manually
    map.on("click", async (e) => {
      userHasInteracted.current = true;
      stop();
      setIsPinConfirmed(false);
      const { lng, lat } = e.lngLat;
      userLocationRef.current = { lat, lng };
      setUserLocation({ lat, lng });
      marker.setLngLat([lng, lat]);
      const currentAcc = accuracyRef.current || 10;
      updateAccuracyHalo(lng, lat, currentAcc);

      const addr = await reverseGeocode(lat, lng, isKn);
      setLocationName(addr);
      setLocationVerified(true);
      onLocationChange?.(addr, lat, lng, currentAcc, false);
    });

    // Add accuracy halo on style load
    map.on("load", () => {
      setupAccuracyHaloLayer(initialLng, initialLat, accuracyRef.current || 30);
      updateJcbMarkers(selectedMachineId);
      map.resize();
    });

    // Re-add accuracy halo layer whenever style changes
    map.on("style.load", () => {
      setupAccuracyHaloLayer(
        userLocationRef.current.lng,
        userLocationRef.current.lat,
        accuracyRef.current || 30
      );
    });

    // Clean up on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      jcbMarkersRef.current = [];
    };
  }, [mapStyle, setupAccuracyHaloLayer, updateAccuracyHalo, updateJcbMarkers, selectedMachineId, stop, isKn, onLocationChange]);

  // Update JCB Markers when selected machine or fleet changes
  useEffect(() => {
    updateJcbMarkers(selectedMachineId);
  }, [selectedMachineId, onlineVehicles, updateJcbMarkers]);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl">
      {/* Floating Top Bar: Search Bar + Map Style Toggle + Popular Hubs */}
      <div
        className="absolute top-3 inset-x-3 flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 999 }}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Search Bar Input */}
          <div className="relative flex-1">
            <div className="flex items-center rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-700/80 px-3 py-2.5 shadow-2xl focus-within:border-[#ffb400] transition">
              {isSearching ? (
                <IconLoader2 size={18} className="animate-spin text-[#ffb400] shrink-0 mr-2" />
              ) : (
                <IconSearch size={18} className="text-slate-400 shrink-0 mr-2" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") performSearch(searchQuery);
                }}
                placeholder={
                  isKn
                    ? "ನಿಮ್ಮ ಸ್ಥಳ, ಬಡಾವಣೆ ಅಥವಾ ನಗರ ಹುಡುಕಿ..."
                    : "Search your area, layout, street, or city..."
                }
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1.5 inset-x-0 rounded-2xl bg-slate-950/95 backdrop-blur-lg border border-slate-700/80 shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800 z-50">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lng}-${idx}`}
                    type="button"
                    onClick={() => handleSelectLocation(item.lat, item.lng, item.name)}
                    className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-slate-800/80 active:bg-slate-700/80 transition cursor-pointer"
                  >
                    <IconMapPin size={18} className="text-[#ffb400] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white truncate">{item.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{item.displayName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map View Toggle (Vector / Satellite) */}
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === "liberty" ? "satellite" : "liberty")}
            className="shrink-0 flex items-center gap-1.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-700/80 px-3 py-2.5 text-xs font-bold text-slate-200 shadow-xl hover:bg-slate-900 active:scale-95 transition cursor-pointer"
            title="Toggle Satellite / Vector View"
          >
            <IconLayersSubtract size={16} className="text-[#ffb400]" />
            <span className="hidden sm:inline">{mapStyle === "liberty" ? "Satellite" : "Vector"}</span>
          </button>
        </div>

        {/* Quick Locality Pills Scrollable Strip */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {POPULAR_HUBS.map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelectLocation(hub.lat, hub.lng, hub.name)}
              className="shrink-0 flex items-center gap-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 text-[11px] font-bold text-slate-200 shadow-md hover:border-[#ffb400] hover:text-[#ffb400] active:scale-95 transition cursor-pointer"
            >
              <IconMapPin size={11} className="text-[#ffb400]" />
              <span>{hub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pure MapLibre Map Viewport Canvas */}
      <div
        ref={mapContainerRef}
        className="h-full w-full flex-1 bg-slate-900 cursor-crosshair"
        style={{ minHeight: "100%", width: "100%" }}
      />

      {/* Pop-up on the FRONT of the Map at Bottom */}
      <div
        className="absolute bottom-3.5 inset-x-2.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-2"
        style={{ zIndex: 999 }}
      >
        {/* Floating GPS Button right above the pop-up at the right corner */}
        <div className="flex justify-end mb-2.5 pr-1 pointer-events-none">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={status === "locating"}
            className="pointer-events-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#0b3d91] shadow-2xl border-2 border-slate-200/90 hover:bg-blue-50 active:scale-90 transition cursor-pointer"
            title={isKn ? "ನನ್ನ ಲೈವ್ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ" : "Use my current location"}
          >
            {status === "locating" ? (
              <IconLoader2 size={24} className="animate-spin text-amber-600" />
            ) : (
              <IconCurrentLocation size={24} stroke={2.5} className="text-blue-600" />
            )}
          </button>
        </div>

        {/* Pop-up Card */}
        <div className="w-full rounded-3xl border-2 border-[#ffb400] bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-md">
          {/* 1. Location Row with Coordinates & Accuracy Badge */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-800/80">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#ffb400]/20 text-[#ffb400] mt-0.5">
              <IconMapPin size={18} stroke={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="truncate text-sm sm:text-base font-black text-slate-100">
                    {locationName}
                  </div>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-md shadow-sm">
                    v2.4 Live GPS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    searchInputRef.current?.focus();
                    setShowSearchDropdown(true);
                  }}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#ffb400] hover:underline bg-[#ffb400]/10 border border-[#ffb400]/30 px-2 py-0.5 rounded-lg transition cursor-pointer"
                >
                  <IconSearch size={12} />
                  <span>{isKn ? "ಹುಡುಕಿ" : "Search"}</span>
                </button>
              </div>

              {/* Requirement 3: Accuracy Badge ±{Math.round(accuracy)} m */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono font-bold text-emerald-400 flex-wrap">
                <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {userLocation.lat.toFixed(5)}° N, {userLocation.lng.toFixed(5)}° E
                </span>
                {accuracy !== null && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-amber-300 font-sans font-black bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/40">
                      ±{Math.round(accuracy)} m
                    </span>
                  </>
                )}
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-sans">
                  {status === "locating"
                    ? (accuracy !== null
                        ? (isKn ? `ನಿಖರ ಜಿಪಿಎಸ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ… ±${Math.round(accuracy)} m` : `Getting precise GPS… ±${Math.round(accuracy)} m`)
                        : (isKn ? "ನಿಖರ ಜಿಪಿಎಸ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ…" : "Getting precise GPS…"))
                    : status === "good"
                      ? (isKn ? "ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "GPS Locked")
                      : status === "coarse"
                        ? (isKn ? "ಜಿಪಿಎಸ್ ಅಂದಾಜು ಆಗಿದೆ" : "GPS is approximate")
                        : (isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಸೈಟ್" : "Custom Site")}
                </span>
              </div>
            </div>

            {locationVerified && (
              <span
                className="shrink-0 flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-sm"
                title="Location Live Verified"
              >
                <IconCheck size={14} stroke={3} />
                <span>{isKn ? "ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "Live"}</span>
              </span>
            )}
          </div>

          {/* Requirement 2: While status is "locating", show a live line: "Getting precise GPS… ±{accuracy} m" */}
          {status === "locating" && (
            <div className="mt-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/50 p-2.5 flex items-center gap-2 text-blue-200 text-xs font-bold animate-pulse">
              <IconLoader2 size={16} className="animate-spin text-amber-400 shrink-0" />
              <span>
                {accuracy !== null
                  ? (isKn
                      ? `ನಿಖರ ಜಿಪಿಎಸ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ… ±${Math.round(accuracy)} m`
                      : `Getting precise GPS… ±${Math.round(accuracy)} m`)
                  : (isKn ? "ನಿಖರ ಜಿಪಿಎಸ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ…" : "Getting precise GPS…")}
              </span>
            </div>
          )}

          {/* Requirement 3: If status is "coarse", show "GPS is approximate. Drag the pin to your exact plot, or tap Keep trying", with a Keep trying button that calls start() */}
          {status === "coarse" && (
            <div className="mt-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/60 p-3 flex items-center justify-between gap-2.5 text-amber-200 text-xs shadow-lg">
              <div className="flex items-center gap-2 min-w-0">
                <IconAlertTriangle size={20} className="shrink-0 text-amber-400" />
                <span className="font-bold leading-snug">
                  {isKn
                    ? "ಜಿಪಿಎಸ್ ಅಂದಾಜು ಆಗಿದೆ. ಪಿನ್ ಅನ್ನು ನಿಮ್ಮ ನಿಖರ ಸೈಟ್‌ಗೆ ಎಳೆಯಿರಿ, ಅಥವಾ 'Keep trying' ಒತ್ತಿರಿ"
                    : "GPS is approximate. Drag the pin to your exact plot, or tap Keep trying"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLocateMe}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffb400] text-slate-950 font-black text-xs hover:bg-amber-400 active:scale-95 transition cursor-pointer shadow"
              >
                <IconRefresh size={13} stroke={3} />
                <span>Keep trying</span>
              </button>
            </div>
          )}

          {status === "denied" && (
            <div className="mt-2.5 rounded-2xl bg-rose-500/15 border border-rose-400/50 p-3 text-rose-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-rose-300">
                  <IconLock size={15} />
                  <span>{isKn ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ" : "Location Permission Blocked"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-400 text-slate-950 font-black text-[10px] hover:bg-rose-300 active:scale-95 transition cursor-pointer"
                >
                  <IconRefresh size={11} stroke={3} />
                  <span>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Retry"}</span>
                </button>
              </div>
              <p className="text-[11px] text-rose-100 font-medium leading-relaxed">
                {isKn
                  ? "ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿ ಲಾಕ್ ಐಕಾನ್ (🔒) ➔ Site settings ➔ Location ➔ Allow ಮಾಡಿ."
                  : "Tap the lock icon (🔒) in the browser address bar ➔ Site settings ➔ Location ➔ Allow."}
              </p>
            </div>
          )}

          {status === "insecure" && (
            <div className="mt-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 p-2.5 flex items-center justify-between gap-2 text-amber-200 text-xs">
              <span className="font-bold leading-tight">
                {isKn
                  ? "ಅಸುರಕ್ಷಿತ ಸಂಪರ್ಕ. ಜಿಪಿಎಸ್ ಪ್ರವೇಶಿಸಲು HTTPS ಅಗತ್ಯವಿದೆ."
                  : "Insecure connection. HTTPS is required to access hardware GPS."}
              </span>
              <button
                type="button"
                onClick={handleLocateMe}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-amber-300 active:scale-95 transition cursor-pointer"
              >
                <IconRefresh size={12} stroke={3} />
                <span>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Retry"}</span>
              </button>
            </div>
          )}

          {status === "unavailable" && (
            <div className="mt-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 p-2.5 flex items-center justify-between gap-2 text-slate-300 text-xs">
              <span className="font-medium leading-tight">
                {isKn
                  ? "ಜಿಪಿಎಸ್ ಲಭ್ಯವಿಲ್ಲ. ಸಾಧನದ ಸ್ಥಳ ಆನ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಹುಡುಕಿ."
                  : "Location unavailable. Please check device GPS or search plot below."}
              </span>
              <button
                type="button"
                onClick={handleLocateMe}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-amber-300 active:scale-95 transition cursor-pointer"
              >
                <IconRefresh size={12} stroke={3} />
                <span>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Retry"}</span>
              </button>
            </div>
          )}

          {/* Requirement 4: "Confirm location" Action Bar */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-[15px] font-black text-white leading-snug">
                {isPinConfirmed
                  ? (isKn ? "ಸ್ಥಳ ದೃಢೀಕರಿಸಲಾಗಿದೆ ✓" : "Location Confirmed ✓")
                  : (isKn ? "ನಿಮ್ಮ ಸೈಟ್ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ" : "Confirm plot location")}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
                <span className="font-bold text-slate-200">
                  🚜 {activeSelectedJcb?.machine || (isKn ? "ತ್ವರಿತ ಜೆಸಿಬಿ ನಿಯೋಜನೆ" : "Instant JCB Dispatch")}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 font-black shrink-0">
                  ⚡ {activeSelectedJcb?.eta || (isKn ? "ಲೈವ್ ಬುಕಿಂಗ್ ಲಭ್ಯ" : "On-Demand Ready")}
                </span>
              </div>
            </div>

            {/* Requirement 4: Prominent "Confirm location" Button */}
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-5 sm:px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#111827] shadow-xl ring-4 ring-[#ffb400]/40 transition-all active:scale-95 cursor-pointer"
            >
              <IconCheck size={18} stroke={3} />
              <span>{isKn ? "ಸ್ಥಳ ದೃಢೀಕರಿಸಿ" : "Confirm location"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
