import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-bold uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`neo-input px-4 py-3 text-base ${error ? "border-primary" : ""
            } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-sm font-bold text-primary">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
