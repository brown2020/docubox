"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorVariant = "default" | "network" | "notFound" | "permission";

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const variants: Record<
  ErrorVariant,
  { icon: typeof AlertCircle; defaultTitle: string; defaultDescription: string }
> = {
  default: {
    icon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultDescription: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: WifiOff,
    defaultTitle: "Connection error",
    defaultDescription: "Unable to connect. Check your internet connection and try again.",
  },
  notFound: {
    icon: AlertCircle,
    defaultTitle: "Not found",
    defaultDescription: "The resource you're looking for doesn't exist or has been moved.",
  },
  permission: {
    icon: AlertCircle,
    defaultTitle: "Access denied",
    defaultDescription: "You don't have permission to view this content.",
  },
};

export function ErrorState({
  variant = "default",
  title,
  description,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  const { icon: Icon, defaultTitle, defaultDescription } = variants[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground">
        {title || defaultTitle}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description || defaultDescription}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-6 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
