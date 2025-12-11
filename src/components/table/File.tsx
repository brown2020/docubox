"use client";

import { FunctionComponent, PropsWithChildren } from "react";
import { TableRow } from "../ui/table";
import { useDraggableItem } from "@/hooks/useDraggableItem";

type Props = {
  id: string;
  hasTableRow?: boolean;
  isTrashItem?: boolean;
};

/**
 * Draggable file wrapper component.
 * Renders either a TableRow or div based on context.
 */
export const File: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  id,
  hasTableRow = true,
  isTrashItem = false,
}) => {
  const { elementRef, opacity } = useDraggableItem<HTMLTableRowElement>({
    id,
    type: "file",
    disabled: isTrashItem,
  });

  if (hasTableRow) {
    return (
      <TableRow
        className="w-full cursor-grab transition-opacity"
        style={{ opacity }}
        ref={isTrashItem ? undefined : elementRef}
      >
        {children}
      </TableRow>
    );
  }

  return (
    <div
      className="cursor-grab transition-opacity"
      style={{ opacity }}
      ref={
        isTrashItem
          ? undefined
          : (elementRef as React.RefObject<HTMLDivElement>)
      }
    >
      {children}
    </div>
  );
};
