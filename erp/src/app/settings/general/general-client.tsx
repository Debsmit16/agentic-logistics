"use client";

import { useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";

type Settings = {
  appName: string;
  supportEmail: string;
  timezone: string;
  currency: string;
  retentionDays: string;
  headquarters: string;
  maintenanceBanner: string;
};

export function GeneralClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
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
    try {
      const res = await fetch("/api/settings/general", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setMsg({ text: data.error ?? "Failed to save configuration", type: "error" });
        return;
      }
      setSettings(data.settings);
      setMsg({ text: "System configuration updated and applied successfully", type: "success" });
    } catch {
      setSaving(false);
      setMsg({ text: "Network error saving settings", type: "error" });
    }
  }

  if (!settings) {
    return (
      <div className="py-12 text-center text-xs text-[var(--muted)]">
        Loading system configuration…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErpPageHeader
        title="General Configuration"
        description="Global system parameters, organization details, financial units, and operational telemetry policies."
      />

      {msg && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium border ${
            msg.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          <span>{msg.text}</span>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-[11px] font-bold opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={save} className="max-w-3xl space-y-6">
        {/* Organization Profile Card */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--text)]">Organization Profile</h2>
            <p className="text-xs text-[var(--muted)]">Brand identity shown across navigation, manifests, and email notifications</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Application Name
              <input
                className="input mt-1.5 font-normal"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                disabled={!canEdit}
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Support Contact Email
              <input
                className="input mt-1.5 font-normal"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                disabled={!canEdit}
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] sm:col-span-2">
              Primary Headquarters / Operating Hub
              <input
                className="input mt-1.5 font-normal"
                value={settings.headquarters}
                onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                disabled={!canEdit}
                placeholder="e.g. Mumbai Logistics Park, Maharashtra"
              />
            </label>
          </div>
        </div>

        {/* Regional & Financial Defaults */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--text)]">Localization & Financial Units</h2>
            <p className="text-xs text-[var(--muted)]">Regional timezone for dispatch schedules and primary billing currency</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Primary System Timezone
                <input
                  className="input mt-1.5 font-mono text-xs"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  disabled={!canEdit}
                  required
                />
              </label>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                IANA standard: e.g. <span className="font-mono">Asia/Kolkata</span> or <span className="font-mono">UTC</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Default Currency Code
                <select
                  className="input mt-1.5 cursor-pointer font-normal"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  disabled={!canEdit}
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (د.إ) — UAE Dirham</option>
                </select>
              </label>
              <p className="mt-1 text-[11px] text-[var(--muted)]">Used for COD collection and settlement manifests</p>
            </div>
          </div>
        </div>

        {/* Operations & Governance */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--text)]">Operations & Telemetry Governance</h2>
            <p className="text-xs text-[var(--muted)]">Data retention policies and operator broadcast messaging</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Audit Trail Retention Window
                <select
                  className="input mt-1.5 cursor-pointer font-normal"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({ ...settings, retentionDays: e.target.value })}
                  disabled={!canEdit}
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="180">180 Days</option>
                  <option value="365">365 Days (1 Year Compliance)</option>
                </select>
              </label>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Logs older than this duration will be automatically archived
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                System Broadcast Banner (Optional)
                <input
                  className="input mt-1.5 font-normal"
                  value={settings.maintenanceBanner}
                  onChange={(e) => setSettings({ ...settings, maintenanceBanner: e.target.value })}
                  disabled={!canEdit}
                  placeholder="e.g. Scheduled warehouse stock audit this Saturday 10:00 PM IST"
                />
              </label>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Displays an operational advisory notice across the portal when populated
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {canEdit ? (
            <button type="submit" className="btn btn-primary px-6" disabled={saving}>
              {saving ? "Saving…" : "Save Configuration"}
            </button>
          ) : (
            <p className="text-xs text-[var(--muted)] italic">
              Your role has read-only permission for system configuration.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
