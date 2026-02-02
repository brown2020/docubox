import { Hero, Features, HowItWorks, Pricing, FAQ, CTA } from "@/components/landing";

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
