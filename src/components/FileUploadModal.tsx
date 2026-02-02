"use client";

import { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadStore } from "@/zustand/useUploadStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { useUser } from "@/components/auth";
import { Chunk } from "@/types/types";
import { parseFile } from "@/actions/parse";
import { uploadUnstructuredFile } from "@/actions/unstructuredActions";
import { handleAPIAndCredits } from "@/utils/useApiAndCreditKeys";
import { useApiProfileData } from "@/hooks/useApiProfileData";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";

export default function FileUploadModal() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Use focused stores
  const { uploadingFiles, setOnFileAddedCallback, removeUploadingFile } =
    useUploadStore();
  const { setUnstructuredFileData } = useFileSelectionStore();

  // Use custom hook for profile data
  const apiProfileData = useApiProfileData();

  const { user } = useUser();

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    setOnFileAddedCallback(async (newFile) => {
      try {
        let data: Chunk[] = [];

        const handleParseFile = async (apiKey: string) => {
          data = await parseFile(newFile.downloadUrl, newFile.fileName, apiKey);

          // Check if still mounted before continuing
          if (!isMountedRef.current) return;

          await uploadUnstructuredFile(
            data,
            user.id,
            newFile.fileName,
            newFile.fileId
          );

          if (!isMountedRef.current) return;

          setUnstructuredFileData(JSON.stringify(data, null, 2));
          removeUploadingFile(newFile.fileId);
        };

        await handleAPIAndCredits(
          "unstructured",
          apiProfileData,
          handleParseFile
        );
      } catch (error) {
        if (!isMountedRef.current) return;

        removeUploadingFile(newFile.fileId);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          logger.error("FileUploadModal", "Error during file parsing", error);
          toast.error("An error occurred during file parsing.");
        }
      }
    });

    return () => setOnFileAddedCallback(null);
  }, [
    setOnFileAddedCallback,
    setUnstructuredFileData,
    removeUploadingFile,
    user,
    apiProfileData,
  ]);

  if (uploadingFiles.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-4 w-[450px] bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="bg-secondary p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-secondary-foreground">
            Parsing Files {uploadingFiles.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse file list" : "Expand file list"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {!isExpanded && uploadingFiles.length > 0 && (
          <LoaderCircleIcon size={20} className="animate-spin" />
        )}
      </div>
      {isExpanded && (
        <div className="p-3">
          {uploadingFiles.map((file) => (
            <div
              key={file.fileId}
              className={`flex items-center space-x-2 rounded-md p-2 border-2 mb-1 border-[#F1F5F9] ${
                file.isParsing ? "blinking-background" : "hover:bg-muted"
              }`}
            >
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground grow">
                {file.fileName}
              </span>
              <LoaderCircleIcon size={16} className="animate-spin" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
