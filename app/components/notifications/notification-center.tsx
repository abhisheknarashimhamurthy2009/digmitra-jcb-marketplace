import {
  IconArrowRight,
  IconBell,
  IconBellRinging,
  IconCheck,
  IconChecks,
  IconClock,
  IconPlayerPlay,
  IconRoute,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconTruck,
  IconVolume,
  IconVolumeOff,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import type { SupportedLanguage } from "@/lib/translations";

export type NotificationType =
  | "booked"
  | "arrival"
  | "work_started"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "safety";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  titleKn: string;
  message: string;
  messageKn: string;
  timestamp: string;
  read: boolean;
  iconEmoji: string;
  accentColor: string; // e.g. "emerald", "amber", "purple", "blue", "sky"
  actionLabel?: string;
  actionLabelKn?: string;
  actionPayload?: string;
}

// Default initial list of rich marketplace notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "booked",
    title: "🎉 JCB Successfully Booked!",
    titleKn: "🎉 ಜೆಸಿಬಿ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ!",
    message: "Your booking #JCB-1507 for 30×40 ft plot cleaning is confirmed. Advance token ₹500 verified. Machinery allocated.",
    messageKn: "30×40 ಅಡಿ ಸೈಟ್ ಸ್ವಚ್ಛತೆಗೆ ನಿಮ್ಮ ಬುಕಿಂಗ್ #JCB-1507 ಕನ್ಫರ್ಮ್ ಆಗಿದೆ. ಮುಂಗಡ ₹500 ಸ್ವೀಕರಿಸಲಾಗಿದೆ.",
    timestamp: "Just now",
    read: false,
    iconEmoji: "🎉",
    accentColor: "emerald",
    actionLabel: "Track Live Map",
    actionLabelKn: "ಲೈವ್ ನಕ್ಷೆ ನೋಡಿ",
    actionPayload: "live_tracking",
  },
  {
    id: "notif-2",
    type: "arrival",
    title: "📍 JCB Arrived at Destination Site!",
    titleKn: "📍 ಜೆಸಿಬಿ ನಿಮ್ಮ ಸೈಟ್‌ಗೆ ತಲುಪಿದೆ!",
    message: "JCB 3DX Super Backhoe (KA-06-EA-7842) with driver Ramesh Gowda has arrived at your site in Kyatasandra.",
    messageKn: "ಜೆಸಿಬಿ 3DX (KA-06-EA-7842) ಚಾಲಕ ರಮೇಶ್ ಗೌಡ ಜೊತೆ ನಿಮ್ಮ ಕ್ಯಾತಸಂದ್ರ ಸೈಟ್‌ಗೆ ತಲುಪಿದೆ.",
    timestamp: "4 mins ago",
    read: false,
    iconEmoji: "📍",
    accentColor: "amber",
    actionLabel: "View Arrival Spot",
    actionLabelKn: "ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ",
    actionPayload: "live_tracking",
  },
  {
    id: "notif-3",
    type: "work_started",
    title: "⚡ Site Cleaning & Leveling Work Started!",
    titleKn: "⚡ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ & ಲೆವೆಲಿಂಗ್ ಕೆಲಸ ಪ್ರಾರಂಭವಾಗಿದೆ!",
    message: "Plot boundary leveling & vegetation clearing has commenced. Machine timer running for 3.0 estimated hours.",
    messageKn: "3 ಗಂಟೆಗಳ ನಿಗದಿತ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಮತ್ತು ಲೆವೆಲಿಂಗ್ ಕೆಲಸ ಪ್ರಾರಂಭವಾಗಿದೆ. ಯಂತ್ರದ ಟೈಮರ್ ಸಕ್ರಿಯವಾಗಿದೆ.",
    timestamp: "12 mins ago",
    read: false,
    iconEmoji: "⚡",
    accentColor: "purple",
    actionLabel: "Check Telematics",
    actionLabelKn: "ಟೆಲಿಮ್ಯಾಟಿಕ್ಸ್ ನೋಡಿ",
    actionPayload: "live_tracking",
  },
  {
    id: "notif-4",
    type: "dispatched",
    title: "🚚 Debris Tipper Vehicle Dispatched",
    titleKn: "🚚 ತ್ಯಾಜ್ಯ ಸಾಗಣೆ ಟಿಪ್ಪರ್ ಹೊರಟಿದೆ",
    message: "Tata 407 / Tractor Tipper (KA-06-TR-3891) is en route from Kyatasandra Depo. Driver Bata: ₹150.",
    messageKn: "ತ್ಯಾಜ್ಯ ಸಾಗಣೆ ಟಿಪ್ಪರ್ (KA-06-TR-3891) ಕ್ಯಾತಸಂದ್ರ ಡಿಪೋದಿಂದ ಹೊರಟಿದೆ. ಚಾಲಕ ಬಟಾ: ₹150.",
    timestamp: "18 mins ago",
    read: true,
    iconEmoji: "🚚",
    accentColor: "blue",
    actionLabel: "Track Tipper",
    actionLabelKn: "ಟಿಪ್ಪರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    actionPayload: "live_tracking",
  },
  {
    id: "notif-5",
    type: "in_progress",
    title: "🚜 Debris Extraction & Truck Loading Active",
    titleKn: "🚜 ಕಲ್ಲು-ಮಣ್ಣು ತೆರವು ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    message: "Excavator is loading rocks, roots, and loose soil into the tipper truck for approved dumping.",
    messageKn: "ಕಲ್ಲು, ಬೇರು ಮತ್ತು ಮಣ್ಣನ್ನು ಟಿಪ್ಪರ್ ವಾಹನಕ್ಕೆ ತುಂಬಲಾಗುತ್ತಿದೆ.",
    timestamp: "35 mins ago",
    read: true,
    iconEmoji: "🚜",
    accentColor: "sky",
  },
  {
    id: "notif-6",
    type: "completed",
    title: "✅ Plot Clearing Work Completed!",
    titleKn: "✅ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ!",
    message: "30×40 ft plot leveling completed. Remaining balance of ₹2,350 can be settled directly to driver.",
    messageKn: "30×40 ಅಡಿ ಸೈಟ್ ಲೆವೆಲಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಉಳಿದ ₹2,350 ಮೊತ್ತವನ್ನು ಚಾಲಕರಿಗೆ ಪಾವತಿಸಬಹುದು.",
    timestamp: "1 hour ago",
    read: true,
    iconEmoji: "✅",
    accentColor: "emerald",
  },
  {
    id: "notif-7",
    type: "safety",
    title: "🛡️ Operator Verified & Safety Active",
    titleKn: "🛡️ ಆಪರೇಟರ್ ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ",
    message: "Machine commercial fitness, insurance, and certified operator KYC verified under DigMitra guidelines.",
    messageKn: "ಎಲ್ಲಾ ಯಂತ್ರಗಳು ವಿಮೆ ಮತ್ತು ಜಿಪಿಎಸ್ ಟೆಲಿಮ್ಯಾಟಿಕ್ಸ್ ಹೊಂದಿದ್ದು ಸುರಕ್ಷತೆಯೊಂದಿಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.",
    timestamp: "2 hours ago",
    read: true,
    iconEmoji: "🛡️",
    accentColor: "indigo",
  },
];

