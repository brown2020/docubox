"use client";

import { FileType } from "@/types/filetype";
import {
  columnVisibilityFeature,
  createColumnHelper,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table";
import prettyBytes from "pretty-bytes";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";

/**
 * File table features. Visibility and selection stay registered so existing
 * row helpers (`getVisibleCells`, `getIsSelected`) keep working on Table v9.
 */
export const fileTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
});

const columnHelper = createColumnHelper<typeof fileTableFeatures, FileType>();

/**
 * Column definitions for the files table.
 */
export const columns = columnHelper.columns([
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ renderValue }) => {
      const type = renderValue() as string;
      return <FileTypeIcon type={type} />;
    },
  }),
  columnHelper.accessor("filename", {
    header: "Filename",
  }),
  columnHelper.accessor("timestamp", {
    header: "Date Added",
  }),
  columnHelper.accessor("size", {
    header: "Size",
    cell: ({ renderValue }) => {
      return <span>{prettyBytes(renderValue() as number)}</span>;
    },
  }),
  columnHelper.accessor("downloadUrl", {
    header: "Link",
  }),
]);
