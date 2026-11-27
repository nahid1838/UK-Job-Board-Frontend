import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { backendRequest } from "@/lib/backend";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const content = {
  about: { title: "About UK Job Board", copy: "Browse jobs across the United Kingdom, explore approved employers, and track applications from your dashboard." },
  contact: { title: "Contact UK Job Board", copy: "Get in touch for account help, listing enquiries, or privacy requests." },
  privacy: { title: "Privacy Policy", copy: "We use your account details to provide sign-in and your dashboard. When you apply, an administrator reviews the application and can share your details and CV with the employer for that job. Contact us to ask about the personal information held about you." },
  terms: { title: "Terms and Conditions", copy: "Use accurate information when creating an account, submitting an application, or posting a job. Only approved companies can publish jobs. Apply to roles you are interested in and only upload files you are entitled to share." },
  cookies: { title: "Cookie Policy", copy: "UK Job Board uses session cookies for sign-in and security. The bookmark feature stores saved job IDs in your browser. You can remove them by clearing site data in your browser settings." },
};

type Props = { params: Promise<{ page: string }> };

async function Information({ params }: Props) {
  const { page } = await params;
  if (!Object.hasOwn(content, page)) notFound();
  const { title, copy } = content[page as keyof typeof content];
  let contactEmail = process.env.SITE_CONTACT_EMAIL ?? "";
  if (page === "contact") {
    try {
      const settings = await backendRequest<{ contactEmail: string }>("/api/site-settings", { signal: AbortSignal.timeout(4000) });
      contactEmail = settings.contactEmail || contactEmail;
    } catch {}
  }
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-4 leading-relaxed text-slate-700">{copy}</p>
      {page === "contact" ? (
        /^[\w.+%-]+@[\w.-]+\.[a-z]{2,}$/i.test(contactEmail)
          ? <a className="mt-4 inline-block font-semibold text-emerald-800 underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          : <p className="mt-4 text-sm text-slate-600">The support email is currently unavailable.</p>
      ) : <Link className="mt-4 inline-block font-semibold text-emerald-800 underline" href={page === "about" ? "/jobs" : "/contact"}>{page === "about" ? "Browse jobs" : "Contact us"}</Link>}
    </article>
  );
}

export default function InformationPage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 text-[#10213b] sm:px-8">
        <Suspense fallback={<p role="status">Loading page…</p>}><Information params={params} /></Suspense>
      </main>
      <Footer />
    </>
  );
}
