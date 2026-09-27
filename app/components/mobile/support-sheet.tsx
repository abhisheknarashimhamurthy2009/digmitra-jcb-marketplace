import {
  IconBrandWhatsapp,
  IconClock,
  IconFileText,
  IconHeadset,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";

import type { AppTranslations } from "@/lib/translations";

interface SupportSheetProps {
  t: AppTranslations;
}

export function SupportSheet({ t }: SupportSheetProps) {
  return (
    <div className="space-y-4 pb-28">
      {/* Helpline Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0b3d91] to-[#164a9c] p-4 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffcf5a]">
          <IconHeadset size={16} /> {t.supportHeader}
        </div>
        <h2 className="mt-1 text-lg font-black tracking-tight">
          {t.supportTitle}
        </h2>
        <p className="mt-0.5 text-xs text-white/80">
          {t.supportDesc}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href="tel:+918000112233"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#ffb400] py-3 text-xs font-black uppercase tracking-wider text-[#111827] shadow-sm active:scale-95"
          >
            <IconPhone size={16} /> {t.callDispatchBtn}
          </a>
          <a
            href="https://wa.me/918000112233?text=Hi%20DigMitra,%20I%20need%20assistance%20with%20site%20cleaning%20booking"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm active:scale-95"
          >
            <IconBrandWhatsapp size={16} /> {t.whatsAppBtn}
          </a>
        </div>
      </div>

      {/* Safety & Guarantee */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
          {t.guaranteeTitle}
        </h3>
        <div className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0b3d91]">
              <IconShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">
                {t.g1Title}
              </p>
              <p className="text-[11px] text-slate-600">
                {t.g1Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <IconClock size={18} />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">
                {t.g2Title}
              </p>
              <p className="text-[11px] text-slate-600">
                {t.g2Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <IconFileText size={18} />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">
                {t.g3Title}
              </p>
              <p className="text-[11px] text-slate-600">
                {t.g3Desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
          {t.faqTitle}
        </h3>
        <div className="mt-2.5 divide-y divide-slate-100 text-xs">
          <div className="py-2.5">
            <p className="font-black text-slate-900">
              What is the minimum booking time?
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Standard minimum booking is 2 hours. Travel / mobilization charges are waived for sites within 5 km of the machine yard.
            </p>
          </div>

          <div className="py-2.5">
            <p className="font-black text-slate-900">
              Does the JCB rate include fuel and operator?
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Yes! All hourly rates shown on the app include diesel fuel, expert machine operator, and routine site leveling blade work.
            </p>
          </div>

          <div className="py-2.5">
            <p className="font-black text-slate-900">
              How are debris tipper trucks charged?
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Tipper trucks (6-wheeler, ~300 cu.ft) are charged on a per-trip basis (₹1,800/trip), which includes loading by JCB, transportation, and municipal dump yard fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
