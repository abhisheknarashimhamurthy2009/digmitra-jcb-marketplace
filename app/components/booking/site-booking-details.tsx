import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconDimensions,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconRuler,
  IconShieldCheck,
  IconShovel,
  IconSparkles,
  IconTrash,
  IconTruck,
  IconUpload,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";
import { uploadCloudPhoto } from "@/lib/supabase";
import { LiveCameraModal } from "./live-camera-modal";

export interface BookingSubmissionData {
  siteDimension: string;
  widthFt: number;
  lengthFt: number;
  areaSqFt: number;
  surroundingImages: string[];
  tractorRequired: boolean;
  tractorType: "tractor_tipper" | "tata_407" | "tata_signa_6w";
  tractorTrips?: number;
  estimatedWorkDuration: number;
  tractorRate: number;
  driverBata: number;
  tractorTotal: number;
  machineHours: number;
  machineHourlyRate: number;
  machineTotal: number;
  grandTotal: number;
}

interface SiteBookingDetailsProps {
  selectedLanguage: SupportedLanguage;
  siteLocation: string;
  selectedMachineName?: string;
  machineHourlyRate?: number;
  machineEta?: string;
  onBackToMap: () => void;
  onConfirmBooking?: (data: BookingSubmissionData) => void;
  onProceedToPayment?: (data: BookingSubmissionData) => void;
}

const PRESET_DIMENSIONS = [
  { label: "20 × 30 ft", width: 20, length: 30, area: 600, hours: 2 },
  { label: "30 × 40 ft", width: 30, length: 40, area: 1200, hours: 3 },
  { label: "30 × 50 ft", width: 30, length: 50, area: 1500, hours: 3.5 },
  { label: "40 × 60 ft", width: 40, length: 60, area: 2400, hours: 5 },
  { label: "50 × 80 ft", width: 50, length: 80, area: 4000, hours: 7 },
];

