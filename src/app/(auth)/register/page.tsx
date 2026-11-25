import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

export const metadata = { title: "Create an account | UK Job Board" };

type RegisterPageProps = {
  searchParams: Promise<{ role?: string | string[]; socialError?: string | string[] }>;
};

async function RegisterForm({ searchParams }: RegisterPageProps) {
  const { role, socialError } = await searchParams;
  return (
    <AuthForm
      mode="register"
      initialRole={role === "employer" ? "employer" : "seeker"}
      showSocialError={socialError === "1"}
    />
  );
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<p role="status">Loading registration…</p>}>
      <RegisterForm searchParams={searchParams} />
    </Suspense>
  );
}
