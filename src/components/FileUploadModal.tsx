"use client";

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, FileIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/zustand/useAppStore"
import { useUser } from "@clerk/nextjs";
import { Chunk } from "@/types/types";
import { parseFile } from "@/actions/parse";
import { uploadUnstructuredFile } from "@/actions/unstructuredActions";
import useProfileStore from "@/zustand/useProfileStore";
import { handleAPIAndCredits } from "@/utils/useApiAndCreditKeys";
import toast from "react-hot-toast";


export default function FileUploadModal() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { uploadingFiles, setOnFileAddedCallback, setUnstructuredFileData, removeUploadingFile } = useAppStore();
    const userProfileState = useProfileStore((state) => state);

    const { user } = useUser();
    useEffect(() => {
        if (user && user?.id) {
            setOnFileAddedCallback(async (newFile) => {
                try {
                    let data: Chunk[] = [];
                    const handleParseFile = async (apiKey: string) => {
                        data = await parseFile(newFile?.downloadUrl, newFile.fileName, apiKey);
                        await uploadUnstructuredFile(data, user.id, newFile.fileName, newFile.fileId);
                        setUnstructuredFileData(JSON.stringify(data, null, 2));
                        removeUploadingFile(newFile.fileId);
                    }
                    await handleAPIAndCredits("unstructured", userProfileState, handleParseFile);
                }
                catch (error) {
                    removeUploadingFile(newFile.fileId);
                    if (error instanceof Error) {
                        toast.error(error.message);
                    } else {
                        toast.error("An error occurred at file Parsing.");
                    }
                }
            });
        }
        return () => setOnFileAddedCallback(null);
    }, [setOnFileAddedCallback, setUnstructuredFileData, removeUploadingFile, user, userProfileState]);

    if (uploadingFiles.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-16 left-4 w-[450px] bg-background border rounded-lg shadow-lg overflow-hidden">
            <div className="bg-secondary p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-secondary-foreground">Parsing Files {uploadingFiles.length}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {(!isExpanded && !!uploadingFiles.length) && <LoaderCircleIcon size={20} className="animate-spin" />}
            </div>
            {isExpanded && (
                <div className="p-3">
                    {uploadingFiles.map((file, index) => (
                        <div key={index} className={`flex items-center space-x-2 rounded-md p-2 border-2 mb-1 border-[#F1F5F9] ${file.isParsing ? 'blinking-background' : 'hover:bg-muted'}`}>
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground flex-grow">{file.fileName}</span>
                            <LoaderCircleIcon size={16} className="animate-spin" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}