import { JobCard } from "@/components/jobs/job-card";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { BackendRequestError } from "@/lib/backend";
import { getPublicCompany } from "@/lib/public-companies";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type CompanyPageProps = { params: Promise<{ id: string }> };

async function CompanyProfile({ params }: CompanyPageProps) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  let profile;
  try {
    profile = await getPublicCompany(id);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) notFound();
    return <p role="status">This company is temporarily unavailable. Refresh to try again.</p>;
  }
  const { company, jobs } = profile;
  return (
    <>
      <Link href="/companies" className="text-sm font-semibold text-emerald-800 hover:underline">All companies</Link>
      <section className="mt-4 rounded-2xl bg-[#063b37] p-6 text-white sm:p-9">
        {company.logoUrl && <div className="mb-4 w-fit rounded-lg bg-white p-3"><CompanyLogo name={company.name} src={company.logoUrl} /></div>}
        <h1 className="text-3xl font-extrabold [overflow-wrap:anywhere] sm:text-4xl">{company.name}</h1>
        <p className="mt-2 text-emerald-50">{company.town} · {company.industry} · {company.size} employees</p>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold">About the company</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-700 [overflow-wrap:anywhere]">{company.description}</p>
        {/^https?:\/\//i.test(company.website) && <a href={company.website} className="mt-4 inline-block font-semibold text-emerald-800 underline">Visit company website</a>}
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Open jobs</h2>
        {jobs.length ? <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <li key={job._id}><JobCard job={job} compact /></li>)}</ul>
          : <p className="text-sm text-slate-600">This company has no open jobs.</p>}
      </section>
    </>
  );
}

export default function CompanyPage({ params }: CompanyPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 text-[#10213b] sm:px-8">
        <Suspense fallback={<p role="status">Loading company…</p>}><CompanyProfile params={params} /></Suspense>
      </main>
      <Footer />
    </>
  );
}
