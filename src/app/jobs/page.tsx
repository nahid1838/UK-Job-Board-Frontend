import { ContentSkeleton } from "@/components/shared/content-skeleton";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { JobCard } from "@/components/jobs/job-card";
import { getJobResults } from "@/lib/public-jobs";
import { getPublicCompanies } from "@/lib/public-companies";
import { getCategories, type Category } from "@/lib/categories";
import { Suspense } from "react";
import Link from "next/link";

export const metadata = { title: "Jobs | UK Job Board" };

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputStyle = "block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700";

async function JobResults({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword.trim().slice(0, 120) : "";
  const location = typeof params.location === "string" ? params.location.trim().slice(0, 120) : "";
  const category = typeof params.category === "string" && /^[a-f0-9]{24}$/i.test(params.category) ? params.category.toLowerCase() : "";
  const query = new URLSearchParams({ limit: "12", prioritiseFeatured: "true" });
  for (const [key, value] of Object.entries({ ...params, keyword, location, category })) {
    if (typeof value === "string" && value && ["keyword", "location", "category", "jobType", "workMode", "company", "posted", "sort", "minSalary", "maxSalary", "salaryPeriod", "page", "featured"].includes(key)) {
      query.set(key, value.slice(0, 120));
    }
  }
  const [jobResult, categoryResult, companyResult] = await Promise.allSettled([
    getJobResults(query),
    getCategories({ signal: AbortSignal.timeout(5000) }),
    getPublicCompanies(),
  ]);
  const results = jobResult.status === "fulfilled" ? jobResult.value : undefined;
  const jobs = results?.jobs ?? [];
  const categories: Category[] = categoryResult.status === "fulfilled" ? categoryResult.value : [];
  const companies = companyResult.status === "fulfilled" ? [...new Set(companyResult.value.map(({ name }) => name))] : [];
  const selectFilters = [
    { name: "jobType", label: "Job type", options: ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Apprenticeship"].map((value) => [value, value]) },
    { name: "workMode", label: "Work mode", options: ["On-site", "Hybrid", "Remote"].map((value) => [value, value]) },
    { name: "company", label: "Company", options: companies.map((value) => [value, value]) },
    { name: "posted", label: "Date posted", options: [["1", "Last 24 hours"], ["7", "Last 7 days"], ["30", "Last 30 days"]] },
    { name: "salaryPeriod", label: "Pay period", options: [["year", "Per year"], ["month", "Per month"], ["day", "Per day"], ["hour", "Per hour"]] },
    { name: "sort", label: "Sort by", options: [["newest", "Newest"], ["closing", "Closing soon"], ["salary", "Highest salary"]] },
  ];

  function pageHref(page: number) {
    const filters = new URLSearchParams(query);
    filters.delete("limit");
    filters.delete("prioritiseFeatured");
    filters.set("page", String(page));
    return `/jobs?${filters}`;
  }

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
        {selectFilters.map(({ name, label, options }) => (
          <label key={name} className="space-y-1 text-sm font-semibold">
            {label}
            <select name={name} defaultValue={query.get(name) ?? (name === "sort" ? "newest" : "")} className={inputStyle}>
              {name !== "sort" && <option value="">Any</option>}
              {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ))}
        <label className="space-y-1 text-sm font-semibold">Minimum pay (£)
          <input name="minSalary" type="number" min={0} step="0.01" defaultValue={query.get("minSalary") ?? ""} className={inputStyle} />
        </label>
        <label className="space-y-1 text-sm font-semibold">Maximum pay (£)
          <input name="maxSalary" type="number" min={0} step="0.01" defaultValue={query.get("maxSalary") ?? ""} className={inputStyle} />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="featured" type="checkbox" value="true" defaultChecked={query.get("featured") === "true"} className="size-4 accent-emerald-700" /> Hot jobs only</label>
          <button className="min-h-11 rounded-lg bg-[#007653] px-5 text-sm font-semibold text-white hover:bg-[#005c41]">Search</button>
          <Link href="/jobs" className="text-sm font-semibold text-emerald-800 hover:underline">Clear filters</Link>
        </div>
      </form>

      <section aria-labelledby="results-title" className="mt-8">
        <h2 id="results-title" className="text-xl font-bold text-slate-900">Search results</h2>
        {results && <p className="mt-1 text-sm text-slate-600">{results.total} {results.total === 1 ? "job" : "jobs"} found</p>}
        {jobResult.status === "rejected" ? (
          <p role="status" className="mt-3 rounded-xl bg-white p-5 text-slate-700">Jobs are temporarily unavailable. Refresh the page to try again.</p>
        ) : jobs.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-slate-700">No jobs match your search.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job._id}><JobCard job={job} /></li>
            ))}
          </ul>
        )}
        {results && results.pages > 1 && (
          <nav aria-label="Job search pages" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            {results.page > 1 && <Link className="font-semibold text-emerald-800 hover:underline" href={pageHref(results.page - 1)}>Previous</Link>}
            <span>Page {results.page} of {results.pages}</span>
            {results.page < results.pages && <Link className="font-semibold text-emerald-800 hover:underline" href={pageHref(results.page + 1)}>Next</Link>}
          </nav>
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
        <div className="mx-auto max-w-6xl">
          <header className="rounded-2xl bg-[#063b37] p-6 text-white sm:p-8">
            <h1 className="text-3xl font-extrabold sm:text-4xl">All jobs</h1>
            <p className="mt-2 text-emerald-50">Find your next opportunity in the UK.</p>
          </header>
          <Suspense fallback={<ContentSkeleton label="Loading jobs…" className="mt-6 text-sm" />}>
            <JobResults searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
