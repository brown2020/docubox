"use client";

import { FileType } from "@/types/filetype";
import { Row } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { TableCell } from "../../ui/table";
import { Folder } from "../Folder";
import { renderTableCell } from "../utils/renderCell";
import { TrashIcon, UndoIcon } from "lucide-react";

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

export function FolderRow({
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
      <TableCell key="actions" className="flex space-x-2 py-2 px-4 justify-end">
        {isTrashView && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => restoreDeletedFile(folderData.docId)}
            className="text-blue-500 hover:bg-blue-100"
          >
            <UndoIcon size={20} />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDeleteModal(folderData.docId, folderData.folderId ?? null, true)
          }
          className="text-red-500 hover:bg-red-100"
        >
          <TrashIcon size={20} />
        </Button>
      </TableCell>
    </Folder>
  );
}
