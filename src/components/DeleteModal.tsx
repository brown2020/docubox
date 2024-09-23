"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/firebase";
import { useAppStore } from "@/zustand/useAppStore";
import { useUser } from "@clerk/nextjs";
import { collection, deleteDoc, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage"
import toast from "react-hot-toast";

export function DeleteModal() {
  const { user } = useUser();
  const { isDeleteModalOpen, setIsDeleteModalOpen, fileId, setFileId, folderId, setFolderId, isFolder, setIsFolder } =
    useAppStore();
  const storage = getStorage()

  async function deleteFolderContents(folderId: string, userId: string) {
    const filesCollectionRef = collection(db, `users/${userId}/files`);
    
    // Query to get all files and subfolders inside the current folder
    const q = query(filesCollectionRef, where("folderId", "==", folderId));
    const querySnapshot = await getDocs(q);
    // Loop through the documents (files and folders) in the folder
    const deletePromises = querySnapshot.docs.map(async (document) => {
      const data = document.data();
      debugger
      // If it's a folder, recursively delete its contents
      if (data.type === "folder") {
        await deleteFolderContents(data.id, userId);
      }
      debugger
      if (data.downloadUrl) {
        const fileRef = ref(storage, data.downloadURL);
        await deleteObject(fileRef);
      }

      // Delete the file or folder itself
      await deleteDoc(doc(db, `users/${userId}/files/`, data.id));
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
  }
  async function deleteFile() {
    if (!user || !fileId) return;

    const toastId = toast.loading("Deleting file/folder...");

    try {
      if (folderId) {
        await deleteFolderContents(fileId, user.id);
        await updateDoc(doc(db, "users", user.id, "files", folderId), {
          numberOfItems: increment(-1)
        });
        setFolderId(null)
      }
      const docRef = doc(db, `users/${user.id}/files/`, fileId); 
      await deleteDoc(docRef);
      
      toast.success("File deleted from storage!", { id: toastId });
      toast.success("File deleted successfully!", { id: toastId });
      setIsDeleteModalOpen(false);
      setFileId("");
    } catch (error) {
      console.log(error);
      toast.error("Error deleting file!", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  return (
    <Dialog
      open={isDeleteModalOpen}
      onOpenChange={(isOpen) => setIsDeleteModalOpen(isOpen)}
    >
      <DialogContent className="sm:max-w-md bg-slate-200 dark:bg-slate-600">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription className="bg-slate-200 dark:bg-slate-600">
            This action cannot be undone. This will permanently delete your
            file!
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
            onClick={() => deleteFile()}
          >
            <span className="sr-only">Delete</span>
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
