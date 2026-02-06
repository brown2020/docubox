"use client";

import { useCallback, useDeferredValue, useState } from "react";
import { useAuth } from "@/components/auth";
import { usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Grid,
  List,
  FolderPlus,
  Search,
  X,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { GridView } from "../grid/GridView";
import { FileActionsProvider } from "./FileActionsContext";
import { useFilesList, useFolderNavigation, type SortField } from "@/hooks";
import { useModalStore } from "@/zustand/useModalStore";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { fileService } from "@/services/fileService";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StorageUsageBar } from "@/components/StorageUsageBar";
import { UploadButton } from "@/components/Dropzone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: "Date modified", field: "timestamp" },
  { label: "Name", field: "name" },
  { label: "Size", field: "size" },
  { label: "Type", field: "type" },
];

/**
 * Table wrapper with unified toolbar: breadcrumbs, search, sort, view toggle, upload, new folder.
 */
export default function TableWrapper() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  // Sort state
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  // View state
  const [view, setView] = useState<"grid" | "list">("list");

  const isTrashPageActive = pathname.includes("trash");

  // File data
  const { folderId } = useNavigationStore();
  const { files, allFiles, isLoading, totalStorageBytes, totalFileCount } =
    useFilesList({
      isTrashView: isTrashPageActive,
      sortField,
      sortDir,
      searchInput: deferredSearch,
      folderId,
    });

  // Navigation
  const { canGoBack, goBack, navigateTo } = useFolderNavigation(allFiles);

  // Modal
  const open = useModalStore((s) => s.open);

  const moveFileHandler = useCallback(
    async (userId: string, docId: string, targetFolderId: string) => {
      if (isTrashPageActive) return;
      const existingDoc = allFiles.find((file) => file.docId === docId);
      if (existingDoc) {
        await fileService.moveToFolder(userId, docId, targetFolderId);
      }
    },
    [allFiles, isTrashPageActive]
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.field === sortField)?.label ?? "Sort";

  // Loading skeleton
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex flex-col px-4 gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
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
    <div className="flex flex-col pb-10 px-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Row 1: Breadcrumbs + actions */}
        <div className="flex items-center gap-2 min-h-[36px]">
          {/* Left: breadcrumbs or back button */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {!isTrashPageActive && (
              <Breadcrumbs
                folderId={folderId}
                allFiles={allFiles}
                onNavigate={navigateTo}
              />
            )}
            {isTrashPageActive && (
              <h2 className="text-sm font-medium text-muted-foreground">Trash</h2>
            )}
          </div>

          {/* Right: storage stats */}
          <StorageUsageBar totalBytes={totalStorageBytes} fileCount={totalFileCount} />
        </div>

        {/* Row 2: Search + controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files, summaries, tags..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.field}
                  onClick={() => handleSort(opt.field)}
                >
                  {opt.label}
                  {opt.field === sortField && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setView((v) => (v === "list" ? "grid" : "list"))}
            aria-label={view === "list" ? "Switch to grid view" : "Switch to list view"}
          >
            {view === "list" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>

          {/* Upload + New folder (only on dashboard, not trash) */}
          {!isTrashPageActive && (
            <>
              <UploadButton />
              <Button
                variant="outline"
                size="sm"
                onClick={() => open("createFolder")}
              >
                <FolderPlus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">New folder</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* File list */}
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
