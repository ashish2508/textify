import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight">
            <span
              className="px-5 py-3 border-4 border-black inline-block bg-red text-white"
              style={{ boxShadow: "8px 8px 0px #000", transform: "rotate(-2deg)" }}
            >
              Textify
            </span>
          </h1>
          <p className="mt-6 font-black text-lg uppercase tracking-wide">
            Real-time multilingual chat
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
