import { create } from "zustand";

/**
 * Supported modal types in the application.
 */
export type ModalType =
  | "delete"
  | "rename"
  | "parseData"
  | "createFolder"
  | "questionAnswer"
  | null;

/**
 * Modal data that can be passed when opening a modal.
 */
export interface ModalData {
  fileId?: string;
  filename?: string;
  folderId?: string | null;
  isFolder?: boolean;
  tags?: string[];
  unstructuredFileData?: string;
  summary?: string;
  [key: string]: unknown;
}

/**
 * Store for managing modal visibility states.
 * Uses a generic pattern to reduce boilerplate.
 */
interface ModalStore {
  // Current open modal (null if none)
  openModal: ModalType;
  // Data associated with the current modal
  modalData: ModalData;

  // Generic modal actions
  open: (modal: ModalType, data?: ModalData) => void;
  close: () => void;
  updateData: (data: Partial<ModalData>) => void;

  // Legacy compatibility getters (computed from openModal)
  isDeleteModalOpen: boolean;
  isRenameModalOpen: boolean;
  isShowParseDataModelOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isQuestionAnswerModalOpen: boolean;

  // Legacy compatibility setters
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  setIsRenameModalOpen: (isOpen: boolean) => void;
  setIsShowParseDataModelOpen: (isOpen: boolean) => void;
  setIsCreateFolderModalOpen: (isOpen: boolean) => void;
  setQuestionAnswerModalOpen: (isOpen: boolean) => void;

  // Close all modals
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  openModal: null,
  modalData: {},

  // Generic modal actions
  open: (modal, data = {}) => set({ openModal: modal, modalData: data }),
  close: () => set({ openModal: null, modalData: {} }),
  updateData: (data) =>
    set((state) => ({ modalData: { ...state.modalData, ...data } })),

  // Legacy compatibility - computed getters
  get isDeleteModalOpen() {
    return get().openModal === "delete";
  },
  get isRenameModalOpen() {
    return get().openModal === "rename";
  },
  get isShowParseDataModelOpen() {
    return get().openModal === "parseData";
  },
  get isCreateFolderModalOpen() {
    return get().openModal === "createFolder";
  },
  get isQuestionAnswerModalOpen() {
    return get().openModal === "questionAnswer";
  },

  // Legacy compatibility setters
  setIsDeleteModalOpen: (isOpen) =>
    set({
      openModal: isOpen ? "delete" : null,
      modalData: isOpen ? get().modalData : {},
    }),
  setIsRenameModalOpen: (isOpen) =>
    set({
      openModal: isOpen ? "rename" : null,
      modalData: isOpen ? get().modalData : {},
    }),
  setIsShowParseDataModelOpen: (isOpen) =>
    set({
      openModal: isOpen ? "parseData" : null,
      modalData: isOpen ? get().modalData : {},
    }),
  setIsCreateFolderModalOpen: (isOpen) =>
    set({
      openModal: isOpen ? "createFolder" : null,
      modalData: isOpen ? get().modalData : {},
    }),
  setQuestionAnswerModalOpen: (isOpen) =>
    set({
      openModal: isOpen ? "questionAnswer" : null,
      modalData: isOpen ? get().modalData : {},
    }),

  closeAllModals: () => set({ openModal: null, modalData: {} }),
}));
