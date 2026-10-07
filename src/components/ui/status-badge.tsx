import React from "react";
import { ParcelStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: string | ParcelStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string; glow: string }
> = {
  EXPECTED: {
    label: "Expected",
    bg: "bg-slate-500/15 text-slate-300",
    text: "text-slate-300 dark:text-slate-300",
    dot: "bg-slate-400",
    border: "border-slate-500/30",
    glow: "",
  },
  RECEIVED: {
    label: "Received",
    bg: "bg-sky-500/15",
    text: "text-sky-600 dark:text-sky-300",
    dot: "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/10",
  },
  WEIGHED: {
    label: "Weighed",
    bg: "bg-cyan-500/15",
    text: "text-cyan-600 dark:text-cyan-300",
    dot: "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/10",
  },
  STORED: {
    label: "Stored",
    bg: "bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-300",
    dot: "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/10",
  },
  SORTED: {
    label: "Sorted",
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-300",
    dot: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
  },
  READY_FOR_DISPATCH: {
    label: "Ready for Dispatch",
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-300",
    dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/10",
  },
  ASSIGNED: {
    label: "Assigned",
    bg: "bg-violet-500/15",
    text: "text-violet-600 dark:text-violet-300",
    dot: "bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/10",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-300 font-bold",
    dot: "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]",
    border: "border-amber-500/40",
    glow: "shadow-amber-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-300 font-bold",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/20",
  },
  DELIVERY_FAILED: {
    label: "Delivery Failed",
    bg: "bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-300 font-bold",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]",
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20",
  },
  REATTEMPT_SCHEDULED: {
    label: "Reattempt Scheduled",
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-300",
    dot: "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/10",
  },
  RETURN_TO_WAREHOUSE: {
    label: "Return to Warehouse",
    bg: "bg-yellow-500/15",
    text: "text-yellow-600 dark:text-yellow-300",
    dot: "bg-yellow-400",
    border: "border-yellow-500/30",
    glow: "",
  },
  RETURNED_TO_PARTNER: {
    label: "Returned to Partner",
    bg: "bg-zinc-500/15",
    text: "text-zinc-600 dark:text-zinc-300",
    dot: "bg-zinc-400",
    border: "border-zinc-500/30",
    glow: "",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-gray-500/15",
    text: "text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400",
    border: "border-gray-500/30",
    glow: "",
  },
  DAMAGED: {
    label: "Damaged",
    bg: "bg-red-500/15",
    text: "text-red-600 dark:text-red-400 font-bold",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]",
    border: "border-red-500/40",
    glow: "shadow-red-500/20",
  },
  MISSING: {
    label: "Missing",
    bg: "bg-stone-500/15",
    text: "text-stone-600 dark:text-stone-300",
    dot: "bg-stone-400",
    border: "border-stone-500/30",
    glow: "",
  },
};

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const normalized = String(status || "").toUpperCase();
  const config = STATUS_CONFIG[normalized] || {
    label: normalized.replaceAll("_", " ") || "Unknown",
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    dot: "bg-slate-400",
    border: "border-slate-500/30",
    glow: "",
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
    lg: "px-3.5 py-1.5 text-xs font-bold gap-2.5",
  }[size];

  return (
    <span
      className={`relative inline-flex items-center rounded-full border shadow-xs overflow-hidden backdrop-blur-md transition-all ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses} ${className}`}
    >
      {/* Specular top gloss */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* LED dot */}
      <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span className="relative z-10 tracking-wide font-medium">{config.label}</span>
    </span>
  );
}
