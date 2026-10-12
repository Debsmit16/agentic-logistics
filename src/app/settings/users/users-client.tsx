"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [msg, setMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/users").then((r) => r.json());
    if (!data.users) {
      setMsg(data.error ?? "Could not load users");
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
        setMsg("User updated");
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
        setMsg("User created");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Request failed");
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
      setMsg(data.error ?? "Update failed");
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
      setMsg(data.error ?? "Delete failed");
      return;
    }
    setMsg("User deleted");
    setDeleteTarget(null);
    load();
  }

  const canCreate = permissions?.canCreate ?? false;
  const canUpdate = permissions?.canUpdate ?? false;
  const canDelete = permissions?.canDelete ?? false;

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
          {canCreate ? (
            <button type="button" className="btn btn-primary btn-pill" onClick={openCreate}>
              <IconPlus />
              Add User
            </button>
          ) : null}
        </div>

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
                    No users yet.
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
                        <span className="text-xs font-semibold uppercase tracking-wide">{u.role?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <IconBuilding className="shrink-0 opacity-60" />
                        {u.department || u.phone || "—"}
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
                        <span className={u.isActive ? "status-active" : "text-sm text-[var(--muted)]"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {canUpdate ? (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-neutral-100 hover:text-[var(--primary)]"
                            title="Edit user"
                            onClick={() => openEdit(u)}
                          >
                            <IconPencil />
                          </button>
                        ) : null}
                        {canDelete && u.id !== currentUserId ? (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                            title="Delete user"
                            onClick={() => setDeleteTarget(u)}
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
