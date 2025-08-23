import React from "react";

import CTABandSection from "@/components/landing/CTABandSection";
import DemoSection from "@/components/landing/DemoSection";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TimelineSection from "@/components/landing/TimelineSection";
import ValuePropsSection from "@/components/landing/ValuePropsSection";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] to-[#0E1622] text-white">
        {/* Main Content */}
        <HeroSection />
        <ValuePropsSection />
        <TimelineSection />
        <DemoSection />
        <FeaturesSection />
        <CTABandSection />
        <FAQSection />
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
