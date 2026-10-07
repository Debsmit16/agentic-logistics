import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { box: "h-9 w-9", px: 36 },
  md: { box: "h-11 w-11", px: 44 },
  lg: { box: "h-16 w-16", px: 64 },
  xl: { box: "h-24 w-24", px: 96 },
  hero: { box: "h-32 w-32", px: 128 },
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  href?: string | false;
  className?: string;
};

export function BrandLogo({
  size = "md",
  showWordmark = true,
  href = "/dashboard",
  className = "",
}: BrandLogoProps) {
  const s = SIZES[size];
  const src = size === "hero" || size === "xl" ? "/logo-512.png" : "/logo-128.png";

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative shrink-0 overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md ring-1 ring-cyan-500/30 ${s.box}`}
      >
        <Image
          src={src}
          alt="Agentic Logistics"
          width={s.px}
          height={s.px}
          className="h-full w-full object-contain p-1"
          priority={size === "lg" || size === "hero"}
        />
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-black tracking-tight text-[var(--text-primary)] sm:text-lg">
            Agentic
          </span>
          <span className="text-xs font-bold text-[var(--accent-primary)] sm:text-sm tracking-wider uppercase">
            Logistics
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href !== false) {
    return (
      <Link
        href={href}
        className="rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-cyan-500 transition-opacity hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return content;
}
