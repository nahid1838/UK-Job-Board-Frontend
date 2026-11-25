import { BriefcaseBusiness, Building2, MapPin, Search, Users } from "lucide-react";
import Image from "next/image";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

// These values reproduce the showcase until the job board has real counts.
const showcaseStats = [
  { value: "10K+", label: "Active Jobs", Icon: BriefcaseBusiness },
  { value: "2K+", label: "Companies", Icon: Building2 },
  { value: "500K+", label: "Job Seekers", Icon: Users },
];

export function HomeBanner() {
  return (
    <section
      aria-labelledby="home-banner-title"
      className="relative isolate mx-auto max-w-7xl overflow-hidden bg-linear-to-br from-[#002b29] via-[#00474a] to-[#00765f] text-white sm:rounded-2xl"
    >
      <div className="relative z-10 px-5 pt-8 motion-safe:animate-in motion-safe:fade-in-75 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 sm:px-10 sm:pt-11 md:pt-12 lg:pt-14">
        <p className="mb-4 hidden w-fit items-center gap-2 rounded-full bg-[#08634f] px-3 py-1.5 text-sm font-semibold sm:flex">
          <span aria-hidden="true">🇬🇧</span> Find Your Dream Job in the UK
        </p>

        <h1 id="home-banner-title" className="text-[clamp(2rem,8vw,4.5rem)] leading-[1.02] font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
          <span className="block">Your Next</span>
          <span className="block">Career Step</span>
          <span className="block text-[#36ed9d]">Starts Here</span>
        </h1>

        <p className="mt-4 max-w-xs text-base leading-snug text-white sm:text-lg lg:max-w-sm lg:text-xl">
          Explore thousands of jobs across the UK from trusted companies.
        </p>

        <form
          action="/jobs"
          method="get"
          role="search"
          aria-label="Find UK jobs"
          className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-1 rounded-xl bg-white p-1.5 text-[#10213b] shadow-lg shadow-black/20 sm:flex sm:max-w-2xl sm:items-center lg:max-w-[73%] xl:max-w-[74%]"
        >
          <label className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-700 sm:flex-[3]">
            <Search aria-hidden="true" className="size-5 shrink-0" />
            <span className="sr-only">Job title or keyword</span>
            <input name="keyword" placeholder="Job title, keywords…" className="min-h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-slate-600" />
          </label>

          <label className="col-start-1 row-start-2 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-700 sm:flex-[2]">
            <MapPin aria-hidden="true" className="size-5 shrink-0" />
            <span className="sr-only">UK location</span>
            <input name="location" placeholder="UK Location" className="min-h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-slate-600" />
          </label>

          <button type="submit" aria-label="Search jobs" className="col-start-2 row-span-2 row-start-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#007653] px-3 font-semibold text-white hover:bg-[#005c41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 motion-safe:transition-colors sm:px-8">
            <Search aria-hidden="true" className="size-5 sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      </div>

      <div aria-hidden="true" className="relative mt-4 h-48 overflow-hidden bg-[#159b87] sm:h-64 md:absolute md:inset-y-0 md:right-0 md:mt-0 md:h-auto md:w-[49%] md:[clip-path:ellipse(100%_56%_at_100%_48%)]">
        <div className="absolute inset-0 [clip-path:ellipse(94%_91%_at_100%_91%)] md:[clip-path:ellipse(92%_54%_at_100%_47%)]">
          <Image
            src={parliamentPhoto}
            alt=""
            fill
            preload
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 580px, 700px"
            className="object-cover object-[65%_30%] md:object-[65%_center]"
          />
        </div>
      </div>

      <dl className="relative z-10 grid grid-cols-3 divide-x divide-emerald-200/25 bg-[#003530] px-2 py-4 sm:px-8 md:my-6 md:w-[68%] md:bg-transparent md:py-1 lg:my-9">
        {showcaseStats.map(({ value, label, Icon }) => (
          <div key={label} className="flex items-center justify-center gap-1.5 px-1 sm:gap-3 sm:px-3">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-[#36ed9d] sm:size-7 lg:size-9" />
            <div className="flex flex-col-reverse">
              <dt className="text-[11px] leading-tight sm:text-sm">{label}</dt>
              <dd className="text-lg leading-tight font-extrabold sm:text-2xl lg:text-3xl">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
