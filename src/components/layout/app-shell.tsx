"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function navClass(active: boolean) {
  return active
    ? "border-b-2 border-[var(--text)] text-[var(--text)]"
    : "border-b-2 border-transparent text-[var(--muted)] hover:text-[var(--text)]";
}

export function AppShell({
  userName,
  roleName,
  links,
  children,
}: {
  userName: string;
  roleName: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <Link href="/dashboard" className="text-sm font-medium tracking-tight">
          Agentic Logistics
        </Link>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="hidden sm:inline">{userName}</span>
          <span className="hidden md:inline">· {roleName}</span>
          <button
            type="button"
            className="text-[var(--text)] hover:underline"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
              router.refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex gap-4 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-4 text-sm">
        <Link href="/dashboard" className={`shrink-0 py-3 ${navClass(pathname === "/dashboard")}`}>
          Home
        </Link>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`shrink-0 py-3 ${navClass(isActive(l.href))}`}>
            {l.label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">{children}</main>
    </div>
  );
}
