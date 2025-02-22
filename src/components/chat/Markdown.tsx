import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";

interface MarkdownProps extends Options {
  className?: string;
}

const MarkdownComponent: FC<MarkdownProps> = (props) => (
  <ReactMarkdown {...props} />
);

MarkdownComponent.displayName = "MarkdownComponent"; // ✅ Fix missing display name

export const MemoizedReactMarkdown = memo(
  MarkdownComponent,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
