"use client";

import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Icon size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to center in full height container */
  fullHeight?: boolean;
}

/**
 * Reusable loading state component.
 * Consolidates the loading pattern used across multiple components.
 */
export function LoadingState({
  message = "Loading...",
  size = 48,
  className,
  fullHeight = true,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-2",
        fullHeight && "h-full",
        className
      )}
    >
      <LoaderCircleIcon size={size} className="animate-spin" />
      {message && <small className="text-muted-foreground">{message}</small>}
    </div>
  );
}
