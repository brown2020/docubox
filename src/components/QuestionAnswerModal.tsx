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
import { Chat } from "./chat";
import { useModalStore } from "@/zustand/useModalStore";
import { useFileSelectionStore } from "@/zustand/useFileSelectionStore";

export const QuestionAnswerModal = () => {
  const { isQuestionAnswerModalOpen, setQuestionAnswerModalOpen } =
    useModalStore();
  const { fileId } = useFileSelectionStore();

  if (!fileId) return null;

  return (
    <Dialog
      open={isQuestionAnswerModalOpen}
      onOpenChange={setQuestionAnswerModalOpen}
    >
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
