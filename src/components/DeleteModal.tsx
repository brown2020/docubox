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
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export function DeleteModal() {
  const { user } = useUser();
  const { isDeleteModalOpen, setIsDeleteModalOpen, fileId, setFileId } =
    useAppStore();
  async function deleteFile() {
    if (!user || !fileId) return;

    const toastId = toast.loading("Deleting file...");

    try {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
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
