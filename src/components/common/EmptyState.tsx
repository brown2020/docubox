"use client";

import { FileQuestion, FolderOpen, Search, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "files" | "folder" | "search" | "default";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variants: Record<
  EmptyStateVariant,
  { icon: typeof FileQuestion; defaultTitle: string; defaultDescription: string }
> = {
  files: {
    icon: Inbox,
    defaultTitle: "No files yet",
    defaultDescription: "Upload your first document to get started.",
  },
  folder: {
    icon: FolderOpen,
    defaultTitle: "This folder is empty",
    defaultDescription: "Upload files or create subfolders to organize your documents.",
  },
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search terms or filters.",
  },
  default: {
    icon: FileQuestion,
    defaultTitle: "Nothing here",
    defaultDescription: "There's nothing to display at the moment.",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  action,
}: EmptyStateProps) {
  const { icon: Icon, defaultTitle, defaultDescription } = variants[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground">
        {title || defaultTitle}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description || defaultDescription}
      </p>
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
