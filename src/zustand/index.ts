// Re-export all stores from a central location
export { useAuthStore, syncAuthToFirestore } from "./useAuthStore";
export {
  default as useProfileStore,
  type ProfileType,
  type ProfileState,
} from "./useProfileStore";
export { useModalStore } from "./useModalStore";
export { useFileSelectionStore } from "./useFileSelectionStore";
export { useUploadStore, type UploadingFile } from "./useUploadStore";
export { useInitializeStores } from "./useInitializeStores";

// Backwards compatibility - deprecated
export { useAppStore } from "./useAppStore";
