import { create } from "zustand";

interface AppStore {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isDeleteModalOpen: boolean) => void;
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (isRenameModalOpen: boolean) => void;
  isShowParseDataModelOpen: boolean;
  setIsShowParseDataModelOpen: (isShowParseDataModelOpen: boolean) => void;
  isCreateFolderModalOpen: boolean;
  setIsCreateFolderModalOpen: (isRenameModalOpen: boolean) => void;
  fileId: string | null;
  setFileId: (fileId: string) => void;
  filename: string;
  setFilename: (filename: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  isFolder: boolean;
  setIsFolder: (isFolder: boolean) => void;
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;
  unstructuredFileData: string;
  setUnstructuredFileData: (unstructuredFileData: string) => void;
  fileSummary:
    | {
        docId: string;
        summary: string;
      }
    | undefined;
  setFileSummary: (data: {
    docId: string;
    summary: string;
  }) => void;
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
  isCreateFolderModalOpen: false,
  setIsCreateFolderModalOpen: (isCreateFolderModalOpen: boolean) => set({ isCreateFolderModalOpen }),
  filename: "",
  tags: [],
  setTags: (tags: string[]) => set({ tags: tags }),
  setFilename: (filename: string) => set({ filename }),

  unstructuredFileData: "",
  setUnstructuredFileData: (unstructuredFileData: string) =>
    set({ unstructuredFileData }),

  fileSummary: undefined,
  isFolder: false,
  setIsFolder: (isFolder: boolean = false) => set({ isFolder }),
  folderId: null,
  setFolderId: (folderId: string | null) => set({ folderId }),
  setFileSummary: (data: {
    docId: string;
    summary: string;
  }) => set({ fileSummary: data }),
}));
