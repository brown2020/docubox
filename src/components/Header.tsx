"use client"

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs"
import Link from "next/link"
import { ThemeToggler } from "./ThemeToggler"
import { Button } from "./ui/button"
import { useInitializeStores } from "@/zustand/useInitializeStores"
import { useAuthStore } from "@/zustand/useAuthStore"
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { serverTimestamp, Timestamp } from "firebase/firestore"
import { useEffect } from "react"
import { auth } from "@/firebase/firebaseClient"

export default function Header() {
  useInitializeStores()

  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails)
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails)

  useEffect(() => {
    const syncAuthState = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken({ template: "integration_firebase" })
          const userCredentials = await signInWithCustomToken(auth, token || "")
          console.log("User signed in to Firebase:", userCredentials.user)

          // Update Firebase user profile
          await updateProfile(userCredentials.user, {
            displayName: user.fullName,
            photoURL: user.imageUrl,
          })
          setAuthDetails({
            uid: user.id,
            firebaseUid: userCredentials.user.uid,
            authEmail: user.emailAddresses[0].emailAddress,
            authDisplayName: user.fullName || "",
            authPhotoUrl: user.imageUrl,
            authReady: true,
            lastSignIn: serverTimestamp() as Timestamp,
          })
        } catch (error) {
          console.error("Error signing in with custom token:", error)
          clearAuthDetails()
        }
      } else {
        console.log("User is not signed in with Clerk")
        await firebaseSignOut(auth)
        clearAuthDetails()
      }
    }

    syncAuthState()
  }, [clearAuthDetails, getToken, isSignedIn, setAuthDetails, user])

  return (
    <header className="h-14 flex items-center px-3 sticky top-0 justify-between bg-slate-200 dark:bg-slate-600 p-3">
      <div className="flex gap-x-3">
        <Link href={"/dashboard"}>
          <Button size="sm" className="bg-green-500 hover:bg-green-400">
            Docubox
          </Button>
        </Link>
      </div>

      <div className="flex space-x-2 items-center gap-5">
        <ThemeToggler />
        <SignedIn>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>

          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode={"modal"} />
        </SignedOut>
      </div>
    </header>
  )
}
