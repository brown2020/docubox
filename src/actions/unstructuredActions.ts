"use server";

import { adminDb, adminBucket } from "@/firebase/firebaseAdmin";
import { Chunk } from "@/types/types";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

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
      const [url] = await file.getSignedUrl({
        action: "read" as const,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
      return url;
    });

    const chunkUrls = await Promise.all(uploadPromises);

    await adminDb.doc(`users/${userId}/files/${fileId}`).update({
      unstructuredFile: chunkUrls,
      chunkCount: chunks.length,
    });

    return { success: true, message: "Chunks uploaded successfully" };
  } catch (error) {
    logger.error("unstructuredActions", "Error uploading chunks", error);
    throw new Error("Chunk upload failed");
  }
};

/**
 * Validates that a URL is a legitimate Google Cloud Storage signed URL.
 */
function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "storage.googleapis.com" ||
      parsed.hostname.endsWith(".storage.googleapis.com");
  } catch {
    return false;
  }
}

const downloadUnstructuredFile = async (fileUrl: string | string[]) => {
  await requireAuth();

  try {
    const urls = Array.isArray(fileUrl) ? fileUrl : [fileUrl];
    if (urls.length === 0) throw new Error("No unstructured file URL(s)");

    // Validate all URLs are legitimate storage URLs
    for (const url of urls) {
      if (!isValidStorageUrl(url)) {
        throw new Error("Invalid storage URL");
      }
    }

    const responses = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json() as Promise<Chunk>;
      })
    );

    // If we have multiple chunk files, return a JSON array of chunks.
    // If we have a single file, keep the legacy shape (stringified object).
    const payload = responses.length === 1 ? responses[0] : responses;
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    logger.error("unstructuredActions", "Error downloading file", error);
    throw new Error("File download failed");
  }
};

export { uploadUnstructuredFile, downloadUnstructuredFile };
