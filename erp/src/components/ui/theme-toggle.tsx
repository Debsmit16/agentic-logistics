"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("al_theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("al_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className || ""}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex h-8 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--muted)] shadow-sm transition-all hover:bg-[var(--surface-raised)] hover:text-[var(--text)] active:scale-95 ${
        className || ""
      }`}
      title={isDark ? "Switch to White / Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to White / Light Theme" : "Switch to Dark Theme"}
    >
      {isDark ? (
        <>
          {/* Sun Icon for Switching to Light Theme */}
          <svg
            className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-medium text-[var(--text)]">Light</span>
        </>
      ) : (
        <>
          {/* Moon Icon for Switching to Dark Theme */}
          <svg
            className="h-3.5 w-3.5 text-slate-700 transition-transform duration-300 group-hover:-rotate-12 dark:text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-medium text-[var(--text)]">Dark</span>
        </>
      )}
    </button>
  );
}
