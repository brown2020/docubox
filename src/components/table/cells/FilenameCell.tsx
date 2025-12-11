import { PencilIcon } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface FilenameCellProps {
  filename: string;
  onEdit?: () => void;
}

/**
 * Reusable cell component for displaying editable filenames.
 */
export function FilenameCell({ filename, onEdit }: FilenameCellProps) {
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
        <div>{filename}</div>
        {onEdit && <PencilIcon size={15} className="ml-2" />}
      </div>
    </TableCell>
  );
}
