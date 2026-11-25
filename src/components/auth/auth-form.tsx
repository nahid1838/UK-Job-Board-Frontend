"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

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

const inputStyle = "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-[#10213b] placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

type AuthFormProps =
  | { mode: "login"; showSocialError: boolean }
  | { mode: "register"; initialRole: "seeker" | "employer" };

export function AuthForm(props: AuthFormProps) {
  const isRegister = props.mode === "register";
  const router = useRouter();
  const passwordId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    props.mode === "login" && props.showSocialError
      ? "We couldn’t complete social sign-in. Please try again."
      : "",
  );
  const isBusy = isSubmitting || pendingProvider !== null;

  async function handleSocialSignIn(provider: SocialProvider) {
    if (isBusy) return;

    setPendingProvider(provider);
    setErrorMessage("");

    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/login?socialError=1",
        disableRedirect: true,
      });

      if (error || !data?.url) {
        setErrorMessage("We couldn’t start social sign-in. Please try again.");
        setPendingProvider(null);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setErrorMessage("We couldn’t reach the sign-in service. Please try again.");
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
      toast.error("Enter your full name", { id: "registration" });
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
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        if (isRegister) {
          toast.error("We couldn’t create your account", {
            id: "registration",
            description: getRegistrationError(result.error.code, result.error.status),
          });
        } else {
          setErrorMessage(result.error.message || "Please check your details and try again.");
        }
        return;
      }

      if (isRegister) {
        const isSignedIn = Boolean(result.data?.token);
        toast.success("Account created", {
          id: "registration",
          description: isSignedIn ? "You’re signed in. Welcome to UK Job Board!" : "You can now sign in to UK Job Board.",
        });
        router.replace(isSignedIn ? "/" : "/login");
        return;
      }

      window.location.replace("/");
    } catch {
      const message = "We couldn’t reach the account service. Check your connection and try again.";
      if (isRegister) {
        toast.error("Registration could not be completed", { id: "registration", description: message });
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {isRegister ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {isRegister ? "Choose how you’ll use UK Job Board." : "Sign in to your UK Job Board account."}
      </p>

      <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-4" aria-busy={isSubmitting}>
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
            <label className="block text-sm font-semibold">
              Full name
              <input className={inputStyle} name="name" autoComplete="name" placeholder="Your full name" required />
            </label>
          </>
        )}

        <label className="block text-sm font-semibold">
          Email address
          <input className={inputStyle} type="email" name="email" autoComplete="email" placeholder="you@example.co.uk" required />
        </label>

        <div>
          <label htmlFor={passwordId} className="block text-sm font-semibold">Password</label>
          <div className="relative">
            <input
              id={passwordId}
              className={`${inputStyle} pr-12 [&::-ms-reveal]:hidden`}
              type={isPasswordVisible ? "text" : "password"}
              name="password"
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
              className="absolute right-px bottom-px size-10 text-slate-600 hover:text-emerald-800"
            >
              {isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={isBusy} className="min-h-11 w-full bg-[#007653] text-white hover:bg-[#005c41]">
          {isSubmitting
            ? (isRegister ? "Creating account…" : "Signing in…")
            : (isRegister ? "Create account" : "Sign in")}
        </Button>
      </form>

      {!isRegister && (
        <div className="mt-5">
          <p className="mb-3 text-center text-sm text-slate-600">Or continue with</p>
          <div className="grid grid-cols-2 gap-3">
            {socialProviders.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => handleSocialSignIn(value)}
                className="min-h-11"
              >
                {pendingProvider === value ? "Connecting…" : label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {errorMessage && <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p>}

      <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
        {isRegister ? "Already have an account?" : "New to UK Job Board?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="rounded-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}
