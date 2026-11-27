import type { PublicJob } from "@/lib/public-jobs";
import { ArrowRight, Flame, MapPin } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "./company-logo";
import { SaveJobButton } from "./save-job-button";

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });

export function formatSalary(job: PublicJob) {
  if (job.salaryMin === null && job.salaryMax === null) return "Salary not listed";
  const minimum = job.salaryMin === null ? "" : pounds.format(job.salaryMin);
  const maximum = job.salaryMax === null ? "" : pounds.format(job.salaryMax);
  const range = minimum && maximum ? `${minimum}–${maximum}` : minimum ? `From ${minimum}` : `Up to ${maximum}`;
  return `${range} per ${job.salaryPeriod}`;
}

export function JobCard({ job, compact = false }: { job: PublicJob; compact?: boolean }) {
  const detailsHref = `/jobs/${job._id}`;

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 text-[#10213b] shadow-sm hover:border-emerald-200 hover:shadow-md motion-safe:transition motion-safe:hover:-translate-y-0.5">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <div className="min-w-0"><CompanyLogo name={job.companyName} src={job.companyLogo} /></div>
        <SaveJobButton id={job._id} />
      </div>
      <h3 className="mt-3 text-base font-bold [overflow-wrap:anywhere]"><Link href={detailsHref} className={`hover:text-emerald-800 hover:underline ${compact ? "line-clamp-2" : ""}`}>{job.title}</Link></h3>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600 sm:text-sm">
        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span className="min-w-0 [overflow-wrap:anywhere]">{job.location}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium text-slate-700 [overflow-wrap:anywhere]">
        <span className="rounded-md bg-slate-100 px-2 py-1">{job.jobType}</span>
        {!compact && job.workMode && <span className="rounded-md bg-slate-100 px-2 py-1">{job.workMode}</span>}
        {job.isFeatured && <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-orange-800"><Flame aria-hidden="true" className="size-3.5" /> Hot</span>}
      </div>
      <p className="mt-3 text-sm font-semibold text-emerald-900">{formatSalary(job)}</p>
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Link href={detailsHref} aria-label={`View details for ${job.title}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-200 px-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
            View details <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href={`${detailsHref}/apply`} aria-label={`Apply for ${job.title}`} className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-emerald-800 px-3 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Apply now</Link>
        </div>
      </div>
    </article>
  );
}
