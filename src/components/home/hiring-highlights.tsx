import { JobCard } from "@/components/jobs/job-card";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { getPublicJobs } from "@/lib/public-jobs";
import { getPublicCompanies } from "@/lib/public-companies";
import { ArrowRight, Building2, Flame, Laptop, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function FeaturedJobs() {
  try {
    const jobs = await getPublicJobs(new URLSearchParams({ prioritiseFeatured: "true", limit: "3" }));
    if (jobs.length === 0) return <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">There are no open jobs yet.</p>;
    return <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <li key={job._id}><JobCard job={job} compact /></li>)}</ul>;
  } catch {
    return <p role="status" className="text-sm text-slate-600">Featured jobs are temporarily unavailable.</p>;
  }
}

export function HotJobs() {
  return (
    <section aria-labelledby="hot-jobs" className="mx-auto grid max-w-7xl items-start gap-5 px-4 pt-6 sm:px-0 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,29%)]">
      <div className="rounded-2xl border border-[#edf1f6] bg-white/80 p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="hot-jobs" className="flex items-center gap-2 text-xl font-extrabold tracking-tight"><Flame aria-hidden="true" className="size-6 fill-orange-400 text-orange-600" /> Hot Jobs</h2>
          <Link href="/jobs?featured=true" className="flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">View All <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <Suspense fallback={<p role="status">Loading featured jobs…</p>}><FeaturedJobs /></Suspense>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {[
          { title: "For Employers", text: "Post your jobs and find the best talent in the UK.", label: "Post a Job", href: "/employers/post-a-job", Icon: Building2 },
          { title: "For Job Seekers", text: "Create your profile and apply for jobs today.", label: "Create Account", href: "/register", Icon: UserRound },
        ].map(({ title, text, label, href, Icon }, index) => (
          <aside key={title} className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-[#def3e8] to-[#edf9ef] p-5 text-[#10213b]">
            <div aria-hidden="true" className="absolute right-2 bottom-1 -z-10 grid size-24 rotate-[-8deg] place-items-center rounded-full bg-[#bde8d2]/75 text-emerald-800 sm:right-3">
              <Icon className="absolute top-3 size-9" strokeWidth={1.6} /><Laptop className="absolute bottom-3 size-10" strokeWidth={1.6} />
            </div>
            <h2 className="text-lg font-extrabold">{title}</h2>
            <p className="mt-1 max-w-[18ch] text-sm text-slate-700">{text}</p>
            <Link href={href} className={`mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-800 px-3 text-xs font-bold hover:brightness-95 ${index === 0 ? "bg-[#0a5140] text-white" : "bg-white/40 text-emerald-900"}`}>{label}<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
          </aside>
        ))}
      </div>
    </section>
  );
}

export async function CompanyCards({ hiringOnly = false }: { hiringOnly?: boolean }) {
  try {
    const companies = await getPublicCompanies();
    const visible = hiringOnly ? companies.filter(({ jobCount }) => jobCount > 0).slice(0, 8) : companies;
    if (!visible.length) return <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">No {hiringOnly ? "companies are hiring" : "approved companies"} yet.</p>;
    return (
      <ul className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${hiringOnly ? "lg:grid-cols-8" : "lg:grid-cols-6"}`}>
        {visible.map((company) => (
          <li key={company.id} className="min-w-0">
            <Link href={`/companies/${company.id}`} aria-label={`View ${company.name}, ${company.jobCount} open jobs`} className="flex h-full min-h-16 flex-col items-center justify-center rounded-xl border border-[#e9eef5] bg-white p-3 shadow-sm hover:border-emerald-300 motion-safe:transition motion-safe:hover:-translate-y-0.5">
              <CompanyLogo name={company.name} src={company.logoUrl} />
              {!hiringOnly && <span className="mt-2 text-sm text-slate-600">{company.jobCount} open {company.jobCount === 1 ? "job" : "jobs"}</span>}
            </Link>
          </li>
        ))}
      </ul>
    );
  } catch {
    return <p role="status" className="text-sm text-slate-600">Companies are temporarily unavailable.</p>;
  }
}

export function HiringCompanies() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-9 sm:px-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Building2 aria-hidden="true" className="mt-1 size-6 text-emerald-800" />
          <div><h2 className="text-xl font-extrabold tracking-tight">Top Hiring Companies</h2><p className="text-sm text-slate-600">Join leading companies across the UK</p></div>
        </div>
        <Link href="/companies" className="text-sm font-semibold text-emerald-800 hover:underline">View all companies</Link>
      </div>
      <Suspense fallback={<p role="status">Loading companies…</p>}><CompanyCards hiringOnly /></Suspense>
    </section>
  );
}
