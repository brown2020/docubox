"use client";

import { useModalStore, useIsModalOpen } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
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
  const [tags, setTags] = useState<string[]>([]);

  const isOpen = useIsModalOpen("rename");
  const close = useModalStore((s) => s.close);
  const { fileId, filename, tags: tagsList } = useFileSelectionStore();

  useEffect(() => {
    if (isOpen && fileId) {
      // Defer updates to avoid synchronous setState inside effects (React Compiler rule).
      queueMicrotask(() => {
        setInput(filename);
        setTags(tagsList);
      });
    }
  }, [isOpen, fileId, filename, tagsList]);

  async function renameFile() {
    if (!user || !fileId || !input.trim()) return;

    const toastId = toast.loading("Updating file...");
    try {
      await fileService.rename(user.id, fileId, input.trim(), tags);
      toast.success("File updated successfully!", { id: toastId });
      close();
    } catch (error) {
      logger.error("RenameModal", "Error updating file", error);
      toast.error("Error updating file!", { id: toastId });
    }
  }

  const handleClose = () => {
    setInput("");
    setTags([]);
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
          <TagInput tags={tags} setTags={setTags} />
        </div>
      </div>
    </BaseModal>
  );
}
