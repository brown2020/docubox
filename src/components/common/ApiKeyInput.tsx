import { memo } from "react";
import { Input } from "@/components/ui/input";

interface ApiKeyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Reusable API key input component with consistent styling.
 * Uses the UI Input component for consistency across the app.
 */
export const ApiKeyInput = memo(function ApiKeyInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: ApiKeyInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        type="password"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
});
