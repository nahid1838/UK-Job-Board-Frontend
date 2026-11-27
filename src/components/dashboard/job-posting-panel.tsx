"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { getCategories, type Category } from "@/lib/categories";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type EmployerJob = {
  _id: string; title: string; location: string; status: "draft" | "live" | "closed";
  categoryId?: string; postcode: string; jobType: string; workMode: string; experience: string;
  closingDate: string; salaryMin: number | null; salaryMax: number | null; salaryPeriod: string;
  description: string; rightToWork: boolean; featuredUntil?: string;
};

const inputStyle = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";
const fields = [
  { name: "title", label: "Job title", max: 120 },
  { name: "location", label: "Town or city", max: 120 },
  { name: "postcode", label: "UK postcode", max: 10 },
  { name: "jobType", label: "Job type", options: ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Apprenticeship"] },
  { name: "workMode", label: "Work mode", options: ["On-site", "Hybrid", "Remote"] },
  { name: "experience", label: "Experience level", options: ["Entry", "Mid", "Senior", "Lead", "Any level"] },
] as const;

export function JobPostingPanel({ mode = "all", admin = false }: { mode?: "all" | "post" | "list" | "recent" | "featured"; admin?: boolean }) {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EmployerJob | null>(null);
  const canPost = mode === "post" || mode === "all";
  const editingAvailable = mode !== "recent" && mode !== "featured";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const shownJobs = mode === "featured" ? jobs.filter((job) => job.status === "live" && job.closingDate >= today)
    : mode === "recent" ? jobs.slice(0, 3) : jobs;
  const jobsPath = admin ? "/api/admin/jobs" : "/api/employer/jobs";

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      backendRequest<{ jobs: EmployerJob[] }>(jobsPath, options),
      editingAvailable ? getCategories(options) : Promise.resolve([]),
    ])
      .then(([{ jobs }, categories]) => {
        if (controller.signal.aborted) return;
        setJobs(jobs);
        setCategories(categories);
      })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [editingAvailable, jobsPath]);

  useEffect(() => {
    if (!isLoading && window.location.hash.startsWith("#job-")) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "nearest" });
    }
  }, [isLoading]);

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingAction) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPendingAction("save");
    setError("");
    setNotice("");

    try {
      const { job } = await backendRequest<{ job: EmployerJob }>(editing ? `${jobsPath}/${editing._id}` : jobsPath, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ ...Object.fromEntries(values), rightToWork: values.has("rightToWork"), ...(editing && { action: "edit" }) }),
      });
      setJobs((current) => editing ? current.map((item) => item._id === job._id ? job : item) : [job, ...current]);
      setNotice(editing ? `Changes saved for ${job.title}.` : `Draft saved for ${job.title}.`);
      form.reset();
      setEditing(null);
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setPendingAction("");
    }
  }

  async function manage(id: string, action: "close" | "reopen" | "duplicate" | "feature" | "delete", featured?: boolean) {
    if (pendingAction || (action === "delete" && !window.confirm("Permanently delete this job listing?"))) return;
    setPendingAction(id);
    setError("");
    setNotice("");
    try {
      if (action === "delete") {
        await backendRequest(`${jobsPath}/${id}`, { method: "DELETE", body: "{}" });
        setJobs((items) => items.filter((job) => job._id !== id));
        if (editing?._id === id) setEditing(null);
      } else {
        const { job } = await backendRequest<{ job: EmployerJob }>(`${jobsPath}/${id}`, {
          method: "PATCH", body: JSON.stringify({ action, featured }),
        });
        setJobs((items) => action === "duplicate" ? [job, ...items] : items.map((item) => item._id === id ? job : item));
      }
      setNotice("Job updated.");
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
          {(canPost || editing) && categories.length === 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Add a visible category before saving a job.</p>}
          {(canPost || editing) && categories.length > 0 && <form key={editing?._id ?? "new"} method="post" onSubmit={saveDraft} className="mt-4 space-y-4">
            {editing && <h3 className="font-semibold">Edit {editing.title}</h3>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Category
                <select name="categoryId" required className={inputStyle} defaultValue={categories.some(({ _id }) => _id === editing?.categoryId) ? editing?.categoryId : ""}>
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </label>
              {fields.map((field) => (
                <label key={field.name} className="text-sm font-semibold">
                  {field.label}
                  {"options" in field ? (
                    <select name={field.name} required className={inputStyle} defaultValue={editing?.[field.name] ?? ""}>
                      <option value="" disabled>Select {field.label.toLowerCase()}</option>
                      {field.options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input name={field.name} defaultValue={editing?.[field.name]} maxLength={field.max} required className={inputStyle} />
                  )}
                </label>
              ))}
              <label className="text-sm font-semibold">Closing date<input type="date" name="closingDate" defaultValue={editing?.closingDate} required className={inputStyle} /></label>
              <label className="text-sm font-semibold">Minimum salary (£)<input type="number" min="0" step="0.01" name="salaryMin" defaultValue={editing?.salaryMin ?? ""} className={inputStyle} /></label>
              <label className="text-sm font-semibold">Maximum salary (£)<input type="number" min="0" step="0.01" name="salaryMax" defaultValue={editing?.salaryMax ?? ""} className={inputStyle} /></label>
              <label className="text-sm font-semibold">
                Pay period
                <select name="salaryPeriod" className={inputStyle} defaultValue={editing?.salaryPeriod ?? ""}>
                  <option value="">Salary not shown</option>
                  {["year", "month", "day", "hour"].map((period) => <option key={period} value={period}>Per {period}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">Job description<textarea name="description" defaultValue={editing?.description} required maxLength={6000} rows={5} className={inputStyle} /></label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="rightToWork" defaultChecked={editing?.rightToWork} className="mt-0.5 size-4 accent-emerald-700" />
              Candidates must have the right to work in the UK.
            </label>
            <Button type="submit" disabled={!!pendingAction} className="min-h-11 bg-[#007653] hover:bg-[#005c41]">
              {pendingAction === "save" ? "Saving…" : editing ? "Save changes" : "Save draft"}
            </Button>
            {editing && <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={!!pendingAction} className="ml-2">Cancel edit</Button>}
          </form>}
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-4 text-sm text-emerald-800">{notice}</p>}
          {mode !== "post" && <div className={mode === "all" ? "mt-6 border-t border-slate-200 pt-5" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">{mode === "featured" ? "Feature a live job" : mode === "recent" ? "Recent jobs" : admin ? "Job listings" : "Your jobs"}</h3>
              <Link href="/jobs" className="text-sm font-semibold text-emerald-800 hover:underline">View public jobs</Link>
            </div>
            {mode === "featured" && <p className="mt-2 text-sm text-slate-600">Mark a live job as Hot to feature it on the public job board.</p>}
            {shownJobs.length === 0 && <p className="mt-3 text-sm text-slate-600">{mode === "featured" ? "Publish a job before featuring it." : "Your saved drafts will appear here."}</p>}
            <ul className="mt-3 space-y-2">
              {shownJobs.map((job) => {
                const isFeatured = Boolean(job.featuredUntil && new Date(job.featuredUntil) > new Date());
                return (
                <li id={`job-${job._id}`} key={job._id} className="flex scroll-mt-4 flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{job.title}</p>
                    <p className="text-sm text-slate-600">{job.location} · {job.status === "live" ? "Live" : job.status === "closed" ? "Closed" : "Draft"}{isFeatured ? " · Hot" : ""}</p>
                    {mode === "featured" && isFeatured && <p className="mt-1 text-xs text-emerald-800">Featured until {new Date(job.featuredUntil!).toLocaleDateString("en-GB", { timeZone: "Europe/London" })}</p>}
                  </div>
                  {mode !== "recent" && <div className="flex flex-wrap gap-2">
                  {mode !== "featured" && <>
                  {job.status === "draft" && !admin && (
                    <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => publishJob(job._id)} className="min-h-10">
                      {pendingAction === job._id ? "Publishing…" : "Publish"}
                    </Button>
                  )}
                  <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => {
                    setEditing(job);
                    document.getElementById("job-posting")?.scrollIntoView({ block: "start" });
                  }}>Edit</Button>
                  {job.status === "live" && <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => manage(job._id, "close")}>Close</Button>}
                  {job.status === "closed" && !admin && <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => manage(job._id, "reopen")}>Reopen</Button>}
                  {!admin && <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => manage(job._id, "duplicate")}>Duplicate</Button>}
                  <Button type="button" variant="destructive" disabled={!!pendingAction} onClick={() => manage(job._id, "delete")}>Delete</Button>
                  </>}
                  {job.status === "live" && job.closingDate >= today && <Button type="button" variant="outline" disabled={!!pendingAction} onClick={() => manage(job._id, "feature", !isFeatured)}>{isFeatured ? "Remove Hot" : "Mark Hot"}</Button>}
                  </div>}
                </li>
                );
              })}
            </ul>
          </div>}
        </>
      )}
    </section>
  );
}
