import type { PublicJob } from "@/lib/public-jobs";
import { MapPin } from "lucide-react";
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
  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-[#e9eef5] bg-white p-4 text-[#10213b] shadow-sm hover:border-emerald-200 motion-safe:transition motion-safe:hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        {job.isFeatured ? <span className="rounded-full bg-[#f83e4f] px-2 py-0.5 text-xs font-bold text-white">Hot</span> : <span />}
        <SaveJobButton id={job._id} />
      </div>
      <div className="mt-1 flex min-h-9 items-center">
        <CompanyLogo name={job.companyName} src={job.companyLogo} />
      </div>
      <h3 className="mt-3 text-sm font-extrabold [overflow-wrap:anywhere] sm:text-base"><Link href={`/jobs/${job._id}`} className={`hover:text-emerald-800 hover:underline ${compact ? "line-clamp-2" : ""}`}>{job.title}</Link></h3>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600 sm:text-sm">
        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span className={`min-w-0 [overflow-wrap:anywhere] ${compact ? "line-clamp-1" : ""}`}>{job.location} · {job.jobType}{compact ? "" : ` · ${job.workMode}`}</span>
      </p>
      <p className="mt-1.5 text-sm font-medium">{formatSalary(job)}</p>
      <div className="mt-auto pt-4">
        <Link href={`/jobs/${job._id}/apply`} aria-label={`Apply for ${job.title}`} className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-linear-to-r from-[#007749] to-[#08874c] px-4 text-sm font-bold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Apply Now</Link>
      </div>
      {!compact && (
        <details className="mt-4 border-t border-slate-100 pt-3 text-sm">
          <summary className="cursor-pointer font-semibold">Job details</summary>
          <p className="mt-3 whitespace-pre-wrap text-slate-700 [overflow-wrap:anywhere]">{job.description}</p>
          <p className="mt-3 text-slate-600">Experience: {job.experience} · Closes {job.closingDate.split("-").reverse().join("/")}</p>
          {job.rightToWork && <p className="mt-1 text-slate-600">Candidates must have the right to work in the UK.</p>}
        </details>
      )}
    </article>
  );
}
