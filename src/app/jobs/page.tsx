import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { JobCard } from "@/components/jobs/job-card";
import { getPublicJobs, type PublicJob } from "@/lib/public-jobs";
import { getCategories, type Category } from "@/lib/categories";
import { Suspense } from "react";

export const metadata = { title: "Jobs | UK Job Board" };

type JobsPageProps = {
  searchParams: Promise<{ keyword?: string | string[]; location?: string | string[]; category?: string | string[] }>;
};

const inputStyle = "block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700";

async function JobResults({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword.trim().slice(0, 120) : "";
  const location = typeof params.location === "string" ? params.location.trim().slice(0, 120) : "";
  const category = typeof params.category === "string" && /^[a-f0-9]{24}$/i.test(params.category) ? params.category.toLowerCase() : "";
  const query = new URLSearchParams({ keyword, location, category });
  let jobs: PublicJob[] = [];
  let categories: Category[] = [];
  const [jobResult, categoryResult] = await Promise.allSettled([
    getPublicJobs(query),
    getCategories({ signal: AbortSignal.timeout(5000) }),
  ]);
  if (jobResult.status === "fulfilled") jobs = jobResult.value;
  if (categoryResult.status === "fulfilled") categories = categoryResult.value;

  return (
    <>
      <form action="/jobs" method="get" role="search" aria-label="Search jobs" className="mt-6 grid gap-3 rounded-xl bg-white p-4 text-slate-900 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <label className="space-y-1 text-sm font-semibold">
          Keyword
          <input name="keyword" defaultValue={keyword} maxLength={120} placeholder="Job title or company" className={inputStyle} />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          UK location
          <input name="location" defaultValue={location} maxLength={120} placeholder="Town or city" className={inputStyle} />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Category
          <select name="category" defaultValue={category} className={inputStyle}>
            <option value="">All categories</option>
            {category && !categories.some(({ _id }) => _id === category) && <option value={category}>Unavailable category</option>}
            {categories.map(({ _id, name }) => <option key={_id} value={_id}>{name}</option>)}
          </select>
        </label>
        <button className="min-h-11 rounded-lg bg-[#007653] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#005c41]">Search</button>
      </form>

      <section aria-labelledby="results-title" className="mt-8">
        <h2 id="results-title" className="text-xl font-bold text-slate-900">Search results</h2>
        {jobResult.status === "rejected" ? (
          <p role="status" className="mt-3 rounded-xl bg-white p-5 text-slate-700">Jobs are temporarily unavailable. Refresh the page to try again.</p>
        ) : jobs.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-slate-700">{keyword || location || category ? "No jobs match your search." : "There are no live jobs yet."}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jobs.map((job) => (
              <li key={job._id}><JobCard job={job} /></li>
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
