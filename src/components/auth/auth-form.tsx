import { Button } from "@/components/ui/button";
import Link from "next/link";

const accountTypes = [
  { value: "seeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
] as const;

const inputStyle = "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-[#10213b] placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

type AuthFormProps =
  | { mode: "login" }
  | { mode: "register"; initialRole: "seeker" | "employer" };

export function AuthForm(props: AuthFormProps) {
  const isRegister = props.mode === "register";

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {isRegister ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {isRegister ? "Choose how you’ll use UK Job Board." : "Sign in to your UK Job Board account."}
      </p>

      <form method="post" className="mt-7 space-y-4" aria-describedby="auth-preview-note">
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

        <label className="block text-sm font-semibold">
          Password
          <input className={inputStyle} type="password" name="password" autoComplete={isRegister ? "new-password" : "current-password"} required />
        </label>

        <Button type="submit" disabled className="min-h-11 w-full bg-[#007653] text-white">
          {isRegister ? "Create account" : "Sign in"}
        </Button>
        <p id="auth-preview-note" className="text-center text-sm text-slate-600">
          {isRegister ? "Account creation" : "Sign-in"} will be available once Better Auth is connected.
        </p>
      </form>

      <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
        {isRegister ? "Already have an account?" : "New to UK Job Board?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="rounded-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}
