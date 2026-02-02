"use client";

import { Upload, Cpu, MessageSquareText } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your documents",
    description:
      "Drag and drop any document into Docubox. We support PDFs, Word docs, text files, and more.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI parses and analyzes",
    description:
      "Our AI extracts text, identifies structure, and generates a summary of key points.",
  },
  {
    number: "03",
    icon: MessageSquareText,
    title: "Chat and explore",
    description:
      "Ask questions about your document. Get instant, accurate answers backed by RAG technology.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to unlock insights from your documents.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Step key={step.number} {...step} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  description,
  isLast,
}: {
  number: string;
  icon: typeof Upload;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <div className="relative text-center lg:text-left">
      {/* Connector line (hidden on last item and mobile) */}
      {!isLast && (
        <div className="absolute left-1/2 top-6 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 lg:left-auto lg:right-0 lg:block lg:w-[calc(100%-3rem)] lg:translate-x-1/2" />
      )}

      {/* Step number badge */}
      <div className="relative mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground lg:mx-0">
        {number}
      </div>

      {/* Icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background text-primary lg:mx-0">
        <Icon className="h-7 w-7" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
