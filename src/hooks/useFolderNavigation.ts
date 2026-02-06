"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { FileType } from "@/types/filetype";

interface UseFolderNavigationReturn {
  folderId: string | null;
  canGoBack: boolean;
  goBack: () => void;
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

  const goBack = useCallback(() => {
    const parentFolderId = allFiles.find((i) => i.docId === folderId)?.folderId;
    const params = new URLSearchParams(searchParams);

    if (parentFolderId) {
      params.set("activeFolder", parentFolderId);
    } else {
      params.delete("activeFolder");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [allFiles, folderId, searchParams, pathname, replace]);

  return { folderId, canGoBack, goBack, setFolderId };
}
