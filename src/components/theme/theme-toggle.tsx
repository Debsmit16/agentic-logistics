"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to tactile light mode" : "Switch to sleek dark mode"}
      className={`group relative flex items-center h-8 w-15 rounded-full p-1 transition-all duration-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
        isDark
          ? "bg-slate-900 border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          : "bg-slate-200 border border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]"
      } ${className}`}
      aria-label="Toggle visual theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none select-none">
        <Sun className={`w-3 h-3 transition-opacity ${isDark ? "text-slate-600 opacity-40" : "text-amber-500 opacity-0"}`} />
        <Moon className={`w-3 h-3 transition-opacity ${isDark ? "text-cyan-400 opacity-0" : "text-slate-400 opacity-40"}`} />
      </div>

      {/* Tactile Sliding Knob with Skeuomorphic Inset Bevel & Specular Glow */}
      <span
        className={`relative z-10 flex items-center justify-center h-6 w-6 rounded-full transition-all duration-300 transform shadow-md ${
          isDark
            ? "translate-x-7 bg-gradient-to-b from-slate-700 to-slate-800 text-cyan-300 border border-slate-600/70 shadow-[0_2px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)]"
            : "translate-x-0 bg-gradient-to-b from-white to-slate-100 text-amber-500 border border-white shadow-[0_2px_5px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-cyan-400/20 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-amber-400/30 text-amber-500" />
        )}
      </span>
    </button>
  );
}