export function SiteBookingDetails({
  selectedLanguage,
  siteLocation,
  selectedMachineName = "JCB 3DX Super",
  machineHourlyRate = 950,
  machineEta = "30 mins away",
  onBackToMap,
  onConfirmBooking,
  onProceedToPayment,
}: SiteBookingDetailsProps) {
  const isKn = selectedLanguage === "kn";

  // 1. Site Dimension State
  const [selectedPreset, setSelectedPreset] = useState<string>("30 × 40 ft");
  const [widthInput, setWidthInput] = useState<string>("30");
  const [lengthInput, setLengthInput] = useState<string>("40");
  const [workingHours, setWorkingHours] = useState<number>(3);
  const [dimensionWarning, setDimensionWarning] = useState<string | null>(null);

  // Parsed dimension values
  const parsedWidth = parseInt(widthInput, 10);
  const parsedLength = parseInt(lengthInput, 10);
  const widthFt = isNaN(parsedWidth) ? 0 : Math.max(0, parsedWidth);
  const lengthFt = isNaN(parsedLength) ? 0 : Math.max(0, parsedLength);

  const isWidthZero = widthInput.trim() === "0" || (widthInput.trim() !== "" && widthFt === 0);
  const isLengthZero = lengthInput.trim() === "0" || (lengthInput.trim() !== "" && lengthFt === 0);
  const hasZeroDimension = isWidthZero || isLengthZero;

  // 2. Surrounding Images State (Empty by default, min 4, max 7)
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState<boolean>(false);

  // 3. Tractor / Tipper / Debris Vehicle State (Timing-based measurement scale)
  const [tractorRequired, setTractorRequired] = useState<boolean>(true);
  const [tractorType, setTractorType] = useState<"tractor_tipper" | "tata_407" | "tata_signa_6w">("tractor_tipper");

  // Vehicle configs with fixed hire amount & Driver Bata for each vehicle
  const VEHICLE_CONFIGS = {
    tractor_tipper: { rate: 1200, driverBata: 150, name: "Tractor Tipper", emoji: "🚜" },
    tata_407: { rate: 1500, driverBata: 200, name: "Tata 407", emoji: "🚚" },
    tata_signa_6w: { rate: 2200, driverBata: 300, name: "Tata Signa 6W", emoji: "🚛" },
  };

  const selectedVehicleConfig = VEHICLE_CONFIGS[tractorType];
  const tractorRate = selectedVehicleConfig.rate;
  const driverBata = selectedVehicleConfig.driverBata;

  // Dimension helpers
  const totalArea = widthFt * lengthFt;
  const dimensionString = `${widthFt} × ${lengthFt} ft (${totalArea.toLocaleString()} sq.ft)`;

  // Pricing calculations: Fixed vehicle package + Driver Bata for the full estimated duration
  const tractorTotal = tractorRequired ? tractorRate + driverBata : 0;
  const machineTotal = workingHours * machineHourlyRate;
  const grandTotal = machineTotal + tractorTotal;

  // Preset Selection
  const handleSelectPreset = (preset: (typeof PRESET_DIMENSIONS)[0]) => {
    setSelectedPreset(preset.label);
    setWidthInput(String(preset.width));
    setLengthInput(String(preset.length));
    setWorkingHours(preset.hours);
    setDimensionWarning(null);
  };

  // Width change handler with instant 0-value warning before entering second input
  const handleWidthChange = (valStr: string) => {
    setWidthInput(valStr);
    setSelectedPreset("custom");
    const num = parseInt(valStr, 10);
    const w = isNaN(num) ? 0 : Math.max(0, num);

    if (valStr.trim() === "0" || (valStr.trim() !== "" && w === 0)) {
      setDimensionWarning(
        isKn
          ? "⚠️ ಎಚ್ಚರಿಕೆ: ನೀವು ಅಗಲಕ್ಕೆ 0 ನಮೂದಿಸಿದ್ದೀರಿ! ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಅಳತೆ ನಮೂದಿಸಿ."
          : "⚠️ Warning: You have entered 0 for Width! Site dimension cannot be 0 ft before proceeding."
      );
    } else if (lengthInput.trim() === "0" || lengthFt === 0) {
      setDimensionWarning(
        isKn
          ? "⚠️ ಎಚ್ಚರಿಕೆ: ಉದ್ದಕ್ಕೆ 0 ನಮೂದಿಸಲಾಗಿದೆ! ಮುಂದುವರಿಯುವ ಮೊದಲು ಮಾನ್ಯವಾದ ಉದ್ದವನ್ನು ನಮೂದಿಸಿ."
          : "⚠️ Warning: Length is currently 0 ft. Please enter a valid length before proceeding."
      );
    } else {
      setDimensionWarning(null);
    }

    if (w > 0 && lengthFt > 0) {
      setWorkingHours(Math.max(2, Math.round((w * lengthFt) / 400)));
    } else {
      setWorkingHours(0);
    }
  };

  // Length change handler with instant 0-value warning before entering next details
  const handleLengthChange = (valStr: string) => {
    setLengthInput(valStr);
    setSelectedPreset("custom");
    const num = parseInt(valStr, 10);
    const l = isNaN(num) ? 0 : Math.max(0, num);

    if (valStr.trim() === "0" || (valStr.trim() !== "" && l === 0)) {
      setDimensionWarning(
        isKn
          ? "⚠️ ಎಚ್ಚರಿಕೆ: ನೀವು ಉದ್ದಕ್ಕೆ 0 ನಮೂದಿಸಿದ್ದೀರಿ! ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಅಳತೆ ನಮೂದಿಸಿ."
          : "⚠️ Warning: You have entered 0 for Length! Site dimension cannot be 0 ft before proceeding."
      );
    } else if (widthInput.trim() === "0" || widthFt === 0) {
      setDimensionWarning(
        isKn
          ? "⚠️ ಎಚ್ಚರಿಕೆ: ಅಗಲಕ್ಕೆ 0 ನಮೂದಿಸಲಾಗಿದೆ! ಮುಂದುವರಿಯುವ ಮೊದಲು ಮಾನ್ಯವಾದ ಅಗಲವನ್ನು ನಮೂದಿಸಿ."
          : "⚠️ Warning: Width is currently 0 ft. Please enter a valid width before proceeding."
      );
    } else {
      setDimensionWarning(null);
    }

    if (widthFt > 0 && l > 0) {
      setWorkingHours(Math.max(2, Math.round((widthFt * l) / 400)));
    } else {
      setWorkingHours(0);
    }
  };

  // Image Upload Handler (Uploads directly to Supabase cloud storage bucket)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = 7 - images.length;

      if (remainingSlots <= 0) {
        setImageError(
          isKn
            ? "ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳ ಮಿತಿ ತಲುಪಿದೆ. ಇನ್ನು ಹೆಚ್ಚಿನ ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಲಾಗುವುದಿಲ್ಲ."
            : "Maximum 7 photos limit reached. You cannot add more photos."
        );
        e.target.value = "";
        return;
      }

      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      if (selectedFiles.length > remainingSlots) {
        setImageError(
          isKn
            ? `ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳ ಮಿತಿ ಇರುವುದರಿಂದ ಕೇವಲ ${filesToAdd.length} ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ.`
            : `Only ${filesToAdd.length} photo(s) added to stay within the 7 photos limit.`
        );
      } else {
        setImageError(null);
      }

      setIsUploadingPhotos(true);
      try {
        const uploadPromises = filesToAdd.map((file) =>
          uploadCloudPhoto(file, "site-photos")
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedUrls]);
      } catch (err: any) {
        console.error("Cloud photo upload error:", err);
        const fallbackUrls = filesToAdd.map((file) => URL.createObjectURL(file));
        setImages((prev) => [...prev, ...fallbackUrls]);
      } finally {
        setIsUploadingPhotos(false);
        e.target.value = "";
      }
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setImageError(null);
  };

  // Handle final submission with strict validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Width
    if (widthFt <= 0 || widthInput.trim() === "0" || widthInput.trim() === "") {
      setDimensionWarning(
        isKn
          ? "⚠️ ಅಗಲ 0 ಆಗಿರಬಾರದು. ದಯವಿಟ್ಟು ಮುಂದುವರಿಯುವ ಮೊದಲು ಮಾನ್ಯವಾದ ಅಗಲವನ್ನು ನಮೂದಿಸಿ."
          : "⚠️ You have entered 0 for Width! Site dimension cannot be 0 ft before proceeding."
      );
      return;
    }

    // 2. Validate Length
    if (lengthFt <= 0 || lengthInput.trim() === "0" || lengthInput.trim() === "") {
      setDimensionWarning(
        isKn
          ? "⚠️ ಉದ್ದ 0 ಆಗಿರಬಾರದು. ದಯವಿಟ್ಟು ಮುಂದುವರಿಯುವ ಮೊದಲು ಮಾನ್ಯವಾದ ಉದ್ದವನ್ನು ನಮೂದಿಸಿ."
          : "⚠️ You have entered 0 for Length! Site dimension cannot be 0 ft before proceeding."
      );
      return;
    }

    // 3. Validate Photos: minimum 4, maximum 7
    if (images.length < 4) {
      setImageError(
        isKn
          ? `ಕನಿಷ್ಠ 4 ಸೈಟ್ ಚಿತ್ರಗಳು ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${images.length} ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ (ಇನ್ನೂ ${4 - images.length} ಚಿತ್ರಗಳು ಬೇಕು).`
          : `Minimum 4 photos required before proceeding. Currently added: ${images.length}/4 (Need ${4 - images.length} more).`
      );
      return;
    }

    if (images.length > 7) {
      setImageError(
        isKn
          ? "ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ."
          : "Maximum 7 photos allowed. Please remove extra photos."
      );
      return;
    }

    const submissionPayload: BookingSubmissionData = {
      siteDimension: dimensionString,
      widthFt,
      lengthFt,
      areaSqFt: totalArea,
      surroundingImages: images,
      tractorRequired,
      tractorType,
      tractorTrips: 1,
      estimatedWorkDuration: workingHours,
      tractorRate,
      driverBata,
      tractorTotal,
      machineHours: workingHours,
      machineHourlyRate,
      machineTotal,
      grandTotal,
    };

    if (onProceedToPayment) {
      onProceedToPayment(submissionPayload);
    } else if (onConfirmBooking) {
      onConfirmBooking(submissionPayload);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] text-slate-900 pb-20 select-none">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={onBackToMap}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
        >
          <IconArrowLeft size={16} stroke={2.5} />
          <span>{isKn ? "ಮ್ಯಾಪ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "Back to Map"}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {isKn ? "ಹಂತ 1/4: ಸೈಟ್ ವಿವರಗಳು" : "Step 1 of 4"}
          </span>
          <p className="text-xs font-black text-[#0b3d91]">
            {isKn ? "ಸೈಟ್ ಕಾನ್ಫಿಗರೇಶನ್" : "Site Details"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 p-4 overflow-y-auto">
        {/* Selected Location & Service Card (No Machine Pricing Disclosed Here) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0b3d91]">
              <IconMapPin size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಸೈಟ್ ಸ್ಥಳ" : "Verified Site Location"}
              </span>
              <p className="truncate text-xs font-black text-slate-800">
                {siteLocation}
              </p>
            </div>
            <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-black border border-emerald-200">
              <IconCheck size={11} stroke={3} />
              <span>{isKn ? "ದೃಢೀಕೃತ" : "Verified"}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏗️</span>
              <div>
                <p className="font-black text-slate-900 leading-tight">
                  {isKn ? "ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಸೇವೆ" : "Site Clearing & Leveling"}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">
                  ⚡ {isKn ? "ಲೈವ್ ಆಪರೇಟರ್‌ಗಳು ಲಭ್ಯವಿದ್ದಾರೆ" : "Multiple Verified JCBs Nearby"}
                </p>
              </div>
            </div>
            <span className="rounded-xl bg-blue-50 text-[#0b3d91] border border-blue-200 px-2.5 py-1 text-[11px] font-black">
              {isKn ? "ಹಂತ 1/4" : "Step 1/4"}
            </span>
          </div>
        </div>

        {/* 1. SITE DIMENSION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-black text-xs shadow-sm">
                1
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {isKn ? "ಸೈಟ್ ಅಳತೆ (Site Dimension)" : "1. Site Dimension"}
              </h3>
            </div>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
              hasZeroDimension
                ? "bg-red-50 text-red-700 border-red-200"
                : "text-[#0b3d91] bg-blue-50 border-blue-100"
            }`}>
              {hasZeroDimension ? (isKn ? "ಅಮಾನ್ಯ ಅಳತೆ (0 ft)" : "0 sq.ft") : `${totalArea.toLocaleString()} sq.ft`}
            </span>
          </div>

          {/* Quick Presets - Includes 20 x 30 ft option */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              {isKn ? "ಸಾಮಾನ್ಯ ಪ್ಲಾಟ್ ಅಳತೆಗಳು:" : "Standard Plot Sizes:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_DIMENSIONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                    selectedPreset === preset.label
                      ? "border-[#ffb400] bg-amber-50/70 ring-2 ring-[#ffb400]/40 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-black text-slate-900">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {preset.area.toLocaleString()} sq.ft • ~{preset.hours} hrs
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Width & Length Inputs (Min set to 0, immediate warning on entering 0) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                {isKn ? "ಅಗಲ (Width ft)" : "Width (Feet)"}
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="0"
                  className={`w-full rounded-2xl border py-2.5 pl-3 pr-8 font-mono text-sm font-bold outline-none transition ${
                    isWidthZero
                      ? "border-red-500 bg-red-50/60 text-red-900 ring-2 ring-red-400"
                      : "border-slate-300 text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/20"
                  }`}
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">
                  ft
                </span>
              </div>
              {isWidthZero && (
                <span className="mt-1 block text-[10px] font-black text-red-600">
                  {isKn ? "⚠️ ಅಗಲ 0 ಆಗಿರಬಾರದು" : "⚠️ Width cannot be 0 ft"}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                {isKn ? "ಉದ್ದ (Length ft)" : "Length (Feet)"}
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={lengthInput}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  placeholder="0"
                  className={`w-full rounded-2xl border py-2.5 pl-3 pr-8 font-mono text-sm font-bold outline-none transition ${
                    isLengthZero
                      ? "border-red-500 bg-red-50/60 text-red-900 ring-2 ring-red-400"
                      : "border-slate-300 text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/20"
                  }`}
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">
                  ft
                </span>
              </div>
              {isLengthZero && (
                <span className="mt-1 block text-[10px] font-black text-red-600">
                  {isKn ? "⚠️ ಉದ್ದ 0 ಆಗಿರಬಾರದು" : "⚠️ Length cannot be 0 ft"}
                </span>
              )}
            </div>
          </div>

          {/* Instant Warning Banner if user entered 0 before proceeding to second input or next step */}
          {dimensionWarning && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
              <IconAlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p className="font-black text-red-900">{dimensionWarning}</p>
                <p className="mt-0.5 text-[11px] text-red-700 font-medium">
                  {isKn
                    ? "ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಮಾನ್ಯವಾದ ಅಳತೆಯನ್ನು ನಮೂದಿಸಿ."
                    : "Please enter measurements greater than 0 ft before proceeding."}
                </p>
              </div>
            </div>
          )}

          {/* Estimated Work Duration (Without Disclosing Price) */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
            <span>{isKn ? "ಅಂದಾಜು ಕಾರ್ಯ ಸಮಯ:" : "Estimated Work Duration:"}</span>
            {hasZeroDimension ? (
              <span className="font-black text-red-600 flex items-center gap-1">
                <IconAlertTriangle size={14} />
                <span>{isKn ? "ಅಮಾನ್ಯ ಅಳತೆ (0 ಅಡಿ)" : "Invalid Dimension (0 ft)"}</span>
              </span>
            ) : (
              <span className="font-black text-slate-900">
                ~{workingHours} {isKn ? "ಗಂಟೆಗಳು" : "Hours"}
              </span>
            )}
          </div>
        </div>

        {/* 2. SURROUNDING IMAGES (Empty by default, min 4, max 7) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-blue-100 text-[#0b3d91] font-black text-xs shadow-sm">
                2
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isKn ? "ಸುತ್ತಮುತ್ತಲಿನ ಚಿತ್ರಗಳು" : "2. Surrounding Images"}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Live Camera Launch Button */}
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                disabled={images.length >= 7}
                className="flex items-center gap-1.5 rounded-xl bg-[#0b3d91] hover:bg-blue-900 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-black shadow-sm active:scale-95 transition cursor-pointer"
              >
                <IconCamera size={15} />
                <span>{isKn ? "ಲೈವ್ ಕ್ಯಾಮೆರಾ" : "Live Camera"}</span>
              </button>

              {/* Photo Counter Pill */}
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                  images.length === 0
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : images.length < 4
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {images.length} / 7 {isKn ? "ಚಿತ್ರಗಳು" : "Photos"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            {isKn
              ? "ರಸ್ತೆ ಪ್ರವೇಶ, ಗಡಿ ಗೋಡೆಗಳು ಮತ್ತು ತ್ಯಾಜ್ಯದ ಪರಿಸ್ಥಿತಿಯನ್ನು ನೋಡಲು ಕನಿಷ್ಠ 4 ರಿಂದ ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ."
              : "Upload photos of road access, boundary walls & debris condition for the operator (Min 4, Max 7)."}
          </p>

          {/* Validation Status Notice */}
          {images.length === 0 ? (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50/80 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              <IconAlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px]">
                {isKn
                  ? "ಕನಿಷ್ಠ 4 ಚಿತ್ರಗಳು ಕಡ್ಡಾಯ (ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳು)."
                  : "Minimum 4 photos required to proceed with booking (Maximum 7 photos)."}
              </span>
            </div>
          ) : images.length < 4 ? (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs text-amber-900 animate-in fade-in">
              <IconAlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span className="font-bold text-[11px]">
                {isKn
                  ? `ಕನಿಷ್ಠ 4 ಚಿತ್ರಗಳು ಅಗತ್ಯವಿದೆ (ಇನ್ನೂ ${4 - images.length} ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ).`
                  : `Minimum 4 photos required (Need ${4 - images.length} more photo${4 - images.length > 1 ? "s" : ""}).`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 animate-in fade-in">
              <IconCheck size={16} stroke={3} className="text-emerald-600 shrink-0" />
              <span className="font-bold text-[11px]">
                {isKn
                  ? `ಫೋಟೋ ಅಗತ್ಯತೆ ಪೂರ್ಣಗೊಂಡಿದೆ (${images.length} ಚಿತ್ರಗಳು ಸೇರಿಸಲಾಗಿದೆ).`
                  : `Photo requirement met (${images.length}/7 photos added).`}
              </span>
            </div>
          )}

          {/* Error Message if max photos exceeded or blocked */}
          {imageError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 animate-in fade-in">
              <IconAlertTriangle size={16} className="shrink-0 text-red-600" />
              <span className="font-bold text-[11px]">{imageError}</span>
            </div>
          )}

          {/* EMPTY STATE: Space left completely empty for user to add photos */}
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition hover:border-[#0b3d91] hover:bg-blue-50/20">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0b3d91] shadow-sm mb-3">
                <IconPhoto size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                {isKn ? "ಯಾವುದೇ ಸೈಟ್ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ" : "No site photos uploaded yet"}
              </h4>
              <p className="mt-1 max-w-xs text-xs text-slate-500 font-medium">
                {isKn
                  ? "ಜೆಸಿಬಿ ಆಪರೇಟರ್‌ಗಾಗಿ ಕನಿಷ್ಠ 4 ರಿಂದ ಗರಿಷ್ಠ 7 ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ (ರಸ್ತೆ, ಮುಂಭಾಗ, ಬದಿಗಳು, ಕಸದ ಪ್ರದೇಶ)."
                  : "Please add 4 to 7 photos of your site (Front road access, left/right boundaries, vegetation/debris)."}
              </p>

              {/* Action buttons: Live Camera & Gallery */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLiveCameraOpen(true)}
                  className="flex items-center gap-2 rounded-2xl bg-[#0b3d91] hover:bg-blue-900 text-white px-5 py-3 text-xs font-black shadow-md cursor-pointer transition active:scale-95"
                >
                  <IconCamera size={18} />
                  <span>{isKn ? "ಲೈವ್ ಕ್ಯಾಮೆರಾ (ಫೋಟೋ ಕ್ಲಿಕ್ ಮಾಡಿ)" : "Take Live Photo (Camera)"}</span>
                </button>

                <label className="flex items-center gap-2 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 px-4 py-3 text-xs font-black shadow-sm cursor-pointer transition active:scale-95">
                  <IconUpload size={16} className="text-slate-600" />
                  <span>{isKn ? "ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ" : "Choose from Gallery"}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* UPLOADED IMAGES GRID (Min 4, Max 7) */
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-sm"
                >
                  <img
                    src={imgUrl}
                    alt={`Site photo ${idx + 1}`}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur hover:bg-red-600 transition cursor-pointer"
                    title="Remove Image"
                  >
                    <IconX size={13} stroke={2.5} />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 rounded-lg bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Add More Photos Buttons: Live Camera + Gallery */}
              {images.length < 7 && (
                <button
                  type="button"
                  onClick={() => setIsLiveCameraOpen(true)}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0b3d91]/50 bg-blue-50/50 hover:bg-blue-100/50 transition active:scale-95 text-center p-2 cursor-pointer shadow-sm"
                  title="Open Live Camera"
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-[#0b3d91] text-white mb-1 shadow-sm">
                    <IconCamera size={18} />
                  </span>
                  <span className="text-[10px] font-black text-[#0b3d91] leading-tight">
                    {isKn ? "ಕ್ಯಾಮೆರಾ" : "Live Camera"}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">
                    ({7 - images.length} left)
                  </span>
                </button>
              )}

              {images.length < 7 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition active:scale-95 text-center p-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 mb-1">
                    <IconUpload size={16} />
                  </span>
                  <span className="text-[10px] font-black text-slate-700 leading-tight">
                    {isKn ? "ಗ್ಯಾಲರಿ" : "Gallery"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {isKn ? "ಫೈಲ್ಸ್" : "Upload"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* 3. WILL TRACTOR REQUIRED? */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs shadow-sm">
                3
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isKn ? "ಟ್ರಾಕ್ಟರ್ / ಟಿಪ್ಪರ್ ಅಗತ್ಯವಿದೆಯೇ?" : "3. Will Tractor / Tipper Required?"}
                </h3>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                tractorRequired
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tractorRequired ? (isKn ? "ಅಗತ್ಯವಿದೆ" : "Required") : (isKn ? "ಬೇಡ" : "Not Needed")}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            {isKn
              ? "ಪ್ಲಾಟ್ ಸ್ವಚ್ಛಗೊಳಿಸಿದ ತ್ಯಾಜ್ಯ ಮತ್ತು ಕಲ್ಲುಮಣ್ಣು ಸಾಗಿಸಲು ಟ್ರಾಕ್ಟರ್ ಟಿಪ್ಪರ್ ಆಯ್ಕೆಮಾಡಿ."
              : "Required if cleared vegetation, mud or debris must be transported away from site."}
          </p>

          {/* Yes / No Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setTractorRequired(false)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all cursor-pointer ${
                !tractorRequired
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{isKn ? "ಬೇಡ (JCB ಮಾತ್ರ)" : "No, JCB Only"}</span>
            </button>

            <button
              type="button"
              onClick={() => setTractorRequired(true)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all cursor-pointer ${
                tractorRequired
                  ? "bg-[#ffb400] text-slate-950 shadow-md font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <IconTruck size={15} />
              <span>{isKn ? "ಹೌದು, ಟ್ರಾಕ್ಟರ್ ಬೇಕು" : "Yes, Add Tractor"}</span>
            </button>
          </div>

          {/* Conditional Options When Tractor is Required */}
          {tractorRequired && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-black text-slate-800">
                {isKn ? "ವಾಹನ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ:" : "Select Vehicle Type:"}
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {/* Option 1: Tractor Tipper */}
                <button
                  type="button"
                  onClick={() => setTractorType("tractor_tipper")}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition active:scale-95 cursor-pointer min-h-[136px] ${
                    tractorType === "tractor_tipper"
                      ? "border-[#ffb400] bg-amber-50/80 ring-2 ring-[#ffb400]/40 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xl mb-0.5">🚜</span>
                    <span className="text-xs font-black text-slate-900 leading-tight">
                      {isKn ? "ಟ್ರಾಕ್ಟರ್ ಟಿಪ್ಪರ್" : "Tractor Tipper"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">
                      {isKn ? "3 ಟನ್" : "3 Ton"}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 border border-emerald-200/60 leading-tight">
                      {isKn ? "ಅವಶೇಷ ವಿಲೇವಾರಿ" : "Debris removal"}
                    </span>
                  </div>

                  {/* Driver Bata */}
                  <div className="mt-1.5 w-full rounded-lg bg-amber-100/70 py-0.5 px-1 border border-amber-300/60 text-center">
                    <span className="text-[9px] font-bold text-amber-950 block leading-tight">
                      {isKn ? "ಡ್ರೈವರ್ ಬತ್ತಾ:" : "Driver Bata:"}
                    </span>
                    <span className="font-mono text-[10px] font-black text-amber-900 block leading-none">
                      ₹150
                    </span>
                  </div>
                </button>

                {/* Option 2: Tata 407 (Replaces 10-wheel tipper) */}
                <button
                  type="button"
                  onClick={() => setTractorType("tata_407")}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition active:scale-95 cursor-pointer min-h-[136px] ${
                    tractorType === "tata_407"
                      ? "border-[#ffb400] bg-amber-50/80 ring-2 ring-[#ffb400]/40 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xl mb-0.5">🚚</span>
                    <span className="text-xs font-black text-slate-900 leading-tight">
                      {isKn ? "ಟಾಟಾ 407" : "Tata 407"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">
                      {isKn ? "2.5 - 3 ಟನ್" : "2.5 - 3 Ton"}
                    </span>
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full mt-1 border border-blue-200/60 leading-tight">
                      {isKn ? "ಕಿರಿದಾದ ರಸ್ತೆ" : "Narrow access"}
                    </span>
                  </div>

                  {/* Driver Bata */}
                  <div className="mt-1.5 w-full rounded-lg bg-amber-100/70 py-0.5 px-1 border border-amber-300/60 text-center">
                    <span className="text-[9px] font-bold text-amber-950 block leading-tight">
                      {isKn ? "ಡ್ರೈವರ್ ಬತ್ತಾ:" : "Driver Bata:"}
                    </span>
                    <span className="font-mono text-[10px] font-black text-amber-900 block leading-none">
                      ₹200
                    </span>
                  </div>
                </button>

                {/* Option 3: Tata Signa 6-Wheel */}
                <button
                  type="button"
                  onClick={() => setTractorType("tata_signa_6w")}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition active:scale-95 cursor-pointer min-h-[136px] ${
                    tractorType === "tata_signa_6w"
                      ? "border-[#ffb400] bg-amber-50/80 ring-2 ring-[#ffb400]/40 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xl mb-0.5">🚛</span>
                    <span className="text-xs font-black text-slate-900 leading-tight">
                      {isKn ? "ಟಾಟಾ ಸಿಗ್ನಾ 6W" : "Tata Signa 6W"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">
                      {isKn ? "6 - 8 ಟನ್" : "6 - 8 Ton"}
                    </span>
                    <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-full mt-1 border border-purple-200/60 leading-tight">
                      {isKn ? "ಭಾರೀ ಟಿಪ್ಪರ್" : "Heavy tipper"}
                    </span>
                  </div>

                  {/* Driver Bata */}
                  <div className="mt-1.5 w-full rounded-lg bg-amber-100/70 py-0.5 px-1 border border-amber-300/60 text-center">
                    <span className="text-[9px] font-bold text-amber-950 block leading-tight">
                      {isKn ? "ಡ್ರೈವರ್ ಬತ್ತಾ:" : "Driver Bata:"}
                    </span>
                    <span className="font-mono text-[10px] font-black text-amber-900 block leading-none">
                      ₹300
                    </span>
                  </div>
                </button>
              </div>

              {/* Measurement Scale: Estimated Work Duration (Timing Only) */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⏱️</span>
                    <span className="text-xs font-black text-slate-900">
                      {isKn ? "ಅಂದಾಜು ಕೆಲಸದ ಅವಧಿ" : "Estimated Work Duration"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    {isKn
                      ? `${workingHours} ಗಂಟೆಗಳ ಕೆಲಸಕ್ಕೆ ನಿಗದಿತ ಮೊತ್ತ (Fixed Amount)`
                      : `${workingHours} Hours estimated • Fixed package amount`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkingHours((h) => Math.max(1, h - 0.5))}
                    disabled={workingHours <= 1}
                    className="flex size-8 items-center justify-center rounded-xl bg-white border border-slate-300 font-black text-slate-700 disabled:opacity-40 hover:bg-slate-100 active:scale-95 cursor-pointer shadow-sm"
                    title={isKn ? "ಸಮಯ ಕಡಿಮೆ ಮಾಡಿ" : "Decrease Hours"}
                  >
                    -
                  </button>
                  <div className="min-w-[50px] text-center">
                    <span className="font-mono text-sm font-black text-slate-900 block">
                      {workingHours} {isKn ? "ಗಂಟೆ" : "Hrs"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkingHours((h) => Math.min(12, h + 0.5))}
                    className="flex size-8 items-center justify-center rounded-xl bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 active:scale-95 cursor-pointer shadow-sm"
                    title={isKn ? "ಸಮಯ ಹೆಚ್ಚಿಸಿ" : "Increase Hours"}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTION / SELECT MODE OF PAYMENT (No price disclosure here) */}
        <div className="rounded-3xl border-2 border-slate-800 bg-slate-950 p-4 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {isKn ? "ಸೈಟ್ ವಿವರಗಳು ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "Site Configuration"}
            </span>
            <span className="text-[11px] font-black text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
              {hasZeroDimension ? "0 sq.ft" : `${totalArea.toLocaleString()} sq.ft`}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 p-3 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isKn ? "ಸೈಟ್ ಅಳತೆ:" : "Site Dimensions:"}</span>
              <span className="font-mono font-bold text-slate-100">
                {dimensionString}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isKn ? "ಕೆಲಸದ ಅವಧಿ:" : "Estimated Duration:"}</span>
              <span className="font-mono font-bold text-amber-400">
                ⏱️ {workingHours} {isKn ? "ಗಂಟೆಗಳು" : "Hours"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isKn ? "ಸೈಟ್ ಫೋಟೋಗಳು:" : "Site Photos:"}</span>
              <span className={`font-bold ${images.length >= 4 ? "text-emerald-400" : "text-amber-400"}`}>
                📸 {images.length}/7 {isKn ? "ಚಿತ್ರಗಳು" : "Photos"} {images.length >= 4 ? "✓" : "(Min 4 required)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isKn ? "ಸಾಗಣೆ ವಾಹನ:" : "Debris Vehicle:"}</span>
              <span className="font-bold text-slate-200">
                {tractorRequired
                  ? tractorType === "tractor_tipper"
                    ? `🚜 Tractor Tipper (Bata: ₹150)`
                    : tractorType === "tata_407"
                    ? `🚚 Tata 407 (Bata: ₹200)`
                    : `🚛 Tata Signa 6W (Bata: ₹300)`
                  : (isKn ? "ಬೇಡ (JCB ಮಾತ್ರ)" : "Not Needed (JCB Only)")}
              </span>
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            {/* Select Mode of Payment Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-5 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl ring-4 ring-[#ffb400]/40 transition active:scale-95 cursor-pointer"
            >
              <span>{isKn ? "ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ" : "Select Mode of Payment"}</span>
              <IconArrowRight size={18} stroke={3} />
            </button>

            {/* Validation note under button if criteria not met */}
            {(hasZeroDimension || images.length < 4) && (
              <p className="text-[10px] text-amber-300/90 font-bold text-center">
                ⚠️{" "}
                {hasZeroDimension
                  ? "Enter valid dimensions (>0 ft) "
                  : ""}
                {hasZeroDimension && images.length < 4 ? "& " : ""}
                {images.length < 4 ? `Add min 4 photos (${images.length}/4)` : ""}{" "}
                to proceed
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Live In-App Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapturePhoto={async (dataUrl) => {
          if (images.length < 7) {
            setIsUploadingPhotos(true);
            try {
              const res = await fetch(dataUrl);
              const blob = await res.blob();
              const cloudUrl = await uploadCloudPhoto(blob, "site-photos");
              setImages((prev) => [...prev, cloudUrl]);
            } catch (err) {
              console.warn("Cloud camera upload fallback:", err);
              setImages((prev) => [...prev, dataUrl]);
            } finally {
              setIsUploadingPhotos(false);
              setImageError(null);
            }
          }
        }}
        currentPhotosCount={images.length}
        minPhotos={4}
        maxPhotos={7}
        isKn={isKn}
      />
    </div>
  );
}
