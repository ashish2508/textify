import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border-4 border-black p-6 ${className}`}
      style={{ boxShadow: "6px 6px 0px #000" }}
    >
      {children}
    </div>
  );
}
