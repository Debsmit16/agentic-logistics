import Link from "next/link";
import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";

export default async function WarehouseHomePage() {
  await requirePageUser();
  return withAppShell(
    <>
      <h1 className="text-2xl font-bold">Warehouse</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/warehouse/receive", label: "Receive Parcel", color: "bg-teal-700" },
          { href: "/warehouse/store", label: "Store Parcel", color: "bg-blue-700" },
          { href: "/warehouse/move", label: "Move Parcel", color: "bg-indigo-700" },
          { href: "/warehouse/find", label: "Find Parcel", color: "bg-violet-700" },
          { href: "/warehouse/sort", label: "Sort", color: "bg-amber-600" },
          { href: "/warehouse/returns", label: "Returns", color: "bg-orange-700" },
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
