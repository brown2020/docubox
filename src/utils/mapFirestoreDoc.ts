import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { FileType } from "@/types/filetype";

/**
 * Best-effort conversion of Firestore Timestamp / Date-like values to Date.
 * Supports:
 * - Firestore Timestamp (has toDate())
 * - Timestamp-like objects with seconds
 * - Date
 */
function toDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (value && typeof value === "object") {
    const maybeToDate = (value as { toDate?: unknown }).toDate;
    if (typeof maybeToDate === "function") {
      try {
        return (maybeToDate as () => Date)();
      } catch {
        // fall through
      }
    }

    const maybeSeconds = (value as { seconds?: unknown }).seconds;
    if (typeof maybeSeconds === "number") {
      return new Date(maybeSeconds * 1000);
    }
  }

  return new Date();
}

/**
 * Maps raw Firestore document data into the app's FileType view model.
 * Centralizes normalization (timestamps, nullable fields, legacy shapes).
 */
export function mapFirestoreFileDataToFileType(
  docId: string,
  data: DocumentData
): FileType {
  const unstructuredFile =
    Array.isArray(data.unstructuredFile) || typeof data.unstructuredFile === "string"
      ? (data.unstructuredFile as string | string[])
      : null;

  return {
    docId,
    filename: (typeof data.filename === "string" && data.filename) || docId,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    fullName: (typeof data.fullName === "string" && data.fullName) || docId,
    timestamp: toDate(data.timestamp),
    downloadUrl: typeof data.downloadUrl === "string" ? data.downloadUrl : "",
    type: typeof data.type === "string" ? data.type : "",
    size: typeof data.size === "number" ? data.size : 0,
    summary: typeof data.summary === "string" ? data.summary : "",
    unstructuredFile,
    // Firestore stores root items as folderId: null.
    folderId: typeof data.folderId === "string" ? data.folderId : null,
    deletedAt: data.deletedAt ? toDate(data.deletedAt) : null,
    isUploadedToRagie: Boolean(data.isUploadedToRagie),
    ragieFileId: typeof data.ragieFileId === "string" ? data.ragieFileId : null,
  };
}

/**
 * Maps a Firestore query snapshot to a FileType object.
 * Prefer this over casting raw Firestore data.
 */
export function mapDocToFileType(
  doc: QueryDocumentSnapshot<DocumentData>
): FileType {
  return mapFirestoreFileDataToFileType(doc.id, doc.data());
}

/**
 * Maps an array of Firestore document snapshots to FileType objects.
 * Filters out documents without a filename.
 */
export function mapDocsToFileTypes(
  docs: QueryDocumentSnapshot<DocumentData>[]
): FileType[] {
  return docs.filter((doc) => doc.data().filename).map(mapDocToFileType);
}

