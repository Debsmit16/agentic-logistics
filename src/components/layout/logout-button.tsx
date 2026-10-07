"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/i18n-provider";

export function LogoutButton() {
  const t = useT();
  const router = useRouter();
  return (
    <button
      type="button"
      className="erp-btn erp-btn--ghost erp-btn--sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      {t("logout")}
    </button>
  );
}
