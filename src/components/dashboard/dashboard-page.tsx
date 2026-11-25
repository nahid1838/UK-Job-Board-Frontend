import { Navbar } from "@/components/shared/navbar";
import { dashboardPaths, getDashboardUser, type DashboardRole } from "@/lib/dashboard-access";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BackendAccessCheck } from "./backend-access-check";

const dashboardContent = {
  seeker: {
    title: "Job Seeker Dashboard",
    sections: [
      { title: "My applications", description: "Track the status of jobs you apply for." },
      { title: "My profile", description: "Manage your profile and CV." },
      { title: "Become an Employer", description: "Submit your company details for admin review using your existing account." },
    ],
  },
  employer: {
    title: "Employer Dashboard",
    sections: [
      { title: "Company profile", description: "Submit company details and check your approval status." },
      { title: "Manage jobs", description: "Manage your listings once your company is approved." },
      { title: "Applications", description: "Review applications forwarded to your company by an admin." },
    ],
  },
  admin: {
    title: "Admin Dashboard",
    sections: [
      { title: "Company approvals", description: "Review employer applications and approve or reject companies." },
      { title: "Applications inbox", description: "Review job applications and forward them to employers." },
      { title: "Manage listings", description: "Manage jobs, featured listings, and categories." },
    ],
  },
};

async function ProtectedDashboard({ requiredRole }: { requiredRole: DashboardRole }) {
  const { user, role } = await getDashboardUser();

  if (role !== requiredRole) redirect(dashboardPaths[role]);

  const { title, sections } = dashboardContent[requiredRole];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 px-4 py-8 text-[#10213b] sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-600">Welcome, {user.name}.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.description}</p>
              </section>
            ))}
          </div>
          {process.env.NODE_ENV === "development" && <BackendAccessCheck />}
        </div>
      </main>
    </>
  );
}

export function DashboardPage({ role }: { role: DashboardRole }) {
  return (
    <Suspense fallback={<main className="p-6" role="status">Loading dashboard…</main>}>
      <ProtectedDashboard requiredRole={role} />
    </Suspense>
  );
}
