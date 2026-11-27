"use client";

import { Bell, BriefcaseBusiness, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { dashboardNavigation } from "@/lib/dashboard-navigation";
import { AdminCompanyQueue } from "./company-applications";
import { CategoryManager } from "./category-manager";
import { JobApplicationsPanel } from "./job-applications-panel";
import { JobPostingPanel } from "./job-posting-panel";
import { AdminOverview, AdminReports, adminHref, adminTextLink, type AdminDashboardData } from "./admin-overview";
import { AdminActivity, AdminEmailTemplates, AdminSiteSettings, AdminUsers, adminDate, adminPanel } from "./admin-tools";
import { AccountEmailEditor, PersonalProfileEditor, SeekerAvatar, type SeekerProfile } from "./seeker-profile";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

const policyLinks = [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Privacy Policy", href: "/privacy" }, { label: "Cookie Policy", href: "/cookies" }, { label: "Terms & Conditions", href: "/terms" }];
const menus = [{ slug: "profile", label: "My Profile" }, { slug: "notifications", label: "Notifications" }, { slug: "settings", label: "Site Settings" }];
type Result = { id: string; title: string; section: "companies" | "jobs" | "users" };
const resultAnchors = { companies: "company", jobs: "job", users: "user" };

export function AdminWorkspace({ section, name, email, verified, emailEnabled }: {
  section: string; name: string; email: string; verified: boolean; emailEnabled: boolean;
}) {
  const [data, setData] = useState<AdminDashboardData>();
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<SeekerProfile>();
  const [profileError, setProfileError] = useState("");
  const [menu, setMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [marking, setMarking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Result[]>();
  const [searchError, setSearchError] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<AdminDashboardData>(`/api/admin/dashboard?days=${days}`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) { setData(result); setError(""); } })
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); });
    return () => controller.abort();
  }, [days]);

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ profile: SeekerProfile }>("/api/admin/profile", { signal: controller.signal })
      .then(({ profile }) => { if (!controller.signal.aborted) setProfile(profile); })
      .catch((error) => { if (!controller.signal.aborted) setProfileError(backendErrorMessage(error)); });
    return () => controller.abort();
  }, []);

  const displayName = profile?.name || name;
  const title = dashboardNavigation.admin.find(({ slug }) => slug === section)?.label ?? "Dashboard";
  const unread = data?.recentActivities.filter(({ createdAt }) => createdAt > (data.readAt ?? "")).length ?? 0;

  async function markRead() {
    if (marking || !data?.recentActivities.length) return;
    const through = data.recentActivities[0].createdAt;
    setMarking(true);
    setError("");
    try {
      await backendRequest("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ through }) });
      setData((current) => current && { ...current, readAt: through });
    } catch (error) { setError(backendErrorMessage(error)); }
    finally { setMarking(false); }
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searching) return;
    const query = String(new FormData(event.currentTarget).get("query") ?? "").trim();
    if (!query) return;
    setSearching(true);
    setSearchError("");
    setResults(undefined);
    try {
      const reply = await backendRequest<{ results: Result[] }>(`/api/admin/search?${new URLSearchParams({ q: query })}`, { signal: AbortSignal.timeout(5000) });
      setResults(reply.results);
    } catch (error) { setSearchError(backendErrorMessage(error)); }
    finally { setSearching(false); }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw result.error;
      window.location.replace("/");
    } catch {
      setError("Couldn’t sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#f7f9fb] text-[#102039] lg:grid lg:grid-cols-[14.75rem_minmax(0,1fr)]">
      <aside className="bg-linear-to-b from-[#105641] via-[#0b503d] to-[#063e32] text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
        onKeyDown={(event) => { if (event.key === "Escape" && menu) { setMenu(false); menuButton.current?.focus(); } }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:pt-7 lg:pb-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold"><BriefcaseBusiness aria-hidden="true" className="size-10 shrink-0" /><span className="text-xl tracking-tight">UKJobBoard<span className="block text-xs font-medium tracking-normal">Admin Panel</span></span></Link>
          <button ref={menuButton} type="button" aria-label={menu ? "Close admin menu" : "Open admin menu"} aria-expanded={menu} aria-controls="admin-navigation" onClick={() => setMenu(!menu)} className="grid size-11 place-items-center rounded-xl border border-white/30 lg:hidden">{menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
        <div id="admin-navigation" className={`px-4 pb-6 lg:block ${menu ? "block" : "hidden"}`}>
          <nav aria-label="Admin navigation" className="space-y-0.5 border-t border-white/20 pt-3">
            {dashboardNavigation.admin.filter(({ slug }) => slug !== "profile" && slug !== "notifications").map(({ slug, label, Icon }) => (
              <Link key={slug} href={adminHref(slug)} aria-current={slug === section ? "page" : undefined} onClick={() => setMenu(false)}
                className={`relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${slug === section ? "bg-linear-to-r from-emerald-500/55 to-[#09814c] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-white" : "hover:bg-white/12"}`}>
                <Icon aria-hidden="true" className="size-5 shrink-0" />{label}{slug === "applications" && Boolean(data?.pendingApplications) && <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs">{data?.pendingApplications}</span>}
              </Link>
            ))}
            <button type="button" onClick={signOut} disabled={signingOut} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-white/12"><LogOut aria-hidden="true" className="size-5" />{signingOut ? "Signing out…" : "Logout"}</button>
          </nav>
          <div className="relative isolate mt-6 hidden min-h-43 flex-col justify-end overflow-hidden rounded-2xl bg-[#104f40] p-3.5 lg:flex">
            <Image src={parliamentPhoto} alt="" fill sizes="200px" className="-z-20 object-cover object-[69%_50%] opacity-70" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[#062d25] to-transparent" />
            <p className="text-base leading-tight font-extrabold">Build a Better Job Market in the UK</p>
            <Link href="/" className="mt-2 inline-flex w-fit rounded-xl bg-[#0d9355] px-3 py-2 text-sm font-bold">View Website →</Link>
          </div>
          <p className="mt-5 border-t border-white/20 px-1 pt-3 text-xs text-emerald-50">© UKJobBoard. All rights reserved.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main className="flex-1 px-4 pb-6 sm:px-7 lg:px-8">
          <header className="flex flex-wrap items-center gap-3 border-b border-slate-200/75 py-4 sm:justify-between">
            <form onSubmit={search} role="search" aria-label="Search the admin dashboard" className="order-2 flex w-full max-w-lg items-center rounded-full border border-slate-300 bg-white/75 sm:order-none sm:w-1/2">
              <Search aria-hidden="true" className="ml-3 size-5 shrink-0 text-slate-500" />
              <input name="query" aria-label="Search companies, jobs, or users" placeholder="Search companies, jobs, or users…" maxLength={120} required className="min-h-10 w-full min-w-0 bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-700" />
              <button type="submit" disabled={searching} className="min-h-10 rounded-r-full px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50">{searching ? "Searching…" : "Search"}</button>
            </form>
            <div className="flex min-w-0 max-w-full items-center gap-3 sm:ml-auto">
              <Link href={adminHref("notifications")} aria-label={`Notifications, ${unread} unread`} className="relative grid size-10 shrink-0 place-items-center rounded-xl hover:bg-emerald-50"><Bell aria-hidden="true" className="size-6" />{unread > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">{unread}</span>}</Link>
              <details className="group relative min-w-0" onKeyDown={(event) => { if (event.key === "Escape" && event.currentTarget.open) { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 rounded-xl font-bold hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700"><SeekerAvatar name={displayName} photo={profile?.photo} /><span className="truncate text-sm">{displayName}</span><ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" /></summary>
                <div className="absolute top-full right-0 z-30 mt-2 w-48 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  {menus.map(({ slug, label }) => <Link key={slug} href={adminHref(slug)} className="block rounded-lg p-2 text-sm font-semibold hover:bg-emerald-50" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{label}</Link>)}
                </div>
              </details>
            </div>
          </header>
          {searchError && <p role="alert" className="mt-3 text-sm text-red-700">{searchError}</p>}
          {results && <section className={`mt-3 ${adminPanel}`} aria-label="Admin search results"><div className="flex items-center justify-between gap-2"><h2 className="font-extrabold">Search results</h2><Button type="button" variant="ghost" onClick={() => setResults(undefined)}>Close</Button></div>
            {results.length ? <ul className="grid gap-2 sm:grid-cols-2">{results.map((result) => <li key={`${result.section}-${result.id}`}><Link onClick={() => setResults(undefined)} href={`${adminHref(result.section)}#${resultAnchors[result.section]}-${encodeURIComponent(result.id)}`} className={adminTextLink}>{result.title}</Link><span className="ml-2 text-xs text-slate-600 capitalize">{result.section}</span></li>)}</ul> : <p className="text-sm text-slate-600">Nothing matches your search.</p>}
          </section>}
          <div className="pt-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
            {section && <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>}
            {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {!section && <AdminOverview name={displayName} data={data} days={days} changeDays={setDays} />}
            {section === "reports" && <AdminReports data={data} days={days} changeDays={setDays} />}
            {section === "companies" && <AdminCompanyQueue manageAll />}
            {section === "jobs" && <div className={adminPanel}><JobPostingPanel mode="list" admin /></div>}
            {section === "applications" && <JobApplicationsPanel role="admin" />}
            {section === "categories" && <CategoryManager />}
            {section === "users" && <AdminUsers emailEnabled={emailEnabled} />}
            {section === "email-templates" && <AdminEmailTemplates />}
            {section === "activity" && <AdminActivity />}
            {section === "settings" && <AdminSiteSettings />}
            {section === "profile" && (profileError ? <p role="alert" className={adminPanel}>{profileError}</p> : profile ? (
              <>
                <PersonalProfileEditor role="admin" profile={profile} accountName={name} email={email} update={(changes) => setProfile((current) => ({ ...current, ...changes }))} />
                <section className={`mt-4 ${adminPanel}`}><h2 className="font-extrabold">Account security</h2><div className="mt-3 flex flex-wrap gap-4"><Link href="/forgot-password" className={adminTextLink}>Reset password</Link>{!verified && <Link href="/verify-email" className={adminTextLink}>Verify email</Link>}</div>{emailEnabled && <AccountEmailEditor verified={verified} callbackURL={adminHref("profile")} />}</section>
              </>
            ) : <p role="status" className={adminPanel}>Loading your profile…</p>)}
            {section === "notifications" && <section className={adminPanel}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-extrabold">Recent admin updates</h2>{unread > 0 && <Button variant="outline" type="button" onClick={markRead} disabled={marking}>{marking ? "Marking…" : "Mark all as read"}</Button>}</div>
              <div className="mb-4 flex flex-wrap gap-4"><Link href={adminHref("companies")} className={adminTextLink}>{data?.companies.pending ?? 0} pending companies</Link><Link href={adminHref("applications")} className={adminTextLink}>{data?.pendingApplications ?? 0} new applications</Link></div>
              {!data?.recentActivities.length && <p className="text-sm text-slate-600">{data ? "No recent updates." : "Loading updates…"}</p>}
              <ul className="space-y-2">{data?.recentActivities.map((entry) => <li key={entry._id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-semibold [overflow-wrap:anywhere]">{entry.action} · {entry.target}</p><time dateTime={entry.createdAt} className="text-xs text-slate-600">{adminDate.format(new Date(entry.createdAt))}</time></li>)}</ul>
            </section>}
          </div>
        </main>
        <footer className="relative isolate flex flex-wrap items-center gap-x-6 gap-y-4 overflow-hidden border-t border-emerald-100 bg-[#eaf4f1] px-5 py-5 text-[#083c2e] sm:px-8">
          <Image src={parliamentPhoto} alt="" fill sizes="(min-width: 1024px) 35vw, 50vw" className="-z-10 ml-auto max-w-[36%] object-cover object-[right_55%] opacity-15 mix-blend-multiply" />
          <nav aria-label="Admin footer" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">{policyLinks.map((link) => <Link key={link.href} href={link.href} className="hover:underline">{link.label}</Link>)}</nav>
        </footer>
      </div>
    </div>
  );
}
