"use client";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalContent, WideModalContent } from "@/components/ui/modal-content";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Modal body content */
  children: ReactNode;
  /** Custom footer content (if not provided, uses default close button) */
  footer?: ReactNode;
  /** Whether to use wide modal variant */
  wide?: boolean;
}

/**
 * Base modal component that standardizes modal structure.
 * Use this as the foundation for all modals in the application.
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: BaseModalProps) {
  const Content = wide ? WideModalContent : ModalContent;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Content>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer !== undefined ? (
          footer && (
            <DialogFooter className="flex space-x-2 py-3">
              {footer}
            </DialogFooter>
          )
        ) : (
          <DialogFooter className="flex space-x-2 py-3">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </Content>
    </Dialog>
  );
}

interface ModalFooterButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * Standard modal footer with cancel and confirm buttons.
 */
export function ModalFooterButtons({
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "default",
  isConfirmDisabled = false,
  isLoading = false,
}: ModalFooterButtonsProps) {
  return (
    <>
      <Button
        size="sm"
        className="px-3 flex-1"
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
      >
        <span className="sr-only">{cancelText}</span>
        <span>{cancelText}</span>
      </Button>
      <Button
        type="submit"
        size="sm"
        className="px-3 flex-1"
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isConfirmDisabled || isLoading}
      >
        <span className="sr-only">{confirmText}</span>
        <span>{confirmText}</span>
      </Button>
    </>
  );
}
