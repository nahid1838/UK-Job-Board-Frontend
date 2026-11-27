import { JobCard, formatSalary } from "@/components/jobs/job-card";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { ShareJobButton } from "@/components/jobs/share-job-button";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { BackendRequestError } from "@/lib/backend";
import { getPublicJob, getPublicJobs } from "@/lib/public-jobs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type JobPageProps = { params: Promise<{ id: string }> };

async function JobDetails({ params }: JobPageProps) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  let job;
  try {
    job = await getPublicJob(id);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) notFound();
    return <p role="status">This job is temporarily unavailable. Refresh to try again.</p>;
  }
  const canonical = process.env.BETTER_AUTH_URL ? new URL(`/jobs/${id}`, process.env.BETTER_AUTH_URL).href : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    validThrough: `${job.closingDate}T23:59:59`,
    url: canonical,
    hiringOrganization: { "@type": "Organization", name: job.companyName,
      ...(job.companyLogo && canonical ? { logo: new URL(job.companyLogo, canonical).href } : {}) },
    employmentType: job.jobType.toUpperCase().replace(/-/g, "_"),
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, postalCode: job.postcode, addressCountry: "GB" } },
    ...(job.workMode === "Remote" && { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "United Kingdom" } }),
    ...((job.salaryMin !== null || job.salaryMax !== null) && {
      baseSalary: { "@type": "MonetaryAmount", currency: "GBP", value: {
        "@type": "QuantitativeValue", minValue: job.salaryMin ?? undefined, maxValue: job.salaryMax ?? undefined,
        unitText: job.salaryPeriod.toUpperCase(),
      } },
    }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Link href="/jobs" className="text-sm font-semibold text-emerald-800 hover:underline">All jobs</Link>
      <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          {job.companyId ? (
            <Link href={`/companies/${job.companyId}`} aria-label={`View ${job.companyName} company profile`}><CompanyLogo name={job.companyName} src={job.companyLogo} /></Link>
          ) : <CompanyLogo name={job.companyName} src={job.companyLogo} />}
          <SaveJobButton id={job._id} />
        </div>
        {job.isFeatured && <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-800">Hot</span>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight [overflow-wrap:anywhere] sm:text-4xl">{job.title}</h1>
        <p className="mt-3 font-semibold text-emerald-800">
          {job.companyId ? <Link href={`/companies/${job.companyId}`} className="hover:underline">{job.companyName}</Link> : job.companyName}
        </p>
        <p className="mt-2 text-sm text-slate-700">{job.location} · {job.jobType} · {job.workMode}</p>
        <p className="mt-2 text-sm text-slate-700">{formatSalary(job)} · Closes {job.closingDate.split("-").reverse().join("/")}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href={`/jobs/${job._id}/apply`} className="inline-flex min-h-11 items-center rounded-lg bg-[#007653] px-4 font-semibold text-white hover:bg-[#005c41]">Apply now</Link>
          <ShareJobButton title={job.title} />
        </div>
        <h2 className="mt-8 text-xl font-bold">About the role</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-700 [overflow-wrap:anywhere]">{job.description}</p>
        <p className="mt-4 text-sm text-slate-600">Experience: {job.experience}</p>
        {job.rightToWork && <p className="mt-2 text-sm text-slate-600">Candidates must have the right to work in the UK.</p>}
      </article>
      {job.categoryId && <Suspense fallback={<p className="mt-5 text-sm">Loading similar jobs…</p>}><SimilarJobs id={job._id} categoryId={job.categoryId} /></Suspense>}
    </>
  );
}

async function SimilarJobs({ id, categoryId }: { id: string; categoryId: string }) {
  try {
    const jobs = (await getPublicJobs(new URLSearchParams({ category: categoryId, limit: "4" }))).filter((job) => job._id !== id).slice(0, 3);
    if (!jobs.length) return null;
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Similar jobs</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <li key={job._id}><JobCard job={job} compact /></li>)}</ul>
      </section>
    );
  } catch {
    return null;
  }
}

export default function JobPage({ params }: JobPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 text-[#10213b] sm:px-8">
        <Suspense fallback={<p role="status">Loading job…</p>}><JobDetails params={params} /></Suspense>
      </main>
      <Footer />
    </>
  );
}
