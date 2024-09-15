"use client";

import Dropzone from "@/components/Dropzone";
import TableWrapper from "@/components/table/TableWrapper";
import { db } from "@/firebase";
import { FileType } from "@/typings/filetype";
import { useAuth } from "@clerk/nextjs";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { userId } = useAuth();
  const [skeletonFiles, setSkeletonFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const docsResults = await getDocs(
          collection(db, "users", userId, "files")
        );
        const files: FileType[] = docsResults.docs.map((doc) => ({
          id: doc.id || "",
          filename: doc.data().filename || doc.id || "",
          fullName: doc.data().fullName || doc.id || "",
          timestamp:
            new Date(doc.data().timestamp?.seconds * 1000) || undefined,
          downloadUrl: doc.data().downloadUrl || "",
          type: doc.data().type || "",
          size: doc.data().size || 0,
          readableData: doc.data().readableData || "",
          summary: doc.data().summary || "",
          unstructuredFile: doc.data().unstructuredFile || "",
        }));
        setSkeletonFiles(files);
      }
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="container mx-auto">
        <Dropzone />
      </div>
      <TableWrapper skeletonFiles={skeletonFiles} />
    </div>
  );
}
