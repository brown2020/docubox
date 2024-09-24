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
import { doc, updateDoc } from "firebase/firestore";

import { useEffect, useState } from "react";
import { Input } from "./ui/input";

import toast from "react-hot-toast";
import TagInput from "./ui/tagInput";

export function RenameModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const { isRenameModalOpen, setIsRenameModalOpen, fileId, filename, tags: tagsList } =
    useAppStore();
  
  useEffect(() => {
    if (fileId) {
      setTags(tagsList);
    }
  }, [fileId, setTags, tagsList])
  
  async function renameFile() {
    if (!user || !fileId || (!input && !tags)) return;

    const toastId = toast.loading("updating file...");
    try {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        filename: input,
        tags
      });
      toast.success("File updated successfully!", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Error updating file!", { id: toastId });
    } finally {
      setInput("");
      setIsRenameModalOpen(false);
    }
  }

  return (
    <Dialog
      open={isRenameModalOpen}
      onOpenChange={(isOpen) => setIsRenameModalOpen(isOpen)}
    >
      <DialogContent className="sm:max-w-md bg-slate-200 dark:bg-slate-600">
        <DialogHeader>
          <DialogTitle className="pb-2">File Update</DialogTitle>

          <DialogDescription>
            Filename
          </DialogDescription>
          <Input
            id="link"
            defaultValue={filename}
            onChange={(e) => setInput(e.target.value)}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") renameFile();
            }}
          />

          <DialogDescription>
            Tags
          </DialogDescription>
          <TagInput tags={tags} setTags={setTags} />
        </DialogHeader>

        <DialogFooter className="flex space-x-2 py-3">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={() => setIsRenameModalOpen(false)}
          >
            <span className="sr-only">Cancel</span>
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            size={"sm"}
            className="px-3 flex-1"
            onClick={() => renameFile()}
          >
            <span className="sr-only">Update</span>
            <span>Update</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
