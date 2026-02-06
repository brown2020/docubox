"use client";

import { useMemo, useEffect, useState } from "react";
import { useUser, useAuth } from "@/components/auth";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import { FileType, isFolder } from "@/types/filetype";
import { mapDocsToFileTypes } from "@/utils/mapFirestoreDoc";

/** Available sort fields */
export type SortField = "timestamp" | "name" | "size" | "type";

interface UseFilesListOptions {
  isTrashView?: boolean;
  sortField?: SortField;
  sortDir?: "asc" | "desc";
  searchInput?: string;
  folderId: string | null;
}

interface UseFilesListReturn {
  files: FileType[];
  allFiles: FileType[];
  isLoading: boolean;
  folderSizes: Map<string, number>;
  /** Total storage used in bytes (non-deleted files only) */
  totalStorageBytes: number;
  /** Total non-deleted file count (excludes folders) */
  totalFileCount: number;
}

/**
 * Hook for fetching, filtering, sorting, and searching the file list.
 * Supports full-text search (filename + summary + tags) and multi-field sort.
 */
export function useFilesList({
  isTrashView = false,
  sortField = "timestamp",
  sortDir = "desc",
  searchInput = "",
  folderId,
}: UseFilesListOptions): UseFilesListReturn {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const [allFiles, setAllFiles] = useState<FileType[]>([]);

  // Build Firestore query — always order by timestamp for the initial fetch.
  // Client-side sort handles the other fields.
  const _where = isTrashView
    ? where("deletedAt", "!=", null)
    : where("deletedAt", "==", null);

  const _orderBy = isTrashView
    ? orderBy("deletedAt", "desc")
    : orderBy("timestamp", "desc");

  const firestoreQuery =
    isLoaded && isSignedIn && user
      ? query(collection(db, "users", user.id, "files"), _where, _orderBy)
      : null;

  const [docs] = useCollection(firestoreQuery);

  useEffect(() => {
    if (!docs) return;
    const files = mapDocsToFileTypes(docs.docs);
    queueMicrotask(() => setAllFiles(files));
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

    allFiles.filter(isFolder).forEach((f) => calculateSize(f.docId));
    return sizes;
  }, [allFiles]);

  // Storage stats (non-deleted files only, computed from allFiles)
  const { totalStorageBytes, totalFileCount } = useMemo(() => {
    let bytes = 0;
    let count = 0;
    for (const file of allFiles) {
      if (!isFolder(file)) {
        bytes += file.size || 0;
        count++;
      }
    }
    return { totalStorageBytes: bytes, totalFileCount: count };
  }, [allFiles]);

  // Filter, search, and sort
  const files = useMemo(() => {
    let filtered = [...allFiles];

    // 1. Filter by folder
    filtered = filtered.filter((file) => file.folderId === folderId);

    // 2. Full-text search (filename + summary + tags)
    if (searchInput) {
      const q = searchInput.toLowerCase();
      filtered = filtered.filter((file) => {
        if (file.filename.toLowerCase().includes(q)) return true;
        if (file.summary && file.summary.toLowerCase().includes(q)) return true;
        if (file.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    // 3. Apply folder sizes before sorting
    filtered = filtered.map((file) => {
      if (isFolder(file)) {
        return { ...file, size: folderSizes.get(file.docId) || 0 };
      }
      return file;
    });

    // 4. Sort — folders first, then by selected field
    filtered.sort((a, b) => {
      // Folders always come first
      const aFolder = isFolder(a) ? 0 : 1;
      const bFolder = isFolder(b) ? 0 : 1;
      if (aFolder !== bFolder) return aFolder - bFolder;

      const dir = sortDir === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          return dir * a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" });
        case "size":
          return dir * ((a.size || 0) - (b.size || 0));
        case "type": {
          const aExt = a.filename.split(".").pop()?.toLowerCase() || "";
          const bExt = b.filename.split(".").pop()?.toLowerCase() || "";
          return dir * aExt.localeCompare(bExt);
        }
        case "timestamp":
        default:
          return dir * (a.timestamp.getTime() - b.timestamp.getTime());
      }
    });

    return filtered;
  }, [allFiles, folderId, searchInput, folderSizes, sortField, sortDir]);

  const isLoading = !isLoaded || (isSignedIn && docs?.docs === undefined);

  return { files, allFiles, isLoading, folderSizes, totalStorageBytes, totalFileCount };
}
