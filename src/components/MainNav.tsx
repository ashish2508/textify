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
    <nav className="bg-cream border-b-4 border-black px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/chat" className="flex items-center gap-2">
          <span
            className="px-4 py-2 border-4 border-black font-black text-xl uppercase bg-red text-white"
            style={{ boxShadow: "4px 4px 0px #000", transform: "rotate(-2deg)" }}
          >
            Textify
          </span>
        </Link>
        <Link
          href="https://textify-steg.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border-4 border-black font-black text-sm uppercase bg-purple text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          style={{ boxShadow: "4px 4px 0px #000" }}
        >
          Steganography
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="font-black text-sm px-3 py-2 uppercase hover:bg-yellow border-2 border-black transition-colors"
        >
          ⚙ Settings
        </Link>
        <span
          className="font-black text-sm px-3 py-2 border-4 border-black uppercase bg-teal"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          {user?.name || user?.email}
        </span>
        <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
