"use client";

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, FileIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/zustand/useAppStore"
import { useUser } from "@clerk/nextjs";
import { Chunk } from "@/types/types";
import { parseFile } from "@/actions/parse";
import { uploadFile } from "@/actions/unstructuredActions";

export default function FileUploadModal() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { uploadingFiles, setOnFileAddedCallback, setUnstructuredFileData, removeUploadingFile } = useAppStore();

    const { user } = useUser();
    useEffect(() => {
        if (user?.id) {
            setOnFileAddedCallback(async (newFile) => {
                const data: Chunk[] = await parseFile(newFile?.downloadUrl, newFile.fileName);
                console.log({data});
                debugger;
                await uploadFile(data, user.id, newFile.fileName, newFile.fileId);
                // const compressedData = JSONCompressor.compress(data);
                // const unstructuredDataString = JSON.stringify(data, null, 2);
                // const unstructuredDataRef = ref(
                //     storage,
                //     `users/${user.id}/unstructured/${newFile.fileId}_${newFile.fileName}`
                // )

                // await uploadString(unstructuredDataRef, unstructuredDataString, 'raw', {
                //     contentType: 'application/json',
                // });

                // const unstructuredDataUrl = await getDownloadURL(unstructuredDataRef);
                debugger
                // await updateDoc(doc(db, "users", user.id, "files", newFile.fileId), {
                //     unstructuredFile: compressedData,
                // });
                setUnstructuredFileData(JSON.stringify(data, null, 2));
                removeUploadingFile(newFile.fileId);
            });
        }
        return () => setOnFileAddedCallback(null);
    }, [user?.id, setOnFileAddedCallback, setUnstructuredFileData]);

    if (uploadingFiles.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 w-80 bg-background border rounded-lg shadow-lg overflow-hidden">
            <div className="bg-secondary p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-secondary-foreground">{`${uploadingFiles.length} Uploading`}</span>
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
                        <div key={index} className={`flex items-center space-x-2 p-0.5 rounded-md ${file.isParsing ? 'blinking-background' : ''}`}>
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