import { BriefcaseBusiness } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-6 font-sans text-[#10213b] sm:px-8 sm:py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 md:grid-cols-[2fr_3fr]">
        <aside className="relative isolate overflow-hidden bg-[#062c2b] px-6 py-5 text-white sm:px-10 md:flex md:flex-col md:px-8 md:pt-8 md:pb-0 lg:px-10 lg:pt-10">
          <Link href="/" aria-label="UK Job Board home" className="inline-flex w-fit items-center gap-3 rounded-lg text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-300 text-[#062c2b]">
              <BriefcaseBusiness aria-hidden="true" className="size-5" />
            </span>
            UK Job Board
          </Link>
          <div className="mt-10 hidden md:block lg:mt-12">
            <p className="max-w-[15ch] text-3xl leading-[1.08] font-extrabold tracking-tight lg:text-4xl">
              Your next step starts <span className="text-emerald-300">here.</span>
            </p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-emerald-50/85">
              Explore opportunities with employers across the UK.
            </p>
          </div>
          <div className="relative -mx-8 mt-5 hidden min-h-48 flex-1 md:block lg:-mx-10">
            <Image
              src={parliamentPhoto}
              alt=""
              fill
              sizes="(max-width: 1023px) 400px, 540px"
              className="object-cover object-[68%_45%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-[#062c2b] from-0% via-transparent via-40% to-[#062c2b]/35" />
          </div>
        </aside>
        <div className="mx-auto w-full max-w-lg px-6 py-8 sm:px-10 sm:py-12">
          {children}
        </div>
      </div>
    </main>
  );
}
