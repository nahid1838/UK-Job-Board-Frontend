import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { backendRequest } from "@/lib/backend";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = { title: "Jobs | UK Job Board" };

type JobsPageProps = {
  searchParams: Promise<{ keyword?: string | string[]; location?: string | string[] }>;
};

type PublicJob = {
  _id: string;
  title: string;
  companyName: string;
  category: string;
  location: string;
  jobType: string;
  workMode: string;
  description: string;
  experience: string;
  closingDate: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string;
  rightToWork: boolean;
};

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
const inputStyle = "block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700";

function formatSalary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const minimum = job.salaryMin === null ? "" : pounds.format(job.salaryMin);
  const maximum = job.salaryMax === null ? "" : pounds.format(job.salaryMax);
  const range = minimum && maximum ? `${minimum}–${maximum}` : minimum ? `From ${minimum}` : `Up to ${maximum}`;
  return `${range} per ${job.salaryPeriod}`;
}

async function JobResults({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword.trim().slice(0, 120) : "";
  const location = typeof params.location === "string" ? params.location.trim().slice(0, 120) : "";
  const query = new URLSearchParams({ keyword, location });
  let jobs: PublicJob[] = [];
  let loadFailed = false;

  try {
    ({ jobs } = await backendRequest<{ jobs: PublicJob[] }>(`/api/jobs?${query}`, { signal: AbortSignal.timeout(5000) }));
  } catch {
    loadFailed = true;
  }

  return (
    <>
      <form action="/jobs" method="get" role="search" aria-label="Search jobs" className="mt-6 grid gap-3 rounded-xl bg-white p-4 text-slate-900 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="space-y-1 text-sm font-semibold">
          Keyword
          <input name="keyword" defaultValue={keyword} maxLength={120} placeholder="Job title or company" className={inputStyle} />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          UK location
          <input name="location" defaultValue={location} maxLength={120} placeholder="Town or city" className={inputStyle} />
        </label>
        <button className="min-h-11 rounded-lg bg-[#007653] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#005c41]">Search</button>
      </form>

      <section aria-labelledby="results-title" className="mt-8">
        <h2 id="results-title" className="text-xl font-bold text-slate-900">Search results</h2>
        {loadFailed ? (
          <p role="status" className="mt-3 rounded-xl bg-white p-5 text-slate-700">Jobs are temporarily unavailable. Refresh the page to try again.</p>
        ) : jobs.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-slate-700">{keyword || location ? "No jobs match your search." : "There are no live jobs yet."}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jobs.map((job) => (
              <li key={job._id} className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-800"><BriefcaseBusiness aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold">{job.title}</h3>
                    <p className="break-words text-sm text-slate-600">{job.companyName} · {job.category}</p>
                  </div>
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700">
                  <MapPin aria-hidden="true" className="size-4" /> {job.location} · {job.jobType} · {job.workMode}
                </p>
                <p className="mt-2 text-sm font-semibold text-emerald-800">{formatSalary(job)}</p>
                <Link href={`/jobs/${job._id}/apply`} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#007653] px-4 text-sm font-semibold text-white hover:bg-[#005c41]">Apply</Link>
                <details className="mt-3 border-t border-slate-100 pt-3 text-sm">
                  <summary className="cursor-pointer font-semibold">Job details</summary>
                  <p className="mt-3 whitespace-pre-wrap break-words text-slate-700">{job.description}</p>
                  <p className="mt-3 text-slate-600">Experience: {job.experience} · Closes {job.closingDate.split("-").reverse().join("/")}</p>
                  {job.rightToWork && <p className="mt-1 text-slate-600">Candidates must have the right to work in the UK.</p>}
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="rounded-2xl bg-[#063b37] p-6 text-white sm:p-8">
            <h1 className="text-3xl font-extrabold sm:text-4xl">All jobs</h1>
            <p className="mt-2 text-emerald-50">Find your next opportunity in the UK.</p>
          </header>
          <Suspense fallback={<p role="status" className="mt-6 text-sm">Loading jobs…</p>}>
            <JobResults searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
