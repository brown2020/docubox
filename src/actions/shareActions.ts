"use server";

import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { requireOwnedFile, rotateOwnedDownloadUrl } from "@/lib/api-access";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

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
const SHARE_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSharedFile(
  token: string
): Promise<SharedFileData | null> {
  if (!SHARE_TOKEN.test(token)) {
    return null;
  }

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

/**
 * Creates a public share token for a file the caller owns.
 * The shares lookup document is written with the Admin SDK.
 */
export async function createShareLink(fileId: string): Promise<string> {
  const { userId } = await requireAuth();
  const file = await requireOwnedFile(userId, fileId);
  if (file.type === "folder") throw new Error("Folders cannot be shared");
  if (file.deletedAt) throw new Error("Deleted files cannot be shared");

  const token = randomUUID();
  const fileRef = adminDb.doc(`users/${userId}/files/${file.id}`);
  const batch = adminDb.batch();
  batch.update(fileRef, {
    shareToken: token,
    shareEnabled: true,
    shareCreatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(adminDb.doc(`shares/${token}`), {
    userId,
    fileId: file.id,
    createdAt: FieldValue.serverTimestamp(),
  });
  if (file.shareToken && file.shareToken !== token) {
    batch.delete(adminDb.doc(`shares/${file.shareToken}`));
  }
  await batch.commit();
  return token;
}

/**
 * Disables a share link and rotates the Firebase download token so previously
 * copied download URLs stop working.
 */
export async function disableShareLink(fileId: string): Promise<void> {
  const { userId } = await requireAuth();
  const file = await requireOwnedFile(userId, fileId);
  const fileRef = adminDb.doc(`users/${userId}/files/${file.id}`);
  const batch = adminDb.batch();
  batch.update(fileRef, {
    shareToken: null,
    shareEnabled: false,
    shareCreatedAt: null,
  });
  if (file.shareToken) {
    batch.delete(adminDb.doc(`shares/${file.shareToken}`));
  }
  await batch.commit();

  if (!file.downloadUrl) return;

  try {
    const downloadUrl = await rotateOwnedDownloadUrl(userId, file.downloadUrl);
    await fileRef.update({ downloadUrl });
  } catch (error) {
    logger.error("shareActions", "Failed to rotate download token", error);
    throw new Error(
      "Share link was disabled, but the download link could not be rotated. Try again."
    );
  }
}
