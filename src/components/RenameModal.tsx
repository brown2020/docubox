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
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import TagInput from "./ui/tagInput";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";

export function RenameModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Use focused stores
  const { isRenameModalOpen, setIsRenameModalOpen } = useModalStore();
  const { fileId, filename, tags: tagsList } = useFileSelectionStore();

  // Sync input with filename when modal opens or file changes
  useEffect(() => {
    if (isRenameModalOpen && fileId) {
      setInput(filename);
      setTags(tagsList);
    }
  }, [isRenameModalOpen, fileId, filename, tagsList]);

  async function renameFile() {
    // Require at least a filename to update
    if (!user || !fileId || !input.trim()) return;

    const toastId = toast.loading("Updating file...");
    try {
      await fileService.rename(user.id, fileId, input.trim(), tags);
      toast.success("File updated successfully!", { id: toastId });
      setIsRenameModalOpen(false);
    } catch (error) {
      logger.error("RenameModal", "Error updating file", error);
      toast.error("Error updating file!", { id: toastId });
    }
  }

  const handleClose = () => {
    setInput("");
    setTags([]);
    setIsRenameModalOpen(false);
  };

  return (
    <Dialog open={isRenameModalOpen} onOpenChange={handleClose}>
      <ModalContent>
        <DialogHeader>
          <DialogTitle className="pb-2">File Update</DialogTitle>

          <DialogDescription>Filename</DialogDescription>
          <Input
            id="filename"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") renameFile();
            }}
          />

          <DialogDescription>Tags</DialogDescription>
          <TagInput tags={tags} setTags={setTags} />
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
            onClick={renameFile}
            disabled={!input.trim()}
          >
            <span className="sr-only">Update</span>
            <span>Update</span>
          </Button>
        </DialogFooter>
      </ModalContent>
    </Dialog>
  );
}
