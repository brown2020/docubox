"use client";

import { useState, useCallback, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { FileType } from "@/types/filetype";
import { logger } from "@/lib/logger";

interface UseDocumentOptions {
  /** Whether to fetch immediately on mount. Defaults to true. */
  immediate?: boolean;
}

interface UseDocumentReturn {
  /** The fetched document data */
  document: FileType | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refetch the document */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching a single document from Firestore.
 * Eliminates duplicate document fetching logic across components.
 *
 * @param userId - The user ID who owns the document
 * @param fileId - The document/file ID to fetch
 * @param options - Optional configuration
 * @returns Document data, loading state, error, and refetch function
 */
export function useDocument(
  userId: string | undefined,
  fileId: string | null,
  options: UseDocumentOptions = {}
): UseDocumentReturn {
  const { immediate = true } = options;

  const [document, setDocument] = useState<FileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!userId || !fileId) {
      setDocument(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, "users", userId, "files", fileId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FileType;
        setDocument(data);
        logger.debug("useDocument", { fileId, success: true });
      } else {
        setDocument(null);
        logger.debug("useDocument", { fileId, exists: false });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch document";
      setError(errorMessage);
      logger.error("useDocument", "Error fetching document", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fileId]);

  useEffect(() => {
    if (immediate) {
      fetchDocument();
    }
  }, [fetchDocument, immediate]);

  return { document, isLoading, error, refetch: fetchDocument };
}
