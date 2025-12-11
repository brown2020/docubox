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
import { useUser } from "@clerk/nextjs";
import { QARecord } from "./QARecord";
import toast from "react-hot-toast";
import { handleAPIAndCredits } from "@/utils/useApiAndCreditKeys";
import { useModalStore } from "@/zustand/useModalStore";
import { useDocument } from "@/hooks/useDocument";
import { useApiProfileData } from "@/hooks/useApiProfileData";
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

interface RetrievalError {
  error: true;
  status: number;
  message: string;
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

export const Chat = ({ fileId }: IChatProps) => {
  const { user } = useUser();
  const [newQuestion, setNewQuestion] = useState("");
  const newQuestionRef = useRef("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<IQARecord[]>([]);
  const [isUploadingToRagie, setUploadingToRagie] = useState(false);

  // Use custom hooks for cleaner code
  const {
    document,
    isLoading: isDocLoading,
    refetch: refetchDocument,
  } = useDocument(user?.id, fileId);
  const apiProfileData = useApiProfileData();
  const setQuestionAnswerModalOpen = useModalStore(
    (state) => state.setQuestionAnswerModalOpen
  );

  // Load QA records when document is fetched
  useEffect(() => {
    if (document) {
      const qaRecords = (
        ((document as Record<string, unknown>).qaRecords as IQARecord[]) || []
      ).map((record: Omit<IQARecord, "id"> & { id?: string }) => ({
        ...record,
        id: record.id || generateRecordId(),
      }));
      setHistory(qaRecords);
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
          await checkDocumentReadiness(response.id, apiKey);
        };
        await handleAPIAndCredits("ragie", apiProfileData, handleUploadfile);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          setQuestionAnswerModalOpen(false);
        } else {
          logger.error("Chat", "Error uploading to Ragie", error);
          throw Error("Error uploading to Ragie");
        }
      } finally {
        setUploadingToRagie(false);
      }
    },
    [apiProfileData, setQuestionAnswerModalOpen]
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

  useEffect(() => {
    if (document && !document.isUploadedToRagie) {
      onDocumentLoad().then(() => {
        refetchDocument();
      });
    }
  }, [document, onDocumentLoad, refetchDocument]);

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
      let data: RetrievalResponse | RetrievalError | null = null;

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

      // If the server returned a structured error, surface it and stop
      if ((data as RetrievalError).error) {
        const err = data as RetrievalError;
        toast.error(err.message);
        return;
      }

      // Step 2: Generate content using the retrieved chunks
      const handleContent = async () => {
        setNewQuestion("");
        const answer = await generateWithChunks(
          (data as RetrievalResponse).scored_chunks.map((chunk) => chunk.text),
          newQuestion,
          DEFAULT_MODEL
        );
        setGeneratedContent(answer.trim());
        await updateDocument({
          id: generateRecordId(),
          question: newQuestion,
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
            if (e.key === "Enter") {
              e.preventDefault();
              setNewQuestion((e.target as HTMLTextAreaElement).value);
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
