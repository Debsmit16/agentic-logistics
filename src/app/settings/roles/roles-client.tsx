"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import { IconPencil, IconPlus, IconRole, IconShield, IconTrash } from "@/components/icons/nav-icons";
import type { ModulePermissionFlags } from "@/lib/permissions/user-module";

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

const MODULE_ORDER = [
  "USERS",
  "SETTINGS",
  "LOGS",
  "PROFILE",
  "PARCELS",
  "WAREHOUSE",
  "DELIVERY",
  "FINANCE",
];

function moduleLabel(module: string) {
  return module.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function accessSummary(role: Role, moduleCount: number) {
  const withRead = role.permissions.filter((p) => p.canRead).length;
  const full = role.permissions.filter(
    (p) => p.canCreate && p.canRead && p.canUpdate && p.canDelete,
  ).length;
  if (role.isSystem) return "Full platform access";
  if (full > 0 && full === withRead) return `${full} modules · full CRUD`;
  return `${withRead} of ${moduleCount} modules`;
}

export function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [draft, setDraft] = useState<Record<string, Perm>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ModulePermissionFlags | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedModules = useMemo(() => {
    const order = new Map(MODULE_ORDER.map((m, i) => [m, i]));
    return [...modules].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
  }, [modules]);

  const load = useCallback(async () => {
    const data = await fetch("/api/roles").then((r) => r.json());
    setRoles(data.roles ?? []);
    setModules(data.modules ?? []);
    setPermissions(data.permissions ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const editingRole = editingId && editingId !== "new" ? roles.find((r) => r.id === editingId) : null;
  const isSystemEditor = editingRole?.isSystem ?? false;
  const readOnlyMatrix = isSystemEditor || !(editingId === "new" ? permissions?.canCreate : permissions?.canUpdate);

  function emptyPerms(): Record<string, Perm> {
    const map: Record<string, Perm> = {};
    for (const m of modules) {
      map[m] = { module: m, canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    }
    return map;
  }

  function openCreate() {
    setEditingId("new");
    setName("");
    setDescription("");
    setDraft(emptyPerms());
    setEditorOpen(true);
  }

  function openEdit(role: Role) {
    setEditingId(role.id);
    setName(role.name);
    setDescription(role.description ?? "");
    const map = emptyPerms();
    for (const p of role.permissions) {
      map[p.module] = { ...p };
    }
    setDraft(map);
    setEditorOpen(true);
  }

  function setRowAll(module: string, enabled: boolean) {
    setDraft((d) => ({
      ...d,
      [module]: {
        module,
        canRead: enabled,
        canCreate: enabled,
        canUpdate: enabled,
        canDelete: enabled,
      },
    }));
  }

  async function save() {
    if (!editingId) return;
    setSaving(true);
    setMsg(null);
    const payload = { name, description, permissions: Object.values(draft) };
    const res =
      editingId === "new"
        ? await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/roles/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Save failed");
      return;
    }
    setMsg(editingId === "new" ? "Role created" : "Role updated");
    setEditorOpen(false);
    setEditingId(null);
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Delete failed");
      return;
    }
    setMsg("Role deleted");
    setDeleteTarget(null);
    load();
  }

  const canCreate = permissions?.canCreate ?? false;
  const canUpdate = permissions?.canUpdate ?? false;
  const canDelete = permissions?.canDelete ?? false;

  return (
    <div>
      <ErpPageHeader
        title="Role Management"
        description="Define roles and control module access — read, write, edit, and delete."
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
              <h2 className="text-base font-semibold text-[var(--text)]">Role Directory</h2>
              <p className="text-sm text-[var(--muted)]">Assign permissions per module and manage who can access what.</p>
            </div>
          </div>
          {canCreate ? (
            <button type="button" className="btn btn-primary btn-pill" onClick={openCreate}>
              <IconPlus />
              Add Role
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Access</th>
                <th>Users</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[var(--muted)]">No roles defined.</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                          <IconRole />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">{role.name}</p>
                          <p className="max-w-xs truncate text-xs text-[var(--muted)]">
                            {role.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-[var(--muted)]">{accessSummary(role, modules.length)}</td>
                    <td>
                      <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium">{role._count.users}</span>
                    </td>
                    <td>
                      {role.isSystem ? <span className="badge-system">System</span> : <span className="badge-custom">Custom</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-neutral-100 hover:text-[var(--primary)]"
                          title="View or edit permissions"
                          onClick={() => openEdit(role)}
                        >
                          <IconPencil />
                        </button>
                        {canDelete && !role.isSystem ? (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                            title="Delete role"
                            disabled={role._count.users > 0}
                            onClick={() => setDeleteTarget(role)}
                          >
                            <IconTrash />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={editorOpen}
        title={editingId === "new" ? "Create role" : isSystemEditor ? "View role" : "Edit role"}
        description={
          isSystemEditor
            ? "System Admin has fixed full access across all modules."
            : "Set the role name and tick permissions for each module."
        }
        onClose={() => !saving && setEditorOpen(false)}
        wide
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Role name
              <input
                className="input mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystemEditor || readOnlyMatrix}
                placeholder="e.g. Warehouse Manager"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <input
                className="input mt-1.5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSystemEditor || readOnlyMatrix}
                placeholder="Short summary for admins"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="border-b border-[var(--border)] bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Module permissions
            </div>
            <div className="max-h-[min(50vh,420px)] overflow-auto">
              <table className="erp-table perm-matrix">
                <thead>
                  <tr>
                    <th className="!text-left">Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a.key}>{a.label}</th>
                    ))}
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedModules.map((m) => {
                    const row = draft[m];
                    const allOn = row?.canRead && row?.canCreate && row?.canUpdate && row?.canDelete;
                    return (
                      <tr key={m}>
                        <td className="!text-left font-medium text-[var(--text)]">{moduleLabel(m)}</td>
                        {ACTIONS.map((a) => (
                          <td key={a.key}>
                            <input
                              type="checkbox"
                              className="perm-check"
                              checked={row?.[a.key] ?? false}
                              disabled={readOnlyMatrix || isSystemEditor}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  [m]: { ...d[m], module: m, [a.key]: e.target.checked },
                                }))
                              }
                            />
                          </td>
                        ))}
                        <td>
                          <input
                            type="checkbox"
                            className="perm-check"
                            checked={allOn}
                            disabled={readOnlyMatrix || isSystemEditor}
                            onChange={(e) => setRowAll(m, e.target.checked)}
                            aria-label={`All permissions for ${moduleLabel(m)}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setEditorOpen(false)} disabled={saving}>
              Close
            </button>
            {!isSystemEditor && (editingId === "new" ? canCreate : canUpdate) ? (
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !name.trim()}>
                {saving ? "Saving…" : editingId === "new" ? "Create role" : "Save changes"}
              </button>
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete role"
        description={
          deleteTarget?._count.users
            ? `“${deleteTarget?.name}” still has ${deleteTarget._count.users} user(s). Reassign them first.`
            : `Remove “${deleteTarget?.name}”? This cannot be undone.`
        }
        onClose={() => !saving && setDeleteTarget(null)}
      >
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={confirmDelete}
            disabled={saving || (deleteTarget?._count.users ?? 0) > 0}
          >
            {saving ? "Deleting…" : "Delete role"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
