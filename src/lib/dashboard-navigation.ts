import {
  Activity, Bell, Bookmark, BriefcaseBusiness, Building2, ChartNoAxesColumnIncreasing, ClipboardList, FileText, LayoutDashboard, Search,
  List, Mail, Plus, Settings, Star, UserRound, Users,
} from "lucide-react";
import type { DashboardRole } from "./dashboard-access";

const overview = { slug: "", label: "Dashboard", Icon: LayoutDashboard };

export const dashboardNavigation = {
  seeker: [
    overview,
    { slug: "browse-jobs", label: "Browse jobs", Icon: Search },
    { slug: "applications", label: "My applications", Icon: ClipboardList },
    { slug: "profile", label: "My profile", Icon: UserRound },
    { slug: "cv", label: "CV / Resume", Icon: FileText },
    { slug: "become-an-employer", label: "Become an Employer", Icon: Building2 },
    { slug: "jobs", label: "Manage jobs", Icon: List },
    { slug: "received-applications", label: "Received applications", Icon: ClipboardList },
    { slug: "settings", label: "Settings", Icon: Settings },
    { slug: "notifications", label: "Notifications", Icon: Bell },
    { slug: "saved-jobs", label: "Saved jobs", Icon: Bookmark },
  ],
  employer: [
    overview,
    { slug: "company", label: "My Company", Icon: Building2 },
    { slug: "profile", label: "My Profile", Icon: UserRound },
    { slug: "post-a-job", label: "Post a Job", Icon: Plus },
    { slug: "jobs", label: "Manage Jobs", Icon: BriefcaseBusiness },
    { slug: "applications", label: "Applications", Icon: ClipboardList },
    { slug: "featured", label: "Hot / Featured Jobs", Icon: Star },
    { slug: "settings", label: "Settings", Icon: Settings },
    { slug: "notifications", label: "Notifications", Icon: Bell },
  ],
  admin: [
    overview,
    { slug: "companies", label: "Companies", Icon: Building2 },
    { slug: "jobs", label: "Jobs", Icon: BriefcaseBusiness },
    { slug: "applications", label: "Applications", Icon: ClipboardList },
    { slug: "categories", label: "Categories", Icon: List },
    { slug: "users", label: "Users", Icon: Users },
    { slug: "email-templates", label: "Email Templates", Icon: Mail },
    { slug: "activity", label: "Activity Logs", Icon: Activity },
    { slug: "settings", label: "Site Settings", Icon: Settings },
    { slug: "reports", label: "Reports", Icon: ChartNoAxesColumnIncreasing },
    { slug: "notifications", label: "Notifications", Icon: Bell },
    { slug: "profile", label: "My Profile", Icon: UserRound },
  ],
};

export function dashboardHref(role: DashboardRole, section = "") {
  return section ? `/dashboard/${role}/${section}` : `/dashboard/${role}`;
}
