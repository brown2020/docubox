"use client";

import { FileType } from "@/types/filetype";
import { Row, flexRender } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { TableCell } from "../../ui/table";
import { File } from "../File";
import { TimestampCell, FilenameCell, DownloadCell } from "../cells";
import {
  EyeIcon,
  FileTerminal,
  MessageCircleQuestionIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";

interface FileRowProps {
  row: Row<FileType>;
  fileData: FileType;
  isTrashView?: boolean;
  openRenameModal: (fileId: string, filename: string, tags: string[]) => void;
  openDeleteModal: (
    fileId: string,
    folderId: string | null,
    isFolder: boolean
  ) => void;
  openParseDataViewModal: (
    docId: string,
    filedataurl: string,
    summary: string
  ) => void;
  handleOpenQuestionAnswerModal: (fileId: string) => void;
  handleParsingClick: (file: FileType) => void;
  restoreDeletedFile: (fileId: string) => Promise<void>;
}

export function FileRow({
  row,
  fileData,
  isTrashView,
  openRenameModal,
  openDeleteModal,
  openParseDataViewModal,
  handleOpenQuestionAnswerModal,
  handleParsingClick,
  restoreDeletedFile,
}: FileRowProps) {
  return (
    <File
      id={row.getValue("id")}
      key={"file" + row.id}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "timestamp") {
          return (
            <TimestampCell key={cell.id} timestamp={cell.getValue() as Date} />
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
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
      <TableCell className="flex space-x-2 py-2 px-4 justify-end">
        {isTrashView ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => restoreDeletedFile(fileData.docId)}
            className="text-blue-500 hover:bg-blue-100"
          >
            <UndoIcon size={20} />
          </Button>
        ) : (
          <div className="flex space-x-2 items-center">
            {!fileData.unstructuredFile && (
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500 hover:bg-blue-100"
                onClick={() => handleParsingClick(fileData)}
              >
                <FileTerminal size={20} />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="text-blue-500 hover:bg-blue-100"
              onClick={() => handleOpenQuestionAnswerModal(fileData.docId)}
            >
              <MessageCircleQuestionIcon size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                openParseDataViewModal(
                  fileData.docId,
                  fileData.unstructuredFile,
                  fileData.summary
                )
              }
              disabled={!fileData.unstructuredFile}
              className="text-blue-500 hover:bg-blue-100"
            >
              <EyeIcon size={20} />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDeleteModal(fileData.docId, fileData.folderId ?? null, false)
          }
          className="text-red-500 hover:bg-red-100"
        >
          <TrashIcon size={20} />
        </Button>
      </TableCell>
    </File>
  );
}
