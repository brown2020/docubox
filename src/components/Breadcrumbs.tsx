"use client";

import { useMemo } from "react";
import { ChevronRight, Home } from "lucide-react";
import { FileType, isFolder } from "@/types/filetype";

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface BreadcrumbsProps {
  folderId: string | null;
  allFiles: FileType[];
  onNavigate: (folderId: string | null) => void;
}

/**
 * Breadcrumb navigation bar showing the current folder path.
 * Each segment is clickable to navigate to that level.
 */
export function Breadcrumbs({ folderId, allFiles, onNavigate }: BreadcrumbsProps) {
  const breadcrumbs = useMemo(() => {
    const crumbs: BreadcrumbItem[] = [];
    let currentId = folderId;

    // Walk up the folder chain
    while (currentId) {
      const folder = allFiles.find(
        (f) => f.docId === currentId && isFolder(f)
      );
      if (!folder) break;
      crumbs.unshift({ id: folder.docId, name: folder.filename });
      currentId = folder.folderId;
    }

    return crumbs;
  }, [folderId, allFiles]);

  // Don't render if at root level
  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={crumb.id} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {crumb.name}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(crumb.id)}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {crumb.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
