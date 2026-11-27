"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type Mode = "forgot" | "verify" | "reset";
const copy = {
  forgot: { title: "Reset your password", button: "Send reset link", successTitle: "Check your inbox", success: "If an account uses that email, you’ll receive a reset link. Check your spam folder if it doesn’t arrive." },
  verify: { title: "Verify your email", button: "Send verification link", successTitle: "Check your inbox", success: "If your email needs verification, you’ll receive a new link. Check your spam folder if it doesn’t arrive." },
  reset: { title: "Choose a new password", button: "Change password", successTitle: "Password updated", success: "You can now sign in with your new password." },
};

export function EmailActionsForm({ mode, token, enabled }: { mode: Mode; token?: string; enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { title, button } = copy[mode];
  const canSubmit = enabled && (mode !== "reset" || Boolean(token));

  function showError(title: string, description: string) {
    setError(description);
    toast.error(title, { id: "auth-email", description });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !canSubmit) return;
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    setError("");
    setSuccess("");
    if (mode === "reset" && password !== values.get("confirmation")) {
      showError("Passwords don’t match", "Enter the same password in both fields.");
      return;
    }

    setPending(true);
    try {
      const result = mode === "reset"
        ? await authClient.resetPassword({ token, newPassword: password })
        : mode === "forgot"
          ? await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
          : await authClient.sendVerificationEmail({ email, callbackURL: "/login" });

      if (result.error) {
        const { status } = result.error;
        if (status === 429) {
          showError("Too many attempts", "Wait a moment before trying again.");
          return;
        }
        if (status >= 500) {
          showError("Account service unavailable", "Try again in a moment.");
          return;
        }
        if (mode === "reset") {
          showError("Couldn’t update your password", "Request a new reset link and try again.");
          return;
        }
      }
      setSuccess(copy[mode].success);
      toast.success(copy[mode].successTitle, { id: "auth-email", description: copy[mode].success });
    } catch {
      showError("Account service unavailable", "Check your connection and try again.");
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
