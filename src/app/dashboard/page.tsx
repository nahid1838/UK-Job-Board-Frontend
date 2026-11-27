import { ContentSkeleton } from "@/components/shared/content-skeleton";
import { dashboardPaths, getDashboardUser } from "@/lib/dashboard-access";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardRedirect() {
  const { role } = await getDashboardUser();
  return redirect(dashboardPaths[role]);
}

export default function Dashboard() {
  return (
    <Suspense fallback={<ContentSkeleton label="Loading dashboard…" className="p-6" />}>
      <DashboardRedirect />
    </Suspense>
  );
}
