"use client";

import { memo } from "react";
import { FileType, isParsed } from "@/types/filetype";
import { Row } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { File } from "../File";
import { renderTableCell } from "../utils/renderCell";
import { ActionCell } from "../cells/ActionCell";
import { EyeIcon, FileTerminal, MessageCircleQuestionIcon } from "lucide-react";

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

export const FileRow = memo(function FileRow({
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
  const hasParsedData = isParsed(fileData);

  return (
    <File
      id={row.getValue("id")}
      key={"file" + row.id}
      data-state={row.getIsSelected() && "selected"}
      isTrashItem={isTrashView}
    >
      {row.getVisibleCells().map((cell) =>
        renderTableCell(cell, {
          onEditFilename: () =>
            openRenameModal(fileData.docId, fileData.filename, fileData.tags),
          showDownload: true,
        })
      )}
      <ActionCell
        fileId={fileData.docId}
        isTrashView={isTrashView}
        onRestore={() => restoreDeletedFile(fileData.docId)}
        onDelete={() =>
          openDeleteModal(fileData.docId, fileData.folderId ?? null, false)
        }
        additionalActions={
          <div className="flex space-x-2 items-center">
            {!hasParsedData && (
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500 hover:bg-blue-100"
                onClick={() => handleParsingClick(fileData)}
                aria-label="Parse file"
              >
                <FileTerminal size={20} />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="text-blue-500 hover:bg-blue-100"
              onClick={() => handleOpenQuestionAnswerModal(fileData.docId)}
              aria-label="Ask questions"
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
              disabled={!hasParsedData}
              className="text-blue-500 hover:bg-blue-100"
              aria-label="View parsed data"
            >
              <EyeIcon size={20} />
            </Button>
          </div>
        }
      />
    </File>
  );
});
