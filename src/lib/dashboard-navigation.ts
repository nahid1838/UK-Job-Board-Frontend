import {
  Activity, BriefcaseBusiness, Building2, ClipboardList, FileText, LayoutDashboard,
  List, Mail, Settings, UserRound, Users,
} from "lucide-react";
import type { DashboardRole } from "./dashboard-access";

const overview = { slug: "", label: "Dashboard", Icon: LayoutDashboard };

export const dashboardNavigation = {
  seeker: [
    overview,
    { slug: "applications", label: "My applications", Icon: ClipboardList },
    { slug: "profile", label: "My profile", Icon: UserRound },
    { slug: "cv", label: "CV / Resume", Icon: FileText },
    { slug: "become-an-employer", label: "Become an Employer", Icon: Building2 },
    { slug: "jobs", label: "Manage jobs", Icon: List },
    { slug: "received-applications", label: "Received applications", Icon: ClipboardList },
    { slug: "settings", label: "Settings", Icon: Settings },
  ],
  employer: [
    overview,
    { slug: "post-a-job", label: "Post a job", Icon: BriefcaseBusiness },
    { slug: "jobs", label: "Manage jobs", Icon: List },
    { slug: "applications", label: "Applications", Icon: ClipboardList },
    { slug: "company", label: "Company profile", Icon: Building2 },
    { slug: "settings", label: "Settings", Icon: Settings },
  ],
  admin: [
    overview,
    { slug: "companies", label: "Manage companies", Icon: Building2 },
    { slug: "applications", label: "Applications", Icon: ClipboardList },
    { slug: "jobs", label: "Manage jobs", Icon: BriefcaseBusiness },
    { slug: "categories", label: "Categories", Icon: List },
    { slug: "users", label: "Users", Icon: Users },
    { slug: "email-templates", label: "Email templates", Icon: Mail },
    { slug: "activity", label: "Activity log", Icon: Activity },
    { slug: "settings", label: "Settings", Icon: Settings },
  ],
};

export function dashboardHref(role: DashboardRole, section = "") {
  return section ? `/dashboard/${role}/${section}` : `/dashboard/${role}`;
}
