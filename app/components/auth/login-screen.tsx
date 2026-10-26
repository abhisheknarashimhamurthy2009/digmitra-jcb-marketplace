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
    const code = smsToast?.code || generatedOtp;
    if (!code) return;
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

    // Verify against generated OTP
    if (enteredOtp !== generatedOtp) {
      setErrorMsg(
        isKn
          ? `ತಪ್ಪಾದ OTP! ದಯವಿಟ್ಟು ${generatedOtp} ನಮೂದಿಸಿ.`
          : `Invalid OTP! Please enter ${generatedOtp}.`,
      );
      return;
    }

    const cleanNum = phoneNumber.replace(/\D/g, "");
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

        {/* Welcoming Client Header */}
        {step === "phone" && (
          <div className="text-center py-1">
            <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
              <span>
                {selectedRole === "consumer"
                  ? (isKn ? "ಹಲೋ ಕ್ಲೈಂಟ್...!!" : "Hello Client...!!")
                  : (isKn ? "ಹಲೋ JCB ಮಾಲೀಕರೇ...!!" : "Hello JCB Owner...!!")}
              </span>
              <img
                src="/jcb-emoji.png"
                alt="JCB"
                className="inline-block h-8 w-auto object-contain shrink-0"
              />
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
              {selectedRole === "consumer"
                ? (isKn ? "ಜೆಸಿಬಿ ಬುಕ್ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ..." : "Ready to book JCB...")
                : (isKn ? "ಹೊಸ ಸೈಟ್ ಕೆಲಸಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ..." : "Ready to accept site cleaning jobs...")}
            </p>
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

              {/* Plain Text Log-in as JCB Owner Switch (No Tab Background) */}
              <div className="pt-2 text-center">
                {selectedRole === "consumer" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("owner");
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0b3d91] hover:text-[#082a66] active:scale-95 transition cursor-pointer group"
                  >
                    <span className="font-black underline decoration-2 decoration-[#ffb400] underline-offset-4">
                      {isKn ? "JCB ಮಾಲೀಕರಾಗಿ ಲಾಗಿನ್ ಮಾಡಿ" : "Log-in as JCB Owner"}
                    </span>
                    <img
                      src="/jcb-emoji.png"
                      alt="JCB"
                      className="inline-block h-6 w-auto object-contain shrink-0 group-hover:scale-110 transition-transform"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("consumer");
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0b3d91] hover:underline active:scale-95 transition cursor-pointer group"
                  >
                    <IconUser size={16} stroke={2.5} className="text-[#0b3d91]" />
                    <span className="font-black underline decoration-2 decoration-blue-500 underline-offset-4">
                      {isKn ? "ಗ್ರಾಹಕರು / ಕ್ಲೈಂಟ್ ಆಗಿ ಲಾಗಿನ್ ಮಾಡಿ" : "Log-in as Client / Consumer"}
                    </span>
                    <IconArrowRight size={15} stroke={3} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
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

              {/* Quick Action: Resend OTP */}
              <div className="flex items-center justify-end text-[11px] text-slate-500 px-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="font-bold text-[#0b3d91] hover:underline cursor-pointer"
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
