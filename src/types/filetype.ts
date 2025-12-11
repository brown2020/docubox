export type FileType = {
  docId: string;
  filename: string;
  fullName: string;
  timestamp: Date;
  downloadUrl: string;
  type: string;
  size: number;
  unstructuredFile: string;
  summary: string;
  tags: string[];
  folderId?: string;
  deletedAt: Date | null;
  isUploadedToRagie: boolean;
  ragieFileId: string | null;
};

/**
 * Type guard to check if a FileType is a folder.
 */
export function isFolder(file: FileType): boolean {
  return file.type === "folder";
}

/**
 * Type guard to check if a FileType has been parsed.
 */
export function isParsed(file: FileType): boolean {
  return !!file.unstructuredFile;
}

/**
 * Type guard to check if a FileType is in trash.
 */
export function isDeleted(file: FileType): boolean {
  return file.deletedAt !== null;
}
