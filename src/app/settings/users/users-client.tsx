"use client";

import { useCallback, useEffect, useState } from "react";

type Role = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  isActive: boolean;
  role: Role | null;
};

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-lead">Accounts, roles, and activation status.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>
      {msg ? <p className="text-sm text-[var(--muted)]">{msg}</p> : null}

      {showForm ? (
        <form onSubmit={createUser} className="card space-y-3 p-4">
          <label className="block text-sm">
            Email
            <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm">
            Display name
            <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>
          <label className="block text-sm">
            Password
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          <label className="block text-sm">
            Role
            <select className="input mt-1" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Create user</button>
        </form>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-[var(--muted)]">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100">
                <td className="p-3">{u.displayName}</td>
                <td className="p-3 text-xs text-[var(--muted)]">{u.email}</td>
                <td className="p-3">
                  <select
                    className="input max-w-[10rem] py-1 text-xs"
                    value={u.role?.id ?? ""}
                    onChange={(e) => changeRole(u, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-xs">{u.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3">
                  <button type="button" className="btn btn-ghost text-xs" onClick={() => toggleActive(u)}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