// Play a pleasant, lightweight web-audio chime for push notifications
export function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (E6 - 1318Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Second harmonious tone (B6 - 1975Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1975.53, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Audio context may require user interaction in some strict mobile browsers
  }
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  selectedLanguage: SupportedLanguage;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: AppNotification) => void;
  onSimulateNotification: () => void;
  onClearAll: () => void;
}

export function NotificationCenterModal({
  isOpen,
  onClose,
  notifications,
  selectedLanguage,
  onMarkAllAsRead,
  onNotificationClick,
  onSimulateNotification,
  onClearAll,
}: NotificationCenterModalProps) {
  const isKn = selectedLanguage === "kn";
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-3 select-none pointer-events-auto"
      style={{ zIndex: 999999 }}
    >
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Floating Card Sheet */}
      <div className="relative z-10 flex flex-col w-full max-w-sm max-h-[85vh] rounded-3xl border-2 border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white shadow-2xl overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-4 pt-3.5 pb-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <IconBellRinging size={20} stroke={2.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white font-mono text-[9px] font-black ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                <span>{isKn ? "ಅಧಿಸೂಚನೆಗಳು" : "Notifications"}</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold">
                    {unreadCount} {isKn ? "ಹೊಸತು" : "new"}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">
                {isKn ? "ಲೈವ್ ಬುಕಿಂಗ್ ಮತ್ತು ಸೈಟ್ ಅಪ್‌ಡೇಟ್‌ಗಳು" : "Live updates on JCB booking & work"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNotificationSound();
              }}
              className="flex size-7 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
              title={soundEnabled ? "Mute chimes" : "Enable chimes"}
            >
              {soundEnabled ? (
                <IconVolume size={15} className="text-emerald-400" />
              ) : (
                <IconVolumeOff size={15} className="text-slate-500" />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition active:scale-95 cursor-pointer"
            >
              <IconX size={16} stroke={2.5} />
            </button>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                filter === "all"
                  ? "bg-[#ffb400] text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isKn ? "ಎಲ್ಲಾ" : "All"} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                filter === "unread"
                  ? "bg-[#ffb400] text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isKn ? "ಓದದಿರುವ" : "Unread"} ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
            >
              <IconChecks size={14} />
              <span>{isKn ? "ಎಲ್ಲಾ ಓದಿದೆ" : "Mark all read"}</span>
            </button>
          )}
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="text-xs font-bold text-slate-400">
                {isKn ? "ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ" : "No notifications right now"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const title = isKn ? notif.titleKn : notif.title;
              const msg = isKn ? notif.messageKn : notif.message;
              const action = isKn ? notif.actionLabelKn : notif.actionLabel;

              return (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick(notif)}
                  className={`group relative rounded-2xl border p-3 transition active:scale-[0.98] cursor-pointer ${
                    notif.read
                      ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                      : "bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border-[#ffb400]/40 ring-1 ring-[#ffb400]/20 shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Big Emoji / Status Badge */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg shadow-sm border border-slate-700/80">
                      {notif.iconEmoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-black truncate ${
                            notif.read ? "text-slate-300" : "text-white"
                          }`}
                        >
                          {title}
                        </h4>
                        <span className="text-[9px] font-medium text-slate-400 shrink-0 font-mono">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug mt-1 font-normal line-clamp-2">
                        {msg}
                      </p>

                      {/* Action Pill if defined */}
                      {action && (
                        <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 group-hover:text-amber-300">
                            <span>{action}</span>
                            <IconArrowRight size={11} stroke={2.5} />
                          </span>
                          {!notif.read && (
                            <span className="flex size-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Simulation Trigger & Clear */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-2 shrink-0">
          {/* Quick Demo Trigger: Simulates next live event (Arrival, Work, Booking) */}
          <button
            type="button"
            onClick={onSimulateNotification}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-2.5 px-3 text-xs font-black text-slate-950 shadow-md active:scale-95 transition cursor-pointer"
          >
            <IconSparkles size={14} />
            <span>{isKn ? "ಹೊಸ ಸಂದೇಶ ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ" : "Simulate Next Live Alert"}</span>
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={onClearAll}
            className="flex size-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition active:scale-95 cursor-pointer shrink-0"
            title={isKn ? "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ" : "Clear all notifications"}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Real-Time Animated Floating Toast Push Banner (Slides down at top of device)
interface NotificationToastBannerProps {
  toast: AppNotification | null;
  selectedLanguage: SupportedLanguage;
  onDismiss: () => void;
  onClick: (notif: AppNotification) => void;
}

export function NotificationToastBanner({
  toast,
  selectedLanguage,
  onDismiss,
  onClick,
}: NotificationToastBannerProps) {
  const isKn = selectedLanguage === "kn";

  if (!toast) return null;

  const title = isKn ? toast.titleKn : toast.title;
  const msg = isKn ? toast.messageKn : toast.message;

  return (
    <div
      className="absolute top-12 inset-x-3 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300"
      style={{ zIndex: 9999999 }}
    >
      <div
        onClick={() => onClick(toast)}
        className="w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-[#ffb400] p-3 text-white shadow-2xl shadow-black/80 backdrop-blur-md cursor-pointer transition active:scale-[0.98] ring-4 ring-[#ffb400]/20"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ffb400] text-slate-950 font-black text-lg shadow-md">
              {toast.iconEmoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>{isKn ? "ಲೈವ್ ಅಪ್‌ಡೇಟ್" : "Live Alert"}</span>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  • {toast.timestamp}
                </span>
              </div>
              <h4 className="text-xs font-black text-white truncate mt-0.5">
                {title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-1 mt-0.5">
                {msg}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition active:scale-90 cursor-pointer"
            >
              <IconX size={13} stroke={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
