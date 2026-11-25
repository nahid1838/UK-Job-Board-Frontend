import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

export const metadata = { title: "Sign in | UK Job Board" };

type LoginPageProps = {
  searchParams: Promise<{ socialError?: string | string[] }>;
};

async function LoginForm({ searchParams }: LoginPageProps) {
  const { socialError } = await searchParams;
  return <AuthForm mode="login" showSocialError={socialError === "1"} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<p role="status">Loading sign-in…</p>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
