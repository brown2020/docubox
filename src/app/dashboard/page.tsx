import { Suspense } from "react";
import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { TrashLink } from "@/components/TrashLink";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col px-4">
      <Skeleton className="w-full h-52 my-4 rounded-lg" />
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
 * File data is fetched via real-time subscription in TableWrapper.
 * Wrapped in Suspense for useSearchParams in TableWrapper.
 */
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="container mx-auto">
          <Dropzone />
        </div>
        <TableWrapper />
      </Suspense>
      <TrashLink />
    </div>
  );
}
