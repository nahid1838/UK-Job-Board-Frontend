"use client";

import { ArrowRight, BadgeCheck, BriefcaseBusiness, CircleCheck, ClipboardList, Clock3, Eye, Flame, Mail, MoreHorizontal, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EmployerPerformance, type PerformancePoint } from "./employer-performance";
import welcomeArt from "../../../public/images/employer-dashboard-welcome.png";

export type EmployerDashboardData = {
  company: { name: string; status: "pending" | "approved" | "rejected"; logoUrl?: string; rejectionReason?: string } | null;
  stats: { jobs: number; applications: number; hot: number; views: number };
  jobs: { _id: string; title: string; location: string; jobType: string; status: "draft" | "live" | "closed"; closingDate: string; publishedAt?: string; createdAt: string }[];
  applications: { _id: string; name: string; jobTitle: string; forwardedAt?: string; createdAt: string; employerStatus?: "reviewed" | "shortlisted" | "not-suitable" }[];
  series: PerformancePoint[];
  notifications: { id: string; title: string; detail: string; date: string; href: string }[];
  preferences: { showNotificationBadge: boolean; notificationsReadAt?: string };
};

export const employerHref = (route = "") => `/dashboard/employer${route ? `/${route}` : ""}`;
export const employerPanel = "min-w-0 rounded-2xl border border-[#e0e8ee] bg-white p-4 shadow-sm sm:p-5";
export const employerPrimary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#07573f] px-4 text-sm font-bold text-white hover:bg-[#064632] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";
export const employerTextLink = "inline-flex items-center gap-1.5 rounded-sm text-sm font-bold text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-800";
export const employerDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" });
const dateOnly = new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", timeZone: "Europe/London" });

export function CompanyAvatar({ name, logo, small }: { name: string; logo?: string; small?: boolean }) {
  const size = small ? "size-10" : "size-12";
  return logo
    ? <Image src={logo} alt="" unoptimized width={48} height={48} className={`${size} shrink-0 rounded-full border border-emerald-100 bg-white p-1 object-contain`} />
    : <span aria-hidden="true" className={`grid ${size} shrink-0 place-items-center rounded-full bg-[#d9f1e7] text-sm font-extrabold text-emerald-900`}>{name.trim()[0]?.toUpperCase() || "U"}</span>;
}

