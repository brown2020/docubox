"use client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { FileType } from "@/typings/filetype"
import { EyeIcon, MessageCircleQuestionIcon, PencilIcon, TrashIcon, UndoIcon } from "lucide-react"
import { Button } from "../ui/button"
import { useAppStore } from "@/zustand/useAppStore"
import { DeleteModal } from "../DeleteModal"
import { RenameModal } from "../RenameModal"
import { ShowParsedDataModal } from "../ShowParsedDataModal"
import { File } from "./File"
import { Folder } from "./Folder"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { db } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { QuestionAnswerModal } from "../QuestionAnswerModal"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  moveFileHandler: (userId: string, docId: string, folderId: string) => void
  isTrashView?: boolean
}
export function DataTable<TData, TValue>({
  columns,
  data,
  moveFileHandler,
  isTrashView,
}: DataTableProps<TData, TValue>) {
  const { user } = useUser()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const {
    setFileId,
    setFilename,
    setTags,
    setIsDeleteModalOpen,
    setIsRenameModalOpen,
    setUnstructuredFileData,
    setIsShowParseDataModelOpen,
    isShowParseDataModelOpen,
    setFileSummary,
    setFolderId,
    setIsFolder,
    setQuestionAnswerModalOpen
  } = useAppStore()
  const openDeleteModal = (
    fileId: string,
    folderId: string | null = null,
    isFolder: boolean = false
  ) => {
    setFileId(fileId)
    setIsDeleteModalOpen(true)
    setFolderId(folderId)
    setIsFolder(isFolder)
  }
  const openParseDataViewModal = (
    docId: string,
    filedata: string,
    summary: string
  ) => {
    setFileId(docId)
    setUnstructuredFileData(filedata)
    setFileSummary({ docId, summary })
    setIsShowParseDataModelOpen(true)
  }
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

  const onDrop = (docId: string, folderId: string) => {
    if (user) moveFileHandler(user?.id, docId, folderId)
  }

  const restoreDeletedFile = async (fileId: string) => {
    if (user) {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        deletedAt: null,
      })
    }
  }


  const handleOpenQuestionAnswerModal = (fileId: string) => {
    setFileId(fileId)
    setQuestionAnswerModalOpen(true);
  }

  return (
    <div className="rounded-lg border border-gray-200 shadow-md overflow-hidden">
      {isShowParseDataModelOpen && <ShowParsedDataModal />}
      <DeleteModal />
      <RenameModal />
      <QuestionAnswerModal />
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={`header-${index}${header.id}`}
                  className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-white"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              row.getValue("type") !== "folder" ? (
                <File
                  id={row.getValue("id")}
                  key={"file" + row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2 px-4 text-gray-600 dark:text-white"
                    >
                      {cell.column.id === "timestamp" ? (
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">
                            {(cell.getValue() as Date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {(cell.getValue() as Date).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : cell.column.id === "filename" ? (
                        <div
                          onClick={() =>
                            openRenameModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).filename,
                              (row.original as FileType).tags
                            )
                          }
                          className="flex items-center text-blue-600 hover:underline cursor-pointer gap-2"
                        >
                          <div>{cell.getValue() as string}</div>
                          <PencilIcon size={15} className="ml-2" />
                        </div>
                      ) : cell.column.id === "downloadUrl" ? (
                        <Link
                          href={cell.getValue() as string}
                          target="_blank"
                          className="underline text-blue-500 hover:text-blue-700"
                        >
                          Download
                        </Link>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="flex space-x-2 py-2 px-4 justify-end">
                    {isTrashView ? (
                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => {
                          restoreDeletedFile((row.original as FileType).docId)
                        }}
                        className="text-blue-500 hover:bg-blue-100"
                      >
                        <UndoIcon size={20} />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={"outline"}
                          size="icon"
                          className="text-blue-500 hover:bg-blue-100"
                          onClick={() => handleOpenQuestionAnswerModal((row.original as FileType).docId)}>
                          <MessageCircleQuestionIcon size={20} />
                        </Button>
                        <Button
                          variant={"outline"}
                          size="icon"
                          onClick={() => {
                            openParseDataViewModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).unstructuredFile,
                              (row.original as FileType).summary
                            )
                          }}
                          className="text-blue-500 hover:bg-blue-100"
                        >
                          <EyeIcon size={20} />
                        </Button>
                      </>

                    )}
                    <Button
                      variant={"outline"}
                      size="icon"
                      onClick={() =>
                        openDeleteModal(
                          (row.original as FileType).docId,
                          (row.original as FileType).folderId,
                          (row.original as FileType).type === "folder"
                        )
                      }
                      className="text-red-500 hover:bg-red-100"
                    >
                      <TrashIcon size={20} />
                    </Button>
                  </TableCell>
                </File>
              ) : (
                <Folder
                  id={row.getValue("id")}
                  key={"folder" + row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onDrop={onDrop}
                  isTrashItem={isTrashView}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2 px-4 text-gray-600 dark:text-white"
                    >
                      {cell.column.id === "timestamp" ? (
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">
                            {(cell.getValue() as Date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {(cell.getValue() as Date).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : cell.column.id === "filename" ? (
                        <div
                          onClick={() =>
                            openRenameModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).filename,
                              (row.original as FileType).tags
                            )
                          }
                          className="flex items-center text-blue-600 hover:underline cursor-pointer gap-2"
                        >
                          <div>{cell.getValue() as string}</div>
                          <PencilIcon size={15} className="ml-2" />
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell
                    key={"actions"}
                    className="flex space-x-2 py-2 px-4 justify-end"
                  >
                    {isTrashView ? (
                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => {
                          restoreDeletedFile((row.original as FileType).docId)
                        }}
                        className="text-blue-500 hover:bg-blue-100"
                      >
                        <UndoIcon size={20} />
                      </Button>
                    ) : (
                      row.getValue("type") !== "folder" && (
                        <Button
                          variant={"outline"}
                          size="icon"
                          onClick={() => {
                            openParseDataViewModal(
                              (row.original as FileType).docId,
                              (row.original as FileType).unstructuredFile,
                              (row.original as FileType).summary
                            )
                          }}
                          className="text-blue-500 hover:bg-blue-100"
                        >
                          <EyeIcon size={20} />
                        </Button>
                      )
                    )}

                    <Button
                      variant={"outline"}
                      size="icon"
                      onClick={() =>
                        openDeleteModal(
                          (row.original as FileType).docId,
                          (row.original as FileType).folderId,
                          (row.original as FileType).type === "folder"
                        )
                      }
                      className="text-red-500 hover:bg-red-100"
                    >
                      <TrashIcon size={20} />
                    </Button>
                  </TableCell>
                </Folder>
              )
            ))
          ) : (
            <TableRow key={"no Found"}>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-600"
              >
                No files found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
