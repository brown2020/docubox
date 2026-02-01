"use client";

import {
  useModalStore,
  useIsModalOpen,
  useRenameModalData,
} from "@/zustand/useModalStore";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import TagInput from "./ui/tagInput";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";
import { BaseModal, ModalFooterButtons } from "./ui/base-modal";

export function RenameModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);

  const isOpen = useIsModalOpen("rename");
  const close = useModalStore((s) => s.close);

  // Read data from modal store (single source of truth)
  const { fileId, filename, tags } = useRenameModalData();

  useEffect(() => {
    if (isOpen && fileId) {
      // Defer updates to avoid synchronous setState inside effects (React Compiler rule).
      queueMicrotask(() => {
        setInput(filename || "");
        setLocalTags(tags || []);
      });
    }
  }, [isOpen, fileId, filename, tags]);

  async function renameFile() {
    if (!user || !fileId || !input.trim()) return;

    const toastId = toast.loading("Updating file...");
    try {
      await fileService.rename(user.id, fileId, input.trim(), localTags);
      toast.success("File updated successfully!", { id: toastId });
      close();
    } catch (error) {
      logger.error("RenameModal", "Error updating file", error);
      toast.error("Error updating file!", { id: toastId });
    }
  }

  const handleClose = () => {
    setInput("");
    setLocalTags([]);
    close();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit File"
      footer={
        <ModalFooterButtons
          onCancel={handleClose}
          onConfirm={renameFile}
          confirmText="Update"
          isConfirmDisabled={!input.trim()}
        />
      }
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label htmlFor="filename" className="text-sm font-medium">
            Filename
          </label>
          <Input
            id="filename"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) renameFile();
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <TagInput tags={localTags} setTags={setLocalTags} />
        </div>
      </div>
    </BaseModal>
  );
}
