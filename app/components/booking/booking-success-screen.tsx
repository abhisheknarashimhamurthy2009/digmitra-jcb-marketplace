import {
  IconCheck,
  IconClock,
  IconCompass,
  IconMapPin,
  IconNavigation,
  IconPhone,
  IconQrcode,
  IconShieldCheck,
  IconSparkles,
  IconTruck,
  IconVolume2,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";
import type { AdvancePaymentResult } from "./advance-payment-screen";
import type { JcbMachineItem } from "./jcb-catalog-screen";
import type { BookingSubmissionData } from "./site-booking-details";

interface BookingSuccessScreenProps {
  selectedLanguage: SupportedLanguage;
  bookingId: string;
  selectedJcb: JcbMachineItem;
  bookingData: BookingSubmissionData | null;
  advancePaymentResult: AdvancePaymentResult | null;
  onTrackOnMap: () => void;
  onClose: () => void;
}

/**
 * Plays the user-provided JCB vehicle engine ignition audio at 0.75x speed
 */
function playJcbEngineSound() {
  try {
    const audio = new Audio("/audio/jcb-engine-ignition.mp3");
    audio.playbackRate = 0.75;
    audio.volume = 0.95;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio autoplay blocked by browser or requires interaction:", err);
      });
    }
  } catch (err) {
    console.warn("Ignition audio failed:", err);
  }
}

