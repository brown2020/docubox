"use client";

import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/components/auth";
import { useCallback, useRef, useState } from "react";
import DropzoneComponent from "react-dropzone";
import toast from "react-hot-toast";
import { LoadingState } from "./common/LoadingState";
import { Progress } from "./ui/progress-bar";
import { Skeleton } from "./ui/skeleton";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 20971520; // 20MB

export default function Dropzone() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("0");
  const [processing, setProcessing] = useState(false);
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const folderId = useNavigationStore((state) => state.folderId);

  // Use ref to track loading state in async callbacks
  const loadingRef = useRef(false);

  const uploadPost = useCallback(
    async (selectedFile: File) => {
      if (loadingRef.current || !user) return;

      loadingRef.current = true;
      setLoading(true);

      const toastId = toast.loading("Uploading file...");
      try {
        // Create file entry and start upload using fileService
        const { docId, uploadTask, storageRef } =
          await fileService.createFileEntry({
            userId: user.id,
            userMeta: {
              fullName: user.fullName || "",
              imageUrl: user.imageUrl || "",
            },
            file: selectedFile,
            folderId,
          });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress.toFixed(2));
          },
          (error) => {
            logger.error("Dropzone", "Upload error", error);
            toast.error("Error uploading file");
            loadingRef.current = false;
            setLoading(false);
          },
          async () => {
            try {
              await fileService.completeFileUpload(
                user.id,
                docId,
                selectedFile.name,
                storageRef
              );
              toast.success("File uploaded successfully!", { id: toastId });
            } catch (error) {
              logger.error("Dropzone", "Error completing upload", error);
              toast.error("Error fetching download URL!", { id: toastId });
            } finally {
              loadingRef.current = false;
              setLoading(false);
            }
          }
        );
      } catch (error) {
        logger.error("Dropzone", "Error creating file entry", error);
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
          await uploadPost(file);
        }
      } catch (err) {
        toast.error((err as Error).message || "An error occurred");
      } finally {
        setProcessing(false);
      }
    },
    [uploadPost]
  );

  // Show skeleton while auth is loading or user is not signed in
  if (!isLoaded || !isSignedIn) {
    return (
      <section className="my-4">
        <Skeleton className="w-full h-52 rounded-lg" />
      </section>
    );
  }

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
                <LoadingState
                  message="Processing file..."
                  size={40}
                  fullHeight={false}
                />
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
