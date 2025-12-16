"use client";

import {
  FunctionComponent,
  PropsWithChildren,
  Suspense,
  useCallback,
  useEffect,
} from "react";
import { useDrop } from "react-dnd";
import { TableRow } from "../ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDraggableItem } from "@/hooks/useDraggableItem";

export type DustbinProps = {
  id: string;
  onDrop: (docId: string, folderId: string) => void;
  hasTableRow?: boolean;
  isTrashItem?: boolean;
};

/**
 * Draggable and droppable folder wrapper component.
 * Supports both drag (moving folder) and drop (receiving files/folders).
 */
export const Folder: FunctionComponent<PropsWithChildren<DustbinProps>> = ({
  id,
  onDrop,
  children,
  hasTableRow = true,
  isTrashItem = false,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Use shared draggable hook
  const { elementRef, isDragging, opacity } =
    useDraggableItem<HTMLTableRowElement>({
      id,
      type: "folder",
      disabled: isTrashItem,
    });

  // Setup drop functionality
  const [, drop] = useDrop(
    () => ({
      accept: ["file", "folder"],
      drop(item: { id: string }) {
        if (item.id !== id && !isDragging) {
          onDrop(item?.id, id);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [isDragging, id, onDrop]
  );

  const openFolder = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("activeFolder", id);
    replace(`${pathname}?${params.toString()}`);
  }, [searchParams, id, pathname, replace]);

  // Combine drag and drop refs
  useEffect(() => {
    if (elementRef.current && !isTrashItem) {
      drop(elementRef);
    }
  }, [elementRef, drop, isTrashItem]);

  const content = hasTableRow ? (
    <TableRow
      className="w-full cursor-pointer transition-opacity"
      style={{ opacity }}
      onDoubleClick={isTrashItem ? undefined : openFolder}
      ref={isTrashItem ? undefined : elementRef}
    >
      {children}
    </TableRow>
  ) : (
    <div
      className="cursor-grab hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-opacity"
      style={{ opacity }}
      onDoubleClick={isTrashItem ? undefined : openFolder}
      ref={
        isTrashItem
          ? undefined
          : (elementRef as React.RefObject<HTMLDivElement>)
      }
    >
      {children}
    </div>
  );

  return <Suspense fallback={<div>Loading...</div>}>{content}</Suspense>;
};
