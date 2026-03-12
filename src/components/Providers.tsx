"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Get initial theme preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (savedTheme === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <style>
        {`
          html {
            color-scheme: ${isDark ? "dark" : "light"};
          }
        `}
      </style>
      {children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
