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
import { FileType } from "@/types/filetype";
import {
  EyeIcon,
  MessageCircleQuestionIcon,
  TrashIcon,
  UndoIcon,
  FileTerminal,
} from "lucide-react";
import { Button } from "../ui/button";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useUploadStore } from "@/zustand/useUploadStore";
import { DeleteModal } from "../DeleteModal";
import { RenameModal } from "../RenameModal";
import { ShowParsedDataModal } from "../ShowParsedDataModal";
import { File } from "./File";
import { Folder } from "./Folder";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { QuestionAnswerModal } from "../QuestionAnswerModal";
import { downloadUnstructuredFile } from "@/actions/unstructuredActions";
import { TimestampCell, FilenameCell, DownloadCell } from "./cells";

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

  // Use focused stores
  const {
    setIsDeleteModalOpen,
    setIsRenameModalOpen,
    setIsShowParseDataModelOpen,
    setQuestionAnswerModalOpen,
  } = useModalStore();

  const {
    setFileId,
    setFilename,
    setTags,
    setUnstructuredFileData,
    setFileSummary,
    setFolderId,
    setIsFolder,
  } = useFileSelectionStore();

  const { uploadingFiles, addUploadingFile, updateUploadingFile } =
    useUploadStore();
  const openDeleteModal = (
    fileId: string,
    folderId: string | null = null,
    isFolder: boolean = false
  ) => {
    setFileId(fileId);
    setIsDeleteModalOpen(true);
    setFolderId(folderId);
    setIsFolder(isFolder);
  };
  const openParseDataViewModal = async (
    docId: string,
    filedataurl: string,
    summary: string
  ) => {
    setFileId(docId);
    setIsShowParseDataModelOpen(true);
    const data = await downloadUnstructuredFile(filedataurl);
    setUnstructuredFileData(data);
    setFileSummary({ docId, summary });
  };
  const openRenameModal = (
    fileId: string,
    filename: string,
    tags: string[] = []
  ) => {
    setFileId(fileId);
    setFilename(filename);
    setTags(tags);
    setIsRenameModalOpen(true);
  };

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

  const handleOpenQuestionAnswerModal = (fileId: string) => {
    setFileId(fileId);
    setQuestionAnswerModalOpen(true);
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
      <ShowParsedDataModal />
      <DeleteModal />
      <RenameModal />
      <QuestionAnswerModal />
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
            table.getRowModel().rows.map((row) =>
              row.getValue("type") !== "folder" ? (
                <File
                  id={row.getValue("id")}
                  key={"file" + row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const fileData = row.original as FileType;

                    if (cell.column.id === "timestamp") {
                      return (
                        <TimestampCell
                          key={cell.id}
                          timestamp={cell.getValue() as Date}
                        />
                      );
                    }

                    if (cell.column.id === "filename") {
                      return (
                        <FilenameCell
                          key={cell.id}
                          filename={cell.getValue() as string}
                          onEdit={() =>
                            openRenameModal(
                              fileData.docId,
                              fileData.filename,
                              fileData.tags
                            )
                          }
                        />
                      );
                    }

                    if (cell.column.id === "downloadUrl") {
                      return (
                        <DownloadCell
                          key={cell.id}
                          downloadUrl={cell.getValue() as string}
                        />
                      );
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-4 text-gray-600 dark:text-white"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="flex space-x-2 py-2 px-4 justify-end">
                    {isTrashView ? (
                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => {
                          restoreDeletedFile((row.original as FileType).docId);
                        }}
                        className="text-blue-500 hover:bg-blue-100"
                      >
                        <UndoIcon size={20} />
                      </Button>
                    ) : (
                      <div className="flex space-x-2 items-center">
                        {!(row.original as FileType).unstructuredFile && (
                          <Button
                            variant={"outline"}
                            size="icon"
                            className="text-blue-500 hover:bg-blue-100"
                            onClick={() => {
                              handleParsingClick(row.original as FileType);
                            }}
                          >
                            <FileTerminal size={20} />
                          </Button>
                        )}
                        <Button
                          variant={"outline"}
                          size="icon"
                          className="text-blue-500 hover:bg-blue-100"
                          // disabled={!(row.original as FileType).unstructuredFile}
                          onClick={() =>
                            handleOpenQuestionAnswerModal(
                              (row.original as FileType).docId
                            )
                          }
                        >
                          <MessageCircleQuestionIcon size={20} />
                        </Button>
                        <Button
                          variant={"outline"}
                          size="icon"
                          onClick={() => {
                            openParseDataViewModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).unstructuredFile,
                              (row.original as FileType).summary
                            );
                          }}
                          disabled={
                            !(row.original as FileType).unstructuredFile
                          }
                          className={"text-blue-500 hover:bg-blue-100"}
                        >
                          <EyeIcon size={20} />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant={"outline"}
                      size="icon"
                      onClick={() =>
                        openDeleteModal(
                          (row.original as FileType).docId,
                          (row.original as FileType).folderId,
                          (row.original as FileType).type === "folder"
                        )
                      }
                      className="text-red-500 hover:bg-red-100"
                    >
                      <TrashIcon size={20} />
                    </Button>
                  </TableCell>
                </File>
              ) : (
                <Folder
                  id={row.getValue("id")}
                  key={"folder" + row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onDrop={onDrop}
                  isTrashItem={isTrashView}
                >
                  {row.getVisibleCells().map((cell) => {
                    const folderData = row.original as FileType;

                    if (cell.column.id === "timestamp") {
                      return (
                        <TimestampCell
                          key={cell.id}
                          timestamp={cell.getValue() as Date}
                        />
                      );
                    }

                    if (cell.column.id === "filename") {
                      return (
                        <FilenameCell
                          key={cell.id}
                          filename={cell.getValue() as string}
                          onEdit={() =>
                            openRenameModal(
                              folderData.docId,
                              folderData.filename,
                              folderData.tags
                            )
                          }
                        />
                      );
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-4 text-gray-600 dark:text-white"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell
                    key={"actions"}
                    className="flex space-x-2 py-2 px-4 justify-end"
                  >
                    {isTrashView ? (
                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => {
                          restoreDeletedFile((row.original as FileType).docId);
                        }}
                        className="text-blue-500 hover:bg-blue-100"
                      >
                        <UndoIcon size={20} />
                      </Button>
                    ) : (
                      row.getValue("type") !== "folder" && (
                        <Button
                          variant={"outline"}
                          size="icon"
                          onClick={() => {
                            openParseDataViewModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).unstructuredFile,
                              (row.original as FileType).summary
                            );
                          }}
                          className="text-blue-500 hover:bg-blue-100"
                        >
                          <EyeIcon size={20} />
                        </Button>
                      )
                    )}

                    <Button
                      variant={"outline"}
                      size="icon"
                      onClick={() =>
                        openDeleteModal(
                          (row.original as FileType).docId,
                          (row.original as FileType).folderId,
                          (row.original as FileType).type === "folder"
                        )
                      }
                      className="text-red-500 hover:bg-red-100"
                    >
                      <TrashIcon size={20} />
                    </Button>
                  </TableCell>
                </Folder>
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
