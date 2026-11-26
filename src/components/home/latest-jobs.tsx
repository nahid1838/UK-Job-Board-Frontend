import { JobCard } from "@/components/jobs/job-card";
import { getPublicJobs } from "@/lib/public-jobs";
import Link from "next/link";
import { Suspense } from "react";

async function LatestJobCards() {
  try {
    // The jobs API returns open listings in newest-published order.
    const jobs = (await getPublicJobs()).slice(0, 6);

    if (jobs.length === 0) {
      return <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">There are no live jobs yet.</p>;
    }

    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => <li key={job._id} className="min-w-0"><JobCard job={job} compact /></li>)}
      </ul>
    );
  } catch {
    return <p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Latest jobs are temporarily unavailable. Refresh the page to try again.</p>;
  }
}

export function LatestJobs() {
  return (
    <section aria-labelledby="latest-jobs-title" className="mx-auto max-w-7xl px-4 pt-9 text-[#10213b] sm:px-0 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id="latest-jobs-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Latest Jobs</h2>
        <Link href="/jobs" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">View all jobs</Link>
      </div>
      <Suspense fallback={<p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading latest jobs…</p>}>
        <LatestJobCards />
      </Suspense>
    </section>
  );
}
