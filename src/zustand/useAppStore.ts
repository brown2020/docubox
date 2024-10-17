import { create } from "zustand";

interface UploadingFile {
  downloadUrl: string;
  fileId: string;
  fileName: string;
  loading: boolean;
  isParsing: boolean;
}

type OnFileAddedCallback = (file: UploadingFile) => void;

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
  setFileId: (fileId: string | null) => void;
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
  } | undefined) => void;

  isQuestionAnswerModalOpen: boolean;
  setQuestionAnswerModalOpen: (isOpen: boolean) => void;

  uploadingFiles: UploadingFile[];
  addUploadingFile: (file: UploadingFile) => void;
  updateUploadingFile: (fileId: string, file: Partial<UploadingFile>) => void;
  removeUploadingFile: (fileId: string) => void;
  onFileAddedCallback: OnFileAddedCallback | null;
  setOnFileAddedCallback: (callback: OnFileAddedCallback | null) => void;
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
  setFileId: (fileId: string | null) => set({ fileId }),
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
  } | undefined) => set({ fileSummary: data }),


  isQuestionAnswerModalOpen: false,
  setQuestionAnswerModalOpen(isOpen) {
    set({ isQuestionAnswerModalOpen: isOpen })
  },

  uploadingFiles: [],
  addUploadingFile: (file) => set((state) => {
    const newState = { uploadingFiles: [...state.uploadingFiles, file] };
    if (state.onFileAddedCallback) {
      state.onFileAddedCallback(file);
    }
    return newState;
  }),

  updateUploadingFile: (fileId, file) => set((state) => ({
    uploadingFiles: state.uploadingFiles.map((f) => (f.fileId === fileId ? { ...f, ...file } : f))
  })),

  removeUploadingFile: (fileId) => set((state) => ({
    uploadingFiles: state.uploadingFiles.filter(file => file.fileId !== fileId)
  })),
  onFileAddedCallback: null,
  setOnFileAddedCallback: (callback: OnFileAddedCallback | null) => set({ onFileAddedCallback: callback }),

}));
