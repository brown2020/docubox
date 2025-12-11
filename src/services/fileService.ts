import { db, storage } from "@/firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  listAll,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from "firebase/storage";
import { logger } from "@/lib/logger";

/**
 * Metadata for creating files/folders
 */
interface UserMeta {
  fullName: string;
  imageUrl: string;
}

/**
 * Data for creating a new file entry
 */
interface CreateFileEntryData {
  userId: string;
  userMeta: UserMeta;
  file: File;
  folderId: string | null;
}

/**
 * Result of creating a file entry
 */
interface CreateFileEntryResult {
  docId: string;
  uploadTask: UploadTask;
  storageRef: ReturnType<typeof ref>;
}

/**
 * Centralized file operations service.
 * Consolidates all file CRUD operations for consistency and maintainability.
 */
export const fileService = {
  /**
   * Create a new file entry in Firestore and start upload to storage
   */
  async createFileEntry({
    userId,
    userMeta,
    file,
    folderId,
  }: CreateFileEntryData): Promise<CreateFileEntryResult> {
    // Create Firestore document
    const docRef = await addDoc(collection(db, "users", userId, "files"), {
      userId,
      fullName: userMeta.fullName,
      profileImg: userMeta.imageUrl,
      timestamp: serverTimestamp(),
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      unstructuredFile: null,
      summary: null,
      deletedAt: null,
      folderId,
      isUploadedToRagie: false,
      ragieFileId: null,
    });

    // Setup storage upload
    const storageRef = ref(
      storage,
      `users/${userId}/files/${docRef.id}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    logger.debug("fileService", {
      action: "createFileEntry",
      docId: docRef.id,
      filename: file.name,
    });

    return { docId: docRef.id, uploadTask, storageRef };
  },

  /**
   * Complete file upload by updating document with download URL
   */
  async completeFileUpload(
    userId: string,
    docId: string,
    filename: string,
    storageRef: ReturnType<typeof ref>
  ): Promise<string> {
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", userId, "files", docId), {
      downloadUrl,
      docId,
      filename,
    });
    logger.debug("fileService", {
      action: "completeFileUpload",
      docId,
      filename,
    });
    return downloadUrl;
  },

  /**
   * Soft delete a file (move to trash)
   */
  async softDelete(userId: string, fileId: string): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      deletedAt: new Date(),
    });
    logger.debug("fileService", { action: "softDelete", fileId });
  },

  /**
   * Restore a file from trash
   */
  async restore(userId: string, fileId: string): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      deletedAt: null,
    });
    logger.debug("fileService", { action: "restore", fileId });
  },

  /**
   * Rename a file and update its tags
   */
  async rename(
    userId: string,
    fileId: string,
    filename: string,
    tags: string[]
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      filename: filename.trim(),
      tags,
    });
    logger.debug("fileService", { action: "rename", fileId, filename });
  },

  /**
   * Move a file to a different folder
   */
  async moveToFolder(
    userId: string,
    fileId: string,
    folderId: string | null
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      folderId,
    });
    logger.debug("fileService", { action: "moveToFolder", fileId, folderId });
  },

  /**
   * Create a new folder
   */
  async createFolder(
    userId: string,
    folderName: string,
    parentFolderId: string | null,
    userMeta: UserMeta
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "users", userId, "files"), {
      filename: folderName.trim(),
      folderId: parentFolderId,
      userId,
      timestamp: serverTimestamp(),
      type: "folder",
      fullName: userMeta.fullName,
      profileImg: userMeta.imageUrl,
      size: 0,
      lastModified: serverTimestamp(),
      unstructuredFile: null,
      summary: null,
      deletedAt: null,
    });
    logger.debug("fileService", {
      action: "createFolder",
      folderId: docRef.id,
    });
    return docRef.id;
  },

  /**
   * Update document with parsed file data
   */
  async updateParsedData(
    userId: string,
    fileId: string,
    data: {
      unstructuredFile?: string[] | null;
      chunkCount?: number;
      summary?: string | null;
    }
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), data);
    logger.debug("fileService", { action: "updateParsedData", fileId });
  },

  /**
   * Update Ragie upload status
   */
  async updateRagieStatus(
    userId: string,
    fileId: string,
    ragieFileId: string
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      isUploadedToRagie: true,
      ragieFileId,
    });
    logger.debug("fileService", {
      action: "updateRagieStatus",
      fileId,
      ragieFileId,
    });
  },

  /**
   * Update QA records for a file
   */
  async updateQARecords(
    userId: string,
    fileId: string,
    qaRecords: Array<{ id: string; question: string; answer: string }>
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId, "files", fileId), {
      qaRecords,
    });
    logger.debug("fileService", { action: "updateQARecords", fileId });
  },

  /**
   * Delete a file from storage
   */
  async deleteFromStorage(
    userId: string,
    fileId: string,
    filename: string
  ): Promise<void> {
    const filePath = `users/${userId}/files/${fileId}_${filename}`;
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    // Also delete unstructured files
    const unstructuredRef = ref(
      storage,
      `users/${userId}/unstructured/${fileId}_${filename}`
    );
    try {
      const listResults = await listAll(unstructuredRef);
      await Promise.all(
        listResults.items.map((itemRef) => deleteObject(itemRef))
      );
    } catch {
      // Unstructured folder may not exist
    }

    logger.debug("fileService", { action: "deleteFromStorage", fileId });
  },

  /**
   * Permanently delete a file and its storage
   */
  async permanentDelete(
    userId: string,
    fileId: string,
    filename: string
  ): Promise<void> {
    await this.deleteFromStorage(userId, fileId, filename);
    await deleteDoc(doc(db, "users", userId, "files", fileId));
    logger.debug("fileService", { action: "permanentDelete", fileId });
  },

  /**
   * Delete a folder and all its contents recursively
   */
  async deleteFolderRecursive(userId: string, folderId: string): Promise<void> {
    const filesCollectionRef = collection(db, `users/${userId}/files`);
    const q = query(filesCollectionRef, where("folderId", "==", folderId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(async (document) => {
      const data = document.data();
      if (data.type === "folder") {
        await this.deleteFolderRecursive(userId, document.id);
        await deleteDoc(doc(db, "users", userId, "files", document.id));
      } else {
        await this.deleteFromStorage(userId, data.docId, data.filename);
        await deleteDoc(doc(db, "users", userId, "files", data.docId));
      }
    });

    await Promise.all(deletePromises);
    logger.debug("fileService", { action: "deleteFolderRecursive", folderId });
  },

  /**
   * Get a single file document
   */
  async getFile(userId: string, fileId: string) {
    const docRef = doc(db, "users", userId, "files", fileId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
};
