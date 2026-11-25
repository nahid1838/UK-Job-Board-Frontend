import { AuthForm } from "@/components/auth/auth-form";
import { applicationReturnPath } from "@/lib/auth-return-path";
import { Suspense } from "react";

export const metadata = { title: "Sign in | UK Job Board" };

type LoginPageProps = {
  searchParams: Promise<{ socialError?: string | string[]; next?: string | string[] }>;
};

async function LoginForm({ searchParams }: LoginPageProps) {
  const { socialError, next } = await searchParams;
  return <AuthForm mode="login" showSocialError={socialError === "1"} returnTo={applicationReturnPath(next)} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<p role="status">Loading sign-in…</p>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
