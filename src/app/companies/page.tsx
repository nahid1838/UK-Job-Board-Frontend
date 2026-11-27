import { ContentSkeleton } from "@/components/shared/content-skeleton";
import { CompanyCards } from "@/components/home/hiring-highlights";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { Suspense } from "react";

export const metadata = { title: "Companies | UK Job Board" };

export default function CompaniesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 text-[#10213b] sm:px-8">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Companies</h1>
        <Suspense fallback={<ContentSkeleton label="Loading companies…" />}><CompanyCards /></Suspense>
      </main>
      <Footer />
    </>
  );
}
