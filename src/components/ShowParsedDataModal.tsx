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

export function ShowParsedDataModal() {
  const {
    isShowParseDataModelOpen,
    setIsShowParseDataModelOpen,
    unstructuredFileData,
    fileParsedReadable,
  } = useAppStore();
  const { user } = useUser();

  const isAIAlreadyCalled = useRef(false);
  const [loading, setLoading] = useState(false);

  const [readableHtml, setReadableHtml] = useState();
  const [summary, setSummary] = useState("");

  const fetchAIResponse = async (tab: "readable" | "summary") => {
    if (
      !fileParsedReadable ||
      !unstructuredFileData ||
      isAIAlreadyCalled.current ||
      (tab === "readable" && fileParsedReadable.readableData) ||
      (tab === "summary" && fileParsedReadable.summary)
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

      const result = await response.json();
      const { html, summary } = JSON.parse(result);

      html && setReadableHtml(html);
      summary && setSummary(summary);
      fileParsedReadable &&
        updateRecord(fileParsedReadable.docId, html, summary);
    } catch (error) {
      isAIAlreadyCalled.current = false;
      console.error("Error parsing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (
    docId: string,
    html: string | undefined,
    summary: string | undefined
  ) => {
    if (!user) {
      return;
    }
    await updateDoc(doc(db, "users", user.id, "files", docId), {
      readableData: html ?? null,
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
                onClick={() => fetchAIResponse("readable")}
              >
                Readable format
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                onClick={() => fetchAIResponse("summary")}
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
            <TabsContent value="readable">
              {loading ? (
                <div className="flex justify-center">
                  <Spinner size="50" />
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      readableHtml ||
                      fileParsedReadable?.readableData ||
                      "Can't display anything yet.",
                  }}
                  className="text-gray-800"
                />
              )}
            </TabsContent>
            <TabsContent value="summary" className="text-gray-800">
              {loading ? (
                <Spinner size="50" />
              ) : (
                summary ||
                fileParsedReadable?.summary ||
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
