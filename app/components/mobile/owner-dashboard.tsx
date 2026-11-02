import {
  IconActivity,
  IconAlertCircle,
  IconArrowRight,
  IconAward,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconCompass,
  IconCurrentLocation,
  IconCurrencyRupee,
  IconFileCheck,
  IconFileDescription,
  IconGasStation,
  IconLayersSubtract,
  IconMapPin,
  IconPhone,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconSteeringWheel,
  IconTrash,
  IconTruck,
  IconUpload,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AuthUser } from "@/components/auth/login-screen";
import type { AppTranslations, SupportedLanguage } from "@/lib/translations";
import { playNotificationSound } from "@/components/notifications/notification-center";
import { LiveCameraModal } from "@/components/booking/live-camera-modal";
import {
  uploadCloudPhoto,
  saveVehicleToOnlineDb,
  fetchVehiclesFromOnlineDb,
} from "@/lib/supabase";

interface OwnerDashboardProps {
  user: AuthUser;
  selectedLanguage: SupportedLanguage;
  t: AppTranslations;
  onLogout: () => void;
}

type OwnerTab = "live_work" | "working_jcbs" | "new_vehicle";

export interface WorkingJcbItem {
  id: string;
  plate: string;
  name: string;
  type: string;
  status: "working" | "en_route" | "idle";
  operatorName: string;
  operatorPhone: string;
  hoursToday: number;
  fuelPct: number;
  ratePerHour: number;
  driverBata: number;
  minPayment: number;
  driverExperienceYears: number;
  insuranceEndDate: string;
  insuranceDocName?: string;
  insuranceDocUrl?: string;
  vehicleImages: string[];
  lat: number;
  lng: number;
  locationDesc: string;
  locationDescKn: string;
}

// Initial fleet starts 100% empty - populated strictly from Supabase cloud database
const INITIAL_FLEET: WorkingJcbItem[] = [];

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

