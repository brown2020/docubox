"use client";

import { deleteFileFromRagie } from "@/actions/ragieActions";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";
import { BaseModal, ModalFooterButtons } from "./ui/base-modal";

export function DeleteModal() {
  const { user } = useUser();
  const pathname = usePathname();

  const isTrashPageActive = pathname.includes("trash");

  const { isDeleteModalOpen, setIsDeleteModalOpen } = useModalStore();
  const {
    fileId,
    setFileId,
    folderId: parentFolderId,
    setFolderId,
    isFolder,
    filename,
  } = useFileSelectionStore();

  const itemType = isFolder ? "Folder" : "File";

  async function deleteFilePermanent() {
    if (!user || !fileId) return;

    const toastId = toast.loading(`Deleting ${itemType.toLowerCase()}...`);

    try {
      if (isFolder) {
        await fileService.deleteFolderRecursive(user.id, fileId);
      } else {
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

      await fileService.permanentDelete(user.id, fileId, filename);

      toast.success(`${itemType} deleted successfully!`, { id: toastId });
      setIsDeleteModalOpen(false);
      setFileId("");
    } catch (error) {
      logger.error("DeleteModal", "Error deleting file", error);
      toast.error(`Error deleting ${itemType.toLowerCase()}!`, { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function softDelete() {
    if (!user || !fileId) return;
    const toastId = toast.loading(
      `Moving ${itemType.toLowerCase()} to trash...`
    );
    try {
      await fileService.softDelete(user.id, fileId);
      toast.success(`${itemType} moved to trash!`, { id: toastId });
    } catch (error) {
      logger.error("DeleteModal", "Error soft deleting file", error);
      toast.error(`Error deleting ${itemType.toLowerCase()}!`, { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function handleDelete() {
    if (isTrashPageActive) {
      await deleteFilePermanent();
    } else {
      await softDelete();
    }
  }

  const description = isTrashPageActive
    ? `This action cannot be undone. This will permanently delete your ${itemType.toLowerCase()}!`
    : `Deleting this ${itemType.toLowerCase()} will move it to the trash. To permanently delete it, you will need to empty the trash.`;

  return (
    <BaseModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title="Are you sure you want to delete?"
      description={description}
      footer={
        <ModalFooterButtons
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      }
    >
      {null}
    </BaseModal>
  );
}
