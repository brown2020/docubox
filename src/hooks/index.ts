/**
 * Custom hooks barrel export.
 * Import hooks from '@/hooks' instead of individual files.
 */

// Authentication & Firebase
export { useFirebaseAuthSync } from "./useFirebaseAuthSync";

// File operations
export { useFileModals } from "./useFileModals";
export { useDocument } from "./useDocument";
export { useDraggableItem } from "./useDraggableItem";

// Profile & API
export { useApiProfileData } from "./useApiProfileData";

// Utilities
export { useCopyToClipboard } from "./useCopyToClipboard";
