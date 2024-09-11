"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Chunk, Element } from "@/types/types";
import { useAppStore } from "@/zustand/useAppStore";
import { useState } from "react";
const extractReadableText = (data: Chunk[] | null) => {
    if (!data) return null;
    // Flatten the content from all chunks
    const contentArray = data.flatMap(chunk => chunk.content);
    return (
        <div>
            {contentArray.map((item: Element) => (
                <div key={item.element_id} className="mb-2">
                    {/* Display metadata fields if available */}
                    {item.metadata && (
                        <>
                            {item.metadata.filename && (
                                <div>
                                    <strong className="text-blue-600">Filename:</strong> {item.metadata.filename}
                                </div>
                            )}
                            {item.metadata.email_message_id && (
                                <div>
                                    <strong className="text-blue-600">Email Message ID:</strong> {item.metadata.email_message_id}
                                </div>
                            )}
                            {item.metadata.sent_from && item.metadata.sent_from.length > 0 && (
                                <div>
                                    <strong className="text-blue-600">Sent From:</strong> {item.metadata.sent_from.join(', ')}
                                </div>
                            )}
                            {item.metadata.sent_to && item.metadata.sent_to.length > 0 && (
                                <div>
                                    <strong className="text-blue-600">Sent To:</strong> {item.metadata.sent_to.join(', ')}
                                </div>
                            )}
                            {item.metadata.subject && (
                                <div>
                                    <strong className="text-blue-600">Subject:</strong> {item.metadata.subject}
                                </div>
                            )}
                            {item.metadata.page_number && (
                                <div>
                                    <strong className="text-blue-600">Page Number:</strong> {item.metadata.page_number}
                                </div>
                            )}
                            {item.metadata.filetype && (
                                <div>
                                    <strong className="text-blue-600">File Type:</strong> {item.metadata.filetype}
                                </div>
                            )}
                            {item.metadata.languages && item.metadata.languages.length > 0 && (
                                <div>
                                    <strong className="text-blue-600">Languages:</strong> {item.metadata.languages.join(', ')}
                                </div>
                            )}
                        </>
                    )}
                    {/* Display element text */}
                    <div>
                        <strong className="text-blue-600">{item.type}:</strong> {item.text}
                    </div>
                </div>
            ))}
        </div>
    );
};
export function ShowParsedDataModel() {
    const { isShowParseDataModelOpen, setIsShowParseDataModelOpen, unstructuredFileData } =
        useAppStore();
    const [showRawJson, setShowRawJson] = useState(true);
    const toggleDataFormat = () => {
        setShowRawJson(!showRawJson);
    };
    return (
        <Dialog
            open={isShowParseDataModelOpen}
            onOpenChange={(isOpen) => setIsShowParseDataModelOpen(isOpen)}
        >
            <DialogContent className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Parsed Data</DialogTitle>
                </DialogHeader>
                <div className="overflow-auto h-[50vh] mb-4 p-4 bg-gray-50 rounded-lg">
                    {showRawJson ? (
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">{unstructuredFileData}</pre>
                    ) : (
                        <div>
                            {unstructuredFileData ? extractReadableText(JSON.parse(unstructuredFileData)) : ""}
                        </div>
                    )}
                </div>
                <DialogFooter className="flex justify-end space-x-2 py-3">
                    <Button
                        size="sm"
                        className="px-4"
                        variant="ghost"
                        onClick={() => setIsShowParseDataModelOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        size="sm"
                        className="px-4"
                        onClick={toggleDataFormat}
                    >
                        {showRawJson ? "Show Readable Format" : "Show Raw JSON"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}