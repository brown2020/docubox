import { memo } from "react";
import { PencilIcon } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface FilenameCellProps {
  filename: string;
  onEdit?: () => void;
  onPreview?: () => void;
}

/**
 * Reusable cell component for displaying filenames.
 * Clicking the name opens preview; the pencil icon opens rename.
 * Memoized to prevent unnecessary re-renders in table.
 */
export const FilenameCell = memo(function FilenameCell({
  filename,
  onEdit,
  onPreview,
}: FilenameCellProps) {
  const isClickable = !!onPreview || !!onEdit;
  const handlePrimary = onPreview ?? onEdit;

  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div className="flex items-center gap-2">
        {isClickable && handlePrimary ? (
          <button
            type="button"
            onClick={handlePrimary}
            className="truncate max-w-[200px] text-left text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0 font-inherit"
          >
            {filename}
          </button>
        ) : (
          <span className="truncate max-w-[200px] text-gray-600 dark:text-white">
            {filename}
          </span>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Rename file"
          >
            <PencilIcon size={14} />
          </button>
        )}
      </div>
    </TableCell>
  );
});
