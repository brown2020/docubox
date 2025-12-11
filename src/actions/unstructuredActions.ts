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
const downloadUnstructuredFile = async (fileUrl: string) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.error("unstructuredActions", "Error downloading file", error);
    throw new Error("File download failed");
  }
};

export { uploadUnstructuredFile, downloadUnstructuredFile };
