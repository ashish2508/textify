import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight">
            <span className="bg-accent px-3 py-1 neo-border neo-shadow inline-block -rotate-2">
              Textify
            </span>
          </h1>
          <p className="mt-4 font-bold text-lg">Real-time multilingual chat</p>
        </div>
        {children}
      </div>
    </div>
  );
}
