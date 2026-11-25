"use client";

import { Button } from "@/components/ui/button";
import { backendEndpoint, backendErrorMessage, backendRequest } from "@/lib/backend";
import { useEffect, useState } from "react";

type Status = "new" | "forwarded" | "not-suitable";
type Application = {
  _id: string;
  jobTitle: string;
  companyName: string;
  status: Status;
  createdAt: string;
  forwardedAt?: string;
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
  forwarded: { label: "Forwarded", style: "bg-emerald-50 text-emerald-800" },
  "not-suitable": { label: "Not suitable", style: "bg-slate-100 text-slate-700" },
};
const titles = { seeker: "My applications", admin: "Applications inbox", employer: "Forwarded applications" };
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

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ applications: Application[] }>(paths[role], { signal: controller.signal })
      .then(({ applications }) => { if (!controller.signal.aborted) setApplications(applications); })
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [refresh, role]);

  async function review(id: string, status: "forwarded" | "not-suitable") {
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
      setNotice(status === "forwarded" ? "Application forwarded to the employer." : "Application marked as not suitable.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setActiveId("");
    }
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
      {!isLoading && !error && applications.length === 0 && <p className="mt-3 text-sm text-slate-600">{emptyMessages[role]}</p>}
      <ul className="mt-4 space-y-3">
        {(recent ? applications.slice(0, 3) : applications).map((application) => {
          const status = labels[application.status];
          return (
            <li key={application._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
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
                  {role === "admin" && application.status === "new" && (
                    <div className="mt-4 flex flex-wrap gap-2">
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
