import { create } from "zustand";

/**
 * Store for managing modal visibility states.
 * Keeps modal concerns separate from other app state.
 */
interface ModalStore {
  // Delete Modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;

  // Rename Modal
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (isOpen: boolean) => void;

  // Parsed Data Modal
  isShowParseDataModelOpen: boolean;
  setIsShowParseDataModelOpen: (isOpen: boolean) => void;

  // Create Folder Modal
  isCreateFolderModalOpen: boolean;
  setIsCreateFolderModalOpen: (isOpen: boolean) => void;

  // Question Answer Modal
  isQuestionAnswerModalOpen: boolean;
  setQuestionAnswerModalOpen: (isOpen: boolean) => void;

  // Reset all modals
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),

  isRenameModalOpen: false,
  setIsRenameModalOpen: (isOpen) => set({ isRenameModalOpen: isOpen }),

  isShowParseDataModelOpen: false,
  setIsShowParseDataModelOpen: (isOpen) =>
    set({ isShowParseDataModelOpen: isOpen }),

  isCreateFolderModalOpen: false,
  setIsCreateFolderModalOpen: (isOpen) =>
    set({ isCreateFolderModalOpen: isOpen }),

  isQuestionAnswerModalOpen: false,
  setQuestionAnswerModalOpen: (isOpen) =>
    set({ isQuestionAnswerModalOpen: isOpen }),

  closeAllModals: () =>
    set({
      isDeleteModalOpen: false,
      isRenameModalOpen: false,
      isShowParseDataModelOpen: false,
      isCreateFolderModalOpen: false,
      isQuestionAnswerModalOpen: false,
    }),
}));
