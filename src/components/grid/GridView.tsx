import { FunctionComponent } from "react";
import { Card } from "./Card";
import { FileType, isFolder } from "@/types/filetype";
import { File } from "../table/File";
import { Folder } from "../table/Folder";
import { useUser } from "@clerk/nextjs";
import { useFileModals } from "@/hooks";

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

  // Use shared modal handlers
  const { openDeleteModal, openRenameModal, openParseDataViewModal } =
    useFileModals();

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user?.id, docId, folderId);
  };

  return (
    <div className="flex gap-2">
      {data.map((item) =>
        !isFolder(item) ? (
          <File
            id={item.docId}
            key={item.docId}
            hasTableRow={false}
            isTrashItem={isTrashView}
          >
            <Card
              key={item.docId}
              data={item}
              openRenameModal={openRenameModal}
              openViewModal={openParseDataViewModal}
              openDeleteModal={() =>
                openDeleteModal(item.docId, item.folderId, false)
              }
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
              key={item.docId}
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
