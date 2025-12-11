import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

/**
 * Styled modal content wrapper with consistent theming.
 * Use this instead of DialogContent for consistent modal styling across the app.
 */
export function ModalContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn("sm:max-w-md bg-slate-200 dark:bg-slate-600", className)}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

/**
 * Wide modal content for larger dialogs like ShowParsedDataModal.
 */
export function WideModalContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "w-full max-w-5xl p-6 rounded-lg shadow-md bg-slate-200 dark:bg-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}
