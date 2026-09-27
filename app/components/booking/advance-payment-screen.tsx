import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconBuildingBank,
  IconCheck,
  IconCreditCard,
  IconDeviceMobile,
  IconLoader2,
  IconLock,
  IconQrcode,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";
import type { JcbMachineItem } from "./jcb-catalog-screen";
import type { PaymentMode } from "./payment-mode-screen";

export interface AdvancePaymentResult {
  advanceAmount: number;
  remainingBalance: number;
  transactionId: string;
  paymentMethod: string;
  paidAt: string;
}

interface AdvancePaymentScreenProps {
  selectedLanguage: SupportedLanguage;
  selectedJcb: JcbMachineItem;
  paymentMode: PaymentMode;
  dimensionString: string;
  workHours: number;
  tractorRequired: boolean;
  tractorTotal: number;
  onBack: () => void;
  onPaymentSuccess: (result: AdvancePaymentResult) => void;
}

export function AdvancePaymentScreen({
  selectedLanguage,
  selectedJcb,
  paymentMode,
  dimensionString,
  workHours,
  tractorRequired,
  tractorTotal,
  onBack,
  onPaymentSuccess,
}: AdvancePaymentScreenProps) {
  const isKn = selectedLanguage === "kn";

  const advanceAmount = 500;
  const machineTotal = workHours * selectedJcb.costPerHour;
  const estimatedTotal = machineTotal + tractorTotal;
  const remainingBalance = Math.max(0, estimatedTotal - advanceAmount);

  const [selectedUpiMethod, setSelectedUpiMethod] = useState<"phonepe" | "gpay" | "paytm" | "qr">("phonepe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const handlePayAdvance = () => {
    setIsProcessing(true);
    setProcessingStep(isKn ? "ಬ್ಯಾಂಕ್ ಗೇಟ್‌ವೇಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ..." : "Connecting to Secure UPI Gateway...");

    setTimeout(() => {
      setProcessingStep(isKn ? "₹500 ಮುಂಗಡ ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Verifying ₹500 Advance Payment with Bank...");
    }, 1200);

    setTimeout(() => {
      setProcessingStep(isKn ? "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಜೆಸಿಬಿ ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "Payment Successful! Confirming JCB Booking...");
    }, 2000);

    setTimeout(() => {
      const txId = `UPI-${Math.floor(100000000 + Math.random() * 900000000)}`;
      setIsProcessing(false);
      onPaymentSuccess({
        advanceAmount,
        remainingBalance,
        transactionId: txId,
        paymentMethod: selectedUpiMethod.toUpperCase(),
        paidAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }, 2800);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] text-slate-900 pb-20 select-none">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <IconArrowLeft size={16} stroke={2.5} />
          <span>{isKn ? "ಜೆಸಿಬಿ ಬದಲಾಯಿಸಿ" : "Back to JCBs"}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {isKn ? "ಹಂತ 4/4: ಮುಂಗಡ ಪಾವತಿ" : "Step 4 of 4"}
          </span>
          <p className="text-xs font-black text-[#0b3d91]">
            {isKn ? "₹500 ಮುಂಗಡ ಪಾವತಿ" : "Advance Token Payment"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {/* Selected JCB & Operator Summary Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-[#ffb400] shadow-sm">
              <img
                src={selectedJcb.image}
                alt={selectedJcb.model}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                {isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಯಂತ್ರ" : "Selected Machine"}
              </span>
              <h4 className="truncate text-sm font-black text-slate-900">
                {selectedJcb.model}
              </h4>
              <p className="text-xs text-slate-500 font-semibold">
                👤 {selectedJcb.driverName} • ₹{selectedJcb.costPerHour}/hr
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 border border-emerald-200">
              ⚡ {selectedJcb.eta}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>{dimensionString}</span>
            <span>
              {isKn ? "ಪಾವತಿ:" : "Mode:"}{" "}
              <strong className="text-slate-900">
                {paymentMode === "cash_on_spot" ? "On-Spot Cash" : "PhonePe/UPI"}
              </strong>
            </span>
          </div>
        </div>

        {/* Advance Payment Requirement Card */}
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-4 text-slate-900 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-[#ffb400] text-slate-950 font-black text-xs shadow-sm">
                ₹
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {isKn ? "ಮುಂಗಡ ಬುಕಿಂಗ್ ಶುಲ್ಕ (Advance Token)" : "Booking Advance Token"}
              </h3>
            </div>
            <span className="text-lg font-black font-mono text-[#0b3d91]">
              ₹500
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {isKn
              ? "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಜೆಸಿಬಿ ಮತ್ತು ಡ್ರೈವರ್ ಅನ್ನು ಲಾಕ್ ಮಾಡಿ ಕಳುಹಿಸಲು ₹500 ಮುಂಗಡ ಪಾವತಿ ಅಗತ್ಯವಿದೆ. ಕೆಲಸ ಮುಗಿದ ನಂತರ ಉಳಿದ ಹಣವನ್ನು ಪಾವತಿಸಬಹುದು."
              : "Pay ₹500 advance token to lock the JCB machine and dispatch the operator to your site. Remaining balance is payable after site work completion."}
          </p>

          <div className="rounded-2xl bg-white/90 p-3 border border-amber-200 text-xs space-y-1.5 font-medium">
            <div className="flex justify-between text-slate-600">
              <span>{isKn ? "ಅಂದಾಜು ಒಟ್ಟು ಮೊತ್ತ:" : "Estimated Total Job Cost:"}</span>
              <span className="font-mono font-bold text-slate-800">
                ₹{estimatedTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>{isKn ? "ಈಗ ಪಾವತಿಸಬೇಕಾದ ಮುಂಗಡ:" : "Advance Token Payable Now:"}</span>
              <span className="font-mono text-sm text-emerald-700">
                -₹500
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-black text-slate-900">
              <span>
                {paymentMode === "cash_on_spot"
                  ? isKn ? "ಸ್ಥಳದಲ್ಲೇ ನಗದು ಪಾವತಿ ಬಾಕಿ:" : "Remaining Cash Balance at Site:"
                  : isKn ? "ಕೆಲಸದ ನಂತರ ಪಾವತಿಸಬೇಕಾದ ಬಾಕಿ:" : "Balance After Work Completion:"}
              </span>
              <span className="font-mono text-amber-900">
                ₹{remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* UPI & PAYMENT OPTIONS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isKn ? "₹500 ಮುಂಗಡ ಪಾವತಿ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ:" : "Select Payment Method for ₹500:"}
            </h4>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <IconLock size={12} />
              <span>256-Bit SSL</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* PhonePe */}
            <button
              type="button"
              onClick={() => setSelectedUpiMethod("phonepe")}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                selectedUpiMethod === "phonepe"
                  ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-purple-600 text-white font-black text-sm">
                P
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  PhonePe
                </span>
                <span className="text-[10px] text-purple-700 font-bold">
                  Instant UPI
                </span>
              </div>
            </button>

            {/* Google Pay */}
            <button
              type="button"
              onClick={() => setSelectedUpiMethod("gpay")}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                selectedUpiMethod === "gpay"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                G
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Google Pay
                </span>
                <span className="text-[10px] text-blue-700 font-bold">
                  GPay UPI
                </span>
              </div>
            </button>

            {/* Paytm / Other UPI */}
            <button
              type="button"
              onClick={() => setSelectedUpiMethod("paytm")}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                selectedUpiMethod === "paytm"
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-300"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-white font-black text-sm">
                ⚡
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Paytm / UPI
                </span>
                <span className="text-[10px] text-sky-700 font-bold">
                  Any UPI App
                </span>
              </div>
            </button>

            {/* Scan QR */}
            <button
              type="button"
              onClick={() => setSelectedUpiMethod("qr")}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                selectedUpiMethod === "qr"
                  ? "border-[#0b3d91] bg-blue-50 ring-2 ring-blue-300"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-800 text-white">
                <IconQrcode size={18} />
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Scan QR Code
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  Instant QR
                </span>
              </div>
            </button>
          </div>

          {/* QR Code Preview when QR selected */}
          {selectedUpiMethod === "qr" && (
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center animate-in fade-in">
              <div className="p-2 bg-white rounded-xl shadow border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=digmitra@okaxis&pn=DigMitra%20JCB&am=500&cu=INR`}
                  alt="UPI QR Code for ₹500"
                  className="size-36 object-contain"
                />
              </div>
              <p className="mt-2 text-xs font-black text-slate-800">
                Scan with Any UPI App to Pay ₹500
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                digmitra@okaxis • ₹500.00
              </span>
            </div>
          )}
        </div>

        {/* PAY & BOOK BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePayAdvance}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] px-5 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl ring-4 ring-[#ffb400]/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <IconLoader2 size={20} className="animate-spin text-slate-950" />
                <span>{processingStep}</span>
              </>
            ) : (
              <>
                <span>{isKn ? "₹500 ಮುಂಗಡ ಪಾವತಿಸಿ ಜೆಸಿಬಿ ಬುಕ್ ಮಾಡಿ" : "Pay ₹500 Advance & Confirm Booking"}</span>
                <IconArrowRight size={18} stroke={3} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processing Full-Screen Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white p-6 text-center animate-in fade-in">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-[#ffb400] text-slate-950 mb-4 shadow-2xl animate-pulse">
            <IconLoader2 size={44} className="animate-spin" />
          </div>
          <h3 className="text-lg font-black text-white">
            {isKn ? "ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..." : "Processing Advance Payment..."}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-slate-300 font-medium">
            {processingStep}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <IconLock size={15} />
            <span>256-Bit Encrypted Payment • ₹500.00</span>
          </div>
        </div>
      )}
    </div>
  );
}
