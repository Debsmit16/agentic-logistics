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

  function grantAll() {
    const map: Record<string, Perm> = {};
    for (const m of modules) {
      map[m] = { module: m, canCreate: true, canRead: true, canUpdate: true, canDelete: true };
    }
    setDraft(map);
  }

  function revokeAll() {
    setDraft(emptyPerms());
  }

  return (
    <div className="space-y-6">
      <ErpPageHeader
        title="Role Management"
        description="Define roles and control granular access policies — read, create, update, and delete."
      />

      {msg && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/80 px-4 py-3 text-xs font-medium text-[var(--text)]">
          <span>{msg}</span>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-[11px] font-bold opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="data-panel">
        <div className="data-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconShield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text)]">Role Directory</h2>
                <span className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                  {roles.length} {roles.length === 1 ? "role" : "roles"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">Assign module permissions and govern system access.</p>
            </div>
          </div>
          {canCreate ? (
            <button type="button" className="btn btn-primary btn-pill" onClick={openCreate}>
              <IconPlus className="h-4 w-4" />
              Add Role
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Role Identity</th>
                <th>Privileges Coverage</th>
                <th>Assigned Users</th>
                <th>Type</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--muted)]">No roles defined.</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                          <IconRole className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">{role.name}</p>
                          <p className="max-w-xs truncate text-xs text-[var(--muted)]">
                            {role.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-[var(--muted)] font-medium">{accessSummary(role, modules.length)}</td>
                    <td>
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
                        {role._count.users} {role._count.users === 1 ? "user" : "users"}
                      </span>
                    </td>
                    <td>
                      {role.isSystem ? <span className="badge-system">System</span> : <span className="badge-custom">Custom</span>}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--primary)]"
                          title="View or edit permissions"
                          onClick={() => openEdit(role)}
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        {canDelete && !role.isSystem ? (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete role"
                            disabled={role._count.users > 0}
                            onClick={() => setDeleteTarget(role)}
                          >
                            <IconTrash className="h-4 w-4" />
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
            ? "System Admin has fixed full access across all platform modules."
            : "Define role title and configure granular permissions across each module."
        }
        onClose={() => !saving && setEditorOpen(false)}
        wide
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Role name
              <input
                className="input mt-1.5 font-normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystemEditor || readOnlyMatrix}
                placeholder="e.g. Warehouse Hub Lead"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Description
              <input
                className="input mt-1.5 font-normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSystemEditor || readOnlyMatrix}
                placeholder="Operational purpose & scope"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-raised)]/70 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Module permissions matrix
              </span>
              {!readOnlyMatrix && !isSystemEditor && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={grantAll}
                    className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[var(--border)]">|</span>
                  <button
                    type="button"
                    onClick={revokeAll}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    Clear All
                  </button>
                </div>
              )}
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
