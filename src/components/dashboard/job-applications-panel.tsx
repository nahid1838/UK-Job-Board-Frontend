"use client";

import { Button } from "@/components/ui/button";
import { backendEndpoint, backendErrorMessage, backendRequest } from "@/lib/backend";
import { useEffect, useState, type FormEvent } from "react";

type Status = "new" | "shortlisted" | "forwarded" | "not-suitable";
type EmployerStatus = "reviewed" | "shortlisted" | "not-suitable";
type Application = {
  _id: string;
  jobTitle: string;
  companyName: string;
  status: Status;
  createdAt: string;
  forwardedAt?: string;
  employerStatus?: EmployerStatus;
  adminNote?: string;
  name?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
};

const paths = {
  seeker: "/api/job-applications/mine",
  admin: "/api/admin/job-applications",
  employer: "/api/employer/job-applications",
};
const labels = {
  new: { label: "New", style: "bg-blue-50 text-blue-800" },
  shortlisted: { label: "Shortlisted", style: "bg-emerald-50 text-emerald-800" },
  forwarded: { label: "Forwarded", style: "bg-emerald-50 text-emerald-800" },
  "not-suitable": { label: "Not suitable", style: "bg-slate-100 text-slate-700" },
};
const titles = { seeker: "My applications", admin: "Applications inbox", employer: "Forwarded applications" };
const employerLabels = {
  reviewed: { label: "Reviewed", style: "bg-blue-50 text-blue-800" },
  shortlisted: labels.shortlisted,
  "not-suitable": { label: "Not suitable", style: "bg-rose-50 text-rose-800" },
};
const emptyMessages = {
  seeker: "Jobs you apply for will appear here.",
  admin: "There are no job applications to review yet.",
  employer: "Applications appear here after an admin forwards them to your company.",
};
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" });

