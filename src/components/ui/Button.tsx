import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "bg-red text-white",
  secondary: "bg-lime text-black",
  accent: "bg-purple text-white",
  outline: "bg-white text-black",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`font-black uppercase tracking-wide border-4 border-black cursor-pointer transition-all
          ${variantClasses[variant]} ${sizeClasses[size]} 
          ${disabled ? "opacity-50 cursor-not-allowed translate-0" : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"}
          ${className}`}
        style={{ boxShadow: disabled ? "none" : "4px 4px 0px #000" }}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
