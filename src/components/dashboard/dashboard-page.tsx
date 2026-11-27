import { AdminWorkspace } from "./admin-workspace";
import { CompanyApplicationPanel } from "./company-applications";
import { EmployerWorkspace } from "./employer-workspace";
import { JobApplicationsPanel } from "./job-applications-panel";
import { SeekerWorkspace } from "./seeker-workspace";
import { authEmailEnabled } from "@/lib/auth-email";
import { dashboardPaths, getDashboardUser, type DashboardRole } from "@/lib/dashboard-access";
import { dashboardHref } from "@/lib/dashboard-navigation";
import { redirect } from "next/navigation";

export async function DashboardPage({ role: requiredRole, section }: { role: DashboardRole; section: string }) {
  const { user, role } = await getDashboardUser();
  if (role !== requiredRole) redirect(dashboardPaths[role]);

  const account = { email: user.email, verified: user.emailVerified, emailEnabled: authEmailEnabled };
  if (role === "seeker") {
    return (
      <SeekerWorkspace key={section} section={section} accountName={user.name} {...account}>
        {(section === "become-an-employer" || section === "jobs") && (
          <CompanyApplicationPanel
            title="Become an Employer" companyHref={dashboardHref(role, "become-an-employer")} jobsHref={dashboardHref(role, "jobs")}
            mode={section === "jobs" ? "all" : "application"}
          />
        )}
        {section === "received-applications" && <JobApplicationsPanel role="employer" />}
      </SeekerWorkspace>
    );
  }

  if (role === "employer") {
    return <EmployerWorkspace key={section} section={section} accountName={user.name} {...account} />;
  }
  return <AdminWorkspace key={section} section={section} name={user.name} {...account} />;
}
