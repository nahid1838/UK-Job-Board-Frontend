import { BriefcaseBusiness, ExternalLink, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import parliamentPhoto from "../../../public/images/london-parliament-panorama.png";

const linkGroups = [
  { title: "Quick Links", links: [
    { label: "Home", href: "/" }, { label: "Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" }, { label: "Categories", href: "/categories" },
  ] },
  { title: "Resources", links: [
    { label: "About Us", href: "/about" }, { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" }, { label: "Terms & Conditions", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ] },
];

export function Footer() {
  const alertsUrl = process.env.JOB_ALERTS_SIGNUP_URL;
  const alertsHref = alertsUrl && URL.canParse(alertsUrl) && new URL(alertsUrl).protocol === "https:" ? alertsUrl : null;

  return (
    <footer className="relative isolate overflow-hidden bg-[#0b483e] text-white">
      <Image src={parliamentPhoto} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="-z-20 object-cover object-[left_70%] opacity-22 mix-blend-luminosity md:max-w-[42%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#0b483e]/70 via-[#0b483e] to-[#093e34]" />
      <div aria-hidden="true" className="absolute -right-8 -bottom-14 -z-10 h-24 w-4/5 -rotate-3 rounded-[50%] bg-[#27725b]/70" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 pt-7 pb-12 sm:grid-cols-[1.5fr_1fr_1fr_1.4fr] sm:px-8 lg:grid-cols-[1.5fr_.8fr_.9fr_1.5fr_.9fr]">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <BriefcaseBusiness aria-hidden="true" className="size-9" />
            <span><span className="block text-lg font-bold leading-tight">UK Job Board</span><span className="block text-xs text-emerald-50">Find Your Next Opportunity</span></span>
          </Link>
        </div>
        {linkGroups.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <h2 className="mb-2 text-sm font-bold">{title}</h2>
            <ul className="space-y-1.5">
              {links.map(({ label, href }) => (
                <li key={href}><Link href={href} className="rounded-sm text-sm text-emerald-50 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 sm:col-span-1">
          <h2 className="text-sm font-bold">Stay Connected</h2>
          {alertsHref ? (
            <a href={alertsHref} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-emerald-950">
              Subscribe for job alerts <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          ) : (
            <Link href="/contact" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-emerald-950">
              <Mail aria-hidden="true" className="size-4" /> Contact UK Job Board
            </Link>
          )}
        </div>
        <div className="col-span-2 text-xs text-emerald-50 sm:col-span-1">
          <p className="flex items-center gap-2 text-sm font-bold"><span aria-hidden="true" className="uk-flag text-2xl" /> UK</p>
          <p className="mt-2">© UK Job Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
