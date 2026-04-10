import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import UploadSection from "@/components/UploadSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStarted={scrollToUpload} />
      <FeaturesSection />
      <div ref={uploadRef}>
        <UploadSection />
      </div>
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
