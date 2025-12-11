import Link from "next/link";
import { TableCell } from "@/components/ui/table";

interface DownloadCellProps {
  downloadUrl: string;
}

/**
 * Reusable cell component for download links.
 */
export function DownloadCell({ downloadUrl }: DownloadCellProps) {
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
}
