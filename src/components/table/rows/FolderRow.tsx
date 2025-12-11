"use client";

import { memo } from "react";
import { FileType } from "@/types/filetype";
import { Row } from "@tanstack/react-table";
import { Folder } from "../Folder";
import { renderTableCell } from "../utils/renderCell";
import { ActionCell } from "../cells/ActionCell";
import { useFileActions } from "../FileActionsContext";

interface FolderRowProps {
  row: Row<FileType>;
  folderData: FileType;
  isTrashView?: boolean;
  onDrop: (docId: string, folderId: string) => void;
}

/**
 * Folder row component using FileActionsContext for handlers.
 */
export const FolderRow = memo(function FolderRow({
  row,
  folderData,
  isTrashView,
  onDrop,
}: FolderRowProps) {
  const { openRenameModal, openDeleteModal, restoreDeletedFile } =
    useFileActions();

  return (
    <Folder
      id={folderData.docId}
      key={"folder" + row.id}
      data-state={row.getIsSelected() && "selected"}
      onDrop={onDrop}
      isTrashItem={isTrashView}
    >
      {row.getVisibleCells().map((cell) =>
        renderTableCell(cell, {
          onEditFilename: () =>
            openRenameModal(
              folderData.docId,
              folderData.filename,
              folderData.tags
            ),
          showDownload: false, // Folders don't have download links
        })
      )}
      <ActionCell
        fileId={folderData.docId}
        isTrashView={isTrashView}
        onRestore={() => restoreDeletedFile(folderData.docId)}
        onDelete={() =>
          openDeleteModal(folderData.docId, folderData.folderId ?? null, true)
        }
      />
    </Folder>
  );
});
