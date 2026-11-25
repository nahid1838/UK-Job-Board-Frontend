"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { DashboardRole } from "@/lib/dashboard-access";
import {
  BriefcaseBusiness, Building2, ClipboardList, FileText, LayoutDashboard,
  List, LogOut, Menu, Settings, UserRound, Users, X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

const roleLabels = { seeker: "Job seeker", employer: "Employer", admin: "Admin" };

const navigation = {
  seeker: [
    { label: "My applications", href: "#activity", Icon: ClipboardList },
    { label: "My profile", Icon: UserRound },
    { label: "CV / Resume", Icon: FileText },
    { label: "Become an Employer", href: "#employer-access", Icon: Building2 },
    { label: "Settings", Icon: Settings },
  ],
  employer: [
    { label: "Post a job", Icon: BriefcaseBusiness },
    { label: "Manage jobs", href: "#activity", Icon: List },
    { label: "Applications", Icon: ClipboardList },
    { label: "Company profile", href: "#employer-access", Icon: Building2 },
    { label: "Settings", Icon: Settings },
  ],
  admin: [
    { label: "Manage companies", href: "#activity", Icon: Building2 },
    { label: "Applications", href: "#recent-applications", Icon: ClipboardList },
    { label: "Manage jobs", Icon: BriefcaseBusiness },
    { label: "Categories", Icon: List },
    { label: "Users", Icon: Users },
    { label: "Settings", Icon: Settings },
  ],
};

const navLink = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium";
const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

export function DashboardShell({ role, name, children }: {
  role: DashboardRole;
  name: string;
  children: ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  async function signOut() {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await authClient.signOut();
      if (error) throw error;
      window.location.replace("/");
    } catch {
      setSignOutError("Couldn’t sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#f3f6fb] text-[#10213b] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="bg-[#0c2535] text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
        onKeyDown={(event) => {
          if (event.key === "Escape" && isMenuOpen) {
            setIsMenuOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-5 lg:py-6">
          <Link href="/" className={`flex items-center gap-3 rounded-lg font-bold ${focusStyle}`}>
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-300 text-[#0c2535]">
              <BriefcaseBusiness aria-hidden="true" className="size-5" />
            </span>
            UK Job Board
          </Link>
          <Button ref={menuButton} type="button" variant="outline" size="icon" aria-expanded={isMenuOpen}
            aria-controls="dashboard-navigation" aria-label={isMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="size-11 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white lg:hidden">
            {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>

        <div id="dashboard-navigation" className={`${isMenuOpen ? "block motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:duration-200" : "hidden"} px-4 pb-5 lg:block lg:px-5`}>
          <div className="mb-5 flex items-center gap-3 border-y border-white/10 py-4">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-emerald-200">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs text-slate-300">{roleLabels[role]}</p>
            </div>
          </div>
          <nav aria-label="Dashboard navigation" className="space-y-1">
            <a href="#overview" aria-current="page" onClick={() => setIsMenuOpen(false)}
              className={`${navLink} bg-emerald-300 font-semibold text-[#092d28] ${focusStyle}`}>
              <LayoutDashboard aria-hidden="true" className="size-4" /> Dashboard
            </a>
            {navigation[role].map(({ label, href, Icon }) => (
              href ? (
                <a key={label} href={href} onClick={() => setIsMenuOpen(false)}
                  className={`${navLink} text-slate-100 hover:bg-white/10 motion-safe:transition-colors ${focusStyle}`}>
                  <Icon aria-hidden="true" className="size-4 shrink-0" /> {label}
                </a>
              ) : (
                <span key={label} aria-disabled="true" className={`${navLink} text-slate-400`}>
                  <Icon aria-hidden="true" className="size-4 shrink-0" /> {label}
                </span>
              )
            ))}
          </nav>
          <div className="mt-6 border-t border-white/10 pt-3">
            <Button type="button" variant="ghost" onClick={signOut} disabled={isSigningOut}
              className="min-h-11 w-full justify-start gap-3 px-3 text-slate-100 hover:bg-white/10 hover:text-white">
              <LogOut aria-hidden="true" /> {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
            {signOutError && <p role="alert" className="mt-2 text-sm text-red-200">{signOutError}</p>}
          </div>
        </div>
      </aside>

      <main id="overview" className="min-w-0 px-4 py-7 sm:px-8 sm:py-10 xl:px-12">
        <div className="mx-auto max-w-6xl motion-safe:animate-in motion-safe:fade-in-75 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
