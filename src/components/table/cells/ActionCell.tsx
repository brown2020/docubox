"use client";

import { memo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { TrashIcon, UndoIcon } from "lucide-react";

interface ActionCellProps {
  /** ID of the file/folder */
  fileId: string;
  /** Whether this item is in trash view */
  isTrashView?: boolean;
  /** Callback to restore item from trash */
  onRestore?: () => Promise<void> | void;
  /** Callback to delete item */
  onDelete: () => void;
  /** Additional action buttons to render (before delete button) */
  additionalActions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Shared action cell component for file/folder table rows.
 * Consolidates the action button pattern used in FileRow and FolderRow.
 */
export const ActionCell = memo(function ActionCell({
  isTrashView,
  onRestore,
  onDelete,
  additionalActions,
  className = "",
}: ActionCellProps) {
  return (
    <TableCell className={`flex space-x-2 py-2 px-4 justify-end ${className}`}>
      {isTrashView && onRestore && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRestore}
          className="text-blue-500 hover:bg-blue-100"
          aria-label="Restore item"
        >
          <UndoIcon size={20} />
        </Button>
      )}
      {!isTrashView && additionalActions}
      <Button
        variant="outline"
        size="icon"
        onClick={onDelete}
        className="text-red-500 hover:bg-red-100"
        aria-label="Delete item"
      >
        <TrashIcon size={20} />
      </Button>
    </TableCell>
  );
});
