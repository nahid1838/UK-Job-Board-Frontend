import { HomeBanner } from "@/components/home/home-banner";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 sm:px-4 sm:pt-3 lg:px-8">
        <HomeBanner />
      </main>
      <Footer />
    </>
  );
}
