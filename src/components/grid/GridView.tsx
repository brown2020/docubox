import { FunctionComponent, useCallback } from "react";
import { Card } from "./Card";
import { FileType, isFolder } from "@/types/filetype";
import { File } from "../table/File";
import { Folder } from "../table/Folder";
import { useUser } from "@/components/auth";
import { useFileModals } from "@/hooks";
import { useModalStore } from "@/zustand/useModalStore";

type Props = {
  data: FileType[];
  moveFileHandler: (userId: string, docId: string, folderId: string) => void;
  isTrashView?: boolean;
};

export const GridView: FunctionComponent<Props> = ({
  data,
  moveFileHandler,
  isTrashView,
}) => {
  const { user } = useUser();
  const openModal = useModalStore((s) => s.open);

  // Use shared modal handlers
  const { openDeleteModal, openRenameModal, openParseDataViewModal } =
    useFileModals();

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user?.id, docId, folderId);
  };

  const openPreview = useCallback(
    (file: FileType) => {
      openModal("preview", {
        fileId: file.docId,
        filename: file.filename,
        downloadUrl: file.downloadUrl,
        type: file.type,
        size: file.size,
        summary: file.summary || undefined,
      });
    },
    [openModal]
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {data.map((item) =>
        !isFolder(item) ? (
          <File
            id={item.docId}
            key={item.docId}
            hasTableRow={false}
            isTrashItem={isTrashView}
          >
            <Card
              data={item}
              openRenameModal={openRenameModal}
              openViewModal={openParseDataViewModal}
              openDeleteModal={() =>
                openDeleteModal(item.docId, item.folderId, false)
              }
              onPreview={() => openPreview(item)}
            />
          </File>
        ) : (
          <Folder
            id={item.docId}
            key={item.docId}
            onDrop={onDrop}
            hasTableRow={false}
            isTrashItem={isTrashView}
          >
            <Card
              data={item}
              openRenameModal={openRenameModal}
              openViewModal={openParseDataViewModal}
              openDeleteModal={() =>
                openDeleteModal(item.docId, item.folderId, true)
              }
            />
          </Folder>
        )
      )}
    </div>
  );
};
