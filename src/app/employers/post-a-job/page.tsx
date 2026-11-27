import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function PostJobRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/register?role=employer");
  if (session.user.active === false) return redirect("/login");
  if (session.user.role === "admin") return redirect("/dashboard/admin/jobs");
  const isEmployer = session.user.role === "employer" || (!session.user.role && session.user.accountType === "employer");
  return redirect(isEmployer ? "/dashboard/employer/post-a-job" : "/dashboard/seeker/jobs");
}

export default function PostJobEntry() {
  return <Suspense fallback={<p role="status">Opening job posting…</p>}><PostJobRedirect /></Suspense>;
}
