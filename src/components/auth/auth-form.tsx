"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, UserRound, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SocialProviderIcon } from "./social-provider-icon";

const accountTypes = [
  { value: "seeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
] as const;

const socialProviders = [
  { value: "google", label: "Google" },
  { value: "github", label: "GitHub" },
] as const;

type SocialProvider = (typeof socialProviders)[number]["value"];

function getRegistrationError(code: string | undefined, status: number) {
  switch (code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "This email is already registered. Sign in or use a different email.";
    case "INVALID_EMAIL":
      return "Check your email address and try again.";
    case "PASSWORD_TOO_SHORT":
      return "Use at least 8 characters for your password.";
    case "PASSWORD_TOO_LONG":
      return "Use a password with 128 characters or fewer.";
    default:
      if (status === 429) return "You’ve made too many attempts. Wait a moment before trying again.";
      return "Please try again in a moment. If the problem continues, contact support.";
  }
}

function getSignInError(code: string | undefined, status: number) {
  if (status === 429) return "Too many attempts. Wait a moment before trying again.";
  if (code === "EMAIL_NOT_VERIFIED") return "Open the verification link in your email or request a new one below.";
  if (code === "INVALID_EMAIL_OR_PASSWORD" || status === 401) {
    return "Check your email and password, or use Forgot password to reset it.";
  }
  return "Try again in a moment. If the problem continues, contact support.";
}

const inputStyle = "h-11 w-full rounded-xl border border-slate-300 bg-transparent pl-11 pr-4 text-base text-[#10213b] placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

type AuthFormProps = (
  | { mode: "login"; showSocialError: boolean }
  | { mode: "register"; initialRole: "seeker" | "employer"; showSocialError: boolean }
) & { returnTo?: string };

export function AuthForm(props: AuthFormProps) {
  const isRegister = props.mode === "register";
  const authDestination = props.returnTo ?? "/dashboard";
  const returnQuery = props.returnTo ? `?${new URLSearchParams({ next: props.returnTo })}` : "";
  const router = useRouter();
  const passwordId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    props.showSocialError
      ? "We couldn’t complete social sign-in. Please try again."
      : "",
  );
  const isBusy = isSubmitting || pendingProvider !== null;

  useEffect(() => {
    if (props.showSocialError) {
      toast.error("Social sign-in could not be completed", {
        id: "auth",
        description: "Try your provider again or sign in with your email.",
      });
    }
  }, [props.showSocialError]);

  function showAuthError(title: string, description: string) {
    setErrorMessage(description);
    toast.error(title, { id: "auth", description });
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    if (isBusy) return;

    setPendingProvider(provider);
    setErrorMessage("");

    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: authDestination,
        errorCallbackURL: `${isRegister ? "/register" : "/login"}?${new URLSearchParams({
          socialError: "1",
          ...(props.returnTo && { next: props.returnTo }),
        })}`,
        disableRedirect: true,
      });

      if (error || !data?.url) {
        const providerName = provider === "google" ? "Google" : "GitHub";
        showAuthError(`Couldn’t connect to ${providerName}`, "Try again or sign in with your email.");
        setPendingProvider(null);
        return;
      }

      window.location.assign(data.url);
    } catch {
      showAuthError("Sign-in service unavailable", "Check your connection and try again.");
      setPendingProvider(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") ?? "").trim();
    const password = String(fields.get("password") ?? "");
    const name = String(fields.get("name") ?? "").trim();

    if (isRegister && !name) {
      showAuthError("Full name is required", "Enter your name to create your account.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name,
            email,
            password,
            accountType: fields.get("role") === "employer" ? "employer" : "seeker",
            callbackURL: `/login${returnQuery}`,
          })
        : await authClient.signIn.email({ email, password, rememberMe: fields.has("rememberMe") });

      if (result.error) {
        if (isRegister) {
          showAuthError("Couldn’t create your account", getRegistrationError(result.error.code, result.error.status));
        } else {
          showAuthError("Couldn’t sign in", getSignInError(result.error.code, result.error.status));
        }
        return;
      }

      if (isRegister) {
        const isSignedIn = Boolean(result.data?.token);
        toast.success("Account created", {
          id: "auth",
          description: isSignedIn ? "You’re signed in. Welcome to UK Job Board!" : "Check your email for a verification link before signing in.",
        });
        router.replace(isSignedIn ? authDestination : `/login${returnQuery}`);
        return;
      }

      toast.success("Signed in successfully", { id: "auth", description: "Welcome back to UK Job Board." });
      router.replace(authDestination);
    } catch {
      showAuthError("Account service unavailable", "Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <nav aria-label="Account" className="grid grid-cols-2 border-b border-slate-200">
        {[
          { href: "/login", label: "Sign In", icon: UserRound, active: !isRegister },
          { href: "/register", label: "Register", icon: UserRoundPlus, active: isRegister },
        ].map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href + returnQuery} aria-current={active ? "page" : undefined} className={`flex items-center justify-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-semibold ${active ? "border-[#07814e] text-[#087747]" : "rounded-t-xl border-transparent bg-slate-100/60 text-slate-600 hover:text-emerald-800"}`}>
            <Icon aria-hidden="true" className="size-4" strokeWidth={2.6} />
            {label}
          </Link>
        ))}
      </nav>
      <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">
        {isRegister ? "Create an account" : "Welcome Back!"}
      </h1>
      <p className="mt-1.5 text-center text-sm text-slate-600">
        {isRegister ? "Choose how you’ll use UK Job Board." : "Sign in to your account to continue"}
      </p>

      <form method="post" onSubmit={handleSubmit} className="mt-4 space-y-3" aria-busy={isSubmitting}>
        {props.mode === "register" && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Account type</legend>
              <div className="grid grid-cols-2 gap-2">
                {accountTypes.map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input type="radio" name="role" value={value} defaultChecked={props.initialRole === value} className="peer sr-only" />
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-2 text-center text-sm font-semibold text-slate-700 peer-checked:border-emerald-700 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="relative block">
              <span className="sr-only">Full name</span>
              <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />
              <input className={inputStyle} name="name" autoComplete="name" placeholder="Your full name" required />
            </label>
          </>
        )}

        <label className="relative block">
          <span className="sr-only">Email address</span>
          <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />
          <input className={inputStyle} type="email" name="email" autoComplete="email" placeholder="Email Address" required />
        </label>

        <div>
          <label htmlFor={passwordId} className="sr-only">Password</label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />
            <input
              id={passwordId}
              className={`${inputStyle} pr-12 [&::-ms-reveal]:hidden`}
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-controls={passwordId}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="absolute right-2 top-1/2 size-10 -translate-y-1/2 text-slate-600 hover:text-emerald-800"
            >
              {isPasswordVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {!isRegister && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-3 text-slate-700">
              <input type="checkbox" name="rememberMe" defaultChecked className="size-4 accent-[#087e4d]" />
              Remember me
            </label>

            <Link href="/forgot-password" className="text-emerald-800 underline underline-offset-4">Forgot password?</Link>
          </div>
        )}
        <Button type="submit" disabled={isBusy} className="min-h-11 w-full rounded-lg bg-[#07824e] text-sm font-semibold text-white hover:bg-[#05663d]">
          <LogIn aria-hidden="true" className="size-4!" />
          {isSubmitting
            ? (isRegister ? "Creating account…" : "Signing in…")
            : (isRegister ? "Create account" : "Sign In")}
        </Button>
      </form>

      <div className="mt-4">
        <p className="mb-3 flex items-center gap-3 text-sm text-slate-600 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
          OR
        </p>
        <div className="grid gap-2 min-[420px]:grid-cols-2">
          {socialProviders.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              aria-describedby={isRegister ? "social-account-note" : undefined}
              disabled={isBusy}
              onClick={() => handleSocialSignIn(value)}
              className="min-h-11 w-full gap-2 rounded-lg border-slate-300 bg-transparent px-2 text-sm text-[#101618] [&_svg]:size-4 hover:border-emerald-300 hover:bg-emerald-50/60 focus-visible:ring-emerald-600/40"
            >
              <SocialProviderIcon provider={value} />
              {pendingProvider === value ? "Connecting…" : label}
            </Button>
          ))}
        </div>
        {isRegister && (
          <p id="social-account-note" className="mt-3 text-center text-sm text-slate-600">
            New accounts created with Google or GitHub start as Job Seekers.
          </p>
        )}
      </div>

      {errorMessage && <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p>}

      <p className="mt-4 text-center text-sm text-slate-600">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link href={`${isRegister ? "/login" : "/register"}${returnQuery}`} className="rounded-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          {isRegister ? "Sign in" : "Register here"}
        </Link>
      </p>
      {!isRegister && (
        <Link href="/verify-email" className="mx-auto mt-2 block w-fit text-center text-sm text-emerald-800 underline-offset-4 hover:underline">
          Resend verification email
        </Link>
      )}
    </>
  );
}
