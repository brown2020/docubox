"use client";

import { useState } from "react"
import { ChevronDown, ChevronUp, FileIcon, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/zustand/useAppStore"

export default function FileUploadModal() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { uploadingFiles, addUploadingFile, updateUploadingFile, removeUploadingFile } = useAppStore()

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg overflow-hidden">
            <div className="bg-secondary p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-secondary-foreground">Uploading 1 item</span>
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
            </div>
            {isExpanded && (
                <div className="p-3">
                    <div className="flex items-center space-x-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground flex-grow">g-suite-chrome-steps.gif</span>
                        <LoaderCircle className="h-5 w-5 text-primary animate-spin" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground flex-grow">g-suite-chrome-steps.gif</span>
                        <LoaderCircle className="h-5 w-5 text-primary animate-spin" />
                    </div>
                </div>
            )}
        </div>
    )
}