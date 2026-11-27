import { BriefcaseBusiness, Flame, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/categories";
import { getJobResults } from "@/lib/public-jobs";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

const popularSearches = ["Developer", "Designer", "Marketing", "Manager", "Remote"];
const fieldStyle = "flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-[#13273d] focus-within:ring-2 focus-within:ring-emerald-700";

async function Categories() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories({ signal: AbortSignal.timeout(4000) });
  } catch {
    // Keyword and location search remain available.
  }

  return (
    <select name="category" aria-label="Job category" className="min-h-10 w-full bg-transparent text-sm outline-none">
      <option value="">All Categories</option>
      {categories.map(({ _id, name }) => <option key={_id} value={_id}>{name}</option>)}
    </select>
  );
}

async function JobCount() {
  try {
    const { total } = await getJobResults(new URLSearchParams({ limit: "1" }));
    return <strong className="block text-xl leading-tight sm:text-2xl">{total.toLocaleString("en-GB")}</strong>;
  } catch {
    return <Link href="/jobs" className="block text-sm font-semibold underline">Browse jobs</Link>;
  }
}

export function HomeBanner() {
  return (
    <section aria-labelledby="home-banner-title" className="relative isolate overflow-hidden bg-linear-to-br from-white via-[#f5f9fc] to-[#e2f3e9] text-[#10243a]">
      <div className="pointer-events-none absolute -right-12 -bottom-24 h-72 w-3/5 -rotate-12 rounded-[50%] bg-[#b7e1cd]/55" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center px-5 sm:px-8 lg:min-h-[368px] lg:px-10">
        <div className="relative z-20 max-w-[49rem] pt-8 pb-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 lg:py-9">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#e6f3ec] px-3 py-1.5 text-xs font-bold text-[#084b38]"><span aria-hidden="true" className="uk-flag" /> United Kingdom’s Premier Job Board</p>
          <h1 id="home-banner-title" className="mt-4 w-fit bg-linear-to-br from-[#0a1d32] via-[#084636] to-[#007754] bg-clip-text text-[clamp(2.45rem,5.25vw,4.35rem)] leading-[.99] font-extrabold tracking-tight text-transparent">
            <span className="block sm:whitespace-nowrap">Your Next Career</span>{" "}
            <span className="block">Starts Here</span>
          </h1>
          <p className="mt-4 max-w-[29rem] text-base leading-snug text-slate-700 sm:text-lg">Discover thousands of jobs across the UK. Search, apply and take the next step in your career journey.</p>

          <form action="/jobs" method="get" role="search" aria-label="Find UK jobs" className="mt-6 grid max-w-3xl gap-2 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-lg shadow-slate-900/10 sm:grid-cols-2 lg:grid-cols-[1.18fr_1fr_.95fr_auto]">
            <label className={fieldStyle}>
              <Search aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Job title or keywords</span>
              <input name="keyword" placeholder="Job title, keywords…" className="w-full min-w-0 bg-transparent text-sm outline-none" />
            </label>
            <label className={fieldStyle}>
              <MapPin aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">UK location</span>
              <input name="location" placeholder="UK Location" className="w-full min-w-0 bg-transparent text-sm outline-none" />
            </label>
            <div className={fieldStyle}>
              <Suspense fallback={<span className="text-sm">All Categories</span>}><Categories /></Suspense>
            </div>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#006a49] to-[#008052] px-5 text-sm font-bold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
              <Search aria-hidden="true" className="size-4" /> Search
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="mr-1 inline-flex items-center gap-1.5 font-bold"><Flame aria-hidden="true" className="size-4 text-orange-600" /> Popular Searches:</span>
            {popularSearches.map((term) => (
              <Link key={term} href={term === "Remote" ? "/jobs?workMode=Remote" : `/jobs?keyword=${term}`} className="rounded-full bg-[#e8edf5] px-3 py-1.5 font-medium hover:bg-emerald-100">{term}</Link>
            ))}
          </div>
        </div>

        <div className="relative mb-5 h-52 sm:h-64 lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:h-auto lg:w-[46%]">
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[46%_42%_45%_46%/43%_37%_25%_43%] bg-emerald-100 lg:-right-8">
            <Image src={parliamentPhoto} alt="" fill preload sizes="(max-width: 1023px) 100vw, 48vw" className="object-cover object-[63%_42%]" />
            <div className="absolute -right-44 top-5 size-72 rounded-full border-[12px] border-[#8bd4af]/75 bg-[#087352]/90 ring-8 ring-white/70 lg:-right-56 lg:size-88" />
          </div>
          <div className="absolute right-4 bottom-4 z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg lg:top-[35%] lg:bottom-auto lg:right-6">
            <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-800"><BriefcaseBusiness aria-hidden="true" className="size-5" /></span>
            <div>
              <p className="text-xs font-semibold">Jobs in the UK</p>
              <Suspense fallback={<span className="text-sm">Loading…</span>}><JobCount /></Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
