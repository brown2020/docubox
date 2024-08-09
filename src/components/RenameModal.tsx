"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/firebase";
import { useAppStore } from "@/zustand/useAppStore";
import { useUser } from "@clerk/nextjs";
import { doc, updateDoc } from "firebase/firestore";

import { useState } from "react";
import { Input } from "./ui/input";

import toast from "react-hot-toast";

export function RenameModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const { isRenameModalOpen, setIsRenameModalOpen, fileId, filename } =
    useAppStore();

  async function renameFile() {
    if (!user || !fileId || !input) return;

    const toastId = toast.loading("Renaming file...");
    try {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        filename: input,
      });

      toast.success("File renamed successfully!", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Error renaming file!", { id: toastId });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pb-2">Rename the File</DialogTitle>

          <Input
            id="link"
            defaultValue={filename}
            onChange={(e) => setInput(e.target.value)}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") renameFile();
            }}
          />
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
            <span className="sr-only">Rename</span>
            <span>Rename</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
