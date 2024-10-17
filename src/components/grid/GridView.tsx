import { FunctionComponent } from "react"
import { Card } from "./Card"
import { FileType } from "@/typings/filetype"
import { useAppStore } from "@/zustand/useAppStore"
import { RenameModal } from "../RenameModal"
import { ShowParsedDataModal } from "../ShowParsedDataModal"
import { DeleteModal } from "../DeleteModal"
import { File } from "../table/File"
import { Folder } from "../table/Folder"
import { useUser } from "@clerk/nextjs"
import { downloadUnstructuredFile } from "@/actions/unstructuredActions"

type Props = {
  data: FileType[]
  moveFileHandler: (userId: string, docId: string, folderId: string) => void
  isTrashView?: boolean
}

export const GridView: FunctionComponent<Props> = ({
  data,
  moveFileHandler,
  isTrashView,
}) => {
  const { user } = useUser()

  const {
    setFileId,
    setFilename,
    setTags,
    setIsRenameModalOpen,
    setUnstructuredFileData,
    setFileSummary,
    setIsShowParseDataModelOpen,
    setIsDeleteModalOpen,
    setFolderId,
    setIsFolder,
  } = useAppStore()

  const openRenameModal = (
    fileId: string,
    filename: string,
    tags: string[] = []
  ) => {
    setFileId(fileId)
    setFilename(filename)
    setTags(tags)
    setIsRenameModalOpen(true)
  }

  const openParseDataViewModal = async(
    docId: string,
    filedataUrl: string,
    summary: string
  ) => {
    const data = await downloadUnstructuredFile(filedataUrl)
    setUnstructuredFileData(data)
    setFileSummary({ docId, summary })
    setIsShowParseDataModelOpen(true)
  }
  const openDeleteModal = (
    fileId: string,
    folderId: string | null = null,
    isFolder = false
  ) => {
    setFileId(fileId)
    setIsDeleteModalOpen(true)
    setFolderId(folderId)
    setIsFolder(isFolder)
  }

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user?.id, docId, folderId)
  }
  return (
    <div className=" flex gap-2 ">
      {data.map((i) =>
        i.type !== "folder" ? (
          <File
            id={i.docId}
            key={i.docId}
            hasTableRow={false}
            isTrashItem={isTrashView}
          >
            <Card
              key={i.docId}
              data={i}
              openRenameModal={openRenameModal}
              openViewModal={openParseDataViewModal}
              openDeleteModal={() =>
                openDeleteModal(i.docId, i.folderId, i.type === "folder")
              }
            />
          </File>
        ) : (
          <Folder
            id={i.docId}
            key={i.docId}
            onDrop={(docId: string, folderId: string) =>
              onDrop(docId, folderId)
            }
            hasTableRow={false}
            isTrashItem={isTrashView}
          >
            <Card
              key={i.docId}
              data={i}
              openRenameModal={openRenameModal}
              openViewModal={openParseDataViewModal}
              openDeleteModal={() =>
                openDeleteModal(i.docId, i.folderId, i.type === "folder")
              }
            />
          </Folder>
        )
      )}
      <DeleteModal />
      <RenameModal />
      <ShowParsedDataModal />
    </div>
  )
}
