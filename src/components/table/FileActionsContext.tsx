"use client";

import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useUser } from "@/components/auth";
import { FileType } from "@/types/filetype";
import { useFileModals } from "@/hooks";
import { useUploadStore } from "@/zustand/useUploadStore";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";

interface FileActionsContextValue {
  openRenameModal: (fileId: string, filename: string, tags: string[]) => void;
  openDeleteModal: (
    fileId: string,
    folderId: string | null,
    isFolder: boolean
  ) => void;
  openParseDataViewModal: (
    docId: string,
    filedataUrl: string | string[] | null,
    summary: string
  ) => Promise<void>;
  openQuestionAnswerModal: (fileId: string) => void;
  handleParsingClick: (file: FileType) => void;
  restoreDeletedFile: (fileId: string) => Promise<void>;
}

const FileActionsContext = createContext<FileActionsContextValue | null>(null);

/**
 * Hook to access file actions from context.
 * Must be used within FileActionsProvider.
 */
export function useFileActions() {
  const ctx = useContext(FileActionsContext);
  if (!ctx) {
    throw new Error("useFileActions must be used within FileActionsProvider");
  }
  return ctx;
}

interface FileActionsProviderProps {
  children: ReactNode;
}

/**
 * Provider for file action callbacks.
 * Eliminates prop drilling for modal handlers.
 */
export function FileActionsProvider({ children }: FileActionsProviderProps) {
  const { user } = useUser();
  const {
    openDeleteModal,
    openRenameModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
  } = useFileModals();

  const { uploadingFiles, addUploadingFile, updateUploadingFile } =
    useUploadStore();

  const handleParsingClick = useCallback(
    (file: FileType) => {
      if (uploadingFiles.find((f) => f.fileId === file.docId)) {
        updateUploadingFile(file.docId, { isParsing: true });
        setTimeout(() => {
          updateUploadingFile(file.docId, { isParsing: false });
        }, 2000);
      } else {
        addUploadingFile({
          fileId: file.docId,
          fileName: file.filename,
          downloadUrl: file.downloadUrl,
          loading: true,
          isParsing: false,
        });
      }
    },
    [uploadingFiles, addUploadingFile, updateUploadingFile]
  );

  const restoreDeletedFile = useCallback(
    async (fileId: string) => {
      if (!user) return;
      try {
        await fileService.restore(user.id, fileId);
      } catch (error) {
        logger.error("FileActionsContext", "Failed to restore file", error);
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      openRenameModal,
      openDeleteModal,
      openParseDataViewModal,
      openQuestionAnswerModal,
      handleParsingClick,
      restoreDeletedFile,
    }),
    [
      openRenameModal,
      openDeleteModal,
      openParseDataViewModal,
      openQuestionAnswerModal,
      handleParsingClick,
      restoreDeletedFile,
    ]
  );

  return (
    <FileActionsContext.Provider value={value}>
      {children}
    </FileActionsContext.Provider>
  );
}
