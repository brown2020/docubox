import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore, useIsModalOpen } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";
import { LoadingState } from "./common/LoadingState";

// Dynamic import for heavy Chat component with markdown rendering
const Chat = dynamic(
  () => import("./chat").then((mod) => ({ default: mod.Chat })),
  {
    loading: () => <LoadingState message="Loading chat..." size={32} />,
    ssr: false,
  }
);

export const QuestionAnswerModal = () => {
  const isOpen = useIsModalOpen("questionAnswer");
  const close = useModalStore((s) => s.close);
  const { fileId } = useFileSelectionStore();

  if (!fileId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="w-full max-w-5xl bg-slate-200 dark:bg-slate-600">
        <DialogHeader>
          <DialogTitle>Q&A Session</DialogTitle>
          <DialogDescription>
            Ask questions about the uploaded file, and get AI-powered responses
            directly from the document.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Chat fileId={fileId} />
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" className="px-4" variant="ghost">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
