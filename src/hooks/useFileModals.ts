"use client";

import { useCallback } from "react";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { downloadUnstructuredFile } from "@/actions/unstructuredActions";

/**
 * Custom hook that provides modal handler functions for file operations.
 * Uses the new generic modal pattern with modalData.
 */
export function useFileModals() {
  const { open, updateData } = useModalStore();
  const {
    setFileId,
    setFilename,
    setTags,
    setUnstructuredFileData,
    setFileSummary,
    setFolderId,
    setIsFolder,
  } = useFileSelectionStore();

  const openDeleteModal = useCallback(
    (fileId: string, folderId: string | null = null, isFolder = false) => {
      // Update file selection store for backwards compatibility
      setFileId(fileId);
      setFolderId(folderId);
      setIsFolder(isFolder);
      // Open modal with data
      open("delete", { fileId, folderId, isFolder });
    },
    [setFileId, setFolderId, setIsFolder, open]
  );

  const openRenameModal = useCallback(
    (fileId: string, filename: string, tags: string[] = []) => {
      // Update file selection store for backwards compatibility
      setFileId(fileId);
      setFilename(filename);
      setTags(tags);
      // Open modal with data
      open("rename", { fileId, filename, tags });
    },
    [setFileId, setFilename, setTags, open]
  );

  const openParseDataViewModal = useCallback(
    async (docId: string, filedataUrl: string, summary: string) => {
      // Update file selection store for backwards compatibility
      setFileId(docId);
      // Open modal immediately
      open("parseData", { fileId: docId, summary });
      // Fetch data async and update
      const data = await downloadUnstructuredFile(filedataUrl);
      setUnstructuredFileData(data);
      setFileSummary({ docId, summary });
      updateData({ unstructuredFileData: data });
    },
    [setFileId, setUnstructuredFileData, setFileSummary, open, updateData]
  );

  const openQuestionAnswerModal = useCallback(
    (fileId: string) => {
      // Update file selection store for backwards compatibility
      setFileId(fileId);
      // Open modal with data
      open("questionAnswer", { fileId });
    },
    [setFileId, open]
  );

  return {
    openDeleteModal,
    openRenameModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
  };
}
