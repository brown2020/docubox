"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook that returns a callback to get an AbortController.
 * Creates a new controller on each call to the getter.
 * Use this when you need to abort fetch requests on unmount.
 *
 * @example
 * const { getController, isAborted } = useAbortController();
 *
 * useEffect(() => {
 *   const controller = getController();
 *
 *   const fetchData = async () => {
 *     try {
 *       const response = await fetch(url, { signal: controller.signal });
 *       if (isAborted()) return;
 *       setData(response);
 *     } catch (error) {
 *       if (isAbortError(error)) return;
 *       handleError(error);
 *     }
 *   };
 *   fetchData();
 *
 *   return () => controller.abort();
 * }, [getController, isAborted]);
 */
export function useAbortController() {
  const abortedRef = useRef(false);

  useEffect(() => {
    abortedRef.current = false;
    return () => {
      abortedRef.current = true;
    };
  }, []);

  const isAborted = useCallback(() => abortedRef.current, []);

  const getController = useCallback(() => new AbortController(), []);

  return {
    getController,
    isAborted,
  };
}

/**
 * Utility to check if an error is an AbortError.
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
