"use client";

import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

type DragItemType = "file" | "folder";

interface UseDraggableItemOptions {
  /** Unique identifier for the draggable item */
  id: string;
  /** Type of the draggable item */
  type: DragItemType;
  /** Whether dragging is disabled (e.g., for trash items) */
  disabled?: boolean;
}

interface UseDraggableItemReturn<T extends HTMLElement> {
  /** Ref to attach to the draggable element */
  elementRef: React.RefObject<T | null>;
  /** Whether the item is currently being dragged */
  isDragging: boolean;
  /** Opacity value based on drag state (0.5 when dragging, 1 otherwise) */
  opacity: number;
}

/**
 * Custom hook for drag-and-drop functionality.
 * Consolidates common DnD logic used by File and Folder components.
 *
 * @param options - Configuration options for the draggable item
 * @returns Ref, drag state, and computed opacity
 */
export function useDraggableItem<T extends HTMLElement = HTMLElement>({
  id,
  type,
  disabled = false,
}: UseDraggableItemOptions): UseDraggableItemReturn<T> {
  const elementRef = useRef<T>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id },
      canDrag: !disabled,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, type, disabled]
  );

  useEffect(() => {
    if (elementRef.current && !disabled) {
      drag(elementRef);
    }
  }, [drag, disabled]);

  return {
    elementRef,
    isDragging,
    opacity: isDragging ? 0.5 : 1,
  };
}
