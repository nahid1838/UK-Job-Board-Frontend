"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type EmployerJob = { _id: string; title: string; location: string; status: "draft" | "live" };

const inputStyle = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";
const fields = [
  { name: "title", label: "Job title", max: 120 },
  { name: "category", label: "Category", max: 100 },
  { name: "location", label: "Town or city", max: 120 },
  { name: "postcode", label: "UK postcode", max: 10 },
  { name: "jobType", label: "Job type", options: ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Apprenticeship"] },
  { name: "workMode", label: "Work mode", options: ["On-site", "Hybrid", "Remote"] },
  { name: "experience", label: "Experience level", options: ["Entry", "Mid", "Senior", "Lead", "Any level"] },
] as const;

export function JobPostingPanel({ mode = "all" }: { mode?: "all" | "post" | "list" | "recent" }) {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ jobs: EmployerJob[] }>("/api/employer/jobs", { signal: controller.signal })
      .then(({ jobs }) => { if (!controller.signal.aborted) setJobs(jobs); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingAction) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPendingAction("save");
    setError("");
    setNotice("");

    try {
      const { job } = await backendRequest<{ job: EmployerJob }>("/api/employer/jobs", {
        method: "POST",
        body: JSON.stringify({ ...Object.fromEntries(values), rightToWork: values.has("rightToWork") }),
      });
      setJobs((current) => [job, ...current]);
      setNotice(`Draft saved for ${job.title}.`);
      form.reset();
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setPendingAction("");
    }
  }

  async function publishJob(id: string) {
    if (pendingAction) return;
    setPendingAction(id);
    setError("");
    setNotice("");

    try {
      const { job } = await backendRequest<{ job: EmployerJob }>(`/api/employer/jobs/${encodeURIComponent(id)}/publish`, {
        method: "PATCH",
        body: "{}",
      });
      setJobs((current) => current.map((item) => item._id === id ? job : item));
      setNotice(`${job.title} is now live on the Jobs page.`);
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setPendingAction("");
    }
  }

  return (
    <section id="job-posting" className={mode === "recent"
      ? "mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      : "mt-6 scroll-mt-6 border-t border-slate-200 pt-6"}>
      {(mode === "post" || mode === "all") && (
        <>
          <h3 className="text-lg font-bold">Post a job</h3>
          <p className="mt-1 text-sm text-slate-600">Save a draft, then publish it when it’s ready.</p>
        </>
      )}
      {loadError && <p role="alert" className="mt-4 text-sm text-red-700">{loadError} Refresh the page to retry.</p>}
      {isLoading && <p role="status" className="mt-4 text-sm">Loading your jobs…</p>}
      {!isLoading && !loadError && (
        <>
          {mode !== "list" && mode !== "recent" && <form onSubmit={saveDraft} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="text-sm font-semibold">
                  {field.label}
                  {"options" in field ? (
                    <select name={field.name} required className={inputStyle} defaultValue="">
                      <option value="" disabled>Select {field.label.toLowerCase()}</option>
                      {field.options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input name={field.name} maxLength={field.max} required className={inputStyle} />
                  )}
                </label>
              ))}
              <label className="text-sm font-semibold">Closing date<input type="date" name="closingDate" required className={inputStyle} /></label>
              <label className="text-sm font-semibold">Minimum salary (£)<input type="number" min="0" step="0.01" name="salaryMin" className={inputStyle} /></label>
              <label className="text-sm font-semibold">Maximum salary (£)<input type="number" min="0" step="0.01" name="salaryMax" className={inputStyle} /></label>
              <label className="text-sm font-semibold">
                Pay period
                <select name="salaryPeriod" className={inputStyle} defaultValue="">
                  <option value="">Salary not shown</option>
                  {["year", "month", "day", "hour"].map((period) => <option key={period} value={period}>Per {period}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">Job description<textarea name="description" required maxLength={6000} rows={5} className={inputStyle} /></label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="rightToWork" className="mt-0.5 size-4 accent-emerald-700" />
              Candidates must have the right to work in the UK.
            </label>
            <Button type="submit" disabled={!!pendingAction} className="min-h-11 bg-[#007653] hover:bg-[#005c41]">
              {pendingAction === "save" ? "Saving…" : "Save draft"}
            </Button>
          </form>}
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-4 text-sm text-emerald-800">{notice}</p>}
          {mode !== "post" && <div className={mode === "all" ? "mt-6 border-t border-slate-200 pt-5" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">{mode === "recent" ? "Recent jobs" : "Your jobs"}</h3>
              <Link href="/jobs" className="text-sm font-semibold text-emerald-800 hover:underline">View public jobs</Link>
            </div>
            {jobs.length === 0 && <p className="mt-3 text-sm text-slate-600">Your saved drafts will appear here.</p>}
            <ul className="mt-3 space-y-2">
              {(mode === "recent" ? jobs.slice(0, 3) : jobs).map((job) => (
                <li key={job._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{job.title}</p>
                    <p className="text-sm text-slate-600">{job.location} · {job.status === "live" ? "Live" : "Draft"}</p>
                  </div>
                  {job.status === "draft" && mode !== "recent" && (
                    <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => publishJob(job._id)} className="min-h-10">
                      {pendingAction === job._id ? "Publishing…" : "Publish"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>}
        </>
      )}
    </section>
  );
}
