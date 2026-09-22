import type { Metadata } from "next";
import Profile from "@/components/Profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Docubox profile and API keys.",
};

export default function Index() {
  return (
    <Profile />
  );
}
