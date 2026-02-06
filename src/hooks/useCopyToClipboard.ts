"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardProps {
  timeout?: number;
}

/**
 * Hook for copying text to clipboard with auto-reset.
 */
export function useCopyToClipboard({
  timeout = 2000,
}: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(
    (value: string) => {
      if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }

      if (!value) {
        return;
      }

      navigator.clipboard.writeText(value).then(
        () => {
          setIsCopied(true);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            setIsCopied(false);
          }, timeout);
        },
        () => {
          // Clipboard write failed (e.g. permissions denied)
          setIsCopied(false);
        }
      );
    },
    [timeout]
  );

  return { isCopied, copyToClipboard };
}
