import { CategoryGrid } from "@/components/jobs/category-grid";
import Link from "next/link";
import { Suspense } from "react";

export function BrowseCategories() {
  return (
    <section aria-labelledby="browse-categories-title" className="mx-auto max-w-7xl px-4 pt-9 text-[#10213b] sm:px-0 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id="browse-categories-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Browse by Categories</h2>
        <Link href="/categories" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">View all categories</Link>
      </div>
      <Suspense fallback={<p role="status" className="text-sm text-slate-600">Loading categories…</p>}>
        <CategoryGrid limit={6} />
      </Suspense>
    </section>
  );
}
