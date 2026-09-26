import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs tracking-wide text-fg-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "h-11 border border-border bg-surface px-3 text-sm text-fg placeholder:text-fg-muted focus:border-fg focus:outline-none",
            error && "border-error",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
