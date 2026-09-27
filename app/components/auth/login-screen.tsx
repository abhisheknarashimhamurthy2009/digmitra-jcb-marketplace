import {
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconDeviceMobile,
  IconKey,
  IconLock,
  IconMapPin,
  IconMessageDots,
  IconPhone,
  IconRefresh,
  IconShield,
  IconShieldCheck,
  IconShovel,
  IconSparkles,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

import type { AppTranslations, SupportedLanguage } from "@/lib/translations";

export type UserRole = "consumer" | "owner" | "admin";

export interface AuthUser {
  role: UserRole;
  phone: string;
  name: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  selectedLanguage: SupportedLanguage;
  t: AppTranslations;
}

export function LoginScreen({
  onLoginSuccess,
  selectedLanguage,
  t,
}: LoginScreenProps) {
  // Tab for who ever comes first: consumer vs jcb owner only
  const [selectedRole, setSelectedRole] = useState<UserRole>("consumer");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string>("4829");
  const [smsToast, setSmsToast] = useState<{ show: boolean; code: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Helper labels by language
  const isKn = selectedLanguage === "kn";

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg(
        isKn
          ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ."
          : "Please enter your full name to proceed.",
      );
      return;
    }
    const cleanNum = phoneNumber.replace(/\D/g, "");
    if (cleanNum.length !== 10) {
      setErrorMsg(
        isKn
          ? "ದಯವಿಟ್ಟು ಯಾವುದೇ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."
          : "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    setErrorMsg(null);
    // Generate realistic 4-digit OTP code
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setStep("otp");
    setOtpDigits(["", "", "", ""]);
    setSmsToast({ show: true, code: newOtp });
    setResendCooldown(30);

    // Pre-focus first OTP input box on next frame
    setTimeout(() => {
      otpInputRefs[0].current?.focus();
    }, 120);
  };

  const handleAutoFillOtp = () => {
    const code = smsToast?.code || generatedOtp || "4829";
    const digits = code.split("");
    setOtpDigits(digits);
    setErrorMsg(null);
    setTimeout(() => {
      handleVerifyOtp(undefined, digits.join(""));
    }, 200);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    const singleChar = cleanVal.length > 1 ? cleanVal.slice(-1) : cleanVal;
    const newOtp = [...otpDigits];
    newOtp[index] = singleChar;
    setOtpDigits(newOtp);
    setErrorMsg(null);

    // Auto-advance to next box
    if (singleChar && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto verify if all 4 digits entered
    if (singleChar && index === 3) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 4) {
        setTimeout(() => {
          handleVerifyOtp(undefined, fullCode);
        }, 150);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const enteredOtp = customCode || otpDigits.join("");

    if (enteredOtp.length < 4) {
      setErrorMsg(
        isKn
          ? "ದಯವಿಟ್ಟು 4-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ."
          : "Please enter all 4 digits of the OTP.",
      );
      return;
    }

    // Accept either generated OTP or test default "0000"
    if (enteredOtp !== generatedOtp && enteredOtp !== "0000") {
      setErrorMsg(
        isKn
          ? `ತಪ್ಪಾದ OTP! ದಯವಿಟ್ಟು ${generatedOtp} ನಮೂದಿಸಿ.`
          : `Invalid OTP! Please enter ${generatedOtp} or 0000.`,
      );
      return;
    }

    const cleanNum = phoneNumber.replace(/\D/g, "") || "9876543210";
    const finalName = userName.trim() || (
      selectedRole === "consumer"
        ? (isKn ? "ಗ್ರಾಹಕರು" : "Property Owner")
        : selectedRole === "owner"
          ? (isKn ? "JCB ಮಾಲೀಕರು" : "JCB Fleet Owner")
          : (isKn ? "ಸೂಪರ್ ಅಡ್ಮಿನ್" : "Super Administrator")
    );

    // Show quick verified transition
    setStep("success");
    setTimeout(() => {
      onLoginSuccess({
        role: selectedRole,
        phone: cleanNum,
        name: finalName,
      });
    }, 400);
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[580px] p-2 select-none">
      <div className="space-y-3.5">
        {/* Real-time SMS Toast Notification Banner */}
        {smsToast?.show && step === "otp" && (
          <div className="rounded-2xl bg-slate-900 border-2 border-[#ffb400]/80 p-3 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#ffb400] text-slate-950 font-black shadow">
                  <IconMessageDots size={18} stroke={2.5} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ffcf5a]">
                      {isKn ? "💬 ಹೊಸ SMS ಸಂದೇಶ" : "💬 SMS Verification"}
                    </span>
                    <span className="text-[9px] text-white/50">• {isKn ? "ಈಗಷ್ಟೇ" : "Just now"}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 mt-0.5">
                    {isKn ? "ನಿಮ್ಮ OTP:" : "Your DigMitra OTP is:"}{" "}
                    <span className="font-mono text-base font-black text-[#ffcf5a] tracking-widest underline decoration-2">
                      {smsToast.code}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="shrink-0 flex items-center gap-1 rounded-xl bg-[#ffb400] hover:bg-[#ffa700] px-3 py-1.5 text-xs font-black text-slate-950 active:scale-95 transition shadow-md cursor-pointer"
              >
                <IconSparkles size={14} />
                <span>{isKn ? "ಸ್ವಯಂ ಭರ್ತಿ" : "Auto Fill"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Brand Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0b3d91] via-[#124ea3] to-[#1c64c7] p-4 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#ffb400] text-[#111827] shadow-md">
              <IconShovel size={24} stroke={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black tracking-tight text-white">
                  DigMitra
                </h2>
                <span className="rounded bg-[#ffb400] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#111827]">
                  PRO
                </span>
              </div>
              <p className="text-xs font-bold text-[#ffcf5a]">
                {isKn
                  ? "JCB ಸೈಟ್ & ಪ್ರಾಪರ್ಟಿ ಸ್ವಚ್ಛತಾ ಆ್ಯಪ್"
                  : "JCB Site & Property Cleaning Marketplace"}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80">
            <span className="flex items-center gap-1">
              <IconShieldCheck size={14} className="text-emerald-400" />
              {isKn ? "100% ದೃಢೀಕೃತ ಆಪರೇಟರ್‌ಗಳು" : "Verified Operators"}
            </span>
            <span className="font-bold text-[#ffcf5a]">
              {isKn ? "ಲೈವ್ ಜಿಪಿಎಸ್ ಬುಕಿಂಗ್" : "Live GPS Booking"}
            </span>
          </div>
        </div>

        {/* 3-Step Procedure Flow Indicator */}
        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-[11px] font-black">
          {/* Step 1: Credentials */}
          <div className={`flex items-center gap-1.5 ${step === "phone" ? "text-[#0b3d91]" : "text-emerald-600"}`}>
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
              step === "phone" ? "bg-[#0b3d91] text-white ring-2 ring-[#0b3d91]/25" : "bg-emerald-100 text-emerald-700"
            }`}>
              {step === "phone" ? "1" : "✓"}
            </span>
            <span>{isKn ? "ರುಜುವಾತುಗಳು" : "1. Credentials"}</span>
          </div>

          <IconArrowRight size={12} className="text-slate-300" stroke={2.5} />

          {/* Step 2: Get OTP */}
          <div className={`flex items-center gap-1.5 ${step === "otp" ? "text-[#0b3d91]" : step === "success" ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
              step === "otp" ? "bg-[#0b3d91] text-white ring-2 ring-[#0b3d91]/25" : step === "success" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            }`}>
              {step === "success" ? "✓" : "2"}
            </span>
            <span>{isKn ? "OTP ಪರಿಶೀಲನೆ" : "2. Get OTP"}</span>
          </div>

          <IconArrowRight size={12} className="text-slate-300" stroke={2.5} />

          {/* Step 3: Maps & Bookings */}
          <div className={`flex items-center gap-1.5 ${step === "success" ? "text-emerald-600 animate-pulse font-extrabold" : "text-slate-400"}`}>
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
              step === "success" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              3
            </span>
            <span>{isKn ? "ಮ್ಯಾಪ್ & ಬುಕಿಂಗ್ಸ್" : "3. Live Map"}</span>
          </div>
        </div>

        {/* Role Switcher: Consumer vs JCB Owner (Step 1) */}
        {step === "phone" && (
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
              {isKn ? "ಖಾತೆ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ:" : "Select Account Type:"}
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-200/80 p-1 border border-slate-300/60 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("consumer");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
                  selectedRole === "consumer"
                    ? "bg-white text-[#0b3d91] shadow-md ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconUser size={16} stroke={2.5} />
                <span>{isKn ? "ಗ್ರಾಹಕರು (ಸೈಟ್ ಬುಕಿಂಗ್)" : "Consumer / Client"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("owner");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
                  selectedRole === "owner"
                    ? "bg-white text-[#0b3d91] shadow-md ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconTruck size={16} stroke={2.5} />
                <span>{isKn ? "JCB ಮಾಲೀಕರು" : "JCB Owner"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Auth Procedure Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          {step === "phone" ? (
            /* STEP 1: Enter Credentials */
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  {isKn ? "ಹೆಸರು" : "Name"}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 flex items-center text-slate-400">
                    <IconUser size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder={
                      isKn
                        ? "ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ"
                        : "Enter your name"
                    }
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full rounded-2xl border border-slate-300 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/20"
                    autoFocus
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  {isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು)" : "Mobile Number (10 digits)"}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center gap-1 border-r border-slate-200 pr-2 font-black text-xs text-slate-700">
                    <span className="text-base">🇮🇳</span> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder=""
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setErrorMsg(null);
                    }}
                    className="w-full rounded-2xl border border-slate-300 py-3.5 pl-24 pr-4 font-mono text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/20"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 font-medium">
                  {isKn
                    ? "ಮ್ಯಾಪ್ & ಲೈವ್ ಬುಕಿಂಗ್ ಪ್ರವೇಶಿಸಲು OTP ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ."
                    : "OTP verification required to access live map and JCB bookings."}
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b3d91] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 hover:bg-[#124ea3] transition-all cursor-pointer"
              >
                <span>{isKn ? "OTP ಪಡೆಯಿರಿ & ಮುಂದುವರಿಯಿರಿ" : "Get OTP & Proceed"}</span>
                <IconArrowRight size={16} stroke={3} />
              </button>
            </form>
          ) : step === "otp" ? (
            /* STEP 2: Verify OTP */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {isKn ? "ಪರಿಶೀಲನಾ OTP ನಮೂದಿಸಿ" : "Enter Verification OTP"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {userName ? `${userName} • ` : ""}+91 {phoneNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMsg(null);
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-[#0b3d91] hover:bg-slate-200"
                >
                  {isKn ? "ಬದಲಾಯಿಸಿ" : "Edit Details"}
                </button>
              </div>

              {/* 4-Box OTP Input */}
              <div className="flex justify-center gap-3 py-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="size-14 rounded-2xl border-2 border-slate-300 text-center font-mono text-2xl font-black text-slate-900 outline-none transition focus:border-[#0b3d91] focus:bg-blue-50/50 focus:ring-2 focus:ring-[#0b3d91]/20 shadow-sm"
                  />
                ))}
              </div>

              {/* Quick Helper Text */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>
                  {isKn ? "ಕೋಡ್: " : "Verification Code: "}
                  <strong className="text-slate-800 font-mono">{generatedOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="font-bold text-[#0b3d91] hover:underline"
                >
                  {isKn ? "OTP ಮರುಕಳುಹಿಸಿ" : "Resend OTP"}
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <IconCheck size={16} stroke={3} />
                <span>{isKn ? "ಪರಿಶೀಲಿಸಿ & ಮ್ಯಾಪ್ ಪ್ರವೇಶಿಸಿ" : "Verify & Access Live Map"}</span>
              </button>
            </div>
          ) : (
            /* STEP 3: Verified Success Animation */
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                <IconCheck size={32} stroke={3} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isKn ? "ಖಾತೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ!" : "Verified Successfully!"}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {isKn ? "ಲೈವ್ ಮ್ಯಾಪ್ & ಬುಕಿಂಗ್ಸ್‌ಗೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ..." : "Loading live map and nearby JCB bookings..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
