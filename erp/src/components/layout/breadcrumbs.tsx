"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { crumbsForPath } from "@/lib/breadcrumbs";

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsForPath(pathname);

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-300 dark:text-slate-700">/</span>}
          {c.href ? (
            <Link
              href={c.href}
              className="transition-colors hover:text-[var(--text)] font-medium"
            >
              {c.label}
            </Link>
          ) : (
            <span className="font-semibold text-[var(--text)]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
