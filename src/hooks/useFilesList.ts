"use client";

import { useMemo, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import { FileType, isFolder } from "@/types/filetype";
import { mapDocsToFileTypes } from "@/utils/mapFirestoreDoc";

interface UseFilesListOptions {
  isTrashView?: boolean;
  sort?: "asc" | "desc";
  searchInput?: string;
  folderId: string | null;
}

interface UseFilesListReturn {
  files: FileType[];
  allFiles: FileType[];
  isLoading: boolean;
  folderSizes: Map<string, number>;
}

/**
 * Hook for fetching and filtering file list from Firestore.
 * Extracts file management logic from TableWrapper.
 */
export function useFilesList({
  isTrashView = false,
  sort = "desc",
  searchInput = "",
  folderId,
}: UseFilesListOptions): UseFilesListReturn {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const [allFiles, setAllFiles] = useState<FileType[]>([]);

  // Build Firestore query - only create if user is authenticated
  const _where = isTrashView
    ? where("deletedAt", "!=", null)
    : where("deletedAt", "==", null);

  const _orderBy = isTrashView
    ? orderBy("deletedAt", sort)
    : orderBy("timestamp", sort);

  // Only query Firestore when user is authenticated
  const firestoreQuery =
    isLoaded && isSignedIn && user
      ? query(collection(db, "users", user.id, "files"), _where, _orderBy)
      : null;

  const [docs] = useCollection(firestoreQuery);

  // Update files when docs change
  useEffect(() => {
    if (!docs) return;
    const files = mapDocsToFileTypes(docs.docs);
    setAllFiles(files);
  }, [docs]);

  // Calculate folder sizes
  const folderSizes = useMemo(() => {
    const sizes = new Map<string, number>();

    const calculateSize = (targetFolderId: string): number => {
      if (sizes.has(targetFolderId)) return sizes.get(targetFolderId)!;

      const children = allFiles.filter(
        (file) => file.folderId === targetFolderId
      );
      let totalSize = 0;

      for (const child of children) {
        if (isFolder(child)) {
          totalSize += calculateSize(child.docId);
        } else {
          totalSize += child.size || 0;
        }
      }

      sizes.set(targetFolderId, totalSize);
      return totalSize;
    };

    // Pre-calculate all folder sizes
    allFiles.filter(isFolder).forEach((f) => calculateSize(f.docId));

    return sizes;
  }, [allFiles]);

  // Filter and process files
  const files = useMemo(() => {
    let filtered = [...allFiles];

    // Filter by folderId
    filtered = filtered.filter((file) => file.folderId === folderId);

    // Filter by search input (tags)
    if (searchInput) {
      const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          Array.isArray(file.tags) &&
          file.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply folder sizes
    return filtered.map((file) => {
      if (isFolder(file)) {
        return { ...file, size: folderSizes.get(file.docId) || 0 };
      }
      return file;
    });
  }, [allFiles, folderId, searchInput, folderSizes]);

  // Loading if Clerk hasn't loaded yet OR if we're signed in and docs haven't loaded
  const isLoading = !isLoaded || (isSignedIn && docs?.docs === undefined);

  return { files, allFiles, isLoading, folderSizes };
}
