"use client";

import { FileType } from "@/types/filetype";
import { mapDocsToFileTypes } from "@/utils/mapFirestoreDoc";
import { Button } from "../ui/button";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { ChevronLeft, Grid, List } from "lucide-react";
import { GridView } from "../grid/GridView";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useModalStore } from "@/zustand/useModalStore";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function TableWrapper() {
  const { user } = useUser();
  const [initialFiles, setInitialFiles] = useState<FileType[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [input, setInput] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("list");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const isTrashPageActive = pathname.includes("trash");

  // Use new focused stores
  const { folderId, setFolderId } = useFileSelectionStore();
  const { setIsCreateFolderModalOpen } = useModalStore();

  const openCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true);
  };

  // Use the 'useCollection' hook to fetch Firestore documents
  const _where = isTrashPageActive
    ? where("deletedAt", "!=", null)
    : where("deletedAt", "==", null);

  const _orderBy = isTrashPageActive
    ? orderBy("deletedAt", sort)
    : orderBy("timestamp", sort);

  const [docs] = useCollection(
    user && query(collection(db, "users", user.id, "files"), _where, _orderBy)
  );

  // Memoized folder sizes calculation - only recalculate when initialFiles changes
  const folderSizes = useMemo(() => {
    const sizes = new Map<string, number>();

    const calculateSize = (targetFolderId: string): number => {
      if (sizes.has(targetFolderId)) return sizes.get(targetFolderId)!;

      const children = initialFiles.filter(
        (file) => file.folderId === targetFolderId
      );
      let totalSize = 0;

      for (const child of children) {
        if (child.type === "folder") {
          totalSize += calculateSize(child.docId);
        } else {
          totalSize += child.size || 0;
        }
      }

      sizes.set(targetFolderId, totalSize);
      return totalSize;
    };

    // Pre-calculate all folder sizes
    initialFiles
      .filter((f) => f.type === "folder")
      .forEach((f) => calculateSize(f.docId));

    return sizes;
  }, [initialFiles]);

  const filesList: FileType[] = useMemo(() => {
    let files: FileType[] = [...initialFiles];

    // Filter files by folderId
    files = files.filter((file) => file.folderId === folderId);

    // If input exists, filter by tags
    if (input) {
      files = files.filter(
        (file) =>
          Array.isArray(file.tags) &&
          file.tags.some((tag) =>
            tag.toLowerCase().includes(input.toLowerCase())
          )
      );
    }

    // Apply pre-calculated folder sizes
    return files.map((file) => {
      if (file.type === "folder") {
        return { ...file, size: folderSizes.get(file.docId) || 0 };
      }
      return file;
    });
  }, [input, initialFiles, folderId, folderSizes]);

  useEffect(() => {
    if (!docs) return;
    const files = mapDocsToFileTypes(docs.docs);
    setInitialFiles(files);
  }, [docs]);

  const viewHandler = useCallback(() => {
    setView((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const moveFileHandler = useCallback(
    async (userId: string, docId: string, targetFolderId: string) => {
      if (isTrashPageActive) return;

      const existingDoc = initialFiles.find((file) => file.docId === docId);
      if (existingDoc) {
        await updateDoc(doc(db, "users", userId, "files", docId), {
          folderId: targetFolderId,
        });
      }
    },
    [initialFiles, isTrashPageActive]
  );

  const goBack = useCallback(() => {
    const parentFolderId = initialFiles.find(
      (i) => i.docId === folderId
    )?.folderId;
    const params = new URLSearchParams(searchParams);
    if (parentFolderId) {
      params.set("activeFolder", parentFolderId);
    } else {
      params.delete("activeFolder");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [initialFiles, folderId, searchParams, pathname, replace]);

  useEffect(() => {
    const activeFolderId = searchParams.get("activeFolder");
    setFolderId(activeFolderId ?? null);
  }, [searchParams, setFolderId]);

  // Show loading skeleton while fetching
  if (docs?.docs.length === undefined) {
    return (
      <div className="flex flex-col px-4">
        <Button variant={"outline"} className="ml-auto w-36 h-10 mb-5">
          <Skeleton className="h-5 w-full" />
        </Button>
        <div className="border rounded-lg">
          <div className="border-b h-12" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          <GridView
            moveFileHandler={moveFileHandler}
            data={filesList}
            isTrashView={isTrashPageActive}
          />
        )}
      </DndProvider>
    </div>
  );
}
