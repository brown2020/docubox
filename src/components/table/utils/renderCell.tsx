"use client";

import { Cell, flexRender } from "@tanstack/react-table";
import { TableCell } from "../../ui/table";
import { TimestampCell, FilenameCell, DownloadCell } from "../cells";
import { FileType } from "@/types/filetype";

interface RenderCellOptions {
  /** Callback when filename edit is triggered */
  onEditFilename?: () => void;
  /** Callback when filename is clicked for preview */
  onPreview?: () => void;
  /** Whether to show download cell (files only, not folders) */
  showDownload?: boolean;
}

/**
 * Renders a table cell based on the column ID.
 * Consolidates cell rendering logic used by FileRow and FolderRow.
 *
 * @param cell - The tanstack table cell to render
 * @param options - Optional configuration for cell rendering
 * @returns The rendered cell component
 */
export function renderTableCell(
  cell: Cell<FileType, unknown>,
  options: RenderCellOptions = {}
): React.ReactNode {
  const { onEditFilename, onPreview, showDownload = true } = options;
  const columnId = cell.column.id;

  switch (columnId) {
    case "timestamp":
      return (
        <TimestampCell key={cell.id} timestamp={cell.getValue() as Date} />
      );

    case "filename":
      return (
        <FilenameCell
          key={cell.id}
          filename={cell.getValue() as string}
          onEdit={onEditFilename}
          onPreview={onPreview}
        />
      );

    case "downloadUrl":
      if (!showDownload) {
        return (
          <TableCell
            key={cell.id}
            className="py-2 px-4 text-gray-600 dark:text-white"
          />
        );
      }
      return (
        <DownloadCell key={cell.id} downloadUrl={cell.getValue() as string} />
      );

    default:
      return (
        <TableCell
          key={cell.id}
          className="py-2 px-4 text-gray-600 dark:text-white"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      );
  }
}
