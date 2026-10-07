import React from "react";
import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  icon?: LucideIcon;
  trend?: string;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon: CustomIcon,
  trend,
}: StatCardProps) {
  const getDefaultIcon = () => {
    switch (tone) {
      case "success":
        return CheckCircle2;
      case "warning":
        return Truck;
      case "danger":
        return AlertTriangle;
      case "info":
        return Clock;
      default:
        return Package;
    }
  };

  const Icon = CustomIcon || getDefaultIcon();

  const toneConfig = {
    default: {
      iconBg: "bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-inner",
      glowColor: "rgba(148, 163, 184, 0.15)",
      valueColor: "text-[var(--text-primary)]",
    },
    success: {
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
      glowColor: "rgba(16, 185, 129, 0.2)",
      valueColor: "text-emerald-500 dark:text-emerald-400",
    },
    warning: {
      iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
      glowColor: "rgba(245, 158, 11, 0.2)",
      valueColor: "text-amber-500 dark:text-amber-400",
    },
    danger: {
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
      glowColor: "rgba(244, 63, 94, 0.2)",
      valueColor: "text-rose-500 dark:text-rose-400",
    },
    info: {
      iconBg: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
      glowColor: "rgba(6, 182, 212, 0.2)",
      valueColor: "text-cyan-500 dark:text-cyan-400",
    },
  }[tone];

  return (
    <div className="skeuo-card group p-5 transition-all duration-300 hover:-translate-y-1">
      {/* Top subtle highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${toneConfig.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className={`text-3xl sm:text-4xl font-black tracking-tight ${toneConfig.valueColor}`}>
          {value}
        </p>
        {trend ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-xs">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-1">{hint}</p>
      ) : null}
    </div>
  );
}
