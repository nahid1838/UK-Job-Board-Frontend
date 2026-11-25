import { JobApplicationForm } from "@/components/jobs/job-application-form";
import { Navbar } from "@/components/shared/navbar";
import { BackendRequestError, backendRequest } from "@/lib/backend";
import { getDashboardUser } from "@/lib/dashboard-access";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata = { title: "Apply for a job | UK Job Board" };

type ApplyPageProps = { params: Promise<{ id: string }> };
type Job = { _id: string; title: string; companyName: string; location: string };

async function ApplyContent({ params }: ApplyPageProps) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  const { user, role } = await getDashboardUser(`/jobs/${id}/apply`);

  let job: Job | undefined;
  let message = "";
  if (role === "seeker") {
    try {
      ({ job } = await backendRequest<{ job: Job }>(`/api/jobs/${id}`, { signal: AbortSignal.timeout(5000) }));
    } catch (error) {
      message = error instanceof BackendRequestError && error.status === 404
        ? "This job is no longer accepting applications."
        : "The job could not be loaded. Try refreshing the page.";
    }
  } else {
    message = "Sign in with a Job Seeker account to apply.";
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <Link href="/jobs" className="text-sm font-semibold text-emerald-800 hover:underline">Back to jobs</Link>
      <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight">{job ? `Apply for ${job.title}` : "Apply for a job"}</h1>
      {job ? (
        <>
          <p className="mt-2 text-slate-600">{job.companyName} · {job.location}</p>
          <JobApplicationForm jobId={job._id} name={user.name} email={user.email} />
        </>
      ) : <p className="mt-3 text-slate-700">{message}</p>}
    </section>
  );
}

export default function ApplyPage({ params }: ApplyPageProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 px-4 py-8 text-[#10213b] sm:px-8">
        <Suspense fallback={<p role="status" className="mx-auto max-w-3xl">Loading application…</p>}>
          <ApplyContent params={params} />
        </Suspense>
      </main>
    </>
  );
}
