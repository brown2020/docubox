"use client";

import { HardDrive } from "lucide-react";
import prettyBytes from "pretty-bytes";

interface StorageUsageBarProps {
  totalBytes: number;
  fileCount: number;
}

/**
 * Compact storage usage display showing file count and total size.
 */
export function StorageUsageBar({ totalBytes, fileCount }: StorageUsageBarProps) {
  if (fileCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="h-3 w-3" />
      <span>
        {fileCount} {fileCount === 1 ? "file" : "files"} · {prettyBytes(totalBytes)}
      </span>
    </div>
  );
}
