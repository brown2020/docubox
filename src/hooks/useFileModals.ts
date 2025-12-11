"use client";

import { useCallback } from "react";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { downloadUnstructuredFile } from "@/actions/unstructuredActions";

/**
 * Custom hook that provides modal handler functions for file operations.
 * Eliminates duplicate modal logic between DataTable and GridView.
 */
export function useFileModals() {
  const {
    setIsDeleteModalOpen,
    setIsRenameModalOpen,
    setIsShowParseDataModelOpen,
    setQuestionAnswerModalOpen,
  } = useModalStore();

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
      setFileId(fileId);
      setFolderId(folderId);
      setIsFolder(isFolder);
      setIsDeleteModalOpen(true);
    },
    [setFileId, setFolderId, setIsFolder, setIsDeleteModalOpen]
  );

  const openRenameModal = useCallback(
    (fileId: string, filename: string, tags: string[] = []) => {
      setFileId(fileId);
      setFilename(filename);
      setTags(tags);
      setIsRenameModalOpen(true);
    },
    [setFileId, setFilename, setTags, setIsRenameModalOpen]
  );

  const openParseDataViewModal = useCallback(
    async (docId: string, filedataUrl: string, summary: string) => {
      setFileId(docId);
      setIsShowParseDataModelOpen(true);
      const data = await downloadUnstructuredFile(filedataUrl);
      setUnstructuredFileData(data);
      setFileSummary({ docId, summary });
    },
    [
      setFileId,
      setIsShowParseDataModelOpen,
      setUnstructuredFileData,
      setFileSummary,
    ]
  );

  const openQuestionAnswerModal = useCallback(
    (fileId: string) => {
      setFileId(fileId);
      setQuestionAnswerModalOpen(true);
    },
    [setFileId, setQuestionAnswerModalOpen]
  );

  return {
    openDeleteModal,
    openRenameModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
  };
}
