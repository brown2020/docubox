import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { TrashLink } from "@/components/TrashLink";

/**
 * Dashboard page component (Server Component).
 * File data is fetched via real-time subscription in TableWrapper.
 */
export default function Dashboard() {
  return (
    <div>
      <div className="container mx-auto">
        <Dropzone />
      </div>
      <TableWrapper />
      <TrashLink />
    </div>
  );
}
