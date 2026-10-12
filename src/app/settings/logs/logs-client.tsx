"use client";

import { useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { IconShield } from "@/components/icons/nav-icons";

type LogRow = {
  id: string;
  action: string;
  module: string;
  entityId: string | null;
  createdAt: string;
  user: { displayName: string; email: string } | null;
};

export function LogsClient() {
  const [items, setItems] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  async function load() {
    const data = await fetch(`/api/logs?q=${encodeURIComponent(q)}`).then((r) => r.json());
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <ErpPageHeader title="System Logs" description="Audit trail of actions across the application." />

      <div className="data-panel">
        <div className="data-panel-header">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconShield />
            </div>
            <div>
              <h2 className="text-base font-semibold">Activity log</h2>
              <p className="text-sm text-[var(--muted)]">{total} events recorded</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              className="input max-w-xs"
              placeholder="Search action or entity"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={load}>Search</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap text-xs text-[var(--muted)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="text-sm">{row.user?.displayName ?? "—"}</td>
                  <td className="text-xs font-medium uppercase text-[var(--primary)]">{row.module}</td>
                  <td className="font-mono text-xs">{row.action}</td>
                  <td className="font-mono text-xs text-[var(--muted)]">{row.entityId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
