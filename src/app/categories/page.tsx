import { CategoryGrid } from "@/components/jobs/category-grid";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { Suspense } from "react";

export const metadata = { title: "Job categories | UK Job Board" };

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 px-4 py-8 text-[#10213b] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Job categories</h1>
          <Suspense fallback={<p role="status" className="text-sm">Loading categories…</p>}>
            <CategoryGrid />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
