import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-sm font-black uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`px-4 py-3 text-base font-bold border-4 border-black bg-white text-black outline-none
            focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_#000] transition-all
            ${error ? "border-red" : ""} ${className}`}
          style={{ boxShadow: "4px 4px 0px #000" }}
          {...props}
        />
        {error && (
          <span className="text-sm font-black text-red">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
