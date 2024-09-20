import { FunctionComponent } from "react"
import { Card } from "./Card"
import { FileType } from "@/typings/filetype"
import { useAppStore } from "@/zustand/useAppStore"
import { RenameModal } from "../RenameModal"
import { ShowParsedDataModal } from "../ShowParsedDataModal"
import { DeleteModal } from "../DeleteModal"
import { AddNewFolderModal } from "../AddNewFolderModal"

type Props = {
  data: FileType[]
}

export const GridView: FunctionComponent<Props> = ({ data }) => {
  const {
    setFileId,
    setFilename,
    setTags,
    setIsRenameModalOpen,
    setUnstructuredFileData,
    setFileSummary,
    setIsShowParseDataModelOpen,
    setIsDeleteModalOpen,
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

  const openParseDataViewModal = (
    docId: string,
    filedata: string,
    summary: string
  ) => {
    setUnstructuredFileData(filedata)
    setFileSummary({ docId, summary })
    setIsShowParseDataModelOpen(true)
  }
   const openDeleteModal = (fileId: string) => {
    setFileId(fileId)
    setIsDeleteModalOpen(true)
  }
  return (
    <div className=" flex gap-2 ">
      {data.map((i) => (
        <Card
          key={i.id}
          data={i}
          openRenameModal={openRenameModal}
          openViewModal={openParseDataViewModal}
          openDeleteModal={openDeleteModal}
        />
      ))}
      <DeleteModal />
      <RenameModal />
      <ShowParsedDataModal />
      <AddNewFolderModal />
    </div>
  )
}
