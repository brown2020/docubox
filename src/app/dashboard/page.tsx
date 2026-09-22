import { Suspense } from "react";
import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { TrashLink } from "@/components/TrashLink";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <section className="flex flex-col gap-4 px-4" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="overflow-hidden rounded-lg border">
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-16 w-full rounded-none border-t" />
        <Skeleton className="h-16 w-full rounded-none border-t" />
        <Skeleton className="h-16 w-full rounded-none border-t" />
      </div>
    </section>
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
