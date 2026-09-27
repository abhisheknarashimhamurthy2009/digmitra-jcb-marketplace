import {
  IconActivity,
  IconAlertTriangle,
  IconArrowUpRight,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconCurrencyRupee,
  IconFileInvoice,
  IconMapPin,
  IconPhone,
  IconRefresh,
  IconShield,
  IconShieldCheck,
  IconShovel,
  IconTruck,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";

import type { AuthUser } from "@/components/auth/login-screen";
import type { AppTranslations, SupportedLanguage } from "@/lib/translations";

interface AdminDashboardProps {
  user: AuthUser;
  selectedLanguage: SupportedLanguage;
  t: AppTranslations;
  onLogout: () => void;
}

export function AdminDashboard({
  user,
  selectedLanguage,
  t,
  onLogout,
}: AdminDashboardProps) {
  const isKn = selectedLanguage === "kn";
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const dispatches = [
    {
      id: "JCB-4821",
      customer: "Ramesh Gowda",
      phone: "+91 94480 22331",
      operator: "Manjunath K. (JCB 3DX)",
      location: "Kyatasandra, Tumakuru",
      service: "Plot & Weed Clearing",
      status: "en_route",
      amount: 2850,
      time: "10 mins ago",
    },
    {
      id: "JCB-4819",
      customer: "Anand Murthy",
      phone: "+91 98450 66112",
      operator: "Shivanna R. (JCB 4DX)",
      location: "Rajajinagar, Bengaluru",
      service: "Debris & Rubble Extraction",
      status: "in_progress",
      amount: 5400,
      time: "1.5h in progress",
    },
    {
      id: "JCB-4815",
      customer: "Vikram Reddy",
      phone: "+91 99001 88443",
      operator: "Raghavendra (Mini Excavator)",
      location: "Whitefield, Bengaluru",
      service: "Site Leveling & Grading",
      status: "completed",
      amount: 4375,
      time: "Completed at 11:30 AM",
    },
  ];

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* Super Admin Status Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-xl border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <IconShield size={24} stroke={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black tracking-tight leading-tight">
                  Super Admin Console
                </h2>
                <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase text-indigo-300">
                  SYSTEM PRO
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Karnataka State Operations Control • +91 {user.phone}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
            SYSTEM LIVE
          </span>
        </div>

        {/* High-Level Platform Metrics */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-2.5 backdrop-blur-sm text-center border border-white/10">
          <div>
            <span className="block text-[9px] font-bold uppercase text-slate-400">
              {isKn ? "ಸಕ್ರಿಯ JCBಗಳು" : "Active JCBs"}
            </span>
            <span className="text-base font-black text-[#ffb400]">
              14 Units
            </span>
          </div>
          <div className="border-x border-white/10">
            <span className="block text-[9px] font-bold uppercase text-slate-400">
              {isKn ? "ಇಂದಿನ ಬುಕಿಂಗ್‌ಗಳು" : "Today's Jobs"}
            </span>
            <span className="text-base font-black text-white">
              28 Orders
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase text-slate-400">
              {isKn ? "ಒಟ್ಟು ಮೊತ್ತ" : "Day GMV"}
            </span>
            <span className="text-base font-black text-emerald-400">
              ₹1.24L
            </span>
          </div>
        </div>
      </div>

      {/* Fleet Live Dispatches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            {isKn ? "ಲೈವ್ ಫ್ಲೀಟ್ ಡಿಸ್ಪ್ಯಾಚ್ ಮಾನಿಟರ್" : "Live Dispatch & Fleet Queue"}
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded px-2 py-0.5 ${filter === "all" ? "bg-white shadow text-[#0b3d91]" : "text-slate-600"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`rounded px-2 py-0.5 ${filter === "active" ? "bg-white shadow text-[#0b3d91]" : "text-slate-600"}`}
            >
              Active
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {dispatches.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-[#0b3d91]">
                      {job.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        job.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : job.status === "en_route"
                            ? "bg-blue-100 text-[#0b3d91]"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="mt-1 text-xs font-black text-slate-900">
                    {job.service}
                  </h4>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                    <IconMapPin size={12} className="text-[#0b3d91]" />
                    {job.location}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
                    ₹{job.amount}
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    {job.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-[11px] font-bold text-slate-700 border border-slate-100">
                <span className="truncate">🚜 {job.operator}</span>
                <span className="text-[#0b3d91] truncate font-mono">👤 {job.customer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Quick Operator & Emergency Action Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Super Admin Controls
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => alert("Dispatching nearest available backup JCB 3DX...")}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 p-2.5 text-xs font-black text-[#0b3d91] hover:bg-blue-100 transition active:scale-95"
          >
            <IconTruck size={15} />
            <span>Auto-Dispatch</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Exporting Karnataka daily site cleaning CSV...")}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 p-2.5 text-xs font-black text-slate-800 hover:bg-slate-200 transition active:scale-95"
          >
            <IconFileInvoice size={15} />
            <span>Export Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
}
