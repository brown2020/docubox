"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { logger } from "@/lib/logger";

/**
 * Public-safe file data returned for share pages. No auth required.
 */
export interface SharedFileData {
  filename: string;
  type: string;
  size: number;
  downloadUrl: string;
  summary: string | null;
  uploadedAt: string; // ISO date string
}

/**
 * Looks up a shared file by its share token. No authentication required.
 * Returns public-safe fields only.
 */
export async function getSharedFile(
  token: string
): Promise<SharedFileData | null> {
  try {
    // Look up the share document
    const shareDoc = await adminDb.doc(`shares/${token}`).get();
    if (!shareDoc.exists) {
      return null;
    }

    const shareData = shareDoc.data();
    if (!shareData?.userId || !shareData?.fileId) {
      return null;
    }

    // Fetch the actual file document
    const fileDoc = await adminDb
      .doc(`users/${shareData.userId}/files/${shareData.fileId}`)
      .get();
    if (!fileDoc.exists) {
      return null;
    }

    const fileData = fileDoc.data();
    if (!fileData) {
      return null;
    }

    // Verify sharing is still enabled
    if (!fileData.shareEnabled || fileData.shareToken !== token) {
      return null;
    }

    // Verify file is not deleted
    if (fileData.deletedAt) {
      return null;
    }

    // Return public-safe fields only
    const timestamp = fileData.timestamp?.toDate?.()
      ?? (fileData.timestamp?.seconds ? new Date(fileData.timestamp.seconds * 1000) : new Date());

    return {
      filename: fileData.filename || "Untitled",
      type: typeof fileData.type === "string" ? fileData.type : "",
      size: typeof fileData.size === "number" ? fileData.size : 0,
      downloadUrl: typeof fileData.downloadUrl === "string" ? fileData.downloadUrl : "",
      summary: typeof fileData.summary === "string" && fileData.summary ? fileData.summary : null,
      uploadedAt: timestamp.toISOString(),
    };
  } catch (error) {
    logger.error("shareActions", "Error looking up shared file", error);
    return null;
  }
}
