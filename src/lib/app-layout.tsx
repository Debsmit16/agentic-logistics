import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { MODULE_NAV } from "@/lib/nav";
import { hasPermission } from "@/lib/rbac";

export async function withAppLayout(children: React.ReactNode) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const links: { href: string; label: string }[] = [];
  for (const item of MODULE_NAV) {
    if (await hasPermission(user.role?.name, item.module, "canRead")) {
      links.push({ href: item.href, label: item.label });
    }
  }

  return (
    <AppShell userName={user.displayName} roleName={user.role?.name ?? "—"} links={links}>
      {children}
    </AppShell>
  );
}
