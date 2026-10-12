import { withSettingsPage } from "@/lib/settings-layout";

export default async function SettingsGeneralPage() {
  return withSettingsPage(
    <div>
      <h1 className="page-title">General settings</h1>
      <p className="page-lead">Organization and app preferences (coming soon).</p>
    </div>,
  );
}
