import { ArrowUp, LoaderCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkDocumentReadiness,
  retrieveChunks,
  uploadToRagie,
} from "@/actions/ragieActions";
import { generateWithChunks } from "@/actions/generateActions";
import { useUser } from "@/components/auth";
import { QARecord } from "./QARecord";
import toast from "react-hot-toast";
import { handleAPIAndCredits } from "@/utils/useApiAndCreditKeys";
import { useModalStore } from "@/zustand/useModalStore";
import { useDocument, useApiProfileData } from "@/hooks";
import { DEFAULT_MODEL } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { fileService } from "@/services/fileService";
import { LoadingState } from "../common/LoadingState";

// Types for Ragie API responses
interface ScoredChunk {
  text: string;
  score: number;
}

interface RetrievalResponse {
  scored_chunks: ScoredChunk[];
}

interface IChatProps {
  fileId: string;
}

interface IQARecord {
  id: string;
  question: string;
  answer: string;
}

/**
 * Generates a unique ID for QA records.
 */
function generateRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Type guard for documents with QA records.
 */
function hasQARecords(
  doc: unknown
): doc is { qaRecords: Array<Omit<IQARecord, "id"> & { id?: string }> } {
  return (
    doc !== null &&
    typeof doc === "object" &&
    "qaRecords" in doc &&
    Array.isArray((doc as Record<string, unknown>).qaRecords)
  );
}

