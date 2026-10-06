import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { ShelfActionPage } from "@/components/warehouse/shelf-action-page";

export default async function MovePage() {
  await requirePageUser();
  return withAppShell(
    <ShelfActionPage title="Move Parcel" actionLabel="Move here" endpoint="move" />,
  );
}
