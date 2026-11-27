"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { JobPostingPanel } from "./job-posting-panel";
import { CompanyLogoForm } from "./company-logo-form";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const fields = [
  { name: "name", label: "Company name", max: 120 },
  { name: "registrationNumber", label: "Companies House number (if applicable)", max: 8 },
  { name: "address", label: "Registered address", max: 180 },
  { name: "town", label: "Town or city", max: 100 },
  { name: "postcode", label: "UK postcode", max: 10 },
  { name: "website", label: "Company website", max: 300, type: "url" },
  { name: "industry", label: "Industry", max: 100 },
  { name: "size", label: "Company size", max: 20 },
  { name: "contactName", label: "Contact name", max: 120 },
  { name: "contactEmail", label: "Work email", max: 254, type: "email" },
  { name: "contactPhone", label: "Contact phone", max: 40, type: "tel" },
  { name: "description", label: "About the company", max: 2000 },
] as const;

type CompanyApplication = {
  _id: string;
  revision: number;
  status: "pending" | "approved" | "rejected";
  details: Record<(typeof fields)[number]["name"], string>;
  rejectionReason?: string;
  logoUrl?: string;
};

const fieldStyle = "mt-1.5 w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";
const panelStyle = "mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
const statusStyle = {
  pending: "bg-amber-50 text-amber-900",
  approved: "bg-emerald-50 text-emerald-900",
  rejected: "bg-red-50 text-red-900",
};
const editableProfile = ["website", "description", "industry", "size", "contactName", "contactEmail", "contactPhone"];

