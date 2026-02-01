import { db } from "@/firebase";
import { Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { create } from "zustand";
import { logger } from "@/lib/logger";

interface AuthState {
  uid: string;
  firebaseUid: string;
  authEmail: string;
  authDisplayName: string;
  authPhotoUrl: string;
  authEmailVerified: boolean;
  authReady: boolean;
  authPending: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
  isInvited: boolean;
  lastSignIn: Timestamp | null;
  premium: boolean;
  credits: number;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  uid: "",
  firebaseUid: "",
  authEmail: "",
  authDisplayName: "",
  authPhotoUrl: "",
  authEmailVerified: false,
  authReady: false,
  authPending: false,
  isAdmin: false,
  isAllowed: false,
  isInvited: false,
  lastSignIn: null,
  premium: false,
  credits: 0,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...defaultAuthState,

  /**
   * Updates auth details in state.
   * Firestore sync is handled separately via syncAuthToFirestore.
   */
  setAuthDetails: (details: Partial<AuthState>) => {
    set((state) => ({ ...state, ...details }));
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),
}));

/**
 * Syncs auth state to Firestore.
 * Call this externally after auth state changes if you need persistence.
 * Only syncs fields that are explicitly provided (not undefined).
 */
export async function syncAuthToFirestore(
  details: Partial<AuthState>,
  uid: string
): Promise<void> {
  if (!uid) return;

  const userRef = doc(db, `users/${uid}`);

  // Create a sanitized object for Firestore - only include defined values
  // Firebase doesn't accept undefined values, so we filter them out
  const sanitizedDetails: Record<string, unknown> = {
    lastSignIn: serverTimestamp(),
  };

  // Only add fields that are explicitly defined (not undefined)
  if (details.firebaseUid !== undefined) sanitizedDetails.firebaseUid = details.firebaseUid;
  if (details.authEmail !== undefined) sanitizedDetails.authEmail = details.authEmail;
  if (details.authDisplayName !== undefined) sanitizedDetails.authDisplayName = details.authDisplayName;
  if (details.authPhotoUrl !== undefined) sanitizedDetails.authPhotoUrl = details.authPhotoUrl;
  if (details.authEmailVerified !== undefined) sanitizedDetails.authEmailVerified = details.authEmailVerified;
  if (details.authReady !== undefined) sanitizedDetails.authReady = details.authReady;
  if (details.authPending !== undefined) sanitizedDetails.authPending = details.authPending;
  if (details.isAdmin !== undefined) sanitizedDetails.isAdmin = details.isAdmin;
  if (details.isAllowed !== undefined) sanitizedDetails.isAllowed = details.isAllowed;
  if (details.isInvited !== undefined) sanitizedDetails.isInvited = details.isInvited;
  if (details.premium !== undefined) sanitizedDetails.premium = details.premium;
  if (details.credits !== undefined) sanitizedDetails.credits = details.credits;

  try {
    await setDoc(userRef, sanitizedDetails, { merge: true });
  } catch (error) {
    logger.error("useAuthStore", "Error syncing to Firestore", error);
  }
}
