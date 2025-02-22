import React, { FunctionComponent, useState } from 'react';

type TagInputProps = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}
const TagInput: FunctionComponent<TagInputProps> = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-gray-300 rounded-md p-2 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="bg-gray-300 text-gray-700 rounded-full py-1 px-3 flex items-center space-x-2">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter or comma to add a tag"
        className="flex-1 border-none outline-hidden p-1"
      />
    </div>
  );
};

export default TagInput;