export function CompanyApplicationPanel({ title, companyHref, jobsHref, mode = "application", onCompanyChange }: {
  title: string;
  companyHref: string;
  jobsHref: string;
  mode?: "application" | "overview" | "all" | "post" | "list" | "featured";
  onCompanyChange?: () => void;
}) {
  const [application, setApplication] = useState<CompanyApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ application: CompanyApplication | null }>("/api/company-application", { signal: controller.signal })
      .then(({ application }) => setApplication(application))
      .catch((error) => { if (!controller.signal.aborted) setLoadError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [refresh]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const { application: savedApplication } = await backendRequest<{ application: CompanyApplication }>("/api/company-application", {
        method: application?.status === "approved" ? "PATCH" : "POST",
        body: JSON.stringify({ ...Object.fromEntries(form), acceptedTerms: form.has("acceptedTerms") }),
      });
      setApplication((current) => savedApplication.logoUrl ? savedApplication : { ...savedApplication, logoUrl: current?.logoUrl });
      setNotice(savedApplication.status === "approved" ? "Company profile saved." : "Company application submitted.");
      onCompanyChange?.();
    } catch (error) {
      setSaveError(backendErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section id="employer-access" className={mode === "overview" ? "mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5" : panelStyle}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          {application && <span role="status" className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusStyle[application.status]}`}>{application.status}</span>}
        </div>
        {isLoading && <p role="status" className="mt-3 text-sm">Loading your company application…</p>}
        {loadError && <p role="alert" className="mt-3 text-sm text-red-700">{loadError}</p>}
        {(loadError || application?.status === "pending") && !isLoading && (
          <Button type="button" variant="outline" className="mt-3" onClick={() => {
            setLoadError("");
            setIsLoading(true);
            setRefresh((value) => value + 1);
          }}>Refresh status</Button>
        )}
        {application?.status === "pending" && <p className="mt-3 text-sm text-slate-600">Your application for {application.details.name} is awaiting admin review.</p>}
        {application?.status === "approved" && (
          <>
              <p className="mt-3 text-sm text-emerald-800">{application.details.name} has been approved.</p>
              {mode === "application" && <CompanyLogoForm name={application.details.name} currentLogo={application.logoUrl} onSaved={onCompanyChange} />}
            {mode === "application" || mode === "overview" ? (
              <Link href={jobsHref} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#007653] px-4 text-sm font-semibold text-white hover:bg-[#005c41]">Post a job</Link>
            ) : <JobPostingPanel mode={mode} />}
          </>
        )}
        {application?.status === "rejected" && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">
            <strong>Reason for rejection:</strong> {application.rejectionReason} You can update your details below and resubmit.
          </p>
        )}
        {!isLoading && !loadError && mode !== "application" && application?.status !== "approved" && (
          <Link href={companyHref} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-emerald-800 hover:underline">
            {application?.status === "pending" ? "View company application" : "Open company application"}
          </Link>
        )}
        {!isLoading && !loadError && mode === "application" && application?.status !== "pending" && (
          <form method="post" onSubmit={submitApplication} className="mt-5 space-y-4">
            {application?.status === "approved" && (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">
                <h3 className="font-bold">{application.details.name}</h3>
                <p className="mt-1">{application.details.address}, {application.details.town}, {application.details.postcode}</p>
                {application.details.registrationNumber && <p className="mt-1">Companies House number: {application.details.registrationNumber}</p>}
                <p className="mt-1">Contact support to change registered company details.</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.filter((field) => application?.status !== "approved" || editableProfile.includes(field.name)).map((field) => (
                <label key={field.name} className={`block text-sm font-semibold ${field.name === "description" ? "sm:col-span-2" : ""}`}>
                  {field.label}
                  {field.name === "size" ? (
                    <select name={field.name} required defaultValue={application?.details.size || ""} className={fieldStyle}>
                      <option value="">Select company size</option>
                      {["1-10", "11-50", "51-200", "201-500", "500+"].map((size) => <option key={size}>{size}</option>)}
                    </select>
                  ) : field.name === "description" ? (
                    <textarea name={field.name} required maxLength={field.max} rows={4} defaultValue={application?.details[field.name]} className={fieldStyle} />
                  ) : (
                    <input name={field.name} type={"type" in field ? field.type : "text"} required={field.name !== "registrationNumber"}
                      maxLength={field.max} defaultValue={application?.details[field.name]} className={fieldStyle} />
                  )}
                </label>
              ))}
            </div>
            {application?.status !== "approved" && <label className="flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" name="acceptedTerms" required className="mt-0.5 size-4 accent-emerald-700" />
              I accept the Terms and Conditions and Privacy Policy.
            </label>}
            {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
            <Button type="submit" disabled={isSaving} className="min-h-11 bg-[#007653] hover:bg-[#005c41]">
              {isSaving ? "Saving…" : application?.status === "approved" ? "Save company profile" : application ? "Resubmit application" : "Submit application"}
            </Button>
          </form>
        )}
        {notice && <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      </section>
      {mode === "overview" && !isLoading && application?.status === "approved" && (
        <JobPostingPanel mode="recent" />
      )}
    </>
  );
}

export function AdminCompanyQueue({ overviewHref }: { overviewHref?: string }) {
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ applications: CompanyApplication[] }>("/api/admin/company-applications", { signal: controller.signal })
      .then(({ applications }) => setApplications(applications))
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [refresh]);

  async function review(event: FormEvent<HTMLFormElement>, application: CompanyApplication) {
    event.preventDefault();
    if (activeId) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (status !== "approved" && status !== "rejected") return;
    if (status === "rejected" && !reason) {
      setError("Enter a rejection reason before rejecting the application.");
      return;
    }
    setActiveId(application._id);
    setError("");
    setDecisionMessage("");
    try {
      await backendRequest(`/api/admin/company-applications/${encodeURIComponent(application._id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason, revision: application.revision }),
      });
      setApplications((current) => current.filter((item) => item._id !== application._id));
      setDecisionMessage(`${application.details.name} was ${status}.`);
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setActiveId("");
    }
  }

  return (
    <section id="activity" className={panelStyle}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Pending company approvals</h2>
        <Button type="button" variant="outline" disabled={isLoading || !!activeId} onClick={() => {
          setError("");
          setIsLoading(true);
          setRefresh((value) => value + 1);
        }}>Refresh queue</Button>
      </div>
      {isLoading && <p role="status" className="mt-3 text-sm">Loading applications…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {decisionMessage && <p role="status" className="mt-3 text-sm text-emerald-800">{decisionMessage}</p>}
      {!isLoading && !error && applications.length === 0 && <p className="mt-4 text-sm text-slate-600">There are no pending company applications.</p>}
      <div className="mt-4 space-y-3">
        {applications.map((application) => (
          overviewHref ? (
            <div key={application._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="break-all text-sm font-semibold">{application.details.name}</span>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">Pending</span>
            </div>
          ) : (
          <details key={application._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer font-semibold [overflow-wrap:anywhere]">{application.details.name}</summary>
            <dl className="my-4 grid gap-3 text-sm sm:grid-cols-2">
              {fields.map(({ name, label }) => (
                <div key={name}>
                  <dt className="font-semibold">{label}</dt>
                  <dd className="whitespace-pre-wrap text-slate-600 [overflow-wrap:anywhere]">{application.details[name] || "—"}</dd>
                </div>
              ))}
            </dl>
            <form onSubmit={(event) => review(event, application)} className="space-y-3">
              <label className="block text-sm font-semibold">
                Rejection reason (required when rejecting)
                <textarea name="reason" maxLength={1000} rows={2} className={fieldStyle} />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" value="approved" disabled={!!activeId} className="bg-[#007653] hover:bg-[#005c41]">Approve</Button>
                <Button type="submit" value="rejected" disabled={!!activeId} variant="destructive">Reject</Button>
              </div>
            </form>
          </details>
          )
        ))}
      </div>
      {overviewHref && <Link href={overviewHref} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-emerald-800 hover:underline">View approval queue</Link>}
    </section>
  );
}
