import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-sm font-black uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`px-4 py-3 text-base font-bold border-4 border-black bg-white text-black appearance-none cursor-pointer
            hover:bg-yellow transition-colors ${className}`}
          style={{ boxShadow: "4px 4px 0px #000" }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
