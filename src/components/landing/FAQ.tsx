"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What file types does Docubox support?",
    answer:
      "Docubox supports PDF, DOCX, TXT, MD, and many other common document formats. Our AI parsing technology can extract text and structure from most document types.",
  },
  {
    question: "How do credits work?",
    answer:
      "Credits are consumed when you use AI features. Document parsing costs 4 credits, generating a summary costs 4 credits, and asking questions via Q&A costs 8 credits. New accounts start with 1,000 free credits.",
  },
  {
    question: "Can I use my own API keys?",
    answer:
      "Yes! You can configure your own OpenAI, Unstructured, and Ragie API keys in your profile settings. When using your own keys, no credits are deducted for those services.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Your documents are stored securely using Firebase Storage with encryption at rest. We never share your data with third parties. You can delete your documents at any time.",
  },
  {
    question: "What is RAG-powered Q&A?",
    answer:
      "RAG (Retrieval-Augmented Generation) allows you to ask questions about your documents. The system retrieves relevant sections from your document and uses AI to generate accurate, contextual answers.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Since we offer a generous free tier, we don't offer refunds for purchased credits. However, if you experience technical issues, please contact support and we'll work with you to resolve them.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border/50 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Docubox.
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="mt-16 divide-y divide-border/50">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-6">
      <button
        type="button"
        className="flex w-full items-start justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`ml-4 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  );
}
