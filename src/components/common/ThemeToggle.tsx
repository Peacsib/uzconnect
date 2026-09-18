"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("wrl_theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("wrl_theme", nextDark ? "dark" : "light");
  };

  // Prevent SSR hydration mismatch by rendering a stable placeholder until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="w-9 h-9 opacity-0">
        <span className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {dark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 transition-transform rotate-0" />
      )}
    </Button>
  );
}
