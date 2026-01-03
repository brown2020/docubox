import { create } from "zustand";

/**
 * Represents a file currently being uploaded.
 */
export interface UploadingFile {
  downloadUrl: string;
  fileId: string;
  fileName: string;
  loading: boolean;
  isParsing: boolean;
}

type OnFileAddedCallback = (file: UploadingFile) => void;

/**
 * Store for managing file upload state and progress.
 */
interface UploadStore {
  uploadingFiles: UploadingFile[];
  addUploadingFile: (file: UploadingFile) => void;
  updateUploadingFile: (
    fileId: string,
    updates: Partial<UploadingFile>
  ) => void;
  removeUploadingFile: (fileId: string) => void;
  clearUploadingFiles: () => void;

  // Callback for when a file is added (used by FileUploadModal)
  onFileAddedCallback: OnFileAddedCallback | null;
  setOnFileAddedCallback: (callback: OnFileAddedCallback | null) => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploadingFiles: [],

  addUploadingFile: (file) => {
    set((state) => ({
      uploadingFiles: [...state.uploadingFiles, file],
    }));

    // Call the callback if registered
    const callback = get().onFileAddedCallback;
    if (callback) {
      callback(file);
    }
  },

  updateUploadingFile: (fileId, updates) =>
    set((state) => ({
      uploadingFiles: state.uploadingFiles.map((f) =>
        f.fileId === fileId ? { ...f, ...updates } : f
      ),
    })),

  removeUploadingFile: (fileId) =>
    set((state) => ({
      uploadingFiles: state.uploadingFiles.filter((f) => f.fileId !== fileId),
    })),

  clearUploadingFiles: () => set({ uploadingFiles: [] }),

  onFileAddedCallback: null,
  setOnFileAddedCallback: (callback) => set({ onFileAddedCallback: callback }),
}));




