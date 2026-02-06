"use client";

import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/components/auth";
import { useCallback, useRef, useState } from "react";
import DropzoneComponent from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress-bar";
import { useNavigationStore } from "@/zustand/useNavigationStore";
import { fileService } from "@/services/fileService";
import { logger } from "@/lib/logger";
import { Upload } from "lucide-react";

const MAX_FILE_SIZE = 20971520; // 20MB

/**
 * Refactored Dropzone — provides:
 * 1. A compact UploadButton for the toolbar
 * 2. A full-page drag overlay for drag-and-drop
 * 3. An upload progress bar when active
 *
 * The large permanent drop area is removed. Upload starts via the button or drag-and-drop.
 */
export default function Dropzone() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("0");
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const folderId = useNavigationStore((state) => state.folderId);
  const loadingRef = useRef(false);

  const uploadPost = useCallback(
    async (selectedFile: File) => {
      if (loadingRef.current || !user) return;

      loadingRef.current = true;
      setLoading(true);

      const toastId = toast.loading("Uploading file...");
      try {
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
      for (const file of acceptedFiles) {
        await uploadPost(file);
      }
    },
    [uploadPost]
  );

  if (!isLoaded || !isSignedIn) return null;

  return (
    <DropzoneComponent
      minSize={0}
      maxSize={MAX_FILE_SIZE}
      onDrop={onDrop}
      noClick
      noKeyboard
    >
      {({ getRootProps, getInputProps, isDragActive, open: openFilePicker }) => (
        <>
          {/* Invisible root that captures drag events across the entire wrapper */}
          <div {...getRootProps()} className="contents">
            <input {...getInputProps()} />

            {/* Upload button for toolbar — rendered via ref/callback or portal */}
            <UploadButtonSlot open={openFilePicker} loading={loading} />

            {/* Upload progress bar */}
            {loading && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={parseInt(uploadProgress)} />
                  </div>
                </div>
              </div>
            )}

            {/* Full-page drag overlay */}
            {isDragActive && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto text-primary mb-3" />
                  <p className="text-lg font-medium text-foreground">
                    Drop files to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Max file size: 20 MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DropzoneComponent>
  );
}

/**
 * The upload button extracted as a sub-component.
 * Rendered inline in the Dropzone wrapper — the toolbar accesses it via the component tree.
 */
function UploadButtonSlot({
  open,
  loading,
}: {
  open: () => void;
  loading: boolean;
}) {
  // This renders a hidden store for the open function.
  // The actual visible button is rendered by the toolbar using <UploadButton>.
  // We store the open function in a module-level ref so UploadButton can call it.
  uploadFilePickerRef.current = open;
  uploadLoadingRef.current = loading;
  return null;
}

/** Module-level refs for the upload button to access the file picker */
const uploadFilePickerRef = { current: (() => {}) as () => void };
const uploadLoadingRef = { current: false };

/**
 * Compact upload button for use in the toolbar.
 * Triggers the react-dropzone file picker.
 */
export function UploadButton() {
  return (
    <Button
      size="sm"
      onClick={() => uploadFilePickerRef.current()}
      disabled={uploadLoadingRef.current}
    >
      <Upload className="h-4 w-4 mr-1.5" />
      Upload
    </Button>
  );
}
