import {
  IconBrandWhatsapp,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPhone,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPlay,
  IconShieldCheck,
  IconShovel,
  IconTruck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { AppTranslations } from "@/lib/translations";

interface ActiveJobTrackerProps {
  t: AppTranslations;
}

export function ActiveJobTracker({ t }: ActiveJobTrackerProps) {
  const [timerRunning, setTimerRunning] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(4820); // ~1 hr 20 min
  const [jobStage, setJobStage] = useState<"en_route" | "working" | "done">(
    "working",
  );

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && jobStage === "working") {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, jobStage]);

  const hours = Math.floor(secondsElapsed / 3600);
  const minutes = Math.floor((secondsElapsed % 3600) / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const hourlyRate = 950;
  const currentRunningCost = Math.round((secondsElapsed / 3600) * hourlyRate);

  return (
    <div className="space-y-4 pb-28">
      {/* Job Status Banner */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0b3d91] to-[#1a5cb8] px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#ffcf5a]">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              {t.liveJobTitle}
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              {t.siteCleaningTag}
            </span>
          </div>
          <h2 className="mt-1 text-base font-black tracking-tight">
            {jobStage === "en_route" && t.statusEnRoute}
            {jobStage === "working" && t.statusWorking}
            {jobStage === "done" && t.statusDone}
          </h2>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/60 p-2.5 text-center text-[11px]">
          <button
            type="button"
            onClick={() => setJobStage("en_route")}
            className={`flex flex-col items-center gap-1 font-bold ${
              jobStage === "en_route"
                ? "text-[#0b3d91]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                jobStage === "en_route" || jobStage === "working" || jobStage === "done"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <IconCheck size={12} stroke={3} />
            </span>
            <span>{t.stepDispatched}</span>
          </button>

          <button
            type="button"
            onClick={() => setJobStage("working")}
            className={`flex flex-col items-center gap-1 font-bold ${
              jobStage === "working"
                ? "text-[#0b3d91]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                jobStage === "working" || jobStage === "done"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {jobStage === "working" ? "⏳" : <IconCheck size={12} stroke={3} />}
            </span>
            <span>{t.stepClearing}</span>
          </button>

          <button
            type="button"
            onClick={() => setJobStage("done")}
            className={`flex flex-col items-center gap-1 font-bold ${
              jobStage === "done"
                ? "text-[#0b3d91]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                jobStage === "done"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {jobStage === "done" ? <IconCheck size={12} stroke={3} /> : "3"}
            </span>
            <span>{t.stepCompleted}</span>
          </button>
        </div>

        {/* Live Operator Card */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-xl font-black text-[#9c6c00] border border-amber-200">
                  RK
                </div>
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                  <IconShieldCheck size={11} />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900">
                    Ramesh Kumar
                  </h3>
                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[10px] font-bold text-amber-800">
                    ★ 4.9 (340+ jobs)
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  JCB 3DX Super • <span className="font-mono text-slate-700">KA-04-MB-8921</span>
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {t.verifiedOperatorTag}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3d91] py-2.5 text-xs font-black text-white shadow-sm transition-all active:scale-95"
            >
              <IconPhone size={15} /> {t.callOperator}
            </a>
            <a
              href="https://wa.me/919876543210?text=Hello%20Ramesh,%20regarding%20the%20site%20cleaning%20job%20#JCB-8842"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-sm transition-all active:scale-95"
            >
              <IconBrandWhatsapp size={16} /> {t.whatsApp}
            </a>
          </div>
        </div>
      </div>

      {/* Digital Hour-Meter */}
      <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-950 to-slate-900 p-4 text-white shadow-md">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <IconClock size={16} />
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                {t.digitalHourMeter}
              </span>
              <p className="text-[10px] text-emerald-200/70">
                {t.hourMeterDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTimerRunning(!timerRunning)}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20 active:scale-95"
          >
            {timerRunning ? (
              <>
                <IconPlayerPause size={12} /> {t.pause}
              </>
            ) : (
              <>
                <IconPlayerPlay size={12} /> {t.resume}
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {t.timeLogged}
            </span>
            <div className="font-mono text-3xl font-black tracking-widest text-emerald-300">
              {formattedTime}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {t.meterCostSoFar}
            </span>
            <div className="text-2xl font-black text-white">
              ₹{currentRunningCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400/80">
              {t.baseRateTag}
            </span>
          </div>
        </div>
      </div>

      {/* Site Location & Scope */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
          <IconMapPin size={15} className="text-[#0b3d91]" /> {t.siteScopeTitle}
        </div>
        <div className="mt-2.5 rounded-xl bg-slate-50 p-3 text-xs">
          <p className="font-black text-slate-900">Plot #42, Green Glen Layout</p>
          <p className="text-slate-600">Near Bellandur Lake Road, Bengaluru — 560103</p>
          <div className="mt-2.5 flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
            <span className="rounded-md bg-blue-100/80 px-2 py-0.5 font-bold text-[#0b3d91]">
              🌿 30 × 40 ft Plot Clearing
            </span>
            <span className="rounded-md bg-amber-100/80 px-2 py-0.5 font-bold text-amber-800">
              🚚 1 Tipper Truck Trip
            </span>
            <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 font-bold text-emerald-800">
              🚜 Leveling Included
            </span>
          </div>
        </div>
      </div>

      {/* Before & After Photo Inspection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
            <IconPhoto size={15} className="text-[#0b3d91]" /> {t.inspectionPhotosTitle}
          </span>
          <span className="text-[11px] font-bold text-[#0b3d91]">
            2 Photos Logged
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="relative h-28 bg-gradient-to-br from-amber-800 to-amber-950 p-2 flex flex-col justify-end text-white">
              <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300">
                {t.beforePhoto}
              </span>
              <p className="text-[10px] font-bold">Wild weed growth &amp; debris mounds</p>
            </div>
            <div className="p-1.5 text-center text-[10px] font-bold text-slate-600">
              Taken at 09:15 AM
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="relative h-28 bg-gradient-to-br from-emerald-800 to-emerald-950 p-2 flex flex-col justify-end text-white">
              <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                {t.duringPhoto}
              </span>
              <p className="text-[10px] font-bold">Boundary leveled &amp; roots cleared</p>
            </div>
            <div className="p-1.5 text-center text-[10px] font-bold text-slate-600">
              Updated 15m ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
