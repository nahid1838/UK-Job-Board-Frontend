import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { dashboardNavigation } from "@/lib/dashboard-navigation";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type DashboardRouteProps = {
  params: Promise<{ role: string; section?: string[] }>;
};

async function DashboardRouteContent({ params }: DashboardRouteProps) {
  const { role, section = [] } = await params;
  if ((role !== "seeker" && role !== "employer" && role !== "admin") || section.length > 1) notFound();

  const currentSection = section[0] ?? "";
  if (!dashboardNavigation[role].some(({ slug }) => slug === currentSection)) notFound();

  return <DashboardPage role={role} section={currentSection} />;
}

export default function DashboardRoute({ params }: DashboardRouteProps) {
  return (
    <Suspense fallback={<main className="p-6" role="status">Loading dashboard…</main>}>
      <DashboardRouteContent params={params} />
    </Suspense>
  );
}
