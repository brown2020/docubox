"use server";

import { db, storage } from "@/firebase";
import { Chunk } from "@/types/types";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { logger } from "@/lib/logger";

const uploadUnstructuredFile = async (
  chunks: Chunk[],
  userId: string,
  fileName: string,
  fileId: string
) => {
  try {
    const baseRef = ref(
      storage,
      `users/${userId}/unstructured/${fileId}_${fileName}`
    );
    const uploadPromises = chunks.map((chunk, index) => {
      const chunkRef = ref(baseRef, `chunk_${index}`);
      return uploadString(chunkRef, JSON.stringify(chunk), "raw", {
        contentType: "application/json",
      }).then(() => getDownloadURL(chunkRef));
    });

    const chunkUrls = await Promise.all(uploadPromises);

    await updateDoc(doc(db, "users", userId, "files", fileId), {
      unstructuredFile: chunkUrls,
      chunkCount: chunks.length,
    });

    return { success: true, message: "Chunks uploaded successfully" };
  } catch (error) {
    logger.error("unstructuredActions", "Error uploading chunks", error);
    throw new Error("Chunk upload failed");
  }
};

// Function to download a file
const downloadUnstructuredFile = async (fileUrl: string | string[]) => {
  try {
    const urls = Array.isArray(fileUrl) ? fileUrl : [fileUrl];
    if (urls.length === 0) throw new Error("No unstructured file URL(s)");

    const responses = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
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
