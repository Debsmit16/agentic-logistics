import React from "react";
import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Clock,
  Warehouse,
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
      cardBorder: "border-slate-200/90",
      iconBg: "bg-slate-100 text-slate-700",
      valueColor: "text-slate-900",
      accent: "from-slate-500/10 to-transparent",
    },
    success: {
      cardBorder: "border-emerald-200/80 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
      valueColor: "text-emerald-900",
      accent: "from-emerald-500/10 to-transparent",
    },
    warning: {
      cardBorder: "border-amber-200/80 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
      valueColor: "text-amber-900",
      accent: "from-amber-500/10 to-transparent",
    },
    danger: {
      cardBorder: "border-rose-200/80 hover:border-rose-300",
      iconBg: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
      valueColor: "text-rose-900",
      accent: "from-rose-500/10 to-transparent",
    },
    info: {
      cardBorder: "border-cyan-200/80 hover:border-cyan-300",
      iconBg: "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-500/20",
      valueColor: "text-cyan-900",
      accent: "from-cyan-500/10 to-transparent",
    },
  }[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 border ${toneConfig.cardBorder} shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${toneConfig.accent} opacity-50 pointer-events-none`}
      />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`p-2.5 rounded-xl ${toneConfig.iconBg} transition-transform group-hover:scale-105 duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative mt-3 flex items-baseline justify-between gap-2">
        <p className={`text-3xl font-extrabold tracking-tight ${toneConfig.valueColor}`}>
          {value}
        </p>
        {trend ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p className="relative mt-2 text-xs text-slate-500 line-clamp-1">{hint}</p>
      ) : null}
    </div>
  );
}
