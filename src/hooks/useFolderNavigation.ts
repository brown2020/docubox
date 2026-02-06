"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { FileType } from "@/types/filetype";

interface UseFolderNavigationReturn {
  folderId: string | null;
  canGoBack: boolean;
  goBack: () => void;
  navigateTo: (targetFolderId: string | null) => void;
  setFolderId: (folderId: string | null) => void;
}

/**
 * Hook for managing folder navigation state.
 * Syncs with URL search params.
 * Accepts allFiles to resolve parent folders for back navigation.
 */
export function useFolderNavigation(
  allFiles: FileType[] = []
): UseFolderNavigationReturn {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const { folderId, setFolderId } = useNavigationStore();

  // Sync folderId with URL params
  useEffect(() => {
    const activeFolderId = searchParams.get("activeFolder");
    setFolderId(activeFolderId ?? null);
  }, [searchParams, setFolderId]);

  const canGoBack = !!searchParams.get("activeFolder");

  const navigateTo = useCallback(
    (targetFolderId: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (targetFolderId) {
        params.set("activeFolder", targetFolderId);
      } else {
        params.delete("activeFolder");
      }
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace]
  );

  const goBack = useCallback(() => {
    const parentFolderId = allFiles.find((i) => i.docId === folderId)?.folderId;
    navigateTo(parentFolderId ?? null);
  }, [allFiles, folderId, navigateTo]);

  return { folderId, canGoBack, goBack, navigateTo, setFolderId };
}
