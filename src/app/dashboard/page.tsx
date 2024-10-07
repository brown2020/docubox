"use client"

import Spinner from "@/components/common/spinner"
import Dropzone from "@/components/Dropzone"
import TableWrapper from "@/components/table/TableWrapper"
import { db } from "@/firebase"
import { FileType } from "@/typings/filetype"
import { useAuth } from "@clerk/nextjs"
import { collection, getDocs } from "firebase/firestore"
import { Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { userId } = useAuth()
  const [skeletonFiles, setSkeletonFiles] = useState<FileType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const docsResults = await getDocs(
          collection(db, "users", userId, "files")
        )
        const files: FileType[] = docsResults.docs.map((doc) => {
          return {
            docId: doc.id || "",
            filename: doc.data().filename || doc.id || "",
            tags: doc.data().tags,
            fullName: doc.data().fullName || doc.id || "",
            timestamp:
              new Date(doc.data().timestamp?.seconds * 1000) || undefined,
            downloadUrl: doc.data().downloadUrl || "",
            type: doc.data().type || "",
            size: doc.data().size || 0,
            summary: doc.data().summary || "",
            unstructuredFile: doc.data().unstructuredFile || "",
            deletedAt: doc.data().deletedAt || null,
            isUploadedToRagie: doc.data().isUploadedToRagie,
            ragieFileId: doc.data().ragieFileId
          }
        })
        setSkeletonFiles(files)
      }
      setLoading(false)
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size={"30"} />
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto">
        <Dropzone />
      </div>
      <TableWrapper skeletonFiles={skeletonFiles} />
      <Link
        href="/trash"
        className="bg-secondary w-max z-50 rounded-md absolute bottom-6 right-3 p-3 hover:bg-[#E2E8F0] dark:hover:bg-slate-700"
      >
        <Trash size={30} />
      </Link>
    </div>
  )
}