export function EmployerOverview({ data, name, days, changeDays, error }: {
  data?: EmployerDashboardData;
  name: string;
  days: number;
  changeDays: (days: number) => void;
  error: string;
}) {
  const status = data?.company?.status;
  const company = data?.company;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const formatter = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });
  const statusLabel = status === "approved" ? "Approved" : status === "pending" ? "Pending review" : status === "rejected" ? "Changes requested" : data ? "Company setup" : "Loading…";
  const statusCopy = status === "approved" ? "Your company is approved. You can post and manage jobs."
    : status === "pending" ? "An admin is reviewing your company application."
    : status === "rejected" ? company?.rejectionReason || "Update your company application and submit it again."
    : "Submit your company details to get approved for job posting.";
  const StatusIcon = status === "approved" ? CircleCheck : status === "rejected" ? XCircle : Clock3;

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-2xl bg-linear-to-r from-[#d9eee7] via-[#d7eee6] to-[#a5daca] p-5 sm:p-7">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[54%] lg:block">
          <Image src={welcomeArt} alt="" fill sizes="(min-width: 1500px) 720px, 45vw" className="object-contain object-right-bottom" />
        </div>
        <h1 className="max-w-[38rem] text-2xl font-extrabold tracking-tight text-[#092b22] [overflow-wrap:anywhere] sm:text-3xl">Welcome back, {name}!</h1>
        <p className="mt-1.5 max-w-md text-sm font-medium text-slate-800 sm:text-base">Manage your jobs, track applications and grow your team in the UK.</p>
        <Link href={employerHref(status === "approved" ? "post-a-job" : "company")} className={`mt-4 ${employerPrimary}`}>{status === "approved" ? "Post a New Job" : "My Company"} <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </section>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <ul aria-label="Employer metrics" className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total Jobs", value: data?.stats.jobs, Icon: BriefcaseBusiness, to: "jobs", colour: "bg-emerald-100 text-emerald-800" },
          { label: "Total Applications", value: data?.stats.applications, Icon: ClipboardList, to: "applications", colour: "bg-emerald-100 text-emerald-800" },
          { label: "Hot Jobs", value: data?.stats.hot, Icon: Flame, to: "featured", colour: "bg-rose-100 text-rose-700" },
          { label: "Job Views", value: data?.stats.views, Icon: Eye, to: "#performance", colour: "bg-emerald-100 text-emerald-800" },
        ].map(({ label, value, Icon, to, colour }) => (
          <li key={label} className="min-w-0 rounded-2xl border border-[#e0e8ee] bg-white/95">
            <Link href={to.startsWith("#") ? to : employerHref(to)} className="flex h-full items-center gap-2 rounded-2xl p-3 hover:bg-emerald-50/70 sm:gap-3 sm:p-4">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full sm:size-13 ${colour}`}><Icon aria-hidden="true" className="size-5 sm:size-7" /></span>
              <span className="min-w-0"><span className="block text-xl font-extrabold leading-tight sm:text-2xl">{value === undefined ? "—" : formatter.format(value)}</span><span className="block text-xs leading-snug text-slate-700 sm:text-sm">{label}</span></span>
            </Link>
          </li>
        ))}
      </ul>

      <div id="performance" className="mt-4 grid scroll-mt-4 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
        <EmployerPerformance series={data?.series ?? []} days={days} onRangeChange={changeDays} />
        <section className={employerPanel}>
          <h2 className="flex items-center gap-2 text-lg font-extrabold"><BadgeCheck aria-hidden="true" className="size-5 text-emerald-700" /> Company Status</h2>
          <div className="mt-6 flex flex-col items-center text-center">
            <span className={`grid size-14 place-items-center rounded-full ${status === "approved" ? "bg-[#09874e] text-white" : "bg-amber-50 text-amber-800"}`}><StatusIcon aria-hidden="true" className="size-9" /></span>
            <h3 className="mt-2 text-xl font-extrabold">{statusLabel}</h3>
            <p className="mt-1.5 max-w-xs text-sm text-slate-700">{statusCopy}</p>
            <Link href={employerHref("company")} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#d9f1e7] px-3 text-sm font-bold text-emerald-950 hover:bg-emerald-100">View Company Details <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)]">
        <section className={employerPanel}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold"><BriefcaseBusiness aria-hidden="true" className="size-5 text-emerald-800" /> Your Recent Jobs</h2>
            <Link href={employerHref("jobs")} className={employerTextLink}>View All Jobs <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {data?.jobs.length ? (
            <div className="overflow-x-auto rounded-xl border border-[#e7edf1]" tabIndex={0} role="region" aria-label="Recent job listings">
              <table className="w-full min-w-[33rem] text-left text-sm">
                <thead className="bg-[#ebf1f6] text-slate-700"><tr>{["Job Title", "Location", "Type", "Status", "Posted On", "Actions"].map((label) => <th key={label} scope="col" className="px-2.5 py-2 font-bold">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {data.jobs.map((job) => {
                    const label = job.status === "live" ? (job.closingDate < today ? "Expired" : "Active") : job.status === "draft" ? "Draft" : "Closed";
                    return <tr key={job._id}>
                      <td className="px-2.5 py-2 font-semibold [overflow-wrap:anywhere]">{job.title}</td>
                      <td className="px-2.5 py-2">{job.location}</td><td className="whitespace-nowrap px-2.5 py-2">{job.jobType}</td>
                      <td className="px-2.5 py-2"><span className={`rounded-full px-2 py-1 text-xs font-bold ${label === "Active" ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>{label}</span></td>
                      <td className="whitespace-nowrap px-2.5 py-2">{job.publishedAt ? employerDate.format(new Date(job.publishedAt)) : "—"}</td>
                      <td className="px-2.5 py-2"><Link href={`${employerHref("jobs")}#job-${job._id}`} aria-label={`Manage ${job.title}`} className="inline-grid size-8 place-items-center rounded-lg hover:bg-slate-100"><MoreHorizontal aria-hidden="true" className="size-4" /></Link></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{data ? "Your jobs will appear here." : "Loading your jobs…"}</p>}
        </section>
        <section className={employerPanel}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold"><Mail aria-hidden="true" className="size-5 text-emerald-800" /> Recent Applications</h2>
            <Link href={employerHref("applications")} className={employerTextLink}>View All <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {data?.applications.length ? <ul className="divide-y divide-slate-100">
            {data.applications.map((entry) => (
              <li key={entry._id}>
                <Link href={`${employerHref("applications")}#application-${encodeURIComponent(entry._id)}`} className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg py-2.5 hover:bg-emerald-50/70">
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d9f1e7] text-xs font-bold text-emerald-900">{entry.name.trim()[0]?.toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{entry.name}</span><span className="block truncate text-xs text-slate-600">{entry.jobTitle}</span></span>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${entry.employerStatus === "not-suitable" ? "bg-rose-100 text-rose-800" : entry.employerStatus === "reviewed" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-900"}`}>
                    {entry.employerStatus === "reviewed" ? "Reviewed" : entry.employerStatus === "shortlisted" ? "Shortlisted" : entry.employerStatus === "not-suitable" ? "Not suitable" : "Forwarded"}
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate-600">{dateOnly.format(new Date(entry.forwardedAt ?? entry.createdAt))}</span>
                </Link>
              </li>
            ))}
          </ul> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{data ? "Applications appear here after an admin forwards them." : "Loading applications…"}</p>}
        </section>
      </div>
    </>
  );
}
