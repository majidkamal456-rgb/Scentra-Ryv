import { CodBanner } from "@/components/home/CodBanner";
import { CollectionGrid } from "@/components/home/CollectionGrid";
import { Hero } from "@/components/home/Hero";
import { SectionNavigator } from "@/components/home/SectionNavigator";
import { StickyScrollShowcase } from "@/components/home/StickyScrollShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import { WhySection } from "@/components/home/WhySection";

export default function HomePage() {
  return (
    <>
      <SectionNavigator />
      <div id="hero">
        <Hero />
      </div>
      <div id="fragrances">
        <StickyScrollShowcase />
      </div>
      <div id="collection">
        <CollectionGrid />
      </div>
      <div id="why">
        <WhySection />
      </div>
      <div id="reviews">
        <Testimonials />
      </div>
      <div id="delivery">
        <CodBanner />
      </div>
    </>
  );
}
