import { FunctionComponent, PropsWithChildren, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { TableRow } from "../ui/table";

type Props = {
  id: string;
  hasTableRow?: boolean;
  isTrashItem?: boolean;
};

export const File: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  id,
  hasTableRow = true,
  isTrashItem = false,
}) => {
  const element = useRef<HTMLTableRowElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "file",
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (element) {
      drag(element);
    }
  }, [element, drag]);

  return (
    <>
      {hasTableRow ? (
        <TableRow
          className="w-full cursor-grab transition-opacity"
          style={{ opacity: isDragging ? 0.5 : 1 }}
          ref={isTrashItem ? undefined : element}
        >
          {children}
        </TableRow>
      ) : (
        <div
          style={{ opacity: isDragging ? 0.5 : 1 }}
          ref={isTrashItem ? undefined : element}
        >
          {children}
        </div>
      )}
    </>
  );
};
