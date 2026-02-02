"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Docubox",
    features: [
      "1,000 credits included",
      "Unlimited file uploads",
      "AI document parsing",
      "AI summaries",
      "RAG-powered Q&A",
      "Folder organization",
    ],
    cta: "Get started",
    href: "/login",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users and teams",
    features: [
      "10,000 credits/month",
      "Everything in Free",
      "Priority processing",
      "Bring your own API keys",
      "Advanced export options",
      "Email support",
    ],
    cta: "Coming soon",
    href: "#",
    featured: true,
    comingSoon: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free with generous credits. Upgrade when you need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>

        {/* Credits explanation */}
        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-border/50 bg-muted/30 p-6 text-center">
          <h3 className="font-medium text-foreground">How credits work</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Credits are used for AI operations: parsing (4 credits), summaries (4
            credits), and Q&A (8 credits). You can also bring your own API keys to
            use unlimited features without spending credits.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  featured,
  comingSoon,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        featured
          ? "border-primary bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            {price}
          </span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={featured ? "default" : "outline"}
        disabled={comingSoon}
        asChild={!comingSoon}
      >
        {comingSoon ? <span>{cta}</span> : <Link href={href}>{cta}</Link>}
      </Button>
    </div>
  );
}
