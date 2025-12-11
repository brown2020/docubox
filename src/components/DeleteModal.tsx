"use client";

import { deleteFileFromRagie } from "@/actions/ragieActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalContent } from "@/components/ui/modal-content";
import { db } from "@/firebase";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getStorage, listAll, ref } from "firebase/storage";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export function DeleteModal() {
  const { user } = useUser();
  const pathname = usePathname();

  const isTrashPageActive = pathname.includes("trash");

  // Use focused stores
  const { isDeleteModalOpen, setIsDeleteModalOpen } = useModalStore();
  const {
    fileId,
    setFileId,
    folderId: parentFolderId,
    setFolderId,
    isFolder,
  } = useFileSelectionStore();

  const storage = getStorage();

  async function deleteFileFromStorage(fileName: string) {
    const filePath = `users/${user?.id}/files/${fileName}`;
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    const undstructureFileRef = ref(
      storage,
      `users/${user?.id}/unstructured/${fileId}_${fileName}`
    );
    const listResults = await listAll(undstructureFileRef);
    const deletePromises = listResults.items.map((itemRef) =>
      deleteObject(itemRef)
    );
    await Promise.all(deletePromises);
  }

  async function deleteFolderContents(folderId: string, userId: string) {
    const filesCollectionRef = collection(db, `users/${userId}/files`);

    // Query to get all files and subfolders inside the current folder
    const q = query(filesCollectionRef, where("folderId", "==", folderId));
    const querySnapshot = await getDocs(q);
    // Loop through the documents (files and folders) in the folder
    const deletePromises = querySnapshot.docs.map(async (document) => {
      const data = document.data();
      // If it's a folder, recursively delete its contents
      if (data.type === "folder") {
        await deleteFolderContents(document.id, userId);
        await deleteDoc(doc(db, `users/${userId}/files/`, document.id));
      } else {
        const fileName = `${data.docId}_${data.filename}`;
        await deleteFileFromStorage(fileName);
        await deleteDoc(doc(db, `users/${userId}/files/`, data.docId));
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
  }

  async function deleteFilePermanent() {
    if (!user || !fileId) return;

    const toastId = toast.loading("Deleting file/folder...");

    try {
      if (isFolder) {
        await deleteFolderContents(fileId, user.id);
      }

      if (parentFolderId) {
        setFolderId(null);
      }
      const docRef = doc(db, `users/${user.id}/files/`, fileId);

      if (!isFolder) {
        const docSnap = await getDoc(docRef);
        const document = docSnap.data();
        if (document) {
          if (document.ragieFileId)
            await deleteFileFromRagie(document.ragieFileId);
          const fileName = `${document.docId}_${document.filename}`;
          await deleteFileFromStorage(fileName);
        }
      }

      await deleteDoc(docRef);

      toast.success("File deleted successfully!", { id: toastId });
      setIsDeleteModalOpen(false);
      setFileId("");
    } catch (error) {
      console.error("[DeleteModal] Error deleting file:", error);
      toast.error("Error deleting file!", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function softDelete() {
    if (!user || !fileId) return;
    const toastId = toast.loading("Deleting file/folder...");
    try {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        deletedAt: new Date(),
      });
      toast.success("File deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("[DeleteModal] Error soft deleting file:", error);
      toast.error("Error deleting file!", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function deleteFile() {
    if (isTrashPageActive) {
      await deleteFilePermanent();
    } else {
      await softDelete();
    }
  }

  return (
    <Dialog
      open={isDeleteModalOpen}
      onOpenChange={(isOpen) => setIsDeleteModalOpen(isOpen)}
    >
      <ModalContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription className="bg-slate-200 dark:bg-slate-600">
            {isTrashPageActive
              ? `This action cannot be undone. This will permanently delete your ${
                  isFolder ? "Folder" : "File"
                }!`
              : `Deleting a ${
                  isFolder ? "Folder" : "File"
                } will move it to the trash. To permanently delete it, you will need to empty the trash.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex space-x-2 py-3">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <span className="sr-only">Cancel</span>
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            size={"sm"}
            className="px-3 flex-1"
            variant={"destructive"}
            onClick={deleteFile}
          >
            <span className="sr-only">Delete</span>
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </ModalContent>
    </Dialog>
  );
}
