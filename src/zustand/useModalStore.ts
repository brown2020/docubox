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
  | "preview"
  | null;

/**
 * Type-safe modal data for delete modal.
 */
export interface DeleteModalData {
  fileId: string;
  folderId?: string | null;
  isFolder?: boolean;
}

/**
 * Type-safe modal data for rename modal.
 */
export interface RenameModalData {
  fileId: string;
  filename: string;
  tags?: string[];
}

/**
 * Type-safe modal data for parse data modal.
 */
export interface ParseDataModalData {
  fileId: string;
  summary?: string;
  unstructuredFileData?: string;
}

/**
 * Type-safe modal data for question answer modal.
 */
export interface QuestionAnswerModalData {
  fileId: string;
}

/**
 * Type-safe modal data for create folder modal.
 */
export interface CreateFolderModalData {
  parentFolderId?: string | null;
}

/**
 * Type-safe modal data for file preview modal.
 */
export interface PreviewModalData {
  fileId: string;
  filename: string;
  downloadUrl: string;
  type: string;
  size: number;
  summary?: string;
}

/**
 * Union of all modal data types for type safety.
 */
export type ModalData =
  | DeleteModalData
  | RenameModalData
  | ParseDataModalData
  | QuestionAnswerModalData
  | CreateFolderModalData
  | PreviewModalData
  | Record<string, unknown>;

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

/**
 * Type-safe selector for delete modal data.
 */
export function useDeleteModalData() {
  return useModalStore((state) => state.modalData as DeleteModalData);
}

/**
 * Type-safe selector for rename modal data.
 */
export function useRenameModalData() {
  return useModalStore((state) => state.modalData as RenameModalData);
}

/**
 * Type-safe selector for parse data modal data.
 */
export function useParseDataModalData() {
  return useModalStore((state) => state.modalData as ParseDataModalData);
}

/**
 * Type-safe selector for question answer modal data.
 */
export function useQuestionAnswerModalData() {
  return useModalStore((state) => state.modalData as QuestionAnswerModalData);
}

/**
 * Type-safe selector for preview modal data.
 */
export function usePreviewModalData() {
  return useModalStore((state) => state.modalData as PreviewModalData);
}
