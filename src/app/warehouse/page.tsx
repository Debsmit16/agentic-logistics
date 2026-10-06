import Link from "next/link";
import { requirePageUser, withAppShell, getPageLocale } from "@/lib/auth/page-auth";
import { t } from "@/lib/i18n";

export default async function WarehouseHomePage() {
  await requirePageUser();
  const locale = await getPageLocale();
  return withAppShell(
    <>
      <h1 className="text-2xl font-bold">{t(locale, "warehouseHub")}</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/warehouse/receive", label: t(locale, "receive"), color: "bg-teal-700" },
          { href: "/warehouse/store", label: t(locale, "store"), color: "bg-blue-700" },
          { href: "/warehouse/move", label: t(locale, "move"), color: "bg-indigo-700" },
          { href: "/warehouse/find", label: t(locale, "find"), color: "bg-violet-700" },
          { href: "/warehouse/sort", label: t(locale, "sort"), color: "bg-amber-600" },
          { href: "/warehouse/returns", label: t(locale, "returns"), color: "bg-orange-700" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-2xl ${item.color} px-6 py-8 text-center text-xl font-bold text-white`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>,
  );
}
