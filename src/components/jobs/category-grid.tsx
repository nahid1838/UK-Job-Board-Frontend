import { getCategoriesWithCounts } from "@/lib/categories";
import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

export async function CategoryGrid({ limit }: { limit?: number }) {
  let categories;
  try {
    categories = await getCategoriesWithCounts();
  } catch {
    return <p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Categories are temporarily unavailable. Refresh to try again.</p>;
  }

  if (!categories.length) {
    return <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">There are no categories to browse yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.slice(0, limit ?? categories.length).map(({ _id, name, jobCount }) => (
        <li key={_id} className="min-w-0">
          <Link href={`/jobs?category=${_id}`} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-[#10213b] shadow-sm hover:border-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 motion-safe:transition motion-safe:hover:-translate-y-0.5">
            <span className="mb-3 grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-800"><BriefcaseBusiness aria-hidden="true" className="size-5" /></span>
            <span className="text-sm font-semibold [overflow-wrap:anywhere]">{name}</span>
            <span className="mt-auto pt-1 text-sm text-slate-600">{jobCount.toLocaleString("en-GB")} {jobCount === 1 ? "job" : "jobs"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
