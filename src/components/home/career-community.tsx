import { ArrowRight, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

export function CareerCommunity() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-0">
      <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-xl bg-[#0e5b48] px-5 py-4 text-white shadow-sm sm:px-8">
        <Image src={parliamentPhoto} alt="" fill sizes="(max-width: 1024px) 100vw, 1280px" className="-z-20 object-cover object-[center_62%] opacity-20 mix-blend-luminosity" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#0c4d40] via-[#0b593f]/70 to-[#137651]/65" />
        <div className="flex items-center gap-4 sm:gap-8">
          <Trophy aria-hidden="true" className="size-10 shrink-0 fill-amber-300 text-amber-500 sm:size-12" />
          <div>
            <h2 className="text-lg font-extrabold sm:text-2xl">Take the Next Step in Your Career</h2>
            <p className="mt-0.5 text-sm text-emerald-50">Find your next role with employers across the UK.</p>
          </div>
        </div>
        <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-emerald-950 hover:bg-emerald-50">Browse All Jobs <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </section>
    </div>
  );
}
