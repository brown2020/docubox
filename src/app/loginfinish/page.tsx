"use client"

import { useAuthStore } from "@/zustand/useAuthStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import useProfileStore from "@/zustand/useProfileStore"
import { useUser } from "@clerk/nextjs"

export default function LoginFinishPage() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/dashboard")
      return
    }

    setAuthDetails({
      uid: user?.id,
      authEmail: user?.primaryEmailAddress?.emailAddress,
      authDisplayName: user?.fullName || "",
    })
    updateProfile({ displayName: user?.fullName || "" })
    router.replace("/dashboard")
  }, [isSignedIn, user, router, setAuthDetails, updateProfile])
}
