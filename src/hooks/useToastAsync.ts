"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";

interface ToastOptions {
  loading: string;
  success: string;
  error: string;
}

/**
 * Hook that provides a wrapper for async operations with automatic toast notifications.
 * Eliminates the repetitive toast.loading/success/error pattern.
 *
 * @example
 * const { runWithToast } = useToastAsync();
 *
 * const handleDelete = async () => {
 *   await runWithToast(
 *     () => fileService.delete(fileId),
 *     {
 *       loading: 'Deleting file...',
 *       success: 'File deleted!',
 *       error: 'Failed to delete file',
 *     }
 *   );
 * };
 */
export function useToastAsync(context?: string) {
  const runWithToast = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: ToastOptions
    ): Promise<T | null> => {
      const toastId = toast.loading(options.loading);

      try {
        const result = await asyncFn();
        toast.success(options.success, { id: toastId });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : options.error;
        toast.error(message, { id: toastId });

        if (context) {
          logger.error(context, options.error, error);
        }

        return null;
      }
    },
    [context]
  );

  /**
   * Variant that returns a boolean indicating success.
   */
  const runWithToastBoolean = useCallback(
    async (
      asyncFn: () => Promise<void>,
      options: ToastOptions
    ): Promise<boolean> => {
      const result = await runWithToast(asyncFn, options);
      return result !== null;
    },
    [runWithToast]
  );

  return { runWithToast, runWithToastBoolean };
}
