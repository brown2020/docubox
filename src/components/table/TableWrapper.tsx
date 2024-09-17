"use client";

import { FileType } from "@/typings/filetype";
import { Button } from "../ui/button";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";

type Props = {
  skeletonFiles: FileType[];
};

export default function TableWrapper({ skeletonFiles }: Props) {
  const { user } = useUser();
  const [initialFiles, setInitialFiles] = useState<FileType[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [input, setInput] = useState<string>("")

  // Use the 'useCollection' hook to fetch Firestore documents
  const [docs] = useCollection(user && query(
    collection(db, "users", user.id, "files"),
    orderBy("timestamp", sort)
  ));

  const filteredFiles: FileType[] = useMemo(() => {
    if (!input) return initialFiles
    return initialFiles.filter((file) =>
      file.tags.some((tag) => tag.toLowerCase().includes(input.toLowerCase()))
    );
  }, [input, initialFiles])

  useEffect(() => {
    if (!docs) return;
    const files = docs.docs.map((doc) => ({
      id: doc.id || "",
      filename: doc.data().filename || doc.id || "",
      tags: doc.data().tags,
      fullName: doc.data().fullName || doc.id || "",
      timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
      downloadUrl: doc.data().downloadUrl || "",
      type: doc.data().type || "",
      size: doc.data().size || 0,
      readableData: doc.data().readableData,
      summary: doc.data().summary,
      unstructuredFile: doc.data().unstructuredFile || "",
    }));
    setInitialFiles(files);
  }, [docs]);

  if (docs?.docs.length === undefined)
    return (
      <div className="flex flex-col px-4">
        <Button variant={"outline"} className="ml-auto w-36 h-10 mb-5">
          <Skeleton className="h-5 w-full" />
        </Button>
        <div className="border rounded-lg">
          <div className="border-b h-12" />
          {skeletonFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-4 p-4 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
          {skeletonFiles.length === 0 && (
            <div className="flex items-center space-x-4 p-4 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col space-y-5 pb-10 px-4">
      <div className="flex">
        <Input
          className="w-64"
          placeholder="Search tags"
          onChange={(e) => setInput(e.target.value)}
        />
      <Button
        variant={"outline"}
        onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
        className="ml-auto w-fit">
        Sort By {sort === "desc" ? "Oldest" : "Newest"}
      </Button>
      </div>
      <DataTable columns={columns} data={filteredFiles} />
    </div>
  );
}
