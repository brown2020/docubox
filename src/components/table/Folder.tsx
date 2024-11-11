"use client";
import {
  FunctionComponent,
  PropsWithChildren,
  Suspense,
  useEffect,
  useRef,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import { TableRow } from "../ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type DustbinProps = {
  id: string;
  onDrop: (docId: string, folderId: string) => void;
  hasTableRow?: boolean;
  isTrashItem?: boolean;
};

export type DustbinState = {
  hasDropped: boolean;
  hasDroppedOnChild: boolean;
};

export const Folder: FunctionComponent<PropsWithChildren<DustbinProps>> = ({
  id,
  onDrop,
  children,
  hasTableRow = true,
  isTrashItem = false,
}) => {
  const elementRef = useRef<HTMLTableRowElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "folder",
    item: {
      id,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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
        Item: monitor.getItem(),
        itemKey: monitor.getItemType(),
      }),
    }),
    [isDragging, id]
  );

  const openFolder = () => {
    const params = new URLSearchParams(searchParams);
    params.set("activeFolder", id);

    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (elementRef) {
      drop(elementRef);

      drag(elementRef);
    }
  }, [elementRef, drag, drop]);

  const opacity = isDragging ? 0.5 : 1;

  return hasTableRow ? (
    <Suspense fallback={<div>Loading...</div>}>
      <TableRow
        className={`opacity-${opacity} w-full  cursor-pointer`}
        onDoubleClick={isTrashItem ? undefined : openFolder}
        ref={isTrashItem ? undefined : elementRef}
      >
        {children}
      </TableRow>
    </Suspense>
  ) : (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className={`opacity-${opacity}  cursor-grab hover:bg-black/10 dark:hover:bg-white/10 rounded-lg`}
        onDoubleClick={isTrashItem ? undefined : openFolder}
        ref={isTrashItem ? undefined : elementRef}
      >
        {children}
      </div>
    </Suspense>
  );
};
