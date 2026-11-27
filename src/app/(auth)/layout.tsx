import { BriefcaseBusiness, Building2, House, Search, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

const benefits = [
  { icon: Search, label: "Search Thousands of Jobs" },
  { icon: Building2, label: "Top UK Companies" },
  { icon: Zap, label: "Apply in Minutes" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex flex-1 flex-col bg-[#f3f9f8] text-[#091a2b]">
      <div className="flex flex-1 flex-col px-4 pt-4 sm:px-6">
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-lg text-[#073c2c] sm:gap-3">
            <BriefcaseBusiness aria-hidden="true" className="size-8 shrink-0 text-[#087b4c] sm:size-9" strokeWidth={2.4} />
            <span>
              <span className="block text-xl leading-none font-extrabold tracking-tight sm:text-xl">UKJobBoard</span>
              <span className="mt-1 block text-xs font-medium text-[#091a2b]">Your Career. Our Priority</span>
            </span>
          </Link>
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-sm text-sm font-semibold text-[#086542] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
            <House aria-hidden="true" className="size-4 sm:size-5" />
            <span><span className="hidden sm:inline">Back to </span>Home</span>
          </Link>
        </header>
        <main className="mx-auto grid w-full max-w-4xl flex-1 content-center gap-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-center md:gap-6">
          <aside className="relative isolate hidden overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#e7f4ef] px-6 pt-7 pb-40 md:block lg:px-8">
            <Image src={parliamentPhoto} alt="" fill sizes="(min-width: 768px) 450px, 0px" className="-z-10 object-cover object-[65%_center] opacity-85 [mask-image:linear-gradient(to_bottom,transparent_53%,black_88%)]" />
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-950"><span aria-hidden="true" className="size-2 rounded-full bg-emerald-600" />Welcome to UK JobBoard</p>
              <p className="text-3xl leading-tight font-bold lg:text-4xl tracking-tight">
                Find Your<br /><span className="text-[#076546]">Dream Job</span> in the UK
              </p>
              <p className="mt-3 max-w-[38ch] text-sm leading-relaxed">
                Connect with top employers across the United Kingdom and take the next step in your career.
              </p>
              <ul className="mt-4 grid gap-2">
                {benefits.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm font-medium">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100/90 text-[#076546]">
                      <Icon aria-hidden="true" className="size-1/2" strokeWidth={2.6} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="mx-auto w-full max-w-[26rem] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {children}
          </div>
        </main>
      </div>
      <footer className="border-t border-emerald-950/5 px-4 py-3">
        <nav aria-label="Help and policies" className="mx-auto flex max-w-xl items-center justify-center gap-3 text-sm before:hidden before:h-px before:flex-1 before:bg-slate-300 after:hidden after:h-px after:flex-1 after:bg-slate-300 sm:gap-5 sm:before:block sm:after:block">
          <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy Policy</Link>
          <span aria-hidden="true" className="text-emerald-800">|</span>
          <Link href="/terms" className="underline-offset-4 hover:underline">Terms</Link>
          <span aria-hidden="true" className="text-emerald-800">|</span>
          <Link href="/contact" className="underline-offset-4 hover:underline">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
