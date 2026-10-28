"use server";

import { adminDb, adminBucket } from "@/firebase/firebaseAdmin";
import { downloadOwnedUnstructuredJson, requireOwnedFile } from "@/lib/api-access";
import { safeFileSegment } from "@/lib/storage-path";
import { Chunk } from "@/types/types";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

/**
 * Uploads parsed chunks to Firebase Storage and stores their **file paths**
 * (not signed URLs) in Firestore. Paths never expire, unlike signed URLs.
 */
const uploadUnstructuredFile = async (
  chunks: Chunk[],
  fileName: string,
  fileId: string
) => {
  const { userId } = await requireAuth();
  await requireOwnedFile(userId, fileId);
  const safeName = safeFileSegment(fileName);

  try {
    const basePath = `users/${userId}/unstructured/${fileId}_${safeName}`;
    const uploadPromises = chunks.map(async (chunk, index) => {
      const filePath = `${basePath}/chunk_${index}`;
      const file = adminBucket.file(filePath);
      await file.save(JSON.stringify(chunk), {
        contentType: "application/json",
      });
      // Store the path, not a signed URL — paths never expire
      return filePath;
    });

    const chunkPaths = await Promise.all(uploadPromises);

    await adminDb.doc(`users/${userId}/files/${fileId}`).update({
      unstructuredFile: chunkPaths,
      chunkCount: chunks.length,
    });

    return { success: true, message: "Chunks uploaded successfully" };
  } catch (error) {
    logger.error("unstructuredActions", "Error uploading chunks", error);
    throw new Error("Chunk upload failed");
  }
};

/**
 * Downloads parsed chunk data for the signed-in user.
 * Accepts storage paths or legacy signed URLs, but only under that user's
 * unstructured prefix. Objects are read with the Admin SDK, not fetched by URL.
 */
const downloadUnstructuredFile = async (fileRef: string | string[]) => {
  const { userId } = await requireAuth();

  try {
    const refs = Array.isArray(fileRef) ? fileRef : [fileRef];
    if (refs.length === 0 || refs.length > 500) {
      throw new Error("No unstructured file reference(s)");
    }

    const responses = await Promise.all(
      refs.map((ref) => downloadOwnedUnstructuredJson(userId, ref))
    );

    const payload = responses.length === 1 ? responses[0] : responses;
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    logger.error("unstructuredActions", "Error downloading file", error);
    throw new Error("File download failed");
  }
};

export { uploadUnstructuredFile, downloadUnstructuredFile };
