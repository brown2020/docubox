"use client";

import { deleteFileFromRagie } from "@/actions/ragieActions";
import {
  useModalStore,
  useIsModalOpen,
  useDeleteModalData,
} from "@/zustand/useModalStore";
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

  const isOpen = useIsModalOpen("delete");
  const close = useModalStore((s) => s.close);

  // Read data from modal store (single source of truth)
  const { fileId, isFolder } = useDeleteModalData();

  const itemType = isFolder ? "Folder" : "File";

  async function deleteFilePermanent() {
    if (!user || !fileId) return;

    const toastId = toast.loading(`Deleting ${itemType.toLowerCase()}...`);

    try {
      if (isFolder) {
        await fileService.deleteFolderRecursive(user.id, fileId);
        await fileService.deleteFileDocument(user.id, fileId);
      } else {
        const fileData = await fileService.getFile(user.id, fileId);
        if (fileData) {
          if (fileData.ragieFileId) {
            await deleteFileFromRagie(fileData.ragieFileId);
          }
          await fileService.permanentDelete(user.id, fileId, fileData.filename);
        }
      }

      toast.success(`${itemType} deleted successfully!`, { id: toastId });
      close();
    } catch (error) {
      logger.error("DeleteModal", "Error deleting file", error);
      toast.error(`Error deleting ${itemType.toLowerCase()}!`, { id: toastId });
    } finally {
      close();
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
      close();
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
      isOpen={isOpen}
      onClose={close}
      title="Are you sure you want to delete?"
      description={description}
      footer={
        <ModalFooterButtons
          onCancel={close}
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
