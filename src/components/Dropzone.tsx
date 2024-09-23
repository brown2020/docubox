"use client";
import { parseFile } from "@/actions/parse";
import { db, storage } from "@/firebase";
import { cn } from "@/lib/utils";
import { Chunk } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import DropzoneComponent from "react-dropzone";
import toast from "react-hot-toast";
import Spinner from "./common/spinner";
import { Progress } from "./ui/progress-bar";
import { useAppStore } from "@/zustand/useAppStore";

export default function Dropzone() {
  const maxSize = 20971520;
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("0");
  const [processing, setProcessing] = useState(false);
  const { user } = useUser();
  const { folderId } = useAppStore()

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setProcessing(true);

    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      const data: Chunk[] = await parseFile(formData);

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = async () => {
          await uploadPost(data, file);
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  };
  const uploadPost = async (unstructuredData: Chunk[], selectedFile: File) => {
    if (loading) return;
    if (!user) return;

    setLoading(true);

    const toastId = toast.loading("Uploading file...");
    try {
      const docRef = await addDoc(collection(db, "users", user.id, "files"), {
        userId: user.id,
        filename: selectedFile.name,
        fullName: user.fullName,
        profileImg: user.imageUrl,
        timestamp: serverTimestamp(),
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
        unstructuredFile: JSON.stringify(unstructuredData, null, 2),
        summary: null,
        folderId
      });

      if (folderId) {
        await updateDoc(doc(db, "users", user.id, "files", docRef.id), {
          numberOfItems: increment(1)
          });
      }

      const imageRef = ref(
        storage,
        `users/${user.id}/files/${docRef.id}_${selectedFile.name}`
      );
      const uploadTask = uploadBytesResumable(imageRef, selectedFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress.toFixed(2));
        },
        (error) => {
          console.log(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(imageRef);
          await updateDoc(doc(db, "users", user.id, "files", docRef.id), {
            downloadUrl,
            docId: docRef.id,
          });
        }
      );

      toast.success("File uploaded successfully!", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Error uploading file!", { id: toastId });
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };
  return (
    <DropzoneComponent minSize={0} maxSize={maxSize} onDrop={onDrop}>
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 && fileRejections[0].file.size > maxSize;
        return (
          <section className="my-4 hover:cursor-pointer">
            <div
              {...getRootProps()}
              className={cn(
                "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg hover:border-2 hover:border-gray-300 text-center",
                isDragActive
                  ? "bg-blue-500 text-white animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/80 text-slate-400"
              )}>
              <input {...getInputProps()} />
              {processing && (
                <div className="flex flex-col items-center">
                  <Spinner size="50" />
                  <p>Processing File</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center">
                  <p>Uploading File {uploadProgress}%</p>
                  <div className="max-w-[800px] w-[70vw]">
                    <Progress value={parseInt(uploadProgress)} />
                  </div>
                </div>
              )}
              {!isDragActive &&
                !processing &&
                !loading &&
                "Click here or drop a file to upload!"}
              {isDragActive &&
                !isDragReject &&
                !processing &&
                !loading &&
                "Drop to upload this file!"}
              {isDragReject && "Unsupported file type..."}
              {isFileTooLarge && (
                <div className="text-danger mt-2">File is too large.</div>
              )}
            </div>
          </section>
        );
      }}
    </DropzoneComponent>
  );
}
