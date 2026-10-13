import Image from "next/image";
import { APP_NAME, APP_SHORT_NAME, LOGO } from "@/lib/brand";

type AppLogoProps = {
  /** Sidebar collapsed: icon only */
  compact?: boolean;
  /** Login / marketing: larger mark */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: { src: LOGO.sm, px: 36 },
  md: { src: LOGO.md, px: 48 },
  lg: { src: LOGO.md, px: 72 },
  xl: { src: "/logo-192.png", px: 96 },
} as const;

export function AppLogo({ compact, size = "sm", className }: AppLogoProps) {
  const { src, px } = SIZES[size];
  const displayPx = compact ? 32 : px;
  const imageSrc = compact ? LOGO.sm : src;

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Image
        src={imageSrc}
        alt={APP_NAME}
        width={displayPx}
        height={displayPx}
        className="shrink-0 rounded-lg object-contain"
        priority
      />
      {!compact ? (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold tracking-tight text-[var(--text)]">{APP_SHORT_NAME}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">Logistics ERP</p>
        </div>
      ) : null}
    </div>
  );
}
