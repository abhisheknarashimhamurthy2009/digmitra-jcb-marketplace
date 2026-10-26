import {
  IconBell,
  IconCheck,
  IconChevronDown,
  IconDeviceMobile,
  IconLanguage,
  IconLogout,
  IconMaximize,
  IconShovel,
  IconTruck,
  IconUser,
  IconWifi,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/components/auth/login-screen";
import type { AppTranslations, SupportedLanguage } from "@/lib/translations";
import {
  type AppNotification,
  INITIAL_NOTIFICATIONS,
  NotificationCenterModal,
  NotificationToastBanner,
  playNotificationSound,
} from "@/components/notifications/notification-center";

interface MobileShellProps {
  children: React.ReactNode;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  t: AppTranslations;
  noScroll?: boolean;
  onNavigate?: (route: "live_tracking" | "map" | "details") => void;
}

export const languages: { code: SupportedLanguage; name: string }[] = [
  { code: "en", name: "English" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "hi", name: "हिन्दी" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
];

export function MobileShell({
  children,
  selectedLanguage,
  onSelectLanguage,
  currentUser,
  onLogout,
  t,
  noScroll = false,
  onNavigate,
}: MobileShellProps) {
  const [deviceMode, setDeviceMode] = useState<"iphone" | "android" | "fullscreen">("fullscreen");
  const [currentTime, setCurrentTime] = useState("12:40");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Notification Feature State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [simIndex, setSimIndex] = useState(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for dynamic in-app notification events
  useEffect(() => {
    const handleCustomNotif = (e: any) => {
      if (!e.detail) return;
      setNotifications((prev) => [e.detail, ...prev]);
      setActiveToast(e.detail);
      playNotificationSound();
    };

    window.addEventListener("digmitra:notification" as any, handleCustomNotif);
    return () => {
      window.removeEventListener("digmitra:notification" as any, handleCustomNotif);
    };
  }, []);

  // Auto-dismiss floating toast banner after 5.5s
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Simulate Next Live Alert (Arrival, Work Started, Booking, Completion)
  const handleSimulateNotification = useCallback(() => {
    const simulationPool: Omit<AppNotification, "id" | "timestamp" | "read">[] = [
      {
        type: "arrival",
        title: "📍 JCB Arrived at Destination Site!",
        titleKn: "📍 ಜೆಸಿಬಿ ನಿಮ್ಮ ಸೈಟ್‌ಗೆ ತಲುಪಿದೆ!",
        message: "Your allocated JCB has reached your plot location. Operator is ready to inspect boundary.",
        messageKn: "ನಿಮ್ಮ ನಿಯೋಜಿತ ಜೆಸಿಬಿ ಸೈಟ್‌ಗೆ ತಲುಪಿದೆ. ಸೈಟ್ ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧರಾಗಿದ್ದಾರೆ.",
        iconEmoji: "📍",
        accentColor: "amber",
        actionLabel: "View Site Spot",
        actionLabelKn: "ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ",
        actionPayload: "live_tracking",
      },
      {
        type: "work_started",
        title: "⚡ Site Cleaning & Leveling Work Started!",
        titleKn: "⚡ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ & ಲೆವೆಲಿಂಗ್ ಕೆಲಸ ಪ್ರಾರಂಭವಾಗಿದೆ!",
        message: "Excavation and leveling has commenced on your 30×40 ft plot. Machine operational timer running.",
        messageKn: "30×40 ಅಡಿ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಮತ್ತು ಲೆವೆಲಿಂಗ್ ಕೆಲಸ ಪ್ರಾರಂಭವಾಗಿದೆ. ಯಂತ್ರದ ಟೈಮರ್ ಚಾಲನೆಯಲ್ಲಿದೆ.",
        iconEmoji: "⚡",
        accentColor: "purple",
        actionLabel: "Check Telematics",
        actionLabelKn: "ಟೆಲಿಮ್ಯಾಟಿಕ್ಸ್ ನೋಡಿ",
        actionPayload: "live_tracking",
      },
      {
        type: "booked",
        title: "🎉 Machine Allocation Confirmed!",
        titleKn: "🎉 ಹೊಸ ಯಂತ್ರ ಹಂಚಿಕೆ ಕನ್ಫರ್ಮ್ ಆಗಿದೆ!",
        message: "Tata 407 Tipper assigned for debris and boulder removal. Driver Bata: ₹200.",
        messageKn: "ಕಲ್ಲು-ಮಣ್ಣು ಸಾಗಣೆಗೆ ಟಾಟಾ 407 ಟಿಪ್ಪರ್ ವಾಹನ ಹಂಚಿಕೆಯಾಗಿದೆ. ಚಾಲಕ ಬಟಾ: ₹200.",
        iconEmoji: "🎉",
        accentColor: "emerald",
        actionLabel: "View Vehicles",
        actionLabelKn: "ವಾಹನ ನೋಡಿ",
        actionPayload: "live_tracking",
      },
      {
        type: "in_progress",
        title: "🚜 Debris Extraction & Truck Loading Active",
        titleKn: "🚜 ಕಲ್ಲು-ಮಣ್ಣು ತೆರವು ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
        message: "Excavator is loading rocks, roots, and soil into the tipper truck for approved dumping.",
        messageKn: "ಕಲ್ಲು, ಬೇರು ಮತ್ತು ಮಣ್ಣನ್ನು ಟಿಪ್ಪರ್ ವಾಹನಕ್ಕೆ ತುಂಬಲಾಗುತ್ತಿದೆ.",
        iconEmoji: "🚜",
        accentColor: "sky",
      },
      {
        type: "completed",
        title: "✅ Plot Clearing & Leveling Finished!",
        titleKn: "✅ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ & ಲೆವೆಲಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ!",
        message: "Plot has been leveled and debris extracted. Remaining balance ₹2,350 can be paid to driver.",
        messageKn: "ಸೈಟ್ ಲೆವೆಲಿಂಗ್ ಮತ್ತು ತ್ಯಾಜ್ಯ ಸಾಗಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಉಳಿದ ₹2,350 ಮೊತ್ತವನ್ನು ಚಾಲಕರಿಗೆ ಪಾವತಿಸಬಹುದು.",
        iconEmoji: "✅",
        accentColor: "emerald",
      },
    ];

    const item = simulationPool[simIndex % simulationPool.length];
    setSimIndex((prev) => prev + 1);

    const newNotif: AppNotification = {
      id: `notif-sim-${Date.now()}`,
      timestamp: "Just now",
      read: false,
      ...item,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    playNotificationSound();
  }, [simIndex]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.actionPayload === "live_tracking") {
      setNotifModalOpen(false);
      setActiveToast(null);
      onNavigate?.("live_tracking");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-start sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-slate-900 selection:bg-[#ffb400]/30 selection:text-slate-900">
      {/* Top Device Simulator Bar for testing on Desktop */}
      <header aria-label="Device Preview Bar" className="mb-3 hidden sm:flex items-center gap-3 rounded-full bg-slate-800/90 px-4 py-1.5 text-xs text-white backdrop-blur shadow-lg border border-slate-700/60 z-50">
        <span className="flex items-center gap-1.5 font-bold text-slate-300">
          <IconDeviceMobile size={15} className="text-[#ffb400]" /> Mobile Preview:
        </span>
        <div className="flex items-center gap-1 rounded-full bg-slate-900/80 p-0.5">
          <button
            type="button"
            onClick={() => setDeviceMode("iphone")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              deviceMode === "iphone"
                ? "bg-[#0b3d91] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            iPhone 16 Pro
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("android")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              deviceMode === "android"
                ? "bg-[#0b3d91] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Android Pixel
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("fullscreen")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              deviceMode === "fullscreen"
                ? "bg-[#0b3d91] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconMaximize size={12} /> Responsive Edge-to-Edge
          </button>
        </div>
      </header>

      {/* Mobile Device Frame Container */}
      <div
        className={`relative w-full transition-all duration-300 ${
          deviceMode === "fullscreen"
            ? "max-w-md sm:rounded-[36px] sm:shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:border-[6px] sm:border-slate-800"
            : deviceMode === "iphone"
              ? "max-w-[400px] rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.65)] border-[10px] border-slate-800 ring-1 ring-slate-700/60"
              : "max-w-[412px] rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.65)] border-[8px] border-slate-800 ring-1 ring-slate-700/60"
        } bg-[#f8fafc] overflow-hidden flex flex-col h-[100dvh] sm:h-[870px]`}
      >
        {/* Native Mobile Status Bar */}
        <div className="relative z-50 flex h-10 w-full shrink-0 items-center justify-between bg-[#0b3d91] px-6 text-white text-[12px] font-semibold select-none">
          <span>{currentTime}</span>

          {deviceMode === "iphone" && (
            <div className="absolute left-1/2 top-1.5 -translate-x-1/2 flex h-4 w-24 items-center justify-center rounded-full bg-black/90">
              <span className="size-2 rounded-full bg-slate-900 mr-2 ring-1 ring-slate-700/40" />
            </div>
          )}

          {deviceMode === "android" && (
            <div className="absolute left-1/2 top-2 -translate-x-1/2 size-3 rounded-full bg-black ring-1 ring-slate-700" />
          )}

          <div className="flex items-center gap-1.5">
            <IconWifi size={14} />
            <span className="text-[10px] font-bold">5G</span>
            <div className="flex h-2.5 w-5 items-center rounded-sm border border-white/80 p-0.5">
              <div className="h-full w-full rounded-[1px] bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Mobile Top App Header */}
        <header
          className="relative bg-[#0b3d91] px-4 pb-3.5 pt-2 text-white shadow-md"
          style={{ zIndex: 99999 }}
        >
          <div className="flex items-center justify-between">
            {/* Top Left: Consumer or JCB Owner Profile (Replaces App Name after login) */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 p-1 pl-1.5 pr-2.5 text-left transition active:scale-95 border border-white/20 shadow-sm max-w-[170px]"
                title="View Profile Details"
              >
                <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#ffb400] text-[#0b3d91] font-black text-sm shadow-sm">
                  {currentUser.role === "owner" ? (
                    <IconTruck size={17} stroke={2.5} />
                  ) : (
                    <IconUser size={17} stroke={2.5} />
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#0b3d91]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-white leading-tight">
                    {currentUser.name || (currentUser.role === "owner" ? "JCB Owner" : "Consumer")}
                  </p>
                  <p className="text-[10px] font-bold text-[#ffcf5a] leading-none mt-0.5 flex items-center gap-0.5">
                    <span className="truncate">
                      {currentUser.role === "owner"
                        ? (selectedLanguage === "kn" ? "JCB ಮಾಲೀಕರು" : "JCB Owner")
                        : (selectedLanguage === "kn" ? "ಗ್ರಾಹಕರು" : "Consumer")}
                    </span>
                    <IconChevronDown size={11} className="shrink-0 text-white/70" />
                  </p>
                </div>
              </button>
            ) : (
              <div />
            )}

            {/* Language & Alerts */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/25 active:scale-95 shadow-sm border border-white/20 cursor-pointer"
                >
                  <IconLanguage size={15} />
                  <span>
                    {languages.find((l) => l.code === selectedLanguage)?.name || "English"}
                  </span>
                  <IconChevronDown size={13} />
                </button>

                {langMenuOpen && (
                  <>
                    {/* Full Backdrop to close when clicking outside */}
                    <div
                      className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-auto"
                      style={{ zIndex: 999998 }}
                      onClick={() => setLangMenuOpen(false)}
                    />

                    {/* Floating Language Pop-up Menu */}
                    <div
                      className="absolute right-0 top-full mt-2 w-44 rounded-2xl border-2 border-slate-200 bg-white py-2 text-slate-800 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto"
                      style={{ zIndex: 999999 }}
                    >
                      <div className="flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                        <IconLanguage size={14} className="text-[#0b3d91]" />
                        <span>{selectedLanguage === "kn" ? "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ" : "Select Language"}</span>
                      </div>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang.code);
                            setLangMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-black text-left transition cursor-pointer ${
                            selectedLanguage === lang.code
                              ? "text-[#0b3d91] bg-blue-50/90 font-black"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{lang.name}</span>
                          {selectedLanguage === lang.code && (
                            <IconCheck size={15} className="text-[#0b3d91]" stroke={3} />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Notification Bell (Only shown when logged in, hidden on login page) */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setNotifModalOpen(true)}
                  className="relative flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 cursor-pointer"
                  title={selectedLanguage === "kn" ? "ಅಧಿಸೂಚನೆಗಳು" : "Notifications"}
                >
                  <IconBell size={16} />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#ffb400] text-slate-950 font-mono text-[9px] font-black ring-2 ring-[#0b3d91] animate-pulse shadow-sm">
                      {unreadCount}
                    </span>
                  ) : (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-slate-400" />
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Floating In-App Push Notification Toast Banner */}
        <NotificationToastBanner
          toast={activeToast}
          selectedLanguage={selectedLanguage}
          onDismiss={() => setActiveToast(null)}
          onClick={(notif) => {
            handleNotificationClick(notif);
          }}
        />

        {/* Mobile Viewport Content */}
        <div
          className={
            noScroll
              ? "flex-1 relative overflow-hidden flex flex-col p-0"
              : "flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-8"
          }
        >
          {children}
        </div>

        {/* Full User Profile Details Modal (In Front of Map & Everything) */}
        {currentUser && userMenuOpen && (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
            style={{ zIndex: 999999 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setUserMenuOpen(false)}
            />

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-5 text-slate-800 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b3d91]">
                    {currentUser.role === "owner" ? <IconTruck size={17} /> : <IconUser size={17} />}
                  </span>
                  <h2 className="text-sm font-black text-slate-900">
                    {selectedLanguage === "kn" ? "ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು" : "User Profile Details"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                >
                  <IconX size={15} />
                </button>
              </div>

              {/* Avatar & Main Info */}
              <div className="my-4 flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-inner">
                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#ffb400] text-[#0b3d91] font-black text-2xl shadow-md">
                  {currentUser.role === "owner" ? (
                    <IconTruck size={30} stroke={2.2} />
                  ) : (
                    <IconUser size={30} stroke={2.2} />
                  )}
                  <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white text-[9px] font-bold">
                    ✓
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        currentUser.role === "owner"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-[#0b3d91]"
                      }`}
                    >
                      {currentUser.role === "owner"
                        ? selectedLanguage === "kn"
                          ? "JCB ಮಾಲೀಕರು"
                          : "JCB Owner"
                        : selectedLanguage === "kn"
                          ? "ಗ್ರಾಹಕರು"
                          : "Consumer"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      ● {selectedLanguage === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : "Verified"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 truncate mt-1">
                    {currentUser.name || (currentUser.role === "owner" ? "JCB Owner" : "Consumer")}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 font-mono">
                    +91 {currentUser.phone}
                  </p>
                </div>
              </div>

              {/* Detailed User Information List */}
              <div className="space-y-2 rounded-2xl bg-white border border-slate-200 p-3 text-xs mb-4">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {selectedLanguage === "kn" ? "ಹೆಸರು" : "Full Name"}
                  </span>
                  <span className="font-bold text-slate-900">
                    {currentUser.name || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {selectedLanguage === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "Phone Number"}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    +91 {currentUser.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {selectedLanguage === "kn" ? "ಖಾತೆ ಪ್ರಕಾರ" : "Account Role"}
                  </span>
                  <span className="font-bold text-[#0b3d91]">
                    {currentUser.role === "owner"
                      ? selectedLanguage === "kn"
                        ? "JCB ಫ್ಲೀಟ್ ಮಾಲೀಕರು & ಆಪರೇಟರ್"
                        : "JCB Fleet Owner & Operator"
                      : selectedLanguage === "kn"
                        ? "ಗ್ರಾಹಕರು / ಸೈಟ್ ಕ್ಲೈಂಟ್"
                        : "Consumer / Site Client"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {selectedLanguage === "kn" ? "ಖಾತೆ ಸ್ಥಿತಿ" : "Account Status"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {selectedLanguage === "kn" ? "ಸಕ್ರಿಯ (Active)" : "Active & Verified"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">
                    {selectedLanguage === "kn" ? "ಸೇವಾ ಪ್ರದೇಶ" : "Service Region"}
                  </span>
                  <span className="font-bold text-slate-700">
                    Karnataka, India
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200/80 py-2.5 px-4 text-xs font-black text-red-600 transition active:scale-95 shadow-sm cursor-pointer"
                >
                  <IconLogout size={16} />
                  <span>
                    {selectedLanguage === "kn"
                      ? "ಖಾತೆ ಬದಲಿಸಿ / ಲಾಗ್‌ಔಟ್"
                      : "Switch Role / Logout"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Notification Center Modal / Drawer */}
        <NotificationCenterModal
          isOpen={notifModalOpen}
          onClose={() => setNotifModalOpen(false)}
          notifications={notifications}
          selectedLanguage={selectedLanguage}
          onMarkAllAsRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onSimulateNotification={handleSimulateNotification}
          onClearAll={handleClearAll}
        />

        {/* Native Home Indicator Bar for iPhone */}
        {deviceMode === "iphone" && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-slate-400/60 z-50 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
