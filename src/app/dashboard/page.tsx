import { dashboardPaths, getDashboardUser } from "@/lib/dashboard-access";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardRedirect() {
  const { role } = await getDashboardUser();
  return redirect(dashboardPaths[role]);
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main className="p-6" role="status">Loading dashboard…</main>}>
      <DashboardRedirect />
    </Suspense>
  );
}