export function BookingSuccessScreen({
  selectedLanguage,
  bookingId,
  selectedJcb,
  bookingData,
  advancePaymentResult,
  onTrackOnMap,
  onClose,
}: BookingSuccessScreenProps) {
  const isKn = selectedLanguage === "kn";
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Play realistic JCB engine ignition sound on entrance with slow-motion animation sync
  useEffect(() => {
    setIsPlayingAudio(true);
    const audioTimer = setTimeout(() => {
      playJcbEngineSound();
    }, 450); // Synced with slow-motion glide

    const step2Timer = setTimeout(() => setActiveStep(2), 800);
    const step3Timer = setTimeout(() => setActiveStep(3), 1400);

    const stopAudioTimer = setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3200);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(stopAudioTimer);
    };
  }, []);

  const tractorRequired = bookingData?.tractorRequired ?? true;
  const tractorType = bookingData?.tractorType ?? "tractor_tipper";

  // Vehicle configuration for Tractor / Tipper
  const DEBRIS_VEHICLE_CONFIG = {
    tractor_tipper: {
      name: "Tractor Tipper (3 Ton)",
      nameKn: "ಟ್ರಾಕ್ಟರ್ ಟಿಪ್ಪರ್ (3 ಟನ್)",
      plate: "DISPATCH-ASSIGNED",
      location: "Trailing JCB Operator",
      locationKn: "ಜೆಸಿಬಿ ಜೊತೆಗೆ ಸಾಗಣೆ",
      eta: "Trailing JCB",
      etaKn: "ಜೆಸಿಬಿ ಜೊತೆಗೆ",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80",
      bata: 150,
      emoji: "🚜",
    },
    tata_407: {
      name: "Tata 407 Tipper (3 Ton)",
      nameKn: "ಟಾಟಾ 407 ಟಿಪ್ಪರ್ (3 ಟನ್)",
      plate: "DISPATCH-ASSIGNED",
      location: "En Route to Site",
      locationKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿದೆ",
      eta: "Dispatched",
      etaKn: "ರವಾನಿಸಲಾಗಿದೆ",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80",
      bata: 200,
      emoji: "🚚",
    },
    tata_signa_6w: {
      name: "Tata Signa 6W Tipper (8 Ton)",
      nameKn: "ಟಾಟಾ ಸಿಗ್ನಾ 6W ಟಿಪ್ಪರ್ (8 ಟನ್)",
      plate: "DISPATCH-ASSIGNED",
      location: "En Route to Site",
      locationKn: "ಸೈಟ್ ಮಾರ್ಗದಲ್ಲಿದೆ",
      eta: "Dispatched",
      etaKn: "ರವಾನಿಸಲಾಗಿದೆ",
      driverName: "Tipper Operator",
      driverPhone: "",
      image:
        "https://images.unsplash.com/photo-1586191582152-44a6b2512a14?auto=format&fit=crop&w=500&q=80",
      bata: 300,
      emoji: "🚛",
    },
  };

  const debrisVehicle =
    DEBRIS_VEHICLE_CONFIG[tractorType as keyof typeof DEBRIS_VEHICLE_CONFIG] ||
    DEBRIS_VEHICLE_CONFIG.tractor_tipper;

  const jcbPlate = (selectedJcb as any)?.plateNumber || "DISPATCH-READY";
  const jcbEta = selectedJcb?.eta || "Dispatched";
  const jcbLocation = selectedJcb?.distance ? `${selectedJcb.distance}` : "Dispatched to site";
  const jcbImage =
    selectedJcb?.image ||
    "https://images.unsplash.com/photo-1579294800821-69fc850844bc?auto=format&fit=crop&w=500&q=80";

  const remainingBalance =
    advancePaymentResult?.remainingBalance ??
    Math.max(0, (bookingData?.grandTotal || 2850) - 500);

  return (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/75 backdrop-blur-[6px] select-none animate-backdrop-slow">
      {/* 
        3/4th Screen Container with SLOW-MOTION Physics Glide:
        - Custom cubic-bezier slow-motion slide-up animation
        - Height: h-[78vh] max-h-[78vh]
        - Leaving top 22% of screen clearly open so RealtimeMap is visible in background!
      */}
      <div className="relative flex flex-col w-full max-w-md h-[78vh] max-h-[78vh] rounded-t-[38px] bg-gradient-to-b from-[#064e3b] via-[#043628] to-[#022219] text-white border-t-4 border-[#ffb400] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] overflow-hidden ring-1 ring-emerald-400/40 animate-popup-slow">
        
        {/* Subtle Ambient Light Reflections & Golden Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-b from-amber-400/30 via-emerald-400/10 to-transparent blur-3xl pointer-events-none" />
          <span className="absolute top-3 left-6 text-sm animate-bounce duration-1000">🎉</span>
          <span className="absolute top-7 right-12 text-xs text-amber-300 animate-pulse duration-700">✨</span>
          <span className="absolute top-14 left-1/4 text-xs text-amber-200 animate-ping duration-1000">⭐</span>
          <span className="absolute top-5 right-5 text-sm animate-bounce duration-1000 delay-300">🎊</span>
          <span className="absolute top-12 right-1/3 text-xs text-emerald-300 animate-pulse duration-1000">✨</span>
        </div>

        {/* Top Metallic Grab Handle */}
        <div className="pt-2.5 pb-1 flex items-center justify-center shrink-0">
          <div className="w-14 h-1.5 rounded-full bg-emerald-400/50 hover:bg-emerald-300 transition-all shadow-inner" />
        </div>

        {/* ===================================================================== */}
        {/* STAGGER 1: HEADER & LIVE ENGINE IGNITION EQUALIZER                     */}
        {/* ===================================================================== */}
        <div className="px-4 pt-1 pb-3 shrink-0 border-b border-emerald-800/80 animate-stagger-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Realistic Animated Success Badge with Triple Gold Ring */}
              <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 border-2 border-[#ffb400] shadow-lg shadow-amber-500/30 ring-4 ring-[#ffb400]/30 shrink-0">
                <IconCheck size={28} stroke={3.5} className="text-white drop-shadow-sm" />
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#ffb400] text-slate-950 text-[10px] font-black ring-2 ring-emerald-950">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-full bg-gradient-to-r from-amber-400/25 to-amber-500/20 text-[#ffb400] border border-[#ffb400]/50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{isKn ? "ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "Booking Confirmed"}</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50">
                    #{bookingId}
                  </span>
                </div>

                <h2 className="text-base font-black text-white leading-tight mt-1 flex items-center gap-1.5">
                  <span>{isKn ? "ಜೆಸಿಬಿ ಯಶಸ್ವಿಯಾಗಿ ನಿಯೋಜಿಸಲಾಗಿದೆ" : "JCB Successfully Allocated"}</span>
                  <span className="text-sm">🚜</span>
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 hover:text-white hover:bg-emerald-800 transition active:scale-90 cursor-pointer shrink-0 ml-1"
              title={isKn ? "ಮುಚ್ಚಿ" : "Close"}
            >
              <IconX size={16} stroke={2.5} />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SCROLLABLE DETAILED CONTENT                                           */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs overscroll-contain">
          
          {/* STAGGER 2: ALLOCATED JCB MACHINERY DISPATCH CARD */}
          <div className="rounded-2xl bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border border-emerald-500/50 p-3 shadow-lg space-y-2 backdrop-blur-md animate-stagger-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🚜</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#ffb400]">
                  {isKn ? "೧. ನಿಯೋಜಿತ ಜೆಸಿಬಿ ಯಂತ್ರ" : "1. Primary Allocated JCB"}
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{jcbEta}</span>
              </span>
            </div>

            <div className="flex gap-3 items-center">
              {/* JCB Photo */}
              <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-[#ffb400] shrink-0 shadow-md bg-slate-950">
                <img
                  src={jcbImage}
                  alt={selectedJcb?.model || "JCB 3DX"}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 text-[8px] px-1 font-bold text-amber-400 backdrop-blur-xs">
                  ★ {selectedJcb?.rating || 4.9}
                </span>
              </div>

              {/* JCB Information */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-white truncate">
                    {selectedJcb?.model || "JCB 3DX Super EcoX"}
                  </h4>
                  <span className="text-[10px] text-amber-300 font-bold">₹950/hr</span>
                </div>

                {/* Indian Commercial Yellow Number Plate */}
                <div className="inline-flex items-center gap-1.5 bg-[#ffb400] text-slate-950 font-mono font-black text-[11px] px-2 py-0.5 rounded-md border border-slate-900 shadow-sm">
                  <span className="text-[8px] bg-slate-950 text-white px-1 py-0.1 rounded font-sans leading-none">
                    IND
                  </span>
                  <span>{jcbPlate}</span>
                </div>

                {/* Live Location with Pulsing Radar Ring */}
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-medium">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
                  </span>
                  <span className="truncate">{jcbLocation}</span>
                </div>

                {/* Driver Profile & Contact */}
                <div className="flex items-center justify-between pt-1 border-t border-emerald-800/80 text-[10px]">
                  <span className="text-emerald-300 font-bold truncate max-w-[130px]">
                    👨‍✈️ {selectedJcb?.driverName || (isKn ? "ನಿಯೋಜಿತ ಚಾಲಕರು" : "Assigned Driver")}
                  </span>
                  {(selectedJcb as any)?.phone ? (
                    <a
                      href={`tel:${(selectedJcb as any).phone}`}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 font-bold shadow-sm active:scale-95 transition"
                    >
                      <IconPhone size={11} />
                      <span>{isKn ? "ಚಾಲಕರಿಗೆ ಕರೆ" : "Call Driver"}</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ✓ {isKn ? "ಲೈವ್ ಸಂಪರ್ಕ" : "Connected"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STAGGER 3: DEBRIS VEHICLE CARD (IF BOOKED) */}
          {tractorRequired && (
            <div className="rounded-2xl bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border border-emerald-500/50 p-3 shadow-lg space-y-2 backdrop-blur-md animate-stagger-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{debrisVehicle.emoji}</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#ffb400]">
                    {isKn ? "೨. ಸಾಗಣೆ ಟಿಪ್ಪರ್ ವಾಹನ" : "2. Debris Haulage Tipper"}
                  </span>
                </div>
                <span className="rounded-full bg-amber-400/20 text-[#ffb400] border border-[#ffb400]/40 font-mono text-[9px] font-black px-2 py-0.5">
                  ⏱️ {isKn ? debrisVehicle.etaKn : debrisVehicle.eta}
                </span>
              </div>

              <div className="flex gap-3 items-center">
                {/* Debris Photo */}
                <div className="relative size-18 rounded-2xl overflow-hidden border-2 border-[#ffb400] shrink-0 shadow-md bg-slate-950">
                  <img
                    src={debrisVehicle.image}
                    alt={debrisVehicle.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 text-[8px] px-1 font-bold text-amber-400">
                    Bata: ₹{debrisVehicle.bata}
                  </span>
                </div>

                {/* Debris Vehicle Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-black text-xs text-white truncate">
                    {isKn ? debrisVehicle.nameKn : debrisVehicle.name}
                  </h4>

                  {/* Number Plate */}
                  <div className="inline-flex items-center gap-1.5 bg-[#ffb400] text-slate-950 font-mono font-black text-[11px] px-2 py-0.5 rounded-md border border-slate-900 shadow-sm">
                    <span className="text-[8px] bg-slate-950 text-white px-1 py-0.1 rounded font-sans leading-none">
                      IND
                    </span>
                    <span>{debrisVehicle.plate}</span>
                  </div>

                  {/* Live Location */}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-medium">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-amber-400" />
                    </span>
                    <span className="truncate">
                      📍 {isKn ? debrisVehicle.locationKn : debrisVehicle.location}
                    </span>
                  </div>

                  {/* Driver Contact */}
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-800/80 text-[10px]">
                    <span className="text-emerald-300 font-bold truncate max-w-[130px]">
                      👨‍✈️ {debrisVehicle.driverName}
                    </span>
                    {debrisVehicle.driverPhone ? (
                      <a
                        href={`tel:${debrisVehicle.driverPhone}`}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 font-bold shadow-sm active:scale-95 transition"
                      >
                        <IconPhone size={11} />
                        <span>{isKn ? "ಕರೆ ಮಾಡಿ" : "Call Driver"}</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ✓ {isKn ? "ಸಾಗಣೆ ನಿಯೋಜಿಸಲಾಗಿದೆ" : "Haulage Assigned"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGGER 3/4: OFFICIAL DISPATCH RECEIPT BREAKDOWN */}
          <div className="rounded-2xl bg-emerald-950/90 border border-emerald-700/70 p-3 space-y-2 text-[11px] text-emerald-200 shadow-md animate-stagger-3">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-1.5">
              <span className="font-black text-white flex items-center gap-1.5">
                <IconShieldCheck size={15} className="text-emerald-400" />
                <span>{isKn ? "ಅಧಿಕೃತ ಬುಕಿಂಗ್ ವಿವರ" : "Official Dispatch Receipt"}</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700">
                100% VERIFIED
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-emerald-400">{isKn ? "ಸೈಟ್ ಅಳತೆ:" : "Site Dimensions:"}</span>
                <span className="font-mono font-bold text-white">
                  {bookingData?.siteDimension || "30 × 40 ft (1,200 sq.ft)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">{isKn ? "ಮುಂಗಡ ಪಾವತಿ (ಖಚಿತವಾಗಿದೆ):" : "Advance Token Paid (Verified):"}</span>
                <span className="font-mono font-black text-emerald-300">
                  ₹500.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">{isKn ? "ಅಂದಾಜು ಅವಧಿ:" : "Estimated Work Duration:"}</span>
                <span className="font-mono font-bold text-[#ffb400]">
                  ⏱️ {bookingData?.estimatedWorkDuration || 3} {isKn ? "ಗಂಟೆಗಳು" : "Hours"}
                </span>
              </div>
              <div className="flex justify-between border-t border-emerald-800/80 pt-1.5">
                <span className="text-emerald-300 font-bold">{isKn ? "ಕೆಲಸದ ನಂತರ ಬಾಕಿ ಮೊತ್ತ:" : "Balance Payable Post-Work:"}</span>
                <span className="font-mono font-black text-base text-[#ffb400]">
                  ₹{remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STAGGER 4: FOOTER ACTIONS WITH GOLDEN SHIMMER                         */}
        {/* ===================================================================== */}
        <div className="p-4 shrink-0 bg-emerald-950/98 border-t border-emerald-800/90 flex flex-col gap-2 animate-stagger-4">
          {/* Main Primary Button: Track Vehicles on Live Map */}
          <button
            type="button"
            onClick={onTrackOnMap}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffb400] to-amber-500 hover:from-amber-400 hover:to-amber-400 py-3.5 px-4 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/25 ring-4 ring-[#ffb400]/40 transition active:scale-95 cursor-pointer uppercase tracking-wider animate-gold-shimmer"
          >
            <IconNavigation size={18} stroke={3} className="animate-bounce duration-1000" />
            <span>{isKn ? "ನಕ್ಷೆಯಲ್ಲಿ ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" : "Track Vehicles on Live Map"}</span>
            <IconCompass size={17} stroke={2.5} className="ml-1" />
          </button>

          {/* Secondary Button: Return to Main Map */}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-center py-1 text-[11px] font-bold text-emerald-300 hover:text-white transition active:scale-95 cursor-pointer"
          >
            {isKn ? "ಮುಖ್ಯ ಮೆನುಗೆ ಹಿಂತಿರುಗಿ" : "Back to Home / Map"}
          </button>
        </div>
      </div>
    </div>
  );
}
