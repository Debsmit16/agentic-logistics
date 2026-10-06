import Link from "next/link";
import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import ReportsAgingClient from "./reports-aging-client";

export default async function ReportsPage() {
  await requirePageUser();
  return withAppShell(
    <>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-gray-600">Parcels open more than 7 days</p>
      <div className="mt-4 flex flex-col gap-3">
        <Link
          href="/api/reports/parcels"
          className="inline-block w-fit rounded-xl bg-teal-700 px-5 py-3 text-white"
        >
          Download parcels CSV
        </Link>
      </div>
      <ReportsAgingClient />
    </>,
  );
}
