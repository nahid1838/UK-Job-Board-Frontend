import { EmailActionsForm } from "@/components/auth/email-actions-form";
import { authEmailEnabled } from "@/lib/auth-email";

export const metadata = { title: "Forgot password | UK Job Board" };

export default function ForgotPasswordPage() {
  return <EmailActionsForm mode="forgot" enabled={authEmailEnabled} />;
}
