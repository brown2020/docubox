import { Suspense } from "react";
import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { TrashLink } from "@/components/TrashLink";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col px-4 gap-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="border rounded-lg">
        <div className="border-b h-12" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 w-full">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard page component (Server Component).
 * Dropzone provides drag-overlay + upload button (no permanent drop area).
 * TableWrapper handles the toolbar, file list, and all controls.
 */
export default function Dashboard() {
  return (
    <div className="pt-2">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dropzone />
        <TableWrapper />
      </Suspense>
      <TrashLink />
    </div>
  );
}
