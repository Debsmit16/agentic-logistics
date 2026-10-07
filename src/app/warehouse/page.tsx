import { requirePageUser, withAppShell, getPageLocale } from "@/lib/auth/page-auth";
import { t } from "@/lib/i18n";
import { WarehouseHub } from "@/components/warehouse/warehouse-hub";

export default async function WarehouseHomePage() {
  await requirePageUser();
  const locale = await getPageLocale();
  return withAppShell(<WarehouseHub locale={locale} />);
}
