import { memo } from "react";
import { PencilIcon } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface FilenameCellProps {
  filename: string;
  onEdit?: () => void;
}

/**
 * Reusable cell component for displaying editable filenames.
 * Memoized to prevent unnecessary re-renders in table.
 */
export const FilenameCell = memo(function FilenameCell({
  filename,
  onEdit,
}: FilenameCellProps) {
  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div
        onClick={onEdit}
        className={`flex items-center gap-2 ${
          onEdit
            ? "text-blue-600 hover:underline cursor-pointer"
            : "text-gray-600 dark:text-white"
        }`}
      >
        <span className="truncate max-w-[200px]">{filename}</span>
        {onEdit && <PencilIcon size={15} className="shrink-0" />}
      </div>
    </TableCell>
  );
});
