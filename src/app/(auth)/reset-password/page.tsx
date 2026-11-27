import { EmailActionsForm } from "@/components/auth/email-actions-form";
import { authEmailEnabled } from "@/lib/auth-email";
import { Suspense } from "react";

export const metadata = { title: "Reset password | UK Job Board" };

type ResetPageProps = { searchParams: Promise<{ token?: string | string[] }> };

async function ResetForm({ searchParams }: ResetPageProps) {
  const { token } = await searchParams;
  return <EmailActionsForm mode="reset" token={typeof token === "string" ? token : undefined} enabled={authEmailEnabled} />;
}

export default function ResetPasswordPage({ searchParams }: ResetPageProps) {
  return <Suspense fallback={<p role="status">Loading password reset…</p>}><ResetForm searchParams={searchParams} /></Suspense>;
}
