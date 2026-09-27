import {
  IconCalculator,
  IconClockPlay,
  IconHeadset,
  IconShovel,
} from "@tabler/icons-react";

import type { AppTranslations } from "@/lib/translations";

export type MobileTab = "book" | "tracking" | "calculator" | "support";

interface BottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  hasActiveJob?: boolean;
  t: AppTranslations;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  hasActiveJob = true,
  t,
}: BottomNavProps) {
  const tabs = [
    {
      id: "book" as MobileTab,
      label: t.tabBook,
      sublabel: t.tabBookSub,
      icon: IconShovel,
    },
    {
      id: "tracking" as MobileTab,
      label: t.tabTracking,
      sublabel: t.tabTrackingSub,
      icon: IconClockPlay,
      badge: hasActiveJob ? "LIVE" : undefined,
    },
    {
      id: "calculator" as MobileTab,
      label: t.tabCalc,
      sublabel: t.tabCalcSub,
      icon: IconCalculator,
    },
    {
      id: "support" as MobileTab,
      label: t.tabSupport,
      sublabel: t.tabSupportSub,
      icon: IconHeadset,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex min-w-[72px] flex-col items-center justify-center py-1 text-center transition-all active:scale-95 ${
                isActive ? "text-[#0b3d91]" : "text-slate-500 hover:text-slate-800"
              }`}
              type="button"
            >
              <div className="relative">
                <div
                  className={`flex size-9 items-center justify-center rounded-2xl transition-all ${
                    isActive
                      ? "bg-[#ffb400]/20 text-[#0b3d91] ring-2 ring-[#ffb400]/50"
                      : "text-slate-500"
                  }`}
                >
                  <Icon
                    size={22}
                    stroke={isActive ? 2.5 : 1.8}
                    className={isActive ? "text-[#0b3d91]" : "text-slate-600"}
                  />
                </div>
                {tab.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 items-center rounded-full bg-emerald-500 px-1.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm ring-1 ring-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-0.5 text-[11px] font-bold tracking-tight leading-tight ${
                  isActive ? "text-[#0b3d91]" : "text-slate-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
