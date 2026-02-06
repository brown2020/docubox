"use server";

import { adminDb, adminBucket } from "@/firebase/firebaseAdmin";
import { Chunk } from "@/types/types";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

/**
 * Uploads parsed chunks to Firebase Storage and stores their **file paths**
 * (not signed URLs) in Firestore. Paths never expire, unlike signed URLs.
 */
const uploadUnstructuredFile = async (
  chunks: Chunk[],
  _userId: string,
  fileName: string,
  fileId: string
) => {
  const { userId } = await requireAuth();

  try {
    const basePath = `users/${userId}/unstructured/${fileId}_${fileName}`;
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
 * Checks whether a string looks like a GCS storage path (not a URL).
 * Paths are like "users/abc/unstructured/file_doc/chunk_0".
 */
function isStoragePath(value: string): boolean {
  return !value.startsWith("http://") && !value.startsWith("https://");
}

/**
 * Validates that a URL is a legitimate Google Cloud Storage signed URL.
 */
function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "storage.googleapis.com" ||
      parsed.hostname.endsWith(".storage.googleapis.com")
    );
  } catch {
    return false;
  }
}

/**
 * Downloads parsed chunk data. Handles both:
 * - New format: storage paths (read directly via Admin SDK — never expires)
 * - Legacy format: signed URLs (fetched directly — may expire)
 */
const downloadUnstructuredFile = async (fileRef: string | string[]) => {
  await requireAuth();

  try {
    const refs = Array.isArray(fileRef) ? fileRef : [fileRef];
    if (refs.length === 0) throw new Error("No unstructured file reference(s)");

    const responses = await Promise.all(
      refs.map(async (ref) => {
        if (isStoragePath(ref)) {
          // New format: read directly from storage via Admin SDK
          const file = adminBucket.file(ref);
          const [contents] = await file.download();
          return JSON.parse(contents.toString("utf-8")) as Chunk;
        }

        // Legacy format: fetch from signed URL
        if (!isValidStorageUrl(ref)) {
          throw new Error("Invalid storage URL");
        }
        const response = await fetch(ref);
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json() as Promise<Chunk>;
      })
    );

    const payload = responses.length === 1 ? responses[0] : responses;
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    logger.error("unstructuredActions", "Error downloading file", error);
    throw new Error("File download failed");
  }
};

export { uploadUnstructuredFile, downloadUnstructuredFile };
