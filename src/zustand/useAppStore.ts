import { useModalStore } from "./useModalStore";
import { useFileSelectionStore } from "./useFileSelectionStore";
import { useUploadStore, type UploadingFile } from "./useUploadStore";

// Re-export types for backward compatibility
export type { UploadingFile };

/**
 * @deprecated This combined store is deprecated. Use the individual stores instead:
 * - useModalStore - for modal states
 * - useFileSelectionStore - for selected file data
 * - useUploadStore - for upload progress
 *
 * This hook is maintained for backward compatibility and combines all three stores.
 */
export const useAppStore = () => {
  const modalStore = useModalStore();
  const fileSelectionStore = useFileSelectionStore();
  const uploadStore = useUploadStore();

  return {
    // Modal states
    isDeleteModalOpen: modalStore.isDeleteModalOpen,
    setIsDeleteModalOpen: modalStore.setIsDeleteModalOpen,
    isRenameModalOpen: modalStore.isRenameModalOpen,
    setIsRenameModalOpen: modalStore.setIsRenameModalOpen,
    isShowParseDataModelOpen: modalStore.isShowParseDataModelOpen,
    setIsShowParseDataModelOpen: modalStore.setIsShowParseDataModelOpen,
    isCreateFolderModalOpen: modalStore.isCreateFolderModalOpen,
    setIsCreateFolderModalOpen: modalStore.setIsCreateFolderModalOpen,
    isQuestionAnswerModalOpen: modalStore.isQuestionAnswerModalOpen,
    setQuestionAnswerModalOpen: modalStore.setQuestionAnswerModalOpen,

    // File selection states
    fileId: fileSelectionStore.fileId,
    setFileId: fileSelectionStore.setFileId,
    filename: fileSelectionStore.filename,
    setFilename: fileSelectionStore.setFilename,
    tags: fileSelectionStore.tags,
    setTags: fileSelectionStore.setTags,
    folderId: fileSelectionStore.folderId,
    setFolderId: fileSelectionStore.setFolderId,
    isFolder: fileSelectionStore.isFolder,
    setIsFolder: fileSelectionStore.setIsFolder,
    unstructuredFileData: fileSelectionStore.unstructuredFileData,
    setUnstructuredFileData: fileSelectionStore.setUnstructuredFileData,
    fileSummary: fileSelectionStore.fileSummary,
    setFileSummary: fileSelectionStore.setFileSummary,

    // Upload states
    uploadingFiles: uploadStore.uploadingFiles,
    addUploadingFile: uploadStore.addUploadingFile,
    updateUploadingFile: uploadStore.updateUploadingFile,
    removeUploadingFile: uploadStore.removeUploadingFile,
    onFileAddedCallback: uploadStore.onFileAddedCallback,
    setOnFileAddedCallback: uploadStore.setOnFileAddedCallback,
  };
};
