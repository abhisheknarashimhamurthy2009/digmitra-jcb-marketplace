import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingBank,
  IconCash,
  IconCheck,
  IconCircleCheckFilled,
  IconCreditCard,
  IconDeviceMobile,
  IconMapPin,
  IconPhoto,
  IconQrcode,
  IconRuler,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";

export type PaymentMode = "cash_on_spot" | "online_upi";

interface PaymentModeScreenProps {
  selectedLanguage: SupportedLanguage;
  siteLocation: string;
  dimensionString: string;
  photosCount: number;
  tractorRequired: boolean;
  onBack: () => void;
  onSelectPaymentMode: (mode: PaymentMode) => void;
}

export function PaymentModeScreen({
  selectedLanguage,
  siteLocation,
  dimensionString,
  photosCount,
  tractorRequired,
  onBack,
  onSelectPaymentMode,
}: PaymentModeScreenProps) {
  const isKn = selectedLanguage === "kn";
  const [selectedMode, setSelectedMode] = useState<PaymentMode>("cash_on_spot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPaymentMode(selectedMode);
  };

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
          <span>{isKn ? "ಹಿಂದಿನ ಹಂತ" : "Back"}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {isKn ? "ಹಂತ 2/4: ಪಾವತಿ ವಿಧಾನ" : "Step 2 of 4"}
          </span>
          <p className="text-xs font-black text-[#0b3d91]">
            {isKn ? "ಪಾವತಿ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ" : "Select Mode of Payment"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 p-4 overflow-y-auto">
        {/* Site Details Snapshot Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0b3d91]">
              <IconMapPin size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಸೈಟ್ ಸ್ಥಳ" : "Site Location"}
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

          <div className="flex items-center justify-between pt-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold">
              <IconRuler size={15} className="text-slate-400" />
              <span>{dimensionString}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <IconPhoto size={15} />
              <span>{photosCount} {isKn ? "ಚಿತ್ರಗಳು" : "Photos Attached"}</span>
            </div>
          </div>
        </div>

        {/* Payment Modes Selection Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-black text-xs shadow-sm">
                2
              </span>
              <span>{isKn ? "ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ:" : "Select Mode of Payment:"}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isKn ? "2 ಆಯ್ಕೆಗಳು ಲಭ್ಯ" : "2 Options Available"}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {isKn
              ? "ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಸ್ಥಳದಲ್ಲೇ ನಗದು ಅಥವಾ ಆನ್‌ಲೈನ್ ವಹಿವಾಟು ಆಯ್ಕೆಮಾಡಿ."
              : "Choose your preferred payment method. You will select your JCB machine in the next step."}
          </p>

          {/* Option 1: On-Spot Cash */}
          <div
            onClick={() => setSelectedMode("cash_on_spot")}
            className={`relative flex flex-col p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
              selectedMode === "cash_on_spot"
                ? "border-[#ffb400] bg-amber-50/70 ring-4 ring-[#ffb400]/25 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                  <IconCash size={26} stroke={2.2} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      {isKn ? "1. ಸ್ಥಳದಲ್ಲೇ ನಗದು ಪಾವತಿ" : "1. On-Spot Cash"}
                    </h4>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                      {isKn ? "ಜನಪ್ರಿಯ" : "Popular"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug font-medium">
                    {isKn
                      ? "ಕೆಲಸ ಮುಗಿದ ನಂತರ ಸೈಟ್‌ನಲ್ಲೇ ಜೆಸಿಬಿ ಆಪರೇಟರ್‌ಗೆ ನಗದು ರೂಪದಲ್ಲಿ ಬಾಕಿ ಪಾವತಿಸಿ."
                      : "Pay remaining balance directly in cash to the JCB operator at your site after work is finished."}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {selectedMode === "cash_on_spot" ? (
                  <IconCircleCheckFilled size={22} className="text-[#0b3d91]" />
                ) : (
                  <span className="size-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
            </div>

            {/* Sub-benefits tags */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600">
              <span className="rounded-lg bg-white/80 border border-slate-200 px-2 py-0.5">
                💵 {isKn ? "ನೇರ ನಗದು ಪಾವತಿ" : "Direct Cash to Driver"}
              </span>
              <span className="rounded-lg bg-white/80 border border-slate-200 px-2 py-0.5">
                🛡️ {isKn ? "ಕೆಲಸದ ನಂತರ ಪಾವತಿ" : "Pay After Inspection"}
              </span>
              <span className="rounded-lg bg-white/80 border border-slate-200 px-2 py-0.5">
                ⚡ {isKn ? "ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ" : "Zero Convenience Fee"}
              </span>
            </div>
          </div>

          {/* Option 2: PhonePe / Google Pay / Any Internet Transactions */}
          <div
            onClick={() => setSelectedMode("online_upi")}
            className={`relative flex flex-col p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
              selectedMode === "online_upi"
                ? "border-[#ffb400] bg-amber-50/70 ring-4 ring-[#ffb400]/25 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0b3d91] shadow-sm">
                  <IconDeviceMobile size={26} stroke={2.2} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      {isKn ? "2. ಫೋನ್‌ಪೇ / ಗೂಗಲ್‌ಪೇ / ಇಂಟರ್ನೆಟ್ ವಹಿವಾಟು" : "2. PhonePe / Google Pay / Internet Transactions"}
                    </h4>
                    <span className="rounded-full bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5">
                      UPI & Online
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug font-medium">
                    {isKn
                      ? "PhonePe, Google Pay, Paytm, BHIM UPI ಅಥವಾ ಇಂಟರ್ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ ಮೂಲಕ ಸುಲಭವಾಗಿ ಪಾವತಿಸಿ."
                      : "Pay securely via PhonePe, Google Pay, Paytm, BHIM, UPI QR Code, or Netbanking."}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {selectedMode === "online_upi" ? (
                  <IconCircleCheckFilled size={22} className="text-[#0b3d91]" />
                ) : (
                  <span className="size-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
            </div>

            {/* Provider badges */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600">
              <span className="rounded-lg bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 flex items-center gap-1 font-black">
                🟣 PhonePe
              </span>
              <span className="rounded-lg bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 flex items-center gap-1 font-black">
                🔵 Google Pay
              </span>
              <span className="rounded-lg bg-sky-50 text-sky-900 border border-sky-200 px-2 py-0.5 flex items-center gap-1 font-black">
                ⚡ Paytm / UPI
              </span>
              <span className="rounded-lg bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 flex items-center gap-1 font-black">
                🏛️ Netbanking / Cards
              </span>
            </div>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <IconShieldCheck size={20} className="shrink-0 text-[#0b3d91] mt-0.5" />
          <div className="leading-snug">
            <span className="font-black text-[#0b3d91]">
              {isKn ? "ಸುರಕ್ಷಿತ ಬುಕಿಂಗ್ ಗ್ಯಾರಂಟಿ:" : "DigMitra Secure Booking Guarantee:"}
            </span>
            <p className="mt-0.5 text-[11px] text-blue-800">
              {isKn
                ? "ಮುಂದಿನ ಹಂತದಲ್ಲಿ ನೀವು ನಿಮ್ಮ ಪ್ರದೇಶದ ಪರಿಶೀಲಿಸಿದ ಜೆಸಿಬಿ ವಾಹನಗಳು ಮತ್ತು ಡ್ರೈವರ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು."
                : "In the next step, you will view available JCB machines nearby with driver experience, bata, and capacity."}
            </p>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-5 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl ring-4 ring-[#ffb400]/40 transition active:scale-95 cursor-pointer"
          >
            <span>{isKn ? "ಜೆಸಿಬಿ ಆಯ್ಕೆ ಮಾಡಲು ಮುಂದುವರಿಯಿರಿ" : "Proceed to Select JCB"}</span>
            <IconArrowRight size={18} stroke={3} />
          </button>
        </div>
      </form>
    </div>
  );
}
