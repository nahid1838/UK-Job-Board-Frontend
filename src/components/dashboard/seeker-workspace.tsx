"use client";

import { authClient } from "@/lib/auth-client";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { dashboardHref, dashboardNavigation } from "@/lib/dashboard-navigation";
import { getJobResults, getPublicJob, type PublicJob } from "@/lib/public-jobs";
import { JobCard } from "@/components/jobs/job-card";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { readSavedJobs, subscribeSavedJobs } from "@/components/jobs/save-job-button";
import { ArrowRight, Bell, BriefcaseBusiness, Camera, Check, CircleCheck, ClipboardList, Flame, Handshake, Lightbulb, LogOut, Menu, Search, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SeekerAvatar, SeekerCvEditor, SeekerEmailEditor, SeekerProfileEditor, seekerPanel, type SeekerProfile } from "./seeker-profile";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";
import welcomeArt from "../../../public/images/seeker-dashboard-welcome.png";
import { SeekerBrowseJobs } from "./seeker-browse-jobs";

type Application = {
  _id: string; jobId: string; jobTitle: string; companyName: string; companyLogo?: string;
  status: "new" | "shortlisted" | "forwarded" | "not-suitable"; createdAt: string; reviewedAt?: string;
};
const href = (section = "") => dashboardHref("seeker", section);
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" });
const statusLabels = { new: "Submitted", shortlisted: "Shortlisted", forwarded: "Forwarded", "not-suitable": "Not suitable" };
const statusStyles = { new: "bg-blue-100 text-blue-800", shortlisted: "bg-emerald-100 text-emerald-800", forwarded: "bg-emerald-100 text-emerald-800", "not-suitable": "bg-slate-200 text-slate-700" };
const primaryLink = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#09563f] px-4 text-sm font-bold text-white hover:bg-[#064330] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const textLink = "inline-flex min-h-9 items-center gap-1 text-sm font-bold text-[#07583e] hover:underline focus-visible:outline-2 focus-visible:outline-emerald-700";
const primarySections = new Set(["", "browse-jobs", "applications", "profile", "settings", "notifications"]);

function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form method="get" action="/jobs" role="search" aria-label="Search jobs" className={`flex min-w-0 items-center rounded-xl border border-slate-300 bg-white/70 shadow-sm ${compact ? "w-full max-w-xl" : "w-full"}`}>
      <Search aria-hidden="true" className="ml-3 size-5 shrink-0 text-slate-500" />
      <input name="keyword" aria-label="Search jobs by title, company or location" placeholder="Search jobs by title, company or location…" className="min-h-11 w-full min-w-0 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-700" />
      <button type="submit" aria-label="Search" className="grid min-h-11 min-w-12 place-items-center rounded-xl bg-[#087b54] text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><Search aria-hidden="true" className="size-5" /></button>
    </form>
  );
}

