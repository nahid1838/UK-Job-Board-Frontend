import { ArrowRight, Star, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

function testimonials() {
  try {
    const value: unknown = JSON.parse(process.env.SITE_TESTIMONIALS ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is { name: string; role: string; quote: string } =>
      Boolean(item && typeof item.name === "string" && item.name.trim() &&
        typeof item.role === "string" && typeof item.quote === "string" && item.quote.trim()),
    ).slice(0, 3);
  } catch {
    return [];
  }
}

export function CareerCommunity() {
  const stories = testimonials();
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
      <section aria-labelledby="user-stories" className="mt-8">
        <div className="flex items-start gap-3">
          <Star aria-hidden="true" className="mt-1 size-6 fill-amber-300 text-amber-500" />
          <div>
            <h2 id="user-stories" className="text-xl font-extrabold tracking-tight">What Our Users Say</h2>
            <p className="text-sm text-slate-600">Stories from job seekers and employers</p>
          </div>
        </div>
        {stories.length ? <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {stories.map(({ name, role, quote }) => (
            <li key={`${name}-${quote}`} className="rounded-xl border border-[#e9eef5] bg-white p-4 shadow-sm">
              <figure className="flex items-start gap-3">
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-50 font-bold text-emerald-800">{name.trim()[0].toUpperCase()}</span>
                <div className="min-w-0">
                  <blockquote className="text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">“{quote}”</blockquote>
                  <figcaption className="mt-3 text-sm font-bold">{name}<span className="block text-xs font-normal text-slate-600">{role}</span></figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul> : (
          <div className="mt-4 rounded-xl border border-[#e9eef5] bg-white p-4 text-sm text-slate-600 shadow-sm">
            Have a story to share? <Link href="/contact" className="font-semibold text-emerald-800 underline">Contact us</Link>.
          </div>
        )}
      </section>
    </div>
  );
}
