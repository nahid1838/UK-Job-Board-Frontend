import { BackendAccessCheck } from "./backend-access-check";
import { AdminCompanyQueue, CompanyApplicationPanel } from "./company-applications";
import { DashboardShell } from "./dashboard-shell";
import { CategoryManager } from "./category-manager";
import { JobApplicationsPanel } from "./job-applications-panel";
import { dashboardPaths, getDashboardUser, type DashboardRole } from "@/lib/dashboard-access";
import { dashboardHref, dashboardNavigation } from "@/lib/dashboard-navigation";
import { BriefcaseBusiness, Building2, ClipboardList, Clock3, FileCheck2, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const dashboardContent = {
  seeker: {
    title: "Job Seeker Dashboard",
    description: "Track your job applications and take the next step in your career.",
    stats: [
      { label: "Total applications", Icon: ClipboardList },
      { label: "In progress", Icon: Clock3 },
      { label: "Closed", Icon: FileCheck2 },
    ],
  },
  employer: {
    title: "Employer Dashboard",
    description: "Manage your company, job listings, and applications.",
    stats: [
      { label: "Total jobs", Icon: BriefcaseBusiness },
      { label: "Applications", Icon: ClipboardList },
      { label: "Company status", Icon: Building2 },
    ],
  },
  admin: {
    title: "Admin Dashboard",
    description: "Review companies and keep track of activity across the job board.",
    stats: [
      { label: "Live jobs", Icon: BriefcaseBusiness },
      { label: "Companies", Icon: Building2 },
      { label: "New applications", Icon: ClipboardList },
      { label: "Users", Icon: Users },
    ],
  },
};

const statStyles = [
  "border-blue-100 bg-[#eef4ff] text-blue-800",
  "border-amber-100 bg-[#fff5e8] text-amber-800",
  "border-emerald-100 bg-[#e9faf2] text-emerald-800",
  "border-indigo-100 bg-[#eef0ff] text-indigo-800",
];

function ActivityPanel({ id, title, message }: { id: string; title: string; message: string }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-slate-500">
          <ClipboardList aria-hidden="true" className="size-5" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
    </section>
  );
}

const sectionMessages: Record<string, string> = {
  cv: "CV uploads will be added with the job application workflow.",
  users: "User management will be available when account administration is connected.",
  "email-templates": "Email templates will be available when email delivery is connected.",
  activity: "The activity log will show administrative actions when audit reporting is connected.",
  jobs: "Job moderation will be available when admin job management is connected.",
};

export async function DashboardPage({ role: requiredRole, section }: { role: DashboardRole; section: string }) {
  const { user, role } = await getDashboardUser();
  if (role !== requiredRole) redirect(dashboardPaths[role]);

  const { title, description, stats } = dashboardContent[role];
  const firstName = user.name.trim().split(/\s+/)[0] || "there";
  const initial = firstName[0].toUpperCase();
  const sectionTitle = dashboardNavigation[role].find(({ slug }) => slug === section)?.label ?? title;
  const companyHref = dashboardHref(role, role === "seeker" ? "become-an-employer" : "company");
  const manageJobsHref = dashboardHref(role, "jobs");
  const postJobHref = dashboardHref(role, role === "seeker" ? "jobs" : "post-a-job");
  const companyTitle = role === "seeker" ? "Become an Employer" : "Company profile";

  if (section) {
    return (
      <DashboardShell key={section} role={role} name={user.name} section={section}>
        <Link href={dashboardHref(role)} className="mb-3 inline-block text-sm font-semibold text-emerald-800 hover:underline">Dashboard</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">{sectionTitle}</h1>
        {role === "admin" && section === "companies" ? (
          <AdminCompanyQueue />
        ) : role === "admin" && section === "categories" ? (
          <CategoryManager />
        ) : section === "applications" || section === "received-applications" ? (
          <JobApplicationsPanel role={section === "received-applications" ? "employer" : role} />
        ) : role !== "admin" && ["company", "become-an-employer", "jobs", "post-a-job"].includes(section) ? (
          <>
            <CompanyApplicationPanel
              title={companyTitle}
              companyHref={companyHref}
              jobsHref={postJobHref}
              mode={section === "post-a-job" ? "post" : section === "jobs" ? (role === "seeker" ? "all" : "list") : "application"}
            />
            {section === "post-a-job" && (
              <Link href={manageJobsHref} className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">Manage drafts and publish jobs</Link>
            )}
            {section === "jobs" && role === "employer" && (
              <Link href={postJobHref} className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">Post a job</Link>
            )}
          </>
        ) : section === "profile" || section === "settings" ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">{role === "admin" ? "Signed-in administrator" : "Account details"}</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold">Name</dt><dd className="break-words text-slate-600">{user.name}</dd></div>
              <div><dt className="font-semibold">Email</dt><dd className="break-all text-slate-600">{user.email}</dd></div>
              <div><dt className="font-semibold">Email verification</dt><dd className="text-slate-600">{user.emailVerified ? "Verified" : "Awaiting verification"}</dd></div>
            </dl>
          </section>
        ) : (
          <div className="mt-6">
            <ActivityPanel id={section} title={sectionTitle} message={sectionMessages[section] ?? "This section is awaiting its workflow."} />
          </div>
        )}
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={role} name={user.name} section={section}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="min-w-0">
          {role === "seeker" && <p className="mb-1 text-sm font-semibold text-emerald-800">{title}</p>}
          <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">
            {role === "seeker" ? `Welcome back, ${firstName}!` : title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        </div>
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-emerald-200 bg-emerald-50 font-bold text-emerald-800">
          {initial}
        </span>
      </header>

      <dl aria-label="Dashboard overview" className={`mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 ${role === "admin" ? "xl:grid-cols-4" : "md:grid-cols-3"}`}>
        {stats.map(({ label, Icon }, index) => (
          <div key={label} className={`rounded-2xl border p-4 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:p-5 ${statStyles[index]}`}>
            <div className="mb-3 grid size-9 place-items-center rounded-lg bg-white/70">
              <Icon aria-hidden="true" className="size-5" />
            </div>
            <dt className="text-sm font-semibold text-[#10213b]">{label}</dt>
            <dd className="mt-1 text-2xl font-extrabold leading-none"><span aria-hidden="true">—</span><span className="sr-only">Data unavailable</span></dd>
          </div>
        ))}
      </dl>

      {role !== "admin" && <CompanyApplicationPanel title={companyTitle} companyHref={companyHref} jobsHref={postJobHref} mode="overview" />}

      <div className={`mt-6 grid gap-4 ${role === "admin" ? "xl:grid-cols-2 xl:items-start" : ""}`}>
        {role === "admin" && <AdminCompanyQueue overviewHref={dashboardHref(role, "companies")} />}
        {role !== "employer" && <JobApplicationsPanel role={role} recent />}
      </div>

      {process.env.NODE_ENV === "development" && <BackendAccessCheck />}
    </DashboardShell>
  );
}
