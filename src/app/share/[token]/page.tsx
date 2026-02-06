import { notFound } from "next/navigation";
import { getSharedFile } from "@/actions/shareActions";
import { Download, FileText, Calendar, HardDrive } from "lucide-react";
import prettyBytes from "pretty-bytes";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Public share page — displays a shared file's info and download link.
 * No authentication required. Server Component for fast loading.
 */
export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const file = await getSharedFile(token);

  if (!file) {
    notFound();
  }

  const uploadDate = new Date(file.uploadedAt);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Branding */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
          >
            Docubox
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Shared file
          </p>
        </div>

        {/* File card */}
        <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
          {/* File header */}
          <div className="p-8 text-center border-b">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground wrap-break-word">
              {file.filename}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
              {file.size > 0 && (
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  {prettyBytes(file.size)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {uploadDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Summary (if available) */}
          {file.summary && (
            <div className="px-8 py-6 border-b bg-muted/20">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                AI Summary
              </h2>
              <p className="text-sm text-foreground leading-relaxed">
                {file.summary}
              </p>
            </div>
          )}

          {/* Download button */}
          <div className="p-8 text-center">
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download file
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Shared via{" "}
          <Link href="/" className="underline hover:text-foreground transition-colors">
            Docubox
          </Link>
          {" "}— AI-powered document management
        </p>
      </div>
    </div>
  );
}