export const Chat = ({ fileId }: IChatProps) => {
  const { user } = useUser();
  const [newQuestion, setNewQuestion] = useState("");
  const newQuestionRef = useRef("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<IQARecord[]>([]);
  const [isUploadingToRagie, setUploadingToRagie] = useState(false);

  // Guard to prevent duplicate Ragie uploads
  const isUploadingToRagieRef = useRef(false);

  // Use custom hooks for cleaner code
  const {
    document,
    isLoading: isDocLoading,
    refetch: refetchDocument,
  } = useDocument(user?.id, fileId);
  const apiProfileData = useApiProfileData();
  const closeModal = useModalStore((state) => state.close);

  // Load QA records when document is fetched
  useEffect(() => {
    if (document && hasQARecords(document)) {
      const records = document.qaRecords.map((record) => ({
        ...record,
        id: record.id || generateRecordId(),
      }));
      setHistory(records);
    } else if (document) {
      setHistory([]);
    }
  }, [document]);

  // Function to upload a document to Ragie using server action
  const _uploadToRagie = useCallback(
    async (
      userId: string,
      docData: { id: string; downloadUrl: string; filename: string }
    ) => {
      try {
        setUploadingToRagie(true);
        const handleUploadfile = async (apiKey: string) => {
          const response = await uploadToRagie(
            docData.id,
            docData.downloadUrl,
            docData.filename,
            apiKey
          );
          await fileService.updateRagieStatus(userId, docData.id, response.id);

          // Client-side polling for document readiness
          const maxAttempts = 60;
          const interval = 3000;
          for (let i = 0; i < maxAttempts; i++) {
            const { ready } = await checkDocumentReadiness(response.id, apiKey);
            if (ready) return;
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          throw new Error("Timeout waiting for document to be processed by Ragie.");
        };
        await handleAPIAndCredits("ragie", apiProfileData, handleUploadfile);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          closeModal();
        } else {
          logger.error("Chat", "Error uploading to Ragie", error);
          throw new Error("Error uploading to Ragie");
        }
      } finally {
        setUploadingToRagie(false);
      }
    },
    [apiProfileData, closeModal]
  );

  const onDocumentLoad = useCallback(async () => {
    if (user?.id && document) {
      const { docId, filename, downloadUrl } = document;

      try {
        await _uploadToRagie(user?.id, { id: docId, filename, downloadUrl });
      } catch (error) {
        logger.error("Chat", "Error while uploading file to Ragie", error);
        throw new Error("Error while uploading file to Ragie.ai");
      }
    }
  }, [document, user, _uploadToRagie]);

  // Upload document to Ragie when loaded (with race condition guard)
  // We track isUploadedToRagie separately to avoid re-running when other document fields change
  const isUploadedToRagie = document?.isUploadedToRagie;
  useEffect(() => {
    if (document && !isUploadedToRagie && !isUploadingToRagieRef.current) {
      isUploadingToRagieRef.current = true;
      onDocumentLoad()
        .then(() => refetchDocument())
        .catch((error) => logger.error("Chat", "Failed to upload to Ragie", error))
        .finally(() => {
          isUploadingToRagieRef.current = false;
        });
    }
  }, [document, isUploadedToRagie, onDocumentLoad, refetchDocument]);

  const updateQARecords = useCallback(
    async (_records: IQARecord[]) => {
      if (!user) return;

      try {
        await fileService.updateQARecords(user.id, fileId, _records);
      } catch (error) {
        logger.error("Chat", "Error updating QA Records", error);
        throw new Error("Something went wrong while updating QA Records");
      }
    },
    [user, fileId]
  );

  const updateDocument = useCallback(
    async (data: IQARecord) => {
      if (!user?.id) return;

      const updatedRecords = [...history, data];

      try {
        await updateQARecords(updatedRecords);
        setHistory(updatedRecords);
        setGeneratedContent("");
      } catch (error) {
        logger.error("Chat", "Error updating document", error);
      }
    },
    [user?.id, history, updateQARecords]
  );

  // Handle both retrieval and generation in a single function
  const handleAsk = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      setGeneratedContent("");

      newQuestionRef.current = newQuestion;

      // Step 1: Retrieve chunks from Ragie
      let data: RetrievalResponse | null = null;

      // Try env key first (server action will also fallback internally)
      try {
        data = await retrieveChunks(newQuestionRef.current, fileId);
      } catch {
        // Env key retrieval failed, will try profile key
      }

      // If still null, try profile key via credits helper
      if (!data) {
        const retrieve = async (apiKey: string) => {
          data = await retrieveChunks(newQuestionRef.current, fileId, apiKey);
        };
        await handleAPIAndCredits("ragie", apiProfileData, retrieve);
      }

      if (!data) {
        throw new Error("Failed to retrieve chunks from Ragie.");
      }

      // Step 2: Generate content using the retrieved chunks
      const retrievedData = data;
      const handleContent = async (apiKey: string) => {
        // Capture question before clearing (use ref to avoid stale closure)
        const questionToAsk = newQuestionRef.current;
        setNewQuestion("");

        const answer = await generateWithChunks(
          retrievedData.scored_chunks.map((chunk) => chunk.text),
          questionToAsk,
          DEFAULT_MODEL,
          apiKey
        );
        setGeneratedContent(answer.trim());
        await updateDocument({
          id: generateRecordId(),
          question: questionToAsk,
          answer,
        });
      };

      await handleAPIAndCredits("open-ai", apiProfileData, handleContent);
    } catch (error) {
      logger.error("Chat", "Error during retrieval or generation", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Failed to retrieve or generate an answer. Please try again."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQARecord = async (index: number) => {
    if (!user) return;

    const updatedHistory = [...history];
    updatedHistory.splice(index, 1);

    try {
      await updateQARecords(updatedHistory);
      setHistory(updatedHistory);
      toast.success("Record is removed.");
    } catch (error) {
      logger.error("Chat", "Error deleting QA record", error);
    }
  };

  const isLoading = isDocLoading || isUploadingToRagie;

  return (
    <div style={{ height: "65dvh" }} className="flex flex-col gap-2">
      <div className="grow border rounded-md bg-slate-100 max-h-[65dvh] overflow-y-auto px-5 pt-5 pb-2">
        {isLoading && <LoadingState message="Loading Document..." />}

        {!isLoading &&
          history.map((record, index) => (
            <QARecord
              key={record.id}
              question={record.question}
              answer={record.answer}
              onDelete={() => handleDeleteQARecord(index)}
              isDeleting={false}
            />
          ))}

        {!isLoading && generatedContent && (
          <QARecord
            key="new-record"
            question={newQuestionRef.current}
            answer={generatedContent}
            isDeleting={false}
          />
        )}
      </div>
      <div className="flex gap-x-3 items-center">
        <Textarea
          placeholder="Type your question here."
          className="resize-none bg-slate-200 focus-visible:ring-1 focus-visible:ring-offset-0 dark:bg-slate-600 border-gray-400 border-[1px]"
          value={newQuestion}
          disabled={isLoading || isGenerating}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          className="bg-slate-200 dark:bg-slate-600 border-gray-400"
          onClick={handleAsk}
          disabled={isGenerating || newQuestion.length === 0}
        >
          {isGenerating ? (
            <LoaderCircleIcon className="animate-spin" size={18} />
          ) : (
            <ArrowUp size={18} />
          )}
        </Button>
      </div>
    </div>
  );
};
