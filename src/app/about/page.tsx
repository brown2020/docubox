import type { Metadata } from "next";
import Link from "next/link";
import { SignedOut } from "@/components/auth";

export const metadata: Metadata = {
  title: "About",
  description:
    "Docubox stores documents and uses AI to parse, summarize, and answer questions about them.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        About Docubox
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Docubox is a document workspace. Upload files, organize them in folders,
        and use AI to parse the contents, write a summary, and answer questions
        about a specific document.
      </p>
      <ul className="mt-8 list-disc space-y-3 pl-5 text-foreground">
        <li>Upload documents and keep them in folders.</li>
        <li>Parse a file to extract its text, then generate a summary.</li>
        <li>
          Ask questions about one document and read answers drawn from that
          file.
        </li>
      </ul>
      <p className="mt-8 leading-relaxed text-muted-foreground">
        New accounts start with 1,000 credits. Profile settings can switch
        between those credits and your own API keys.
      </p>
      <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
        <SignedOut>
          <Link href="/signup" className="text-primary underline hover:no-underline">
            Create an account
          </Link>
        </SignedOut>
        <Link href="/" className="text-primary underline hover:no-underline">
          Home
        </Link>
      </p>
    </div>
  );
}
