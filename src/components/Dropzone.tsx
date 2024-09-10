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
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import DropzoneComponent from "react-dropzone";
import toast from "react-hot-toast";

export default function Dropzone() {
  const maxSize = 20971520;
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);
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
      setLoading(false);
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
      });
      const imageRef = ref(storage, `users/${user.id}/files/${docRef.id}`);
      uploadBytes(imageRef, selectedFile).then(async () => {
        const downloadUrl = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "users", user.id, "files", docRef.id), {
          downloadUrl,
          docId: docRef.id,
        });
      });
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
          <section className="m-4">
            <div
              {...getRootProps()}
              className={cn(
                "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg text-center",
                isDragActive
                  ? "bg-blue-500 text-white animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/80 text-slate-400"
              )}
            >
              <input {...getInputProps()} />
              {!isDragActive && "Click here or drop a file to upload!"}
              {isDragActive && !isDragReject && "Drop to upload this file!"}
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