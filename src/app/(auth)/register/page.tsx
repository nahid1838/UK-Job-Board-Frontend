import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

export const metadata = { title: "Create an account | UK Job Board" };

type RegisterPageProps = {
  searchParams: Promise<{ role?: string | string[] }>;
};

async function RegisterForm({ searchParams }: RegisterPageProps) {
  const { role } = await searchParams;
  return <AuthForm mode="register" initialRole={role === "employer" ? "employer" : "seeker"} />;
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<p role="status">Loading registration…</p>}>
      <RegisterForm searchParams={searchParams} />
    </Suspense>
  );
}
