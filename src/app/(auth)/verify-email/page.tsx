import { EmailActionsForm } from "@/components/auth/email-actions-form";
import { authEmailEnabled } from "@/lib/auth-email";

export const metadata = { title: "Verify email | UK Job Board" };

export default function VerifyEmailPage() {
  return <EmailActionsForm mode="verify" enabled={authEmailEnabled} />;
}
