"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component to catch and handle React errors gracefully.
 * Prevents entire app crashes from component errors.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console with full details
    const boundaryName = this.props.name || "Unknown";

    console.error(`[ErrorBoundary:${boundaryName}]`, error.message);
    if (process.env.NODE_ENV === "development") {
      console.error("Stack:", error.stack);
      console.error("Component Stack:", errorInfo.componentStack);
    }

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === "development";

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            An error occurred while rendering this section.
          </p>

          {isDev && this.state.error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left max-w-2xl overflow-auto">
              <p className="font-mono text-sm text-red-600 dark:text-red-400 mb-2">
                <strong>Error:</strong> {this.state.error.message}
              </p>
              {this.state.error.stack && (
                <pre className="font-mono text-xs text-red-500 dark:text-red-300 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400">
                    Component Stack
                  </summary>
                  <pre className="font-mono text-xs text-red-500 dark:text-red-300 whitespace-pre-wrap mt-1">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <Button onClick={this.handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
