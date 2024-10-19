import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
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
import { readStreamableValue } from "ai/rsc";
import { useUser } from "@clerk/nextjs";
import { QARecord } from "./QARecord";
import toast from "react-hot-toast";
import { FileType } from "@/typings/filetype";
import useProfileStore from "@/zustand/useProfileStore";
import { handleAPIAndCredits } from "@/utils/useApiAndCreditKeys";
import { useAppStore } from "@/zustand/useAppStore";

// Define a type for the chunk structure
type Chunk = {
  text: string;
  score: number;
};

// Define a type for the server response
type RetrievalResponse = {
  scored_chunks: Chunk[];
};

interface IChatProps {
  fileId: string;
}

interface IQARecord {
  question: string;
  answer: string;
}

export const Chat = ({ fileId }: IChatProps) => {
  const { user } = useUser();
  const [newQuestion, setNewQuestion] = useState<string>("");
  const newQuestionRef = useRef("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [history, setHistory] = useState<IQARecord[]>([]);
  const [document, setDocument] = useState<FileType>();
  const [isDeleting, setDeleting] = useState(false);

  const [isDocLoading, setDocLoading] = useState(false);
  const [isUploadingToRagie, setUploadingToRagie] = useState(false);

  const userProfileState = useProfileStore((state) => state);
  const { setQuestionAnswerModalOpen } = useAppStore();

  const getDocument = useCallback(async () => {
    if (user?.id) {
      setDocLoading(true);

      const docRef = doc(db, `users`, user?.id, "files", fileId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setDocLoading(false);
        return;
      }

      const data = docSnap.data();

      const qaRecords = data?.qaRecords || [];
      setHistory(qaRecords);
      setDocument(data as FileType);
      setDocLoading(false);
    }
  }, [fileId, user?.id]);

  // Function to upload a document to Ragie using server action
  const _uploadToRagie = useCallback(
    async (
      userId: string,
      _document: { id: string; downloadUrl: string; filename: string }
    ) => {
      try {
        setUploadingToRagie(true);
        const handleUploadfile = async (apiKey: string) => {
          const response = await uploadToRagie(
            _document.id,
            _document.downloadUrl,
            _document.filename,
            apiKey
          );
          await updateDoc(doc(db, "users", userId, "files", _document.id), {
            isUploadedToRagie: true,
            ragieFileId: response.id,
          });
          await checkDocumentReadiness(response.id, apiKey);
        };
        await handleAPIAndCredits("ragie", userProfileState, handleUploadfile);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          setQuestionAnswerModalOpen(false);
        } else {
          console.error("Error uploading to Ragie: ", error);
          throw Error("Error uploading to Ragie");
        }
      } finally {
        setUploadingToRagie(false);
      }
    },
    [userProfileState, setQuestionAnswerModalOpen]
  );

  const onDocumentLoad = useCallback(async () => {
    if (user?.id && document) {
      const { docId, filename, downloadUrl } = document;

      try {
        await _uploadToRagie(user?.id, { id: docId, filename, downloadUrl });
      } catch (error) {
        console.error(error);
        throw new Error("Error while uploading file to Ragie.ai");
      }
    }
  }, [document, user, _uploadToRagie]);

  useEffect(() => {
    if (document && !document.isUploadedToRagie) {
      onDocumentLoad().then(() => {
        getDocument();
      });
    }
  }, [document, onDocumentLoad, getDocument]);

  useEffect(() => {
    getDocument();
  }, [fileId, getDocument]);

  const updateQARecords = async (_records: IQARecord[]) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        qaRecords: _records,
      });
    } catch (error) {
      console.error(error);
      throw Error("Something went wrong while updating QA Records");
    }
  };

  const updateDocument = async (data: IQARecord) => {
    if (user?.id) {
      const updatedRecords = [...history, data];

      try {
        await updateQARecords(updatedRecords);
        setHistory(updatedRecords);
        setGeneratedContent("");
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Handle both retrieval and generation in a single function
  const handleAsk = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      setGeneratedContent("");

      newQuestionRef.current = newQuestion;

      // Step 1: Retrieve chunks from Ragie
      const data: RetrievalResponse = await retrieveChunks(
        newQuestionRef.current,
        fileId
      );
      console.log("Retrieved chunks from Ragie:", data);

      // Step 2: Generate content using the retrieved chunks
      const handleContent = async () => {
        setNewQuestion("");
        const result = await generateWithChunks(
          data.scored_chunks.map((chunk) => chunk.text), // Pass only the chunk texts
          newQuestion,
          "gpt-4o" // Adjust the model name as needed
        );
        let answer = "";
        // Stream the response to handle progressive updates
        for await (const content of readStreamableValue(result)) {
          if (content) {
            setGeneratedContent(content.trim());
            answer = content.trim();
          }
        }
        updateDocument({ question: newQuestion, answer });
      };

      await handleAPIAndCredits("open-ai", userProfileState, handleContent);
      // if (useCredits && currentCredits < (Number(process.env.NEXT_PUBLIC_CREDITS_PER_OPEN_AI || 4))) return
      // const result = await generateWithChunks(
      //   data.scored_chunks.map((chunk) => chunk.text), // Pass only the chunk texts
      //   newQuestion,
      //   "gpt-4o" // Adjust the model name as needed
      // );

      // if (useCredits) {
      //   await minusCredits(creditsToMinus("ragie"))
      // }

      // let answer = "";
      // for await (const content of readStreamableValue(result)) {
      //   if (content) {
      //     setGeneratedContent(content.trim());
      //     answer = content.trim();
      //   }
      // }

      // updateDocument({ question: newQuestion, answer });
    } catch (error) {
      console.error("Error during retrieval or generation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQARecord = async (index: number) => {
    if (!user) return;

    history.splice(index, 1);

    try {
      setDeleting(true);
      await updateQARecords(history);
      setHistory([...history]);
      toast.success("Record is removed.");
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div style={{ height: "65dvh" }} className="flex flex-col gap-2">
      <div className="flex-grow border rounded-md bg-slate-100 max-h-[65dvh] overflow-y-auto px-5 pt-5 pb-2">
        {(isDocLoading || isUploadingToRagie) && (
          <div className="flex flex-col justify-center items-center h-full">
            <LoaderCircleIcon size={48} className="animate-spin" />
            <small>Loading Document...</small>
          </div>
        )}

        {history.map(({ question, answer }, index) => (
          <QARecord
            key={index}
            question={question}
            answer={answer}
            onDelete={() => handleDeleteQARecord(index)}
            isDeleting={isDeleting}
          />
        ))}

        {generatedContent && (
          <QARecord
            key="new-record"
            question={newQuestionRef.current}
            answer={generatedContent}
            isDeleting={isDeleting}
          />
        )}
      </div>
      <div className="flex gap-x-3 items-center ">
        <Textarea
          placeholder="Type your question here."
          className="resize-none bg-slate-200 focus-visible:ring-1 focus-visible:ring-offset-0 dark:bg-slate-600 border-gray-400 border-[1px]"
          value={newQuestion}
          disabled={isUploadingToRagie || isGenerating}
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
