"use client";

import { useUser, useAuth } from "./FirebaseAuthProvider";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { logger } from "@/lib/logger";

/**
 * User menu component - replaces Clerk's UserButton.
 * Shows avatar with dropdown menu for profile and sign out.
 */
export function UserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!isLoaded || !user) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.primaryEmailAddress?.emailAddress.charAt(0).toUpperCase() ?? "U";

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      logger.error("UserMenu", "Sign out failed", error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer focus:outline-none">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={user.imageUrl ?? undefined}
            alt={user.fullName ?? "User"}
          />
          <AvatarFallback className="bg-green-500 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.fullName ?? "User"}</p>
          <p className="text-xs text-gray-500 truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
