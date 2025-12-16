import { memo } from "react";
import Link from "next/link";
import { TableCell } from "@/components/ui/table";

interface DownloadCellProps {
  downloadUrl: string;
}

/**
 * Reusable cell component for download links.
 * Memoized to prevent unnecessary re-renders in table.
 */
export const DownloadCell = memo(function DownloadCell({
  downloadUrl,
}: DownloadCellProps) {
  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <Link
        href={downloadUrl}
        target="_blank"
        className="underline text-blue-500 hover:text-blue-700"
      >
        Download
      </Link>
    </TableCell>
  );
});

