import { AppsGrid } from "@/components/site/apps-grid";
import { GlassBackground } from "@/components/site/background";
import { Cta, Footer } from "@/components/site/cta-footer";
import { Features } from "@/components/site/features";
import { Hero } from "@/components/site/hero";
import { Industries } from "@/components/site/industries";
import { Nav } from "@/components/site/nav";
import { Pricing } from "@/components/site/pricing";
import { ScrollWords } from "@/components/site/scroll-words";
import { Stats } from "@/components/site/stats";
import { Testimonials } from "@/components/site/testimonials";
import { ScrollProgressDial } from "@/components/ui/skiper-ui/skiper89";

export default function Home() {
  return (
    <>
      <GlassBackground />
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        <AppsGrid />
        <ScrollWords />
        <Stats />
        <Features />
        <Industries />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <Footer />
      <ScrollProgressDial />
    </>
  );
}
