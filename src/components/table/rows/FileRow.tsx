"use client";

import { memo } from "react";
import { FileType, isParsed } from "@/types/filetype";
import { Row } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { File } from "../File";
import { renderTableCell } from "../utils/renderCell";
import { ActionCell } from "../cells/ActionCell";
import { useFileActions } from "../FileActionsContext";
import { useModalStore } from "@/zustand/useModalStore";
import { EyeIcon, FileTerminal, MessageCircleQuestionIcon } from "lucide-react";

interface FileRowProps {
  row: Row<FileType>;
  fileData: FileType;
  isTrashView?: boolean;
}

/**
 * File row component using FileActionsContext for handlers.
 */
export const FileRow = memo(function FileRow({
  row,
  fileData,
  isTrashView,
}: FileRowProps) {
  const {
    openRenameModal,
    openDeleteModal,
    openParseDataViewModal,
    openQuestionAnswerModal,
    handleParsingClick,
    restoreDeletedFile,
  } = useFileActions();

  const openModal = useModalStore((s) => s.open);
  const hasParsedData = isParsed(fileData);

  const openPreview = () => {
    openModal("preview", {
      fileId: fileData.docId,
      filename: fileData.filename,
      downloadUrl: fileData.downloadUrl,
      type: fileData.type,
      size: fileData.size,
      summary: fileData.summary || undefined,
    });
  };

  return (
    <File
      id={fileData.docId}
      key={"file" + row.id}
      data-state={row.getIsSelected() && "selected"}
      isTrashItem={isTrashView}
    >
      {row.getVisibleCells().map((cell) =>
        renderTableCell(cell, {
          onEditFilename: () =>
            openRenameModal(fileData.docId, fileData.filename, fileData.tags),
          onPreview: openPreview,
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
              onClick={() => openQuestionAnswerModal(fileData.docId)}
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
                  fileData.summary ?? ""
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
