"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV } from "@/lib/nav";

export function SettingsSubNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 lg:w-44">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Settings</p>
      <ul className="space-y-0.5 border-l border-[var(--border)] pl-3">
        {SETTINGS_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md py-1.5 pr-2 text-sm ${
                  active ? "font-medium text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
