import { db } from "@/firebase";
import { Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { create } from "zustand";

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
 */
export async function syncAuthToFirestore(
  details: Partial<AuthState>,
  uid: string
): Promise<void> {
  if (!uid) return;

  const userRef = doc(db, `users/${uid}`);

  // Create a sanitized object for Firestore
  const sanitizedDetails = {
    firebaseUid: details.firebaseUid,
    authEmail: details.authEmail,
    authDisplayName: details.authDisplayName,
    authPhotoUrl: details.authPhotoUrl,
    authEmailVerified: details.authEmailVerified,
    authReady: details.authReady,
    authPending: details.authPending,
    isAdmin: details.isAdmin,
    isAllowed: details.isAllowed,
    isInvited: details.isInvited,
    premium: details.premium,
    credits: details.credits,
    lastSignIn: serverTimestamp(),
  };

  try {
    await setDoc(userRef, sanitizedDetails, { merge: true });
  } catch (error) {
    console.error("[syncAuthToFirestore] Error:", error);
  }
}
