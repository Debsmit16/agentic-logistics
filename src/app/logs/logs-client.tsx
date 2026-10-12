"use client";

import { useEffect, useState } from "react";

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
    <div className="space-y-4">
      <h1 className="page-title">Audit logs</h1>
      <div className="flex gap-2">
        <input className="input max-w-xs" placeholder="Search action or entity" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn btn-primary" onClick={load}>Search</button>
      </div>
      <p className="text-xs text-[var(--muted)]">{total} events</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-[var(--muted)]">
              <th className="p-3">Time</th>
              <th className="p-3">User</th>
              <th className="p-3">Module</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="p-3 whitespace-nowrap text-xs">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="p-3 text-xs">{row.user?.displayName ?? "—"}</td>
                <td className="p-3 text-xs">{row.module}</td>
                <td className="p-3 font-mono text-xs">{row.action}</td>
                <td className="p-3 font-mono text-xs">{row.entityId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
