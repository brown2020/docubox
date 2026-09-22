"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Password field with accessible show/hide toggle (eye icon).
 * Required for app-eval auth UX on sign-in / sign-up.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const label = isVisible ? "Hide password" : "Show password";
    const Icon = isVisible ? EyeOff : Eye;

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          disabled={disabled}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={label}
          aria-pressed={isVisible}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex h-10 w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
