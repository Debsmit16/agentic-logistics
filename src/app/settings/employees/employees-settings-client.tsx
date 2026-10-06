"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

const ROLES = [
  "ADMIN",
  "WAREHOUSE_MANAGER",
  "WAREHOUSE_STAFF",
  "DELIVERY_MANAGER",
  "DELIVERY_BOY",
  "ACCOUNTANT",
];

type Employee = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  warehouseId: string | null;
};

export default function EmployeesSettingsClient() {
  const t = useT();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "WAREHOUSE_STAFF",
    password: "",
    warehouseId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState({
    displayName: "",
    role: "WAREHOUSE_STAFF",
    warehouseId: "",
    password: "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [e, w] = await Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/warehouses").then((r) => r.json()),
    ]);
    setEmployees(e.employees ?? []);
    setWarehouses(w.warehouses ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("employeesTitle")}</h1>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...form,
              email: form.email || undefined,
              phone: form.phone || undefined,
              warehouseId: form.warehouseId || undefined,
            }),
          });
          const data = await res.json();
          setMsg(res.ok ? "Employee created" : data.error);
          if (res.ok) load();
        }}
      >
        <input
          placeholder="Display name"
          className="rounded border px-3 py-2"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          required
        />
        <select
          className="rounded border px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          placeholder="Email"
          className="rounded border px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="rounded border px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select
          className="rounded border px-3 py-2 sm:col-span-2"
          value={form.warehouseId}
          onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
        >
          <option value="">Warehouse (optional)</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          type="password"
          placeholder="Password"
          className="rounded border px-3 py-2 sm:col-span-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="rounded bg-teal-700 px-4 py-2 text-white sm:col-span-2">
          Add employee
        </button>
      </form>
      <ul className="space-y-3">
        {employees.map((emp) => (
          <li key={emp.id} className="rounded-lg border bg-white p-3 text-sm">
            {editId === emp.id ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="rounded border px-2 py-1"
                  value={edit.displayName}
                  onChange={(e) => setEdit({ ...edit, displayName: e.target.value })}
                />
                <select
                  className="rounded border px-2 py-1"
                  value={edit.role}
                  onChange={(e) => setEdit({ ...edit, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded border px-2 py-1 sm:col-span-2"
                  value={edit.warehouseId}
                  onChange={(e) => setEdit({ ...edit, warehouseId: e.target.value })}
                >
                  <option value="">No warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <input
                  type="password"
                  placeholder="New password (optional)"
                  className="rounded border px-2 py-1 sm:col-span-2"
                  value={edit.password}
                  onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                />
                <button
                  type="button"
                  className="rounded bg-teal-700 px-3 py-1 text-white"
                  onClick={async () => {
                    const res = await fetch("/api/employees", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: emp.id,
                        displayName: edit.displayName,
                        role: edit.role,
                        warehouseId: edit.warehouseId || null,
                        password: edit.password || undefined,
                      }),
                    });
                    setMsg(res.ok ? "Saved" : "Error");
                    if (res.ok) {
                      setEditId(null);
                      load();
                    }
                  }}
                >
                  Save
                </button>
                <button type="button" className="text-gray-600" onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {emp.displayName} · {emp.role} · {emp.email ?? emp.phone}
                  {!emp.isActive ? " (inactive)" : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-teal-700 underline"
                    onClick={() => {
                      setEditId(emp.id);
                      setEdit({
                        displayName: emp.displayName,
                        role: emp.role,
                        warehouseId: emp.warehouseId ?? "",
                        password: "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    onClick={async () => {
                      const res = await fetch("/api/employees", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: emp.id, isActive: !emp.isActive }),
                      });
                      setMsg(res.ok ? "Updated" : "Error");
                      if (res.ok) load();
                    }}
                  >
                    {emp.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
