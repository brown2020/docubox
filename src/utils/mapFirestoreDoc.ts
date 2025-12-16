import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { FileType } from "@/types/filetype";

/**
 * Maps a Firestore document snapshot to a FileType object.
 * Centralizes the mapping logic to ensure consistency across the app.
 */
export function mapDocToFileType(
  doc: QueryDocumentSnapshot<DocumentData>
): FileType {
  const data = doc.data();
  return {
    docId: doc.id,
    filename: data.filename || doc.id,
    tags: data.tags || [],
    fullName: data.fullName || doc.id,
    timestamp: data.timestamp?.seconds
      ? new Date(data.timestamp.seconds * 1000)
      : new Date(),
    downloadUrl: data.downloadUrl || "",
    type: data.type || "",
    size: data.size || 0,
    summary: data.summary || "",
    unstructuredFile: data.unstructuredFile || "",
    folderId: data.folderId,
    deletedAt: data.deletedAt || null,
    isUploadedToRagie: data.isUploadedToRagie || false,
    ragieFileId: data.ragieFileId || null,
  };
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


