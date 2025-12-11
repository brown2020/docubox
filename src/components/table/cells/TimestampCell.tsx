import { TableCell } from "@/components/ui/table";

interface TimestampCellProps {
  timestamp: Date;
}

/**
 * Reusable cell component for displaying timestamps.
 */
export function TimestampCell({ timestamp }: TimestampCellProps) {
  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div className="flex flex-col">
        <div className="text-sm font-medium">
          {timestamp.toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-white">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </TableCell>
  );
}
