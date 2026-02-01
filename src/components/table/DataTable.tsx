"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  moveFileHandler: (userId: string, docId: string, folderId: string) => void;
  isTrashView?: boolean;
}

/**
 * Data table component for displaying files and folders.
 * Uses FileActionsContext for modal handlers (no prop drilling).
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  moveFileHandler,
  isTrashView,
}: DataTableProps<TData, TValue>) {
  const { user } = useUser();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={`header-${index}${header.id}`}
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
                !isFolder(row.original as FileType) ? (
                  <FileRow
                    key={row.id}
                    row={row as Row<FileType>}
                    fileData={row.original as FileType}
                    isTrashView={isTrashView}
                  />
                ) : (
                  <FolderRow
                    key={row.id}
                    row={row as Row<FileType>}
                    folderData={row.original as FileType}
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
