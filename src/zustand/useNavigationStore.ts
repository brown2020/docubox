import { create } from "zustand";

/**
 * Store for folder navigation state.
 * Separated from file selection to keep concerns focused.
 */
interface NavigationStore {
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  folderId: null,
  setFolderId: (folderId) => set({ folderId }),
}));
