import { getCategoriesWithCounts } from "@/lib/categories";
import { BriefcaseBusiness, GraduationCap, HeartPulse, Landmark, Megaphone, Monitor, Wrench, ShoppingBag, Users, HardHat, Headset } from "lucide-react";
import Link from "next/link";

const categoryIcons = [
  { match: /technology|software|digital|^it\b/i, Icon: Monitor, style: "bg-cyan-50 text-cyan-700" },
  { match: /engineer/i, Icon: Wrench, style: "bg-sky-50 text-sky-700" },
  { match: /marketing|sales/i, Icon: Megaphone, style: "bg-blue-50 text-blue-700" },
  { match: /finance|account/i, Icon: Landmark, style: "bg-emerald-50 text-emerald-700" },
  { match: /health|medical/i, Icon: HeartPulse, style: "bg-emerald-50 text-emerald-700" },
  { match: /education|teach/i, Icon: GraduationCap, style: "bg-teal-50 text-teal-700" },
  { match: /retail|product/i, Icon: ShoppingBag, style: "bg-sky-50 text-sky-700" },
  { match: /people|human|^hr\b/i, Icon: Users, style: "bg-violet-50 text-violet-700" },
  { match: /construction/i, Icon: HardHat, style: "bg-orange-50 text-orange-700" },
  { match: /customer/i, Icon: Headset, style: "bg-rose-50 text-rose-700" },
];

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
      {categories.slice(0, limit ?? categories.length).map(({ _id, name, jobCount }) => {
        const { Icon, style } = categoryIcons.find(({ match }) => match.test(name)) ?? { Icon: BriefcaseBusiness, style: "bg-emerald-50 text-emerald-700" };
        return (
        <li key={_id} className="min-w-0">
          <Link href={`/jobs?category=${_id}`} className="flex h-full min-h-14 items-center gap-2 rounded-xl border border-[#e9eef5] bg-white p-2.5 text-[#10213b] shadow-sm hover:border-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 motion-safe:transition motion-safe:hover:-translate-y-0.5">
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${style}`}><Icon aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0"><span className="block text-xs font-semibold [overflow-wrap:anywhere] sm:text-sm">{name}</span><span className="block text-xs text-slate-600">({jobCount.toLocaleString("en-GB")})<span className="sr-only"> jobs</span></span></span>
          </Link>
        </li>
      ); })}
    </ul>
  );
}
