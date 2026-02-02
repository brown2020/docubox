"use client";

import { useEffect, useRef } from "react";

/**
 * Hook that returns a ref tracking whether the component is still mounted.
 * Use this to guard state updates in async operations to prevent
 * "Can't perform state update on unmounted component" warnings.
 *
 * @example
 * const isMountedRef = useMountedRef();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   if (isMountedRef.current) {
 *     setData(data);
 *   }
 * };
 */
export function useMountedRef() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}
