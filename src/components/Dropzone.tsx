"use client";

import { db, storage } from "@/firebase";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useCallback, useRef, useState } from "react";
import DropzoneComponent from "react-dropzone";
import toast from "react-hot-toast";
import Spinner from "./common/spinner";
import { Progress } from "./ui/progress-bar";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";

const MAX_FILE_SIZE = 20971520; // 20MB

export default function Dropzone() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("0");
  const [processing, setProcessing] = useState(false);
  const { user } = useUser();
  const folderId = useFileSelectionStore((state) => state.folderId);

  // Use ref to track loading state in async callbacks
  const loadingRef = useRef(false);

  const uploadPost = useCallback(
    async (selectedFile: File) => {
      if (loadingRef.current || !user) return;

      loadingRef.current = true;
      setLoading(true);

      const toastId = toast.loading("Uploading file...");
      try {
        const docRef = await addDoc(collection(db, "users", user.id, "files"), {
          userId: user.id,
          fullName: user.fullName,
          profileImg: user.imageUrl,
          timestamp: serverTimestamp(),
          size: selectedFile.size,
          type: selectedFile.type,
          lastModified: selectedFile.lastModified,
          unstructuredFile: null,
          summary: null,
          deletedAt: null,
          folderId,
          isUploadedToRagie: false,
          ragieFileId: null,
        });

        const imageRef = ref(
          storage,
          `users/${user.id}/files/${docRef.id}_${selectedFile.name}`
        );
        const uploadTask = uploadBytesResumable(imageRef, selectedFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress.toFixed(2));
          },
          (error) => {
            console.error("[Dropzone] Upload error:", error);
            toast.error("Error uploading file");
            loadingRef.current = false;
            setLoading(false);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(imageRef);
              await updateDoc(doc(db, "users", user.id, "files", docRef.id), {
                downloadUrl,
                docId: docRef.id,
                filename: selectedFile.name,
              });

              toast.success("File uploaded successfully!", { id: toastId });
            } catch (error) {
              console.error("[Dropzone] Error fetching download URL:", error);
              toast.error("Error fetching download URL!", { id: toastId });
            } finally {
              loadingRef.current = false;
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error("[Dropzone] Error uploading file:", error);
        toast.error("Error uploading file!", { id: toastId });
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [user, folderId]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setProcessing(true);

      try {
        for (const file of acceptedFiles) {
          const reader = new FileReader();
          reader.onerror = () => {
            toast.error("Error reading file");
          };
          reader.onload = async () => {
            await uploadPost(file);
          };
          reader.readAsArrayBuffer(file);
        }
      } catch (err) {
        toast.error((err as Error).message || "An error occurred");
      } finally {
        setProcessing(false);
      }
    },
    [uploadPost]
  );

  return (
    <DropzoneComponent minSize={0} maxSize={MAX_FILE_SIZE} onDrop={onDrop}>
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 &&
          fileRejections[0].file.size > MAX_FILE_SIZE;
        return (
          <section className="my-4 hover:cursor-pointer">
            <div
              {...getRootProps()}
              className={cn(
                "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg hover:border-2 hover:border-gray-300 text-center",
                isDragActive
                  ? "bg-blue-500 text-white animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/80 text-slate-400"
              )}
            >
              <input {...getInputProps()} />
              {processing && (
                <div className="flex flex-col items-center">
                  <Spinner size="50" />
                  <p>Processing File</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center">
                  <p>Uploading File {uploadProgress}%</p>
                  <div className="max-w-[800px] w-[70vw]">
                    <Progress value={parseInt(uploadProgress)} />
                  </div>
                </div>
              )}
              {!isDragActive &&
                !processing &&
                !loading &&
                "Click here or drop a file to upload!"}
              {isDragActive &&
                !isDragReject &&
                !processing &&
                !loading &&
                "Drop to upload this file!"}
              {isDragReject && "Unsupported file type..."}
              {isFileTooLarge && (
                <div className="text-danger mt-2">File is too large.</div>
              )}
            </div>
          </section>
        );
      }}
    </DropzoneComponent>
  );
}
