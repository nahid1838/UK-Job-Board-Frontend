import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Jobs", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    title: "For job seekers",
    links: [
      { label: "Create an account", href: "/register?role=seeker" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "For employers",
    links: [
      { label: "Register as an employer", href: "/register?role=employer" },
      { label: "Employer sign in", href: "/login" },
    ],
  },
  {
    title: "UK Job Board",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

const focusStyle = "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300";
const linkStyle = `${focusStyle} inline-flex min-h-9 items-center text-sm text-slate-300 hover:text-emerald-300 motion-safe:transition-colors`;

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return links.map(({ label, href }) => (
    <li key={href}>
      <Link href={href} className={linkStyle}>{label}</Link>
    </li>
  ));
}

export function Footer() {
  return (
    <footer className="mt-10 border-t border-emerald-400/25 bg-[#0c1d2d] text-white sm:mt-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 py-10 lg:grid-cols-[minmax(12rem,1fr)_3fr] lg:py-12">
          <div>
            <Link href="/" className={`${focusStyle} inline-flex items-center gap-3 text-lg font-bold`}>
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <BriefcaseBusiness aria-hidden="true" className="size-5" />
              </span>
              UK Job Board
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
              Connecting job seekers and employers across the United Kingdom.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {footerGroups.map(({ title, links }) => (
              <div key={title}>
                <h2 className="mb-2 text-sm font-semibold">{title}</h2>
                <ul><FooterLinks links={links} /></ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">© UK Job Board. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-4"><FooterLinks links={legalLinks} /></ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
