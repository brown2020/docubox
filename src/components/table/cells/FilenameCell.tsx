import { PencilIcon } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface FilenameCellProps {
  filename: string;
  onEdit: () => void;
}

/**
 * Reusable cell component for displaying editable filenames.
 */
export function FilenameCell({ filename, onEdit }: FilenameCellProps) {
  return (
    <TableCell className="py-2 px-4 text-gray-600 dark:text-white">
      <div
        onClick={onEdit}
        className="flex items-center text-blue-600 hover:underline cursor-pointer gap-2"
      >
        <div>{filename}</div>
        <PencilIcon size={15} className="ml-2" />
      </div>
    </TableCell>
  );
}

