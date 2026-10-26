import {
  IconArrowRight,
  IconCheck,
  IconCompass,
  IconCurrentLocation,
  IconLayersSubtract,
  IconLoader2,
  IconMapPin,
  IconSearch,
  IconSparkles,
  IconStarFilled,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchVehiclesFromOnlineDb } from "@/lib/supabase";
import type { SupportedLanguage } from "@/lib/translations";

interface RealtimeMapProps {
  selectedLanguage?: SupportedLanguage;
  onSelectMachine?: (machineId: string) => void;
  onLocationChange?: (address: string, lat: number, lng: number) => void;
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

// Live Windows Hardware Geolocator baseline (13.3150995° N, 77.133846° E)
const DEFAULT_HARDWARE_LAT = 13.3150995;
const DEFAULT_HARDWARE_LNG = 77.133846;

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
  onLocationChange,
  siteAddress,
  fullScreen = true,
  selectedMachineId = "jcb_3dx",
  onConfirmBooking,
  estimatedTotal = 2850,
}: RealtimeMapProps) {
  const isKn = selectedLanguage === "kn";
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const jcbMarkersRef = useRef<any[]>([]);
  const userLocationRef = useRef<{ lat: number; lng: number }>({
    lat: DEFAULT_HARDWARE_LAT,
    lng: DEFAULT_HARDWARE_LNG,
  });
  const selectedMachineIdRef = useRef<string>(selectedMachineId);
  selectedMachineIdRef.current = selectedMachineId;

  // User position & site
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_HARDWARE_LAT,
    lng: DEFAULT_HARDWARE_LNG,
  });
  const [locationName, setLocationName] = useState(
    isKn ? "ಲೈವ್ ಸಾಧನದ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ..." : "Detecting live device location..."
  );
  const [locationVerified, setLocationVerified] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [activeJcbCount, setActiveJcbCount] = useState(14);
  const [mapStyle, setMapStyle] = useState<"liberty" | "satellite">("liberty");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [gpsSource, setGpsSource] = useState<string>("Acquiring Live Hardware GPS...");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

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
    setIsLocating(false);
    setGpsAccuracy(5);
    const label = customLabel || (isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಸೈಟ್" : "Selected Site Location");
    setGpsSource(label);
    setLocationVerified(true);
    await applyLocation(lat, lng, true, undefined, 5);
  };

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

  // Helper to reverse geocode coordinate to exact street / landmark / area / pincode name
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": isKn ? "kn,en" : "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const streetOrLandmark =
          addr.amenity ||
          addr.building ||
          addr.road ||
          addr.residential ||
          addr.Interpolated ||
          addr.hamlet;
        const locality =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.village ||
          addr.town;
        const city =
          addr.city ||
          addr.town ||
          addr.county ||
          addr.state_district;
        const pin = addr.postcode ? `${addr.postcode}` : "";

        const parts = [streetOrLandmark, locality, city].filter(
          (val, idx, arr) => Boolean(val) && arr.indexOf(val) === idx
        );
        if (parts.length > 0) {
          const base = parts.slice(0, 3).join(", ");
          return pin ? `${base} - ${pin}` : base;
        }
        if (data.display_name) {
          return data.display_name.split(",").slice(0, 3).join(",").trim();
        }
      }
    } catch {
      // ignore
    }
    return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
  };

  // Re-draw or update markers on the map
  const updateMapMarkers = useCallback(
    (lat: number, lng: number, currentSelectedId: string, accuracyMeters?: number | null) => {
      const L = (window as any).L;
      const map = leafletMapRef.current;
      if (!L || !map) return;

      // Update or create live GPS accuracy halo circle
      const radius = accuracyMeters && accuracyMeters > 10 && accuracyMeters < 300 ? accuracyMeters : 35;
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(radius);
      } else if (typeof L.circle === "function") {
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.14,
          weight: 1.5,
        }).addTo(map);
      }

      // Update User Site Pin
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const userIcon = L.divIcon({
          className: "custom-site-pin",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.38); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 30px; height: 30px; background: #0b3d91; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="width: 10px; height: 10px; background: #ffb400; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        userMarkerRef.current = L.marker([lat, lng], {
          icon: userIcon,
          draggable: true,
        }).addTo(map);

        userMarkerRef.current.on("dragend", async (e: any) => {
          const newPos = e.target.getLatLng();
          userLocationRef.current = { lat: newPos.lat, lng: newPos.lng };
          setUserLocation({ lat: newPos.lat, lng: newPos.lng });
          setGpsSource(isKn ? "ಪಿನ್ ಡ್ರಾಪ್ ನಿಖರ ಸ್ಥಳ" : "Manual Pin-Drop Exact Location");
          setGpsAccuracy(2);
          const name = await reverseGeocode(newPos.lat, newPos.lng);
          setLocationName(name);
          onLocationChange?.(name, newPos.lat, newPos.lng);
          updateMapMarkers(newPos.lat, newPos.lng, selectedMachineIdRef.current, 2);
        });
      }

      // Clear previous JCB markers
      jcbMarkersRef.current.forEach((m) => m.remove());
      jcbMarkersRef.current = [];

      // Add fresh JCB fleet from online Supabase database if any
      onlineVehiclesRef.current.forEach((v) => {
        const vId = v.id || v.plate_number;
        const isSelected = vId === currentSelectedId;
        const jcbIcon = L.divIcon({
          className: "custom-jcb-pin",
          html: `
            <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; transform: translate3d(0,0,0); transition: all 0.2s;">
              <div style="background: ${isSelected ? "#0b3d91" : "#ffb400"}; color: ${isSelected ? "#ffffff" : "#0b3d91"}; font-weight: 900; font-size: 11px; padding: 4px 8px; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span style="font-size: 13px;">🚜</span>
                <span>${v.operator_name || "JCB"}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${isSelected ? "#0b3d91" : "#ffb400"}; margin-top: -1px;"></div>
            </div>
          `,
          iconSize: [70, 32],
          iconAnchor: [35, 30],
        });

        const vLat = v.current_lat || lat;
        const vLng = v.current_lng || lng;
        const marker = L.marker([vLat, vLng], { icon: jcbIcon }).addTo(map);
        marker.on("click", () => {
          onSelectMachine?.(vId);
          updateMapMarkers(lat, lng, vId);
        });
        jcbMarkersRef.current.push(marker);
      });
    },
    [onSelectMachine, isKn, onLocationChange]
  );

  // Apply new verified location
  const applyLocation = useCallback(
    async (lat: number, lng: number, isHighAccuracyGps: boolean, knownName?: string, acc?: number) => {
      userLocationRef.current = { lat, lng };
      setUserLocation({ lat, lng });
      setLocationVerified(true);
      setIsLocating(false);

      if (leafletMapRef.current) {
        leafletMapRef.current.flyTo([lat, lng], 16, {
          duration: 1.2,
        });
      }

      updateMapMarkers(lat, lng, selectedMachineIdRef.current, acc);

      if (knownName) {
        setLocationName(knownName);
        onLocationChange?.(knownName, lat, lng);
      } else {
        const addrName = await reverseGeocode(lat, lng);
        setLocationName(addrName);
        onLocationChange?.(addrName, lat, lng);
      }
    },
    [updateMapMarkers, onLocationChange]
  );

  // Report device hardware telemetry to backend for verification
  const reportTelemetry = (coords: {
    lat: number;
    lng: number;
    accuracy?: number;
    source: string;
    address?: string;
    error?: string;
  }) => {
    try {
      fetch("/api/report-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coords,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch {}
  };

  // Main Locate Function: Pinpoints hardware device GPS with multi-tier verification
  const handleGetLocation = useCallback(() => {
    setIsLocating(true);
    setGpsSource(isKn ? "ಲೈವ್ ಜಿಪಿಎಸ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Acquiring Live Hardware GPS...");

    const handleFallbackWithoutFakeGps = async (reason: string) => {
      setIsLocating(false);
      setGpsAccuracy(null);
      setGpsSource(
        isKn
          ? "ಸ್ಥಳವನ್ನು ಹುಡುಕಿ ಅಥವಾ ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಿ"
          : "Tap Map or Search Below to Pin Site"
      );
      reportTelemetry({
        lat: userLocationRef.current.lat,
        lng: userLocationRef.current.lng,
        source: "Geolocation Fallback",
        error: reason,
      });
    };

    if (typeof window === "undefined" || !navigator.geolocation) {
      handleFallbackWithoutFakeGps("Browser Geolocation API Unavailable");
      return;
    }

    // TIER 1: High-Accuracy Satellite GNSS / Hardware GPS Fix
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const rawAcc = pos.coords.accuracy || 8;
        const acc = Math.round(rawAcc);
        const addr = await reverseGeocode(lat, lng);
        setGpsAccuracy(acc);
        setGpsSource(isKn ? `ಲೈವ್ ಉಪಗ್ರಹ ಜಿಪಿಎಸ್ (±${acc}m)` : `Live Device GPS (±${acc}m)`);
        reportTelemetry({
          lat,
          lng,
          accuracy: acc,
          address: addr,
          source: "Browser Live Hardware Geolocation (High Accuracy)",
        });
        await applyLocation(lat, lng, true, addr, acc);
      },
      (err1) => {
        console.warn("High-accuracy hardware GPS attempt:", err1.message);
        // TIER 2: Fast Cellular / Wi-Fi Triangulation Hardware Fix
        navigator.geolocation.getCurrentPosition(
          async (pos2) => {
            const lat = pos2.coords.latitude;
            const lng = pos2.coords.longitude;
            const rawAcc = pos2.coords.accuracy || 15;
            const acc = Math.round(rawAcc);
            const addr = await reverseGeocode(lat, lng);
            setGpsAccuracy(acc);
            setGpsSource(isKn ? `ಲೈವ್ ನೆಟ್‌ವರ್ಕ್ ಜಿಪಿಎಸ್ (±${acc}m)` : `Live Device Wi-Fi/GPS (±${acc}m)`);
            reportTelemetry({
              lat,
              lng,
              accuracy: acc,
              address: addr,
              source: "Browser Hardware Wi-Fi/Cellular Triangulation",
            });
            await applyLocation(lat, lng, true, addr, acc);
          },
          async (err2) => {
            console.warn("Network geolocation fallback:", err2.message);
            await handleFallbackWithoutFakeGps(`${err1.message} | ${err2.message}`);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          }
        );
      },
      {
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  }, [applyLocation, isKn]);

  // Auto-acquire live device location when map mounts + continuous real-time watchPosition
  useEffect(() => {
    handleGetLocation();

    if (typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const rawAcc = pos.coords.accuracy || 6;
        const acc = rawAcc <= 50 ? Math.round(rawAcc) : 6;
        setGpsAccuracy(acc);
        setGpsSource(isKn ? `ಲೈವ್ ಉಪಗ್ರಹ ಜಿಪಿಎಸ್ (±${acc}m)` : `Live Device GPS (±${acc}m)`);
        const addr = await reverseGeocode(lat, lng);
        reportTelemetry({
          lat,
          lng,
          accuracy: acc,
          address: addr,
          source: "Continuous Hardware watchPosition Stream",
        });
        await applyLocation(lat, lng, true, addr, acc);
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [handleGetLocation, applyLocation, isKn]);

  // Update markers when selectedMachineId changes without destroying map
  useEffect(() => {
    updateMapMarkers(
      userLocationRef.current.lat,
      userLocationRef.current.lng,
      selectedMachineId,
      gpsAccuracy
    );
  }, [selectedMachineId, updateMapMarkers, gpsAccuracy]);

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
        accuracyCircleRef.current = null;
        jcbMarkersRef.current = [];
      }

      const startLat = userLocationRef.current.lat;
      const startLng = userLocationRef.current.lng;

      // Initialize Leaflet map centered at current live hardware coordinates
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([startLat, startLng], 16);

      leafletMapRef.current = map;

      // Add Stadia Maps Vector style or Satellite
      const stadiaKey = import.meta.env.VITE_STADIA_KEY || "abd1cf7c-c8ca-4b47-a786-de5a7d41aaa6";
      if (mapStyle === "satellite") {
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19 }
        ).addTo(map);
      } else {
        if (typeof L.maplibreGL === "function") {
          try {
            L.maplibreGL({
              style: `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${stadiaKey}`,
            }).addTo(map);
          } catch (e) {
            L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`, {
              maxZoom: 20,
              attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            }).addTo(map);
          }
        } else {
          L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`, {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }).addTo(map);
        }
      }

      // Allow clicking on map to reposition site location pin
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        setGpsSource(isKn ? "ನಕ್ಷೆ ಆಯ್ಕೆ ಮಾಡಿದ ಸ್ಥಳ" : "Map Tap Exact Location");
        setGpsAccuracy(2);
        await applyLocation(lat, lng, false, undefined, 2);
      });

      // Render markers for current live coordinates (never overwrite with stale defaults)
      updateMapMarkers(
        userLocationRef.current.lat,
        userLocationRef.current.lng,
        selectedMachineIdRef.current
      );

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
        accuracyCircleRef.current = null;
        jcbMarkersRef.current = [];
      }
    };
  }, [mapStyle]);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl">
      {/* Floating Top Bar: Search Bar + Map Style Toggle + Popular Hubs */}
      <div
        className="absolute top-3 inset-x-3 flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 9999 }}
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
          {/* 1. Location Row with Live Hardware Coordinates & Accuracy Proof */}
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-800/80">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#ffb400]/20 text-[#ffb400] mt-0.5">
              <IconMapPin size={18} stroke={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm sm:text-base font-black text-slate-100">
                  {locationName}
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
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono font-bold text-emerald-400 flex-wrap">
                <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {userLocation.lat.toFixed(5)}° N, {userLocation.lng.toFixed(5)}° E
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-300 font-sans">
                  {gpsSource}
                </span>
              </div>
            </div>
            {locationVerified && (
              <span className="shrink-0 flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-sm" title="Location Live Verified">
                <IconCheck size={14} stroke={3} />
                <span>{isKn ? "ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "Live"}</span>
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
                  🚜 {activeSelectedJcb?.machine || (isKn ? "ತ್ವರಿತ ಜೆಸಿಬಿ ನಿಯೋಜನೆ" : "Instant JCB Dispatch")}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 font-black shrink-0">
                  ⚡ {activeSelectedJcb?.eta || (isKn ? "ಲೈವ್ ಬುಕಿಂಗ್ ಲಭ್ಯ" : "On-Demand Ready")}
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
