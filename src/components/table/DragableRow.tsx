import type { Identifier, XYCoord } from "dnd-core"
import type { FunctionComponent, PropsWithChildren } from "react"
import { useRef } from "react"

import { useDrag, useDrop, DragSourceMonitor } from "react-dnd"
import { TableRow } from "../ui/table"

type CardProps = {
  id: string
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  className?: string
}

type DragItem = {
  index: number
  id: string
  type: string
}

export const DragableRow: FunctionComponent<PropsWithChildren<CardProps>> = ({
  id,
  index,
  children,
  moveCard,
  className,
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "card",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      moveCard(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: () => {
      return { id, index }
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <TableRow
      data-handler-id={handlerId}
      className={`opacity-${opacity} w-full cursor-grab ${className}`}
      ref={ref}
    >
      {children}
    </TableRow>
  )
}
