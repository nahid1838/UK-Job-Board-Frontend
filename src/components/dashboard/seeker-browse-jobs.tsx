"use client";

import { ContentSkeleton } from "@/components/shared/content-skeleton";

import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { getCategories, type Category } from "@/lib/categories";
import { getJobResults } from "@/lib/public-jobs";
import { useEffect, useState, type FormEvent } from "react";
import { seekerPanel } from "./seeker-profile";

const input = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";

export function SeekerBrowseJobs() {
  const [filters, setFilters] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getJobResults>>>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getCategories({ signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setCategories(data);
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(filters);
    query.set("page", String(page));
    query.set("limit", "9");
    getJobResults(query).then((data) => {
      if (active) { setResult(data); setError(""); }
    }).catch(() => {
      if (active) setError("Jobs are temporarily unavailable. Refresh to try again.");
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [filters, page]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const query = new URLSearchParams();
    for (const name of ["keyword", "location", "category"]) {
      const value = String(values.get(name) ?? "").trim();
      if (value) query.set(name, value);
    }
    const next = query.toString();
    if (next === filters && page === 1) return;
    setIsLoading(true);
    setFilters(next);
    setPage(1);
  }

  function changePage(next: number) {
    if (next === page) return;
    setIsLoading(true);
    setPage(next);
  }

  return (
    <section className={seekerPanel}>
      <form onSubmit={search} role="search" aria-label="Filter jobs" className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <label className="text-sm font-semibold">Keyword<input name="keyword" placeholder="Job title or company" className={input} /></label>
        <label className="text-sm font-semibold">UK location<input name="location" placeholder="Town or city" className={input} /></label>
        <label className="text-sm font-semibold">Category<select name="category" className={input}><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
        <Button type="submit" className="min-h-11 bg-[#075b43] hover:bg-[#064733]">Find jobs</Button>
      </form>
      {isLoading ? <ContentSkeleton label="Loading jobs…" className="mt-5 text-sm" /> : error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : result && (
        <>
          <p className="mt-5 text-sm text-slate-600">{result.total} {result.total === 1 ? "job" : "jobs"} found</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{result.jobs.map((job) => <li key={job._id}><JobCard job={job} compact /></li>)}</ul>
          {result.pages > 1 && <nav aria-label="Job results pages" className="mt-5 flex items-center justify-between gap-3 text-sm">
            <Button type="button" variant="outline" disabled={result.page <= 1} onClick={() => changePage(result.page - 1)}>Previous</Button>
            <span>Page {result.page} of {result.pages}</span>
            <Button type="button" variant="outline" disabled={result.page >= result.pages} onClick={() => changePage(result.page + 1)}>Next</Button>
          </nav>}
        </>
      )}
    </section>
  );
}
