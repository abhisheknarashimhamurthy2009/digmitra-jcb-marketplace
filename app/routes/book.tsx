import {
  IconArrowLeft,
  IconCalendarEvent,
  IconCheck,
  IconMapPin,
  IconShovel,
} from "@tabler/icons-react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Book a JCB — DigMitra" }];
}

export default function BookRoute() {
  return (
    <div className="min-h-full bg-[#f5f7fa] text-[#111827]">
      <header className="border-b border-[#dce4ed] bg-[#0b3d91] text-white">
        <div className="mx-auto flex h-[72px] max-w-[1000px] items-center justify-between px-5 lg:px-8">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid size-10 place-items-center rounded-xl bg-[#ffb400] text-[#111827]">
              <IconShovel size={22} stroke={2.4} />
            </span>
            <span className="text-lg font-extrabold tracking-[-0.04em]">
              DigMitra
            </span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
            Booking request
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-12 lg:px-8 lg:py-20">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0b3d91]"
          to="/"
        >
          <IconArrowLeft size={17} /> Back to home
        </Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <section className="rounded-[16px] border border-[#dce4ed] bg-white p-6 shadow-[0_12px_28px_rgba(18,45,77,0.06)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff1c7] text-[#9c6c00]">
                <IconShovel size={21} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b3d91]">
                  Step 1 of 5
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  Tell us about the job
                </h1>
              </div>
            </div>
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-bold">
                What needs to be done?
                <select className="min-h-12 rounded-lg border border-[#cfd8e3] bg-white px-3 text-sm font-semibold outline-none focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15">
                  <option>Plot / site clearing</option>
                  <option>Debris or garbage removal</option>
                  <option>Levelling</option>
                  <option>Digging / trenching</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Where is the site?
                <span className="flex min-h-12 items-center gap-2 rounded-lg border border-[#cfd8e3] px-3 focus-within:border-[#0b3d91] focus-within:ring-2 focus-within:ring-[#0b3d91]/15">
                  <IconMapPin size={18} className="text-[#0b3d91]" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                    placeholder="Enter city, pincode, or landmark"
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                When do you need it?
                <span className="flex min-h-12 items-center gap-2 rounded-lg border border-[#cfd8e3] px-3 focus-within:border-[#0b3d91] focus-within:ring-2 focus-within:ring-[#0b3d91]/15">
                  <IconCalendarEvent size={18} className="text-[#0b3d91]" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                    placeholder="Today, tomorrow, or choose a date"
                  />
                </span>
              </label>
            </div>
            <button
              className="mt-8 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#ffb400] px-5 text-sm font-extrabold text-[#111827] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(255,180,0,0.28)]"
              type="button"
            >
              Continue to location
            </button>
          </section>
          <aside className="rounded-[16px] border border-[#dce4ed] bg-[#0b3d91] p-6 text-white sm:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffcf5a]">
              What happens next
            </p>
            <ul className="mt-5 grid gap-5">
              {[
                "Add your site location and size",
                "Set a comfortable budget",
                "Compare verified machines",
                "Confirm with a secure advance",
              ].map((item) => (
                <li
                  className="flex gap-3 text-sm font-semibold leading-5 text-white/85"
                  key={item}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#ffb400] text-[#111827]">
                    <IconCheck size={15} stroke={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-white/15 pt-5 text-xs leading-5 text-white/55">
              No payment is taken until you review the machine, owner, and full
              price breakdown.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
