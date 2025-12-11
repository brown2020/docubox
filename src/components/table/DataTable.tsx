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
import { FileType } from "@/types/filetype";
import { useUploadStore } from "@/zustand/useUploadStore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { FileRow, FolderRow } from "./rows";
import { useFileModals } from "@/hooks";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  moveFileHandler: (userId: string, docId: string, folderId: string) => void;
  isTrashView?: boolean;
}

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

  // Use shared modal handlers
  const {
    openDeleteModal,
    openRenameModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
  } = useFileModals();

  const { uploadingFiles, addUploadingFile, updateUploadingFile } =
    useUploadStore();

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user?.id, docId, folderId);
  };

  const restoreDeletedFile = async (fileId: string) => {
    if (user) {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        deletedAt: null,
      });
    }
  };

  const handleParsingClick = (file: FileType) => {
    if (uploadingFiles.find((f) => f.fileId === file.docId)) {
      updateUploadingFile(file.docId, { isParsing: true });
      setTimeout(() => {
        updateUploadingFile(file.docId, { isParsing: false });
      }, 2000);
    } else {
      addUploadingFile({
        fileId: file.docId,
        fileName: file.filename,
        downloadUrl: file.downloadUrl,
        loading: true,
        isParsing: false,
      });
    }
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
                row.getValue("type") !== "folder" ? (
                  <FileRow
                    key={row.id}
                    row={row as Row<FileType>}
                    fileData={row.original as FileType}
                    isTrashView={isTrashView}
                    openRenameModal={openRenameModal}
                    openDeleteModal={openDeleteModal}
                    openParseDataViewModal={openParseDataViewModal}
                    handleOpenQuestionAnswerModal={openQuestionAnswerModal}
                    handleParsingClick={handleParsingClick}
                    restoreDeletedFile={restoreDeletedFile}
                  />
                ) : (
                  <FolderRow
                    key={row.id}
                    row={row as Row<FileType>}
                    folderData={row.original as FileType}
                    isTrashView={isTrashView}
                    openRenameModal={openRenameModal}
                    openDeleteModal={openDeleteModal}
                    onDrop={onDrop}
                    restoreDeletedFile={restoreDeletedFile}
                  />
                )
              )
          ) : (
            <TableRow key={"no Found"}>
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
