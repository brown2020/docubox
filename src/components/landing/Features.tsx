"use client";

import {
  Upload,
  FileSearch,
  BrainCircuit,
  MessageCircle,
  FolderTree,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy uploads",
    description:
      "Drag and drop files or browse to upload. Support for PDF, DOCX, TXT, and more.",
  },
  {
    icon: FileSearch,
    title: "Intelligent parsing",
    description:
      "Extract text, tables, headers, and metadata with the Unstructured API.",
  },
  {
    icon: BrainCircuit,
    title: "AI summaries",
    description:
      "Generate concise summaries powered by GPT-4. Understand documents at a glance.",
  },
  {
    icon: MessageCircle,
    title: "RAG-powered Q&A",
    description:
      "Ask questions about your documents and get accurate, context-aware answers.",
  },
  {
    icon: FolderTree,
    title: "Organized workspace",
    description:
      "Create folders, rename files, and keep your documents neatly organized.",
  },
  {
    icon: Shield,
    title: "Secure storage",
    description:
      "Your documents are stored securely with Firebase. Your data stays private.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to work with documents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit for document management, powered by modern AI.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Upload;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
