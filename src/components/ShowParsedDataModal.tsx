"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAppStore } from "@/zustand/useAppStore";
import Spinner from "./common/spinner";
import { Chunk, Element } from "@/types/types";
import { generateSummary } from "@/actions/generateSummary";
import useProfileStore from "@/zustand/useProfileStore";
import { creditsToMinus } from "@/utils/credits";
import { parseFile } from "@/actions/parse";
import { FileType } from "@/typings/filetype";
import { LoaderCircleIcon } from "lucide-react";

export function ShowParsedDataModal() {
  const {
    isShowParseDataModelOpen,
    setIsShowParseDataModelOpen,
    unstructuredFileData,
    setUnstructuredFileData,
    fileSummary,
    fileId,
  } = useAppStore();
  const { user } = useUser();
  const isAIAlreadyCalled = useRef(false);
  const [loading, setLoading] = useState(false);
  const [isDocLoading, setDocLoading] = useState(false);
  const [isUnstructuredLoading, setUnstructuredLoading] = useState(false);
  const [document, setDocument] = useState<FileType>();

  const [parsedData, setParsedData] = useState<Chunk[] | null>(null);
  const [summary, setSummary] = useState("");
  const useCredits = useProfileStore((state) => state.profile.useCredits);
  const apiKey = useProfileStore((state) => state.profile.openai_api_key);
  const currentCredits = useProfileStore((state) => state.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  const getDocument = useCallback(async () => {
    if (user?.id && fileId) {
      setDocLoading(true);

      const docRef = doc(db, `users`, user?.id, "files", fileId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setDocLoading(false);
        return;
      }

      const data = docSnap.data();
      setDocument(data as FileType);
      setDocLoading(false);
    }
  }, [fileId, user?.id]);

  useEffect(() => {
    if (!unstructuredFileData) {
      getDocument();
    }
  }, [unstructuredFileData, getDocument]);

  const fetchUnstructuredData = useCallback(async () => {
    if (user && document && !!!document.unstructuredFile) {
      try {
        setUnstructuredLoading(true);
        const data: Chunk[] = await parseFile(
          document?.downloadUrl,
          document.filename
        );
        await updateDoc(doc(db, "users", user.id, "files", document.docId), {
          unstructuredFile: JSON.stringify(data, null, 2),
        });

        setUnstructuredFileData(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error(error);
      } finally {
        setUnstructuredLoading(false);
      }
    }
  }, [document, setUnstructuredFileData, user]);

  useEffect(() => {
    fetchUnstructuredData();
  }, [fetchUnstructuredData]);

  const fetchSummary = async () => {
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
      if (
        useCredits &&
        currentCredits <
          Number(process.env.NEXT_PUBLIC_CREDITS_PER_OPEN_AI || 4)
      )
        return;

      setLoading(true);
      const summary = await generateSummary(
        useCredits ? null : apiKey,
        unstructuredFileData
      );

      if (summary) {
        setSummary(summary);
      }

      if (fileSummary) {
        await updateRecord(fileSummary.docId, summary || "");
      }

      if (summary && useCredits) {
        await minusCredits(creditsToMinus("open-ai"));
      }
    } catch (error) {
      isAIAlreadyCalled.current = false;
      console.error("Error parsing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractReadableText = (data: Chunk[] | null) => {
    if (!data) return <p>No content to display.</p>;

    const contentArray = data[0]?.content || [];
    if (contentArray.length === 0)
      return <p>No readable content found in the file.</p>;

    // Group elements by their parent ID, if applicable
    const groupedContent = contentArray.reduce((acc, item) => {
      const parentId = item.metadata.parent_id || "root"; // "root" for elements without a parent
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
                // Ignore elements that are just numbers if PageNumber is also present
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

  const fetchReadableFormat = async () => {
    if (!unstructuredFileData) {
      return;
    }
    setParsedData(JSON.parse(unstructuredFileData));
  };

  const updateRecord = async (docId: string, summary: string | undefined) => {
    if (!user) {
      return;
    }
    await updateDoc(doc(db, "users", user.id, "files", docId), {
      summary: summary ?? null,
    });
  };

  return (
    <Dialog
      open={isShowParseDataModelOpen}
      onOpenChange={(isOpen) => setIsShowParseDataModelOpen(isOpen)}
    >
      <DialogContent className="w-full max-w-5xl p-6 rounded-lg shadow-md bg-slate-200 dark:bg-slate-600">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Parsed Data
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="raw" className=" overflow-hidden">
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
              {isDocLoading || isUnstructuredLoading ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <LoaderCircleIcon size={48} className="animate-spin" />
                  <small>Loading Raw Data...</small>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 w-full">
                  {unstructuredFileData}
                </pre>
              )}
            </TabsContent>
            <TabsContent value="readable" className="text-gray-800">
              {loading ? (
                <div className="flex justify-center">
                  <Spinner size="50" />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg">
                  {extractReadableText(parsedData)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="summary" className="text-gray-800">
              {loading ? (
                <Spinner size="50" />
              ) : (
                summary ||
                fileSummary?.summary ||
                "Cant't display anything yet."
              )}
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter className="flex justify-end space-x-2 py-3">
          <Button
            size="sm"
            className="px-4"
            variant="ghost"
            onClick={() => setIsShowParseDataModelOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