function ApplicationsTable({ applications, recent }: { applications: Application[]; recent?: boolean }) {
  const [selected, setSelected] = useState<Application | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <section className={seekerPanel}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><ClipboardList aria-hidden="true" className="size-5 text-emerald-800" />{recent ? "My Recent Applications" : "My applications"}</h2>
        {recent && <Link href={href("applications")} className={textLink}>View All Applications <ArrowRight aria-hidden="true" className="size-4" /></Link>}
      </div>
      {!applications.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Your submitted applications will appear here.</p> : (
        <div className="overflow-x-auto rounded-xl border border-[#e1e8f0]" tabIndex={0} role="region" aria-label="Application results">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-[#edf2f8] text-slate-700"><tr>{["Job Title", "Company", "Applied On", "Status", "Action"].map((label) => <th key={label} scope="col" className="px-3 py-2.5 font-semibold">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(recent ? applications.slice(0, 3) : applications).map((item) => (
                <tr key={item._id}>
                  <td className="px-3 py-2.5 font-medium">{item.jobTitle}</td>
                  <td className="max-w-36 px-3 py-2.5"><CompanyLogo name={item.companyName} src={item.companyLogo} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5">{dateFormat.format(new Date(item.createdAt))}</td>
                  <td className="px-3 py-2.5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span></td>
                  <td className="px-3 py-2.5"><button type="button" onClick={() => { setSelected(item); dialog.current?.showModal(); }} className="inline-flex min-h-8 items-center rounded-full border border-emerald-500 px-3 font-bold text-emerald-900 hover:bg-emerald-50" aria-label={`View application for ${item.jobTitle}`}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <dialog ref={dialog} aria-label="Application details" onClose={() => setSelected(null)}
        className="fixed inset-0 m-auto w-[min(90vw,27rem)] rounded-2xl border border-slate-200 bg-white p-5 text-[#102039] shadow-xl backdrop:bg-slate-950/45">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-extrabold">Application details</h2><form method="dialog"><button type="submit" aria-label="Close application details" className="grid size-9 place-items-center rounded-lg hover:bg-slate-100"><X aria-hidden="true" className="size-5" /></button></form></div>
        {selected && <dl className="mt-3 grid gap-3 text-sm">
          <div><dt className="font-bold">Job</dt><dd>{selected.jobTitle}</dd></div>
          <div><dt className="font-bold">Company</dt><dd>{selected.companyName}</dd></div>
          <div><dt className="font-bold">Applied on</dt><dd>{dateFormat.format(new Date(selected.createdAt))}</dd></div>
          <div><dt className="font-bold">Status</dt><dd>{statusLabels[selected.status]}</dd></div>
        </dl>}
        {selected && <Link href={`/jobs/${selected.jobId}`} className={`mt-3 ${textLink}`}>Open job listing <ArrowRight aria-hidden="true" className="size-4" /></Link>}
      </dialog>
    </section>
  );
}

function FeaturedCards({ jobs }: { jobs: PublicJob[] }) {
  return jobs.length ? (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <li key={job._id} className="flex h-full min-w-0 flex-col rounded-xl border border-[#dce5ed] bg-[#fbfcfe] p-4">
          <div className="flex min-h-9 items-center justify-between gap-2">
            <div className="min-w-0"><CompanyLogo name={job.companyName} src={job.companyLogo} /></div>
            {job.isFeatured && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900">Featured</span>}
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-extrabold [overflow-wrap:anywhere]">{job.title}</h3>
          <p className="mt-2 line-clamp-1 text-sm text-slate-600">{job.location} · {job.jobType}</p>
          {(job.salaryMin !== null || job.salaryMax !== null) && (
            <p className="mt-2 text-sm font-bold text-emerald-800">
              {[job.salaryMin, job.salaryMax].filter((value): value is number => value !== null).map((value) => `£${value.toLocaleString("en-GB")}`).join(" – ")} / {job.salaryPeriod}
            </p>
          )}
          <div className="mt-auto pt-4"><Link href={`/jobs/${job._id}`} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500 text-sm font-bold text-[#07583e] hover:bg-emerald-50">View Details <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
        </li>
      ))}
    </ul>
  ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Open jobs will appear here as they are published.</p>;
}

function SavedJobs({ snapshot }: { snapshot: string }) {
  const [result, setResult] = useState<{ snapshot: string; jobs: PublicJob[]; unavailable: number }>({ snapshot: "", jobs: [], unavailable: 0 });
  useEffect(() => {
    let cancelled = false;
    const ids = JSON.parse(snapshot) as string[];
    Promise.allSettled(ids.filter((id) => /^[a-f0-9]{24}$/i.test(id)).map(getPublicJob)).then((entries) => {
      if (!cancelled) setResult({ snapshot, jobs: entries.flatMap((entry) => entry.status === "fulfilled" ? [entry.value] : []), unavailable: entries.filter((entry) => entry.status === "rejected").length });
    });
    return () => { cancelled = true; };
  }, [snapshot]);
  if (result.snapshot !== snapshot) return <p role="status" className={seekerPanel}>Loading saved jobs…</p>;
  return (
    <section className={seekerPanel}>
      {!result.jobs.length && <p className="text-sm text-slate-600">Bookmark jobs to find them here. Saved jobs are stored in this browser.</p>}
      {result.unavailable > 0 && <p className="mb-4 text-sm text-slate-600">{result.unavailable} saved {result.unavailable === 1 ? "job is" : "jobs are"} currently unavailable.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{result.jobs.map((job) => <li key={job._id}><JobCard job={job} compact /></li>)}</ul>
    </section>
  );
}

export function SeekerWorkspace({ section, accountName, email, verified, emailEnabled, children }: {
  section: string; accountName: string; email: string; verified: boolean; emailEnabled: boolean; children?: ReactNode;
}) {
  const [profile, setProfile] = useState<SeekerProfile>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [jobTotal, setJobTotal] = useState<number>();
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [jobsError, setJobsError] = useState("");
  const [applicationsReady, setApplicationsReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const savedSnapshot = useSyncExternalStore(subscribeSavedJobs, () => JSON.stringify(readSavedJobs()), () => "[]");
  const savedCount = (JSON.parse(savedSnapshot) as string[]).length;
  const showJobs = !section;

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    backendRequest<{ profile: SeekerProfile }>("/api/seeker/profile", options)
      .then(({ profile }) => { if (!controller.signal.aborted) setProfile(profile); })
      .catch((error) => { if (!controller.signal.aborted) setProfileError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setProfileReady(true); });
    backendRequest<{ applications: Application[] }>("/api/job-applications/mine", options)
      .then(({ applications }) => { if (!controller.signal.aborted) setApplications(applications); })
      .catch((error) => { if (!controller.signal.aborted) setApplicationError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setApplicationsReady(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!showJobs) return;
    let active = true;
    getJobResults(new URLSearchParams({ limit: "3", prioritiseFeatured: "true" }))
      .then(({ jobs, total }) => { if (active) { setJobs(jobs); setJobTotal(total); } })
      .catch(() => { if (active) setJobsError("Jobs are temporarily unavailable. Refresh to try again."); });
    return () => { active = false; };
  }, [showJobs]);

  const name = profile.name || accountName;
  const notifications = applications.filter((item) => item.reviewedAt).sort((a, b) => (b.reviewedAt ?? "").localeCompare(a.reviewedAt ?? ""));
  const unread = notifications.filter((item) => (item.reviewedAt ?? "") > (profile.notificationsReadAt ?? "")).length;
  const completion = [name, profile.photo, profile.phone, profile.location, profile.headline, profile.cvType].filter(Boolean).length;
  const percentage = Math.round(completion / 6 * 100);
  const title = dashboardNavigation.seeker.find(({ slug }) => slug === section)?.label ?? "Dashboard";

  async function markRead() {
    const through = notifications[0]?.reviewedAt;
    if (!through || markingRead) return;
    setMarkingRead(true);
    setActionMessage("");
    try {
      await backendRequest("/api/seeker/notifications", { method: "PATCH", body: JSON.stringify({ through }) });
      setProfile((current) => ({ ...current, notificationsReadAt: through }));
    } catch (error) { setActionMessage(backendErrorMessage(error)); }
    finally { setMarkingRead(false); }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw error;
      window.location.replace("/");
    } catch { setActionMessage("Couldn’t sign out. Please try again."); setSigningOut(false); }
  }

  return (
    <div className="min-h-dvh bg-[#f6f8fb] text-[#102039] lg:grid lg:grid-cols-[14.75rem_minmax(0,1fr)]">
      <aside className="bg-linear-to-b from-[#105641] to-[#064234] text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto" onKeyDown={(event) => {
        if (event.key === "Escape" && menu) { setMenu(false); menuButton.current?.focus(); }
      }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:pt-10 lg:pb-9">
          <Link href="/" className="flex items-center gap-2 font-extrabold"><BriefcaseBusiness aria-hidden="true" className="size-10 shrink-0" /><span className="text-xl tracking-tight">UKJobBoard<span className="block text-xs font-medium tracking-normal">Find Your Dream Job</span></span></Link>
          <button ref={menuButton} type="button" aria-label={menu ? "Close dashboard menu" : "Open dashboard menu"} aria-expanded={menu} aria-controls="seeker-navigation" onClick={() => setMenu(!menu)} className="grid size-11 place-items-center rounded-xl border border-white/30 lg:hidden">{menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
        <div id="seeker-navigation" className={`px-4 pb-6 lg:block ${menu ? "block" : "hidden"}`}>
          <nav aria-label="Job seeker navigation" className="space-y-1 border-t border-white/20 pt-5">
            {dashboardNavigation.seeker.filter(({ slug }) => primarySections.has(slug)).map(({ slug, label, Icon }) => (
              <Link key={slug} href={href(slug)} onClick={() => setMenu(false)} aria-current={slug === section ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold motion-safe:transition-colors ${slug === section ? "bg-white/22 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-white" : "hover:bg-white/12"}`}>
                <Icon aria-hidden="true" className="size-5 shrink-0" />{label}{slug === "notifications" && unread > 0 && <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs">{unread}</span>}
              </Link>
            ))}
            <button type="button" onClick={signOut} disabled={signingOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-white/12"><LogOut aria-hidden="true" className="size-5" />{signingOut ? "Signing out…" : "Logout"}</button>
          </nav>
          <div className="relative isolate mt-7 hidden min-h-44 flex-col justify-end overflow-hidden rounded-2xl bg-[#104f40] p-4 lg:flex">
            <Image src={parliamentPhoto} alt="" fill sizes="200px" className="-z-20 object-cover object-[69%_50%] opacity-65" />
            <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[#062d25] to-transparent" />
            <p className="text-lg leading-tight font-extrabold">Build a Better Career in the UK</p>
            <Link href="/jobs" className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-[#087b54] px-3 py-2 text-sm font-bold">Explore Jobs <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <p className="mt-6 border-t border-white/20 px-1 pt-4 text-xs text-emerald-50">© UKJobBoard. All rights reserved.</p>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-9 sm:px-7 lg:px-8">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200/75 py-4 sm:justify-between sm:gap-5">
          <div className="order-2 w-full sm:order-none sm:w-[55%]"><SearchForm compact /></div>
          <div className="flex max-w-full min-w-0 items-center gap-4 sm:ml-auto">
            <Link href={href("notifications")} aria-label={`Notifications, ${unread} unread`} className="relative grid size-10 shrink-0 place-items-center rounded-xl hover:bg-emerald-50">
              <Bell aria-hidden="true" className="size-6" />{unread > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">{unread}</span>}
            </Link>
            <Link href={`${href("profile")}#profile-photo`} aria-label="Update profile photo" title="Update profile photo" className="relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <SeekerAvatar name={name} photo={profile.photo} />
              <span className="absolute right-0 bottom-0 grid size-5 place-items-center rounded-full bg-emerald-800 text-white ring-2 ring-white"><Camera aria-hidden="true" className="size-3" /></span>
            </Link>
            <Link href={href("profile")} className="min-w-0 truncate rounded-xl text-sm font-bold hover:text-emerald-800">{name}</Link>
          </div>
        </header>
        {actionMessage && <p role="alert" className="mt-3 text-sm text-red-700">{actionMessage}</p>}
        <div className="pt-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
          {section && <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>}
          {!section && <>
            <section className="relative isolate overflow-hidden rounded-2xl bg-linear-to-r from-[#d9f0e6] via-[#dbf2eb] to-[#8bcdb1] p-5 sm:p-8">
              <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-20 hidden w-[57%] overflow-hidden lg:block">
                <Image src={welcomeArt} alt="" fill sizes="(min-width: 1500px) 720px, 45vw" className="object-contain object-right-bottom" />
              </div>
              <h1 className="max-w-[32rem] text-2xl font-extrabold tracking-tight text-[#073726] [overflow-wrap:anywhere] sm:text-4xl">Welcome back, {name}! <span aria-hidden="true">👋</span></h1>
              <p className="mt-2 text-base font-medium sm:text-lg">Your next opportunity is just a search away.</p>
              <Link href={href("browse-jobs")} className={`mt-4 ${primaryLink}`}>Browse Jobs <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </section>
            <dl className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                { label: "Available Jobs", value: jobTotal, Icon: BriefcaseBusiness, link: "browse-jobs" },
                { label: "My Applications", value: applicationsReady && !applicationError ? applications.length : undefined, Icon: ClipboardList, link: "applications" },
                { label: "Shortlisted", value: applicationsReady && !applicationError ? applications.filter((item) => item.status === "shortlisted").length : undefined, Icon: CircleCheck, link: "applications" },
                { label: "Saved Jobs", value: savedCount, Icon: Star, link: "saved-jobs" },
              ].map(({ label, value, Icon, link }) => <div key={label} className="rounded-2xl border border-[#dce5ed] bg-white/85">
                <Link href={href(link)} className="flex h-full flex-wrap items-center gap-2 rounded-2xl p-3 hover:bg-emerald-50/70 sm:gap-4 sm:p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100/80 text-emerald-800 sm:size-14"><Icon aria-hidden="true" className="size-5 sm:size-7" /></span>
                  <div><dd className="text-xl font-extrabold text-emerald-950 sm:text-3xl">{value?.toLocaleString("en-GB") ?? "—"}</dd><dt className="text-xs font-medium sm:text-sm">{label}</dt></div>
                </Link>
              </div>)}
            </dl>
            <div className="mt-4 grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="min-w-0 space-y-4">
                <section className={seekerPanel}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Flame aria-hidden="true" className="size-5 text-emerald-800" />Featured Jobs</h2><Link href="/jobs?featured=true" className={textLink}>View All <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
                  {jobsError ? <p role="status" className="text-sm text-slate-600">{jobsError}</p> : jobTotal === undefined ? <p role="status" className="text-sm">Loading jobs…</p> : <FeaturedCards jobs={jobs} />}
                </section>
                {applicationError ? <p className={seekerPanel} role="alert">{applicationError}</p> : !applicationsReady ? <p className={seekerPanel} role="status">Loading applications…</p> : <ApplicationsTable applications={applications} recent />}
              </div>
              <aside className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <section className={seekerPanel}>
                  <h2 className="text-lg font-extrabold text-[#064631]">Complete Your Profile</h2>
                  {profileReady && !profileError && <div className="mt-3 flex items-center gap-2"><progress aria-label="Profile completion" max={100} value={percentage} className="h-2.5 flex-1 rounded-full accent-emerald-700" /><span className="text-sm font-bold">{percentage}%</span></div>}
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{profileError || "Add your phone number and upload your CV to complete your profile."}</p>
                  <Link href={href("profile")} className={`mt-4 ${primaryLink}`}>Update Profile <ArrowRight aria-hidden="true" className="size-4" /></Link>
                  {!profile.cvType && <Link href={href("cv")} className={`ml-2 ${textLink}`}>Upload CV</Link>}
                </section>
                <section className={seekerPanel}>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold"><Lightbulb aria-hidden="true" className="size-5 fill-amber-200 text-amber-600" />Job Search Tips</h2>
                  <ul className="mt-3 space-y-2.5 text-sm">{["Use keywords like job title or skills", "Select a UK location for better results", "Keep your CV updated"].map((tip) => <li key={tip} className="flex gap-2"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-700" />{tip}</li>)}</ul>
                </section>
                <Link href="/contact" className="flex items-center gap-3 rounded-2xl bg-[#dff3ea] p-4 hover:bg-emerald-100"><Handshake aria-hidden="true" className="size-7 shrink-0 text-emerald-800" /><span className="text-sm"><strong className="block text-base">Need Help?</strong>Contact our support team</span><ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0" /></Link>
              </aside>
            </div>
          </>}
          {section === "browse-jobs" && <SeekerBrowseJobs />}
          {section === "applications" && (applicationError ? <p role="alert" className={seekerPanel}>{applicationError}</p> : applicationsReady ? <ApplicationsTable applications={applications} /> : <p role="status" className={seekerPanel}>Loading applications…</p>)}
          {section === "saved-jobs" && <SavedJobs snapshot={savedSnapshot} />}
          {(section === "profile" || section === "cv") && (profileError ? <p role="alert" className={seekerPanel}>{profileError}</p> : !profileReady ? <p role="status" className={seekerPanel}>Loading profile…</p> : section === "profile"
            ? <SeekerProfileEditor profile={profile} accountName={accountName} email={email} update={(changes) => setProfile((current) => ({ ...current, ...changes }))} />
            : <SeekerCvEditor cvType={profile.cvType} update={(cvType) => setProfile((current) => ({ ...current, cvType }))} />)}
          {section === "profile" && (
            <nav aria-label="Profile tools" className={`mt-4 ${seekerPanel}`}>
              <h2 className="text-lg font-extrabold">Profile tools</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {dashboardNavigation.seeker.filter(({ slug }) => !primarySections.has(slug)).map(({ slug, label }) => (
                  <Link key={slug} href={href(slug)} className={textLink}>{label} <ArrowRight aria-hidden="true" className="size-4" /></Link>
                ))}
              </div>
            </nav>
          )}
          {section === "settings" && <section className={seekerPanel}>
            <h2 className="text-lg font-extrabold">Account security</h2><p className="mt-2 text-sm break-all text-slate-600">{email} · {verified ? "Verified" : "Awaiting verification"}</p>
            <div className="mt-3 flex flex-wrap gap-4"><Link href="/forgot-password" className={textLink}>Reset password</Link>{!verified && <Link href="/verify-email" className={textLink}>Verify email</Link>}<Link href={href("profile")} className={textLink}>Edit profile</Link></div>
            {emailEnabled && <SeekerEmailEditor verified={verified} />}
          </section>}
          {section === "notifications" && <section className={seekerPanel}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Application updates</h2>{unread > 0 && <button type="button" onClick={markRead} disabled={markingRead} className={textLink}>{markingRead ? "Marking…" : "Mark all as read"}</button>}</div>
            {profileError && <p role="alert" className="mt-3 text-sm text-red-700">{profileError}</p>}
            {applicationError ? <p role="alert" className="mt-3 text-sm text-red-700">{applicationError}</p> : !applicationsReady ? <p role="status" className="mt-3 text-sm">Loading updates…</p> : notifications.length === 0 ? <p className="mt-3 text-sm text-slate-600">You’ll see an update when an admin reviews an application.</p> : (
              <ul className="mt-4 space-y-3">{notifications.map((item) => <li key={item._id} className="rounded-xl border border-slate-200 p-4"><Link href={href("applications")} className="font-bold text-emerald-900 hover:underline">{item.jobTitle} · {statusLabels[item.status]}</Link><p className="mt-1 text-sm text-slate-600">{item.companyName} · {dateFormat.format(new Date(item.reviewedAt!))}</p></li>)}</ul>
            )}
          </section>}
          {children}
        </div>
      </main>
    </div>
  );
}
