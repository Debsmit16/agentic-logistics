"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SettingsNavItem } from "@/lib/nav";

function linkClass(active: boolean) {
  return active
    ? "bg-neutral-100 font-medium text-[var(--text)]"
    : "text-[var(--muted)] hover:bg-neutral-50 hover:text-[var(--text)]";
}

export function AppShell({
  userName,
  roleName,
  links,
  settingsLinks,
  children,
}: {
  userName: string;
  roleName: string;
  links: { href: string; label: string }[];
  settingsLinks: SettingsNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <Link href="/dashboard" className="block text-sm font-semibold tracking-tight">
            Agentic Logistics
          </Link>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">Operations</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-2 text-sm">
          <Link href="/dashboard" className={`block rounded-md px-3 py-2 ${linkClass(pathname === "/dashboard")}`}>
            Dashboard
          </Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`block rounded-md px-3 py-2 ${linkClass(isActive(l.href))}`}>
              {l.label}
            </Link>
          ))}

          {settingsLinks.length > 0 ? (
            <div className="pt-2">
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${linkClass(pathname.startsWith("/settings"))}`}
                onClick={() => setSettingsOpen((o) => !o)}
              >
                <span>Settings</span>
                <span className="text-xs text-[var(--muted)]">{settingsOpen ? "−" : "+"}</span>
              </button>
              {settingsOpen ? (
                <div className="ml-2 mt-0.5 space-y-0.5 border-l border-[var(--border)] pl-2">
                  {settingsLinks.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className={`block rounded-md px-2 py-1.5 text-xs ${linkClass(isActive(s.href))}`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="border-t border-[var(--border)] p-3 text-xs">
          <p className="truncate font-medium">{userName}</p>
          <p className="truncate text-[var(--muted)]">{roleName}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/profile" className="text-[var(--text)] hover:underline">Profile</Link>
            <button
              type="button"
              className="text-left text-[var(--muted)] hover:text-[var(--text)] hover:underline"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
