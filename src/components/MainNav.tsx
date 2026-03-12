"use client";

import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface MainNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function MainNav({ user }: MainNavProps) {
  return (
    <nav className="neo-border border-t-0 border-l-0 border-r-0 bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/chat" className="flex items-center gap-2">
        <span className="bg-accent px-2 py-0.5 neo-border neo-shadow-sm font-black text-xl uppercase -rotate-1">
          Textify
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/settings" className="font-bold text-sm hover:bg-secondary/20 px-2 py-1 transition-colors">
          ⚙ Settings
        </Link>
        <span className="font-bold text-sm bg-bg px-2 py-1 neo-border">
          {user?.name || user?.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
