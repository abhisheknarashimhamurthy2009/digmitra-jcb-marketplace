import {
  IconArrowLeft,
  IconArrowRight,
  IconAward,
  IconCheck,
  IconClock,
  IconCurrencyRupee,
  IconGasStation,
  IconMapPin,
  IconPhone,
  IconRuler,
  IconShieldCheck,
  IconSparkles,
  IconStar,
  IconSteeringWheel,
  IconUserCheck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { fetchVehiclesFromOnlineDb } from "@/lib/supabase";
import type { SupportedLanguage } from "@/lib/translations";
import type { PaymentMode } from "./payment-mode-screen";

export interface JcbMachineItem {
  id: string;
  model: string;
  tagline: string;
  image: string;
  driverName: string;
  driverPhoto: string;
  driverExperience: string;
  costPerHour: number;
  minimumCharges: string;
  minimumHours: number;
  driverBata: string;
  capacity: string;
  enginePower: string;
  eta: string;
  distance: string;
  rating: number;
  completedJobs: number;
  verified: boolean;
}

export const AVAILABLE_JCBS: JcbMachineItem[] = [
  {
    id: "jcb_3dx_plus",
    model: "JCB 3DX Super Backhoe",
    tagline: "Standard backhoe for residential plots, weed & boulder clearance",
    image:
      "https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=700&q=80",
    driverName: "Verified Fleet Operator",
    driverPhoto: "",
    driverExperience: "Certified Heavy Machinery Operator",
    costPerHour: 950,
    minimumCharges: "Min 2 Hours (₹1,900)",
    minimumHours: 2,
    driverBata: "₹200 / day",
    capacity: "Front Shovel 1.0 m³ • Backhoe Bucket 0.26 m³ (Max Dig Depth 4.77m)",
    enginePower: "76 HP EcoMax Fuel Efficient",
    eta: "Dispatched upon confirmation",
    distance: "Nearest Local Operator",
    rating: 5.0,
    completedJobs: 0,
    verified: true,
  },
  {
    id: "jcb_4dx_heavy",
    model: "JCB 4DX Heavy Duty Excavator",
    tagline: "Heavy rock breaker & deep foundation extraction specialist",
    image:
      "https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=700&q=80",
    driverName: "Verified Fleet Operator",
    driverPhoto: "",
    driverExperience: "Heavy Equipment Specialist",
    costPerHour: 1100,
    minimumCharges: "Min 2 Hours (₹2,200)",
    minimumHours: 2,
    driverBata: "₹250 / day",
    capacity: "Front Shovel 1.2 m³ • Backhoe Bucket 0.30 m³ (Heavy Reinforced Boom)",
    enginePower: "92 HP Turbocharged High Output",
    eta: "Dispatched upon confirmation",
    distance: "Nearest Local Operator",
    rating: 5.0,
    completedJobs: 0,
    verified: true,
  },
  {
    id: "jcb_3dx_eco",
    model: "JCB 3DX EcoXcellence",
    tagline: "Low noise, fuel-efficient leveling, grading & trenching",
    image:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=700&q=80",
    driverName: "Verified Fleet Operator",
    driverPhoto: "",
    driverExperience: "Precision Leveling Operator",
    costPerHour: 900,
    minimumCharges: "Min 2 Hours (₹1,800)",
    minimumHours: 2,
    driverBata: "₹150 / day",
    capacity: "Front Shovel 1.0 m³ • Backhoe Bucket 0.24 m³ (Precision Trench Bucket)",
    enginePower: "74 HP Low Carbon Emission",
    eta: "Dispatched upon confirmation",
    distance: "Nearest Local Operator",
    rating: 5.0,
    completedJobs: 0,
    verified: true,
  },
];

interface JcbCatalogScreenProps {
  selectedLanguage: SupportedLanguage;
  siteLocation: string;
  dimensionString: string;
  workHours: number;
  paymentMode: PaymentMode;
  onBack: () => void;
  onSelectJcb: (jcb: JcbMachineItem) => void;
}

export function JcbCatalogScreen({
  selectedLanguage,
  siteLocation,
  dimensionString,
  workHours,
  paymentMode,
  onBack,
  onSelectJcb,
}: JcbCatalogScreenProps) {
  const isKn = selectedLanguage === "kn";
  const [selectedJcbId, setSelectedJcbId] = useState<string>("jcb_3dx_plus");

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] text-slate-900 pb-20 select-none">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
        >
          <IconArrowLeft size={16} stroke={2.5} />
          <span>{isKn ? "ಪಾವತಿ ವಿಧಾನ" : "Payment Mode"}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {isKn ? "ಹಂತ 3/4: ಜೆಸಿಬಿ ಆಯ್ಕೆ" : "Step 3 of 4"}
          </span>
          <p className="text-xs font-black text-[#0b3d91]">
            {isKn ? "ಲಭ್ಯವಿರುವ ಜೆಸಿಬಿ ಯಂತ್ರಗಳು" : "Available JCBs"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {/* Header Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>📍 {siteLocation}</span>
            </span>
            <span className="rounded-full bg-blue-50 text-[#0b3d91] font-mono text-[11px] font-black px-2.5 py-0.5 border border-blue-100">
              {dimensionString}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>
              {isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಪಾವತಿ:" : "Selected Payment:"}{" "}
              <strong className="text-slate-900">
                {paymentMode === "cash_on_spot"
                  ? isKn ? "💵 ಸ್ಥಳದಲ್ಲೇ ನಗದು" : "💵 On-Spot Cash"
                  : isKn ? "📱 ಆನ್‌ಲೈನ್ UPI" : "📱 PhonePe / UPI"}
              </strong>
            </span>
            <span className="text-emerald-700 font-bold">
              ⚡ {AVAILABLE_JCBS.length} {isKn ? "ಯಂತ್ರಗಳು ಲಭ್ಯ" : "Machinery Options Available"}
            </span>
          </div>
        </div>

        {/* Section Title */}
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-black text-xs shadow-sm">
              3
            </span>
            <span>{isKn ? "ಜೆಸಿಬಿ ಯಂತ್ರ ಮತ್ತು ಡ್ರೈವರ್ ಆಯ್ಕೆಮಾಡಿ:" : "Choose JCB Machine & Driver:"}</span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {isKn
              ? "ಪ್ರತಿಯೊಂದು ಜೆಸಿಬಿ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ (ದರ, ಡ್ರೈವರ್ ಅನುಭವ, ಭತ್ಯೆ, ಸಾಮರ್ಥ್ಯ)."
              : "Review details: Model, Driver Experience, Cost/Hour, Minimum Charges, Driver Bata & Capacity."}
          </p>
        </div>

        {/* JCB MACHINES LIST */}
        <div className="space-y-4">
          {AVAILABLE_JCBS.map((jcb) => {
            const isSelected = selectedJcbId === jcb.id;
            const estimatedMachineCost = workHours * jcb.costPerHour;

            return (
              <div
                key={jcb.id}
                className={`overflow-hidden rounded-3xl border-2 transition-all bg-white shadow-md ${
                  isSelected
                    ? "border-[#ffb400] ring-4 ring-[#ffb400]/30 shadow-xl"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* 1. Machine Image & Badges */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={jcb.image}
                    alt={jcb.model}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-[#ffb400] px-2.5 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow">
                      🚜 {isKn ? "ಪರಿಶೀಲಿತ" : "Verified Operator"}
                    </span>
                    <span className="rounded-full bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <IconCheck size={12} className="text-emerald-400" />
                      <span>{isKn ? "ಪರಿಶೀಲಿತ ಉಪಕರಣ" : "Verified Equipment"}</span>
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-black text-emerald-300 shadow">
                      ⚡ {jcb.eta}
                    </span>
                  </div>

                  {/* Bottom Image Overlay: Model Name */}
                  <div className="absolute bottom-2.5 inset-x-3 text-white">
                    <h4 className="text-base font-black leading-tight drop-shadow-md">
                      {jcb.model}
                    </h4>
                    <p className="text-[11px] text-slate-200 drop-shadow font-medium mt-0.5">
                      {jcb.tagline}
                    </p>
                  </div>
                </div>

                {/* 2. Driver Details Card */}
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-amber-500/10 border-2 border-[#ffb400] flex items-center justify-center text-amber-500 shadow-sm">
                        {jcb.driverPhoto ? (
                          <img
                            src={jcb.driverPhoto}
                            alt={jcb.driverName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <IconSteeringWheel size={24} className="text-[#ffb400]" />
                        )}
                        <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-tl p-0.5 text-[8px] text-white font-black">
                          ✓
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900">
                            {jcb.driverName}
                          </span>
                          <span className="rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 border border-emerald-200">
                            Driver
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#0b3d91] flex items-center gap-1 mt-0.5">
                          <IconAward size={14} className="shrink-0" />
                          <span>{jcb.driverExperience}</span>
                        </p>
                      </div>
                    </div>

                    {/* Proximity Distance */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">
                        {isKn ? "ದೂರ" : "Distance"}
                      </span>
                      <span className="font-mono text-xs font-black text-slate-700">
                        {jcb.distance}
                      </span>
                    </div>
                  </div>

                  {/* 3. Key Machinery Specifications Grid (Cost, Min Charge, Bata, Capacity) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Cost Per Hour */}
                    <div className="rounded-2xl bg-amber-50/70 p-2.5 border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        {isKn ? "ಗಂಟೆಯ ದರ (Cost / Hour)" : "Cost Per Hour"}
                      </span>
                      <span className="text-base font-black text-amber-950 font-mono">
                        ₹{jcb.costPerHour.toLocaleString()}
                        <span className="text-xs font-normal text-amber-800">/hr</span>
                      </span>
                    </div>

                    {/* Minimum Charges */}
                    <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isKn ? "ಕನಿಷ್ಠ ಶುಲ್ಕ (Min Charges)" : "Minimum Charges"}
                      </span>
                      <span className="text-xs font-black text-slate-900 block mt-0.5">
                        {jcb.minimumCharges}
                      </span>
                    </div>

                    {/* Driver Bata */}
                    <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isKn ? "ಡ್ರೈವರ್ ಭತ್ಯೆ (Driver Bata)" : "Driver Bata"}
                      </span>
                      <span className="text-xs font-black text-emerald-700 block mt-0.5">
                        {jcb.driverBata}
                      </span>
                    </div>

                    {/* Engine Power */}
                    <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isKn ? "ಎಂಜಿನ್ ಪವರ್" : "Engine Spec"}
                      </span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5 truncate">
                        {jcb.enginePower}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Details */}
                  <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      {isKn ? "ಬಕೆಟ್ & ಸಲಿಕೆ ಸಾಮರ್ಥ್ಯ (Capacity)" : "Machine Capacity & Reach"}
                    </span>
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">
                      🚜 {jcb.capacity}
                    </p>
                  </div>

                  {/* Action: Select & Book This JCB Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJcbId(jcb.id);
                        onSelectJcb(jcb);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md ring-2 ring-[#ffb400]/40 transition active:scale-95 cursor-pointer"
                    >
                      <span>{isKn ? "ಈ ಜೆಸಿಬಿ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ" : "Select & Book This JCB"}</span>
                      <IconArrowRight size={16} stroke={3} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
