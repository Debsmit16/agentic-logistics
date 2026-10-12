"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { UserAvatar } from "@/components/ui/user-avatar";
import { IconBuilding, IconPlus, IconRole, IconShield } from "@/components/icons/nav-icons";

type Role = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  isActive: boolean;
  role: Role | null;
};

function shortId(id: string) {
  return id.replace(/-/g, "").slice(-4).toUpperCase();
}

export function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const load = useCallback(async () => {
    const data = await fetch("/api/users").then((r) => r.json());
    setUsers(data.users ?? []);
    setRoles(data.roles ?? []);
    if (data.roles?.length && !roleId) setRoleId(data.roles[0].id);
  }, [roleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName, password, roleId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Could not create user");
      return;
    }
    setMsg("User created");
    setShowForm(false);
    setEmail("");
    setDisplayName("");
    setPassword("");
    load();
  }

  async function toggleActive(user: UserRow) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Update failed");
      return;
    }
    load();
  }

  async function changeRole(user: UserRow, newRoleId: string) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: newRoleId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error ?? "Update failed");
      return;
    }
    load();
  }

  return (
    <div>
      <ErpPageHeader
        title="User Management"
        description="Manage system users, their roles, departments, and activation status."
      />

      {msg ? (
        <p className="mb-4 rounded-lg bg-[var(--primary-soft)] px-4 py-2 text-sm text-[var(--primary-dark)]">{msg}</p>
      ) : null}

      <div className="data-panel">
        <div className="data-panel-header">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconShield />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">User Directory</h2>
              <p className="text-sm text-[var(--muted)]">Manage user access, roles, and organizational assignments.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-pill"
            onClick={() => setShowForm((v) => !v)}
          >
            <IconPlus />
            {showForm ? "Cancel" : "Add User"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={createUser} className="space-y-4 border-b border-[var(--border)] bg-neutral-50/50 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Email
                <input className="input mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block text-sm font-medium">
                Display name
                <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input
                  className="input mt-1.5"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <label className="block text-sm font-medium">
                Role
                <select className="input mt-1.5" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Create user</button>
          </form>
        ) : null}

        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[var(--muted)]">
                    No users yet. Add your first user above.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.displayName} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text)]">{u.displayName}</p>
                          <p className="text-xs text-[var(--muted)]">{u.email}</p>
                          <span className="id-badge">ID: {shortId(u.id)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-[var(--primary)]">
                        <IconRole className="shrink-0 opacity-70" />
                        <select
                          className="select-ghost max-w-[12rem] uppercase"
                          value={u.role?.id ?? ""}
                          onChange={(e) => changeRole(u, e.target.value)}
                          aria-label={`Role for ${u.displayName}`}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <IconBuilding className="shrink-0 opacity-60" />
                        {u.phone ? u.phone : "—"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <ToggleSwitch
                          checked={u.isActive}
                          onChange={() => toggleActive(u)}
                          label={`${u.displayName} active`}
                        />
                        <span className={u.isActive ? "status-active" : "text-sm text-[var(--muted)]"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-[var(--muted)]">—</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
