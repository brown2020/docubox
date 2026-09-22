import type { Metadata } from "next";
import TrashClient from "./TrashClient";

export const metadata: Metadata = {
  title: "Trash",
  description: "Restore or permanently delete Docubox files.",
};

export default function TrashPage() {
  return <TrashClient />;
}
