"use client";

import { flexRender, useTable, type Row } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FileType, isFolder } from "@/types/filetype";
import { useUser } from "@/components/auth";
import { FileRow, FolderRow } from "./rows";
import { columns as fileColumns, fileTableFeatures } from "./columns";

type FileTableRow = Row<typeof fileTableFeatures, FileType>;

interface DataTableProps {
  columns: typeof fileColumns;
  data: FileType[];
  moveFileHandler: (userId: string, docId: string, folderId: string) => void;
  isTrashView?: boolean;
}

/**
 * Data table component for displaying files and folders.
 * Uses FileActionsContext for modal handlers (no prop drilling).
 */
export function DataTable({
  columns,
  data,
  moveFileHandler,
  isTrashView,
}: DataTableProps) {
  const { user } = useUser();
  const table = useTable({
    features: fileTableFeatures,
    data,
    columns,
  });

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user.id, docId, folderId);
  };

  return (
    <div className="rounded-lg border border-gray-200 shadow-md overflow-hidden">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-white"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) =>
                !isFolder(row.original) ? (
                  <FileRow
                    key={row.id}
                    row={row as FileTableRow}
                    fileData={row.original}
                    isTrashView={isTrashView}
                  />
                ) : (
                  <FolderRow
                    key={row.id}
                    row={row as FileTableRow}
                    folderData={row.original}
                    isTrashView={isTrashView}
                    onDrop={onDrop}
                  />
                )
              )
          ) : (
            <TableRow key="no-found">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-600"
              >
                No files found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
