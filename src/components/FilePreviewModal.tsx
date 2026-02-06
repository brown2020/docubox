"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useModalStore,
  useIsModalOpen,
  usePreviewModalData,
} from "@/zustand/useModalStore";
import { getPreviewType, getLanguageFromFilename } from "@/utils/filePreview";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";
import { LoadingState } from "@/components/common/LoadingState";
import { Download, ExternalLink, FileQuestion } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

/**
 * File preview modal — displays images, PDFs, text/code, video, and audio
 * directly in the browser. Falls back to download for unsupported types.
 */
export function FilePreviewModal() {
  const isOpen = useIsModalOpen("preview");
  const close = useModalStore((s) => s.close);
  const { filename, downloadUrl, type, size, summary } = usePreviewModalData();

  const previewType = filename ? getPreviewType(type, filename) : "unsupported";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 bg-background overflow-hidden",
          "w-[95vw] max-w-5xl max-h-[90vh] flex flex-col"
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileTypeIcon type={type} size={28} className="shrink-0" />
              <div className="min-w-0">
                <DialogTitle className="truncate text-base">
                  {filename}
                </DialogTitle>
                {size > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {prettyBytes(size)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0"
            >
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto min-h-0">
          <PreviewContent
            previewType={previewType}
            downloadUrl={downloadUrl}
            filename={filename}
            type={type}
            size={size}
          />
        </div>

        {/* Summary footer (if available) */}
        {summary && (
          <div className="border-t px-6 py-3 shrink-0 max-h-32 overflow-auto">
            <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t shrink-0">
          <Button size="sm" variant="ghost" onClick={close}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Individual preview renderers ---

interface PreviewContentProps {
  previewType: string;
  downloadUrl: string;
  filename: string;
  type: string;
  size: number;
}

function PreviewContent({ previewType, downloadUrl, filename, type, size }: PreviewContentProps) {
  switch (previewType) {
    case "image":
      return <ImagePreview url={downloadUrl} filename={filename} />;
    case "pdf":
      return <PdfPreview url={downloadUrl} />;
    case "text":
      return <TextPreview url={downloadUrl} filename={filename} />;
    case "video":
      return <VideoPreview url={downloadUrl} type={type} />;
    case "audio":
      return <AudioPreview url={downloadUrl} type={type} filename={filename} />;
    default:
      return <UnsupportedPreview filename={filename} type={type} size={size} downloadUrl={downloadUrl} />;
  }
}

function ImagePreview({ url, filename }: { url: string; filename: string }) {
  return (
    <div className="flex items-center justify-center p-4 bg-muted/30 min-h-[300px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={filename}
        className="max-w-full max-h-[65vh] object-contain rounded"
        loading="eager"
      />
    </div>
  );
}

function PdfPreview({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      title="PDF Preview"
      className="w-full h-[70vh] border-0"
    />
  );
}

function TextPreview({ url, filename }: { url: string; filename: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const language = getLanguageFromFilename(filename);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      // Cap display at 500KB to avoid browser performance issues
      setContent(text.length > 500_000 ? text.slice(0, 500_000) + "\n\n... (truncated)" : text);
    } catch (err) {
      logger.error("TextPreview", "Failed to fetch text content", err);
      setError(true);
    }
  }, [url]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-muted-foreground">
        <FileQuestion className="h-10 w-10 mb-2" />
        <p>Could not load file content.</p>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <LoadingState message="Loading content..." size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/30">
      <pre className="text-sm font-mono whitespace-pre-wrap wrap-break-word leading-relaxed text-foreground overflow-auto max-h-[65vh] p-4 bg-background rounded border">
        {language && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
            {language}
          </span>
        )}
        {content}
      </pre>
    </div>
  );
}

function VideoPreview({ url, type }: { url: string; type: string }) {
  return (
    <div className="flex items-center justify-center p-4 bg-black min-h-[300px]">
      <video
        controls
        className="max-w-full max-h-[65vh] rounded"
        preload="metadata"
      >
        <source src={url} type={type} />
        Your browser does not support video playback.
      </video>
    </div>
  );
}

function AudioPreview({ url, type, filename }: { url: string; type: string; filename: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 min-h-[200px] gap-4">
      <FileTypeIcon type={type} size={64} />
      <p className="text-sm text-muted-foreground">{filename}</p>
      <audio controls preload="metadata" className="w-full max-w-md">
        <source src={url} type={type} />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

function UnsupportedPreview({
  filename,
  type,
  size,
  downloadUrl,
}: {
  filename: string;
  type: string;
  size: number;
  downloadUrl: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[250px] gap-4">
      <FileTypeIcon type={type} size={72} />
      <div className="text-center">
        <p className="font-medium text-foreground">{filename}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {type} {size > 0 && `· ${prettyBytes(size)}`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Preview not available for this file type.
        </p>
      </div>
      <Button variant="outline" asChild>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Download to view
        </a>
      </Button>
    </div>
  );
}
