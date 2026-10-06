import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { SimpleScanActionPage } from "@/components/warehouse/shelf-action-page";

export default async function SortPage() {
  await requirePageUser();
  return withAppShell(
    <SimpleScanActionPage title="Sort Parcel" actionLabel="Mark sorted" endpoint="sort" />,
  );
}
