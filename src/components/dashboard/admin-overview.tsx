"use client";

import { ArrowRight, BriefcaseBusiness, Building2, ClipboardList, FileText, LayoutGrid, Rocket, Settings, Star, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EmployerPerformance, type PerformancePoint } from "./employer-performance";
import { adminDate, adminPanel, type AdminActivityItem } from "./admin-tools";
import welcomeArt from "../../../public/images/admin-dashboard-welcome.png";

type CompanyStatus = "approved" | "pending" | "rejected" | "suspended";
type Metric = "jobs" | "companies" | "users" | "applications" | "featured";
type DailyPoint = PerformancePoint & Record<Metric, number>;
export type AdminDashboardData = {
  stats: Record<Metric, number>;
  companies: Record<CompanyStatus, number>;
  pendingApplications: number;
  recentApplications: { _id: string; name: string; jobTitle: string; companyName: string; status: "new" | "shortlisted" | "forwarded" | "not-suitable"; createdAt: string }[];
  recentActivities: AdminActivityItem[];
  readAt?: string;
  series: DailyPoint[];
};

export const adminHref = (section = "") => `/dashboard/admin${section ? `/${section}` : ""}`;
export const adminTextLink = "inline-flex items-center gap-1.5 rounded-sm text-sm font-bold text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-800";
const counts = new Intl.NumberFormat("en-GB");
const statuses: { key: CompanyStatus; name: string; colour: string }[] = [
  { key: "approved", name: "Approved", colour: "#0a8651" }, { key: "pending", name: "Pending", colour: "#f59b24" },
  { key: "rejected", name: "Rejected", colour: "#ed4758" }, { key: "suspended", name: "Suspended", colour: "#68788d" },
];
const appStatuses = { new: "New", forwarded: "Forwarded", shortlisted: "Shortlisted", "not-suitable": "Not suitable" };

function Sparkline({ data, colour }: { data: number[]; colour: string }) {
  if (!data.length) return null;
  const max = Math.max(1, ...data);
  const points = data.map((value, index) => `${index * 160 / Math.max(1, data.length - 1)},${23 - 19 * value / max}`).join(" ");
  return <svg viewBox="0 0 160 26" preserveAspectRatio="none" aria-hidden="true" className="mt-2 h-6 w-full"><polyline fill="none" stroke={colour} strokeWidth="1.75" points={points} /></svg>;
}

function CompanyDonut({ data }: { data?: AdminDashboardData }) {
  const total = statuses.reduce((sum, { key }) => sum + (data?.companies[key] ?? 0), 0);
  let start = 0;
  const sectors = statuses.map(({ key, colour }) => {
    const end = start + (total ? (data?.companies[key] ?? 0) / total * 100 : 0);
    const section = `${colour} ${start}% ${end}%`;
    start = end;
    return section;
  });
  const percentage = total ? Math.round((data?.companies.approved ?? 0) / total * 100) : 0;
  return (
    <section className={adminPanel}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-extrabold"><Building2 aria-hidden="true" className="size-5 text-emerald-800" /> Companies</h2>
        <Link href={adminHref("companies")} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-800 hover:underline">View All <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
      </div>
      <div className="mx-auto mt-5 grid size-33 place-items-center rounded-full" style={{ background: total ? `conic-gradient(${sectors.join(",")})` : "#e9f1f0" }}>
        <div className="grid size-25 content-center rounded-full bg-white text-center"><strong className="text-2xl font-extrabold">{data ? `${percentage}%` : "—"}</strong><span className="text-xs font-semibold">Approved</span></div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {statuses.map(({ key, name, colour }) => <div key={key} className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: colour }} />{name}</dt>
          <dd className="font-semibold">{data ? counts.format(data.companies[key]) : "—"}</dd>
        </div>)}
        <div className="flex justify-between border-t border-slate-100 pt-2 font-bold"><dt>Total</dt><dd>{data ? counts.format(total) : "—"}</dd></div>
      </dl>
    </section>
  );
}

