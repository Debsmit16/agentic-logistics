import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { ShelfActionPage } from "@/components/warehouse/shelf-action-page";

export default async function StorePage() {
  await requirePageUser();
  return withAppShell(
    <ShelfActionPage title="Store Parcel" actionLabel="Store here" endpoint="store" />,
  );
}
