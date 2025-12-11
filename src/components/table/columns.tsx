"use client";

import { FileType } from "@/types/filetype";
import { ColumnDef } from "@tanstack/react-table";
import prettyBytes from "pretty-bytes";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";

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
      const type = renderValue() as string;
      return <FileTypeIcon type={type} />;
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
      return <span>{prettyBytes(renderValue() as number)}</span>;
    },
  },
  {
    accessorKey: "downloadUrl",
    header: "Link",
  },
];
