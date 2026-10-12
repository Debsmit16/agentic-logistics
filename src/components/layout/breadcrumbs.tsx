"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { crumbsForPath } from "@/lib/breadcrumbs";

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsForPath(pathname);

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 ? <span className="text-neutral-300">›</span> : null}
          {c.href ? (
            <Link href={c.href} className="hover:text-[var(--primary)]">
              {c.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--text)]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
