import { memo } from "react";
import { BotMessageSquareIcon, Trash2Icon, UserIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { AnswerWrapper } from "./AnswerWrapper";
import { Button } from "../ui/button";

interface IProps {
  question: string;
  answer: string;
  isDeleting: boolean;
  onDelete?(): void;
}

/**
 * Displays a Q&A record with user question and AI answer.
 * Memoized to prevent unnecessary re-renders in lists.
 */
export const QARecord = memo(function QARecord({
  question,
  answer,
  isDeleting,
  onDelete,
}: IProps) {
  return (
    <Card className="mb-5 bg-slate-200 dark:bg-slate-600">
      <CardContent className="pt-6 space-y-3">
        <div className="flex gap-x-5">
          <div className="shrink-0 border rounded-full h-7 w-7 p-1 bg-slate-300">
            <UserIcon size={18} />
          </div>
          <p className="flex-1">{question}</p>
        </div>

        <div className="flex gap-x-5">
          <div className="shrink-0 border rounded-full h-7 w-7 p-1 bg-green-300">
            <BotMessageSquareIcon size={18} />
          </div>
          <div className="flex-1 overflow-hidden">
            <AnswerWrapper answer={answer} />
          </div>
        </div>
      </CardContent>
      {onDelete && (
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="Delete Q&A record"
          >
            <Trash2Icon size={18} className="text-red-500" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
