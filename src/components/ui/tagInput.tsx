import React, { memo, useState, useCallback } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
}

/**
 * Tag input component for adding/removing tags.
 * Memoized to prevent unnecessary re-renders.
 */
const TagInput = memo(function TagInput({
  tags,
  setTags,
  placeholder = "Type and press Enter to add a tag",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags((prev) => [...prev, trimmedTag]);
        setInputValue("");
      }
    },
    [tags, setTags]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    },
    [setTags]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(inputValue);
    }
    // Allow backspace to remove last tag when input is empty
    if (event.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="border border-input rounded-md p-2 flex flex-wrap items-center gap-2 bg-background focus-within:ring-1 focus-within:ring-ring">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-secondary text-secondary-foreground rounded-full py-1 px-3 flex items-center gap-1 text-sm"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-none outline-none p-1 bg-transparent text-sm"
      />
    </div>
  );
});

export default TagInput;
