"use client";

import { memo } from "react";
import { FileType } from "@/types/filetype";
import { Row } from "@tanstack/react-table";
import { Folder } from "../Folder";
import { renderTableCell } from "../utils/renderCell";
import { ActionCell } from "../cells/ActionCell";

interface FolderRowProps {
  row: Row<FileType>;
  folderData: FileType;
  isTrashView?: boolean;
  openRenameModal: (fileId: string, filename: string, tags: string[]) => void;
  openDeleteModal: (
    fileId: string,
    folderId: string | null,
    isFolder: boolean
  ) => void;
  onDrop: (docId: string, folderId: string) => void;
  restoreDeletedFile: (fileId: string) => Promise<void>;
}

export const FolderRow = memo(function FolderRow({
  row,
  folderData,
  isTrashView,
  openRenameModal,
  openDeleteModal,
  onDrop,
  restoreDeletedFile,
}: FolderRowProps) {
  return (
    <Folder
      id={row.getValue("id")}
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
