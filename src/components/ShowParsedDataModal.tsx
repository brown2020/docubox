"use client";

import { useRef, useState } from "react";

import { doc, updateDoc } from "firebase/firestore";
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

export function ShowParsedDataModal() {
  const {
    isShowParseDataModelOpen,
    setIsShowParseDataModelOpen,
    unstructuredFileData,
    fileSummary,
  } = useAppStore();
  const { user } = useUser();

  const isAIAlreadyCalled = useRef(false);
  const [loading, setLoading] = useState(false);

  const [parsedData, setParsedData] = useState<Chunk[] | null>(null);
  const [summary, setSummary] = useState("");

  const fetchSummary = async () => {
    if (
      !fileSummary ||
      !unstructuredFileData ||
      isAIAlreadyCalled.current ||
      (fileSummary.summary)
    ) {
      return;
    }
    isAIAlreadyCalled.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: unstructuredFileData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const summary = await response.json();

      summary && setSummary(summary);
      fileSummary &&
        updateRecord(fileSummary.docId,  summary);
    } catch (error) {
      isAIAlreadyCalled.current = false;
      console.error("Error parsing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractReadableText = (data: Chunk[] | null) => {
    // Function to extract readable text from JSON
    if (!data) return null;

    const contentArray = data[0]?.content || [];
    return contentArray
      .filter(
        (item: Element) =>
          item.type === "Title" ||
          item.type === "NarrativeText" ||
          item.type === "EmailAddress" ||
          item.type === "UncategorizedText"
      )
      .map((item: Element) => (
        <div key={item.element_id} className="mb-2">
          <strong>{item.type}:</strong> {item.text}
        </div>
      ));
  };

  const fetchReadableFormat = async () => {
    if (!unstructuredFileData) {
      return;
    }
    setParsedData(JSON.parse(unstructuredFileData))
  };

  const updateRecord = async (
    docId: string,
    summary: string | undefined
  ) => {
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
        <Tabs defaultValue="raw">
          <div className="flex justify-center my-2">
            <TabsList>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
              <TabsTrigger
                value="readable"
                onClick={() => fetchReadableFormat()}
              >
                Readable format
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                onClick={() => fetchSummary()}
              >
                Summary
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="overflow-auto h-[50vh] mb-4 p-4 bg-gray-50 rounded-lg">
            <TabsContent value="raw">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {unstructuredFileData}
              </pre>
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