export function OwnerDashboard({
  user,
  selectedLanguage,
  t,
  onLogout,
}: OwnerDashboardProps) {
  const isKn = selectedLanguage === "kn";

  // Tab State: "live_work" | "working_jcbs" | "new_vehicle"
  const [activeTab, setActiveTab] = useState<OwnerTab>("live_work");
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  // Fleet state
  const [fleet, setFleet] = useState<WorkingJcbItem[]>(INITIAL_FLEET);

  // Fetch registered vehicles live from online Supabase cloud database
  useEffect(() => {
    fetchVehiclesFromOnlineDb().then((vehicles) => {
      if (vehicles && vehicles.length > 0) {
        const mapped: WorkingJcbItem[] = vehicles.map((v) => ({
          id: v.id,
          plate: v.plate_number,
          name: v.vehicle_type,
          type: v.category,
          status: v.status || "idle",
          operatorName: v.operator_name,
          operatorPhone: v.operator_phone,
          hoursToday: 0,
          fuelPct: 100,
          ratePerHour: Number(v.rate_per_hour),
          driverBata: Number(v.driver_bata),
          minPayment: Number(v.min_payment),
          driverExperienceYears: Number(v.driver_experience_years),
          insuranceEndDate: v.insurance_end_date,
          insuranceDocUrl: v.insurance_doc_url,
          vehicleImages: v.vehicle_images || [],
          lat: v.current_lat || 13.3151,
          lng: v.current_lng || 77.1338,
          locationDesc: "Tumakuru Hub (Live Online)",
          locationDescKn: "ತುಮಕೂರು ಕೇಂದ್ರ (ಲೈವ್ ಆನ್‌ಲೈನ್)",
        }));
        setFleet((prev) => {
          const onlinePlates = new Set(mapped.map((m) => m.plate));
          const filteredInit = prev.filter((p) => !onlinePlates.has(p.plate));
          return [...mapped, ...filteredInit];
        });
      }
    });
  }, []);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
  const [mapReady, setMapReady] = useState(false);

  // Tab 1: Live Work Status States
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(8078); // 2h 14m 38s
  const [workCompleted, setWorkCompleted] = useState(false);

  // Tab 3: New Vehicle Registration Form State
  const [regForm, setRegForm] = useState({
    plateNumber: "",
    vehicleType: "JCB 3DX Super EcoX",
    category: "Backhoe Loader",
    operatorName: "",
    operatorPhone: "",
    ratePerHour: "950",
    modelYear: "2024",
    driverBata: "200",
    minPayment: "0", // Allow 0!
    driverExperienceYears: "5",
    insuranceEndDate: "2027-05-30",
    hasBreaker: false,
    hasBucket: true,
    hasTipperAttachment: false,
  });

  // Insurance File Upload state (photo of hardcopy or file from hard disk)
  const [insuranceFile, setInsuranceFile] = useState<{
    name: string;
    size: string;
    previewUrl?: string;
    isImage: boolean;
  } | null>(null);

  // Vehicle Images state (multiple photos from disk or camera)
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Hidden File Inputs & Live Camera Refs
  const insuranceFileInputRef = useRef<HTMLInputElement>(null);
  const insuranceCameraFallbackRef = useRef<HTMLInputElement>(null);
  const vehiclePhotosInputRef = useRef<HTMLInputElement>(null);
  const vehicleCameraFallbackRef = useRef<HTMLInputElement>(null);

  // Live in-app camera viewfinder state
  const [cameraTarget, setCameraTarget] = useState<"insurance" | "vehicle" | null>(null);

  // Live Timer increment
  useEffect(() => {
    if (!timerRunning || workCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, workCompleted]);

  // Format timer into HH:MM:SS
  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Re-size leaflet map when returning to map-based tabs
  useEffect(() => {
    if (activeTab !== "new_vehicle" && leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 100);
    }
  }, [activeTab]);

  // Initialize Leaflet Live Map as Background (Only initialized for live_work and working_jcbs)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      loadStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "leaflet-css");
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "leaflet-js");

      if (!isMounted || !mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      // Defensive cleanup
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Center map around Tumakuru / Kyatasandra active sites
      const map = L.map(mapContainerRef.current, {
        center: [13.3128, 77.132],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      leafletMapRef.current = map;

      // Base tile layer
      const streetLayer = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }
      );
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );

      if (mapStyle === "satellite") {
        satelliteLayer.addTo(map);
      } else {
        streetLayer.addTo(map);
      }

      // Render Fleet Markers if any registered
      fleet.forEach((item) => {
        const isWorking = item.status === "working";
        const isEnRoute = item.status === "en_route";
        const badgeColor = isWorking ? "#10b981" : isEnRoute ? "#f59e0b" : "#64748b";
        const statusText = isWorking ? "LIVE WORKING" : isEnRoute ? "EN ROUTE" : "STANDBY";

        const jcbIcon = L.divIcon({
          className: `owner-jcb-pin-${item.id}`,
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              ${isWorking ? `<div style="position: absolute; top: -6px; width: 44px; height: 44px; background: rgba(245, 158, 11, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
              <div style="background: #ffb400; color: #111827; border: 2.5px solid #0f172a; padding: 4px 8px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 5px; font-weight: 900; font-size: 11px; white-space: nowrap; z-index: 20;">
                <span style="font-size: 14px;">🚜</span>
                <span>${item.plate}</span>
                <span style="background: ${badgeColor}; color: white; padding: 1px 5px; border-radius: 6px; font-size: 9px; font-weight: 900;">${statusText}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #ffb400; margin-top: -1px;"></div>
            </div>
          `,
          iconSize: [180, 42],
          iconAnchor: [90, 38],
        });

        const marker = L.marker([item.lat, item.lng], { icon: jcbIcon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <b>${item.name}</b> (${item.plate})<br/>
            <b>Driver:</b> ${item.operatorName} (${item.operatorPhone})<br/>
            <b>Rate:</b> ₹${item.ratePerHour}/hr • <b>Bata:</b> ₹${item.driverBata}<br/>
            <b>Experience:</b> ${item.driverExperienceYears} yrs<br/>
            <b>Status:</b> ${statusText}
          </div>`
        );

        markersRef.current[item.id] = marker;
      });

      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [fleet, mapStyle]);

  // Center on machine when owner clicks "Track on Map"
  const handleFocusMachine = useCallback((item: WorkingJcbItem) => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([item.lat, item.lng], 16, { duration: 1.2 });
    const marker = markersRef.current[item.id];
    if (marker) {
      setTimeout(() => marker.openPopup(), 1200);
    }
  }, []);

  // Recenter map to fit all fleet
  const handleRecenterFleet = useCallback(() => {
    if (!leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    const coords = fleet.map((f) => [f.lat, f.lng] as [number, number]);
    coords.push([13.3142, 77.1325]); // include customer site
    leafletMapRef.current.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
  }, [fleet]);

  // Handle Insurance Document Upload (hardcopy photo or file from disk)
  const handleInsuranceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const preview = isImg ? URL.createObjectURL(file) : undefined;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

    setInsuranceFile({
      name: file.name,
      size: `${sizeMb} MB`,
      previewUrl: preview,
      isImage: isImg,
    });
  };

  // Handle Vehicle Photos Upload (Uploads directly to Supabase cloud storage bucket)
  const handleVehiclePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const uploadPromises = files.map((f) => uploadCloudPhoto(f, "vehicle-photos"));
      const urls = await Promise.all(uploadPromises);
      setVehiclePhotos((prev) => [...prev, ...urls]);
    } catch {
      const urls = files.map((f) => URL.createObjectURL(f));
      setVehiclePhotos((prev) => [...prev, ...urls]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setVehiclePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Tab 3: Handle New Vehicle Registration Submit
  const handleRegisterNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.plateNumber.trim() || !regForm.operatorName.trim()) {
      alert(
        isKn
          ? "ದಯವಿಟ್ಟು ವಾಹನ ಸಂಖ್ಯೆ ಮತ್ತು ಆಪರೇಟರ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ."
          : "Please enter Vehicle Plate Number and Operator Name."
      );
      return;
    }

    const newJcb: WorkingJcbItem = {
      id: `jcb-${Date.now()}`,
      plate: regForm.plateNumber.trim().toUpperCase(),
      name: regForm.vehicleType,
      type: `${regForm.category} (${regForm.modelYear})`,
      status: "idle",
      operatorName: regForm.operatorName.trim(),
      operatorPhone: regForm.operatorPhone.trim(),
      hoursToday: 0,
      fuelPct: 100,
      ratePerHour: Number(regForm.ratePerHour) || 950,
      driverBata: Number(regForm.driverBata) || 0,
      minPayment: Number(regForm.minPayment) || 0, // Allows 0!
      driverExperienceYears: Number(regForm.driverExperienceYears) || 0,
      insuranceEndDate: regForm.insuranceEndDate || "2027-12-31",
      insuranceDocName: insuranceFile?.name,
      insuranceDocUrl: insuranceFile?.previewUrl,
      vehicleImages: vehiclePhotos.length > 0 ? vehiclePhotos : [
        "https://images.unsplash.com/photo-1579294800821-69fc850844bc?auto=format&fit=crop&w=500&q=80",
      ],
      lat: 13.3115 + (Math.random() - 0.5) * 0.008,
      lng: 77.1305 + (Math.random() - 0.5) * 0.008,
      locationDesc: "Tumakuru Hub (Registered & Ready)",
      locationDescKn: "ತುಮಕೂರು ಕೇಂದ್ರ (ನೋಂದಾಯಿಸಲಾಗಿದೆ)",
    };

    setFleet((prev) => [newJcb, ...prev]);

    // Save vehicle 100% online in Supabase cloud database
    saveVehicleToOnlineDb({
      plateNumber: newJcb.plate,
      vehicleType: newJcb.name,
      category: regForm.category,
      operatorName: newJcb.operatorName,
      operatorPhone: newJcb.operatorPhone,
      ratePerHour: newJcb.ratePerHour,
      driverBata: newJcb.driverBata,
      minPayment: newJcb.minPayment,
      driverExperienceYears: newJcb.driverExperienceYears,
      insuranceEndDate: newJcb.insuranceEndDate,
      insuranceDocUrl: newJcb.insuranceDocUrl,
      vehicleImages: newJcb.vehicleImages,
      currentLat: newJcb.lat,
      currentLng: newJcb.lng,
    }).catch((err) => console.error("Cloud vehicle save error:", err));

    playNotificationSound();

    // Trigger in-app notification bell event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("digmitra:notification", {
          detail: {
            id: `notif-${Date.now()}`,
            type: "general",
            title: isKn ? "🎉 ಹೊಸ ವಾಹನ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ!" : "🎉 New Vehicle Registered Successfully!",
            titleKn: "🎉 ಹೊಸ ವಾಹನ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ!",
            message: `${newJcb.name} (${newJcb.plate}) is registered with Bata ₹${newJcb.driverBata} & Min Adv ₹${newJcb.minPayment}. Now live on map!`,
            messageKn: `${newJcb.name} (${newJcb.plate}) ಈಗ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಣಿಯಾಗಿದ್ದು ನಕ್ಷೆಯಲ್ಲಿ ಸಕ್ರಿಯಗೊಂಡಿದೆ.`,
            timestamp: "Just now",
            read: false,
            iconEmoji: "🚜",
            accentColor: "emerald",
          },
        })
      );
    }

    setRegSuccessMessage(
      isKn
        ? `ವಾಹನ ${newJcb.plate} ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಣಿಯಾಗಿದೆ ಮತ್ತು ನಕ್ಷೆಯಲ್ಲಿ ಸಕ್ರಿಯಗೊಂಡಿದೆ!`
        : `Vehicle ${newJcb.plate} registered successfully and activated on the live map!`
    );

    // Reset Form
    setRegForm({
      plateNumber: "",
      vehicleType: "JCB 3DX Super EcoX",
      category: "Backhoe Loader",
      operatorName: "",
      operatorPhone: "",
      ratePerHour: "950",
      modelYear: "2024",
      driverBata: "200",
      minPayment: "0",
      driverExperienceYears: "5",
      insuranceEndDate: "2027-05-30",
      hasBreaker: false,
      hasBucket: true,
      hasTipperAttachment: false,
    });
    setInsuranceFile(null);
    setVehiclePhotos([]);

    // Auto-switch back to "working_jcbs" (which brings back the live map)
    setTimeout(() => {
      setRegSuccessMessage(null);
      setActiveTab("working_jcbs");
      setIsSheetExpanded(true);
    }, 1800);
  };

  // Live bill calculation for current active job
  const liveHours = timerSeconds / 3600;
  const liveEarnings = Math.round(liveHours * 950);
  const liveDieselUsed = (liveHours * 4.4).toFixed(1);

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden flex flex-col select-none bg-slate-100">
      {/* ========================================================================= */}
      {/* 1. LIVE MAP BACKGROUND (Hidden ONLY in "new_vehicle" tab)                   */}
      {/* ========================================================================= */}
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 w-full h-full z-0 bg-slate-200 transition-opacity duration-300 ${
          activeTab === "new_vehicle" ? "invisible pointer-events-none opacity-0" : "visible opacity-100"
        }`}
        style={{ minHeight: "100%" }}
      />

      {/* Floating Map Controls & Badges (Only shown when map is active) */}
      {activeTab !== "new_vehicle" && (
        <div className="relative z-10 p-3 flex items-center justify-between pointer-events-none">
          {/* Fleet Overview Pill */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 text-xs font-black text-slate-800 shadow-lg backdrop-blur-md border border-slate-200/80">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#0b3d91] font-black">
              🚜 {fleet.length} {isKn ? "JCB ವಾಹನಗಳು" : "JCBs in Fleet"}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-bold">
              1 {isKn ? "ಕೆಲಸದಲ್ಲಿದೆ" : "Working"}
            </span>
          </div>

          {/* Map Quick Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMapStyle(mapStyle === "street" ? "satellite" : "street")}
              className="flex size-9 items-center justify-center rounded-2xl bg-white/95 text-slate-700 shadow-md backdrop-blur-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition"
              title={mapStyle === "street" ? "Switch to Satellite" : "Switch to Street Map"}
            >
              <IconLayersSubtract size={18} />
            </button>
            <button
              type="button"
              onClick={handleRecenterFleet}
              className="flex size-9 items-center justify-center rounded-2xl bg-[#0b3d91] text-white shadow-md active:scale-95 transition hover:bg-[#082d6e]"
              title={isKn ? "ಎಲ್ಲಾ ವಾಹನಗಳನ್ನು ಕೇಂದ್ರೀಕರಿಸಿ" : "Recenter All JCBs"}
            >
              <IconCurrentLocation size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED FULL-PAGE VIEW FOR "NEW VEHICLE REGISTRATION"                */}
      {/* (NO MAP BACKGROUND IN THIS TAB - Clean, focused white/slate form)          */}
      {/* ========================================================================= */}
      {activeTab === "new_vehicle" ? (
        <div className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-50 via-white to-slate-100 p-3.5 pb-24 space-y-4">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#0b3d91] via-[#1048a8] to-[#0b3d91] p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ffb400] text-slate-950 font-black shadow-md">
                  <IconSteeringWheel size={24} stroke={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight leading-tight">
                    {isKn ? "ಹೊಸ ವಾಹನ ನೋಂದಣಿ" : "New Vehicle Registration"}
                  </h2>
                  <p className="text-[11px] text-white/80 font-medium">
                    {isKn
                      ? "ನಿಮ್ಮ ಫ್ಲೀಟ್‌ಗೆ JCB, ಹಿಟಾಚಿ ಅಥವಾ ಟಿಪ್ಪರ್ ಸೇರಿಸಿ"
                      : "Add JCB, Excavator, or Tipper to your active fleet"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-[10px] font-mono font-black text-emerald-300">
                VAHAN SYNC
              </span>
            </div>
          </div>

          {regSuccessMessage && (
            <div className="rounded-2xl bg-emerald-600 p-3 text-center text-xs font-black text-white shadow-md animate-pulse">
              {regSuccessMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegisterNewVehicle} className="space-y-4">
            {/* SECTION 1: Machine & Model Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs">
                  🚜
                </span>
                <h3 className="text-xs font-black text-slate-900">
                  {isKn ? "೧. ಯಂತ್ರ ಮತ್ತು ಮಾದರಿ ವಿವರ" : "1. Machine & Model Details"}
                </h3>
              </div>

              {/* Machine Model Selection */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  {isKn ? "ಯಂತ್ರದ ಮಾದರಿ" : "Machine Model"}
                </label>
                <select
                  value={regForm.vehicleType}
                  onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0b3d91] focus:ring-1 focus:ring-[#0b3d91]"
                >
                  <option value="JCB 3DX Super EcoX">JCB 3DX Super EcoX (Backhoe Loader)</option>
                  <option value="JCB 4DX Heavy Duty">JCB 4DX Heavy Duty (Reinforced Boom)</option>
                  <option value="Mini Excavator (3 Ton)">Mini Excavator (3 Ton - Zero Tail Swing)</option>
                  <option value="Tractor Tipper (2.5 Ton)">Tractor & Tipper Dumper</option>
                  <option value="Tata Signa 6W Heavy Tipper">Tata Signa 6W Heavy Tipper (8 Ton)</option>
                </select>
              </div>

              {/* Plate Number & Model Year */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ನಂಬರ್ ಪ್ಲೇಟ್" : "Registration Plate"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-06-EA-8899"
                    value={regForm.plateNumber}
                    onChange={(e) => setRegForm({ ...regForm, plateNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 font-mono text-xs font-black text-slate-900 uppercase focus:bg-white focus:border-[#0b3d91] focus:ring-1 focus:ring-[#0b3d91]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ತಯಾರಿಕಾ ವರ್ಷ" : "Model Year"}
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    value={regForm.modelYear}
                    onChange={(e) => setRegForm({ ...regForm, modelYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0b3d91] focus:ring-1 focus:ring-[#0b3d91]"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">
                  {isKn ? "ಲಭ್ಯವಿರುವ ಸಲಕರಣೆಗಳು" : "Equipped Attachments"}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 cursor-pointer font-bold text-slate-700 hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={regForm.hasBucket}
                      onChange={(e) => setRegForm({ ...regForm, hasBucket: e.target.checked })}
                      className="size-4 rounded text-[#0b3d91]"
                    />
                    <span>Standard Shovel</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 cursor-pointer font-bold text-slate-700 hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={regForm.hasBreaker}
                      onChange={(e) => setRegForm({ ...regForm, hasBreaker: e.target.checked })}
                      className="size-4 rounded text-[#0b3d91]"
                    />
                    <span>Rock Breaker</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: Pricing, Driver Bata & Minimum Payment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ₹
                </span>
                <h3 className="text-xs font-black text-slate-900">
                  {isKn ? "೨. ಬಾಡಿಗೆ ದರ, ಡ್ರೈವರ್ ಬಟಾ & ಮುಂಗಡ ಪಾವತಿ" : "2. Pricing, Driver Bata & Advance"}
                </h3>
              </div>

              {/* Hourly Rate & Driver Bata */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ಗಂಟೆಯ ಬಾಡಿಗೆ (₹/ಗಂಟೆಗೆ)" : "Hourly Rate (₹/hr)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      value={regForm.ratePerHour}
                      onChange={(e) => setRegForm({ ...regForm, ratePerHour: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2.5 pl-7 pr-3 text-xs font-black text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                    />
                  </div>
                </div>

                {/* Driver Bata */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ಡ್ರೈವರ್ ಬಟಾ (ದೈನಂದಿನ)" : "Driver Bata (Daily)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 200"
                      value={regForm.driverBata}
                      onChange={(e) => setRegForm({ ...regForm, driverBata: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2.5 pl-7 pr-3 text-xs font-black text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Payment (Allow user to set ZERO also) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-700">
                    {isKn ? "ಕನಿಷ್ಠ ಮುಂಗಡ ಪಾವತಿ (₹)" : "Minimum Advance Payment (₹)"}
                  </label>
                  {Number(regForm.minPayment) === 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                      {isKn ? "✓ ಶೂನ್ಯ ಮುಂಗಡ (ಉಚಿತ ಬುಕಿಂಗ್)" : "✓ Zero Advance Allowed"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={regForm.minPayment}
                    onChange={(e) => setRegForm({ ...regForm, minPayment: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2.5 pl-7 pr-3 text-xs font-black text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                  />
                </div>
                {/* Quick preset chips for Minimum Payment */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, minPayment: "0" })}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                      regForm.minPayment === "0"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ₹0 (No Advance)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, minPayment: "500" })}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                      regForm.minPayment === "500"
                        ? "bg-[#0b3d91] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, minPayment: "1000" })}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                      regForm.minPayment === "1000"
                        ? "bg-[#0b3d91] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, minPayment: "2000" })}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                      regForm.minPayment === "2000"
                        ? "bg-[#0b3d91] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ₹2,000
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Vehicle Insurance & Legal Documents */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-blue-100 text-[#0b3d91] text-xs">
                  <IconFileCheck size={15} />
                </span>
                <h3 className="text-xs font-black text-slate-900">
                  {isKn ? "೩. ವಾಹನ ವಿಮೆ & ದಾಖಲೆಗಳು" : "3. Insurance Policy & Documents"}
                </h3>
              </div>

              {/* Insurance Policy End Date */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  {isKn ? "ವಿಮಾ ಪಾಲಿಸಿ ಮುಕ್ತಾಯ ದಿನಾಂಕ" : "Insurance Policy End Date"}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={regForm.insuranceEndDate}
                    onChange={(e) => setRegForm({ ...regForm, insuranceEndDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 font-medium">
                  {isKn ? "ಕ್ಯಾಲೆಂಡರ್‌ನಿಂದ ಮುಕ್ತಾಯ ದಿನಾಂಕವನ್ನು ಆರಿಸಿ" : "Pick expiry date from calendar"}
                </p>
              </div>

              {/* Vehicle Insurance Photo Copy Upload (Hardcopy Photo or File from Disk) */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">
                  {isKn ? "ವಿಮೆ ಪತ್ರದ ಫೋಟೋ / ಪ್ರತಿ ಅಪ್‌ಲೋಡ್" : "Insurance Document / Photo Copy"}
                </label>

                {/* Hidden File Input for Insurance */}
                <input
                  type="file"
                  ref={insuranceFileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleInsuranceFileChange}
                  className="hidden"
                />

                {/* Hidden Native Camera Direct Fallback Input */}
                <input
                  type="file"
                  ref={insuranceCameraFallbackRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleInsuranceFileChange}
                  className="hidden"
                />

                {insuranceFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {insuranceFile.isImage && insuranceFile.previewUrl ? (
                        <img
                          src={insuranceFile.previewUrl}
                          alt="Insurance Preview"
                          className="size-10 rounded-lg object-cover border border-emerald-400"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs font-black">
                          PDF
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-slate-900">
                          {insuranceFile.name}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-700">
                          ✓ {insuranceFile.size} • Verified Attached
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInsuranceFile(null)}
                      className="rounded-lg bg-white p-1 text-red-500 hover:bg-red-50 border border-slate-200 cursor-pointer"
                      title="Remove File"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCameraTarget("insurance")}
                      className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#0b3d91]/50 bg-blue-50/70 py-2.5 px-2 text-xs font-black text-[#0b3d91] hover:bg-blue-100 active:scale-95 transition shadow-xs cursor-pointer"
                    >
                      <IconCamera size={17} className="text-[#0b3d91] animate-pulse" />
                      <span>{isKn ? "ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ" : "Take Photo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insuranceFileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                    >
                      <IconUpload size={16} className="text-[#0b3d91]" />
                      <span>{isKn ? "ಫೈಲ್ ಆರಿಸಿ (ಡಿಸ್ಕ್)" : "Import from Disk"}</span>
                    </button>
                  </div>
                )}
                <p className="mt-1 text-[10px] text-slate-500 font-medium">
                  {isKn
                    ? "ವಿಮೆ ಹಾರ್ಡ್ ಕಾಪಿಯ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಿಂದ PDF / ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"
                    : "Upload photo of hard copy or import PDF/JPG from hard disk"}
                </p>
              </div>
            </div>

            {/* SECTION 4: Vehicle Images (Multi-Photo Gallery) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-purple-100 text-purple-800 text-xs">
                    <IconPhoto size={15} />
                  </span>
                  <h3 className="text-xs font-black text-slate-900">
                    {isKn ? "೪. ವಾಹನದ ಚಿತ್ರಗಳು" : "4. Vehicle Images"}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {vehiclePhotos.length} {isKn ? "ಚಿತ್ರಗಳು" : "photos"}
                </span>
              </div>

              {/* Hidden File Input for Vehicle Photos */}
              <input
                type="file"
                ref={vehiclePhotosInputRef}
                accept="image/*"
                multiple
                onChange={handleVehiclePhotosChange}
                className="hidden"
              />

              {/* Uploaded Gallery Grid */}
              {vehiclePhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {vehiclePhotos.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
                      <img src={url} alt={`Vehicle ${idx + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden Native Camera Fallback for Vehicle Photos */}
              <input
                type="file"
                ref={vehicleCameraFallbackRef}
                accept="image/*"
                capture="environment"
                onChange={handleVehiclePhotosChange}
                className="hidden"
              />

              {/* Upload Trigger Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCameraTarget("vehicle")}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-purple-400 bg-purple-50/70 py-2.5 px-2 text-xs font-black text-purple-700 hover:bg-purple-100 active:scale-95 transition shadow-xs cursor-pointer"
                >
                  <IconCamera size={17} className="text-purple-600 animate-pulse" />
                  <span>{isKn ? "ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ" : "Snap Photo"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => vehiclePhotosInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                >
                  <IconPhoto size={16} className="text-purple-600" />
                  <span>{isKn ? "ಡಿಸ್ಕ್‌ನಿಂದ ಫೋಟೋಗಳು" : "Upload from Disk"}</span>
                </button>
              </div>
            </div>

            {/* SECTION 5: Driver & Operator Profile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs">
                  👷
                </span>
                <h3 className="text-xs font-black text-slate-900">
                  {isKn ? "೫. ಚಾಲಕರ ವಿವರ & ಅನುಭವ" : "5. Driver Profile & Experience"}
                </h3>
              </div>

              {/* Driver Name & Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ಚಾಲಕರ ಹೆಸರು" : "Driver Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isKn ? "ಚಾಲಕರ ಪೂರ್ಣ ಹೆಸರು" : "Driver Full Name"}
                    value={regForm.operatorName}
                    onChange={(e) => setRegForm({ ...regForm, operatorName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "Driver Mobile"}
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={regForm.operatorPhone}
                    onChange={(e) => setRegForm({ ...regForm, operatorPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                  />
                </div>
              </div>

              {/* Driver Experience in Years */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  {isKn ? "ಚಾಲಕರ ಅನುಭವ (ವರ್ಷಗಳಲ್ಲಿ)" : "Driver Experience (in Years)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    placeholder="e.g. 5"
                    value={regForm.driverExperienceYears}
                    onChange={(e) => setRegForm({ ...regForm, driverExperienceYears: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 p-2.5 text-xs font-black text-slate-900 focus:bg-white focus:border-[#0b3d91]"
                  />
                </div>
                {/* Experience quick chips */}
                <div className="mt-2 flex items-center gap-1.5">
                  {["1", "3", "5", "8", "10+"].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, driverExperienceYears: exp.replace("+", "") })}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                        regForm.driverExperienceYears === exp.replace("+", "")
                          ? "bg-[#0b3d91] text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {exp} {isKn ? "ವರ್ಷ" : "Yrs"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffb400] to-amber-500 py-3.5 text-xs font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-400 transition active:scale-95"
            >
              <IconCheck size={18} stroke={3} />
              <span>{isKn ? "ವಾಹನ ನೋಂದಾಯಿಸಿ & ನಕ್ಷೆಯಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ" : "Register Vehicle & Activate on Map"}</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Spacer to push floating drawer to bottom over the live map */}
          <div className="flex-1 pointer-events-none" />

          {/* ========================================================================= */}
          {/* 3. INTERACTIVE FLOATING DRAWER (For Tab 1 & Tab 2 Over Live Map)          */}
          {/* ========================================================================= */}
          <div
            className={`relative z-20 flex flex-col transition-all duration-300 pointer-events-auto px-2.5 pb-2 ${
              isSheetExpanded ? "max-h-[62vh]" : "max-h-[72px]"
            }`}
          >
            <div className="flex flex-col rounded-3xl bg-white/98 shadow-[0_-10px_35px_rgba(0,0,0,0.22)] backdrop-blur-md border border-slate-200/90 overflow-hidden">
              {/* Sheet Drag / Collapse Bar */}
              <button
                type="button"
                onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                className="flex w-full items-center justify-between px-4 pt-2.5 pb-1.5 hover:bg-slate-50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black tracking-tight text-slate-800">
                    {activeTab === "live_work"
                      ? isKn
                        ? "ಲೈವ್ ಕೆಲಸದ ಸ್ಥಿತಿ"
                        : "Live Work Status"
                      : isKn
                        ? "ಕಾರ್ಯನಿರತ JCB ಗಳ ಪಟ್ಟಿ"
                        : "Working JCB Fleet"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <span>{isSheetExpanded ? (isKn ? "ನಕ್ಷೆ ನೋಡಿ" : "Hide Details") : isKn ? "ವಿವರ ನೋಡಿ" : "Expand Details"}</span>
                  {isSheetExpanded ? <IconChevronDown size={15} /> : <IconChevronUp size={15} />}
                </div>
              </button>

              {/* Scrollable Sheet Content */}
              {isSheetExpanded && (
                <div className="overflow-y-auto max-h-[50vh] p-3.5 space-y-3.5 overscroll-contain">
                  {/* ----------------------------------------------------------------- */}
                  {/* TAB 1: LIVE WORK STATUS                                           */}
                  {/* ----------------------------------------------------------------- */}
                  {activeTab === "live_work" && (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-2xl shadow-xs">
                          <IconClock size={28} />
                        </div>
                        <h4 className="text-sm font-black text-slate-800">
                          {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಕೆಲಸ ನಡೆಯುತ್ತಿಲ್ಲ" : "No Active Work in Progress"}
                        </h4>
                        <p className="max-w-xs text-xs text-slate-500 font-medium leading-relaxed">
                          {isKn
                            ? "ಗ್ರಾಹಕರು ನಿಮ್ಮ ಜೆಸಿಬಿಯನ್ನು ಬುಕ್ ಮಾಡಿದಾಗ ನೈಜ ಸಮಯದ ಡಿಜಿಟಲ್ ಗಂಟೆ ಮೀಟರ್ ಮತ್ತು ಕೆಲಸದ ಮಾಹಿತಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ."
                            : "When a customer books one of your machines, live digital hour meter and site info will display here automatically."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ----------------------------------------------------------------- */}
                  {/* TAB 2: WORKING JCB'S                                              */}
                  {/* ----------------------------------------------------------------- */}
                  {activeTab === "working_jcbs" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-800">
                          {isKn ? `ಒಟ್ಟು ವಾಹನಗಳು (${fleet.length})` : `Total Fleet Machines (${fleet.length})`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("new_vehicle");
                          }}
                          className="flex items-center gap-1 rounded-xl bg-[#0b3d91] px-2.5 py-1 text-[11px] font-black text-white shadow-xs hover:bg-[#082d6e] transition cursor-pointer"
                        >
                          <IconPlus size={13} />
                          <span>{isKn ? "ಹೊಸ ವಾಹನ ಸೇರಿಸಿ" : "+ Register JCB"}</span>
                        </button>
                      </div>

                      {/* Fleet List */}
                      {fleet.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0b3d91] text-2xl shadow-xs">
                            🚜
                          </div>
                          <h4 className="text-sm font-black text-slate-800">
                            {isKn ? "ಯಾವುದೇ ವಾಹನಗಳು ನೋಂದಣಿಯಾಗಿಲ್ಲ" : "No Vehicles in Fleet"}
                          </h4>
                          <p className="max-w-xs text-xs text-slate-500 font-medium leading-relaxed">
                            {isKn
                              ? "ನಿಮ್ಮ ಮೊದಲ ಜೆಸಿಬಿ ಅಥವಾ ಟಿಪ್ಪರ್ ಅನ್ನು ನೋಂದಾಯಿಸಿ ಲೈವ್ ನಕ್ಷೆಯಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ."
                              : "Register your first JCB, Excavator, or Tipper to activate it on the live customer map."}
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("new_vehicle")}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#0b3d91] hover:bg-blue-900 text-white px-4 py-2.5 text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
                          >
                            <IconPlus size={16} />
                            <span>{isKn ? "ಹೊಸ ವಾಹನ ಸೇರಿಸಿ" : "Register Vehicle"}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {fleet.map((item) => {
                          const isWorking = item.status === "working";
                          const isEnRoute = item.status === "en_route";
                          return (
                            <div
                              key={item.id}
                              className={`rounded-2xl border p-3 transition shadow-xs ${
                                isWorking
                                  ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/50"
                                  : isEnRoute
                                    ? "bg-blue-50/70 border-blue-200"
                                    : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {item.vehicleImages?.[0] ? (
                                    <img
                                      src={item.vehicleImages[0]}
                                      alt={item.name}
                                      className="size-10 rounded-xl object-cover border border-amber-300 shadow-xs"
                                    />
                                  ) : (
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#ffb400] text-slate-950 font-black shadow-xs text-base">
                                      🚜
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                                      {item.name}
                                    </h4>
                                    <p className="font-mono text-[11px] font-black text-slate-700">
                                      {item.plate}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                    isWorking
                                      ? "bg-emerald-600 text-white"
                                      : isEnRoute
                                        ? "bg-amber-500 text-slate-950"
                                        : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isWorking
                                    ? isKn
                                      ? "ಕೆಲಸದಲ್ಲಿದೆ"
                                      : "Working Live"
                                    : isEnRoute
                                      ? isKn
                                        ? "ಮಾರ್ಗದಲ್ಲಿದೆ"
                                        : "En Route"
                                      : isKn
                                        ? "ಸಿದ್ಧವಾಗಿದೆ"
                                        : "Standby"}
                                </span>
                              </div>

                              {/* Rich Details Pills */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                                  👨‍✈️ {item.operatorName} ({item.driverExperienceYears}y exp)
                                </span>
                                <span className="rounded-lg bg-amber-100 text-amber-900 px-2 py-0.5 text-[9px] font-bold">
                                  🍲 Bata: ₹{item.driverBata}
                                </span>
                                <span className="rounded-lg bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[9px] font-bold">
                                  💳 Min Adv: ₹{item.minPayment}
                                </span>
                              </div>

                              {/* Details Row */}
                              <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl bg-white/80 p-2 text-center text-[10px] font-bold text-slate-700 border border-slate-200/60">
                                <div>
                                  <span className="text-slate-400 block text-[9px]">RATE</span>
                                  <span className="font-mono text-[#0b3d91] font-black">₹{item.ratePerHour}/hr</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px]">HOURS RUN</span>
                                  <span className="font-mono">{item.hoursToday}h today</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px]">DIESEL</span>
                                  <span className="font-mono text-emerald-600">{item.fuelPct}%</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[130px]">
                                  🛡️ {item.insuranceEndDate ? `Valid till ${item.insuranceEndDate}` : "Insured"}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`tel:${item.operatorPhone}`}
                                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                                    title="Call Driver"
                                  >
                                    <IconPhone size={12} />
                                    <span>{isKn ? "ಕರೆ" : "Call"}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleFocusMachine(item)}
                                    className="flex items-center gap-1 rounded-lg bg-[#ffb400] hover:bg-amber-400 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-xs active:scale-95 transition"
                                  >
                                    <IconMapPin size={12} />
                                    <span>{isKn ? "ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ" : "Track on Map"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCKED FOOTER NAVIGATION (3 TABS)                                       */}
      {/* ========================================================================= */}
      <footer className="relative z-30 shrink-0 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_20px_rgba(0,0,0,0.12)]">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {/* TAB 1: Live Work Status */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "live_work") {
                setIsSheetExpanded(!isSheetExpanded);
              } else {
                setActiveTab("live_work");
                setIsSheetExpanded(true);
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "live_work"
                ? "bg-[#0b3d91] text-white shadow-md font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold"
            }`}
          >
            <div className="relative">
              <IconActivity
                size={20}
                stroke={activeTab === "live_work" ? 2.5 : 2}
                className={activeTab === "live_work" ? "text-[#ffb400]" : "text-slate-600"}
              />
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-center truncate max-w-full">
              {isKn ? "ಲೈವ್ ಕೆಲಸ" : "Live Work Status"}
            </span>
          </button>

          {/* TAB 2: Working JCB's */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "working_jcbs") {
                setIsSheetExpanded(!isSheetExpanded);
              } else {
                setActiveTab("working_jcbs");
                setIsSheetExpanded(true);
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "working_jcbs"
                ? "bg-[#0b3d91] text-white shadow-md font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold"
            }`}
          >
            <div className="relative">
              <IconTruck
                size={20}
                stroke={activeTab === "working_jcbs" ? 2.5 : 2}
                className={activeTab === "working_jcbs" ? "text-[#ffb400]" : "text-slate-600"}
              />
              <span
                className={`absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-black ${
                  activeTab === "working_jcbs"
                    ? "bg-[#ffb400] text-slate-950"
                    : "bg-slate-800 text-white"
                }`}
              >
                {fleet.length}
              </span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-center truncate max-w-full">
              {isKn ? "ಕಾರ್ಯನಿರತ JCB" : "Working JCB's"}
            </span>
          </button>

          {/* TAB 3: New Vehicle Registration */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("new_vehicle");
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "new_vehicle"
                ? "bg-[#0b3d91] text-white shadow-md font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold"
            }`}
          >
            <div className="relative">
              <div
                className={`flex size-6 items-center justify-center rounded-full transition ${
                  activeTab === "new_vehicle"
                    ? "bg-[#ffb400] text-slate-950"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <IconPlus size={14} stroke={3} />
              </div>
            </div>
            <span className="mt-0.5 text-[10px] leading-tight text-center truncate max-w-full">
              {isKn ? "ಹೊಸ ವಾಹನ" : "New Vehicle Reg"}
            </span>
          </button>
        </div>
      </footer>

      {/* Live In-App Device Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCapturePhoto={(dataUrl) => {
          if (cameraTarget === "insurance") {
            setInsuranceFile({
              name: `insurance_live_capture_${new Date().toISOString().slice(0, 10)}.jpg`,
              size: "1.4 MB",
              previewUrl: dataUrl,
              isImage: true,
            });
          } else if (cameraTarget === "vehicle") {
            setVehiclePhotos((prev) => [...prev, dataUrl]);
          }
          setCameraTarget(null);
        }}
        currentPhotosCount={cameraTarget === "insurance" ? (insuranceFile ? 1 : 0) : vehiclePhotos.length}
        minPhotos={1}
        maxPhotos={cameraTarget === "insurance" ? 1 : 10}
        isKn={isKn}
      />
    </div>
  );
}
