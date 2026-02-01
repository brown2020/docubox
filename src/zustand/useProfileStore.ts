import { create } from "zustand";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase";
import { logger } from "@/lib/logger";

/**
 * User profile type with API keys and credit information.
 */
export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
  unstructured_api_key: string;
  openai_api_key: string;
  ragie_api_key: string;
  useCredits: boolean;
}

const defaultProfile: ProfileType = {
  email: "",
  contactEmail: "",
  displayName: "",
  photoUrl: "",
  emailVerified: false,
  credits: 0,
  unstructured_api_key: "",
  openai_api_key: "",
  ragie_api_key: "",
  useCredits: true,
};

const DEFAULT_INITIAL_CREDITS = 1000;

interface AuthState {
  authEmail?: string;
  authDisplayName?: string;
  authPhotoUrl?: string;
  authEmailVerified?: boolean;
}

export interface ProfileState {
  profile: ProfileType;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (
    newProfile: Partial<ProfileType>,
    onError?: (error: Error) => void
  ) => Promise<void>;
  addCredits: (amount: number, onError?: (error: Error) => void) => Promise<void>;
  minusCredits: (amount: number, onError?: (error: Error) => void) => Promise<boolean>;
}

/**
 * Merges profile data with defaults and auth state.
 */
function mergeProfileWithDefaults(
  profile: Partial<ProfileType>,
  authState: AuthState
): ProfileType {
  return {
    ...defaultProfile,
    ...profile,
    credits:
      profile.credits && profile.credits >= 100
        ? profile.credits
        : DEFAULT_INITIAL_CREDITS,
    email: authState.authEmail || profile.email || "",
    contactEmail: profile.contactEmail || authState.authEmail || "",
    displayName: profile.displayName || authState.authDisplayName || "",
    photoUrl: profile.photoUrl || authState.authPhotoUrl || "",
  };
}

/**
 * Gets the Firestore reference for the user's profile document.
 */
function getProfileRef(uid: string) {
  return doc(db, `users/${uid}/profile/userData`);
}

const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    const { uid, authEmail, authDisplayName, authPhotoUrl, authEmailVerified } =
      useAuthStore.getState();

    if (!uid) return;

    set({ isLoading: true, error: null });

    try {
      const userRef = getProfileRef(uid);
      const docSnap = await getDoc(userRef);

      let newProfile: ProfileType;

      if (docSnap.exists()) {
        newProfile = mergeProfileWithDefaults(docSnap.data() as ProfileType, {
          authEmail,
          authDisplayName,
          authPhotoUrl,
          authEmailVerified,
        });
      } else {
        // Create new profile for first-time users
        newProfile = {
          email: authEmail || "",
          contactEmail: "",
          displayName: authDisplayName || "",
          photoUrl: authPhotoUrl || "",
          emailVerified: authEmailVerified || false,
          credits: DEFAULT_INITIAL_CREDITS,
          openai_api_key: "",
          ragie_api_key: "",
          unstructured_api_key: "",
          useCredits: true,
        };
      }

      await setDoc(userRef, newProfile);
      set({ profile: newProfile, isLoading: false });
    } catch (error) {
      logger.error("useProfileStore", "Error fetching profile", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      });
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>, onError?: (error: Error) => void) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    const previousProfile = get().profile;

    try {
      const userRef = getProfileRef(uid);
      const updatedProfile = { ...previousProfile, ...newProfile };

      // Optimistic update
      set({ profile: updatedProfile, error: null });
      await updateDoc(userRef, updatedProfile);
    } catch (error) {
      logger.error("useProfileStore", "Error updating profile", error);

      // Revert to previous state
      set({ profile: previousProfile });

      // Refetch to ensure consistency with server
      await get().fetchProfile();

      // Notify caller of error
      const err = error instanceof Error ? error : new Error("Failed to update profile");
      onError?.(err);
    }
  },

  addCredits: async (amount: number, onError?: (error: Error) => void) => {
    const uid = useAuthStore.getState().uid;
    if (!uid || amount <= 0) return;

    const previousProfile = get().profile;
    const newCredits = previousProfile.credits + amount;

    try {
      const userRef = getProfileRef(uid);

      // Optimistic update
      set({ profile: { ...previousProfile, credits: newCredits }, error: null });
      await updateDoc(userRef, { credits: newCredits });
    } catch (error) {
      logger.error("useProfileStore", "Error adding credits", error);

      // Revert to previous state
      set({ profile: previousProfile });

      // Refetch to ensure consistency
      await get().fetchProfile();

      // Notify caller of error
      const err = error instanceof Error ? error : new Error("Failed to add credits");
      onError?.(err);
    }
  },

  minusCredits: async (amount: number, onError?: (error: Error) => void) => {
    const uid = useAuthStore.getState().uid;
    if (!uid || amount <= 0) return false;

    const previousProfile = get().profile;
    if (previousProfile.credits < amount) {
      return false;
    }

    const newCredits = previousProfile.credits - amount;

    try {
      const userRef = getProfileRef(uid);

      // Optimistic update
      set({ profile: { ...previousProfile, credits: newCredits }, error: null });
      await updateDoc(userRef, { credits: newCredits });
      return true;
    } catch (error) {
      logger.error("useProfileStore", "Error deducting credits", error);

      // Revert to previous state
      set({ profile: previousProfile });

      // Refetch to ensure consistency
      await get().fetchProfile();

      // Notify caller of error
      const err = error instanceof Error ? error : new Error("Failed to deduct credits");
      onError?.(err);
      return false;
    }
  },
}));

export default useProfileStore;
