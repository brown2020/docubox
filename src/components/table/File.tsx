import { FunctionComponent, PropsWithChildren, useEffect, useRef } from "react"
import { useDrag } from "react-dnd"
import { TableRow } from "../ui/table"

type Props = {
  id: string
  hasTableRow?: boolean
  isTrashItem?: boolean
}

export const File: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  id,
  hasTableRow = true,
  isTrashItem = false,
}) => {
  const element = useRef<HTMLTableRowElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "file",
    item: {
      id,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const opacity = isDragging ? 0.5 : 1

  useEffect(() => {
    if (element) {
      drag(element)
    }
  }, [element, drag])

  return (
    <>
      {hasTableRow ? (
        <TableRow
          className={`opacity-${opacity} w-full cursor-grab`}
          ref={isTrashItem ? undefined : element}
        >
          {children}
        </TableRow>
      ) : (
        <div ref={isTrashItem ? undefined : element}>{children}</div>
      )}
    </>
  )
}
