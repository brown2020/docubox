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
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";

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
    filename,
  } = useFileSelectionStore();

  async function deleteFilePermanent() {
    if (!user || !fileId) return;

    const toastId = toast.loading("Deleting file/folder...");

    try {
      if (isFolder) {
        await fileService.deleteFolderRecursive(user.id, fileId);
      } else {
        // Get file data for Ragie cleanup
        const fileData = await fileService.getFile(user.id, fileId);
        if (fileData) {
          if (fileData.ragieFileId) {
            await deleteFileFromRagie(fileData.ragieFileId);
          }
          await fileService.deleteFromStorage(
            user.id,
            fileId,
            fileData.filename
          );
        }
      }

      if (parentFolderId) {
        setFolderId(null);
      }

      // Delete from Firestore
      await fileService.permanentDelete(user.id, fileId, filename);

      toast.success("File deleted successfully!", { id: toastId });
      setIsDeleteModalOpen(false);
      setFileId("");
    } catch (error) {
      logger.error("DeleteModal", "Error deleting file", error);
      toast.error("Error deleting file!", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function softDelete() {
    if (!user || !fileId) return;
    const toastId = toast.loading("Deleting file/folder...");
    try {
      await fileService.softDelete(user.id, fileId);
      toast.success("File deleted successfully!", { id: toastId });
    } catch (error) {
      logger.error("DeleteModal", "Error soft deleting file", error);
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
