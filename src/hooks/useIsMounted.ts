"use client";

import { useEffect, useState } from "react";

/**
 * Hook to track if the component has mounted on the client.
 * Useful for preventing hydration mismatches with client-only components.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Defer to avoid synchronous setState inside effects (React Compiler rule).
    queueMicrotask(() => setIsMounted(true));
  }, []);

  return isMounted;
}
