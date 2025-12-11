/**
 * Represents a file or folder in the document management system.
 */
export type FileType = {
  /** Unique document ID from Firestore */
  docId: string;
  /** File or folder name */
  filename: string;
  /** Display name of the user who uploaded */
  fullName: string;
  /** Upload timestamp */
  timestamp: Date;
  /** Firebase Storage download URL */
  downloadUrl: string;
  /** MIME type or 'folder' for directories */
  type: string;
  /** File size in bytes (calculated for folders) */
  size: number;
  /** Parsed content from Unstructured API */
  unstructuredFile: string;
  /** AI-generated summary */
  summary: string;
  /** User-defined tags for filtering */
  tags: string[];
  /** Parent folder ID (null for root level) */
  folderId?: string;
  /** Soft delete timestamp (null if not deleted) */
  deletedAt: Date | null;
  /** Whether file has been uploaded to Ragie for RAG */
  isUploadedToRagie: boolean;
  /** Ragie document ID for RAG queries */
  ragieFileId: string | null;
};

/**
 * QA Record for chat history with documents.
 */
export interface QARecord {
  id: string;
  question: string;
  answer: string;
}

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

/**
 * Type guard to check if a FileType is ready for RAG queries.
 */
export function isRAGReady(file: FileType): boolean {
  return file.isUploadedToRagie && !!file.ragieFileId;
}
