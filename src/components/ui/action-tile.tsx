import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ActionTile({
  href,
  title,
  description,
  icon,
  variant = "primary",
}: {
  href: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}) {
  const variantStyles = {
    primary: "border-cyan-200/80 bg-white hover:border-cyan-400 group-hover:bg-cyan-50/50",
    secondary: "border-blue-200/80 bg-white hover:border-blue-400 group-hover:bg-blue-50/50",
    accent: "border-amber-200/80 bg-white hover:border-amber-400 group-hover:bg-amber-50/50",
  }[variant];

  const iconBgStyles = {
    primary: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/20",
    secondary: "bg-blue-50 text-blue-700 ring-1 ring-blue-500/20",
    accent: "bg-amber-50 text-amber-700 ring-1 ring-amber-500/20",
  }[variant];

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-5 rounded-2xl border shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${variantStyles}`}
    >
      <div className={`p-3.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200 ${iconBgStyles}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
          {title}
        </h3>
        {description ? (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>
        ) : null}
      </div>
      <span className="p-2 text-slate-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all">
        <ArrowRight className="w-5 h-5" />
      </span>
    </Link>
  );
}
