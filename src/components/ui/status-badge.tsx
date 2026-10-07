import React from "react";
import { ParcelStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: string | ParcelStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  EXPECTED: {
    label: "Expected",
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  RECEIVED: {
    label: "Received",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  WEIGHED: {
    label: "Weighed",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
    border: "border-cyan-200",
  },
  STORED: {
    label: "Stored",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
  },
  SORTED: {
    label: "Sorted",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
  READY_FOR_DISPATCH: {
    label: "Ready for Dispatch",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  ASSIGNED: {
    label: "Assigned",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    border: "border-violet-200",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500 animate-pulse",
    border: "border-amber-300",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-300",
  },
  DELIVERY_FAILED: {
    label: "Delivery Failed",
    bg: "bg-rose-50",
    text: "text-rose-800",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  REATTEMPT_SCHEDULED: {
    label: "Reattempt Scheduled",
    bg: "bg-orange-50",
    text: "text-orange-800",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  RETURN_TO_WAREHOUSE: {
    label: "Return to Warehouse",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
    border: "border-yellow-200",
  },
  RETURNED_TO_PARTNER: {
    label: "Returned to Partner",
    bg: "bg-zinc-100",
    text: "text-zinc-800",
    dot: "bg-zinc-500",
    border: "border-zinc-300",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
  DAMAGED: {
    label: "Damaged",
    bg: "bg-red-50",
    text: "text-red-800",
    dot: "bg-red-600",
    border: "border-red-300",
  },
  MISSING: {
    label: "Missing",
    bg: "bg-stone-100",
    text: "text-stone-800",
    dot: "bg-stone-500",
    border: "border-stone-300",
  },
};

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const normalized = String(status || "").toUpperCase();
  const config = STATUS_CONFIG[normalized] || {
    label: normalized.replaceAll("_", " ") || "Unknown",
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
