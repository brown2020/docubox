"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";

/**
 * Hook that provides consistent error handling across the application.
 * Logs errors and optionally shows toast notifications.
 *
 * @param context - The component/module name for logging context
 *
 * @example
 * const { handleError, handleErrorSilent } = useErrorHandler('ProfileComponent');
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, 'Failed to update profile');
 * }
 */
export function useErrorHandler(context: string) {
  /**
   * Handles an error by logging it and showing a toast notification.
   */
  const handleError = useCallback(
    (error: unknown, userMessage?: string) => {
      const message =
        error instanceof Error
          ? error.message
          : userMessage || "An unexpected error occurred";

      logger.error(context, userMessage || message, error);
      toast.error(userMessage || message);
    },
    [context]
  );

  /**
   * Handles an error by logging it without showing a toast.
   * Use this for non-critical errors that shouldn't interrupt the user.
   */
  const handleErrorSilent = useCallback(
    (error: unknown, logMessage?: string) => {
      const message =
        error instanceof Error
          ? error.message
          : logMessage || "An unexpected error occurred";

      logger.error(context, logMessage || message, error);
    },
    [context]
  );

  /**
   * Wraps an async function with error handling.
   * Returns null if an error occurs.
   */
  const withErrorHandling = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      errorMessage?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, errorMessage);
        return null;
      }
    },
    [handleError]
  );

  return { handleError, handleErrorSilent, withErrorHandling };
}

/**
 * Type guard to check if an error is an Error instance with a message.
 */
export function isErrorWithMessage(error: unknown): error is Error {
  return error instanceof Error && typeof error.message === "string";
}

/**
 * Extracts an error message from an unknown error type.
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
