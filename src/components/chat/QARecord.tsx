import { BotMessageSquareIcon, Trash2Icon, UserIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { AnswerWrapper } from "./AnswerWrapper";
import { Button } from "../ui/button";

interface IProps {
  question: string;
  answer: string;
  isDeleting: boolean;
  onDelete?(): void;
}

export const QARecord = ({ question, answer, isDeleting, onDelete }: IProps) => {

  return (
    <Card className="mb-5">
      <CardHeader></CardHeader>
      <CardContent className="space-y-3">

        <div className="flex gap-x-5">
          <div className="border rounded-full h-7 w-7 p-1 bg-slate-300">
            <UserIcon size={18} />
          </div>
          <p>{question}</p>
        </div>

        <div className="flex gap-x-5">
          <div className="border rounded-full h-7 w-7 p-1 bg-green-300">
            <BotMessageSquareIcon size={18} />
          </div>

          <AnswerWrapper answer={answer} />
        </div>
      </CardContent>
      {onDelete && (
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="icon" onClick={onDelete} disabled={isDeleting}>
            <Trash2Icon size={18} className="text-red-500" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}