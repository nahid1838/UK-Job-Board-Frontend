import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in | UK Job Board" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
