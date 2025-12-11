import { FunctionComponent } from "react";

interface ApiKeyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Reusable API key input component with consistent styling.
 */
export const ApiKeyInput: FunctionComponent<ApiKeyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <>
      <label htmlFor={id} className="text-sm font-medium">
        {label}:
      </label>
      <input
        type="password"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 h-10"
        placeholder={placeholder}
      />
    </>
  );
};
