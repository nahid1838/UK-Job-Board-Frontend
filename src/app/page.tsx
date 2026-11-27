import { HomeBanner } from "@/components/home/home-banner";
import { Navbar } from "@/components/shared/navbar";
import { BrowseCategories } from "@/components/home/browse-categories";
import { HiringCompanies, HotJobs } from "@/components/home/hiring-highlights";
import { CareerCommunity } from "@/components/home/career-community";
import { Footer } from "@/components/shared/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#fbfcfe] text-[#10213b]">
        <HomeBanner />
        <div className="pb-8 sm:px-6 lg:px-8">
          <HotJobs />
          <BrowseCategories />
          <HiringCompanies />
          <CareerCommunity />
        </div>
      </main>
      <Footer />
    </>
  );
}
