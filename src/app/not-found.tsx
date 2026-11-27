import { ArrowRight, BriefcaseBusiness, House } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-[#f3f9f8] px-4 py-12 text-center text-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
          <BriefcaseBusiness aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-5 text-sm font-semibold text-emerald-800">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          This page may have moved or the link may be out of date. You can return home or browse available jobs.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50">
            <House aria-hidden="true" className="size-4" /> Back to Home
          </Link>
          <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900">
            Browse jobs <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