export function AdminOverview({ name, data, days, changeDays }: { name: string; data?: AdminDashboardData; days: number; changeDays: (days: number) => void }) {
  const metrics = [
    { key: "jobs", label: "Total Jobs", Icon: BriefcaseBusiness, colour: "#0a9256", style: "bg-emerald-100 text-emerald-800" },
    { key: "companies", label: "Approved Companies", Icon: Building2, colour: "#3391e9", style: "bg-blue-100 text-blue-800" },
    { key: "users", label: "Total Users", Icon: Users, colour: "#8956df", style: "bg-violet-100 text-violet-800" },
    { key: "applications", label: "Applications", Icon: FileText, colour: "#e99129", style: "bg-orange-100 text-orange-800" },
    { key: "featured", label: "Featured Jobs", Icon: Star, colour: "#0a9256", style: "bg-emerald-100 text-emerald-800" },
  ] as const;
  return (
    <>
      <section className="relative isolate flex min-h-31 flex-col justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-r from-[#dfefe9] via-[#e7f4ef] to-[#c0e6d7] p-5 sm:p-6">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[57%] lg:block"><Image src={welcomeArt} alt="" fill sizes="(min-width: 1500px) 700px, 47vw" className="object-contain object-right-bottom" /></div>
        <h1 className="max-w-xl text-2xl font-extrabold tracking-tight [overflow-wrap:anywhere] sm:text-3xl"><span aria-hidden="true">👋 </span>Welcome back, {name}!</h1>
        <p className="mt-1.5 text-sm font-medium text-slate-800 sm:text-base">Here’s what’s happening on your job board today.</p>
      </section>
      <ul aria-label="Job board metrics" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {metrics.map(({ key, label, Icon, colour, style }) => (
          <li key={key} className="min-w-0 rounded-2xl border border-[#e1e9ef] bg-white p-3 shadow-sm sm:p-4">
            <Link href={adminHref(key === "featured" ? "jobs" : key)} className="flex min-w-0 items-center gap-2 rounded-xl hover:text-emerald-800 sm:gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full sm:size-14 ${style}`}><Icon aria-hidden="true" className="size-5 sm:size-7" /></span>
              <span className="min-w-0"><strong className="block text-lg font-extrabold sm:text-2xl">{data ? counts.format(data.stats[key]) : "—"}</strong><span className="block text-xs leading-tight">{label}</span></span>
            </Link>
            <Sparkline data={data?.series.map((point) => point[key]) ?? []} colour={colour} />
          </li>
        ))}
      </ul>
      <div className="mt-4 grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_14rem_11rem] xl:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0 space-y-4">
          <EmployerPerformance series={data?.series ?? []} days={days} onRangeChange={changeDays} admin />
          <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <section className={adminPanel}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-extrabold"><ClipboardList aria-hidden="true" className="size-5 text-emerald-800" /> Recent Applications</h2><Link href={adminHref("applications")} className={adminTextLink}>View All <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
              {data?.recentApplications.length ? <div className="overflow-x-auto rounded-xl border border-slate-100" role="region" aria-label="Recent applications" tabIndex={0}>
                <table className="w-full min-w-[28rem] text-left text-xs"><thead className="bg-[#edf3f7]"><tr>{["Applicant", "Job Title", "Company", "Date", "Status"].map((title) => <th key={title} scope="col" className="px-2.5 py-2">{title}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">{data.recentApplications.map((item) => <tr key={item._id}>
                    <td className="px-2.5 py-2"><Link href={`${adminHref("applications")}#application-${encodeURIComponent(item._id)}`} className="flex items-center gap-1.5 font-bold hover:underline"><span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">{item.name.trim()[0]?.toUpperCase() || "A"}</span>{item.name}</Link></td>
                    <td className="px-2.5 py-2">{item.jobTitle}</td><td className="px-2.5 py-2">{item.companyName}</td><td className="whitespace-nowrap px-2.5 py-2">{adminDate.format(new Date(item.createdAt))}</td>
                    <td className="px-2.5 py-2"><span className={`whitespace-nowrap rounded-full px-2 py-1 font-semibold ${item.status === "new" ? "bg-blue-100 text-blue-800" : item.status === "not-suitable" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-900"}`}>{appStatuses[item.status]}</span></td>
                  </tr>)}</tbody>
                </table>
              </div> : <p className="text-sm text-slate-600">Recent job applications will appear here.</p>}
            </section>
            <section className={adminPanel}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-extrabold"><Zap aria-hidden="true" className="size-5 text-emerald-800" /> Recent Activities</h2><Link href={adminHref("activity")} className={adminTextLink}>View All <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
              {data?.recentActivities.length ? <ul className="divide-y divide-slate-100">{data.recentActivities.slice(0, 5).map((item) => <li key={item._id} className="py-2 text-xs"><span className="block font-semibold [overflow-wrap:anywhere]">{item.action} · {item.target}</span><time dateTime={item.createdAt} className="mt-0.5 block text-slate-600">{adminDate.format(new Date(item.createdAt))}</time></li>)}</ul>
                : <p className="text-sm text-slate-600">Logged actions will appear here.</p>}
            </section>
          </div>
        </div>
        <CompanyDonut data={data} />
        <aside className="space-y-4 xl:col-start-2 2xl:col-start-auto">
          <section className="rounded-2xl bg-[#10543f] p-4 text-white">
            <h2 className="flex items-center gap-2 font-extrabold"><Zap aria-hidden="true" className="size-5 fill-amber-400 text-amber-400" /> Quick Actions</h2>
            <ul className="mt-3 space-y-2">
              {[
                { to: "companies", label: "Approve Companies", Icon: Building2 }, { to: "jobs", label: "Manage Jobs", Icon: BriefcaseBusiness },
                { to: "applications", label: "View Applications", Icon: ClipboardList }, { to: "categories", label: "Manage Categories", Icon: LayoutGrid },
                { to: "settings", label: "Site Settings", Icon: Settings },
              ].map(({ to, label, Icon }) => <li key={to}><Link href={adminHref(to)} className="flex min-h-9 items-center gap-2 rounded-xl bg-white/10 px-2 text-[11px] font-bold hover:bg-white/20"><Icon aria-hidden="true" className="size-4 shrink-0" />{label}</Link></li>)}
            </ul>
          </section>
          <section className="rounded-2xl bg-[#dcf1e8] p-4 text-emerald-950">
            <Rocket aria-hidden="true" className="mb-2 ml-auto size-7 text-emerald-800" />
            <h2 className="text-sm font-extrabold">Keep growing!</h2><p className="mt-1 text-xs leading-relaxed">See how people are using your job board.</p>
            <Link href={adminHref("reports")} className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-full bg-emerald-800 px-3 text-xs font-bold text-white hover:bg-emerald-900">View Reports <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export function AdminReports({ data, days, changeDays }: { data?: AdminDashboardData; days: number; changeDays: (days: number) => void }) {
  function download() {
    if (!data) return;
    const lines = ["Date,Job views,Applications,New users,New jobs,Company approvals,Featured actions", ...data.series.map((day) => [day.date, day.views, day.applications, day.users, day.jobs, day.companies, day.featured].join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const download = document.createElement("a");
    download.href = url;
    download.download = `uk-job-board-report-${days}-days.csv`;
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="space-y-4">
    <EmployerPerformance series={data?.series ?? []} days={days} onRangeChange={changeDays} admin />
    <section className={adminPanel}>
      <h2 className="font-extrabold">Export activity report</h2><p className="mt-2 text-sm text-slate-600">Download daily totals for the selected date range.</p>
      <button type="button" disabled={!data} onClick={download} className="mt-3 min-h-10 rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white disabled:opacity-50">Download CSV</button>
    </section>
  </div>;
}
