"use client";

import { ArrowRight, FileText, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-powered document intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Transform documents into
            <span className="mt-2 block text-primary">actionable insights</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Upload, parse, and chat with your documents. Docubox uses AI to
            extract key information, generate summaries, and answer your
            questions instantly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/login">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          {/* Social proof hint */}
          <p className="mt-8 text-sm text-muted-foreground">
            No credit card required. Start with 1,000 free credits.
          </p>
        </div>

        {/* Feature highlights - visual representation */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureHighlight
            icon={<FileText className="h-5 w-5" />}
            title="Smart parsing"
            description="Extract text, tables, and metadata"
          />
          <FeatureHighlight
            icon={<Sparkles className="h-5 w-5" />}
            title="AI summaries"
            description="Get key points in seconds"
          />
          <FeatureHighlight
            icon={<MessageSquare className="h-5 w-5" />}
            title="Chat with docs"
            description="Ask questions, get answers"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border/50 bg-background/50 p-6 backdrop-blur transition-all hover:border-border hover:bg-background">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
