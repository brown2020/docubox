"use client";

import { FunctionComponent } from "react";
import { FileIcon, defaultStyles, DefaultExtensionType } from "react-file-icon";
import { FolderOpen } from "lucide-react";
import {
  COLOR_EXTENSION_MAP,
  UNCOMMON_EXTENSIONS_MAP,
} from "@/constants/extensions";

type Props = {
  type: string;
  size?: number;
  className?: string;
};

/**
 * Get the normalized extension for display and styling.
 */
function getNormalizedExtension(type: string): string {
  const rawExtension = type.split("/")[1] || type;
  return UNCOMMON_EXTENSIONS_MAP[rawExtension] || rawExtension;
}

/**
 * Check if extension has default styles available.
 */
function hasDefaultStyle(ext: string): ext is DefaultExtensionType {
  return ext in defaultStyles;
}

/**
 * Reusable file type icon component that handles folders and various file types.
 * Eliminates duplicate icon rendering logic across the codebase.
 */
export const FileTypeIcon: FunctionComponent<Props> = ({
  type,
  size = 40,
  className = "w-10",
}) => {
  // Handle folder type
  if (type === "folder") {
    return (
      <div className={className}>
        <FolderOpen size={size} />
      </div>
    );
  }

  const extension = getNormalizedExtension(type);
  const labelColor = COLOR_EXTENSION_MAP[extension];

  return (
    <div className={className}>
      <FileIcon
        extension={extension}
        labelColor={labelColor}
        {...(hasDefaultStyle(extension) ? defaultStyles[extension] : {})}
      />
    </div>
  );
};
