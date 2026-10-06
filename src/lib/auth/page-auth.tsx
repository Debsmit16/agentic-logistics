import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db";

export async function withAppShell(children: React.ReactNode) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferredLang: true },
  });
  return (
    <AppShell
      userName={user.displayName}
      role={user.role}
      preferredLang={full?.preferredLang ?? "en"}
    >
      {children}
    </AppShell>
  );
}

export async function requirePageUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
