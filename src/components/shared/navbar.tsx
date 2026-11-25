
"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const navigationLinks = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await authClient.signOut();
      if (error) {
        setSignOutError("Couldn’t sign out. Please try again.");
        return;
      }

      closeMenu();
    } catch {
      setSignOutError("Couldn’t sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  const signOutButton = (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="min-h-11 px-4"
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </Button>
  );

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 font-sans text-[#10213b] shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        onKeyDown={(event) => {
          if (event.key === "Escape" && isMenuOpen) {
            closeMenu();
            menuButton.current?.focus();
          }
        }}
      >
        {/* Main Navbar */}
        <div className="flex min-h-[76px] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">

          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className={`group flex w-fit shrink-0 items-center gap-2.5 rounded-xl ${focusStyle}`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#007653] text-white shadow-md shadow-emerald-900/15 transition-transform duration-300 group-hover:scale-105">
              <BriefcaseBusiness
                aria-hidden="true"
                className="size-6"
                strokeWidth={2.2}
              />
            </span>

            <span className="flex flex-col">
              <span className="text-[19px] font-extrabold tracking-tight text-[#10213b] sm:text-xl">
                UK Job<span className="text-[#007653]">Board</span>
              </span>
              <span className="hidden text-[10px] font-medium tracking-[0.13em] text-slate-500 sm:block">
                YOUR NEXT OPPORTUNITY
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navigationLinks.map(({ label, href }) => {
              const active = isActive(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex min-h-11 items-center rounded-lg px-3 text-[13px] font-semibold transition-colors duration-200 xl:px-3.5 ${
                      active
                        ? "bg-emerald-50 text-[#007653]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#007653]"
                    } ${focusStyle}`}
                  >
                    {label}

                    {active && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#007653]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden items-center justify-self-end gap-2 xl:flex">
            <Link
              href="/jobs"
              aria-label="Search jobs"
              className={`flex size-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#007653] ${focusStyle}`}
            >
              <Search aria-hidden="true" className="size-[19px]" />
            </Link>

            {session ? signOutButton : (
              <>
                <Link
                  href="/login"
                  className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#007653] ${focusStyle}`}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#007653] px-5 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#005c41] hover:shadow-lg hover:shadow-emerald-900/15 ${focusStyle}`}
                >
                  Get Started
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Tablet Actions */}
          <div className="ml-auto hidden items-center gap-2 lg:flex xl:hidden">
            {session ? signOutButton : (
              <>
                <Link
                  href="/login"
                  className={`inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${focusStyle}`}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={`inline-flex min-h-10 items-center justify-center rounded-lg bg-[#007653] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#005c41] ${focusStyle}`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButton}
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#007653] lg:hidden ${focusStyle}`}
            onClick={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-navigation"
          hidden={!isMenuOpen}
          className="border-t border-slate-100 lg:hidden"
        >
          {isMenuOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1 py-4">
                {navigationLinks.map(({ label, href }) => {
                  const active = isActive(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-emerald-50 text-[#007653]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#007653]"
                      } ${focusStyle}`}
                    >
                      {label}

                      {active && (
                        <span className="size-1.5 rounded-full bg-[#007653]" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Search */}
              <Link
                href="/jobs"
                onClick={closeMenu}
                className={`flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#007653] ${focusStyle}`}
              >
                <Search aria-hidden="true" className="size-4" />
                Search Jobs
              </Link>

              {/* Mobile Auth Actions */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 py-4">
                {session ? signOutButton : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className={`flex min-h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusStyle}`}
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMenu}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#007653] text-sm font-semibold text-white transition-colors hover:bg-[#005c41] ${focusStyle}`}
                    >
                      Get Started
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {signOutError && <p role="alert" className="pb-3 text-sm text-red-700">{signOutError}</p>}
      </nav>
    </header>
  );
}
