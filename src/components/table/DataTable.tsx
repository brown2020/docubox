"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FileType } from "@/typings/filetype";
import { PencilIcon, TrashIcon, FileTypeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useAppStore } from "@/zustand/useAppStore";
import { DeleteModal } from "../DeleteModal";
import { RenameModal } from "../RenameModal";
import { useState } from "react";

// Modal component to show parsed text
function ViewFileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white/20"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg min-w-[500px]" // Ensure min-width is set to 'min-w-md' or equivalent
        onClick={(e) => e.stopPropagation()} // Prevent click inside the modal from closing it
      >
        <h2 className="text-lg font-bold mb-4">File Content</h2>
        <p>parsed text</p> {/* Placeholder for parsed text */}
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { setFileId, setFilename, setIsDeleteModalOpen, setIsRenameModalOpen } =
    useAppStore();

  const [isViewFileModalOpen, setIsViewFileModalOpen] = useState(false); // State for ViewFileModal

  const openDeleteModal = (fileId: string) => {
    setFileId(fileId);
    setIsDeleteModalOpen(true);
    console.log("delete", fileId);
  };

  const openRenameModal = (fileId: string, filename: string) => {
    setFileId(fileId);
    setFilename(filename);
    setIsRenameModalOpen(true);
    console.log("rename", fileId, filename);
  };

  const openViewFileModal = () => {
    setIsViewFileModalOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                <DeleteModal />
                <RenameModal />
                <ViewFileModal
                  isOpen={isViewFileModalOpen}
                  onClose={() => setIsViewFileModalOpen(false)}
                />
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.column.id === "timestamp" ? (
                      <div className="flex flex-col">
                        <div className="text-sm">
                          {(cell.getValue() as Date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(cell.getValue() as Date).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : cell.column.id === "filename" ? (
                      <div
                        onClick={() => {
                          openRenameModal(
                            (row.original as FileType).id,
                            (row.original as FileType).filename
                          );
                        }}
                        className="flex underline items-center text-blue-500 hover:cursor-pointer gap-2"
                      >
                        <div>{cell.getValue() as string}</div>
                        <PencilIcon size={15} className="ml-2 flex-shrink-0" />
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell key={(row.original as FileType).id}>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        openViewFileModal();
                      }}
                    >
                      <FileTypeIcon size={20} />
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        openDeleteModal((row.original as FileType).id);
                      }}
                    >
                      <TrashIcon size={20} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                You have no files.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
