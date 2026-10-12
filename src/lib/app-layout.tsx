import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { MODULE_NAV, SETTINGS_NAV } from "@/lib/nav";
import { hasPermission } from "@/lib/rbac";
import { AppModule } from "@prisma/client";

export async function withAppLayout(children: React.ReactNode) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const links: { href: string; label: string }[] = [];
  for (const item of MODULE_NAV) {
    if (await hasPermission(user.role?.name, item.module, "canRead")) {
      links.push({ href: item.href, label: item.label });
    }
  }

  const settingsLinks =
    await hasPermission(user.role?.name, AppModule.SETTINGS, "canRead") ? SETTINGS_NAV : [];

  return (
    <AppShell
      userName={user.displayName}
      userEmail={user.email}
      roleName={user.role?.name ?? "—"}
      links={links}
      settingsLinks={settingsLinks}
    >
      {children}
    </AppShell>
  );
}
