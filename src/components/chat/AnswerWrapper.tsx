import { MemoizedReactMarkdown } from "./Markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "../ui/codeblock";
import React from "react";

interface IProps {
  answer: string;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AnswerWrapper = ({ answer }: IProps) => {
  return (
    <MemoizedReactMarkdown
      className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        code({ inline, className, children, ...props }: CodeProps) {
          const childArray = React.Children.toArray(children); // Convert to array

          if (childArray.length > 0) {
            if (childArray[0] === "▍") {
              return (
                <span className="mt-1 cursor-default animate-pulse">▍</span>
              );
            }

            // Replace '`▍`' with '▍' if needed
            childArray[0] = (childArray[0] as string).replace("`▍`", "▍");
          }

          const match = /language-(\w+)/.exec(className || "");

          if (inline) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            );
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(childArray).replace(/\n$/, "")}
              {...props}
            />
          );
        },
      }}
    >
      {answer}
    </MemoizedReactMarkdown>
  );
};
