import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account settings, API keys, and credits.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
