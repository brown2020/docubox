import { memo } from "react";
import { TableCell } from "@/components/ui/table";

interface TimestampCellProps {
  timestamp: Date;
}

/**
 * Reusable cell component for displaying timestamps.
 * Memoized to prevent unnecessary re-renders in table.
 */
export const TimestampCell = memo(function TimestampCell({
  timestamp,
}: TimestampCellProps) {
  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div className="flex flex-col">
        <div className="text-sm font-medium">
          {timestamp.toLocaleDateString()}
        </div>
        <div className="text-xs text-muted-foreground">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </TableCell>
  );
});

