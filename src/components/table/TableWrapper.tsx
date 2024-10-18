"use client"

import { FileType } from "@/typings/filetype"
import { Button } from "../ui/button"
import { DataTable } from "./DataTable"
import { columns } from "./columns"
import { useUser } from "@clerk/nextjs"
import { useCallback, useEffect, useMemo, useState } from "react"
import { collection, doc, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useCollection } from "react-firebase-hooks/firestore"
import { Skeleton } from "../ui/skeleton"
import { Input } from "../ui/input"
import { ChevronLeft, Grid, List } from "lucide-react"
import { GridView } from "../grid/GridView"
import { useAppStore } from "@/zustand/useAppStore"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { AddNewFolderModal } from "../AddNewFolderModal"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

type Props = {
  skeletonFiles: FileType[]
}

export default function TableWrapper({ skeletonFiles }: Props) {
  const { user } = useUser()
  const [initialFiles, setInitialFiles] = useState<FileType[]>([])
  const [sort, setSort] = useState<"asc" | "desc">("desc")
  const [input, setInput] = useState<string>("")
  const [view, setView] = useState<"grid" | "list">("list")
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const isTrashPageActive = pathname.includes('trash');

  const { setFolderId, setIsCreateFolderModalOpen, folderId } = useAppStore()
  const openCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true)
  }

  // Use the 'useCollection' hook to fetch Firestore documents

  const _where = isTrashPageActive
    ? where("deletedAt", "!=", null)  // Fetch files where deletedAt is not null
    : where("deletedAt", "==", null);  // Fetch files where deletedAt is null

  const _orderBy = isTrashPageActive
    ? orderBy("deletedAt", sort)  // Sort by deletedAt if it's a trash page
    : orderBy("timestamp", sort);  // Sort by timestamp otherwise

  const [docs] = useCollection(
    user &&
    query(
      collection(db, "users", user.id, "files"),
      _where,
      _orderBy,
    )
  );

  const calculateFolderSize = useCallback((folderId: string) => {
    const docs = initialFiles.filter(file => file.folderId === folderId);

    let totalSize = 0;

    // Loop through all items in the folder
    for (const data of docs) {
      if (data.type === "folder") {
        // Recursively calculate the size of the nested folder
        const folderSize = calculateFolderSize(data.docId);
        totalSize += folderSize;
      } else {
        // Add the size of the file to the total
        totalSize += data.size || 0;
      }
    }
    return totalSize;
  }, [initialFiles])

  const filesList: FileType[] = useMemo(() => {
    let files: FileType[] = [...initialFiles];

    // Filter files by folderId && deletedAt
    files = files.filter((file) => file.folderId === folderId);

    // If input exists, filter by tags as well
    if (input) {
      files = files.filter(
        (file) =>
          Array.isArray(file.tags) &&
          file.tags.some((tag) =>
            tag.toLowerCase().includes(input.toLowerCase())
          )
      );
    }

    // Map through the filtered files and calculate folder size if needed
    return files.map((file) => {
      if (file.type === "folder") {
        file.size = calculateFolderSize(file.docId);
      }
      return { ...file };
    });
  }, [input, initialFiles, folderId, calculateFolderSize]);


  useEffect(() => {
    if (!docs) return
    const files: FileType[] = docs.docs.filter(doc => doc.data().filename).map((doc) => ({
      docId: doc.id || "",
      filename: doc.data().filename || doc.id || "",
      tags: doc.data().tags || [],
      fullName: doc.data().fullName || doc.id || "",
      timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
      downloadUrl: doc.data().downloadUrl || "",
      type: doc.data().type || "",
      size: doc.data().size || 0,
      summary: doc.data().summary,
      unstructuredFile: doc.data().unstructuredFile || "",
      folderId: doc.data().folderId,
      deletedAt: doc.data().deletedAt,
      isUploadedToRagie: doc.data().isUploadedToRagie,
      ragieFileId: doc.data().ragieFileId
    }))
    setInitialFiles(files)
  }, [docs])

  const viewHandler = useCallback(() => {
    if (view === "list") setView("grid")
    else setView("list")
  }, [view])

  const moveFileHandler = useCallback(
    async (userId: string, docId: string, folderId: string) => {

      if (isTrashPageActive) {
        return;
      }

      const existingDoc = initialFiles.find(file => file.docId === docId);

      if (existingDoc) {
        await updateDoc(doc(db, "users", userId, "files", docId), {
          folderId,
        })
      }
    }, [initialFiles, isTrashPageActive])

  const goBack = () => {
    const parentFolderId = initialFiles.find((i) => i.docId === folderId)?.folderId
    const params = new URLSearchParams(searchParams)
    if (parentFolderId) {
      params.set("activeFolder", parentFolderId)
    } else {
      params.delete("activeFolder")
    }
    replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const activeFolderId = searchParams.get("activeFolder")
    setFolderId(activeFolderId ?? null)
  }, [searchParams, setFolderId])

  if (docs?.docs.length === undefined)
    return (
      <div className="flex flex-col px-4">
        <Button variant={"outline"} className="ml-auto w-36 h-10 mb-5">
          <Skeleton className="h-5 w-full" />
        </Button>
        <div className="border rounded-lg">
          <div className="border-b h-12" />
          {skeletonFiles.map((file) => (
            <div
              key={file.docId}
              className="flex items-center space-x-4 p-4 w-full"
            >
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
          {skeletonFiles.length === 0 && (
            <div className="flex items-center space-x-4 p-4 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
        </div>
      </div>
    )

  return (
    <div className="flex flex-col space-y-5 pb-10 px-4">
      <div className="flex border-b pb-2 items-center gap-2">

        {!isTrashPageActive && (
          <>
            {searchParams.get("activeFolder") && (
              <ChevronLeft onClick={goBack} className="cursor-pointer" />
            )}
            <Button onClick={openCreateFolderModal}>Add New Folder</Button>
          </>
        )}

        <div className="flex gap-2 ml-auto">
          <Input
            className="w-64"
            placeholder="Search tags"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            variant={"outline"}
            onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
            className="ml-auto w-fit"
          >
            Sort By {sort === "desc" ? "Oldest" : "Newest"}
          </Button>
          <Button variant={"outline"} className="w-fit" onClick={viewHandler}>
            {view === "list" ? <Grid /> : <List />}
          </Button>
        </div>
      </div>
      <DndProvider backend={HTML5Backend}>
        {view === "list" && (
          <DataTable
            columns={columns}
            data={filesList}
            moveFileHandler={moveFileHandler}
            isTrashView={isTrashPageActive}
          />
        )}
        {view === "grid" && (
          <GridView moveFileHandler={moveFileHandler} data={filesList} isTrashView={isTrashPageActive} />
        )}
      </DndProvider>
      <AddNewFolderModal />
    </div>
  )
}
