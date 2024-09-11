import { create } from "zustand";

interface AppStore {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isDeleteModalOpen: boolean) => void;
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (isRenameModalOpen: boolean) => void;
  isShowParseDataModelOpen: boolean;
  setIsShowParseDataModelOpen: (isShowParseDataModelOpen: boolean) => void;
  fileId: string | null;
  setFileId: (fileId: string) => void;
  filename: string;
  setFilename: (filename: string) => void;
  unstructuredFileData: string;
  setUnstructuredFileData: (unstructuredFileData: string) => void;
}
export const useAppStore = create<AppStore>((set) => ({
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (isDeleteModalOpen: boolean) =>
    set({ isDeleteModalOpen }),
  isRenameModalOpen: false,
  setIsRenameModalOpen: (isRenameModalOpen: boolean) =>
    set({ isRenameModalOpen }),
  isShowParseDataModelOpen: false,
  setIsShowParseDataModelOpen: (isShowParseDataModelOpen: boolean) =>
    set({ isShowParseDataModelOpen }),
  fileId: null,
  setFileId: (fileId: string) => set({ fileId }),
  filename: "",
  setFilename: (filename: string) => set({ filename }),
  
  unstructuredFileData: "",
  setUnstructuredFileData: (unstructuredFileData: string) =>
    set({ unstructuredFileData }),
}));