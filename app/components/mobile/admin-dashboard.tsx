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
import { useEffect, useState } from "react";

import type { AuthUser } from "@/components/auth/login-screen";
import { supabase } from "@/lib/supabase";
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCloudData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, vehiclesRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      ]);
      setBookings(bookingsRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (err) {
      console.warn("Error fetching admin cloud data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, []);

  const totalGmv = bookings.reduce((sum, b) => sum + (Number(b.total_estimate) || 0), 0);
  const activeJcbsCount = vehicles.filter((v) => v.status === "available" || v.status === "working").length;

  const filteredBookings = bookings.filter((b) => {
    if (filter === "active") return b.job_status !== "completed" && b.job_status !== "cancelled";
    if (filter === "completed") return b.job_status === "completed";
    return true;
  });

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
              {activeJcbsCount} Units
            </span>
          </div>
          <div className="border-x border-white/10">
            <span className="block text-[9px] font-bold uppercase text-slate-400">
              {isKn ? "ಇಂದಿನ ಬುಕಿಂಗ್‌ಗಳು" : "Today's Jobs"}
            </span>
            <span className="text-base font-black text-white">
              {bookings.length} Orders
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase text-slate-400">
              {isKn ? "ಒಟ್ಟು ಮೊತ್ತ" : "Day GMV"}
            </span>
            <span className="text-base font-black text-emerald-400">
              ₹{totalGmv.toLocaleString()}
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
          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-2">
              <div className="size-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <IconTruck size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-800">
                {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ" : "No Dispatches in System"}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isKn
                  ? "ಗ್ರಾಹಕರು ಬುಕಿಂಗ್ ಮಾಡಿದ ನಂತರ ಲೈವ್ ಬುಕಿಂಗ್‌ಗಳು ಇಲ್ಲಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ."
                  : "When customers book JCBs, real-time live dispatches and orders will appear here directly from Supabase."}
              </p>
            </div>
          ) : (
            filteredBookings.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-[#0b3d91]">
                        #{job.booking_ref}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          job.job_status === "in_progress"
                            ? "bg-amber-100 text-amber-800"
                            : job.job_status === "confirmed"
                              ? "bg-blue-100 text-[#0b3d91]"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {(job.job_status || "confirmed").replace("_", " ")}
                      </span>
                    </div>
                    <h4 className="mt-1 text-xs font-black text-slate-900">
                      {job.work_type || "Site Cleaning"}
                    </h4>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <IconMapPin size={12} className="text-[#0b3d91]" />
                      {job.site_address}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      ₹{job.total_estimate}
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-[11px] font-bold text-slate-700 border border-slate-100">
                  <span className="truncate">🚜 {job.selected_jcb_type}</span>
                  <span className="text-[#0b3d91] truncate font-mono">👤 {job.customer_name} ({job.customer_phone})</span>
                </div>
              </div>
            ))
          )}
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
