import type { Metadata } from "next";
import { Hero, Features, HowItWorks, Pricing, FAQ, CTA } from "@/components/landing";

export const metadata: Metadata = {
  title: "Home",
  description: "Store your documents in the cloud. Parse and summarize with AI.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
