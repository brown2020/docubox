import { FileType, isFolder } from "@/types/filetype";

/** Available sort fields for the dashboard file list. */
export type SortField = "timestamp" | "name" | "size" | "type";
export type SortDir = "asc" | "desc";

/**
 * Sums each folder's descendants. Nested folders are counted once via the memo map.
 */
export function calculateFolderSizes(allFiles: FileType[]): Map<string, number> {
  const sizes = new Map<string, number>();

  const calculateSize = (targetFolderId: string): number => {
    const cached = sizes.get(targetFolderId);
    if (cached !== undefined) return cached;

    const children = allFiles.filter((file) => file.folderId === targetFolderId);
    let totalSize = 0;

    for (const child of children) {
      if (isFolder(child)) {
        totalSize += calculateSize(child.docId);
      } else {
        totalSize += child.size || 0;
      }
    }

    sizes.set(targetFolderId, totalSize);
    return totalSize;
  };

  allFiles.filter(isFolder).forEach((folder) => calculateSize(folder.docId));
  return sizes;
}

/** Storage totals for non-deleted files. Folders are excluded. */
export function summarizeStorage(allFiles: FileType[]): {
  totalStorageBytes: number;
  totalFileCount: number;
} {
  let bytes = 0;
  let count = 0;
  for (const file of allFiles) {
    if (!isFolder(file)) {
      bytes += file.size || 0;
      count++;
    }
  }
  return { totalStorageBytes: bytes, totalFileCount: count };
}

/**
 * Folder filter, filename/summary/tag search, folder-size overlay, then sort.
 * Folders stay ahead of files. Does not mutate `allFiles`.
 */
export function filterAndSortFiles({
  allFiles,
  folderId,
  searchInput,
  folderSizes,
  sortField,
  sortDir,
}: {
  allFiles: FileType[];
  folderId: string | null;
  searchInput: string;
  folderSizes: Map<string, number>;
  sortField: SortField;
  sortDir: SortDir;
}): FileType[] {
  let filtered = allFiles.filter((file) => file.folderId === folderId);

  if (searchInput) {
    const q = searchInput.toLowerCase();
    filtered = filtered.filter((file) => {
      if (file.filename.toLowerCase().includes(q)) return true;
      if (file.summary && file.summary.toLowerCase().includes(q)) return true;
      if (file.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
      return false;
    });
  }

  filtered = filtered.map((file) => {
    if (isFolder(file)) {
      return { ...file, size: folderSizes.get(file.docId) || 0 };
    }
    return file;
  });

  filtered.sort((a, b) => {
    const aFolder = isFolder(a) ? 0 : 1;
    const bFolder = isFolder(b) ? 0 : 1;
    if (aFolder !== bFolder) return aFolder - bFolder;

    const dir = sortDir === "asc" ? 1 : -1;

    switch (sortField) {
      case "name":
        return dir * a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" });
      case "size":
        return dir * ((a.size || 0) - (b.size || 0));
      case "type": {
        const aExt = a.filename.split(".").pop()?.toLowerCase() || "";
        const bExt = b.filename.split(".").pop()?.toLowerCase() || "";
        return dir * aExt.localeCompare(bExt);
      }
      case "timestamp":
      default:
        return dir * (a.timestamp.getTime() - b.timestamp.getTime());
    }
  });

  return filtered;
}