export function JobApplicationsPanel({ role, recent = false }: { role: keyof typeof paths; recent?: boolean }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const visible = applications.filter((item) => (!statusFilter || statusFilter === item.status)
    && `${item.name ?? ""} ${item.jobTitle} ${item.companyName}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ applications: Application[] }>(paths[role], { signal: controller.signal })
      .then(({ applications }) => { if (!controller.signal.aborted) setApplications(applications); })
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [refresh, role]);

  useEffect(() => {
    if (isLoading || !window.location.hash.startsWith("#application-")) return;
    try {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) {
        const details = target.querySelector("details");
        if (details) details.open = true;
        target.scrollIntoView({ block: "nearest" });
      }
    } catch {
      // Ignore an invalid fragment.
    }
  }, [isLoading]);

  async function review(id: string, status: "forwarded" | "not-suitable" | "shortlisted") {
    if (activeId) return;
    setActiveId(id);
    setError("");
    setNotice("");
    try {
      await backendRequest(`/api/admin/job-applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setApplications((current) => current.map((item) => item._id === id ? { ...item, status } : item));
      setNotice(status === "forwarded" ? "Application forwarded to the employer." : status === "shortlisted" ? "Applicant shortlisted." : "Application marked as not suitable.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setActiveId("");
    }
  }

  async function updateEmployerStatus(id: string, status: EmployerStatus) {
    if (activeId) return;
    setActiveId(id);
    setError("");
    setNotice("");
    try {
      const { employerStatus } = await backendRequest<{ employerStatus: EmployerStatus }>(`/api/employer/job-applications/${encodeURIComponent(id)}`, {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setApplications((current) => current.map((item) => item._id === id ? { ...item, employerStatus } : item));
      setNotice("Application review status saved.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setActiveId("");
    }
  }

  async function saveAdminNote(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (activeId) return;
    setActiveId(id);
    setError("");
    setNotice("");
    try {
      const note = new FormData(event.currentTarget).get("note");
      const reply = await backendRequest<{ note: string }>(`/api/admin/job-applications/${encodeURIComponent(id)}/note`, {
        method: "PATCH", body: JSON.stringify({ note }),
      });
      setApplications((current) => current.map((item) => item._id === id ? { ...item, adminNote: reply.note } : item));
      setNotice("Private note saved.");
    } catch (error) { setError(backendErrorMessage(error)); }
    finally { setActiveId(""); }
  }

  return (
    <section className={`${recent ? "" : "mt-6 "}min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{recent ? "Recent applications" : titles[role]}</h2>
        {!recent && <Button type="button" variant="outline" disabled={isLoading || !!activeId} onClick={() => {
          setError("");
          setIsLoading(true);
          setRefresh((value) => value + 1);
        }}>Refresh</Button>}
      </div>
      {isLoading && <p role="status" className="mt-3 text-sm text-slate-600">Loading applications…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
      {role === "admin" && !recent && <div className="mt-4 flex flex-wrap gap-2">
        <input aria-label="Search applications" placeholder="Applicant, job, or company" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-10 w-full max-w-xs rounded-lg border border-slate-300 px-3 text-sm" />
        <select aria-label="Application status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">All statuses</option>{Object.entries(labels).map(([value, status]) => <option key={value} value={value}>{status.label}</option>)}</select>
      </div>}
      {!isLoading && !error && applications.length === 0 && <p className="mt-3 text-sm text-slate-600">{emptyMessages[role]}</p>}
      {!isLoading && applications.length > 0 && !visible.length && <p className="mt-3 text-sm text-slate-600">No applications match your filters.</p>}
      <ul className="mt-4 space-y-3">
        {(recent ? visible.slice(0, 3) : visible).map((application) => {
          const status = role === "employer" && application.employerStatus ? employerLabels[application.employerStatus] : labels[application.status];
          return (
            <li id={`application-${application._id}`} key={application._id} className="scroll-mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold break-words">{application.jobTitle}</h3>
                  <p className="break-words text-sm text-slate-600">{application.companyName} · {dateFormat.format(new Date(application.createdAt))}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.style}`}>
                  {role === "seeker" && application.status === "new" ? "Submitted" : status.label}
                </span>
              </div>
              {role !== "seeker" && !recent && (
                <details className="mt-3 border-t border-slate-200 pt-3 text-sm">
                  <summary className="cursor-pointer font-semibold">View application</summary>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><dt className="font-semibold">Applicant</dt><dd className="break-words">{application.name}</dd></div>
                    <div><dt className="font-semibold">Email</dt><dd className="break-all">{application.email}</dd></div>
                    <div><dt className="font-semibold">Phone</dt><dd>{application.phone}</dd></div>
                    {application.forwardedAt && <div><dt className="font-semibold">Forwarded</dt><dd>{dateFormat.format(new Date(application.forwardedAt))}</dd></div>}
                    <div className="sm:col-span-2"><dt className="font-semibold">Cover letter</dt><dd className="whitespace-pre-wrap break-words">{application.coverLetter || "None provided."}</dd></div>
                  </dl>
                  <a href={backendEndpoint(`/api/job-applications/${encodeURIComponent(application._id)}/cv`).href} className="mt-3 inline-block font-semibold text-emerald-800 underline">Download CV</a>
                  {role === "admin" && <form method="post" onSubmit={(event) => saveAdminNote(event, application._id)} className="mt-4 space-y-2">
                    <label className="block font-semibold">Private admin note<textarea name="note" defaultValue={application.adminNote} maxLength={2000} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700" /></label>
                    <Button type="submit" variant="outline" disabled={!!activeId}>Save note</Button>
                  </form>}
                  {role === "employer" && <label className="mt-4 block max-w-56 text-sm font-semibold">Your review status
                    <select value={application.employerStatus ?? ""} disabled={!!activeId}
                      onChange={(event) => { if (event.target.value) void updateEmployerStatus(application._id, event.target.value as EmployerStatus); }}
                      className="mt-1.5 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-emerald-700">
                      <option value="" disabled>Forwarded</option>
                      {Object.entries(employerLabels).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>}
                  {role === "admin" && (application.status === "new" || application.status === "shortlisted") && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {application.status === "new" && <Button type="button" variant="outline" disabled={!!activeId} onClick={() => review(application._id, "shortlisted")}>Shortlist</Button>}
                      <Button type="button" disabled={!!activeId} onClick={() => review(application._id, "forwarded")} className="bg-[#007653] hover:bg-[#005c41]">Forward to employer</Button>
                      <Button type="button" variant="outline" disabled={!!activeId} onClick={() => review(application._id, "not-suitable")}>Mark not suitable</Button>
                    </div>
                  )}
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
