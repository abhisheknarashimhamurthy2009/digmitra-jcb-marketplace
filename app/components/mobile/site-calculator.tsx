import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconInfoCircle,
  IconRuler,
  IconShovel,
  IconTrash,
  IconTruck,
} from "@tabler/icons-react";
import { useState } from "react";

import type { AppTranslations } from "@/lib/translations";

interface SiteCalculatorProps {
  onApplyEstimate: (data: {
    plotSize: string;
    condition: string;
    hours: number;
    truckTrips: number;
    estimatedCost: number;
    machineName: string;
  }) => void;
  t: AppTranslations;
}

const standardPlots = [
  { label: "30 × 40 ft", sqft: 1200, desc: "Standard residential" },
  { label: "40 × 60 ft", sqft: 2400, desc: "Medium villa plot" },
  { label: "60 × 80 ft", sqft: 4800, desc: "Commercial / Twin plot" },
  { label: "½ Acre", sqft: 21780, desc: "Large layout / Farm" },
];

export function SiteCalculator({ onApplyEstimate, t }: SiteCalculatorProps) {
  const conditions = [
    {
      id: "weeds",
      label: t.condWeeds,
      desc: t.condWeedsSub,
      speedFactor: 1.0,
      dumpFactor: 0.5,
    },
    {
      id: "bushes",
      label: t.condBushes,
      desc: t.condBushesSub,
      speedFactor: 1.6,
      dumpFactor: 1.0,
    },
    {
      id: "debris",
      label: t.condDebris,
      desc: t.condDebrisSub,
      speedFactor: 2.2,
      dumpFactor: 2.5,
    },
    {
      id: "leveling",
      label: t.condLeveling,
      desc: t.condLevelingSub,
      speedFactor: 1.8,
      dumpFactor: 1.2,
    },
  ];

  const [selectedPlot, setSelectedPlot] = useState(standardPlots[0]);
  const [customSqFt, setCustomSqFt] = useState<number | "">("");
  const [selectedCondition, setSelectedCondition] = useState(conditions[1]);
  const [needDumper, setNeedDumper] = useState(true);

  const activeSqft =
    typeof customSqFt === "number" && customSqFt > 0
      ? customSqFt
      : selectedPlot.sqft;

  // Base formula: 1,200 sqft light weed = ~2.5 hrs on a JCB 3DX
  const baseHours = (activeSqft / 1200) * 2.2 * selectedCondition.speedFactor;
  const estimatedHours = Math.max(2, Math.round(baseHours * 2) / 2);

  // Tipper truck calculation (300 cu.ft per 6-wheeler trip)
  const truckLoadsRaw =
    (activeSqft / 1200) * selectedCondition.dumpFactor * (needDumper ? 1 : 0);
  const estimatedTrucks = needDumper ? Math.max(1, Math.round(truckLoadsRaw)) : 0;

  const hourlyRate = 950;
  const dumperTripRate = 1800;
  const machineCost = estimatedHours * hourlyRate;
  const dumperCost = estimatedTrucks * dumperTripRate;
  const totalEstimatedCost = machineCost + dumperCost;

  const recommendedMachine =
    activeSqft > 15000
      ? "JCB 4DX Heavy Backhoe"
      : activeSqft < 1500
        ? "JCB 3DX / 3T Mini Excavator"
        : "JCB 3DX Super Backhoe";

  return (
    <div className="space-y-4 pb-28">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0b3d91] to-[#124ea3] p-4 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffcf5a]">
          <IconRuler size={16} /> {t.calcTitle}
        </div>
        <h2 className="mt-1 text-lg font-black tracking-tight">
          {t.calcHeader}
        </h2>
        <p className="mt-0.5 text-xs text-white/80">
          {t.calcDesc}
        </p>
      </div>

      {/* 1. Plot Dimensions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t.calcStep1}
        </label>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {standardPlots.map((plot) => {
            const isSelected =
              customSqFt === "" && selectedPlot.sqft === plot.sqft;
            return (
              <button
                key={plot.label}
                type="button"
                onClick={() => {
                  setCustomSqFt("");
                  setSelectedPlot(plot);
                }}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-[#0b3d91] bg-blue-50/70 ring-2 ring-[#0b3d91]/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                }`}
              >
                <span className="text-sm font-black text-slate-900">
                  {plot.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {plot.sqft.toLocaleString()} sq.ft
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600">{t.calcCustom}</span>
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="e.g. 1800"
              value={customSqFt}
              onChange={(e) => {
                const val = e.target.value;
                setCustomSqFt(val === "" ? "" : Number(val));
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-14 text-xs font-bold text-slate-900 outline-none focus:border-[#0b3d91] focus:ring-1 focus:ring-[#0b3d91]"
            />
            <span className="absolute right-2.5 top-1.5 text-[11px] font-bold text-slate-400">
              sq.ft
            </span>
          </div>
        </div>
      </div>

      {/* 2. Site Condition */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t.calcStep2}
        </label>
        <div className="mt-2.5 space-y-2">
          {conditions.map((cond) => {
            const isSelected = selectedCondition.id === cond.id;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => setSelectedCondition(cond)}
                className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-[#0b3d91] bg-blue-50/70 ring-2 ring-[#0b3d91]/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-xs font-black text-slate-900">
                    {cond.label}
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    {cond.desc}
                  </p>
                </div>
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[#0b3d91] bg-[#0b3d91] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <IconCheck size={12} stroke={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Debris Disposal & Dumper Truck */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <IconTruck size={15} className="text-[#0b3d91]" /> {t.calcStep3}
            </span>
            <p className="mt-0.5 text-[11px] text-slate-600">
              {t.calcStep3Desc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNeedDumper(!needDumper)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              needDumper ? "bg-[#0b3d91]" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                needDumper ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Estimation Results Card */}
      <div className="rounded-2xl border-2 border-[#ffb400] bg-gradient-to-b from-[#fffaf0] to-white p-4 shadow-md">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#ffb400] text-[#111827]">
              <IconShovel size={16} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#9c6c00]">
              {t.recommendedSetup}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {activeSqft.toLocaleString()} sq.ft
          </span>
        </div>

        <div className="mt-3">
          <p className="text-sm font-black text-slate-900">
            {recommendedMachine}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white p-2.5 border border-amber-100 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
                <IconClock size={14} className="text-[#0b3d91]" /> {t.machineTime}
              </div>
              <p className="mt-1 text-base font-black text-[#0b3d91]">
                ~{estimatedHours} {t.hoursLabel}
              </p>
              <p className="text-[10px] text-slate-500">@ ₹{hourlyRate}{t.perHour}</p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-amber-100 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
                <IconTrash size={14} className="text-emerald-600" /> {t.dumperTripsMetric}
              </div>
              <p className="mt-1 text-base font-black text-emerald-700">
                {needDumper ? `${estimatedTrucks} ${estimatedTrucks === 1 ? t.tripLabel : t.tripsLabel}` : "0"}
              </p>
              <p className="text-[10px] text-slate-500">
                {needDumper ? `@ ₹${dumperTripRate}/${t.tripLabel}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-[#0b3d91] px-3.5 py-2.5 text-white">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffcf5a]">
                {t.budgetEst}
              </span>
              <p className="text-lg font-black leading-tight">
                ₹{totalEstimatedCost.toLocaleString()}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-white/75 text-right">
              {t.fuelDriverIncluded}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500">
            <IconInfoCircle size={13} className="shrink-0 text-slate-400" />
            <span>{t.varianceNotice}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              onApplyEstimate({
                plotSize: `${activeSqft.toLocaleString()} sq.ft (${selectedPlot.label})`,
                condition: selectedCondition.label,
                hours: estimatedHours,
                truckTrips: estimatedTrucks,
                estimatedCost: totalEstimatedCost,
                machineName: recommendedMachine,
              })
            }
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb400] py-3 text-xs font-black uppercase tracking-wider text-[#111827] shadow-sm transition-all active:scale-[0.98] hover:bg-[#ffa700]"
          >
            {t.applyEstimateBtn} <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
