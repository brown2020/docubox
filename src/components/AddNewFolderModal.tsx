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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useState } from "react";
import { Input } from "./ui/input";

import toast from "react-hot-toast";

export function AddNewFolderModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const { isCreateFolderModalOpen, setIsCreateFolderModalOpen, filename, folderId } =
    useAppStore();
  
  async function createFolder() {
    if (!user) return;

    const toastId = toast.loading("creating folder...");
    try {
      await addDoc(collection(db, "users", user.id, "files"), {
        filename: input,
        isFolder: true,
        folderId,
        userId: user.id,
        timestamp: serverTimestamp(),
        type: 'folder',
        fullName: user.fullName,
        profileImg: user.imageUrl,
        size: 0,
        lastModified: serverTimestamp(),
        unstructuredFile: null,
        summary: null,
      });

      toast.success("Folder created successfully!", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Error creating folder!", { id: toastId });
    } finally {
      setInput("");
      setIsCreateFolderModalOpen(false);
    }
  }

  return (
    <Dialog
      open={isCreateFolderModalOpen}
      onOpenChange={(isOpen) => setIsCreateFolderModalOpen(isOpen)}
    >
      <DialogContent className="sm:max-w-md bg-slate-200 dark:bg-slate-600">
        <DialogHeader>
          <DialogTitle className="pb-2">Create Folder</DialogTitle>

          <DialogDescription>
            Folder Name
          </DialogDescription>
          <Input
            id="link"
            defaultValue={filename}
            onChange={(e) => setInput(e.target.value)}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") createFolder();
            }}
          />
        </DialogHeader>

        <DialogFooter className="flex space-x-2 py-3">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={() => setIsCreateFolderModalOpen(false)}
          >
            <span className="sr-only">Cancel</span>
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            size={"sm"}
            className="px-3 flex-1"
            onClick={() => createFolder()}
          >
            <span className="sr-only">Update</span>
            <span>Update</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
