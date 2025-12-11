import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trash",
  description:
    "View and manage deleted files. Restore or permanently delete items.",
};

export default function TrashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
