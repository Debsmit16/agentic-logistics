"use client";

import { useEffect, useState } from "react";

export type UserFormValues = {
  email: string;
  displayName: string;
  password: string;
  phone: string;
  department: string;
  roleId: string;
};

type Role = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  department: string | null;
  role: Role | null;
};

export function UserFormModal({
  open,
  user,
  roles,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  user: UserRow | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  saving: boolean;
}) {
  const isEdit = Boolean(user);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [roleId, setRoleId] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmail(user?.email ?? "");
    setDisplayName(user?.displayName ?? "");
    setPassword("");
    setPhone(user?.phone ?? "");
    setDepartment(user?.department ?? "");
    setRoleId(user?.role?.id ?? roles[0]?.id ?? "");
  }, [open, user, roles]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      email,
      displayName,
      password,
      phone,
      department,
      roleId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit ? (
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Email Address
          <input
            className="input mt-1.5 font-normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@agenticlogistics.in"
            required
          />
        </label>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Email Account</p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--text)]">{email}</p>
        </div>
      )}

      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Display Name
        <input
          className="input mt-1.5 font-normal"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. John Doe"
          required
        />
      </label>

      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        {isEdit ? "Change Password (leave blank to retain current)" : "Initial Password"}
        <input
          className="input mt-1.5 font-normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required={!isEdit}
          minLength={isEdit && !password ? undefined : 6}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Contact Phone
          <input
            className="input mt-1.5 font-normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98200 00000"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Department / Hub
          <input
            className="input mt-1.5 font-normal"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. North Hub Ops"
          />
        </label>
      </div>

      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Role Privileges
        <select
          className="input mt-1.5 font-normal cursor-pointer"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex justify-end gap-2.5 border-t border-[var(--border)] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Account"}
        </button>
      </div>
    </form>
  );
}
