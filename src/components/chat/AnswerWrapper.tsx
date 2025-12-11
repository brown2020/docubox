import { memo, useMemo } from "react";
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

/**
 * Renders AI-generated markdown answers with syntax highlighting.
 * Memoized to prevent unnecessary re-renders.
 */
export const AnswerWrapper = memo(function AnswerWrapper({ answer }: IProps) {
  // Memoize components object to prevent recreation on each render
  const components = useMemo(
    () => ({
      p({ children }: { children?: React.ReactNode }) {
        return <p className="mb-2 last:mb-0">{children}</p>;
      },
      code({ inline, className, children, ...props }: CodeProps) {
        const childArray = React.Children.toArray(children);

        if (childArray.length > 0) {
          if (childArray[0] === "▍") {
            return <span className="mt-1 cursor-default animate-pulse">▍</span>;
          }
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

        // Use content-based key instead of Math.random()
        const codeValue = String(childArray).replace(/\n$/, "");
        return (
          <CodeBlock
            key={`code-${codeValue.slice(0, 50)}`}
            language={(match && match[1]) || ""}
            value={codeValue}
            {...props}
          />
        );
      },
    }),
    []
  );

  return (
    <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
      <MemoizedReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        components={components}
      >
        {answer}
      </MemoizedReactMarkdown>
    </div>
  );
});
