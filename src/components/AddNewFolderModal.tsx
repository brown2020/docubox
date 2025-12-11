"use client";

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
import { useState } from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";

export function AddNewFolderModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  // Use focused stores
  const { isCreateFolderModalOpen, setIsCreateFolderModalOpen } =
    useModalStore();
  const { folderId } = useFileSelectionStore();

  const isValidInput = input.trim().length > 0;

  async function createFolder() {
    if (!user) return;

    // Validate input
    if (!isValidInput) {
      toast.error("Please enter a folder name");
      return;
    }

    const toastId = toast.loading("Creating folder...");
    try {
      await fileService.createFolder(user.id, input.trim(), folderId, {
        fullName: user.fullName || "",
        imageUrl: user.imageUrl || "",
      });

      toast.success("Folder created successfully!", { id: toastId });
      setInput("");
      setIsCreateFolderModalOpen(false);
    } catch (error) {
      logger.error("AddNewFolderModal", "Error creating folder", error);
      toast.error("Error creating folder!", { id: toastId });
    }
  }

  const handleClose = () => {
    setInput("");
    setIsCreateFolderModalOpen(false);
  };

  return (
    <Dialog open={isCreateFolderModalOpen} onOpenChange={handleClose}>
      <ModalContent>
        <DialogHeader>
          <DialogTitle className="pb-2">Create Folder</DialogTitle>
          <DialogDescription>Folder Name</DialogDescription>
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
        </DialogHeader>

        <DialogFooter className="flex space-x-2 py-3">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant="ghost"
            onClick={handleClose}
          >
            <span className="sr-only">Cancel</span>
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            className="px-3 flex-1"
            onClick={createFolder}
            disabled={!isValidInput}
          >
            <span className="sr-only">Save</span>
            <span>Save</span>
          </Button>
        </DialogFooter>
      </ModalContent>
    </Dialog>
  );
}
