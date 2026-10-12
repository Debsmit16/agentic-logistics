"use client";

import { useCallback, useEffect, useState } from "react";

type Perm = {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Perm[];
  _count: { users: number };
};

const ACTIONS = [
  { key: "canRead" as const, label: "Read" },
  { key: "canCreate" as const, label: "Write" },
  { key: "canUpdate" as const, label: "Edit" },
  { key: "canDelete" as const, label: "Delete" },
];

export function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, Perm>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/roles").then((r) => r.json());
    setRoles(data.roles ?? []);
    setModules(data.modules ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function emptyPerms(): Record<string, Perm> {
    const map: Record<string, Perm> = {};
    for (const m of modules) {
      map[m] = { module: m, canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    }
    return map;
  }

  function selectRole(role: Role) {
    setSelectedId(role.id);
    setName(role.name);
    setDescription(role.description ?? "");
    const map = emptyPerms();
    for (const p of role.permissions) {
      map[p.module] = { ...p };
    }
    setDraft(map);
  }

  function startCreate() {
    setSelectedId("new");
    setName("");
    setDescription("");
    setDraft(emptyPerms());
  }

  async function save() {
    const permissions = Object.values(draft);
    const payload = { name, description, permissions };
    const res =
      selectedId === "new"
        ? await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/roles/${selectedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Save failed");
      return;
    }
    setMsg("Saved");
    await load();
    if (selectedId === "new" && data.role?.id) setSelectedId(data.role.id);
  }

  async function remove() {
    if (!selectedId || selectedId === "new") return;
    if (!confirm("Delete this role?")) return;
    const res = await fetch(`/api/roles/${selectedId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Delete failed");
      return;
    }
    setSelectedId(null);
    setMsg("Deleted");
    load();
  }

  const selected = roles.find((r) => r.id === selectedId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Roles</h1>
        <p className="page-lead">Read, write, edit, and delete per module.</p>
      </div>
      {msg ? <p className="text-sm text-[var(--muted)]">{msg}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="card p-3 space-y-2">
          <button type="button" className="btn btn-ghost w-full text-xs" onClick={startCreate}>
            + New role
          </button>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectRole(r)}
              className={`w-full rounded-md px-2 py-2 text-left text-sm ${selectedId === r.id ? "bg-neutral-100 font-medium" : "hover:bg-neutral-50"}`}
            >
              {r.name}
              <span className="block text-xs text-[var(--muted)]">{r._count.users} users</span>
            </button>
          ))}
        </div>

        {selectedId ? (
          <div className="card space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Role name
                <input
                  className="input mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={selected?.isSystem}
                />
              </label>
              <label className="text-sm">
                Description
                <input className="input mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4">Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a.key} className="px-2 py-2">{a.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium">{m.replaceAll("_", " ")}</td>
                      {ACTIONS.map((a) => (
                        <td key={a.key} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={draft[m]?.[a.key] ?? false}
                            disabled={selected?.isSystem}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [m]: { ...d[m], module: m, [a.key]: e.target.checked },
                              }))
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              {!selected?.isSystem ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={save}>Save role</button>
                  {selectedId !== "new" ? (
                    <button type="button" className="btn btn-ghost text-red-600" onClick={remove}>Delete</button>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-[var(--muted)]">System Admin permissions are fixed.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Select a role or create a new one.</p>
        )}
      </div>
    </div>
  );
}
