import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dashboardPaths = {
  seeker: "/dashboard/seeker",
  employer: "/dashboard/employer",
  admin: "/dashboard/admin",
} as const;

export type DashboardRole = keyof typeof dashboardPaths;

export async function getDashboardUser(returnTo?: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect(returnTo ? `/login?${new URLSearchParams({ next: returnTo })}` : "/login");

  const { user } = session;
  if (user.active === false) redirect("/login");
  // Older accounts already have an account type from registration.
  const role = user.role === "admin" || user.role === "employer" || user.role === "seeker"
    ? user.role
    : user.accountType === "employer" ? "employer" : "seeker";

  return { user, role };
}
