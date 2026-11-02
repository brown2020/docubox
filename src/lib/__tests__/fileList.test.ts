import { describe, expect, it } from "vitest";
import type { FileType } from "@/types/filetype";
import {
  calculateFolderSizes,
  filterAndSortFiles,
  summarizeStorage,
} from "@/lib/fileList";

function file(overrides: Partial<FileType> & Pick<FileType, "docId" | "filename">): FileType {
  return {
    fullName: "Tester",
    timestamp: new Date("2026-01-01T00:00:00Z"),
    downloadUrl: "",
    type: "application/pdf",
    size: 0,
    unstructuredFile: null,
    summary: "",
    tags: [],
    folderId: null,
    deletedAt: null,
    isUploadedToRagie: false,
    ragieFileId: null,
    shareToken: null,
    shareEnabled: false,
    ...overrides,
  };
}

describe("dashboard file list", () => {
  const folder = file({
    docId: "folder-a",
    filename: "Contracts",
    type: "folder",
    size: 0,
  });
  const nested = file({
    docId: "file-nested",
    filename: "lease.pdf",
    folderId: "folder-a",
    size: 400,
    summary: "Office lease terms",
    tags: ["legal"],
    timestamp: new Date("2026-03-01T00:00:00Z"),
  });
  const rootDoc = file({
    docId: "file-root",
    filename: "notes.txt",
    type: "text/plain",
    size: 100,
    summary: "Meeting notes",
    tags: ["ops"],
    timestamp: new Date("2026-02-01T00:00:00Z"),
  });
  const allFiles = [rootDoc, folder, nested];

  it("rolls nested file bytes into the parent folder and ignores folders in storage totals", () => {
    expect(calculateFolderSizes(allFiles).get("folder-a")).toBe(400);
    expect(summarizeStorage(allFiles)).toEqual({
      totalStorageBytes: 500,
      totalFileCount: 2,
    });
  });

  it("keeps the current folder, searches summary and tags, and sorts folders first", () => {
    const folderSizes = calculateFolderSizes(allFiles);
    const root = filterAndSortFiles({
      allFiles,
      folderId: null,
      searchInput: "",
      folderSizes,
      sortField: "name",
      sortDir: "asc",
    });
    expect(root.map((item) => item.filename)).toEqual(["Contracts", "notes.txt"]);
    expect(root[0]?.size).toBe(400);

    const bySummary = filterAndSortFiles({
      allFiles,
      folderId: "folder-a",
      searchInput: "LEASE",
      folderSizes,
      sortField: "timestamp",
      sortDir: "desc",
    });
    expect(bySummary.map((item) => item.docId)).toEqual(["file-nested"]);

    const byTag = filterAndSortFiles({
      allFiles,
      folderId: null,
      searchInput: "ops",
      folderSizes,
      sortField: "size",
      sortDir: "asc",
    });
    expect(byTag.map((item) => item.docId)).toEqual(["file-root"]);
  });
});
