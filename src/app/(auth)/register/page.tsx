import { ContentSkeleton } from "@/components/shared/content-skeleton";
import { AuthForm } from "@/components/auth/auth-form";
import { applicationReturnPath } from "@/lib/auth-return-path";
import { Suspense } from "react";

export const metadata = { title: "Create an account | UK Job Board" };

type RegisterPageProps = {
  searchParams: Promise<{ role?: string | string[]; socialError?: string | string[]; next?: string | string[] }>;
};

async function RegisterForm({ searchParams }: RegisterPageProps) {
  const { role, socialError, next } = await searchParams;
  return (
    <AuthForm
      mode="register"
      initialRole={role === "employer" ? "employer" : "seeker"}
      showSocialError={socialError === "1"}
      returnTo={applicationReturnPath(next)}
    />
  );
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<ContentSkeleton label="Loading registration…" />}>
      <RegisterForm searchParams={searchParams} />
    </Suspense>
  );
}
