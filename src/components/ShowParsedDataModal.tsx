"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WideModalContent } from "@/components/ui/modal-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useModalStore, useIsModalOpen } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { Chunk, Element } from "@/types/types";
import { generateSummary } from "@/actions/generateSummary";
import useProfileStore from "@/zustand/useProfileStore";
import { getCreditCost } from "@/constants/credits";
import { downloadUnstructuredFile } from "@/actions/unstructuredActions";
import { useDocument } from "@/hooks/useDocument";
import { logger } from "@/lib/logger";
import { fileService } from "@/services/fileService";
import { LoadingState } from "./common/LoadingState";

export function ShowParsedDataModal() {
  const { user } = useUser();

  // Use new modal pattern
  const isOpen = useIsModalOpen("parseData");
  const close = useModalStore((s) => s.close);

  const {
    unstructuredFileData,
    setUnstructuredFileData,
    fileSummary,
    fileId,
    setFileId,
    setFileSummary,
  } = useFileSelectionStore();

  // Use custom hook for document fetching
  const { document, isLoading: isDocLoading } = useDocument(user?.id, fileId, {
    immediate: !unstructuredFileData,
  });

  const isAIAlreadyCalled = useRef(false);
  const [loading, setLoading] = useState(false);
  const [isUnstructuredLoading, setUnstructuredLoading] = useState(false);

  const [parsedData, setParsedData] = useState<Chunk[] | []>([]);
  const [summary, setSummary] = useState("");

  const useCredits = useProfileStore((state) => state.profile.useCredits);
  const apiKey = useProfileStore((state) => state.profile.openai_api_key);
  const currentCredits = useProfileStore((state) => state.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  const fetchUnstructuredData = useCallback(async () => {
    if (
      user &&
      document &&
      document.unstructuredFile &&
      !unstructuredFileData
    ) {
      try {
        setUnstructuredLoading(true);
        const data = await downloadUnstructuredFile(document.unstructuredFile);
        setUnstructuredFileData(data);
      } catch (error) {
        logger.error(
          "ShowParsedDataModal",
          "Error fetching unstructured data",
          error
        );
      } finally {
        setUnstructuredLoading(false);
      }
    }
  }, [document, user, unstructuredFileData, setUnstructuredFileData]);

  useEffect(() => {
    fetchUnstructuredData();
  }, [fetchUnstructuredData]);

  const updateRecord = useCallback(
    async (docId: string, summaryText: string | undefined) => {
      if (!user) return;
      await fileService.updateSummary(user.id, docId, summaryText ?? null);
    },
    [user]
  );

  const fetchSummary = useCallback(async () => {
    if (
      !fileSummary ||
      !unstructuredFileData ||
      isAIAlreadyCalled.current ||
      fileSummary.summary
    ) {
      return;
    }
    isAIAlreadyCalled.current = true;
    try {
      const requiredCredits = getCreditCost("open-ai");
      if (useCredits && currentCredits < requiredCredits) {
        return;
      }

      setLoading(true);
      const generatedSummary = await generateSummary(
        useCredits ? null : apiKey,
        JSON.stringify(parsedData)
      );

      if (generatedSummary) {
        setSummary(generatedSummary);
      }

      if (fileSummary) {
        await updateRecord(fileSummary.docId, generatedSummary || "");
      }

      if (generatedSummary && useCredits) {
        await minusCredits(requiredCredits);
      }
    } catch (error) {
      isAIAlreadyCalled.current = false;
      logger.error("ShowParsedDataModal", "Error generating summary", error);
    } finally {
      setLoading(false);
    }
  }, [
    fileSummary,
    unstructuredFileData,
    useCredits,
    currentCredits,
    apiKey,
    parsedData,
    updateRecord,
    minusCredits,
  ]);

  const extractReadableText = (data: Chunk[] = []) => {
    if (!data) return <p>No content to display.</p>;

    const contentArray = data[0]?.content || [];
    if (contentArray.length === 0)
      return <p>No readable content found in the file.</p>;

    // Group elements by their parent ID, if applicable
    const groupedContent = contentArray.reduce((acc, item) => {
      const parentId = item.metadata.parent_id || "root";
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(item);
      return acc;
    }, {} as Record<string, Element[]>);

    // Render the grouped elements
    return Object.keys(groupedContent).map((parentId) => {
      const elements = groupedContent[parentId];
      return (
        <div key={parentId} className="grouped-content">
          {elements.map((item) => {
            switch (item.type) {
              case "Title":
              case "NarrativeText":
                return (
                  <div key={item.element_id} className="mb-2">
                    <strong>{item.type}:</strong> {item.text}
                  </div>
                );

              case "UncategorizedText":
                if (/^\d+$/.test(item.text || "")) {
                  return null;
                }
                return (
                  <div key={item.element_id} className="mb-2 text-gray-500">
                    <strong>Uncategorized:</strong> {item.text}
                  </div>
                );

              case "Header":
              case "Footer":
                return (
                  <div key={item.element_id} className="mb-2 font-bold text-lg">
                    {item.text} ({item.type})
                  </div>
                );

              case "PageNumber":
                return (
                  <div key={item.element_id} className="mb-2">
                    <strong>Page:</strong> {item.text}
                  </div>
                );

              case "Image":
                return (
                  <div key={item.element_id} className="mb-2">
                    <strong>Image:</strong> {item.text || "No descriptive text"}
                  </div>
                );

              default:
                return (
                  <div key={item.element_id} className="mb-2">
                    <strong>{item.type}:</strong> {item.text || "N/A"}
                  </div>
                );
            }
          })}
        </div>
      );
    });
  };

  const fetchReadableFormat = useCallback(() => {
    if (!unstructuredFileData) return;
    setParsedData(JSON.parse(unstructuredFileData));
  }, [unstructuredFileData]);

  const handleClose = () => {
    close();
    setFileId(null);
    setUnstructuredFileData("");
    setFileSummary(undefined);
  };

  const isDataLoading = isDocLoading || isUnstructuredLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <WideModalContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Parsed Data
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="raw" className="overflow-hidden">
          <div className="flex justify-center my-2">
            <TabsList>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
              <TabsTrigger
                value="readable"
                onClick={() => fetchReadableFormat()}
              >
                Readable format
              </TabsTrigger>
              <TabsTrigger value="summary" onClick={() => fetchSummary()}>
                Summary
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="overflow-auto h-[70vh] p-4 bg-gray-50 rounded-lg w-full">
            <TabsContent value="raw" className="w-full h-[98%]">
              {isDataLoading ? (
                <LoadingState message="Loading Raw Data..." />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 w-full">
                  {unstructuredFileData}
                </pre>
              )}
            </TabsContent>
            <TabsContent value="readable" className="text-gray-800">
              {loading ? (
                <LoadingState message="Processing..." size={40} />
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg">
                  {extractReadableText(
                    Array.isArray(parsedData) ? parsedData : [parsedData]
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="summary" className="text-gray-800">
              {loading ? (
                <LoadingState message="Generating summary..." size={40} />
              ) : (
                summary || fileSummary?.summary || "Can't display anything yet."
              )}
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter className="flex justify-end space-x-2 py-3">
          <Button
            size="sm"
            className="px-4"
            variant="ghost"
            onClick={handleClose}
          >
            Close
          </Button>
        </DialogFooter>
      </WideModalContent>
    </Dialog>
  );
}
