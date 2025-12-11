"use client";

import { useCallback, useDeferredValue, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ChevronLeft, Grid, List } from "lucide-react";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { GridView } from "../grid/GridView";
import { FileActionsProvider } from "./FileActionsContext";
import { useFilesList, useFolderNavigation } from "@/hooks";
import { useModalStore } from "@/zustand/useModalStore";

/**
 * Table wrapper component with file list and controls.
 * Uses extracted hooks for cleaner separation of concerns.
 */
export default function TableWrapper() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState("");
  const deferredSearchInput = useDeferredValue(searchInput);
  const [view, setView] = useState<"grid" | "list">("list");

  const isTrashPageActive = pathname.includes("trash");

  // Use extracted hooks
  const { folderId, canGoBack, goBack } = useFolderNavigation([]);
  const { files, allFiles, isLoading } = useFilesList({
    isTrashView: isTrashPageActive,
    sort,
    searchInput: deferredSearchInput,
    folderId,
  });

  // Update navigation with allFiles for goBack
  const { goBack: goBackWithFiles } = useFolderNavigation(allFiles);

  const open = useModalStore((s) => s.open);

  const openCreateFolderModal = () => {
    open("createFolder");
  };

  const viewHandler = useCallback(() => {
    setView((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const moveFileHandler = useCallback(
    async (userId: string, docId: string, targetFolderId: string) => {
      if (isTrashPageActive) return;

      const existingDoc = allFiles.find((file) => file.docId === docId);
      if (existingDoc) {
        await updateDoc(doc(db, "users", userId, "files", docId), {
          folderId: targetFolderId,
        });
      }
    },
    [allFiles, isTrashPageActive]
  );

  // Show loading skeleton while Clerk loads or data is being fetched
  // Also show skeleton for signed-out users (proxy will redirect them)
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex flex-col px-4">
        <Button variant="outline" className="ml-auto w-36 h-10 mb-5">
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
            {canGoBack && (
              <ChevronLeft
                onClick={goBackWithFiles}
                className="cursor-pointer"
              />
            )}
            <Button onClick={openCreateFolderModal}>Add New Folder</Button>
          </>
        )}

        <div className="flex gap-2 ml-auto">
          <Input
            className="w-64"
            placeholder="Search tags"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
            className="ml-auto w-fit"
          >
            Sort By {sort === "desc" ? "Oldest" : "Newest"}
          </Button>
          <Button variant="outline" className="w-fit" onClick={viewHandler}>
            {view === "list" ? <Grid /> : <List />}
          </Button>
        </div>
      </div>
      <DndProvider backend={HTML5Backend}>
        <FileActionsProvider>
          {view === "list" && (
            <DataTable
              columns={columns}
              data={files}
              moveFileHandler={moveFileHandler}
              isTrashView={isTrashPageActive}
            />
          )}
          {view === "grid" && (
            <GridView
              moveFileHandler={moveFileHandler}
              data={files}
              isTrashView={isTrashPageActive}
            />
          )}
        </FileActionsProvider>
      </DndProvider>
    </div>
  );
}
