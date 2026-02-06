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

  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div className="flex items-center gap-2">
        <span
          onClick={onPreview ?? onEdit}
          className={`truncate max-w-[200px] ${
            isClickable
              ? "text-blue-600 hover:underline cursor-pointer"
              : "text-gray-600 dark:text-white"
          }`}
        >
          {filename}
        </span>
        {onEdit && (
          <button
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
