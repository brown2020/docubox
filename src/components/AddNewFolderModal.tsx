"use client";

import { useModalStore, useIsModalOpen } from "@/zustand/useModalStore";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";
import { BaseModal, ModalFooterButtons } from "./ui/base-modal";

export function AddNewFolderModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const isOpen = useIsModalOpen("createFolder");
  const close = useModalStore((s) => s.close);
  const { folderId } = useNavigationStore();

  const isValidInput = input.trim().length > 0;

  async function createFolder() {
    if (!user || !isValidInput) return;

    const toastId = toast.loading("Creating folder...");
    try {
      await fileService.createFolder(user.id, input.trim(), folderId, {
        fullName: user.fullName || "",
        imageUrl: user.imageUrl || "",
      });

      toast.success("Folder created successfully!", { id: toastId });
      setInput("");
      close();
    } catch (error) {
      logger.error("AddNewFolderModal", "Error creating folder", error);
      toast.error("Error creating folder!", { id: toastId });
    }
  }

  const handleClose = () => {
    setInput("");
    close();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Folder"
      footer={
        <ModalFooterButtons
          onCancel={handleClose}
          onConfirm={createFolder}
          confirmText="Create"
          isConfirmDisabled={!isValidInput}
        />
      }
    >
      <div className="space-y-2 py-2">
        <label htmlFor="folder-name" className="text-sm font-medium">
          Folder Name
        </label>
        <Input
          id="folder-name"
          value={input}
          placeholder="Enter folder name"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValidInput) {
              createFolder();
            }
          }}
        />
      </div>
    </BaseModal>
  );
}
