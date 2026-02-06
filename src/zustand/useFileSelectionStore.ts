import { create } from "zustand";

/**
 * Store for managing bulk file selection state.
 * Used by the file table/grid for multi-select operations (delete, move, download).
 */
interface FileSelectionStore {
  /** Set of currently selected file IDs */
  selectedFileIds: Set<string>;

  /** Toggle a single file's selection state */
  toggleFile: (fileId: string) => void;

  /** Select all files by their IDs */
  selectAll: (fileIds: string[]) => void;

  /** Clear all selections */
  clearSelection: () => void;

  /** Check if a specific file is selected */
  isSelected: (fileId: string) => boolean;
}

export const useFileSelectionStore = create<FileSelectionStore>((set, get) => ({
  selectedFileIds: new Set<string>(),

  toggleFile: (fileId) =>
    set((state) => {
      const next = new Set(state.selectedFileIds);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return { selectedFileIds: next };
    }),

  selectAll: (fileIds) =>
    set({ selectedFileIds: new Set(fileIds) }),

  clearSelection: () =>
    set({ selectedFileIds: new Set<string>() }),

  isSelected: (fileId) => get().selectedFileIds.has(fileId),
}));
