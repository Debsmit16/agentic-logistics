"use client";

import { useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { UserAvatar } from "@/components/ui/user-avatar";

export function ProfileClient() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setDisplayName(d.user?.displayName ?? "");
        setPhone(d.user?.phone ?? "");
        setEmail(d.user?.email ?? "");
        setRole(d.user?.role ?? "");
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          phone: phone || null,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setMsg({ text: "Profile updated successfully", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setMsg({ text: data.error ?? "Update failed", type: "error" });
      }
    } catch {
      setSaving(false);
      setMsg({ text: "Network error updating profile", type: "error" });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ErpPageHeader
        title="Personal Profile & Security"
        description="Manage your account identity, contact details, and password."
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

      {/* Identity Card */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar name={displayName || "Admin"} size="lg" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">{displayName || "Loading…"}</h2>
            <p className="text-xs text-[var(--muted)]">{email}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] uppercase tracking-wider">
              {role || "Authorized User"}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Profile Info */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Display Name
              <input
                className="input mt-1.5 font-normal"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Contact Phone
              <input
                className="input mt-1.5 font-normal"
                placeholder="+91 98201 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Password Security */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Change Password</h3>
            <p className="text-[11px] text-[var(--muted)]">Leave blank if you do not want to change your password</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Current Password
              <input
                className="input mt-1.5 font-normal"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              New Password
              <input
                className="input mt-1.5 font-normal"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn btn-primary px-6">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
