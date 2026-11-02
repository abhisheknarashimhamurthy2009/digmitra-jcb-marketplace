import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconCompass,
  IconCurrentLocation,
  IconMapPin,
  IconNavigation,
  IconPhone,
  IconRoute,
  IconShieldCheck,
  IconSparkles,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";
import type { AdvancePaymentResult } from "@/components/booking/advance-payment-screen";
import type { JcbMachineItem } from "@/components/booking/jcb-catalog-screen";
import type { BookingSubmissionData } from "@/components/booking/site-booking-details";
import {
  SITE_COORDS,
  VEHICLE_ROAD_ROUTES,
} from "@/lib/turn-by-turn-routes";

interface LiveTrackingScreenProps {
  selectedLanguage: SupportedLanguage;
  bookingId: string;
  selectedJcb: JcbMachineItem;
  bookingData: BookingSubmissionData | null;
  advancePaymentResult: AdvancePaymentResult | null;
  onBackToHome: () => void;
}

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
    script.onerror = () => resolve();
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

export function LiveTrackingScreen({
  selectedLanguage,
  bookingId,
  selectedJcb,
  bookingData,
  advancePaymentResult,
  onBackToHome,
}: LiveTrackingScreenProps) {
  const isKn = selectedLanguage === "kn";

  const tractorType = bookingData?.tractorType || "tractor_tipper";

  // Active tracked vehicle tab: "jcb" or "debris"
  const [activeVehicle, setActiveVehicle] = useState<"jcb" | "debris">("debris");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const routeLayersRef = useRef<{
    jcbCasing?: any;
    jcbRoute?: any;
    debrisCasing?: any;
    debrisRoute?: any;
  }>({});
  const markerLayersRef = useRef<{
    siteMarker?: any;
    jcbMarker?: any;
    debrisMarker?: any;
  }>({});

  // 100% Real Turn-By-Turn Road Route Data generated via OSRM on OpenStreetMap road grid
  const jcbRouteData = VEHICLE_ROAD_ROUTES.jcb;
  const tractorRouteData = VEHICLE_ROAD_ROUTES.tractor_tipper;
  const tata407RouteData = VEHICLE_ROAD_ROUTES.tata_407;
  const signaRouteData = VEHICLE_ROAD_ROUTES.tata_signa_6w;

  // Debris vehicle configs with authentic turn-by-turn road waypoints
  const DEBRIS_CONFIGS: Record<
    string,
    {
      name: string;
      nameKn: string;
      shortName: string;
      plate: string;
      location: string;
      locationKn: string;
      eta: string;
      etaKn: string;
      distance: string;
      speed: string;
      driverName: string;
      driverPhone: string;
      image: string;
      bata: number;
      emoji: string;
      coords: [number, number];
      route: [number, number][];
      roadDesc: string;
      roadDescKn: string;
    }
  > = {
    tractor_tipper: {
      name: "Tractor Tipper (3 Ton)",
      nameKn: "ಟ್ರಾಕ್ಟರ್ ಟಿಪ್ಪರ್ (3 ಟನ್)",
      shortName: "Tractor Tipper",
      plate: "DISPATCH-ASSIGNED",
      location: "Trailing JCB Operator",
      locationKn: "ಜೆಸಿಬಿ ಜೊತೆಗೆ ಸಾಗಣೆ",
      eta: `${tractorRouteData.durationMin * 4} Mins`,
      etaKn: `${tractorRouteData.durationMin * 4} ನಿಮಿಷ`,
      distance: `${tractorRouteData.distanceKm} km`,
      speed: "24 km/h",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80",
      bata: 150,
      emoji: "🚜",
      coords: tractorRouteData.startCoords,
      route: tractorRouteData.waypoints,
      roadDesc: "En route trailing JCB to site",
      roadDescKn: "ಜೆಸಿಬಿ ಜೊತೆಗೆ ಸೈಟ್‌ಗೆ ಸಾಗುತ್ತಿದೆ",
    },
    tata_407: {
      name: "Tata 407 Tipper (2.5 - 3 Ton)",
      nameKn: "ಟಾಟಾ 407 ಟಿಪ್ಪರ್ (2.5 - 3 ಟನ್)",
      shortName: "Tata 407",
      plate: "DISPATCH-ASSIGNED",
      location: "En Route to Site",
      locationKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿದೆ",
      eta: `${tata407RouteData.durationMin * 3.5} Mins`,
      etaKn: `${tata407RouteData.durationMin * 3.5} ನಿಮಿಷ`,
      distance: `${tata407RouteData.distanceKm} km`,
      speed: "32 km/h",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80",
      bata: 200,
      emoji: "🚚",
      coords: tata407RouteData.startCoords,
      route: tata407RouteData.waypoints,
      roadDesc: "En route to site",
      roadDescKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುತ್ತಿದೆ",
    },
    tata_signa_6w: {
      name: "Tata Signa 6W Heavy Tipper (8 Ton)",
      nameKn: "ಟಾಟಾ ಸಿಗ್ನಾ 6W ಹೆವಿ ಟಿಪ್ಪರ್ (8 ಟನ್)",
      shortName: "Tata Signa 6W",
      plate: "DISPATCH-ASSIGNED",
      location: "En Route to Site",
      locationKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿದೆ",
      eta: `${signaRouteData.durationMin * 4.5} Mins`,
      etaKn: `${signaRouteData.durationMin * 4.5} ನಿಮಿಷ`,
      distance: `${signaRouteData.distanceKm} km`,
      speed: "28 km/h",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1586191582152-44a6b2512a14?auto=format&fit=crop&w=500&q=80",
      bata: 300,
      emoji: "🚛",
      coords: signaRouteData.startCoords,
      route: signaRouteData.waypoints,
      roadDesc: "En route to site",
      roadDescKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುತ್ತಿದೆ",
    },
  };

  const debrisVehicle = DEBRIS_CONFIGS[tractorType] || DEBRIS_CONFIGS.tractor_tipper;

  // JCB Vehicle Details with real turn-by-turn road waypoints
  const jcbDetails = {
    name: selectedJcb?.model || "JCB 3DX Super Backhoe",
    shortName: "JCB 3DX",
    plate: (selectedJcb as any)?.plateNumber || "DISPATCH-ASSIGNED",
    location: isKn ? "ಸೈಟ್‌ಗೆ ಬರುತ್ತಿದೆ" : "Dispatched to Site",
    eta: selectedJcb?.eta || (isKn ? "22 ನಿಮಿಷ" : "22 Mins"),
    distance: `${jcbRouteData.distanceKm} km`,
    speed: "28 km/h",
    driverName: selectedJcb?.driverName || (isKn ? "ನಿಯೋಜಿತ ಚಾಲಕರು" : "Assigned Driver"),
    driverPhone: (selectedJcb as any)?.phone || "",
    image:
      selectedJcb?.image && !selectedJcb.image.includes("1581094288338") && !selectedJcb.image.includes("1579829366248")
        ? selectedJcb.image
        : "https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=700&q=80",
    rating: selectedJcb?.rating || 5.0,
    emoji: "🚜",
    coords: jcbRouteData.startCoords,
    route: jcbRouteData.waypoints,
    roadDesc: "En route to site",
    roadDescKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುತ್ತಿದೆ",
  };

  const currentVehicleData = activeVehicle === "jcb" ? jcbDetails : debrisVehicle;

  // Function to highlight selected route and focus camera
  const highlightRoute = useCallback(
    (targetVehicle: "jcb" | "debris") => {
      const map = leafletMapRef.current;
      const L = (window as any).L;
      if (!map || !L) return;

      map.invalidateSize();

      const layers = routeLayersRef.current;

      if (targetVehicle === "jcb") {
        // Highlight JCB Route (Google Maps Royal Blue)
        if (layers.jcbCasing) {
          layers.jcbCasing.setStyle({ color: "#ffffff", weight: 8.5, opacity: 0.95 });
        }
        if (layers.jcbRoute) {
          layers.jcbRoute.setStyle({ color: "#1a73e8", weight: 5.5, opacity: 1.0 });
        }

        // Dim Debris Route
        if (layers.debrisCasing) {
          layers.debrisCasing.setStyle({ color: "#cbd5e1", weight: 4.5, opacity: 0.4 });
        }
        if (layers.debrisRoute) {
          layers.debrisRoute.setStyle({ color: "#94a3b8", weight: 3, opacity: 0.45 });
        }

        // Fit bounds smoothly along the turn-by-turn road route
        try {
          const bounds = L.latLngBounds(jcbDetails.route);
          map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
        } catch (e) {
          console.warn("Bounds fit error:", e);
        }
      } else {
        // Highlight Debris Route (Google Maps Green / Emerald)
        if (layers.debrisCasing) {
          layers.debrisCasing.setStyle({ color: "#ffffff", weight: 8.5, opacity: 0.95 });
        }
        if (layers.debrisRoute) {
          layers.debrisRoute.setStyle({ color: "#059669", weight: 5.5, opacity: 1.0 });
        }

        // Dim JCB Route
        if (layers.jcbCasing) {
          layers.jcbCasing.setStyle({ color: "#cbd5e1", weight: 4.5, opacity: 0.4 });
        }
        if (layers.jcbRoute) {
          layers.jcbRoute.setStyle({ color: "#94a3b8", weight: 3, opacity: 0.45 });
        }

        // Fit bounds smoothly along the turn-by-turn road route
        try {
          const bounds = L.latLngBounds(debrisVehicle.route);
          map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
        } catch (e) {
          console.warn("Bounds fit error:", e);
        }
      }
    },
    [debrisVehicle.route, jcbDetails.route]
  );

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      loadStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "leaflet-css");
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "leaflet-js");

      if (!isMounted || !mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      // Defensive cleanup for existing leaflet container
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Create map centered on Kyatasandra site
      const map = L.map(mapContainerRef.current, {
        center: SITE_COORDS,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      leafletMapRef.current = map;

      // Primary High-Reliability Tile Layer (OpenStreetMap / Esri World Imagery fallback)
      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }
      ).addTo(map);

      // --- 1. Destination Site Pin ---
      const siteIcon = L.divIcon({
        className: "custom-site-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate3d(0,0,0);">
            <div style="position: absolute; -top: 10px; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #064e3b; color: #ffffff; border: 2.5px solid #ffb400; padding: 4px 8px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; font-weight: 900; font-size: 11px; white-space: nowrap; z-index: 10;">
              <span>📍</span>
              <span>YOUR SITE (${bookingData?.siteDimension?.split("(")[0]?.trim() || "30×40 ft"})</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #064e3b; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [160, 40],
        iconAnchor: [80, 36],
      });

      markerLayersRef.current.siteMarker = L.marker(SITE_COORDS, { icon: siteIcon }).addTo(map);

      // --- 2. JCB Machine Marker & Turn-by-Turn Road Route ---
      const jcbIcon = L.divIcon({
        className: "custom-jcb-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
            <div style="position: absolute; -top: 8px; width: 42px; height: 42px; background: rgba(255, 180, 0, 0.45); border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            <div style="background: #0f172a; color: white; border: 2.5px solid #ffb400; padding: 3px 7px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px; font-weight: 900; font-size: 10px; white-space: nowrap; z-index: 20;">
              <span style="font-size: 13px;">🚜</span>
              <span style="background: #ffb400; color: #020617; padding: 1px 4px; border-radius: 4px; font-family: monospace; font-weight: 900;">${jcbDetails.plate}</span>
              <span style="color: #4ade80;">22m</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0f172a; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [160, 36],
        iconAnchor: [80, 32],
      });

      markerLayersRef.current.jcbMarker = L.marker(jcbDetails.coords, { icon: jcbIcon }).addTo(map);
      markerLayersRef.current.jcbMarker.on("click", () => {
        setActiveVehicle("jcb");
        highlightRoute("jcb");
      });

      // JCB Turn-by-Turn Road Polylines (White Casing + Royal Blue Road Line)
      routeLayersRef.current.jcbCasing = L.polyline(jcbDetails.route, {
        color: "#ffffff",
        weight: 8.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routeLayersRef.current.jcbRoute = L.polyline(jcbDetails.route, {
        color: "#1a73e8",
        weight: 5.5,
        opacity: 1.0,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // --- 3. Debris Disposal Vehicle Marker & Turn-by-Turn Road Route ---
      const debrisIcon = L.divIcon({
        className: "custom-debris-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
            <div style="position: absolute; -top: 8px; width: 42px; height: 42px; background: rgba(5, 150, 105, 0.45); border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            <div style="background: #0f172a; color: white; border: 2.5px solid #10b981; padding: 3px 7px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px; font-weight: 900; font-size: 10px; white-space: nowrap; z-index: 20;">
              <span style="font-size: 13px;">${debrisVehicle.emoji}</span>
              <span style="background: #ffb400; color: #020617; padding: 1px 4px; border-radius: 4px; font-family: monospace; font-weight: 900;">${debrisVehicle.plate}</span>
              <span style="color: #4ade80;">${debrisVehicle.eta.split(" ")[0]}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0f172a; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [160, 36],
        iconAnchor: [80, 32],
      });

      markerLayersRef.current.debrisMarker = L.marker(debrisVehicle.coords, {
        icon: debrisIcon,
      }).addTo(map);
      markerLayersRef.current.debrisMarker.on("click", () => {
        setActiveVehicle("debris");
        highlightRoute("debris");
      });

      // Debris Turn-by-Turn Road Polylines (White Casing + Emerald Road Line)
      routeLayersRef.current.debrisCasing = L.polyline(debrisVehicle.route, {
        color: "#ffffff",
        weight: 8.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routeLayersRef.current.debrisRoute = L.polyline(debrisVehicle.route, {
        color: "#059669",
        weight: 5.5,
        opacity: 1.0,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Force recalculation of container size after mounting and center on debris vehicle route
      setTimeout(() => {
        if (!isMounted || !leafletMapRef.current) return;
        leafletMapRef.current.invalidateSize();
        highlightRoute("debris");
      }, 150);

      setTimeout(() => {
        if (!isMounted || !leafletMapRef.current) return;
        leafletMapRef.current.invalidateSize();
      }, 350);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [debrisVehicle.emoji, debrisVehicle.plate, debrisVehicle.coords, debrisVehicle.route, bookingData?.siteDimension, highlightRoute, jcbDetails.coords, jcbDetails.plate, jcbDetails.route]);

  const handleSelectVehicle = (vehicle: "jcb" | "debris") => {
    setActiveVehicle(vehicle);
    highlightRoute(vehicle);
  };

  const handleRecenter = () => {
    highlightRoute(activeVehicle);
  };

  return (
    <div className="relative flex-1 h-full min-h-[500px] w-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* 1. Full Screen Interactive Map Canvas */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 h-full w-full min-h-[500px]"
        style={{ minHeight: "100%", height: "100%", width: "100%" }}
      />

      {/* 2. Top Floating Navigation Header Bar (In Front of Map with z-index: 9999) */}
      <div
        className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Back to Home Button */}
        <button
          type="button"
          onClick={onBackToHome}
          className="pointer-events-auto flex items-center gap-1.5 rounded-2xl bg-white/95 text-slate-800 px-3.5 py-2 shadow-xl border border-slate-200 text-xs font-black hover:bg-white active:scale-95 transition cursor-pointer backdrop-blur-md"
        >
          <IconArrowLeft size={16} stroke={3} />
          <span>{isKn ? "ಮುಖಪುಟ" : "Home"}</span>
        </button>

        {/* Live GPS Active Badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-950/90 text-white px-3.5 py-2 shadow-xl border border-emerald-500/40 backdrop-blur-md pointer-events-auto">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
            {isKn ? "ಲೈವ್ ರಸ್ತೆ ಮಾರ್ಗ (ಜಿಪಿಎಸ್)" : "Live Turn-by-Turn Road Route"}
          </span>
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-2xl bg-white/95 text-slate-800 shadow-xl border border-slate-200 hover:bg-white active:scale-95 transition cursor-pointer backdrop-blur-md"
          title="Recenter Route"
        >
          <IconCurrentLocation size={18} stroke={2.5} className="text-[#0b3d91]" />
        </button>
      </div>

      {/* 3. Small On-Screen Vehicle Switcher Card (In Front of Map with z-index: 9999) */}
      <div
        className="absolute bottom-3 inset-x-3 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom-3 duration-300"
        style={{ zIndex: 9999 }}
      >
        <div className="rounded-3xl bg-slate-950/95 border-2 border-emerald-500/50 p-3.5 shadow-2xl backdrop-blur-md text-white space-y-3 ring-1 ring-white/10">
          
          {/* Header Row: Vehicle Selector Title & Booking ID */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isKn ? "ಬುಕ್ ಮಾಡಿದ ವಾಹನ ಆಯ್ಕೆಮಾಡಿ:" : "Select Booked Vehicle to Track:"}
            </span>
            <span className="font-mono text-[10px] text-amber-400 font-bold">
              #{bookingId}
            </span>
          </div>

          {/* Vehicle Selector Tabs: JCB and Debris Vehicle */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tab 1: JCB */}
            <button
              type="button"
              onClick={() => handleSelectVehicle("jcb")}
              className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                activeVehicle === "jcb"
                  ? "bg-amber-400/20 border-[#ffb400] ring-2 ring-[#ffb400]/50 shadow-md"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-2xl">🚜</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-white truncate">
                    {jcbDetails.shortName}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-amber-400">
                    22m
                  </span>
                </div>
                <span className="font-mono text-[9px] text-amber-300 block truncate font-bold">
                  {jcbDetails.plate}
                </span>
              </div>
            </button>

            {/* Tab 2: Debris Transport Vehicle (Tata 407 / Signa / Tractor) */}
            <button
              type="button"
              onClick={() => handleSelectVehicle("debris")}
              className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                activeVehicle === "debris"
                  ? "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-2xl">{debrisVehicle.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-white truncate">
                    {debrisVehicle.shortName}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-400">
                    {debrisVehicle.eta.split(" ")[0]}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-amber-300 block truncate font-bold">
                  {debrisVehicle.plate}
                </span>
              </div>
            </button>
          </div>

          {/* Active Vehicle Live Telematics Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Yellow Commercial Number Plate */}
                <div className="inline-flex items-center gap-1 bg-[#ffb400] text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded border border-slate-900 shadow-sm shrink-0">
                  <span className="text-[8px] bg-slate-950 text-white px-1 py-0.1 rounded font-sans leading-none">
                    IND
                  </span>
                  <span>{currentVehicleData.plate}</span>
                </div>
                <h4 className="font-black text-xs text-white truncate">
                  {currentVehicleData.name}
                </h4>
              </div>

              {/* ETA Pill */}
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 shrink-0">
                ⏱️ {currentVehicleData.eta} ({currentVehicleData.distance})
              </span>
            </div>

            {/* Turn-by-Turn Road Path Navigation Banner (Google Maps Style) */}
            <div className="rounded-xl bg-blue-950/70 border border-blue-500/40 p-2 flex items-center gap-2.5 text-[11px]">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow">
                <IconRoute size={16} stroke={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-blue-300 font-bold block truncate">
                  {isKn ? currentVehicleData.roadDescKn : currentVehicleData.roadDesc}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  ⚡ {isKn ? "ವೇಗ:" : "Speed:"} {currentVehicleData.speed} • {isKn ? "ರಸ್ತೆಯಲ್ಲಿ ತಿರುವು-ತಿರುವಾಗಿ ಸಂಚರಿಸುತ್ತಿದೆ" : "Following exact turn-by-turn road curves"}
                </span>
              </div>
            </div>

            {/* Driver & Call Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                  <img
                    src={currentVehicleData.image}
                    alt={currentVehicleData.driverName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-black text-white text-[11px] block leading-tight">
                    {currentVehicleData.driverName}
                    {"bata" in currentVehicleData && (
                      <span className="ml-1 text-[10px] text-amber-400 font-bold">
                        (Bata: ₹{currentVehicleData.bata})
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-semibold block">
                    ✓ {isKn ? "ಪರಿಶೀಲಿಸಿದ ಚಾಲಕ" : "Verified Driver"}
                  </span>
                </div>
              </div>

              {/* Call Driver Action */}
              {currentVehicleData.driverPhone ? (
                <a
                  href={`tel:${currentVehicleData.driverPhone}`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-black shadow-md transition active:scale-95"
                >
                  <IconPhone size={13} stroke={2.5} />
                  <span>{isKn ? "ಕರೆ ಮಾಡಿ" : "Call Driver"}</span>
                </a>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ✓ {isKn ? "ಲೈವ್ ಸಂಪರ್ಕ" : "Connected"}
                </span>
              )}
            </div>
          </div>

          {/* Quick Tip on Interactivity */}
          <p className="text-[9px] text-center text-slate-400">
            {isKn
              ? "💡 ನಕ್ಷೆಯಲ್ಲಿ ರಸ್ತೆಯ ತಿರುವುಗಳು ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಮಾದರಿಯಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸುತ್ತವೆ"
              : "💡 Road route snaps turn-by-turn along streets & roads (Google Maps style)"}
          </p>
        </div>
      </div>
    </div>
  );
}
