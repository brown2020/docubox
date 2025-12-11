"use client";

import { Trash } from "lucide-react";
import Link from "next/link";

/**
 * Floating trash link button.
 * Client component for hover interactions.
 */
export function TrashLink() {
  return (
    <Link
      href="/trash"
      className="bg-secondary w-max z-50 rounded-md fixed bottom-16 cursor-pointer right-3 p-3 hover:bg-[#E2E8F0] dark:hover:bg-slate-700"
      aria-label="View trash"
    >
      <Trash size={30} />
    </Link>
  );
}
