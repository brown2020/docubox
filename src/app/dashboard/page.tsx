"use client";

import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { Trash } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard page component.
 * File data is fetched via real-time subscription in TableWrapper,
 * so we don't need to duplicate the fetch here.
 */
export default function Dashboard() {
  return (
    <div>
      <div className="container mx-auto">
        <Dropzone />
      </div>
      <TableWrapper />
      <Link
        href="/trash"
        className="bg-secondary w-max z-50 rounded-md fixed bottom-16 cursor-pointer right-3 p-3 hover:bg-[#E2E8F0] dark:hover:bg-slate-700"
        aria-label="View trash"
      >
        <Trash size={30} />
      </Link>
    </div>
  );
}

// Note: Metadata is defined in a separate file due to 'use client' directive
// See src/app/dashboard/metadata.ts for page metadata
