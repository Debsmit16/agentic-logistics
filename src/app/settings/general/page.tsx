import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { withSettingsPage } from "@/lib/settings-layout";

export default async function SettingsGeneralPage() {
  return withSettingsPage(
    <div>
      <ErpPageHeader
        title="General Settings"
        description="Organization preferences and application defaults."
      />
      <div className="card p-8 text-sm text-[var(--muted)]">Configuration options will appear here.</div>
    </div>,
  );
}
