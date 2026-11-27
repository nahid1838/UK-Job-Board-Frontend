"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { useState } from "react";

export type PerformancePoint = { date: string; views: number; applications: number; users?: number };

const formatDate = new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", timeZone: "UTC" });
const label = (date: string) => formatDate.format(new Date(`${date}T00:00:00Z`));

export function EmployerPerformance({ series, days, onRangeChange, admin = false }: {
  series: PerformancePoint[]; days: number; onRangeChange: (days: number) => void; admin?: boolean;
}) {
  const [hovered, setHovered] = useState<number>();
  const highest = Math.max(4, ...series.map((point) => Math.max(point.views, point.applications, point.users ?? 0)));
  const step = Math.max(1, Math.ceil(highest / 4));
  const max = step * 4;
  const plot = { left: 44, right: 710, top: 10, bottom: 155 };
  const x = (index: number) => plot.left + (plot.right - plot.left) * index / Math.max(1, series.length - 1);
  const y = (value: number) => plot.bottom - (plot.bottom - plot.top) * value / max;
  const points = (key: "views" | "applications" | "users") => series.map((item, index) => `${x(index)},${y(item[key] ?? 0)}`).join(" ");
  const selected = hovered === undefined ? undefined : series[hovered];
  const ticks = [...new Set([0, Math.floor(series.length / 4), Math.floor(series.length / 2), Math.floor(series.length * 3 / 4), series.length - 1])];

  return (
    <section className="min-w-0 rounded-2xl border border-[#e0e8ee] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold sm:text-lg"><ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5 text-emerald-700" /> {admin ? "Website Overview" : "Job Performance Overview"}</h2>
        <select aria-label="Performance date range" value={days} onChange={(event) => { setHovered(undefined); onRangeChange(Number(event.target.value)); }}
          className="min-h-10 rounded-xl bg-[#f0f5fa] px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-700">
          {[7, 30, 90].map((range) => <option key={range} value={range}>Last {range} Days</option>)}
        </select>
      </div>
      {series.length > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-slate-700">
            <span><span aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-full bg-[#087951]" /> Job views</span>
            <span><span aria-hidden="true" className={`mr-1 inline-block size-2.5 rounded-full ${admin ? "bg-blue-600" : "bg-[#42cf84]"}`} /> {admin ? "Applications" : "Forwarded applications"}</span>
            {admin && <span><span aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-full bg-violet-600" /> New users</span>}
          </div>
          <svg viewBox="0 0 728 182" className="mt-2 h-auto min-h-30 w-full overflow-visible" role="img" aria-label={`Job views and applications over the last ${days} days`}>
            <defs><linearGradient id="employer-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22a66e" stopOpacity=".22" /><stop offset="100%" stopColor="#22a66e" stopOpacity="0" /></linearGradient></defs>
            {[0, 1, 2, 3, 4].map((tick) => (
              <g key={tick}>
                <line x1={plot.left} x2={plot.right} y1={y(tick * step)} y2={y(tick * step)} stroke="#e7edf2" />
                <text x="2" y={y(tick * step) + 4} fontSize="12" fill="#526178" className="hidden sm:block">{Intl.NumberFormat("en-GB", { notation: "compact" }).format(tick * step)}</text>
              </g>
            ))}
            {ticks.map((index) => <text key={index} x={x(index)} y="176" textAnchor={index === 0 ? "start" : index === series.length - 1 ? "end" : "middle"} fontSize="12" fill="#526178" className="hidden sm:block">{label(series[index].date)}</text>)}
            <polygon fill="url(#employer-chart-fill)" points={`${plot.left},${plot.bottom} ${points("views")} ${plot.right},${plot.bottom}`} />
            <polyline fill="none" stroke="#087951" strokeWidth="2.6" strokeLinejoin="round" points={points("views")} />
            <polyline fill="none" stroke={admin ? "#2563eb" : "#42cf84"} strokeWidth="2.6" strokeLinejoin="round" points={points("applications")} />
            {admin && <polyline fill="none" stroke="#7c3aed" strokeWidth="2.6" strokeLinejoin="round" points={points("users")} />}
            {selected && hovered !== undefined && <g><line x1={x(hovered)} x2={x(hovered)} y1={plot.top} y2={plot.bottom} stroke="#10875e" strokeDasharray="4 4" /><circle cx={x(hovered)} cy={y(selected.views)} r="4" fill="#087951" /><circle cx={x(hovered)} cy={y(selected.applications)} r="4" fill="#42cf84" /></g>}
            <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} fill="transparent"
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const position = Math.round((event.clientX - rect.left) / rect.width * (series.length - 1));
                setHovered(Math.min(series.length - 1, Math.max(0, position)));
              }} onPointerLeave={() => setHovered(undefined)} />
          </svg>
          <div className="flex justify-between px-2 text-xs text-slate-600 sm:hidden"><span>{label(series[0].date)}</span><span>{label(series[series.length - 1].date)}</span></div>
          {selected && <p className="mt-1 text-xs text-slate-600">{label(selected.date)} · {selected.views} views · {selected.applications} applications{admin ? ` · ${selected.users ?? 0} new users` : ""}</p>}
          <details className="mt-2 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-emerald-800">View chart data</summary>
            <div className="mt-2 max-h-48 overflow-auto"><table className="w-full text-left"><thead><tr><th>Date</th><th>Job views</th><th>{admin ? "Applications" : "Forwarded applications"}</th>{admin && <th>New users</th>}</tr></thead><tbody>
              {series.map((point) => <tr key={point.date} className="border-t border-slate-100"><td className="py-1">{label(point.date)}</td><td>{point.views}</td><td>{point.applications}</td>{admin && <td>{point.users ?? 0}</td>}</tr>)}
            </tbody></table></div>
          </details>
        </>
      ) : <p className="mt-5 text-sm text-slate-600">Performance data will appear here once loaded.</p>}
    </section>
  );
}
