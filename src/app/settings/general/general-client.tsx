"use client";

import { useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";

type Settings = {
  appName: string;
  supportEmail: string;
  timezone: string;
};

export function GeneralClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/general")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings ?? null);
        setCanEdit(Boolean(d.canUpdate));
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/settings/general", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Save failed");
      return;
    }
    setSettings(data.settings);
    setMsg("Settings saved");
  }

  if (!settings) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div>
      <ErpPageHeader
        title="General Settings"
        description="Application name, support contact, and regional defaults."
      />
      {msg ? (
        <p className="mb-4 rounded-lg bg-[var(--primary-soft)] px-4 py-2 text-sm text-[var(--primary-dark)]">{msg}</p>
      ) : null}
      <form onSubmit={save} className="card max-w-xl space-y-4 p-6">
        <label className="block text-sm font-medium">
          Application name
          <input
            className="input mt-1.5"
            value={settings.appName}
            onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            disabled={!canEdit}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Support email
          <input
            className="input mt-1.5"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            disabled={!canEdit}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Timezone
          <input
            className="input mt-1.5"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            disabled={!canEdit}
            required
          />
        </label>
        {canEdit ? (
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
        ) : (
          <p className="text-xs text-[var(--muted)]">You have read-only access to organization settings.</p>
        )}
      </form>
    </div>
  );
}
