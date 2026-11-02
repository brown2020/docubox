"use client";

import { useMemo, useEffect, useState } from "react";
import { useUser, useAuth } from "@/components/auth";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import { FileType } from "@/types/filetype";
import { mapDocsToFileTypes } from "@/utils/mapFirestoreDoc";
import {
  calculateFolderSizes,
  filterAndSortFiles,
  summarizeStorage,
  type SortField,
} from "@/lib/fileList";

export type { SortField };

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

  const folderSizes = useMemo(() => calculateFolderSizes(allFiles), [allFiles]);

  const { totalStorageBytes, totalFileCount } = useMemo(
    () => summarizeStorage(allFiles),
    [allFiles]
  );

  const files = useMemo(
    () =>
      filterAndSortFiles({
        allFiles,
        folderId,
        searchInput,
        folderSizes,
        sortField,
        sortDir,
      }),
    [allFiles, folderId, searchInput, folderSizes, sortField, sortDir]
  );

  const isLoading = !isLoaded || (isSignedIn && docs?.docs === undefined);

  return { files, allFiles, isLoading, folderSizes, totalStorageBytes, totalFileCount };
}
