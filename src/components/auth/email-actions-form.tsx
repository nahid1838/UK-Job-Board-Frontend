"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState, type FormEvent } from "react";

type Mode = "forgot" | "verify" | "reset";
const copy = {
  forgot: { title: "Reset your password", button: "Send reset link", success: "If an account uses that email, a reset link will arrive shortly." },
  verify: { title: "Verify your email", button: "Send verification link", success: "If the email needs verification, a new link will arrive shortly." },
  reset: { title: "Choose a new password", button: "Change password", success: "Password changed. You can now sign in." },
};

export function EmailActionsForm({ mode, token, enabled }: { mode: Mode; token?: string; enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { title, button } = copy[mode];
  const canSubmit = enabled && (mode !== "reset" || Boolean(token));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !canSubmit) return;
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    setError("");
    setSuccess("");
    if (mode === "reset" && password !== values.get("confirmation")) {
      setError("The passwords must match.");
      return;
    }

    setPending(true);
    try {
      const result = mode === "reset"
        ? await authClient.resetPassword({ token, newPassword: password })
        : mode === "forgot"
          ? await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
          : await authClient.sendVerificationEmail({ email, callbackURL: "/login" });

      if (result.error && (mode === "reset" || result.error.status >= 429)) {
        setError(mode === "reset" ? "The password could not be changed. Request a new reset link and try again." : "Couldn’t send an email right now. Try again shortly.");
        return;
      }
      setSuccess(copy[mode].success);
    } catch {
      setError("Couldn’t reach the account service. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  const inputStyle = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-emerald-700";
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      {!enabled && <p className="mt-3 text-sm text-slate-600">Account email delivery is currently unavailable.</p>}
      {enabled && mode === "reset" && !token && <p className="mt-3 text-sm text-slate-600">This reset link is missing or expired. <Link className="underline" href="/forgot-password">Request a new link</Link>.</p>}
      {canSubmit && !(mode === "reset" && success) && (
        <form method="post" onSubmit={submit} className="mt-6 space-y-4">
          {mode === "reset" ? (
            <>
              <label className="block text-sm font-semibold">New password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className={inputStyle} /></label>
              <label className="block text-sm font-semibold">Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className={inputStyle} /></label>
            </>
          ) : (
            <label className="block text-sm font-semibold">Email address<input name="email" type="email" autoComplete="email" required className={inputStyle} /></label>
          )}
          <Button type="submit" disabled={pending} className="min-h-11 w-full bg-[#007653] hover:bg-[#005c41]">{pending ? "Please wait…" : button}</Button>
        </form>
      )}
      {success && <p role="status" className="mt-4 text-sm text-emerald-800">{success}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-emerald-800 hover:underline">Back to sign in</Link>
    </>
  );
}
