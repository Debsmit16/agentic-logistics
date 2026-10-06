import Link from "next/link";
import type { SystemRole } from "@prisma/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AppShell({
  userName,
  role,
  preferredLang = "en",
  links,
  children,
}: {
  userName: string;
  role: SystemRole;
  preferredLang?: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <BrandLogo href="/dashboard" size="sm" />
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 hover:bg-teal-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <LanguageSwitcher current={preferredLang} />
            <span>
              {userName} · {role.replaceAll("_", " ")}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
