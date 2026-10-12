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
        <label className="block text-sm font-medium">
          Email
          <input className="input mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Email: <span className="font-medium text-[var(--text)]">{email}</span>
        </p>
      )}
      <label className="block text-sm font-medium">
        Display name
        <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </label>
      <label className="block text-sm font-medium">
        {isEdit ? "New password (leave blank to keep)" : "Password"}
        <input
          className="input mt-1.5"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          minLength={isEdit && !password ? undefined : 6}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Phone
          <input className="input mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Department
          <input className="input mt-1.5" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Role
        <select className="input mt-1.5" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
        </button>
      </div>
    </form>
  );
}
