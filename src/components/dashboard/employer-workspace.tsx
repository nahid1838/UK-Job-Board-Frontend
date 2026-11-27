"use client";

import { Bell, BriefcaseBusiness, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { dashboardNavigation } from "@/lib/dashboard-navigation";
import { CompanyApplicationPanel } from "./company-applications";
import { JobApplicationsPanel } from "./job-applications-panel";
import { CompanyAvatar, EmployerOverview, employerDate, employerHref, employerPanel, employerPrimary, employerTextLink, type EmployerDashboardData } from "./employer-overview";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";
import { AccountEmailEditor, PersonalProfileEditor, SeekerAvatar, type SeekerProfile } from "./seeker-profile";

type SearchResults = {
  jobs: { _id: string; title: string; location: string }[];
  applications: { _id: string; name: string; jobTitle: string }[];
};

const policyLinks = [
  { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" }, { label: "Terms & Conditions", href: "/terms" },
];

export function EmployerWorkspace({ section, accountName, email, verified, emailEnabled }: {
  section: string; accountName: string; email: string; verified: boolean; emailEnabled: boolean;
}) {
  const [data, setData] = useState<EmployerDashboardData>();
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState(accountName);
  const [menu, setMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResults>();
  const [searchError, setSearchError] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const [profile, setProfile] = useState<SeekerProfile>();
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ profile: SeekerProfile }>("/api/employer/profile", { signal: controller.signal })
      .then(({ profile }) => { if (!controller.signal.aborted) setProfile(profile); })
      .catch((error) => { if (!controller.signal.aborted) setProfileError(backendErrorMessage(error)); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<EmployerDashboardData>(`/api/employer/dashboard?days=${days}`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) { setData(result); setError(""); } })
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); });
    return () => controller.abort();
  }, [days, refresh]);

  const companyName = data?.company?.name ?? name;
  const logo = data?.company?.logoUrl;
  const status = data?.company?.status;
  const title = dashboardNavigation.employer.find(({ slug }) => slug === section)?.label ?? "Dashboard";
  const unread = data?.notifications.filter(({ date }) => date > (data.preferences.notificationsReadAt ?? "")) ?? [];
  const badge = data?.preferences.showNotificationBadge === false ? 0 : unread.length;
  const forwardedUnread = data?.preferences.showNotificationBadge === false ? 0 : unread.filter(({ href }) => href === employerHref("applications")).length;

  async function signOut() {
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Couldn’t sign out.");
      window.location.replace("/");
    } catch {
      setError("Couldn’t sign out. Please try again.");
      setSigningOut(false);
    }
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searching) return;
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    setResults(undefined);
    setSearchError("");
    if (!query) return;
    setSearching(true);
    try {
      setResults(await backendRequest<SearchResults>(`/api/employer/search?${new URLSearchParams({ q: query })}`, { signal: AbortSignal.timeout(5000) }));
    } catch (error) {
      setSearchError(backendErrorMessage(error));
    } finally {
      setSearching(false);
    }
  }

  async function markRead() {
    const latest = data?.notifications[0]?.date;
    if (!latest || marking) return;
    setMarking(true);
    setError("");
    try {
      await backendRequest("/api/employer/settings", { method: "PATCH", body: JSON.stringify({ notificationsReadAt: latest }) });
      setData((current) => current && { ...current, preferences: { ...current.preferences, notificationsReadAt: latest } });
    } catch (error) { setError(backendErrorMessage(error)); }
    finally { setMarking(false); }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !data) return;
    const values = new FormData(event.currentTarget);
    const nextName = String(values.get("name") ?? "").trim();
    const showNotificationBadge = values.has("showNotificationBadge");
    if (!nextName) { setError("Enter your account name."); return; }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (nextName !== name) {
        const result = await authClient.updateUser({ name: nextName });
        if (result.error) throw new Error(result.error.message || "Could not update the account name.");
        setName(nextName);
      }
      await backendRequest("/api/employer/settings", { method: "PATCH", body: JSON.stringify({ showNotificationBadge }) });
      setData((current) => current && { ...current, preferences: { ...current.preferences, showNotificationBadge } });
      setNotice("Settings saved.");
    } catch (error) { setError(backendErrorMessage(error)); }
    finally { setSaving(false); }
  }

  return (
    <div className="min-h-dvh bg-[#f7f9fb] text-[#102039] lg:grid lg:grid-cols-[14.75rem_minmax(0,1fr)]">
      <aside className="bg-linear-to-b from-[#105641] via-[#0b503d] to-[#063e32] text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
        onKeyDown={(event) => { if (event.key === "Escape" && menu) { setMenu(false); menuButton.current?.focus(); } }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:pt-7 lg:pb-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold"><BriefcaseBusiness aria-hidden="true" className="size-10 shrink-0" /><span className="text-xl tracking-tight">UKJobBoard<span className="block text-xs font-medium tracking-normal">Your Career. Our Priority</span></span></Link>
          <button ref={menuButton} type="button" aria-label={menu ? "Close dashboard menu" : "Open dashboard menu"} aria-expanded={menu} aria-controls="employer-navigation" onClick={() => setMenu(!menu)} className="grid size-11 place-items-center rounded-xl border border-white/30 lg:hidden">{menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
        <div id="employer-navigation" className={`px-4 pb-6 lg:block ${menu ? "block" : "hidden"}`}>
          <Link href={employerHref("company")} className="mb-4 flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-black/5 p-3 text-center hover:bg-white/10">
            <CompanyAvatar name={companyName} logo={logo} />
            <span className="max-w-full text-sm font-bold [overflow-wrap:anywhere]">{companyName}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "approved" ? "bg-[#17a65f] text-white" : "bg-white/15 text-emerald-50"}`}>{status === "approved" ? "Approved ✓" : status === "pending" ? "Pending review" : status === "rejected" ? "Changes requested" : status === "suspended" ? "Suspended" : "Company profile"}</span>
          </Link>
          <nav aria-label="Employer navigation" className="space-y-0.5">
            {dashboardNavigation.employer.filter(({ slug }) => slug !== "profile").map(({ slug, label, Icon }) => {
              const count = slug === "notifications" ? badge : slug === "applications" ? forwardedUnread : 0;
              return (
                <Link key={slug} href={employerHref(slug)} onClick={() => setMenu(false)} aria-current={slug === section ? "page" : undefined}
                  className={`relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold motion-safe:transition-colors ${slug === section ? "bg-linear-to-r from-emerald-500/60 to-white/18 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-white" : "hover:bg-white/12"}`}>
                  <Icon aria-hidden="true" className="size-5 shrink-0" />{label}{count > 0 && <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs">{count}</span>}
                </Link>
              );
            })}
            <button type="button" onClick={signOut} disabled={signingOut} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-white/12"><LogOut aria-hidden="true" className="size-5" />{signingOut ? "Signing out…" : "Logout"}</button>
          </nav>
          <div className="relative isolate mt-6 hidden min-h-42 flex-col justify-end overflow-hidden rounded-2xl bg-[#104f40] p-3.5 lg:flex">
            <Image src={parliamentPhoto} alt="" fill sizes="200px" className="-z-20 object-cover object-[69%_50%] opacity-65" />
            <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[#062d25] to-transparent" />
            <p className="text-base leading-tight font-extrabold">Grow Your Team in the UK</p>
            <Link href={employerHref(status === "approved" ? "post-a-job" : "company")} className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0d9355] px-3 py-2 text-sm font-bold">{status === "approved" ? "Post a Job" : "My Company"}</Link>
          </div>
          <p className="mt-5 border-t border-white/20 px-1 pt-3 text-xs text-emerald-50">© UKJobBoard. All rights reserved.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main className="flex-1 px-4 pb-6 sm:px-7 lg:px-8">
          <header className="flex flex-wrap items-center gap-3 border-b border-slate-200/75 py-4 sm:justify-between sm:gap-4">
            <form onSubmit={search} role="search" aria-label="Search employer workspace" className="order-2 flex w-full max-w-lg items-center rounded-xl border border-slate-300 bg-[#f7f9fc] shadow-sm sm:order-none sm:w-1/2">
              <Search aria-hidden="true" className="ml-3 size-5 shrink-0 text-slate-500" />
              <input name="q" aria-label="Search candidates, jobs or applications" placeholder="Search candidates, jobs or applications…" maxLength={120} required className="min-h-10 w-full min-w-0 bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-700" />
              <button type="submit" disabled={searching} className="min-h-10 rounded-r-xl px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50">{searching ? "Searching…" : "Search"}</button>
            </form>
            <div className="flex min-w-0 max-w-full items-center gap-3 sm:ml-auto">
              <Link href={employerHref("notifications")} aria-label={`Notifications, ${unread.length} unread`} className="relative grid size-10 shrink-0 place-items-center rounded-xl hover:bg-emerald-50">
                <Bell aria-hidden="true" className="size-6" />{badge > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">{badge}</span>}
              </Link>
              <details className="group relative min-w-0"
                onKeyDown={(event) => {
                  if (event.key === "Escape" && event.currentTarget.open) {
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector("summary")?.focus();
                  }
                }}>
                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 rounded-xl font-bold hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700">
                  <CompanyAvatar name={companyName} logo={logo} small />
                  <span className="truncate text-sm">{companyName}</span><ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
                </summary>
                <div className="absolute top-full right-0 z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="flex min-w-0 items-center gap-2 border-b border-slate-100 px-2 py-2">
                    <SeekerAvatar name={profile?.name || name} photo={profile?.photo} />
                    <span className="min-w-0 truncate text-sm font-bold">{profile?.name || name}</span>
                  </div>
                  {[{ slug: "profile", label: "My Profile" }, { slug: "company", label: "My Company" }, { slug: "settings", label: "Settings" }].map(({ slug, label }) => (
                    <Link key={slug} href={employerHref(slug)} aria-current={slug === section ? "page" : undefined}
                      onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
                      className="mt-1 block rounded-lg p-2 text-sm font-semibold hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">{label}</Link>
                  ))}
                </div>
              </details>
            </div>
          </header>
          {searchError && <p role="alert" className="mt-3 text-sm text-red-700">{searchError}</p>}
          {results && <section className={`mt-3 ${employerPanel}`} aria-label="Employer search results">
            <div className="flex items-center justify-between gap-3"><h2 className="font-extrabold">Search results</h2><Button type="button" variant="ghost" onClick={() => setResults(undefined)}>Close</Button></div>
            {!results.jobs.length && !results.applications.length && <p className="text-sm text-slate-600">No jobs or forwarded applications match your search.</p>}
            <ul className="grid gap-2 sm:grid-cols-2">
              {results.jobs.map((job) => <li key={job._id}><Link className={employerTextLink} onClick={() => setResults(undefined)} href={`${employerHref("jobs")}#job-${job._id}`}>{job.title} · {job.location}</Link></li>)}
              {results.applications.map((application) => <li key={application._id}><Link className={employerTextLink} onClick={() => setResults(undefined)} href={`${employerHref("applications")}#application-${encodeURIComponent(application._id)}`}>{application.name} · {application.jobTitle}</Link></li>)}
            </ul>
          </section>}
          <div className="pt-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
            {section && <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>}
            {section && error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {!section && <EmployerOverview data={data} name={companyName} days={days} changeDays={setDays} error={error} />}
            {section === "profile" && (profileError
              ? <p role="alert" className={employerPanel}>{profileError}</p>
              : profile ? <PersonalProfileEditor role="employer" profile={profile} accountName={name} email={email} update={(changes) => setProfile((current) => ({ ...current, ...changes }))} />
                : <p role="status" className={employerPanel}>Loading your profile…</p>)}
            {["company", "post-a-job", "jobs", "featured"].includes(section) && (
              <>
                <CompanyApplicationPanel title={section === "company" ? "Company profile" : companyName} companyHref={employerHref("company")} jobsHref={employerHref("post-a-job")}
                  mode={section === "company" ? "application" : section === "post-a-job" ? "post" : section === "featured" ? "featured" : "list"}
                  onCompanyChange={() => setRefresh((value) => value + 1)} />
                {section === "post-a-job" && status === "approved" && <Link href={employerHref("jobs")} className={`mt-4 ${employerTextLink}`}>Manage drafts and publish jobs</Link>}
              </>
            )}
            {section === "applications" && (status === "approved"
              ? <JobApplicationsPanel role="employer" />
              : <section className={employerPanel}><p className="text-sm text-slate-700">{data ? "Your company must be approved to receive forwarded applications." : "Loading your company status…"}</p><Link href={employerHref("company")} className={`mt-3 ${employerTextLink}`}>View company profile</Link></section>)}
            {section === "notifications" && <section className={employerPanel}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Company and application updates</h2>{unread.length > 0 && <Button type="button" variant="outline" disabled={marking} onClick={markRead}>{marking ? "Marking…" : "Mark all as read"}</Button>}</div>
              {!data?.notifications.length && <p className="text-sm text-slate-600">{data ? "Company decisions and forwarded applications will appear here." : "Loading notifications…"}</p>}
              <ul className="space-y-3">{data?.notifications.map((entry) => <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><Link href={entry.href} className={employerTextLink}>{entry.title}</Link><span className="text-xs text-slate-600">{employerDate.format(new Date(entry.date))}</span></div>
                <p className="mt-1 text-sm text-slate-700 [overflow-wrap:anywhere]">{entry.detail}</p>
              </li>)}</ul>
            </section>}
            {section === "settings" && <section className={employerPanel}>
              <h2 className="text-lg font-extrabold">Account and notifications</h2>
              <p className="mt-2 text-sm text-slate-600 [overflow-wrap:anywhere]">{email} · {verified ? "Verified" : "Awaiting verification"}</p>
              <div className="mt-3 flex flex-wrap gap-3"><Link href={employerHref("profile")} className={employerTextLink}>Edit personal profile</Link><Link href="/forgot-password" className={employerTextLink}>Reset password</Link>{!verified && <Link href="/verify-email" className={employerTextLink}>Verify email</Link>}</div>
              {data && <form key={String(data.preferences.showNotificationBadge)} method="post" onSubmit={saveSettings} className="mt-5 space-y-4">
                <label className="block max-w-md text-sm font-bold">Account name<input name="name" defaultValue={name} required maxLength={120} className="mt-1.5 block min-h-10 w-full rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700" /></label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input name="showNotificationBadge" type="checkbox" defaultChecked={data.preferences.showNotificationBadge} className="size-4 accent-emerald-700" /> Show unread notification badges</label>
                <Button type="submit" disabled={saving} className={employerPrimary}>{saving ? "Saving…" : "Save settings"}</Button>
              </form>}
              {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
              {emailEnabled && <AccountEmailEditor verified={verified} callbackURL={employerHref("settings")} />}
            </section>}
          </div>
        </main>
        <footer className="relative isolate flex flex-wrap items-center gap-x-6 gap-y-4 overflow-hidden border-t border-emerald-100 bg-[#eaf4f1] px-5 py-5 text-[#083c2e] sm:px-8">
          <Image src={parliamentPhoto} alt="" fill sizes="(min-width: 1024px) 35vw, 50vw" className="-z-10 ml-auto max-w-[36%] object-cover object-[right_55%] opacity-15 mix-blend-multiply" />
          <Link href="/" className="flex items-center gap-2 font-extrabold"><BriefcaseBusiness aria-hidden="true" className="size-8" />UKJobBoard</Link>
          <nav aria-label="Employer footer" className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">{policyLinks.map((link) => <Link key={link.href} href={link.href} className="hover:underline">{link.label}</Link>)}</nav>
        </footer>
      </div>
    </div>
  );
}
