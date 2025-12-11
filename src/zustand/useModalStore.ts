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
 * Lean modal store - single source of truth for modal state.
 */
interface ModalStore {
  openModal: ModalType;
  modalData: ModalData;
  open: (modal: ModalType, data?: ModalData) => void;
  close: () => void;
  updateData: (data: Partial<ModalData>) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  openModal: null,
  modalData: {},
  open: (modal, data = {}) => set({ openModal: modal, modalData: data }),
  close: () => set({ openModal: null, modalData: {} }),
  updateData: (data) =>
    set((state) => ({ modalData: { ...state.modalData, ...data } })),
}));

/**
 * Selector hook for checking if a specific modal is open.
 * Use this instead of accessing openModal directly.
 */
export function useIsModalOpen(modalType: ModalType) {
  return useModalStore((state) => state.openModal === modalType);
}

/**
 * Selector hook for getting modal data with type safety.
 */
export function useModalData<T extends ModalData>() {
  return useModalStore((state) => state.modalData as T);
}
