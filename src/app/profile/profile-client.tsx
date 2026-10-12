"use client";

import { useEffect, useState } from "react";

export function ProfileClient() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

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

  async function save() {
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
    setMsg(res.ok ? "Profile updated" : data.error ?? "Update failed");
  }

  return (
    <div className="card max-w-lg space-y-4 p-6">
      <h1 className="page-title">Profile</h1>
      <p className="text-sm text-[var(--muted)]">{email} · {role}</p>
      <label className="block text-sm">
        Display name
        <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>
      <label className="block text-sm">
        Phone
        <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <hr className="border-[var(--border)]" />
      <p className="text-sm font-semibold">Change password</p>
      <label className="block text-sm">
        Current password
        <input className="input mt-1" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </label>
      <label className="block text-sm">
        New password
        <input className="input mt-1" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </label>
      {msg ? <p className="text-sm text-cyan-800">{msg}</p> : null}
      <button type="button" className="btn btn-primary" onClick={save}>Save</button>
    </div>
  );
}
