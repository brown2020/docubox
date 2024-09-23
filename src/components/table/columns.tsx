"use client"

import { FileType } from "@/typings/filetype"
import { ColumnDef } from "@tanstack/react-table"
import { FileIcon, defaultStyles } from "react-file-icon"
import prettyBytes from "pretty-bytes"
import { COLOR_EXTENSION_MAP, UNCOMMON_EXTENSIONS_MAP } from "@/constants"
import Link from "next/link"
import { FolderOpen } from "lucide-react"

export const columns: ColumnDef<FileType>[] = [
  {
    accessorKey: "id",
    header: "",
    cell: "",
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ renderValue }) => {
      const type = renderValue() as string
      if (type === "folder") {
        return (
          <div className="w-10">
            <FolderOpen size={40} />
          </div>
        )
      }
      const extension: string = type.split("/")[1]
      return (
        <div className="w-10">
          <FileIcon
            extension={UNCOMMON_EXTENSIONS_MAP[extension] || extension}
            labelColor={
              COLOR_EXTENSION_MAP[
                UNCOMMON_EXTENSIONS_MAP[extension] || extension
              ]
            }
            // @ts-expect-error: The 'defaultStyles' may not have a property for every possible extension.
            {...defaultStyles[UNCOMMON_EXTENSIONS_MAP[extension] || extension]}
          />
        </div>
      )
    },
  },
  {
    accessorKey: "filename",
    header: "Filename",
  },
  {
    accessorKey: "timestamp",
    header: "Date Added",
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ renderValue }) => {
      return <span>{prettyBytes(renderValue() as number)}</span>
    },
  },
  {
    accessorKey: "downloadUrl",
    header: "Link",
  },
]
