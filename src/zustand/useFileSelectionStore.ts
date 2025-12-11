import { create } from "zustand";

/**
 * Store for managing currently selected file/folder state.
 * Used by modals and other components that need to know what's selected.
 */
interface FileSelectionStore {
  // Selected file info
  fileId: string | null;
  setFileId: (fileId: string | null) => void;

  filename: string;
  setFilename: (filename: string) => void;

  tags: string[];
  setTags: (tags: string[]) => void;

  // Folder navigation
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;

  isFolder: boolean;
  setIsFolder: (isFolder: boolean) => void;

  // Parsed file data
  unstructuredFileData: string;
  setUnstructuredFileData: (data: string) => void;

  fileSummary:
    | {
        docId: string;
        summary: string;
      }
    | undefined;
  setFileSummary: (
    data:
      | {
          docId: string;
          summary: string;
        }
      | undefined
  ) => void;

  // Clear selection
  clearSelection: () => void;
}

export const useFileSelectionStore = create<FileSelectionStore>((set) => ({
  fileId: null,
  setFileId: (fileId) => set({ fileId }),

  filename: "",
  setFilename: (filename) => set({ filename }),

  tags: [],
  setTags: (tags) => set({ tags }),

  folderId: null,
  setFolderId: (folderId) => set({ folderId }),

  isFolder: false,
  setIsFolder: (isFolder) => set({ isFolder }),

  unstructuredFileData: "",
  setUnstructuredFileData: (data) => set({ unstructuredFileData: data }),

  fileSummary: undefined,
  setFileSummary: (data) => set({ fileSummary: data }),

  clearSelection: () =>
    set({
      fileId: null,
      filename: "",
      tags: [],
      isFolder: false,
      unstructuredFileData: "",
      fileSummary: undefined,
    }),
}));

