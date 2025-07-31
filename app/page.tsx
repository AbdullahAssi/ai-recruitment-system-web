import { HeroSection, HomepageFooter } from "@/components/common";
import HiringAutomationSection from "./card";
import HiringStepsSection from "./anothercard";
import FAQSection from "./faqs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <HiringAutomationSection />
      <HiringStepsSection />
      <FAQSection />
      <HomepageFooter />
    </div>
  );
}
