"use client";

import { useCallback } from "react";
import { useModalStore } from "@/zustand/useModalStore";
import { downloadUnstructuredFile } from "@/actions/unstructuredActions";

/**
 * Custom hook that provides modal handler functions for file operations.
 * Uses the modal store as the single source of truth for all modal data.
 * All data is passed atomically via modalData to prevent race conditions.
 */
export function useFileModals() {
  const { open, updateData } = useModalStore();

  /**
   * Opens the delete modal with file/folder information.
   * All data is passed atomically in a single store update.
   */
  const openDeleteModal = useCallback(
    (fileId: string, folderId: string | null = null, isFolder = false) => {
      open("delete", { fileId, folderId, isFolder });
    },
    [open]
  );

  /**
   * Opens the rename modal with file information.
   * All data is passed atomically in a single store update.
   */
  const openRenameModal = useCallback(
    (fileId: string, filename: string, tags: string[] = []) => {
      open("rename", { fileId, filename, tags });
    },
    [open]
  );

  /**
   * Opens the parse data view modal.
   * Opens immediately with summary, then fetches unstructured data async.
   */
  const openParseDataViewModal = useCallback(
    async (
      docId: string,
      filedataUrl: string | string[] | null,
      summary: string
    ) => {
      // Open modal immediately with available data
      open("parseData", { fileId: docId, summary });

      // Fetch unstructured data async and update modal data
      if (!filedataUrl) return;
      try {
        const data = await downloadUnstructuredFile(filedataUrl);
        updateData({ unstructuredFileData: data });
      } catch {
        // Download failed — modal will fall back to fetching via useDocument
      }
    },
    [open, updateData]
  );

  /**
   * Opens the question/answer modal for a file.
   */
  const openQuestionAnswerModal = useCallback(
    (fileId: string) => {
      open("questionAnswer", { fileId });
    },
    [open]
  );

  return {
    openDeleteModal,
    openRenameModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
  };
}
