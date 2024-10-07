import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { ArrowUp, LoaderCircleIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useCallback, useEffect, useRef, useState } from "react";
import { retrieveChunks, uploadToRagie } from "@/actions/ragieActions";
import { generateWithChunks } from "@/actions/generateActions";
import { readStreamableValue } from "ai/rsc";
import { useUser } from "@clerk/nextjs"
import { QARecord } from "./QARecord"
import toast from "react-hot-toast";
import { FileType } from "@/typings/filetype"

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
  }, [fileId, user?.id])

  const onDocumentLoad = useCallback(async () => {
    if (user?.id && document) {
      const { docId, filename, downloadUrl } = document;

      try {
        await _uploadToRagie(user?.id, { id: docId, filename, downloadUrl })
      } catch (error) {
        console.error(error);
        throw new Error("Error while uploading file to Ragie.ai")
      }
    }
  }, [document, user])

  useEffect(() => {
    if (document && !document.isUploadedToRagie) {
      onDocumentLoad()
        .then(() => {
          getDocument();
        })
    }
  }, [document, onDocumentLoad, getDocument]);

  useEffect(() => {
    getDocument();
  }, [fileId, getDocument])

  const updateQARecords = async (_records: IQARecord[]) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.id, "files", fileId), {
        qaRecords: _records
      })
    } catch (error) {
      console.error(error)
      throw Error("Something went wrong while updating QA Records");
    }
  }

  const updateDocument = async (data: IQARecord) => {
    if (user?.id) {

      const updatedRecords = [...history, data]

      try {
        await updateQARecords(updatedRecords);
        setHistory(updatedRecords);
        setGeneratedContent("");
      } catch (error) {
        console.error(error)
      }
    }
  }

  // Function to upload a document to Ragie using server action
  const _uploadToRagie = async (userId: string, _document: { id: string; downloadUrl: string; filename: string }) => {
    try {
      setUploadingToRagie(true);
      const response = await uploadToRagie(_document.id, _document.downloadUrl, _document.filename);

      // Update Firestore with the Ragie upload status
      await updateDoc(doc(db, "users", userId, "files", _document.id), {
        isUploadedToRagie: true,
        ragieFileId: response.id
      });

    } catch (error) {
      console.error("Error uploading to Ragie: ", error);
      throw Error("Error uploading to Ragie")
    } finally {
      setUploadingToRagie(false);
    }
  };

  // Handle both retrieval and generation in a single function
  const handleAsk = async (): Promise<void> => {
    try {

      setIsGenerating(true);
      setGeneratedContent("");

      newQuestionRef.current = newQuestion;
      setNewQuestion("");

      // Step 1: Retrieve chunks from Ragie
      const data: RetrievalResponse = await retrieveChunks(newQuestionRef.current, fileId);
      console.log("Retrieved chunks from Ragie:", data);

      // Step 2: Generate content using the retrieved chunks

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
      toast.success("Record is removed.")
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ height: '65dvh' }} className="flex flex-col gap-2">
      <div className="flex-grow border rounded-md bg-slate-100 max-h-[65dvh] overflow-y-auto px-5 pt-5 pb-2">

        {(isDocLoading || isUploadingToRagie) && (
          <div className="flex flex-col justify-center items-center h-full">
            <LoaderCircleIcon size={48} className="animate-spin" />
            <small>Loading Document...</small>
          </div>
        )}

        {history.map(({ question, answer }, index) => (
          <QARecord
            key={question}
            question={question}
            answer={answer}
            onDelete={() => handleDeleteQARecord(index)}
            isDeleting={isDeleting}
          />
        ))}

        {generatedContent && (
          <QARecord key="new-record" question={newQuestionRef.current} answer={generatedContent} isDeleting={isDeleting} />
        )}

      </div>
      <div className="flex gap-x-3 items-center">
        <Textarea placeholder="Type your question here." className="resize-none" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
        <Button variant="outline" size="icon" onClick={handleAsk} disabled={isGenerating}>
          {isGenerating ? <LoaderCircleIcon className="animate-spin" size={18} /> : <ArrowUp size={18} />}
        </Button>
      </div>
    </div>
  )
}