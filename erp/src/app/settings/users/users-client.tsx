"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserFormModal, type UserFormValues } from "@/components/settings/user-form-modal";
import type { ModulePermissionFlags } from "@/lib/permissions/user-module";
import {
  IconBuilding,
  IconPencil,
  IconPlus,
  IconRole,
  IconShield,
  IconTrash,
} from "@/components/icons/nav-icons";

type Role = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  department: string | null;
  isActive: boolean;
  role: Role | null;
};

function shortId(id: string) {
  return id.replace(/-/g, "").slice(-4).toUpperCase();
}

export function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<ModulePermissionFlags | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/users").then((r) => r.json());
    if (!data.users) {
      setMsg({ text: data.error ?? "Could not load users", type: "error" });
      return;
    }
    setUsers(data.users);
    setRoles(data.roles ?? []);
    setPermissions(data.permissions ?? null);
    setCurrentUserId(data.currentUserId ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "ALL" || u.role?.id === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.role?.name && u.role.name.toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [users, roleFilter, searchQuery]);

  function openCreate() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: UserRow) {
    setEditingUser(user);
    setModalOpen(true);
  }

  async function handleSubmit(values: UserFormValues) {
    setSaving(true);
    setMsg(null);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          displayName: values.displayName,
          phone: values.phone || null,
          department: values.department || null,
          roleId: values.roleId,
        };
        if (values.password) payload.password = values.password;
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Update failed");
        setMsg({ text: "User account updated successfully", type: "success" });
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            displayName: values.displayName,
            password: values.password,
            roleId: values.roleId,
            phone: values.phone || null,
            department: values.department || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Create failed");
        setMsg({ text: "New user account created successfully", type: "success" });
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Request failed", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: UserRow) {
    if (!permissions?.canUpdate) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ text: data.error ?? "Update failed", type: "error" });
      return;
    }
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget || !permissions?.canDelete) return;
    setSaving(true);
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg({ text: data.error ?? "Delete failed", type: "error" });
      return;
    }
    setMsg({ text: `Account for ${deleteTarget.displayName} was removed`, type: "success" });
    setDeleteTarget(null);
    load();
  }

  const canCreate = permissions?.canCreate ?? false;
  const canUpdate = permissions?.canUpdate ?? false;
  const canDelete = permissions?.canDelete ?? false;

  return (
    <div className="space-y-6">
      <ErpPageHeader
        title="User Management"
        description="Manage system users, access credentials, organizational assignments, and activation status."
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

      {/* Main Data Panel */}
      <div className="data-panel">
        <div className="data-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconShield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text)]">User Directory</h2>
                <span className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                  {users.length} {users.length === 1 ? "account" : "accounts"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">Enterprise identities with role-based privileges</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canCreate && (
              <button type="button" className="btn btn-primary btn-pill" onClick={openCreate}>
                <IconPlus className="h-4 w-4" />
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)]/30 px-5 py-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[260px] max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, department…"
              className="input h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--muted)] whitespace-nowrap">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input h-9 w-auto text-xs py-1"
            >
              <option value="ALL">All Roles ({users.length})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role Assignment</th>
                <th>Organization</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--muted)]">
                    {users.length === 0
                      ? "No user accounts registered yet."
                      : "No user accounts match the current filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.displayName} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text)]">{u.displayName}</p>
                          <p className="text-xs text-[var(--muted)]">{u.email}</p>
                          <span className="id-badge mt-0.5">ID: {shortId(u.id)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]/70 px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
                        <IconRole className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                        <span>{u.role?.name ?? "No Role"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <IconBuilding className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <span>{u.department || u.phone || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <ToggleSwitch
                          checked={u.isActive}
                          disabled={!canUpdate}
                          onChange={() => toggleActive(u)}
                          label={`${u.displayName} active`}
                        />
                        <span className={`text-xs font-semibold ${u.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--muted)]"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--primary)]"
                            title="Edit user"
                            onClick={() => openEdit(u)}
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && u.id !== currentUserId && (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete user"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        )}
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
        open={modalOpen}
        title={editingUser ? "Edit user" : "Add user"}
        description={editingUser ? "Update profile, role, or password." : "Create a new account with role assignment."}
        onClose={() => !saving && setModalOpen(false)}
        wide
      >
        <UserFormModal
          open={modalOpen}
          user={editingUser}
          roles={roles}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete user"
        description={`Remove ${deleteTarget?.displayName}? This cannot be undone.`}
        onClose={() => !saving && setDeleteTarget(null)}
      >
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete} disabled={saving}>
            {saving ? "Deleting…" : "Delete user"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
